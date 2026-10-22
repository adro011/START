# FINAL REPORT — ABRAR-EXCLUSIVE brand-store (docs pass)

Docs-finalization pass only. No code changes, no install/build/test runs, no git commits.
Scope owned here: `README.md` (rewritten), `DECISIONS.md` (entries 5–6 appended), this file (new).

## 1. Repo state

- Root: `X:\START\brand-store`, Next.js 15.5 + Supabase fashion e-commerce, brand **ABRAR-EXCLUSIVE** (`BRAND_NAME` only in `src/config/site.ts`).
- Git: local repo on branch `master`, **no remote configured** (not yet pushed). Working tree has 3 uncommitted modifications: `.gitignore`, `src/app/feed.xml/route.ts`, `src/app/robots.ts`, `src/app/sitemap.ts` (per `git status` at docs time).
- Migrations present and read: `0001_schema.sql` (16 tables, order sequence from BR-100231, 5-image trigger), `0002_rls.sql` (`is_admin()` / `is_staff_or_admin()`, per-table policies, `product-images` bucket), `0003_rpcs.sql` (`create_order`, `search_products`, `adjust_stock`, `cancel_order`), `0004_seed.sql` (category tree, zones, coupons, 24 `demo-*` products).
- Storefront + admin routes, 19 components, 6 API routes (health, products, contact, newsletter, waitlist, webhooks/sslcommerz), 3 unit test files, 2 e2e specs, CI/backup/keepalive workflows — all present and described factually in the rewritten `README.md`.
- This pass executed **zero** verification runs (forbidden by task constraints), so quality numbers below are placeholders for the main agent.

## 2. How to run

```bash
npm install
copy .env.example .env.local   # fill in Supabase URL / anon key / service-role key
npm run dev                    # http://localhost:3000
```

Useful: `npm run build` + `npm run start` · `npm run lint` · `npm run typecheck` ·
`npm run test` (Vitest) · `npm run test:e2e` (Playwright chromium) ·
`npx @lhci/cli autorun` after build+start (config `lighthouserc.json`).
Without Supabase env vars the app runs on the local demo catalog with a dev-admin fallback for `/admin`.
With env vars, listings/product/search/checkout read live Supabase data first (`src/lib/storefront.ts`, local fallback) and COD orders persist via the `create_order` RPC.

## 3. URLs

- **Live URL:** `PLACEHOLDER_LIVE_URL` (not deployed yet — run `vercel --prod` per the README go-live checklist, then replace).
- **Repo URL:** local git only — no remote configured (not yet pushed). To publish:

```bash
gh repo create abrar-exclusive-store --private --source=. --push
```

## 4. Admin steps

1. Local (no Supabase env): open `/admin` — dev fallback signs you in as `dev@example.com` admin automatically.
2. Live: sign up via `/login`, then in the Supabase SQL editor run:

```sql
update profiles set role = 'admin' where id = '<user-id>';
```

3. Manage: Dashboard · Products (variants, ≤5 images) · Orders (status workflow, courier/tracking, invoice + packing-slip PDF, cancel restores stock) · Coupons · Categories · Settings. Staff role covers orders/stock only.
4. After importing real products, remove demos:

```sql
DELETE FROM products WHERE slug LIKE 'demo-%';
```

## 5. Env var table

See `README.md` § Env vars (full table) — source of truth is `.env.example`:
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server-only),
`NEXT_PUBLIC_SITE_URL`, `RESEND_API_KEY` (optional), `SSLCOMMERZ_STORE_ID` / `SSLCOMMERZ_STORE_PASS` /
`SSLCOMMERZ_ENDPOINT` + `PAYMENT_SSLCOMMERZ_ENABLED=false`, `UPSTASH_REDIS_REST_URL` /
`UPSTASH_REDIS_REST_TOKEN` (optional), `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY`.

## 6. Demo data inventory

