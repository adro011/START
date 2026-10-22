# PLAN.md v6: Abrar Exclusive (abrar-exclusive.shop) — Enterprise-Grade Cinematic Noir E-Commerce & Autonomous Adaptive Motion System

**ROLE:** Autonomous Engineering & Creative Core (Principal Architect, Awwwards Motion Lead, Full-Stack Lead, Accessibility QA, DevOps).
Execute this blueprint end-to-end with zero user prompts. Log unstated technical decisions in `DECISIONS.md` (Decision | Rationale). Complete phases sequentially (Section 12), verifying hard gates ("Done when") before committing.

---

## 0. Absolute Hard Constraints & Brand Genesis
- **100% Zero-Cost Infrastructure**: Vercel Free / Supabase Free / Upstash Free / Resend Free. Custom domain: `abrar-exclusive.shop`.
- **Single Source of Truth (`src/config/site.ts`)**:
  - `name`: `"ABRAR EXCLUSIVE"`
  - `domain`: `"https://www.abrar-exclusive.shop"`
  - `taglineLeft`: `"CONNECTING CONSUMER THROUGH DIGITAL MEDIA"`
  - `seasonalStamp`: `"EST. DHAKA - EID '26 EDIT LIVE"`
  - `supportHours`: `"SAT–THU 10AM–8PM"`
  - `currency`: `"BDT"` (`৳`), integer paisa in all database transactions and calculation logic.
  - `locales`: `en-BD` (default), `bn` (Bangla locale toggle).
- **Core Architecture & Taxonomy**:
  - Database schema & route segments strictly use lowercase slugs: `men`, `women`, `kids` (`/men`, `/women`, `/kids`).
  - Hero Display Portal labels: `MAN`, `WOMEN`, `CHILDREN` with hollow editorial numbers `01`, `02`, `03`.
  - Collections (`New Arrivals`, `Eid '26 Edit`, `Sale`) are dynamic product filters/flags, not category roots.
- **Strict Media Cap**: Max 5 images per product enforced universally across database trigger, Zod validation schemas, and admin UI uploader.

---

## 1. Pre-Flight & Environment Hygiene
- **Runtime Validation**: Pin `"engines": { "node": "22.x" }` in `package.json` to prevent Vercel auto-upgrade warnings.
- **Dependency Guard**: Clean `.npmrc` (remove deprecated `cache-dir`), configure `package.json` to allow postinstall execution for `esbuild` and `unrs-resolver`.
- **Scaffold**: Initialize `.env.example`, `README.md`, and `DECISIONS.md`.

---

## 2. Specialized Agent Execution Skills (`.opencode/skills/`)
1. **`nextjs-app-router`**: Strict RSC, Suspense streaming boundaries, Zod-validated Server Actions, route ISR via `revalidateTag`.
2. **`supabase-rls`**: Versioned migrations in `supabase/migrations`, table-level RLS policies, `SECURITY DEFINER` RPCs (`set search_path = ''`), strict storage policies.
3. **`adaptive-motion-engine`**: Dual execution path. Cinematic 60fps Lenis + GSAP scrub timelines for high-performance devices; instant, zero-latency CSS fade/translate transitions when `prefers-reduced-motion: reduce` is detected.
4. **`vigilant-typography-ui`**: Uncompromised typographic contrast (WCAG AAA minimum on core elements), fluid clamp scales, crisp Cormorant Garamond / Plus Jakarta Sans pairing.
5. **`bd-commerce-engine`**: Cascading division/district/area shipping zones, strict `+8801[3-9]\d{8}` phone formatting, SSLCommerz gateway integration, idempotent IPN reconciliation.
6. **`qa-release-pipeline`**: Vitest unit testing, Playwright E2E checkout verification, Axe accessibility audits, Lighthouse CI budget enforcement.

---

## 3. Technology Stack Specification
- **Framework**: Next.js 15.5+ App Router, TypeScript (Strict).
- **Styling**: Tailwind CSS v4, shadcn/ui primitives.
- **Motion Core**: `motion` (Framer Motion), `lenis`, conditional `gsap` + `ScrollTrigger`.
- **State & Data**: Zustand (persisted cart/wishlist), TanStack Query, `@supabase/ssr`.
- **Validation & Forms**: `react-hook-form` + `zod`.
- **Security & Infrastructure**: Cloudflare Turnstile, Upstash Redis (@upstash/ratelimit), Resend API, Supabase Storage (browser-compressed WebP triplets).

---

## 4. Design System: "Vigilant Noir & Bangladeshi Heritage"
### Strict Contrast & Typographic Architecture
- **Palette**:
  - `--obsidian` (`#080808`): Immersive dark stages, hero portals, sticky scroller headers, footer.
  - `--ink` (`#111313`): Deep carbon text on light surfaces delivering a pristine 14:1 contrast ratio.
  - `--paper` (`#FAF8F5`): Warm tactile off-white backing for product listings and detail pages.
  - `--amber-gold` (`#D4A359`): Scroll-triggered ambient auras and hollow numeral hover strokes.
  - `--terracotta` (`#C86D3B`): Action anchors, badge highlights, and trust icon containers.
  - `--slate-vigilant` (`#3D4346`): Secondary body text ensuring > 7:1 contrast on `--paper`.
- **Trust Strip Specification (Vigilant & Clear)**:
  - Background: `--paper` with crisp hairline dividers (`#E2DDD5`).
  - 3 columns featuring 44px circular terracotta badge (`৳`, `↺`, `✦`), 21px Cormorant Garamond Bold uppercase headers (`CASH ON DELIVERY`, `EASY EXCHANGES`, `DEDICATED SUPPORT`), and 13px Plus Jakarta Sans subtext (`max-width: 240px` for immaculate 2-line wrapping).

