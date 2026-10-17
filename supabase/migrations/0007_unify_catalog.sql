-- brand-store 0007: unify catalog — DB adopts the TS storefront catalog.
-- Why: checkout tryLiveOrder resolves cart SKUs against product_variants;
-- with 0/192 SKU overlap every storefront cart silently fell back to the
-- demo repricer and /product/<ts-slug> 404'd whenever live rows existed.
-- After this migration SLUG overlap = 24/24 and SKU overlap = 192/192.
--
-- CAUTION: deletes demo rows (variants/images cascade). Wipe test orders
-- first (see DECISIONS): DELETE FROM orders WHERE guest_phone LIKE '017%';
-- (adjust to the e2e test number) — 0004 seed comment already blesses
-- DELETE FROM products WHERE slug LIKE 'demo-%'.

-- 1. Coupon parity with src/lib/coupons.ts (unit tests pin these rules) -----
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS max_discount_paisa integer;

INSERT INTO public.coupons
  (code, type, value, min_subtotal_paisa, max_discount_paisa, starts_at, ends_at, usage_limit, used_count, active)
VALUES
  ('WELCOME10', 'percent', 10, 100000, 50000,
   '2025-01-01T00:00:00+06:00', '2030-12-31T23:59:59+06:00', 5000, 0, true),
  ('FREESHIP', 'free_shipping', 0, 50000, NULL,
   '2025-01-01T00:00:00+06:00', '2030-12-31T23:59:59+06:00', NULL, 0, true)
ON CONFLICT (code) DO UPDATE SET
  type = EXCLUDED.type, value = EXCLUDED.value,
  min_subtotal_paisa = EXCLUDED.min_subtotal_paisa,
  max_discount_paisa = EXCLUDED.max_discount_paisa,
  starts_at = EXCLUDED.starts_at, ends_at = EXCLUDED.ends_at,
  usage_limit = EXCLUDED.usage_limit, active = EXCLUDED.active;

-- 2. create_order with max-discount cap (surgically patched 0003 text) ---
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
  v_c_max integer;
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
           c.usage_limit, c.used_count, c.active,
           c.max_discount_paisa
      INTO v_c_type, v_c_value, v_c_min, v_c_starts, v_c_ends,
           v_c_limit, v_c_used, v_c_active,
           v_c_max
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
      v_discount := LEAST((v_subtotal * v_c_value) / 100, COALESCE(v_c_max, v_subtotal), v_subtotal);
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
  v_order_id := public.gen_random_uuid();

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

-- 3. Replace demo-* products with the TS storefront catalog -----------
DELETE FROM public.products WHERE slug LIKE 'demo-%';

INSERT INTO public.products (
  slug, name, name_bn, description, section, category_id,
  price_paisa, compare_at_paisa, fabric, care, fit_notes, is_new, is_sale, is_featured, active
)
SELECT v.slug, v.name, v.name, v.description, v.section, c.id,
       v.price_paisa, v.compare_at_paisa, v.fabric, v.care, v.fit_notes,
       v.is_new, v.is_sale, v.is_featured, true
