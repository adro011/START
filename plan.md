# PLAN.md v2: Premium Fashion E-commerce (Men / Women / Kids), Bangladesh

> ROLE: You are an autonomous team in one: Architect, Designer, Full-stack Engineer, QA, DevOps.
> Read this entire file, then build the whole project end to end with NO questions to the user.
> Unknown detail = choose the best option, log it in `DECISIONS.md` (one line: decision, why), continue.
> Work phase by phase (section 12). Commit after every phase. Do not move on until the phase's
> "Done when" checks pass. Be token-efficient: never reprint whole files in chat, just edit them.
> Verify current free-tier limits and library APIs at build time (web search / context7 MCP) instead of trusting memory.

## 0. Hard constraints
- 100% free tools, except the custom domain. If something needs paid, use the free alternative and note it.
- Brand name placeholder `BRAND_NAME` lives only in `src/config/site.ts` (name, tagline, socials, WhatsApp number, support email, currency, shipping zones).
- Currency BDT (৳), integer **paisa** everywhere in DB and logic. Locale `en-BD`, plus Bangla UI (`bn`).
- Top-level sections: **Men, Women, Kids**. "New Arrivals" and "Sale" are product flags / collections, not categories.
- **Max 5 images per product**, enforced in DB (trigger), API (zod) and UI (uploader).
- Stack home: Next.js on Vercel, Supabase (DB/Auth/Storage), GitHub (repo + CI).

## 1. Pre-flight (do first, stop and tell the user the exact fix if anything fails)
`node -v` (>=20) · `pnpm -v` · `git --version` · `gh auth status` · `vercel whoami` · `npx supabase --version` · `pnpm exec playwright --version` (install browsers with `pnpm exec playwright install chromium`).
Create `.env.example` listing every variable with a comment. Create `README.md` skeleton and `DECISIONS.md`.

## 2. Agent skills: create these first in `.opencode/skills/<name>/SKILL.md`
(frontmatter `name`, `description`; each under ~70 lines; follow them for the entire build; update them if you learn better rules)
1. `nextjs-app-router`: RSC by default, Suspense streaming, server actions with zod, `generateMetadata`, route-level caching/ISR (`revalidateTag` on product edits), `next/image` sizes, error/loading/not-found boundaries.
2. `supabase-rls`: schema + migrations only via `supabase/migrations`, RLS on every table, SECURITY DEFINER RPCs with `set search_path = ''`, storage policies, never ship service-role key to client, generated types (`supabase gen types`).
3. `motion-ux`: motion budget, Lenis rules, ease curves, reduced-motion, mobile fallbacks, "animate only transform/opacity", shared-element transitions.
4. `ecommerce-rules`: server-side price recalculation, stock reservation in a transaction, idempotent webhooks, order state machine, coupon rules, rounding.
5. `fashion-ui`: tokens, type scale, mega-menu, product card, gallery, size-guide, sticky ATC bar, empty/loading/error states, microcopy tone (warm, concise, confident).
6. `seo-a11y-perf`: JSON-LD (Product, BreadcrumbList, Organization), sitemap/robots, hreflang en/bn, dynamic OG images (`next/og`), axe checks, CWV budgets (section 9).
7. `bd-commerce`: BD districts/areas shipping zones, +880 phone validation (`01[3-9]\d{8}`), COD risk rules (OTP/phone confirm for high value), SSLCommerz flow (init, IPN, validate), courier adapter interface (Steadfast/Pathao/RedX as optional adapters behind flags).
8. `qa-release`: test pyramid, Playwright purchase flow, RLS tests, Lighthouse CI, pre-deploy checklist.

