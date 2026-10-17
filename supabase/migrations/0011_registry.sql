-- brand-store 0011: Shop Registry schema.
-- Soft-delete everywhere (deleted_at); no ON DELETE CASCADE on registry FKs.
-- Max 5 images per registry product (trigger + unique product_id+position).
-- Idempotent: IF NOT EXISTS / CREATE OR REPLACE / DROP TRIGGER IF EXISTS.
-- Follows the style of 0001_schema.sql: uuid PKs, integer paisa, timestamptz.

-- Reuses public.handle_updated_at() (defined in 0001) and the role helpers
-- public.is_admin() / public.is_staff_or_admin() (defined in 0002).

-- Tables --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.registry_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  full_name text,
  role text NOT NULL CHECK (role IN ('staff', 'admin')),
  phone text,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.registry_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registry_user_id uuid NOT NULL REFERENCES public.registry_users (id) ON DELETE RESTRICT,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  type text NOT NULL CHECK (type IN ('male', 'female', 'children', 'others', 'new-arrivals')),
  age_category text NOT NULL CHECK (age_category IN ('infant', 'toddler', 'kids', 'teens', 'adults', 'seniors', 'all-ages')),
  size_category text,
  size_value text,
  price_paisa integer NOT NULL CHECK (price_paisa >= 0),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.registry_product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.registry_products (id) ON DELETE RESTRICT,
  position integer NOT NULL CHECK (position >= 1 AND position <= 5),
  image_url text NOT NULL,
  alt_text text NOT NULL DEFAULT '',
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, position)
);

-- Rejects a 6th image per registry product (position check already caps at 5).
-- Counts only non-soft-deleted images so soft-deleted images free a slot.
CREATE OR REPLACE FUNCTION public.reject_sixth_registry_image()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  v_count integer;
BEGIN
  SELECT count(*) INTO v_count
  FROM public.registry_product_images
  WHERE product_id = NEW.product_id
    AND deleted_at IS NULL;
  IF v_count >= 5 THEN
    RAISE EXCEPTION 'Max 5 images per registry product';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_registry_product_images_limit ON public.registry_product_images;
CREATE TRIGGER trg_registry_product_images_limit
  BEFORE INSERT ON public.registry_product_images
  FOR EACH ROW EXECUTE FUNCTION public.reject_sixth_registry_image();

CREATE TABLE IF NOT EXISTS public.registry_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.registry_products (id) ON DELETE RESTRICT,
  user_id uuid NOT NULL REFERENCES public.registry_users (id) ON DELETE RESTRICT,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  body text,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- updated_at triggers --------------------------------------------------------
DROP TRIGGER IF EXISTS trg_registry_users_updated ON public.registry_users;
CREATE TRIGGER trg_registry_users_updated
  BEFORE UPDATE ON public.registry_users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_registry_products_updated ON public.registry_products;
CREATE TRIGGER trg_registry_products_updated
  BEFORE UPDATE ON public.registry_products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_registry_images_updated ON public.registry_product_images;
CREATE TRIGGER trg_registry_images_updated
  BEFORE UPDATE ON public.registry_product_images
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_registry_reviews_updated ON public.registry_reviews;
CREATE TRIGGER trg_registry_reviews_updated
  BEFORE UPDATE ON public.registry_reviews
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Row Level Security ----------------------------------------------------------
-- registry_users is a standalone table (not linked to auth.users), so review
-- ownership is enforced via the user_id FK at the application layer; RLS here
-- restricts writes to staff/admin and reads to published/non-deleted rows.

ALTER TABLE public.registry_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registry_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registry_product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registry_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "registry users staff all" ON public.registry_users;
CREATE POLICY "registry users staff all" ON public.registry_users
  FOR ALL TO authenticated
  USING (public.is_staff_or_admin())
  WITH CHECK (public.is_staff_or_admin());

DROP POLICY IF EXISTS "registry products public read" ON public.registry_products;
CREATE POLICY "registry products public read" ON public.registry_products
  FOR SELECT TO public
  USING (status = 'published' AND deleted_at IS NULL);

DROP POLICY IF EXISTS "registry products staff all" ON public.registry_products;
CREATE POLICY "registry products staff all" ON public.registry_products
  FOR ALL TO authenticated
  USING (public.is_staff_or_admin())
  WITH CHECK (public.is_staff_or_admin());

DROP POLICY IF EXISTS "registry images public read" ON public.registry_product_images;
CREATE POLICY "registry images public read" ON public.registry_product_images
  FOR SELECT TO public
  USING (
    deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM public.registry_products p
      WHERE p.id = registry_product_images.product_id
        AND p.status = 'published' AND p.deleted_at IS NULL
    )
  );

DROP POLICY IF EXISTS "registry images staff all" ON public.registry_product_images;
CREATE POLICY "registry images staff all" ON public.registry_product_images
  FOR ALL TO authenticated
  USING (public.is_staff_or_admin())
  WITH CHECK (public.is_staff_or_admin());

DROP POLICY IF EXISTS "registry reviews public read" ON public.registry_reviews;
CREATE POLICY "registry reviews public read" ON public.registry_reviews
  FOR SELECT TO public
  USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "registry reviews insert any" ON public.registry_reviews;
CREATE POLICY "registry reviews insert any" ON public.registry_reviews
  FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "registry reviews staff all" ON public.registry_reviews;
CREATE POLICY "registry reviews staff all" ON public.registry_reviews
  FOR ALL TO authenticated
  USING (public.is_staff_or_admin())
  WITH CHECK (public.is_staff_or_admin());

-- Indexes --------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_registry_products_user ON public.registry_products (registry_user_id);
CREATE INDEX IF NOT EXISTS idx_registry_products_status ON public.registry_products (status);
CREATE INDEX IF NOT EXISTS idx_registry_products_type ON public.registry_products (type);
CREATE INDEX IF NOT EXISTS idx_registry_products_deleted ON public.registry_products (deleted_at);
CREATE INDEX IF NOT EXISTS idx_registry_images_product ON public.registry_product_images (product_id);
CREATE INDEX IF NOT EXISTS idx_registry_images_deleted ON public.registry_product_images (deleted_at);
CREATE INDEX IF NOT EXISTS idx_registry_reviews_product ON public.registry_reviews (product_id);
CREATE INDEX IF NOT EXISTS idx_registry_reviews_user ON public.registry_reviews (user_id);
CREATE INDEX IF NOT EXISTS idx_registry_reviews_deleted ON public.registry_reviews (deleted_at);
CREATE INDEX IF NOT EXISTS idx_registry_users_email ON public.registry_users (email);
CREATE INDEX IF NOT EXISTS idx_registry_users_deleted ON public.registry_users (deleted_at);