FROM (VALUES
  ('classic-cotton-panjabi-white', 'Classic Cotton Panjabi — White',
   'Everyday premium cotton panjabi with metal buttons, side slits and a structured band collar. Breathable weave for Jummah, office and Eid.',
   'men', 'men-panjabi', 249000, 299000, '100% premium cotton, 140 GSM',
   'Machine wash cold, hang dry in shade, warm iron.', 'Regular fit. Model is 5''9" and wears size M.', true, true, true),
  ('premium-silk-panjabi-maroon', 'Premium Silk Panjabi — Maroon',
   'Festive silk-blend panjabi with subtle self-jacquard, wooden buttons and contrast piping. Made for weddings and Eid mornings.',
   'men', 'men-panjabi', 499000, 599000, 'Silk–cotton blend, artisanal finish',
   'Dry clean recommended. Cool iron inside out.', 'Slim-regular fit with extra shoulder room.', false, true, true),
  ('addi-panjabi-sky', 'Addi Panjabi — Sky',
   'Featherlight Addi cotton panjabi with snap buttons. Coolest pick for summer prayers and all-day wear.',
   'men', 'men-panjabi', 329000, NULL::integer, 'Addi voile cotton',
   'Gentle machine wash, line dry.', '', true, false, false),
  ('endi-fatua-natural', 'Endi Fatua — Natural',
   'Handloom Endi fatua with wooden toggles. Textured, breathable, proudly heritage.',
   'men', 'men-fatua', 189000, NULL::integer, 'Handloom Endi cotton',
   'Hand wash cold with mild detergent.', '', false, false, false),
  ('slim-chino-trousers-khaki', 'Slim Chinos — Khaki',
   'Stretch twill chinos with clean tapered leg. Office to dawat without a change.',
   'men', 'men-trousers', 179000, 229000, 'Cotton twill with 2% elastane',
   'Machine wash, tumble low.', 'Slim fit, mid-rise. Take usual size.', false, true, false),
  ('executive-shirt-lightblue', 'Executive Shirt — Light Blue',
   'Wrinkle-resistant poplin shirt with reinforced collar. Boardroom ready.',
   'men', 'men-shirts', 159000, NULL::integer, 'Cotton poplin, easy-iron',
   'Machine wash, warm iron.', '', true, false, false),
  ('taaga-coaty-charcoal', 'Taaga Coaty — Charcoal',
   'Structured sleeveless coaty to layer over any panjabi. Instant wedding-guest upgrade.',
   'men', 'men-coaty', 359000, NULL::integer, 'Matte suiting blend',
   'Dry clean only.', '', false, false, true),
  ('comfort-lungi-check', 'Comfort Lungi — Green Check',
   'Soft combed-cotton lungi with colourfast checks. Home essential.',
   'men', 'men-lungi', 99000, 129000, '100% combed cotton',
   'Machine wash cold, sun dry.', '', false, true, false),
  ('muslin-sharee-rose', 'Muslin Sharee — Rose',
   'Whisper-light muslin sharee with hand-finished edge and unstitched blouse piece. Drapes like a dream for Eid and weddings.',
   'women', 'women-sharee', 549000, NULL::integer, 'Pure muslin, blouse piece included',
   'Dry clean recommended, store folded in muslin cloth.', '', true, false, true),
  ('jamdani-sharee-emerald', 'Jamdani Sharee — Emerald',
   'Heritage Jamdani with discontinuous-weave motifs. A keeper piece woven in Demra tradition.',
   'women', 'women-sharee', 899000, NULL::integer, 'Fine cotton-silk Jamdani',
   'Dry clean only. Kata wash by specialist as needed.', '', false, false, true),
  ('lawn-3pcs-mint', 'Lawn 3Pcs — Mint',
   'Premium lawn kameez with embroidered neckline, straight pajama and chiffon dupatta. Everyday elegance.',
   'women', 'women-sets', 299000, 359000, 'Swiss lawn + chiffon dupatta',
   'Gentle wash, dry in shade.', '', false, true, false),
  ('cord-set-lavender', 'Cord-Set — Lavender',
   'Relaxed co-ord set: boxy shirt + wide-leg trouser. Airport, brunch, repeat.',
   'women', 'women-sets', 249000, NULL::integer, 'Crepe blend, no iron needed',
   'Machine wash, hang dry.', '', true, false, false),
  ('long-tunic-terracotta', 'Long Tunic — Terracotta',
   'A-line long tunic with side slits and wooden buttons. Pairs with jeans or straight pants.',
   'women', 'women-tunic', 199000, NULL::integer, 'Yarn-dyed cotton',
   'Machine wash cold.', '', false, false, false),
  ('georgette-gown-midnight', 'Georgette Gown — Midnight',
   'Flowing georgette gown with inner slip and belt. Evening-ready in one step.',
   'women', 'women-gown', 449000, 529000, 'Georgette with crepe lining',
   'Dry clean recommended.', '', false, true, false),
  ('casual-tops-floral', 'Casual Top — Floral',
   'Soft rayon top with all-over floral print and smocked back. University-to-outing staple.',
   'women', 'women-tops', 129000, NULL::integer, 'Viscose rayon',
   'Gentle wash.', '', true, false, false),
  ('ladies-blazer-sand', 'Ladies Blazer — Sand',
   'Single-breasted blazer with soft shoulder. Sharp over sharee-blouse or shirt.',
   'women', 'women-blazer', 399000, NULL::integer, 'Poly-viscose suiting',
   'Dry clean only.', '', true, false, true),
  ('boys-kabli-mustard', 'Boys Kabli — Mustard',
   'Mini kabli set with pajama. Soft cotton so he can run, jump and sit through the dawat.',
   'kids', 'kids-boys', 149000, NULL::integer, 'Soft cotton, elastic pajama',
   'Machine wash.', '', true, false, true),
  ('boys-panjabi-cream', 'Boys Panjabi — Cream',
   'Classic boys panjabi with snap buttons at the back — easy change, no fuss.',
   'kids', 'kids-boys', 139000, NULL::integer, 'Cotton blend',
   'Machine wash.', '', false, false, false),
  ('boys-denim-set-indigo', 'Boys Denim Set — Indigo',
   'Denim shirt + jogger set with grow-room. Playground proof.',
   'kids', 'kids-boys', 189000, 229000, 'Soft denim + jersey',
   'Machine wash inside out.', '', false, true, false),
  ('girls-3pcs-peach', 'Girls 3Pcs — Peach',
   'Frock-style kameez with churidar and net dupatta. Twirl-approved for Eid.',
   'kids', 'kids-girls', 179000, NULL::integer, 'Georgette + cotton lining',
   'Gentle wash.', '', true, false, false),
  ('girls-2pcs-sky', 'Girls 2Pcs — Sky',
   'Printed tunic + pajama set in breathable cotton. School-to-play in comfort.',
   'kids', 'kids-girls', 159000, NULL::integer, '100% cotton',
   'Machine wash.', '', false, false, false),
  ('girls-jumpsuit-coral', 'Girls Jumpsuit — Coral',
   'One-and-done jumpsuit with tie waist and pockets for treasures.',
   'kids', 'kids-girls', 149000, 189000, 'Rayon twill',
   'Machine wash.', '', false, true, false),
  ('kids-tee-duo-mint', 'Kids Tee Duo — Mint / White',
   'Pack of 2 soft jersey tees. Tagless, itch-free, playground ready.',
   'kids', 'kids-boys', 99000, NULL::integer, 'Cotton jersey 180 GSM',
   'Machine wash.', '', false, false, false),
  ('girls-top-yellow', 'Girls Top — Sunny Yellow',
   'Puff-sleeve top with smocked waist. Sunshine, wearable.',
   'kids', 'kids-girls', 89000, NULL::integer, 'Cotton poplin',
   'Gentle wash.', '', true, false, false)
) AS v(slug, name, description, section, cat_slug, price_paisa,
        compare_at_paisa, fabric, care, fit_notes, is_new, is_sale, is_featured)
