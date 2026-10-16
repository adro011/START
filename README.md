# Meraki — Premium Bangladeshi Fashion (Men / Women / Kids)

Fashion e-commerce storefront + admin for the brand **Meraki** (Dhaka, Bangladesh).
Sections: **Men, Women, Kids** ("New Arrivals" and "Sale" are product flags, not categories).
Currency is **BDT (৳) as integer paisa** in the DB, logic, and demo catalog. Payments: **COD by default + SSLCommerz** (bKash/Nagad/cards) behind a feature flag. Locales: `en` + `bn` (`en-BD` conventions, Bangla fields via `*_bn` columns).

> Templates, not advice: the legal/static pages (Shipping & Returns, Privacy, Terms, Size Guides) are sensible BD-oriented templates, not legal advice.

## Stack

| Area | Choice | Status in repo |
|---|---|---|
| App | Next.js 15.5 App Router, React 19, TypeScript strict | installed (`next`, `react`, `typescript`) |
| Styling | Tailwind CSS v4, `clsx` + `tailwind-merge` | installed |
| DB / Auth / Storage | Supabase (Postgres + Auth + Storage) via `@supabase/ssr` | installed; migrations in `supabase/migrations` |
| Brand config | `BRAND_NAME` lives only in `src/config/site.ts` | factual — import `SITE`, never hardcode |
| Cart / wishlist | Zustand (persisted) | installed (`src/store/cart.ts`, `src/store/wishlist.ts`) |
| Validation | `zod` (server actions, checkout) | installed |
| Server-only code | `server-only` | installed |
| Motion | CSS-only (transform/opacity); no motion library installed | factual — `motion`/`lenis`/`gsap` are NOT in `package.json` |
| Bot protection | Cloudflare Turnstile + honeypot field (checkout schema) | env-gated, not yet wired to verification API |
| Email | Resend (order emails) | env key only, optional |
| Rate limit / cache | Upstash Redis with in-memory fallback in dev | env keys only, optional |
| Tests | Vitest, Playwright, `@axe-core/playwright`, Lighthouse CI | installed / configured |
| CI/CD | GitHub Actions: lint → typecheck → unit → e2e → Lighthouse; weekly DB backup; keep-alive ping | `.github/workflows/` |
| PWA | `public/sw.js` + `src/app/manifest.ts` + `/offline` route | SW file exists but is **not registered** (no registration code in `src`) |

## Quickstart

Prerequisites: Node >= 20, npm (repo uses npm, not pnpm — see `DECISIONS.md`).

```bash
npm install
copy .env.example .env.local   # Windows PowerShell (or: cp .env.example .env.local)
# fill in Supabase URL / anon key / service-role key in .env.local
npm run dev                    # http://localhost:3000
```

Production serve:

```bash
npm run build
npm run start
```

> Without Supabase env vars the storefront runs on the local TypeScript demo catalog
> (`src/lib/catalog.ts`) and `/admin` uses a dev fallback session (see Admin guide).
> With Supabase env vars, auth/roles come from Supabase Auth + `profiles`.

## Scripts

| Script | Runs |
| ------ | ---- |
| `npm run dev` | Next.js dev server |
| `npm run build` / `npm run start` | Production build / serve |
| `npm run lint` | `eslint .` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | `vitest run` (all of `tests/unit`) |
| `npm run test:e2e` | `playwright test` (chromium, `tests/e2e`) |

Lighthouse CI is separate (no npm script): `npm run build`, then `npx @lhci/cli autorun`
(config: `lighthouserc.json`, asserts ≥ 0.90 on all four categories, LCP ≤ 2500 ms, CLS ≤ 0.05).

## Project structure

