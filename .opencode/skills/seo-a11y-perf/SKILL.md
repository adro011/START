---
name: seo-a11y-perf
description: JSON-LD, hreflang, accessibility gates, and Core Web Vitals budgets.
---

# SEO / A11y / Perf Rules

## SEO
- Per-page `generateMetadata`: title, description, canonical, OG/Twitter.
- `hreflang` en + bn on every public route. Locale via `next-intl`.
- JSON-LD: Product (offers/availability/aggregateRating), BreadcrumbList, Organization, FAQ.
- Dynamic `sitemap.xml` (products, categories) + `robots.txt` + `/feed.xml` (Merchant).
- Dynamic OG images via `next/og`. Clean slugs, breadcrumbs, related linking.

## A11y
- Axe: zero critical/serious on home, listing, product, cart, checkout.
- Keyboard-complete: mega-menu, drawer, gallery, filters, checkout.
- Focus ring `--terracotta`, contrast AA, Bangla `lang="bn"` strings.

## Perf budgets (CI-enforced)
- Lighthouse mobile ≥ 90 all categories. LCP < 2.5s, CLS < 0.05, INP < 200ms.
- Initial JS < 170KB gz on home. `priority` only on LCP image.
- `next/image` correct `sizes`, AVIF/WebP, blur placeholders.

## Headers
- Strict CSP (nonce), HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`.