JOIN public.categories c ON c.slug = v.cat_slug
ON CONFLICT (slug) DO NOTHING;

-- 4. Exact TS variant SKUs (this flips tryLiveOrder from null to live) --------
INSERT INTO public.product_variants
  (product_id, sku, size, color, color_hex, stock, price_override_paisa)
SELECT p.id, v.sku, v.size, v.color, v.color_hex, v.stock, NULL
FROM (VALUES
  ('classic-cotton-panjabi-white', 'DEMO-PANJABI01-WHI-S', 'S', 'White', '#f5f5f4', 0),
  ('classic-cotton-panjabi-white', 'DEMO-PANJABI01-ECR-S', 'S', 'Ecru', '#e7dcc8', 7),
  ('classic-cotton-panjabi-white', 'DEMO-PANJABI01-WHI-M', 'M', 'White', '#f5f5f4', 1),
  ('classic-cotton-panjabi-white', 'DEMO-PANJABI01-ECR-M', 'M', 'Ecru', '#e7dcc8', 8),
  ('classic-cotton-panjabi-white', 'DEMO-PANJABI01-WHI-L', 'L', 'White', '#f5f5f4', 2),
  ('classic-cotton-panjabi-white', 'DEMO-PANJABI01-ECR-L', 'L', 'Ecru', '#e7dcc8', 9),
  ('classic-cotton-panjabi-white', 'DEMO-PANJABI01-WHI-XL', 'XL', 'White', '#f5f5f4', 3),
  ('classic-cotton-panjabi-white', 'DEMO-PANJABI01-ECR-XL', 'XL', 'Ecru', '#e7dcc8', 10),
  ('premium-silk-panjabi-maroon', 'DEMO-SILK02-MAR-S', 'S', 'Maroon', '#7f1d1d', 3),
  ('premium-silk-panjabi-maroon', 'DEMO-SILK02-NAV-S', 'S', 'Navy', '#1e3a5f', 10),
  ('premium-silk-panjabi-maroon', 'DEMO-SILK02-MAR-M', 'M', 'Maroon', '#7f1d1d', 4),
  ('premium-silk-panjabi-maroon', 'DEMO-SILK02-NAV-M', 'M', 'Navy', '#1e3a5f', 11),
  ('premium-silk-panjabi-maroon', 'DEMO-SILK02-MAR-L', 'L', 'Maroon', '#7f1d1d', 5),
  ('premium-silk-panjabi-maroon', 'DEMO-SILK02-NAV-L', 'L', 'Navy', '#1e3a5f', 12),
  ('premium-silk-panjabi-maroon', 'DEMO-SILK02-MAR-XL', 'XL', 'Maroon', '#7f1d1d', 6),
  ('premium-silk-panjabi-maroon', 'DEMO-SILK02-NAV-XL', 'XL', 'Navy', '#1e3a5f', 0),
  ('addi-panjabi-sky', 'DEMO-ADDI03-SKY-S', 'S', 'Sky', '#bae6fd', 2),
  ('addi-panjabi-sky', 'DEMO-ADDI03-MIN-S', 'S', 'Mint', '#a7f3d0', 9),
  ('addi-panjabi-sky', 'DEMO-ADDI03-SKY-M', 'M', 'Sky', '#bae6fd', 3),
  ('addi-panjabi-sky', 'DEMO-ADDI03-MIN-M', 'M', 'Mint', '#a7f3d0', 10),
  ('addi-panjabi-sky', 'DEMO-ADDI03-SKY-L', 'L', 'Sky', '#bae6fd', 4),
  ('addi-panjabi-sky', 'DEMO-ADDI03-MIN-L', 'L', 'Mint', '#a7f3d0', 11),
  ('addi-panjabi-sky', 'DEMO-ADDI03-SKY-XL', 'XL', 'Sky', '#bae6fd', 5),
  ('addi-panjabi-sky', 'DEMO-ADDI03-MIN-XL', 'XL', 'Mint', '#a7f3d0', 12),
  ('endi-fatua-natural', 'DEMO-FATUA04-NAT-S', 'S', 'Natural', '#d6c7a8', 4),
  ('endi-fatua-natural', 'DEMO-FATUA04-OLI-S', 'S', 'Olive', '#7e9181', 11),
  ('endi-fatua-natural', 'DEMO-FATUA04-NAT-M', 'M', 'Natural', '#d6c7a8', 5),
  ('endi-fatua-natural', 'DEMO-FATUA04-OLI-M', 'M', 'Olive', '#7e9181', 12),
  ('endi-fatua-natural', 'DEMO-FATUA04-NAT-L', 'L', 'Natural', '#d6c7a8', 6),
  ('endi-fatua-natural', 'DEMO-FATUA04-OLI-L', 'L', 'Olive', '#7e9181', 0),
  ('endi-fatua-natural', 'DEMO-FATUA04-NAT-XL', 'XL', 'Natural', '#d6c7a8', 7),
  ('endi-fatua-natural', 'DEMO-FATUA04-OLI-XL', 'XL', 'Olive', '#7e9181', 1),
  ('slim-chino-trousers-khaki', 'DEMO-CHINO05-KHA-S', 'S', 'Khaki', '#c2a878', 3),
  ('slim-chino-trousers-khaki', 'DEMO-CHINO05-CHA-S', 'S', 'Charcoal', '#374151', 10),
  ('slim-chino-trousers-khaki', 'DEMO-CHINO05-KHA-M', 'M', 'Khaki', '#c2a878', 4),
  ('slim-chino-trousers-khaki', 'DEMO-CHINO05-CHA-M', 'M', 'Charcoal', '#374151', 11),
  ('slim-chino-trousers-khaki', 'DEMO-CHINO05-KHA-L', 'L', 'Khaki', '#c2a878', 5),
  ('slim-chino-trousers-khaki', 'DEMO-CHINO05-CHA-L', 'L', 'Charcoal', '#374151', 12),
  ('slim-chino-trousers-khaki', 'DEMO-CHINO05-KHA-XL', 'XL', 'Khaki', '#c2a878', 6),
  ('slim-chino-trousers-khaki', 'DEMO-CHINO05-CHA-XL', 'XL', 'Charcoal', '#374151', 0),
  ('executive-shirt-lightblue', 'DEMO-SHIRT06-LIG-S', 'S', 'Light Blue', '#bfdbfe', 2),
  ('executive-shirt-lightblue', 'DEMO-SHIRT06-WHI-S', 'S', 'White', '#ffffff', 9),
  ('executive-shirt-lightblue', 'DEMO-SHIRT06-LIG-M', 'M', 'Light Blue', '#bfdbfe', 3),
  ('executive-shirt-lightblue', 'DEMO-SHIRT06-WHI-M', 'M', 'White', '#ffffff', 10),
  ('executive-shirt-lightblue', 'DEMO-SHIRT06-LIG-L', 'L', 'Light Blue', '#bfdbfe', 4),
  ('executive-shirt-lightblue', 'DEMO-SHIRT06-WHI-L', 'L', 'White', '#ffffff', 11),
  ('executive-shirt-lightblue', 'DEMO-SHIRT06-LIG-XL', 'XL', 'Light Blue', '#bfdbfe', 5),
  ('executive-shirt-lightblue', 'DEMO-SHIRT06-WHI-XL', 'XL', 'White', '#ffffff', 12),
  ('taaga-coaty-charcoal', 'DEMO-COATY07-CHA-S', 'S', 'Charcoal', '#374151', 1),
  ('taaga-coaty-charcoal', 'DEMO-COATY07-BEI-S', 'S', 'Beige', '#e5d5b8', 8),
  ('taaga-coaty-charcoal', 'DEMO-COATY07-CHA-M', 'M', 'Charcoal', '#374151', 2),
  ('taaga-coaty-charcoal', 'DEMO-COATY07-BEI-M', 'M', 'Beige', '#e5d5b8', 9),
  ('taaga-coaty-charcoal', 'DEMO-COATY07-CHA-L', 'L', 'Charcoal', '#374151', 3),
  ('taaga-coaty-charcoal', 'DEMO-COATY07-BEI-L', 'L', 'Beige', '#e5d5b8', 10),
  ('taaga-coaty-charcoal', 'DEMO-COATY07-CHA-XL', 'XL', 'Charcoal', '#374151', 4),
  ('taaga-coaty-charcoal', 'DEMO-COATY07-BEI-XL', 'XL', 'Beige', '#e5d5b8', 11),
  ('comfort-lungi-check', 'DEMO-LUNGI08-GRE-S', 'S', 'Green Check', '#4d7c0f', 0),
  ('comfort-lungi-check', 'DEMO-LUNGI08-BLU-S', 'S', 'Blue Check', '#1e40af', 7),
  ('comfort-lungi-check', 'DEMO-LUNGI08-GRE-M', 'M', 'Green Check', '#4d7c0f', 1),
  ('comfort-lungi-check', 'DEMO-LUNGI08-BLU-M', 'M', 'Blue Check', '#1e40af', 8),
  ('comfort-lungi-check', 'DEMO-LUNGI08-GRE-L', 'L', 'Green Check', '#4d7c0f', 2),
  ('comfort-lungi-check', 'DEMO-LUNGI08-BLU-L', 'L', 'Blue Check', '#1e40af', 9),
  ('comfort-lungi-check', 'DEMO-LUNGI08-GRE-XL', 'XL', 'Green Check', '#4d7c0f', 3),
  ('comfort-lungi-check', 'DEMO-LUNGI08-BLU-XL', 'XL', 'Blue Check', '#1e40af', 10),
  ('muslin-sharee-rose', 'DEMO-SHAREE09-ROS-S', 'S', 'Rose', '#f2ccc3', 10),
  ('muslin-sharee-rose', 'DEMO-SHAREE09-IVO-S', 'S', 'Ivory', '#faf7f2', 4),
  ('muslin-sharee-rose', 'DEMO-SHAREE09-ROS-M', 'M', 'Rose', '#f2ccc3', 11),
  ('muslin-sharee-rose', 'DEMO-SHAREE09-IVO-M', 'M', 'Ivory', '#faf7f2', 5),
  ('muslin-sharee-rose', 'DEMO-SHAREE09-ROS-L', 'L', 'Rose', '#f2ccc3', 12),
  ('muslin-sharee-rose', 'DEMO-SHAREE09-IVO-L', 'L', 'Ivory', '#faf7f2', 6),
  ('muslin-sharee-rose', 'DEMO-SHAREE09-ROS-XL', 'XL', 'Rose', '#f2ccc3', 0),
  ('muslin-sharee-rose', 'DEMO-SHAREE09-IVO-XL', 'XL', 'Ivory', '#faf7f2', 7),
  ('jamdani-sharee-emerald', 'DEMO-JAMD10-EME-S', 'S', 'Emerald', '#065f46', 3),
  ('jamdani-sharee-emerald', 'DEMO-JAMD10-CRI-S', 'S', 'Crimson', '#991b1b', 10),
  ('jamdani-sharee-emerald', 'DEMO-JAMD10-EME-M', 'M', 'Emerald', '#065f46', 4),
  ('jamdani-sharee-emerald', 'DEMO-JAMD10-CRI-M', 'M', 'Crimson', '#991b1b', 11),
  ('jamdani-sharee-emerald', 'DEMO-JAMD10-EME-L', 'L', 'Emerald', '#065f46', 5),
  ('jamdani-sharee-emerald', 'DEMO-JAMD10-CRI-L', 'L', 'Crimson', '#991b1b', 12),
  ('jamdani-sharee-emerald', 'DEMO-JAMD10-EME-XL', 'XL', 'Emerald', '#065f46', 6),
  ('jamdani-sharee-emerald', 'DEMO-JAMD10-CRI-XL', 'XL', 'Crimson', '#991b1b', 0),
  ('lawn-3pcs-mint', 'DEMO-LAWN11-MIN-S', 'S', 'Mint', '#a7f3d0', 2),
  ('lawn-3pcs-mint', 'DEMO-LAWN11-PEA-S', 'S', 'Peach', '#fed7aa', 9),
  ('lawn-3pcs-mint', 'DEMO-LAWN11-MIN-M', 'M', 'Mint', '#a7f3d0', 3),
  ('lawn-3pcs-mint', 'DEMO-LAWN11-PEA-M', 'M', 'Peach', '#fed7aa', 10),
  ('lawn-3pcs-mint', 'DEMO-LAWN11-MIN-L', 'L', 'Mint', '#a7f3d0', 4),
  ('lawn-3pcs-mint', 'DEMO-LAWN11-PEA-L', 'L', 'Peach', '#fed7aa', 11),
  ('lawn-3pcs-mint', 'DEMO-LAWN11-MIN-XL', 'XL', 'Mint', '#a7f3d0', 5),
  ('lawn-3pcs-mint', 'DEMO-LAWN11-PEA-XL', 'XL', 'Peach', '#fed7aa', 12),
  ('cord-set-lavender', 'DEMO-CORD12-LAV-S', 'S', 'Lavender', '#ddd6fe', 1),
  ('cord-set-lavender', 'DEMO-CORD12-SAN-S', 'S', 'Sand', '#e7d8b7', 8),
  ('cord-set-lavender', 'DEMO-CORD12-LAV-M', 'M', 'Lavender', '#ddd6fe', 2),
  ('cord-set-lavender', 'DEMO-CORD12-SAN-M', 'M', 'Sand', '#e7d8b7', 9),
  ('cord-set-lavender', 'DEMO-CORD12-LAV-L', 'L', 'Lavender', '#ddd6fe', 3),
  ('cord-set-lavender', 'DEMO-CORD12-SAN-L', 'L', 'Sand', '#e7d8b7', 10),
  ('cord-set-lavender', 'DEMO-CORD12-LAV-XL', 'XL', 'Lavender', '#ddd6fe', 4),
  ('cord-set-lavender', 'DEMO-CORD12-SAN-XL', 'XL', 'Sand', '#e7d8b7', 11),
  ('long-tunic-terracotta', 'DEMO-TUNIC13-TER-S', 'S', 'Terracotta', '#d5573b', 3),
  ('long-tunic-terracotta', 'DEMO-TUNIC13-SAG-S', 'S', 'Sage', '#7e9181', 10),
  ('long-tunic-terracotta', 'DEMO-TUNIC13-TER-M', 'M', 'Terracotta', '#d5573b', 4),
  ('long-tunic-terracotta', 'DEMO-TUNIC13-SAG-M', 'M', 'Sage', '#7e9181', 11),
  ('long-tunic-terracotta', 'DEMO-TUNIC13-TER-L', 'L', 'Terracotta', '#d5573b', 5),
  ('long-tunic-terracotta', 'DEMO-TUNIC13-SAG-L', 'L', 'Sage', '#7e9181', 12),
  ('long-tunic-terracotta', 'DEMO-TUNIC13-TER-XL', 'XL', 'Terracotta', '#d5573b', 6),
  ('long-tunic-terracotta', 'DEMO-TUNIC13-SAG-XL', 'XL', 'Sage', '#7e9181', 0),
  ('georgette-gown-midnight', 'DEMO-GOWN14-MID-S', 'S', 'Midnight', '#172121', 12),
  ('georgette-gown-midnight', 'DEMO-GOWN14-PLU-S', 'S', 'Plum', '#6b21a8', 6),
  ('georgette-gown-midnight', 'DEMO-GOWN14-MID-M', 'M', 'Midnight', '#172121', 0),
  ('georgette-gown-midnight', 'DEMO-GOWN14-PLU-M', 'M', 'Plum', '#6b21a8', 7),
  ('georgette-gown-midnight', 'DEMO-GOWN14-MID-L', 'L', 'Midnight', '#172121', 1),
  ('georgette-gown-midnight', 'DEMO-GOWN14-PLU-L', 'L', 'Plum', '#6b21a8', 8),
  ('georgette-gown-midnight', 'DEMO-GOWN14-MID-XL', 'XL', 'Midnight', '#172121', 2),
  ('georgette-gown-midnight', 'DEMO-GOWN14-PLU-XL', 'XL', 'Plum', '#6b21a8', 9),
  ('casual-tops-floral', 'DEMO-TOP15-FLO-S', 'S', 'Floral Pink', '#f9a8d4', 8),
  ('casual-tops-floral', 'DEMO-TOP15-FLO-S', 'S', 'Floral Blue', '#93c5fd', 2),
  ('casual-tops-floral', 'DEMO-TOP15-FLO-M', 'M', 'Floral Pink', '#f9a8d4', 9),
  ('casual-tops-floral', 'DEMO-TOP15-FLO-M', 'M', 'Floral Blue', '#93c5fd', 3),
  ('casual-tops-floral', 'DEMO-TOP15-FLO-L', 'L', 'Floral Pink', '#f9a8d4', 10),
  ('casual-tops-floral', 'DEMO-TOP15-FLO-L', 'L', 'Floral Blue', '#93c5fd', 4),
  ('casual-tops-floral', 'DEMO-TOP15-FLO-XL', 'XL', 'Floral Pink', '#f9a8d4', 11),
  ('casual-tops-floral', 'DEMO-TOP15-FLO-XL', 'XL', 'Floral Blue', '#93c5fd', 5),
  ('ladies-blazer-sand', 'DEMO-BLAZER16-SAN-S', 'S', 'Sand', '#e7d8b7', 3),
  ('ladies-blazer-sand', 'DEMO-BLAZER16-BLA-S', 'S', 'Black', '#111827', 10),
  ('ladies-blazer-sand', 'DEMO-BLAZER16-SAN-M', 'M', 'Sand', '#e7d8b7', 4),
  ('ladies-blazer-sand', 'DEMO-BLAZER16-BLA-M', 'M', 'Black', '#111827', 11),
  ('ladies-blazer-sand', 'DEMO-BLAZER16-SAN-L', 'L', 'Sand', '#e7d8b7', 5),
  ('ladies-blazer-sand', 'DEMO-BLAZER16-BLA-L', 'L', 'Black', '#111827', 12),
  ('ladies-blazer-sand', 'DEMO-BLAZER16-SAN-XL', 'XL', 'Sand', '#e7d8b7', 6),
  ('ladies-blazer-sand', 'DEMO-BLAZER16-BLA-XL', 'XL', 'Black', '#111827', 0),
  ('boys-kabli-mustard', 'DEMO-KABLI17-MUS-S', 'S', 'Mustard', '#d97706', 7),
  ('boys-kabli-mustard', 'DEMO-KABLI17-TEA-S', 'S', 'Teal', '#0d9488', 1),
  ('boys-kabli-mustard', 'DEMO-KABLI17-MUS-M', 'M', 'Mustard', '#d97706', 8),
  ('boys-kabli-mustard', 'DEMO-KABLI17-TEA-M', 'M', 'Teal', '#0d9488', 2),
  ('boys-kabli-mustard', 'DEMO-KABLI17-MUS-L', 'L', 'Mustard', '#d97706', 9),
  ('boys-kabli-mustard', 'DEMO-KABLI17-TEA-L', 'L', 'Teal', '#0d9488', 3),
  ('boys-kabli-mustard', 'DEMO-KABLI17-MUS-XL', 'XL', 'Mustard', '#d97706', 10),
  ('boys-kabli-mustard', 'DEMO-KABLI17-TEA-XL', 'XL', 'Teal', '#0d9488', 4),
  ('boys-panjabi-cream', 'DEMO-BPANJ18-CRE-S', 'S', 'Cream', '#fef3c7', 6),
  ('boys-panjabi-cream', 'DEMO-BPANJ18-SKY-S', 'S', 'Sky', '#bae6fd', 0),
  ('boys-panjabi-cream', 'DEMO-BPANJ18-CRE-M', 'M', 'Cream', '#fef3c7', 7),
  ('boys-panjabi-cream', 'DEMO-BPANJ18-SKY-M', 'M', 'Sky', '#bae6fd', 1),
  ('boys-panjabi-cream', 'DEMO-BPANJ18-CRE-L', 'L', 'Cream', '#fef3c7', 8),
  ('boys-panjabi-cream', 'DEMO-BPANJ18-SKY-L', 'L', 'Sky', '#bae6fd', 2),
  ('boys-panjabi-cream', 'DEMO-BPANJ18-CRE-XL', 'XL', 'Cream', '#fef3c7', 9),
  ('boys-panjabi-cream', 'DEMO-BPANJ18-SKY-XL', 'XL', 'Sky', '#bae6fd', 3),
  ('boys-denim-set-indigo', 'DEMO-BDEN19-IND-S', 'S', 'Indigo', '#3730a3', 2),
  ('boys-denim-set-indigo', 'DEMO-BDEN19-STO-S', 'S', 'Stone', '#a8a29e', 9),
  ('boys-denim-set-indigo', 'DEMO-BDEN19-IND-M', 'M', 'Indigo', '#3730a3', 3),
  ('boys-denim-set-indigo', 'DEMO-BDEN19-STO-M', 'M', 'Stone', '#a8a29e', 10),
  ('boys-denim-set-indigo', 'DEMO-BDEN19-IND-L', 'L', 'Indigo', '#3730a3', 4),
  ('boys-denim-set-indigo', 'DEMO-BDEN19-STO-L', 'L', 'Stone', '#a8a29e', 11),
  ('boys-denim-set-indigo', 'DEMO-BDEN19-IND-XL', 'XL', 'Indigo', '#3730a3', 5),
  ('boys-denim-set-indigo', 'DEMO-BDEN19-STO-XL', 'XL', 'Stone', '#a8a29e', 12),
  ('girls-3pcs-peach', 'DEMO-G3PCS20-PEA-S', 'S', 'Peach', '#fed7aa', 4),
  ('girls-3pcs-peach', 'DEMO-G3PCS20-MIN-S', 'S', 'Mint', '#a7f3d0', 11),
  ('girls-3pcs-peach', 'DEMO-G3PCS20-PEA-M', 'M', 'Peach', '#fed7aa', 5),
  ('girls-3pcs-peach', 'DEMO-G3PCS20-MIN-M', 'M', 'Mint', '#a7f3d0', 12),
  ('girls-3pcs-peach', 'DEMO-G3PCS20-PEA-L', 'L', 'Peach', '#fed7aa', 6),
  ('girls-3pcs-peach', 'DEMO-G3PCS20-MIN-L', 'L', 'Mint', '#a7f3d0', 0),
  ('girls-3pcs-peach', 'DEMO-G3PCS20-PEA-XL', 'XL', 'Peach', '#fed7aa', 7),
  ('girls-3pcs-peach', 'DEMO-G3PCS20-MIN-XL', 'XL', 'Mint', '#a7f3d0', 1),
  ('girls-2pcs-sky', 'DEMO-G2PCS21-SKY-S', 'S', 'Sky', '#bae6fd', 3),
  ('girls-2pcs-sky', 'DEMO-G2PCS21-LEM-S', 'S', 'Lemon', '#fef08a', 10),
  ('girls-2pcs-sky', 'DEMO-G2PCS21-SKY-M', 'M', 'Sky', '#bae6fd', 4),
  ('girls-2pcs-sky', 'DEMO-G2PCS21-LEM-M', 'M', 'Lemon', '#fef08a', 11),
  ('girls-2pcs-sky', 'DEMO-G2PCS21-SKY-L', 'L', 'Sky', '#bae6fd', 5),
  ('girls-2pcs-sky', 'DEMO-G2PCS21-LEM-L', 'L', 'Lemon', '#fef08a', 12),
  ('girls-2pcs-sky', 'DEMO-G2PCS21-SKY-XL', 'XL', 'Sky', '#bae6fd', 6),
  ('girls-2pcs-sky', 'DEMO-G2PCS21-LEM-XL', 'XL', 'Lemon', '#fef08a', 0),
  ('girls-jumpsuit-coral', 'DEMO-GJUMP22-COR-S', 'S', 'Coral', '#fb7185', 2),
  ('girls-jumpsuit-coral', 'DEMO-GJUMP22-DEN-S', 'S', 'Denim Blue', '#60a5fa', 9),
  ('girls-jumpsuit-coral', 'DEMO-GJUMP22-COR-M', 'M', 'Coral', '#fb7185', 3),
  ('girls-jumpsuit-coral', 'DEMO-GJUMP22-DEN-M', 'M', 'Denim Blue', '#60a5fa', 10),
  ('girls-jumpsuit-coral', 'DEMO-GJUMP22-COR-L', 'L', 'Coral', '#fb7185', 4),
  ('girls-jumpsuit-coral', 'DEMO-GJUMP22-DEN-L', 'L', 'Denim Blue', '#60a5fa', 11),
  ('girls-jumpsuit-coral', 'DEMO-GJUMP22-COR-XL', 'XL', 'Coral', '#fb7185', 5),
  ('girls-jumpsuit-coral', 'DEMO-GJUMP22-DEN-XL', 'XL', 'Denim Blue', '#60a5fa', 12),
  ('kids-tee-duo-mint', 'DEMO-KTEE23-MIN-S', 'S', 'Mint', '#a7f3d0', 11),
  ('kids-tee-duo-mint', 'DEMO-KTEE23-WHI-S', 'S', 'White', '#ffffff', 5),
  ('kids-tee-duo-mint', 'DEMO-KTEE23-MIN-M', 'M', 'Mint', '#a7f3d0', 12),
  ('kids-tee-duo-mint', 'DEMO-KTEE23-WHI-M', 'M', 'White', '#ffffff', 6),
  ('kids-tee-duo-mint', 'DEMO-KTEE23-MIN-L', 'L', 'Mint', '#a7f3d0', 0),
  ('kids-tee-duo-mint', 'DEMO-KTEE23-WHI-L', 'L', 'White', '#ffffff', 7),
  ('kids-tee-duo-mint', 'DEMO-KTEE23-MIN-XL', 'XL', 'Mint', '#a7f3d0', 1),
  ('kids-tee-duo-mint', 'DEMO-KTEE23-WHI-XL', 'XL', 'White', '#ffffff', 8),
  ('girls-top-yellow', 'DEMO-GTOP24-YEL-S', 'S', 'Yellow', '#facc15', 10),
  ('girls-top-yellow', 'DEMO-GTOP24-PIN-S', 'S', 'Pink', '#f9a8d4', 4),
  ('girls-top-yellow', 'DEMO-GTOP24-YEL-M', 'M', 'Yellow', '#facc15', 11),
  ('girls-top-yellow', 'DEMO-GTOP24-PIN-M', 'M', 'Pink', '#f9a8d4', 5),
  ('girls-top-yellow', 'DEMO-GTOP24-YEL-L', 'L', 'Yellow', '#facc15', 12),
  ('girls-top-yellow', 'DEMO-GTOP24-PIN-L', 'L', 'Pink', '#f9a8d4', 6),
  ('girls-top-yellow', 'DEMO-GTOP24-YEL-XL', 'XL', 'Yellow', '#facc15', 0),
  ('girls-top-yellow', 'DEMO-GTOP24-PIN-XL', 'XL', 'Pink', '#f9a8d4', 7)
) AS v(prod_slug, sku, size, color, color_hex, stock)
JOIN public.products p ON p.slug = v.prod_slug
ON CONFLICT (sku) DO NOTHING;