```
src/
  app/                    # App Router routes
    [section]/            # /men, /women, /kids, /new-arrivals, /sale (+ subcategories)
    product/[slug]/       # product page (gallery ≤5 images, variants, reviews, sticky ATC)
    cart/ checkout/ order-success/ track/   # cart drawer page, 1-page checkout, BR- success, order tracking
    search/               # search page (palette component: src/components/search-palette.tsx)
    account/ login/       # orders timeline, addresses, wishlist, profile; login
    admin/                # layout.tsx (server gate) + page (dashboard), products/, orders/,
                          # coupons/, categories/, settings/
    api/                  # health, products, contact, newsletter, waitlist, webhooks/sslcommerz
    feed.xml/ sitemap.ts robots.ts opengraph-image.tsx manifest.ts
    offline/              # PWA offline fallback page
    about/ craft/ stories/ contact/ faq/ shipping-returns/ size-guides/ privacy/ terms/
  actions/checkout.ts     # placeOrder server action (zod, BD phone ^01[3-9]\d{8}, coupon, shipping)
  components/             # 19 files: site-header, mega-menu, mobile-nav, announcement-bar,
                          # search-palette, product-card, gallery, filters, sort-select,
                          # cart-drawer, sticky-atc, size-guide, reviews, recently-viewed,
                          # back-in-stock, whatsapp-order, site-footer, legal-layout, providers
  config/site.ts          # BRAND_NAME="Meraki", tagline, socials, placeholder phone/email,
                          # DISTRICTS (10), FREE_SHIP_THRESHOLD_PAISA = 250_000 (৳2,500)
  lib/                    # catalog.ts (24 demo products), coupons.ts, format.ts, auth.ts,
                          # admin-data.ts, dictionary.ts, supabase/
  store/                  # cart.ts, wishlist.ts (Zustand)
  locales/ middleware.ts types/
supabase/migrations/
  0001_schema.sql         # 16 tables, order_no_seq (BR-100231…), updated_at triggers,
                          # reject_sixth_image trigger (max 5 images), indexes
  0002_rls.sql            # is_admin() / is_staff_or_admin(), RLS policies on every table,
                          # storage bucket product-images (public read, staff/admin write)
  0003_rpcs.sql            # create_order / search_products / adjust_stock / cancel_order
  0004_seed.sql             # category tree, zones, coupons, 24 demo products, site_settings
tests/
  unit/                   # money.test.ts, cart.test.ts, validators.test.ts (36 tests total)
  e2e/                    # purchase.spec.ts (COD flow), a11y.spec.ts (/, /men, /cart)
  rls/                    # RLS test assets
public/
  hero/                   # men.svg, women.svg, kids.svg (SVG placeholders — plan calls for
                          # /public/hero/{men,women,kids}.jpg photos; not yet replaced)
  logo.svg icons/ sw.js   # sw.js exists but nothing registers it yet
.github/workflows/       # ci.yml (lint/typecheck/unit → e2e → lighthouse), backup.yml, keepalive.yml
```

## Data model summary (Supabase)

Money = integer paisa. `uuid` PKs, `created_at/updated_at` triggers, soft delete (`deleted_at`) on products, max 5 images/product enforced by DB trigger + unique `(product_id, position)`.

| Table | Purpose |
|---|---|
| `categories` | tree (parent_id), `section` ∈ men/women/kids, `slug` unique, Bangla `name_bn` |
| `products` | slug, names/descriptions (+`_bn`), section, category, `price_paisa`, `compare_at_paisa`, fabric/care/fit, `is_new/is_sale/is_featured/active`, generated `search` tsvector, `deleted_at` |
| `product_variants` | sku unique, size/color/color_hex, `stock >= 0`, optional `price_override_paisa` |
| `product_images` | position 1–5, thumb/medium/large paths, alt, blur_data_url |
| `profiles` | id → auth.users, `role` ∈ customer/staff/admin (default customer), locale |
| `addresses` | BD address (division → district → area, line1, phone, default flag) |
| `orders` | `order_no` human (BR-100231… via sequence), status machine (pending→confirmed→packed→shipped→delivered, +cancelled/returned), `payment_method` cod/sslcommerz, `payment_status`, paisa totals, coupon_code, address jsonb, courier/tracking |
| `order_items` / `order_events` | snapshots per line; status timeline/audit |
| `coupons` | percent / fixed / free_shipping, min subtotal, window, usage limit/count |
| `wishlist` / `reviews` (1–5, ≤3 photos, approved flag) / `stock_alerts` | engagement |
| `shipping_zones` | name, districts[], fee_paisa, free_over_paisa, eta |
| `audit_log` / `site_settings` | admin audit; announcements, hero_copy, shipping_config JSON |

**RPCs** (`SECURITY DEFINER`, `search_path = ''`): `create_order(cart, address, coupon, payment)` — reprices from DB, validates stock + coupon, picks zone, decrements stock, writes order/items/event in one transaction; `search_products` (full-text + trigram fallback); `adjust_stock` (staff only + audit); `cancel_order` (restores stock, valid transitions only, decrements coupon usage).

**Demo data** (`0004_seed.sql` + mirrored TS catalog in `src/lib/catalog.ts`):
- Category tree per plan §6 (Men 18 L2 + L3 leaves, Women 10 L2 + L3 leaves, Kids Boys/Girls + leaves).
- **24 demo products, 8 per section** (DB slugs `demo-*`; TS catalog has its own 24 marketing entries with `DEMO-` SKUs).
- 2 variants per DB demo product (`DEMO-…` SKUs, stock 25/15), 2 placeholder images each (`/hero/<section>.svg`).
- Coupons: `WELCOME10` (percent 10, min 100000 paisa = ৳1,000, limit 5000, 2025–2030), `FREESHIP` (free_shipping, min 150000 paisa = ৳1,500).
- Zones: `Dhaka city` (Dhaka/Gazipur/Narayanganj/Munshiganj/Narsingdi/Manikganj; fee 6000 = ৳60; free over 200000 = ৳2,000; 2–3 days), `Outside Dhaka` (12 districts; fee 12000 = ৳120; free over 300000 = ৳3,000; 3–5 days).
- `site_settings`: announcements, hero_copy, shipping_config.

Removing demos (DB): variants/images cascade from products:

```sql
DELETE FROM products WHERE slug LIKE 'demo-%';
```

## Admin guide (`/admin`)

