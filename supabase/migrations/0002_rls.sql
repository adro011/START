-- brand-store 0002: Row Level Security + storage policies.

-- Role helpers (SECURITY DEFINER so they bypass RLS) ---------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_staff_or_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'admin')
  );
$$;

-- Enable RLS everywhere ---------------------------------------------------------
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Public read-only catalog ------------------------------------------------------
CREATE POLICY "categories public read" ON public.categories
  FOR SELECT TO public USING (true);

CREATE POLICY "products public read" ON public.products
  FOR SELECT TO public USING (active = true AND deleted_at IS NULL);

CREATE POLICY "variants public read" ON public.product_variants
  FOR SELECT TO public USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_variants.product_id
        AND p.active = true AND p.deleted_at IS NULL
    )
  );

CREATE POLICY "images public read" ON public.product_images
  FOR SELECT TO public USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_images.product_id
        AND p.active = true AND p.deleted_at IS NULL
    )
  );

CREATE POLICY "reviews public read" ON public.reviews
  FOR SELECT TO public USING (approved = true);

CREATE POLICY "zones public read" ON public.shipping_zones
  FOR SELECT TO public USING (true);

CREATE POLICY "settings public read" ON public.site_settings
  FOR SELECT TO public USING (true);

-- Profiles: users read/update own; role changes admin-only (trigger below) -----
CREATE POLICY "profiles select own" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "profiles insert own" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles update own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles admin all" ON public.profiles
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Clients can never escalate their own role: RLS permits the row update,
-- this trigger rejects role changes unless the caller is an admin.
CREATE OR REPLACE FUNCTION public.guard_profile_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can change roles';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_profile_role ON public.profiles;
CREATE TRIGGER trg_guard_profile_role
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_profile_role();

-- Customer-owned data ------------------------------------------------------------
CREATE POLICY "addresses owner all" ON public.addresses
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "addresses admin all" ON public.addresses
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "wishlist owner all" ON public.wishlist
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "wishlist admin all" ON public.wishlist
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Orders: customers read own (writes go through the create_order RPC) -----------
CREATE POLICY "orders owner read" ON public.orders
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "orders staff read" ON public.orders
  FOR SELECT TO authenticated USING (public.is_staff_or_admin());

CREATE POLICY "orders staff update" ON public.orders
  FOR UPDATE TO authenticated
  USING (public.is_staff_or_admin())
  WITH CHECK (public.is_staff_or_admin());

CREATE POLICY "orders admin all" ON public.orders
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Staff may move orders along but never touch money / ownership fields.
CREATE OR REPLACE FUNCTION public.guard_order_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF public.is_admin() THEN
    RETURN NEW;
  END IF;
  IF NEW.subtotal_paisa IS DISTINCT FROM OLD.subtotal_paisa
    OR NEW.discount_paisa IS DISTINCT FROM OLD.discount_paisa
    OR NEW.shipping_paisa IS DISTINCT FROM OLD.shipping_paisa
    OR NEW.total_paisa IS DISTINCT FROM OLD.total_paisa
    OR NEW.user_id IS DISTINCT FROM OLD.user_id
    OR NEW.order_no IS DISTINCT FROM OLD.order_no
    OR NEW.coupon_code IS DISTINCT FROM OLD.coupon_code THEN
    RAISE EXCEPTION 'Only admins can change order totals, ownership or coupon';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_order_update ON public.orders;
CREATE TRIGGER trg_guard_order_update
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.guard_order_update();

CREATE POLICY "items read via order" ON public.order_items
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
        AND (o.user_id = auth.uid() OR public.is_staff_or_admin())
    )
  );

CREATE POLICY "items admin all" ON public.order_items
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "events read via order" ON public.order_events
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_events.order_id
        AND (o.user_id = auth.uid() OR public.is_staff_or_admin())
    )
  );

CREATE POLICY "events admin all" ON public.order_events
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Reviews: anyone reads approved; signed-in users insert/update their own ------
CREATE POLICY "reviews insert own" ON public.reviews
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reviews update own" ON public.reviews
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reviews admin all" ON public.reviews
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Back-in-stock waitlist: anyone may subscribe; only staff read ---------------
CREATE POLICY "alerts insert any" ON public.stock_alerts
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "alerts staff read" ON public.stock_alerts
  FOR SELECT TO authenticated USING (public.is_staff_or_admin());

CREATE POLICY "alerts admin all" ON public.stock_alerts
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Catalog / config writes: admin only ------------------------------------------
CREATE POLICY "categories admin all" ON public.categories
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "products admin all" ON public.products
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "variants admin all" ON public.product_variants
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "images admin all" ON public.product_images
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "zones staff read" ON public.shipping_zones
  FOR SELECT TO authenticated USING (public.is_staff_or_admin());

CREATE POLICY "zones admin all" ON public.shipping_zones
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "coupons staff read" ON public.coupons
  FOR SELECT TO authenticated USING (public.is_staff_or_admin());

CREATE POLICY "coupons admin all" ON public.coupons
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "settings admin all" ON public.site_settings
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "audit admin read" ON public.audit_log
  FOR SELECT TO authenticated USING (public.is_admin());

-- Storage: product-images bucket -------------------------------------------------
-- Runs as postgres so it works on fresh projects. Dashboard fallback if ever
-- needed: Storage -> New bucket -> id `product-images`, Public ON.
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "product-images public read" ON storage.objects;
CREATE POLICY "product-images public read" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "product-images staff insert" ON storage.objects;
CREATE POLICY "product-images staff insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND public.is_staff_or_admin());

DROP POLICY IF EXISTS "product-images staff update" ON storage.objects;
CREATE POLICY "product-images staff update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND public.is_staff_or_admin())
  WITH CHECK (bucket_id = 'product-images' AND public.is_staff_or_admin());

DROP POLICY IF EXISTS "product-images staff delete" ON storage.objects;
CREATE POLICY "product-images staff delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND public.is_staff_or_admin());
