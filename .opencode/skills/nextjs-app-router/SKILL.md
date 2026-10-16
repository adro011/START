---
name: nextjs-app-router
description: App Router RSC patterns, server actions, caching and ISR for the fashion store.
---

# Next.js App Router Rules

## Rendering
- RSC by default. Add `'use client'` only for interactivity (cart, filters, gallery).
- Wrap async sections in `<Suspense>` for streaming. Never block page on reviews/related.
- Every route needs `loading.tsx`, `error.tsx`, `not-found.tsx`.

## Data fetching
- Fetch in server components with `@supabase/ssr` server client.
- Never fetch secrets or service-role in client components.
- Route-level caching: `fetch` with tags `['products', 'categories']`.

## Mutations
- All mutations via Server Actions + zod validation on server.
- Validate `FormData`/JSON with zod, return typed `{ ok, error }`.
- On product/category edit: call `revalidateTag('products')` / `revalidatePath`.

## Metadata / SEO
- Use `generateMetadata` per route (product name, category, bn fallback).
- Set `alternates: { canonical, languages: { en, bn } }`.

## Images
- Use `next/image` with correct `sizes` (card: 400px, gallery: 900px, hero: 1600px).
- `priority` only on LCP image. All others lazy + `blurDataURL`.
- AVIF/WebP only, no hotlinking.

## Do / Don't
- DO colocate `page.tsx`, `loading.tsx`, `actions.ts` per route.
- NEVER trust client price/qty totals — recalc server-side.
- NEVER put `process.env.SUPABASE_SERVICE_ROLE_KEY` in client bundle.
