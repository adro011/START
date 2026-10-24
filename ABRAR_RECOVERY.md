# ABRAR_RECOVERY.md — session recovery checkpoint (2026-10-24 14:3x)

## Environment state at recovery
- Branch `master`, clean-ish tree. Uncommitted: `src/app/layout.tsx`, `src/middleware.ts`,
  `tsconfig.json`, `dev.pid`; untracked `next.config.mjs`, `.next-obsidian/`.
- Dev servers: **3000 healthy (200)** — leave running. 3001/3002 return 500: they are
  duplicate/orphan `next dev` processes from the interrupted session that collided on the
  shared `.next` dir (`ENOENT .next/prerender-manifest.json` in `.temp/dev-verify-err.log`).
  `next.config.mjs` was a TEMPORARY isolated-dist override for parallel-agent verification
  (`OBSIDIAN_DIST_DIR=.next-obsidian`); it duplicates `next.config.ts` otherwise.
- Brand: ABRAR-EXCLUSIVE (`src/config/site.ts`).

## Workstream status (diagnosed, not assumed)

| Workstream | Status | Evidence |
|---|---|---|
| Product variants (admin matrix) | DONE | `admin/products/product-form.tsx:255-283`, `actions.ts:124-142` |
| Live preview | DONE | `admin/products/live-preview.tsx`, rendered `product-form.tsx:313-327` |
| Image zoom | DONE | `components/zoom-image.tsx`, `components/gallery.tsx`, wired in `product/[slug]/page.tsx:4` |
| Storefront sync (live-first) | DONE | `lib/storefront.ts` (12 call sites), `scripts/sync-content.mjs` → `content.generated.ts` |
| **Shop Registry → storefront** | **BROKEN** | `registry/products/new/actions.ts` never inserts `product_variants`; `storefront.ts:254` drops variant-less products → registry products are invisible |
| **Product image upload** | **BROKEN** | Both `admin/products/actions.ts:151-156` and `registry/.../actions.ts:80-88` persist only `file.name`/`alt` as `path_medium`; no upload code exists anywhere in `src/` (bucket `product-images` exists in `0002_rls.sql:330-353`) |
| Admin edit image URLs | DATA-LOSS BUG | edit page hydrates `url` (`[id]/page.tsx:41-46`) but form submits only `name` (`product-form.tsx:156`) → real paths replaced by alt text |
| Middleware | debug leftover | `x-debug-locale-cookie` header added during locale debugging |

## Fixes applied in this recovery pass
1. `src/lib/product-images.ts` (new): service-role upload to `product-images` bucket,
   returns public object URLs; validation (type/size/cap 5).
2. `registry/products/new/actions.ts`: insert one `product_variants` row per product
   (size from form, stock field added, auto SKU) + real image upload + `revalidatePath`.
3. `registry/products/new/product-form.tsx` + `registry-dict.ts`: add required **stock** field.
4. `admin/products/actions.ts` + `product-form.tsx`: images now carry `file` (new uploads)
   and `url` (existing DB src); existing URLs preserved on edit, files uploaded for real.
5. `src/middleware.ts`: removed debug header.

## Not touched (on purpose)
- No dependency installs, no migration changes (schema already has variants/images/storage).
- Healthy dev server on :3000 left running; duplicate 3001/3002 orphans not killed (user env).

## Verification (this pass)
- `npx tsc --noEmit` ✅ clean
- `npx eslint .` ✅ clean
- `npx vitest run` ✅ 84/84 passed
- Live :3000 ✅ `/`, `/registry/products/new`, `/admin/products`, `/men` all 200
- React Flight confirmed to reconstruct `File` args on the server (name/type/size
  preserved → `new File(chunks, filename, {type})`), so `z.instanceof(File)` + `file.name`
  in the registry/actions upload paths are runtime-safe.

## Next task (exact)
1. Manual smoke test: sign into `/registry` → create a product with an image + stock →
   confirm a `product_variants` row is written and the product appears on `/men`/`/women`/
   `/kids` + `/product/<slug>` with a real storage image. Repeat in `/admin/products` for
   the edit-image-URL preservation path.
2. Remove the TEMPORARY `next.config.mjs` (it only exists to isolate a parallel agent's
   `.next-obsidian` dist dir) so `next.config.ts` is authoritative again — after killing the
   orphaned dev servers on 3001/3002.
3. Commit (user confirmation required): product-image upload + registry variants + stock
   field + middleware cleanup. Do NOT commit `.next-obsidian/`.
