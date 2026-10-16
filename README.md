# brand-store — Premium Bangladeshi Fashion (Men / Women / Kids)

Next.js 15 + Supabase e-commerce app. Currency BDT (paisa integers), locales `en-BD` + `bn`.

## Stack

- Next.js 15 App Router, React 19, TypeScript strict
- Tailwind CSS v4, `clsx` + `tailwind-merge`
- Supabase (DB / Auth / Storage) via `@supabase/ssr`
- Zustand (cart), `zod` validation, `server-only`
- Vitest + Playwright + `@axe-core/playwright`

## Quickstart

```bash
npm install
cp .env.example .env.local
# fill in Supabase URL / anon key / service-role key
npm run dev
```

## Env

| Var | Purpose |
| --- | ------- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (browser-safe) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key — server only |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL |
| `RESEND_API_KEY` | Optional — order emails |
| `SSLCOMMERZ_STORE_ID` / `SSLCOMMERZ_STORE_PASS` / `SSLCOMMERZ_ENDPOINT` | Sandbox creds (dev) |
| `PAYMENT_SSLCOMMERZ_ENABLED` | Keep `false` until sandbox IPN verified |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Optional — rate limit/cache |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | Bot protection |

## Scripts

| Script | Runs |
| ------ | ---- |
| `npm run dev` | Next.js dev server |
| `npm run build` / `npm run start` | Production build / serve |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Vitest unit tests |
| `npm run test:e2e` | Playwright e2e (chromium) |

## Free-tier cautions

- Vercel Hobby is for non-commercial use — a live store may require Vercel Pro. Code stays portable (no Vercel-only APIs beyond analytics/env) so it can move to Cloudflare Pages/Workers.
- Supabase free: ~500 MB DB, ~1 GB storage, project pauses after inactivity — images are pre-compressed to 3 WebP variants + blur placeholder.
- Resend free: limited emails/day — queue and batch low-priority emails.
