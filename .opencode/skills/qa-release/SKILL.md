---
name: qa-release
description: Test pyramid, purchase-flow E2E, Lighthouse CI, and go-live gates.
---

# QA / Release Rules

## Pyramid
- Unit (Vitest): paisa math, coupons, state machine, zod schemas, phone regex.
- Integration: RLS policies (customer cannot read others' orders / write products), RPCs.
- E2E (Playwright chromium): purchase flow guest + COD, filters share URL, admin block.

## Purchase flow (must stay green)
- Seed → browse → PDP → add variant → coupon → checkout (BD address) → `create_order` → stock -1 exactly → track page + email mocked.
- 6th image rejected in UI + DB. Non-admin blocked server-side on `/admin`.

## Perf / a11y gates
- Lighthouse CI: mobile ≥ 90, LCP < 2.5s, CLS < 0.05, INP < 200ms.
- `@axe-core/playwright`: zero critical/serious on 5 key routes.

## Pre-deploy checklist
- `pnpm build` + lint + typecheck pass. `.env.example` current, no secrets in repo.
- Migrations pushed, seed cleaned (`DEMO-` removed), bucket policies set.
- Headers (CSP/HSTS) verified, RLS tests pass, backup + keep-alive workflows live.
