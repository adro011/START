-- brand-store 0003: SECURITY DEFINER RPCs.
-- All functions use SET search_path = '' and schema-qualified tables.

-- create_order(cart, address, coupon, payment) -----------------------------------
-- cart:    jsonb array of {"variant_id": uuid, "qty": int}
-- address: jsonb, must include district (used for the shipping zone);
--          may include name/phone/email/division/area/line1/notes
-- coupon:  code text or null. payment: 'cod' | 'sslcommerz'.
-- Recalculates every price from the DB, validates stock + coupon, picks the
-- shipping zone, decrements stock, writes order + items + event in ONE txn.
CREATE OR REPLACE FUNCTION public.create_order(
  p_cart jsonb,
  p_address jsonb,
  p_coupon text,
  p_payment text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_elem jsonb;
  v_variant_id uuid;
  v_qty integer;
  v_stock integer;
  v_override integer;
  v_price integer;
  v_unit integer;
  v_prod_active boolean;
  v_prod_deleted timestamptz;
  v_prod_name text;
  v_size text;
  v_color text;
  v_img text;
  v_lines jsonb := '[]'::jsonb;
  v_subtotal integer := 0;
  v_discount integer := 0;
  v_free_ship boolean := false;
  v_c_type text;
  v_c_value integer;
  v_c_min integer;
  v_c_starts timestamptz;
  v_c_ends timestamptz;
  v_c_limit integer;
  v_c_used integer;
  v_c_active boolean;
  v_district text;
  v_fee integer;
  v_free_over integer;
  v_shipping integer := 0;
  v_total integer;
  v_order_id uuid;
  v_order_no text;
  v_coupon_code text := NULLIF(btrim(coalesce(p_coupon, '')), '');
BEGIN
  IF p_payment NOT IN ('cod', 'sslcommerz') THEN
    RAISE EXCEPTION 'Invalid payment method';
  END IF;
  IF p_cart IS NULL OR jsonb_typeof(p_cart) <> 'array' OR jsonb_array_length(p_cart) = 0 THEN
    RAISE EXCEPTION 'Cart is empty';
  END IF;
  IF p_address IS NULL OR coalesce(p_address->>'district', '') = '' THEN
    RAISE EXCEPTION 'Address district is required';
  END IF;

  -- One pass: validate, price from DB, decrement stock, collect lines.
  FOR v_elem IN SELECT * FROM jsonb_array_elements(p_cart) LOOP
    BEGIN
      v_variant_id := (v_elem->>'variant_id')::uuid;
      v_qty := (v_elem->>'qty')::integer;
    EXCEPTION WHEN OTHERS THEN
      RAISE EXCEPTION 'Invalid cart line: %', v_elem;
    END;
    IF v_qty IS NULL OR v_qty < 1 THEN
      RAISE EXCEPTION 'Invalid qty for variant %', v_variant_id;
    END IF;

    SELECT v.stock, v.price_override_paisa, p.price_paisa,
           p.active, p.deleted_at, p.name, v.size, v.color
      INTO v_stock, v_override, v_price, v_prod_active,
           v_prod_deleted, v_prod_name, v_size, v_color
      FROM public.product_variants v
      JOIN public.products p ON p.id = v.product_id
     WHERE v.id = v_variant_id
     FOR UPDATE OF v;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Variant not found: %', v_variant_id;
    END IF;
    IF NOT v_prod_active OR v_prod_deleted IS NOT NULL THEN
      RAISE EXCEPTION 'Product is not available: %', v_prod_name;
    END IF;

    v_unit := coalesce(v_override, v_price);

    UPDATE public.product_variants
       SET stock = stock - v_qty
     WHERE id = v_variant_id AND stock >= v_qty;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Insufficient stock for %', v_prod_name;
    END IF;

    SELECT i.path_medium INTO v_img
      FROM public.product_images i
     WHERE i.product_id = (SELECT product_id FROM public.product_variants WHERE id = v_variant_id)
     ORDER BY i.position ASC LIMIT 1;

    v_lines := v_lines || jsonb_build_object(
      'variant_id', v_variant_id,
      'name', v_prod_name,
      'size', v_size,
      'color', v_color,
      'qty', v_qty,
      'unit', v_unit,
      'image', v_img
    );
    v_subtotal := v_subtotal + v_unit * v_qty;
  END LOOP;

  -- Coupon ----------------------------------------------------------------------
  IF v_coupon_code IS NOT NULL THEN
    SELECT c.type, c.value, c.min_subtotal_paisa, c.starts_at, c.ends_at,
           c.usage_limit, c.used_count, c.active
      INTO v_c_type, v_c_value, v_c_min, v_c_starts, v_c_ends,
           v_c_limit, v_c_used, v_c_active
      FROM public.coupons c
     WHERE c.code = v_coupon_code
     FOR UPDATE;
    IF NOT FOUND OR NOT v_c_active THEN
      RAISE EXCEPTION 'Invalid or inactive coupon';
    END IF;
    IF v_c_starts IS NOT NULL AND now() < v_c_starts THEN
      RAISE EXCEPTION 'Coupon is not active yet';
    END IF;
    IF v_c_ends IS NOT NULL AND now() > v_c_ends THEN
      RAISE EXCEPTION 'Coupon has expired';
    END IF;
    IF v_c_limit IS NOT NULL AND v_c_used >= v_c_limit THEN
      RAISE EXCEPTION 'Coupon usage limit reached';
    END IF;
    IF v_subtotal < v_c_min THEN
      RAISE EXCEPTION 'Coupon requires a minimum subtotal of %', v_c_min;
    END IF;
    IF v_c_type = 'percent' THEN
      v_discount := (v_subtotal * v_c_value) / 100;
    ELSIF v_c_type = 'fixed' THEN
      v_discount := LEAST(v_c_value, v_subtotal);
    ELSIF v_c_type = 'free_shipping' THEN
      v_discount := 0;
      v_free_ship := true;
    END IF;
    UPDATE public.coupons SET used_count = used_count + 1 WHERE code = v_coupon_code;
  END IF;

  -- Shipping zone by district, fallback to Outside Dhaka -------------------------
  v_district := btrim(p_address->>'district');
  SELECT z.fee_paisa, z.free_over_paisa INTO v_fee, v_free_over
    FROM public.shipping_zones z
   WHERE v_district = ANY (z.districts)
   ORDER BY z.name ASC LIMIT 1;
  IF NOT FOUND THEN
    SELECT z.fee_paisa, z.free_over_paisa INTO v_fee, v_free_over
      FROM public.shipping_zones z
     WHERE z.name = 'Outside Dhaka'
     ORDER BY z.name ASC LIMIT 1;
  END IF;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No shipping zone available';
  END IF;
  IF v_free_ship OR (v_free_over IS NOT NULL AND (v_subtotal - v_discount) >= v_free_over) THEN
    v_shipping := 0;
  ELSE
    v_shipping := v_fee;
  END IF;

  v_total := v_subtotal - v_discount + v_shipping;

  -- Write order -------------------------------------------------------------------
  v_order_no := 'BR-' || nextval('public.order_no_seq')::text;
  v_order_id := gen_random_uuid();

  INSERT INTO public.orders (
    id, order_no, user_id, guest_email, guest_phone, status,
    payment_method, payment_status, subtotal_paisa, discount_paisa,
    shipping_paisa, total_paisa, coupon_code, address
  ) VALUES (
    v_order_id, v_order_no, v_user_id,
    NULLIF(p_address->>'email', ''), NULLIF(p_address->>'phone', ''),
    'pending', p_payment, 'unpaid',
    v_subtotal, v_discount, v_shipping, v_total, v_coupon_code, p_address
  );

  INSERT INTO public.order_items (
    order_id, variant_id, name_snapshot, size, color, qty, unit_price_paisa, image_snapshot
  )
  SELECT v_order_id,
         (l->>'variant_id')::uuid,
         l->>'name', l->>'size', l->>'color',
         (l->>'qty')::integer, (l->>'unit')::integer, l->>'image'
    FROM jsonb_array_elements(v_lines) AS l;

  INSERT INTO public.order_events (order_id, status, note, actor)
  VALUES (v_order_id, 'pending', 'Order placed', coalesce(v_user_id::text, 'guest'));

  RETURN jsonb_build_object('id', v_order_id, 'order_no', v_order_no, 'total_paisa', v_total);
END;
$$;

-- search_products(q, section, limit) ----------------------------------------------
-- Full-text match first, trigram similarity fallback for typos.
CREATE OR REPLACE FUNCTION public.search_products(
  q text DEFAULT '',
  p_section text DEFAULT NULL,
  p_limit integer DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  slug text,
  name text,
  price_paisa integer,
  rank real
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT p.id, p.slug, p.name, p.price_paisa,
         (
           ts_rank(p.search, plainto_tsquery('english', q)) * 2
           + public.similarity(p.name, coalesce(q, ''))
         )::real AS rank
    FROM public.products p
   WHERE p.active = true
     AND p.deleted_at IS NULL
     AND (p_section IS NULL OR p.section = p_section)
     AND (
       q IS NULL OR btrim(q) = ''
       OR p.search @@ plainto_tsquery('english', q)
       OR public.similarity(p.name, q) > 0.15
       OR p.name ILIKE '%' || q || '%'
     )
   ORDER BY rank DESC, p.name ASC
   LIMIT LEAST(coalesce(p_limit, 20), 100);
$$;

-- adjust_stock(variant, delta): staff/admin only -----------------------------------
CREATE OR REPLACE FUNCTION public.adjust_stock(
  p_variant uuid,
  p_delta integer
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_new integer;
  v_exists boolean;
BEGIN
  IF NOT public.is_staff_or_admin() THEN
    RAISE EXCEPTION 'Forbidden: staff only';
  END IF;
  UPDATE public.product_variants
     SET stock = stock + p_delta
   WHERE id = p_variant AND stock + p_delta >= 0
  RETURNING stock INTO v_new;
  IF FOUND THEN
    INSERT INTO public.audit_log (actor, action, entity, entity_id, diff)
    VALUES (auth.uid(), 'adjust_stock', 'product_variant', p_variant::text,
            jsonb_build_object('delta', p_delta, 'new_stock', v_new));
    RETURN v_new;
  END IF;
  SELECT EXISTS (SELECT 1 FROM public.product_variants WHERE id = p_variant) INTO v_exists;
  IF NOT v_exists THEN
    RAISE EXCEPTION 'Variant not found';
  END IF;
  RAISE EXCEPTION 'Stock cannot go negative';
END;
$$;

-- cancel_order(order): restores stock, valid transitions only ----------------------
CREATE OR REPLACE FUNCTION public.cancel_order(
  p_order uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_o public.orders%ROWTYPE;
  v_actor text := coalesce(auth.uid()::text, 'guest');
BEGIN
  SELECT * INTO v_o FROM public.orders WHERE id = p_order FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;
  IF v_o.user_id IS NULL THEN
    -- Guest order: only staff/admin may cancel (no owner session to check).
    IF NOT public.is_staff_or_admin() THEN
      RAISE EXCEPTION 'Forbidden';
    END IF;
  ELSIF v_o.user_id IS DISTINCT FROM auth.uid() AND NOT public.is_staff_or_admin() THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  IF v_o.status NOT IN ('pending', 'confirmed') THEN
    RAISE EXCEPTION 'Cannot cancel order in status %', v_o.status;
  END IF;

  UPDATE public.product_variants v
     SET stock = v.stock + i.qty
    FROM public.order_items i
   WHERE i.order_id = p_order AND v.id = i.variant_id;

  UPDATE public.orders SET status = 'cancelled' WHERE id = p_order;

  INSERT INTO public.order_events (order_id, status, note, actor)
  VALUES (p_order, 'cancelled', 'Order cancelled, stock restored', v_actor);

  IF v_o.coupon_code IS NOT NULL THEN
    UPDATE public.coupons
       SET used_count = GREATEST(used_count - 1, 0)
     WHERE code = v_o.coupon_code;
  END IF;

  RETURN jsonb_build_object('id', p_order, 'status', 'cancelled');
END;
$$;