Free MCP servers to use when configured (skip gracefully otherwise): `context7` (fresh docs), Supabase MCP (needs user's access token), Playwright MCP (browser verification), GitHub MCP/`gh` CLI.

## 3. Tech stack (all free tiers)
| Area | Choice |
|---|---|
| App | Next.js (latest stable) App Router, TypeScript strict, React Compiler if stable |
| Styling | Tailwind CSS v4, shadcn/ui, `class-variance-authority`, `tailwind-merge` |
| Motion | `motion` (Framer Motion), `lenis`, `gsap` + ScrollTrigger only for hero/horizontal rail |
| State/Data | Zustand (cart, persist), TanStack Query only where client fetching is needed, Supabase JS (`@supabase/ssr`) |
| Forms | react-hook-form + zod |
| Auth | Supabase Auth: email magic link + Google + phone-less. Guest checkout allowed |
| Storage | Supabase Storage bucket `product-images` (3 pre-generated variants, see 6) |
| Search | Postgres full-text + `pg_trgm` fuzzy (typo-tolerant) with RPC `search_products` |
| Email | Resend free tier (order confirmation, status updates); fall back to Supabase SMTP if unavailable |
| Rate limit / cache | Upstash Redis free (`@upstash/ratelimit`) with in-memory fallback in dev |
| Bot protection | Cloudflare Turnstile (free) on checkout, signup, contact + honeypot field |
| Payments | **COD default** + SSLCommerz (bKash/Nagad/cards) behind `PAYMENT_SSLCOMMERZ_ENABLED`, sandbox in dev. No Stripe (unavailable in BD) |
| Analytics | Vercel Web Analytics + Cloudflare Web Analytics (cookie-less), optional Meta Pixel behind consent flag |
| Errors | Sentry free (optional flag) |
| Tests | Vitest, Testing Library, Playwright, `@axe-core/playwright`, Lighthouse CI |
| CI/CD | GitHub Actions: lint, typecheck, unit, e2e, Lighthouse, weekly DB backup, keep-alive ping |
| PDFs | `@react-pdf/renderer` for invoice and packing slip |
| Charts | Recharts (admin dashboard) |

## 4. Design system: "Editorial Heritage"
Feel: a modern Bangladeshi heritage label: warm, tactile, editorial, quietly luxurious. Not a generic template.

**Palette (coolors f2ccc3-d5573b-7e9181-172121-7d451b)** as CSS variables + Tailwind tokens, light and dark:
| Token | Hex | Use |
|---|---|---|
| `--blush` | #F2CCC3 | soft surfaces, hover tints, highlight bands |
| `--terracotta` | #D5573B | primary CTA, sale badge, links on hover, focus ring |
| `--sage` | #7E9181 | secondary buttons, tags, in-stock, borders |
| `--ink` | #172121 | text, dark sections, header-on-scroll, dark mode background |
| `--umber` | #7D451B | price emphasis, serif accents, underline details |
| `--paper` | #FBF6F3 | page background (derived) |
Generate tints/shades (50-900) from each; verify WCAG AA for every text/background pair and document failing pairs with a fix. Terracotta on paper for large text only unless contrast passes.

**Typography**: display serif (Cormorant Garamond or Playfair Display) for headings, hero and prices-accent; UI sans (Jost or Poppins) for body. Bangla: Hind Siliguri / Noto Serif Bengali. Use `next/font` (self-hosted), fluid type scale with `clamp()`, tight tracking on headings, uppercase micro-labels with letter-spacing.

**Texture & detail**: subtle paper-grain overlay (SVG noise, 3% opacity, pointer-events none), thin hairline dividers, small caps labels, rounded-none or very small radius on imagery for an editorial look, generous whitespace, 12-col grid, 1280 max content width with full-bleed hero/bands.

**Information architecture (Aarong-inspired)**: announcement bar (rotating, marquee on mobile) → header (logo center/left, search, account, wishlist, cart count) → main nav `Men | Women | Kids | New Arrivals | Sale | Stories`. Hover/focus opens a **full-width mega menu**: 4 columns (bold group headings, light child links, "view all" link), right column featured image + editorial blurb. Sticky header that condenses on scroll and gains `--ink` background. Mobile: bottom tab bar (Home, Shop, Search, Wishlist, Cart) + slide-in accordion drawer. Footer: newsletter, help links, payment badges, socials, language switch.

## 5. Motion language (Mbrella-inspired, buttery smooth)
Principles: calm, confident, never janky. Ease `cubic-bezier(0.22,1,0.36,1)`, durations 200-700ms, stagger 0.05-0.08s, animate only `transform`/`opacity`/`clip-path`. Respect `prefers-reduced-motion` (swap to fades). Disable heavy effects on low-power / touch where noted. Keep 60fps: profile with Chrome Performance and fix long frames.
- **Smooth scroll**: Lenis site-wide, synced with GSAP ticker; anchor links and route changes reset scroll cleanly; off for reduced-motion.
- **Preloader (first visit only, <1.2s)**: brand wordmark reveal with clip-path, then curtain lift. Skippable, never blocks LCP content (render hero underneath).
- **Hero (3 panels: Men / Women / Kids)**: full-bleed backgrounds from `/public/hero/{men,women,kids}.jpg`. Desktop: panels share width; hovering one expands it (flex-grow), image scales 1.06→1, others dim to 70%; headline split-text line reveal; "Shop Men →" CTA with arrow slide. Subtle mouse-parallax (max 12px). Mobile: vertical snap sections or swipe carousel with progress bar, auto-advance paused on touch. Fallback: palette gradients if images are missing.
- **Scroll storytelling**: pinned "Shop by Occasion" horizontal rail (GSAP ScrollTrigger) on desktop, native scroll-snap on mobile; image parallax inside masked frames; number counters; marquee strip ("Handcrafted · Made in Bangladesh · Free exchange").
- **Product card**: hover lifts 4px, swaps to image #2 with cross-fade, quick-add size pills slide up, wishlist heart pop (spring). Skeleton shimmer while loading.
- **Page transitions**: View Transitions API where supported (shared-element morph card image → product gallery), Framer Motion fade/slide fallback.
- **Mega menu**: open <=220ms with clip-path + opacity, 120ms close delay (no flicker), column links stagger in.
- **Cart drawer**: spring slide-over, line items animate in/out, "add to cart" button morphs to a check, free-shipping progress bar animates.
- **Micro-interactions**: magnetic primary buttons (desktop only, 8px pull), custom soft cursor ring on desktop product imagery ("Zoom"), animated underline links, toast with progress.
- **Loading/errors**: blur-up placeholders (`blurDataURL`), route `loading.tsx` skeletons, branded 404/500 pages with animation.
Acceptance: no layout shift from animation (CLS < 0.05), INP < 200ms, no animation on the critical LCP element's first paint.

## 6. Data model (Supabase / Postgres), migrations in `supabase/migrations`
Money = integer paisa. Use `uuid` PKs (`gen_random_uuid()`), `created_at/updated_at` with trigger, soft delete (`deleted_at`) on products. Add indexes on foreign keys, `slug`, `(section, category_id, active)`, GIN on search vector, trigram on `name`.
```
categories(id, parent_id, slug unique, name, name_bn, section check('men','women','kids'), sort, image_path)
products(id, slug unique, name, name_bn, description, description_bn, section, category_id,
         price_paisa, compare_at_paisa, fabric, care, fit_notes, is_new, is_sale, is_featured, active,
         search tsvector generated, deleted_at)
product_variants(id, product_id, sku unique, size, color, color_hex, stock int check(>=0), price_override_paisa null)
product_images(id, product_id, position check(1..5), path_thumb, path_medium, path_large, alt, blur_data_url,
               unique(product_id, position))   -- trigger rejects a 6th image
profiles(id→auth.users, full_name, phone, role check('customer','staff','admin') default 'customer', locale)
addresses(id, user_id, name, phone, division, district, area, line1, notes, is_default)
orders(id, order_no (human, sequence-based e.g. BR-100231), user_id null, guest_email null, guest_phone,
       status check('pending','confirmed','packed','shipped','delivered','cancelled','returned'),
       payment_method('cod','sslcommerz'), payment_status('unpaid','paid','failed','refunded'),
       subtotal_paisa, discount_paisa, shipping_paisa, total_paisa, coupon_code, address jsonb,
       courier, tracking_no, created_at)
order_items(id, order_id, variant_id, name_snapshot, size, color, qty, unit_price_paisa, image_snapshot)
order_events(id, order_id, status, note, actor, created_at)          -- timeline / audit
coupons(code unique, type('percent','fixed','free_shipping'), value, min_subtotal_paisa, starts_at, ends_at, usage_limit, used_count, active)
wishlist(user_id, product_id) · reviews(id, product_id, user_id, rating 1-5, title, body, photos text[] max 3, approved bool)
stock_alerts(id, variant_id, email, created_at)                      -- back-in-stock waitlist
shipping_zones(id, name, districts text[], fee_paisa, free_over_paisa, eta_days)
audit_log(id, actor, action, entity, entity_id, diff jsonb, created_at)
site_settings(key, value jsonb)                                      -- banners, announcement texts, hero copy
```
**RLS**: public SELECT only on active, non-deleted products/variants/images/categories/approved reviews/shipping zones/settings. Customers: own profile, addresses, wishlist, orders (read), reviews (insert own). `staff`: read orders, update status, manage stock. `admin`: everything + settings + coupons. Never let a client set `role`. Admin check via `public.is_admin()` SECURITY DEFINER function.
**RPCs (SECURITY DEFINER)**: `create_order(cart jsonb, address jsonb, coupon text, payment text)` recalculates all prices from DB, validates stock, applies coupon, picks shipping zone, decrements stock in ONE transaction, writes order + items + event; `search_products(q, section, filters...)`; `adjust_stock`; `cancel_order` (restores stock).
**Storage**: bucket `product-images` public read, write only `staff/admin`. On upload the browser generates **3 WebP variants** (thumb 400px, medium 900px, large 1600px, quality ~78) with `browser-image-compression`/canvas plus a tiny blur data URL, so no paid image transforms are needed and the 1 GB free storage lasts.
**Seed the full category tree**:
- **Men**: Panjabi (Cotton & Blends, Addi, Endi, Silk, Muslin & Jamdani, Taaga Man Panjabis), Panjabi Pajama Sets (Cotton & Blends, Silk), Pajama, Coaty, Short Kurta, Jackets, Trousers (Chinos, Denim, Lounge Wear), Shirts (Ethnic, Casual, Executive), Fatua (Cotton & Blends, Endi, Silk), Lungi, Shawls, Scarves & Mufflers, T-Shirts, Polos, Sleeping Suits, Shoes (Sandals, Shoes, Nagras), Accessories (Belts, Wallets, Card Holders, Key Rings, Bags, Attar), Tupi
- **Women**: Jacket, Gown, Ladies Cap, Skirt, Ladies Polo, Tunic (Long Tunic, Short Tunic), 3 Pcs & 2 Pcs (Cord-Set, 3 Pcs Set, 2 Pcs), Tops & Shirt (T-shirt, Bangladesh Polo, Tops), Sharee, Blazer
- **Kids**: Boys (Kabli, Boy's Denim, Boy's Cord Set, Shirt, Polo Shirt, Panjabi, Tank Top, T-Shirt), Girls (3 Pcs, 2 Pcs, Jumpsuit, T-Shirts, Tops)
Seed 8 demo products per section with realistic names, BDT prices, sizes, colors, fabric notes, and local placeholder images (generated gradients/SVG). SKU prefix `DEMO-` so a single SQL line removes them. Seed default shipping zones (Dhaka city / Outside Dhaka, fees configurable in `site_settings`), 2 sample coupons, announcement texts.

## 7. Storefront features
- **Home**: preloader, 3-panel hero, new arrivals rail, shop-by-category tiles, occasion rail (Eid, Wedding, Everyday, Winter), sale band, craft/brand story with parallax, testimonials, Instagram-style grid, newsletter, trust row (COD, exchange, support).
- **Listing** `/men`, `/women`, `/kids`, `/men/panjabi/silk`: breadcrumb, subcategory chips, URL-driven filters (price slider, size, color, fabric, new/sale/in-stock), sort, grid density toggle, infinite scroll with "Load more" fallback, filter drawer on mobile, result count, empty state with suggestions.
- **Product page**: gallery with up to 5 images (thumb rail, hover zoom, pinch/swipe on mobile, fullscreen lightbox), variant picker with live stock ("Only 3 left"), size guide modal (per section), delivery estimate by district, accordion (details, fabric & care, returns), reviews with photos, "Complete the look" + related, recently viewed, **sticky add-to-cart bar on mobile**, back-in-stock email signup, share + WhatsApp "Order via WhatsApp" button (prefilled message with product link).
- **Search**: command-palette style (Ctrl/Cmd+K), debounced, typo-tolerant, recent searches, category suggestions.
- **Cart & checkout**: drawer cart, free-shipping progress, coupon field, one-page checkout (guest or account), BD address form (division → district → area), phone validation, Turnstile, COD or SSLCommerz, order summary, confirmation page + email, **order tracking page** `/track` (order no + phone), account area (orders with timeline, addresses, wishlist, profile).
- **PWA**: web manifest, icons, offline fallback page, installable.
- **i18n**: English + বাংলা (`next-intl`), language switch in header, localized product fields via `*_bn` columns, localized numerals option.
- **Static/legal**: About, Our Craft, Contact (form → email), Shipping & Returns, Size Guides, Privacy, Terms, FAQ (JSON-LD FAQ). Use sensible BD-oriented templates and add a note that they are templates, not legal advice.

## 8. Admin `/admin` (server-protected, role-based, mobile friendly)
- Dashboard: today's orders/revenue, low-stock list, pending orders, 30-day sales chart, top products.
- Products: table with search/filter, create/edit form (grouped fields, progressive), variant matrix editor (sizes × colors with stock), **drag-to-reorder multi-image uploader (max 5, compress + preview + required alt text, 3 variants + blur)**, duplicate product, bulk CSV import/export, soft delete, publish toggle, SEO fields.
- Categories & collections, homepage banners/hero copy/announcements via `site_settings`, coupons, shipping zones.
- Orders: filters, status workflow with events, assign courier + tracking number, **print invoice and packing slip (PDF)**, cancel with stock restore, CSV export.
- Staff role (orders/stock only), audit log view.
- First admin: document the single SQL line to promote a user.

## 9. Quality budgets (must pass before deploy)
- Lighthouse mobile ≥ 90 (Performance, Accessibility, Best Practices, SEO). LCP < 2.5s, CLS < 0.05, INP < 200ms, initial JS < 170 KB gz on home. Verify in CI with Lighthouse CI; fix regressions.
- Axe: zero critical/serious violations on home, listing, product, cart, checkout.
- Security headers: strict CSP (nonce), HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`; Supabase RLS tests prove customers cannot read others' orders or write products.
- Keyboard-complete: mega menu, drawer, gallery, filters, checkout. Visible focus ring in `--terracotta`.
- Image rules: `next/image` with correct `sizes`, priority only on LCP image, AVIF/WebP, no hotlinking.

## 10. Security & reliability rules
Never trust client prices/totals. Service-role key server-only. Validate everything with zod on the server. Rate limit login, checkout, contact, search. Idempotent SSLCommerz IPN (verify with validation API, check amount and order). Order state machine rejects illegal transitions. Secrets only in env; `.env.example` committed, `.env*` ignored. Log errors without PII. Weekly `pg_dump` backup via GitHub Actions saved as a private artifact (free Supabase has no point-in-time recovery). Keep-alive ping every 5 days so the free project is not paused.

## 11. SEO & growth
Per-page metadata, canonical, hreflang en/bn, JSON-LD (Product with offers/availability/aggregateRating, BreadcrumbList, Organization, FAQ), dynamic `sitemap.xml` (products, categories), `robots.txt`, `next/og` dynamic social images, clean slugs, internal linking via breadcrumbs and related items, Google Merchant-ready product feed route `/feed.xml` (free), WhatsApp share, Open Graph for Facebook (important in BD).

## 12. Build phases (each: implement → self-review → run checks → commit). "Done when" is mandatory.
1. **Foundation**: scaffold, tooling, tokens, fonts, layout shell, i18n, skills, CI skeleton. *Done when*: `pnpm build` + lint + typecheck pass.
2. **Database**: migrations, RLS, RPCs, storage policies, seed, generated types. *Done when*: RLS tests pass; seed visible on a local `/api/health`.
3. **Navigation**: header, mega menu, mobile drawer + bottom bar, footer, search palette shell. *Done when*: keyboard + mobile verified in Playwright screenshots.
4. **Home & motion**: preloader, 3-panel hero, rails, marquee, scroll effects. *Done when*: reduced-motion works, CLS < 0.05.
5. **Listing & search**: filters, sorting, infinite scroll, fuzzy search. *Done when*: filter state survives reload/share.
6. **Product page**: gallery (5 images), variants, size guide, reviews, sticky ATC. *Done when*: 6th image impossible in UI and DB.
7. **Cart & checkout**: cart store, coupon, BD address, COD order via RPC, emails, tracking, auth, account. *Done when*: Playwright purchase flow green and stock decremented once.
8. **Admin**: dashboard, product CRUD + uploader, orders, invoices, coupons, settings. *Done when*: non-admin is blocked server-side.
9. **SSLCommerz** behind flag (sandbox) + courier adapter interface. *Done when*: sandbox payment marks order paid via IPN.
10. **PWA, SEO, a11y, perf pass**: fix to budgets in section 9.
11. **Tests, docs, CI**: Vitest, Playwright, axe, Lighthouse CI, backup + keep-alive workflows, README.
12. **Deploy**: `gh repo create`, `vercel link`, `vercel env add`, `vercel --prod`, `supabase link` + `db push`. Verify production with Playwright smoke test. Print domain steps (section 13).

## 13. Domain & go-live checklist (print for the user)
1. Supabase: create project, copy URL/anon key/service key into `.env.local` and Vercel envs (Production + Preview). Add production URL to Auth redirect URLs. Create `product-images` bucket via migration.
2. `npx supabase login` → `npx supabase link --project-ref <ref>` → `npx supabase db push` → seed.
3. Vercel: `vercel link`, add env vars, `vercel --prod`. Add domain in Project Settings → Domains; set the DNS records Vercel shows (typically A `76.76.21.21` for apex and CNAME `cname.vercel-dns.com` for `www`; use Vercel's displayed values if different). Optional: put DNS on Cloudflare (free) and use Cloudflare Email Routing for `hello@yourdomain`.
4. Resend: verify the domain (SPF/DKIM records) so order emails don't land in spam.
5. SSLCommerz: apply for a live merchant account; keep sandbox until approved.
6. Create first admin: sign up, then run `update profiles set role='admin' where id = '<user-id>';`.
7. Replace demo content: 3 hero photos in `public/hero/`, logo, real products; run the `DEMO-` cleanup SQL.

## 14. Free-tier cautions (write into README)
- Vercel Hobby is for non-commercial use. A live store selling products may require Vercel Pro. Keep code portable (no Vercel-only APIs beyond analytics/env) so it can move to Cloudflare Pages/Workers (free, commercial use allowed).
- Supabase free: ~500 MB database, ~1 GB storage, pauses after inactivity; compress images (already planned). Resend free: limited emails/day: queue and batch low-priority emails.

## 15. Final report (print at the end)
Live URL, repo URL, admin steps, env var table, what is demo data, what the user must supply, Lighthouse + axe results, known limitations, and a prioritized "next steps" list (Meta/Google Merchant feeds, abandoned-cart email, loyalty points, size recommendation, gift cards, B2B wholesale).