-- 5. Hero JPG images (match the new /hero/*.jpg, not the old SVGs) ------------
INSERT INTO public.product_images
  (product_id, position, path_thumb, path_medium, path_large, alt)
SELECT p.id, v.pos,
       '/hero/' || p.section || '.jpg',
       '/hero/' || p.section || '.jpg',
       '/hero/' || p.section || '.jpg',
       v.alt
FROM (VALUES
  ('classic-cotton-panjabi-white', 1, 'Classic Cotton Panjabi front view'),
  ('classic-cotton-panjabi-white', 2, 'Classic Cotton Panjabi collar detail'),
  ('classic-cotton-panjabi-white', 3, 'Classic Cotton Panjabi on model'),
  ('premium-silk-panjabi-maroon', 1, 'Silk Panjabi front view'),
  ('premium-silk-panjabi-maroon', 2, 'Silk Panjabi fabric close-up'),
  ('addi-panjabi-sky', 1, 'Addi Panjabi front'),
  ('addi-panjabi-sky', 2, 'Addi Panjabi back'),
  ('endi-fatua-natural', 1, 'Endi Fatua front'),
  ('endi-fatua-natural', 2, 'Endi Fatua texture detail'),
  ('slim-chino-trousers-khaki', 1, 'Khaki chinos front'),
  ('slim-chino-trousers-khaki', 2, 'Khaki chinos detail'),
  ('executive-shirt-lightblue', 1, 'Executive shirt front'),
  ('executive-shirt-lightblue', 2, 'Executive shirt cuff detail'),
  ('taaga-coaty-charcoal', 1, 'Coaty front'),
  ('taaga-coaty-charcoal', 2, 'Coaty layered look'),
  ('comfort-lungi-check', 1, 'Lungi folded'),
  ('comfort-lungi-check', 2, 'Lungi check detail'),
  ('muslin-sharee-rose', 1, 'Muslin sharee drape'),
  ('muslin-sharee-rose', 2, 'Muslin sharee border detail'),
  ('muslin-sharee-rose', 3, 'Muslin sharee blouse piece'),
  ('jamdani-sharee-emerald', 1, 'Jamdani sharee full drape'),
  ('jamdani-sharee-emerald', 2, 'Jamdani motif close-up'),
  ('lawn-3pcs-mint', 1, 'Lawn 3pcs set'),
  ('lawn-3pcs-mint', 2, 'Lawn 3pcs embroidery detail'),
  ('cord-set-lavender', 1, 'Cord set front'),
  ('cord-set-lavender', 2, 'Cord set back'),
  ('long-tunic-terracotta', 1, 'Long tunic front'),
  ('long-tunic-terracotta', 2, 'Long tunic side slit'),
  ('georgette-gown-midnight', 1, 'Gown full length'),
  ('georgette-gown-midnight', 2, 'Gown waist detail'),
  ('casual-tops-floral', 1, 'Floral top front'),
  ('casual-tops-floral', 2, 'Floral top print detail'),
  ('ladies-blazer-sand', 1, 'Blazer front'),
  ('ladies-blazer-sand', 2, 'Blazer lapel detail'),
  ('boys-kabli-mustard', 1, 'Boys kabli set'),
  ('boys-kabli-mustard', 2, 'Boys kabli detail'),
  ('boys-panjabi-cream', 1, 'Boys panjabi front'),
  ('boys-panjabi-cream', 2, 'Boys panjabi back snap'),
  ('boys-denim-set-indigo', 1, 'Boys denim set'),
  ('boys-denim-set-indigo', 2, 'Boys denim set detail'),
  ('girls-3pcs-peach', 1, 'Girls 3pcs set'),
  ('girls-3pcs-peach', 2, 'Girls 3pcs dupatta detail'),
  ('girls-3pcs-peach', 3, 'Girls 3pcs back'),
  ('girls-2pcs-sky', 1, 'Girls 2pcs set'),
  ('girls-2pcs-sky', 2, 'Girls 2pcs print detail'),
  ('girls-jumpsuit-coral', 1, 'Girls jumpsuit front'),
  ('girls-jumpsuit-coral', 2, 'Girls jumpsuit pocket detail'),
  ('kids-tee-duo-mint', 1, 'Kids tee pack'),
  ('kids-tee-duo-mint', 2, 'Kids tee fabric'),
  ('girls-top-yellow', 1, 'Girls yellow top'),
  ('girls-top-yellow', 2, 'Girls top sleeve detail')
) AS v(prod_slug, pos, alt)
JOIN public.products p ON p.slug = v.prod_slug
ON CONFLICT (product_id, position) DO NOTHING;

-- Verify after push (expect 24 products / 192 TS variants / 0 demo rows):
-- SELECT count(*) FROM public.products WHERE slug NOT LIKE 'demo-%';
-- SELECT count(*) FROM public.product_variants v
--   JOIN public.products p ON p.id = v.product_id WHERE p.slug NOT LIKE 'demo-%';
-- SELECT count(*) FROM public.products WHERE slug LIKE 'demo-%';