Server-protected by `src/app/admin/layout.tsx` → `requireAdmin()` (`src/lib/auth.ts`).
Dashboard, Products (incl. variant matrix, image uploader max 5), Orders (status workflow, courier/tracking, invoice/packing-slip PDF, cancel with stock restore, CSV export), Coupons, Categories, Settings; Staff role = orders/stock only; audit log view.

- **Local dev fallback:** with no Supabase env vars, `getSession()` returns a dev admin
  (`dev@example.com`, `isDev: true`, badge shown in the admin sidebar) so `/admin` is usable offline.
  With Supabase configured, real Auth + `profiles.role` applies and non-admins are blocked server-side.
- **Promote the first admin** (sign up first, then run in Supabase SQL editor):

```sql
update profiles set role = 'admin' where id = '<user-id>';
```

- **Remove demo rows** after importing real products:

```sql
DELETE FROM products WHERE slug LIKE 'demo-%';
```

- Replacing demo content: 3 hero photos → `public/hero/` (plan expects `men.jpg/women.jpg/kids.jpg`),
  `public/logo.svg`, real products (admin or CSV import), then run the `DEMO-` cleanup SQL above.

## Env vars

All variables are listed with comments in `.env.example`. Never commit `.env*` (git-ignored);
service-role key is server-only.

| Var | Purpose / notes |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (browser-safe) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (browser-safe) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key — **server only, never expose to client** |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL (metadata, OG, redirects); default `http://localhost:3000` |
| `RESEND_API_KEY` | Optional — order confirmation / status emails via Resend |
| `SSLCOMMERZ_STORE_ID` / `SSLCOMMERZ_STORE_PASS` / `SSLCOMMERZ_ENDPOINT` | Sandbox creds (dev; sandbox endpoint until live approval) |
| `PAYMENT_SSLCOMMERZ_ENABLED` | Keep `false` until sandbox IPN flow is verified |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Optional — rate limit/cache; in-memory fallback in dev |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile on checkout/signup/contact |

## Tests

```bash
npm run test        # Vitest: tests/unit (money, cart store, BD phone + coupons — 36 tests)
npm run test:e2e    # Playwright chromium: tests/e2e (1 COD purchase flow + 3 axe pages = 4 tests)
npx @lhci/cli autorun   # after `npm run build` + `npm run start`; asserts in lighthouserc.json
```

- Unit: `tests/unit/money.test.ts` (paisa formatting), `cart.test.ts` (Zustand store, paisa math),
  `validators.test.ts` (BD phone `^01[3-9]\d{8}`, `validateCoupon`).
- E2E purchase (`tests/e2e/purchase.spec.ts`): home → Men → product → size → add → checkout COD form → expects `BR-…` order ref. Run serially against an isolated/seeded env (places a real order).
- Axe (`tests/e2e/a11y.spec.ts`): `/`, `/men`, `/cart` must have **zero serious/critical** violations (moderate/minor reported, non-blocking).
- RLS: `tests/rls/` assets; CI runs lint → typecheck → unit → e2e → Lighthouse (`ci.yml`); `backup.yml` (weekly `pg_dump` artifact), `keepalive.yml` (ping so the free project isn't paused).

## Free-tier cautions

- **Vercel Hobby is for non-commercial use.** A live store selling products may require Vercel Pro.
  Code stays portable (no Vercel-only APIs beyond analytics/env) so it can move to Cloudflare Pages/Workers (free, commercial use allowed).
- **Supabase free:** ~500 MB database, ~1 GB storage, project pauses after inactivity.
  Images are pre-compressed to 3 WebP variants + blur placeholder; `keepalive.yml` pings the project; `backup.yml` keeps weekly `pg_dump` artifacts (free Supabase has no point-in-time recovery).
- **Resend free:** limited emails/day — queue and batch low-priority emails.

## Go-live checklist

1. **Supabase:** create project; copy URL / anon key / service key into `.env.local` and Vercel envs
   (Production + Preview). Add production URL to Auth redirect URLs. The `product-images` bucket is created by migration `0002_rls.sql`.
2. **Push DB:** `npx supabase login` → `npx supabase link --project-ref <ref>` → `npx supabase db push` → run seed (`0004_seed.sql`).
3. **Vercel:** `vercel link`, add env vars, `vercel --prod`. Add domain in Project Settings → Domains;
   set the DNS records Vercel shows (typically A `76.76.21.21` for apex and CNAME `cname.vercel-dns.com`
   for `www` — use Vercel's displayed values if different). Optional: DNS on Cloudflare (free) + Cloudflare Email Routing for `hello@yourdomain`.
4. **Resend:** verify the domain (SPF/DKIM records) so order emails don't land in spam.
5. **SSLCommerz:** apply for a live merchant account; keep sandbox (`SSLCOMMERZ_ENDPOINT=https://sandbox.sslcommerz.com`, flag `false`) until approved and IPN verified.
6. **First admin:** sign up, then `update profiles set role = 'admin' where id = '<user-id>';`.
7. **Replace demo content:** 3 hero photos in `public/hero/`, `public/logo.svg`, real products; run `DELETE FROM products WHERE slug LIKE 'demo-%';`.