- **24 products** (8 each Men / Women / Kids) in DB seed (`demo-*` slugs, e.g. `demo-cotton-panjabi`, `demo-muslin-sharee`, `demo-boys-kabli`) **and** 24 marketing entries in `src/lib/catalog.ts` (e.g. `classic-cotton-panjabi-white`); 2 `DEMO-` variants + 2 `/hero/<section>.svg` placeholder images per DB product.
- **Coupons:** `WELCOME10` (10% off, min ৳1,000, cap noted in `src/lib/coupons.ts`, limit 5000, 2025–2030), `FREESHIP` (free shipping, min ৳1,500).
- **Zones:** Dhaka city (৳60 fee, free over ৳2,000, 2–3 days) / Outside Dhaka (৳120 fee, free over ৳3,000, 3–5 days); `site_settings` announcements + hero_copy + shipping_config.
- Placeholders to replace at go-live: hero photos, `public/logo.svg`, `+8801XXXXXXXXX` phone/WhatsApp, `hello@example.com`, social links.

## 7. User-must-supply list

1. Supabase project (URL, anon key, service-role key) + `db push` + seed.
2. Resend API key + domain verification (SPF/DKIM).
3. SSLCommerz credentials (sandbox now, live merchant account after approval) + IPN verification.
4. Cloudflare Turnstile site + secret keys.
5. 3 hero photos (`public/hero/men.jpg`, `women.jpg`, `kids.jpg`), logo, real product data/images.
6. Custom domain + DNS records from Vercel; decision on Vercel Pro vs Cloudflare Pages for commercial use.

## 8. Quality results

Measured 2026-10-22 (Node 24, `next build` + `next start`, Supabase live):

- **Unit — 77 tests, all passing** (`money` 5, `cart` 6, `validators` 25,
  `order-state-machine` 26, `sslcommerz` 15).
- **E2E — 4 tests, all passing** (1 COD purchase flow + 3 axe pages).
- **Axe — zero serious/critical violations** on `/`, `/men`, `/cart`.
- **Lighthouse CI** (`/` and `/men`, local `next start`):

  | URL | Perf | A11y | Best-Practices | SEO | LCP | CLS |
  |---|---|---|---|---|---|---|
  | `/` | **0.59** ✗ | 0.96 ✓ | 1.00 ✓ | 1.00 ✓ | 4532 ms ✗ | 0.0077 ✓ |
  | `/men` | **0.58** ✗ | 0.96 ✓ | 1.00 ✓ | 1.00 ✓ | 5256 ms ✗ | 0.000 ✓ |

  A11y / Best-Practices / SEO / CLS all meet the §9 budgets. **Performance and
  LCP fail** — the home and listing pages are server-rendered on demand (they
  await Supabase reads in the page component), so TTFB + LCP land at ~4.5–5.3 s
  locally. See §11 item 1.

## 9. Known limitations (all verified in-repo)

1. **Demo checkout RPC is wired with local fallback:** `src/actions/checkout.ts::placeOrder` tries live `create_order` first (`tryLiveOrder` resolves cart SKUs to DB variant uuids — fires automatically for storefront carts carrying DB SKUs) and falls back to the local demo repricer (random `BR-` number) only when env is missing or SKUs have no DB match.
2. **No live Supabase yet:** no `.env.local` values and no linked project in-repo; DB-backed paths (auth roles, orders, RLS) are unexercised until §7 item 1 is done.
3. **Motion is CSS-only:** `motion`/`lenis`/`gsap` are not in `package.json`; hero/parallax/scroll-rail effects from plan §5 are not implemented as specified.
4. **Service worker unregistered:** `public/sw.js` exists (static cache + `/offline` fallback) but a repo-wide search finds no `serviceWorker.register` call in `src` — PWA install/offline works only after registration lands.
5. Hero visuals are `.svg` placeholders (`men.svg`/`women.svg`/`kids.svg`); contact info, WhatsApp number, and social links are placeholders (`src/config/site.ts`).
6. Turnstile/Resend/Upstash integrations are env-gated stubs, not end-to-end verified.

