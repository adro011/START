---
name: supabase-rls
description: Postgres migrations, RLS policies, and secure RPCs for Supabase.
---

# Supabase RLS Rules

## Migrations only
- All schema in `supabase/migrations/*.sql`. Never edit via dashboard.
- Money = integer paisa. PKs `uuid` via `gen_random_uuid()`.
- Include `created_at/updated_at` + trigger, soft-delete `deleted_at` on products.
- Enforce max 5 images: DB trigger rejects 6th `product_images` row.

## RLS required
- Enable RLS on EVERY table. Default deny, then allow.
- Public SELECT only: active + non-deleted products/variants/images/categories, approved reviews, shipping zones, site_settings.
- Customers: own profile, addresses, wishlist, orders (read), reviews (insert own).
- `staff`: read orders, update status, adjust stock. `admin`: all + coupons + settings.
- NEVER allow client to set `role`. Check via `public.is_admin()`.

## RPC security
- All writes via `SECURITY DEFINER` RPCs with `SET search_path = ''`.
- Required RPCs: `create_order`, `search_products`, `adjust_stock`, `cancel_order`.
- Validate auth inside RPC (`auth.uid()`), recalc prices from DB.

## Storage
- Bucket `product-images`: public read, write staff/admin only.
- Browser generates 3 WebP variants (400/900/1600px, q~78) + blur URL.

## Types
- Regenerate after migration: `supabase gen types typescript`.
- Import generated types only; never hand-write row types.