---

## 5. Dual-Mode Animation & Reduced-Motion Architecture
### Core Behavioral Rules
- **Automatic Environment Detection**: A reactive hook monitors `window.matchMedia('(prefers-reduced-motion: reduce)')`.
- **Cinematic Path (Standard)**:
  - Split-curtain theatrical preloader (<1.1s).
  - 3-Pillar Portal Hero accordion hover expansion (`flex: 1 -> 1.45`) with image scaling and amber-gold hollow numeral glow (`01`, `02`, `03`).
  - Scroll-triggered radial ambient aura blooms behind showcase sections.
  - Velocity-reactive marquee ribbon and pinned horizontal lookbook rails.
- **Accessible Path (`prefers-reduced-motion: reduce`)**:
  - Instant preloader bypass.
  - All GSAP scrub timelines, pin effects, and parallax multipliers are disabled.
  - Hover states rely purely on color and border transitions without dimensional scaling or layout shifts.
  - Staggered elements mount instantly with gentle opacity fades (`duration: 0.15s`).

---

## 6. Database Schema & Supabase Migrations (`supabase/migrations/`)
Integer Paisa arithmetic, UUID primary keys, automatic timestamp triggers, soft-delete indexes (`deleted_at`), and GIN full-text search vectors combined with `pg_trgm` fuzzy matching.
- Tables: `categories`, `products`, `product_variants`, `product_images` (enforced 5-image ceiling trigger), `profiles`, `addresses`, `orders`, `order_items`, `order_events`, `coupons`, `wishlist`, `reviews`, `stock_alerts`, `shipping_zones`, `audit_log`, `site_settings`.
- RPCs: `create_order` (transactional stock decrement and price verification), `search_products`.

---

## 7. Storefront Feature Matrix
- **Immersive Home**: Metadata bar, 3-Pillar Portal Hero, Vigilant Trust Strip, Velocity Marquee, New Arrivals Rail, Pinned Lookbook, Heritage Parallax, Noir Footer.
- **Filtered Listings (`/men`, `/women`, `/kids`)**: URL-synced facet filters (price, size, color, fabric), responsive grid density toggles, and infinite scroll.
- **Product Detail Page (PDP)**: 5-image gallery with zoom/lightbox, live stock counter, district-based delivery estimation, size guide modal, WhatsApp instant-order link (`Order via WhatsApp`), and sticky mobile ATC.
- **Command Search (`Cmd/Ctrl + K`)**: Typo-tolerant glassmorphic modal with instant thumbnail previews.
- **Cart & 1-Page Checkout**: Slide-over drawer with free-shipping meter, guest checkout, cascading BD division/district/area selector, `+8801[3-9]\d{8}` phone validation, Turnstile protection, COD / SSLCommerz payment options, and `/track` order lookup.

---

## 8. Role-Protected Admin Portal (`/admin`)
- Revenue dashboards, inventory variant matrix management, drag-and-drop WebP image compressor/uploader, order status workflow, and one-click PDF invoice generation via `@react-pdf/renderer`. Server-side role validation guarantees non-admin rejection.

---

## 9. Performance & Quality Budgets
- **Lighthouse Mobile**: Target score >= 90 across Performance, Accessibility, Best Practices, and SEO.
- **Core Web Vitals**: LCP < 2.5s, CLS < 0.05, INP < 200ms, initial JS payload < 170 KB gzipped.
- **Accessibility**: Zero Axe violations, absolute compliance with WCAG AAA contrast requirements on core typography.

---

## 10. Security, Reliability & Automation
- Server-side price recalculation on all orders; service-role keys restricted entirely to server environments.
- Rate limiting via Upstash Redis; idempotent SSLCommerz IPN verification.
- GitHub Actions workflows for automated weekly `pg_dump` database backups and 5-day Supabase keep-alive pings.

---

## 11. SEO & Omnichannel Growth
- Dynamic metadata, canonical links, `hreflang` configuration (`en-BD` / `bn-BD`), JSON-LD schema markup (`Product`, `BreadcrumbList`, `Organization`, `FAQPage`), dynamic OpenGraph image generation (`next/og`), and a Google/Meta-ready `/feed.xml` product feed.

---

## 12. Phased Execution & Verification Roadmap
1. **Phase 1**: Pre-flight checks, build warning resolution, environment scaffolding, and typography token setup. (`pnpm build` passes with zero warnings).
2. **Phase 2**: Database migrations, RLS security policies, transactional RPCs, storage bucket policies, and category/demo seeding.
3. **Phase 3**: Core navigation, mega-menus, mobile bottom bar, and `Cmd+K` command search modal.
4. **Phase 4**: Cinematic Home, dual-mode reduced-motion architecture, and vigilant trust strip. (`CLS < 0.05`, zero Axe violations, reduced-motion test verified).
5. **Phase 5**: Faceted catalog listings (`/men`, `/women`, `/kids`) with URL state persistence.
6. **Phase 6**: PDP gallery (5-image limit), variant matrix, size guide, and WhatsApp ordering.
7. **Phase 7**: Slide-over cart, cascading BD checkout, COD/SSLCommerz flows, and order tracking.
8. **Phase 8**: Role-protected admin dashboard, product matrix CRUD, and PDF invoicing.
9. **Phase 9**: SSLCommerz sandbox payment verification and courier adapter integration.
10. **Phase 10**: PWA setup, Lighthouse CI audit, automated backup/keep-alive workflows, and production deployment to `abrar-exclusive.shop`.
