-- brand-store 0001: core schema
-- Money = integer paisa. uuid PKs default gen_random_uuid().

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA public;

-- Human order numbers: BR-100231, BR-100232, ...
CREATE SEQUENCE IF NOT EXISTS public.order_no_seq START WITH 100231 INCREMENT BY 1;

-- Shared updated_at trigger -------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Tables --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES public.categories (id) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  name_bn text,
  section text NOT NULL CHECK (section IN ('men', 'women', 'kids')),
  sort integer NOT NULL DEFAULT 0,
  image_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  name_bn text,
  description text NOT NULL DEFAULT '',
  description_bn text NOT NULL DEFAULT '',
  section text NOT NULL CHECK (section IN ('men', 'women', 'kids')),
  category_id uuid REFERENCES public.categories (id) ON DELETE SET NULL,
  price_paisa integer NOT NULL CHECK (price_paisa >= 0),
  compare_at_paisa integer CHECK (compare_at_paisa IS NULL OR compare_at_paisa >= 0),
  fabric text,
  care text,
  fit_notes text,
  is_new boolean NOT NULL DEFAULT false,
  is_sale boolean NOT NULL DEFAULT false,
  is_featured boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  search tsvector GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || coalesce(fabric, ''))
  ) STORED,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  sku text NOT NULL UNIQUE,
  size text,
  color text,
  color_hex text,
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  price_override_paisa integer CHECK (price_override_paisa IS NULL OR price_override_paisa >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  position integer NOT NULL CHECK (position >= 1 AND position <= 5),
  path_thumb text,
  path_medium text,
  path_large text,
  alt text,
  blur_data_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, position)
);

-- Rejects a 6th image per product (unique + check already cap position at 5).
CREATE OR REPLACE FUNCTION public.reject_sixth_image()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  v_count integer;
BEGIN
  SELECT count(*) INTO v_count
  FROM public.product_images
  WHERE product_id = NEW.product_id;
  IF v_count >= 5 THEN
    RAISE EXCEPTION 'Max 5 images per product';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_product_images_limit ON public.product_images;
CREATE TRIGGER trg_product_images_limit
  BEFORE INSERT ON public.product_images
  FOR EACH ROW EXECUTE FUNCTION public.reject_sixth_image();

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  full_name text,
  phone text,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'staff', 'admin')),
  locale text NOT NULL DEFAULT 'en',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text NOT NULL,
  division text,
  district text,
  area text,
  line1 text NOT NULL,
  notes text,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_no text NOT NULL UNIQUE,
  user_id uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  guest_email text,
  guest_phone text,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'returned')),
  payment_method text NOT NULL DEFAULT 'cod' CHECK (payment_method IN ('cod', 'sslcommerz')),
  payment_status text NOT NULL DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid', 'paid', 'failed', 'refunded')),
  subtotal_paisa integer NOT NULL DEFAULT 0 CHECK (subtotal_paisa >= 0),
  discount_paisa integer NOT NULL DEFAULT 0 CHECK (discount_paisa >= 0),
  shipping_paisa integer NOT NULL DEFAULT 0 CHECK (shipping_paisa >= 0),
  total_paisa integer NOT NULL DEFAULT 0 CHECK (total_paisa >= 0),
  coupon_code text,
  address jsonb,
  courier text,
  tracking_no text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
  variant_id uuid REFERENCES public.product_variants (id) ON DELETE SET NULL,
  name_snapshot text NOT NULL,
  size text,
  color text,
  qty integer NOT NULL CHECK (qty > 0),
  unit_price_paisa integer NOT NULL CHECK (unit_price_paisa >= 0),
  image_snapshot text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
  status text NOT NULL,
  note text,
  actor text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.coupons (
  code text PRIMARY KEY,
  type text NOT NULL CHECK (type IN ('percent', 'fixed', 'free_shipping')),
  value integer NOT NULL DEFAULT 0 CHECK (value >= 0),
  min_subtotal_paisa integer NOT NULL DEFAULT 0 CHECK (min_subtotal_paisa >= 0),
  starts_at timestamptz,
  ends_at timestamptz,
  usage_limit integer CHECK (usage_limit IS NULL OR usage_limit > 0),
  used_count integer NOT NULL DEFAULT 0 CHECK (used_count >= 0),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.wishlist (
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, product_id)
);

CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles (id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  body text,
  photos text[] CHECK (array_length(photos, 1) <= 3),
  approved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.stock_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id uuid NOT NULL REFERENCES public.product_variants (id) ON DELETE CASCADE,
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (variant_id, email)
);

CREATE TABLE IF NOT EXISTS public.shipping_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  districts text[] NOT NULL DEFAULT '{}',
  fee_paisa integer NOT NULL DEFAULT 0 CHECK (fee_paisa >= 0),
  free_over_paisa integer CHECK (free_over_paisa IS NULL OR free_over_paisa >= 0),
  eta_days text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor uuid,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id text,
  diff jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.site_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- updated_at triggers ---------------------------------------------------------
DROP TRIGGER IF EXISTS trg_categories_updated ON public.categories;
CREATE TRIGGER trg_categories_updated
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_products_updated ON public.products;
CREATE TRIGGER trg_products_updated
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_variants_updated ON public.product_variants;
CREATE TRIGGER trg_variants_updated
  BEFORE UPDATE ON public.product_variants
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_images_updated ON public.product_images;
CREATE TRIGGER trg_images_updated
  BEFORE UPDATE ON public.product_images
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_profiles_updated ON public.profiles;
CREATE TRIGGER trg_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_addresses_updated ON public.addresses;
CREATE TRIGGER trg_addresses_updated
  BEFORE UPDATE ON public.addresses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_orders_updated ON public.orders;
CREATE TRIGGER trg_orders_updated
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_coupons_updated ON public.coupons;
CREATE TRIGGER trg_coupons_updated
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_reviews_updated ON public.reviews;
CREATE TRIGGER trg_reviews_updated
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_zones_updated ON public.shipping_zones;
CREATE TRIGGER trg_zones_updated
  BEFORE UPDATE ON public.shipping_zones
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_settings_updated ON public.site_settings;
CREATE TRIGGER trg_settings_updated
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Indexes ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_categories_parent ON public.categories (parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_section ON public.categories (section);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category_id);
CREATE INDEX IF NOT EXISTS idx_products_section_cat_active
  ON public.products (section, category_id, active);
CREATE INDEX IF NOT EXISTS idx_products_search ON public.products USING gin (search);
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON public.products USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_variants_product ON public.product_variants (product_id);
CREATE INDEX IF NOT EXISTS idx_images_product ON public.product_images (product_id);
CREATE INDEX IF NOT EXISTS idx_addresses_user ON public.addresses (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);
CREATE INDEX IF NOT EXISTS idx_items_order ON public.order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_items_variant ON public.order_items (variant_id);
CREATE INDEX IF NOT EXISTS idx_events_order ON public.order_events (order_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product ON public.wishlist (product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.reviews (product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON public.reviews (user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_variant ON public.stock_alerts (variant_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON public.audit_log (entity, entity_id);