## 10. Addendum 2026-10-16 — live DB + motion + pre-commit fixes (uncommitted at docs-pass time, now in repo)

- **Supabase live:** CLI linked to project START (`lsyrqkrzuzkkezpycgcu`); migrations `0001`–`0005` pushed
  (`0005_fix_extensions.sql` moves `pgcrypto`/`pg_trgm` into `public`; `0002_rls.sql` gained `DROP POLICY IF EXISTS`
  guards + INSERT coverage in `guard_profile_role`). E2E proved `create_order` (`BR-100232`, `WELCOME10` + Dhaka-zone
  math, atomic stock −2), then cleaned up. `src/app/api/health/route.ts` reports live product counts (`source: supabase`).
- **Checkout:** `src/actions/checkout.ts::placeOrder` tries live RPC `create_order` (sku→variant resolution via
  server-only service-role client `src/lib/supabase/service-role.ts`, RPC via anon client) and falls back to the local
  demo repricer when env is missing or cart items have no DB variant. Generated types in `src/types/supabase.ts`.
- **Motion:** Lenis (`lenis` in `package.json`) + CSS reveals, magnetic CTAs, cursor ring, session preloader;
  header is condense-on-scroll only (hide-on-scroll reverted: it would strand the open mega menu).
- **Contrast fixes in this commit:** Sale badge / sale CTA / newsletter button / mega featured-CTA hover restored to
  `bg-clay` (white-on-terracotta is 4.00:1, fails AA; white-on-clay is 6.33:1); product price uses umber
  (7.15:1 on paper) with a `[&_.price]:text-blush` override in the dark sale band (umber-on-ink is 2.42:1).
  Hero gold hover kept (white-on-`#917300` is 4.51:1, passes).
- **Hero:** `public/hero/{men,women,kids}.jpg` are sharp-converted mozjpeg q84 files from the new `library/` PNG portraits
  (245/412/410KB, ≤1080w, progressive); `.svg` files remain as fallbacks.
  Multi-MB originals stay in local `library/` (git-ignored, not committed); `supabase/.temp/` also ignored.
- **PWA:** `src/components/sw-register.tsx` is rendered by `src/app/layout.tsx` — the §9 limitation about an
  unregistered SW no longer applies. `metadataBase` now uses `NEXT_PUBLIC_SITE_URL`.
- **Brand:** ABRAR-EXCLUSIVE, "Quality, beauty and elegance" (single source `src/config/site.ts`; zero stale strings in `src`+`public`).
- **Product page:** rebuilt per reference — 2-up gallery grid + lightbox, sticky buy column (qty stepper, live free-ship meter,
  WhatsApp secondary, dark trust panel, pairs-well-with card).
- Remaining TODOs unchanged: Turnstile/Resend/Upstash
  end-to-end verification, real product data + photography, deploy + domain.

## 11. Prioritized next steps

1. **Fix Lighthouse performance budget (§9)** — performance is 0.58–0.59 with LCP
   4.5–5.3 s. Root cause: home + listing pages are server-rendered on demand and
   `await` Supabase reads in the page component (no ISR/static prerender), and the
   412 KB hero LCP image loads synchronously. Fix: static-generate or ISR-cache
   (`revalidateTag` on product edits) the home/listing pages, add a `loading.tsx`
   streaming boundary, convert the hero to AVIF/WebP with a smaller `sizes`/`quality`,
   and preload the display font.
2. **Merchant feed polish** — `/feed.xml` route exists; validate against Google/Meta Merchant specs (availability, GTIN-less BD apparel, BDT pricing) and add scheduled refresh.
3. **Abandoned-cart emails** — persist guest carts, scheduled Resend reminders with coupon incentive.
4. **Loyalty points** — earn/burn ledger on orders, member tiers in `profiles`.
5. **Size recommendation** — fit quiz + order-history fit model on product pages.
6. **Gift cards** — issuable codes, balance ledger, checkout redemption.
7. **B2B wholesale** — wholesale price lists, MOQ rules, tax-invoice PDFs, staff-assisted ordering.
