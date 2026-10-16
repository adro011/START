-- brand-store 0004: seed (categories, zones, coupons, demo products, settings).
-- Demo SKUs use the DEMO- prefix: DELETE FROM products WHERE slug LIKE 'demo-%'
-- removes every demo row (variants/images cascade).

-- Section roots -----------------------------------------------------------------
INSERT INTO public.categories (slug, name, name_bn, section, parent_id, sort) VALUES
  ('men', 'Men', 'পুরুষ', 'men', NULL, 1),
  ('women', 'Women', 'নারী', 'women', NULL, 2),
  ('kids', 'Kids', 'শিশু', 'kids', NULL, 3)
ON CONFLICT (slug) DO NOTHING;

-- Men level 2 ---------------------------------------------------------------------
INSERT INTO public.categories (slug, name, name_bn, section, parent_id, sort)
SELECT v.slug, v.name, v.name_bn, 'men',
       (SELECT id FROM public.categories WHERE slug = 'men'), v.sort
FROM (VALUES
  ('men-panjabi', 'Panjabi', 'পাঞ্জাবি', 1),
  ('men-panjabi-sets', 'Panjabi Pajama Sets', 'পাঞ্জাবি পায়জামা সেট', 2),
  ('men-pajama', 'Pajama', 'পায়জামা', 3),
  ('men-coaty', 'Coaty', 'কোটি', 4),
  ('men-short-kurta', 'Short Kurta', 'শর্ট কুর্তা', 5),
  ('men-jackets', 'Jackets', 'জ্যাকেট', 6),
  ('men-trousers', 'Trousers', 'ট্রাউজার', 7),
  ('men-shirts', 'Shirts', 'শার্ট', 8),
  ('men-fatua', 'Fatua', 'ফতুয়া', 9),
  ('men-lungi', 'Lungi', 'লুঙ্গি', 10),
  ('men-shawls', 'Shawls', 'শাল', 11),
  ('men-scarves', 'Scarves & Mufflers', 'মাফলার', 12),
  ('men-tshirts', 'T-Shirts', 'টি-শার্ট', 13),
  ('men-polos', 'Polos', 'পোলো', 14),
  ('men-sleeping-suits', 'Sleeping Suits', 'স্লিপিং স্যুট', 15),
  ('men-shoes', 'Shoes', 'জুতা', 16),
  ('men-accessories', 'Accessories', 'অ্যাকসেসরিজ', 17),
  ('men-tupi', 'Tupi', 'টুপি', 18)
) AS v(slug, name, name_bn, sort)
ON CONFLICT (slug) DO NOTHING;

-- Men level 3 -----------------------------------------------------------------------
INSERT INTO public.categories (slug, name, name_bn, section, parent_id, sort)
SELECT v.slug, v.name, v.name_bn, 'men',
       (SELECT id FROM public.categories WHERE slug = v.parent_slug), v.sort
FROM (VALUES
  ('men-panjabi-cotton', 'Cotton & Blends', 'কটন', 'men-panjabi', 1),
  ('men-panjabi-addi', 'Addi', 'আদ্দি', 'men-panjabi', 2),
  ('men-panjabi-endi', 'Endi', 'এন্ডি', 'men-panjabi', 3),
  ('men-panjabi-silk', 'Silk', 'সিল্ক', 'men-panjabi', 4),
  ('men-panjabi-muslin', 'Muslin & Jamdani', 'মসলিন ও জামদানি', 'men-panjabi', 5),
  ('men-panjabi-taaga', 'Taaga Man Panjabis', 'তাগা ম্যান', 'men-panjabi', 6),
  ('men-sets-cotton', 'Cotton & Blends', 'কটন', 'men-panjabi-sets', 1),
  ('men-sets-silk', 'Silk', 'সিল্ক', 'men-panjabi-sets', 2),
  ('men-trousers-chinos', 'Chinos', 'চিনো', 'men-trousers', 1),
  ('men-trousers-denim', 'Denim', 'ডেনিম', 'men-trousers', 2),
  ('men-trousers-lounge', 'Lounge Wear', 'লাউঞ্জ ওয়্যার', 'men-trousers', 3),
  ('men-shirts-ethnic', 'Ethnic', 'এথনিক', 'men-shirts', 1),
  ('men-shirts-casual', 'Casual', 'ক্যাজুয়াল', 'men-shirts', 2),
  ('men-shirts-executive', 'Executive', 'এক্সিকিউটিভ', 'men-shirts', 3),
  ('men-fatua-cotton', 'Cotton & Blends', 'কটন', 'men-fatua', 1),
  ('men-fatua-endi', 'Endi', 'এন্ডি', 'men-fatua', 2),
  ('men-fatua-silk', 'Silk', 'সিল্ক', 'men-fatua', 3),
  ('men-shoes-sandals', 'Sandals', 'স্যান্ডেল', 'men-shoes', 1),
  ('men-shoes-shoes', 'Shoes', 'জুতা', 'men-shoes', 2),
  ('men-shoes-nagras', 'Nagras', 'নাগরা', 'men-shoes', 3),
  ('men-acc-belts', 'Belts', 'বেল্ট', 'men-accessories', 1),
  ('men-acc-wallets', 'Wallets', 'ওয়ালেট', 'men-accessories', 2),
  ('men-acc-card-holders', 'Card Holders', 'কার্ড হোল্ডার', 'men-accessories', 3),
  ('men-acc-key-rings', 'Key Rings', 'চাবির রিং', 'men-accessories', 4),
  ('men-acc-bags', 'Bags', 'ব্যাগ', 'men-accessories', 5),
  ('men-acc-attar', 'Attar', 'আতর', 'men-accessories', 6)
) AS v(slug, name, name_bn, parent_slug, sort)
ON CONFLICT (slug) DO NOTHING;

-- Women level 2 -----------------------------------------------------------------------
INSERT INTO public.categories (slug, name, name_bn, section, parent_id, sort)
SELECT v.slug, v.name, v.name_bn, 'women',
       (SELECT id FROM public.categories WHERE slug = 'women'), v.sort
FROM (VALUES
  ('women-jacket', 'Jacket', 'জ্যাকেট', 1),
  ('women-gown', 'Gown', 'গাউন', 2),
  ('women-ladies-cap', 'Ladies Cap', 'লেডিস ক্যাপ', 3),
  ('women-skirt', 'Skirt', 'স্কার্ট', 4),
  ('women-ladies-polo', 'Ladies Polo', 'লেডিস পোলো', 5),
  ('women-tunic', 'Tunic', 'টিউনিক', 6),
  ('women-sets', '3 Pcs & 2 Pcs', 'থ্রি-পিস ও টু-পিস', 7),
  ('women-tops', 'Tops & Shirt', 'টপস ও শার্ট', 8),
  ('women-sharee', 'Sharee', 'শাড়ি', 9),
  ('women-blazer', 'Blazer', 'ব্লেজার', 10)
) AS v(slug, name, name_bn, sort)
ON CONFLICT (slug) DO NOTHING;

-- Women level 3 -------------------------------------------------------------------------
INSERT INTO public.categories (slug, name, name_bn, section, parent_id, sort)
SELECT v.slug, v.name, v.name_bn, 'women',
       (SELECT id FROM public.categories WHERE slug = v.parent_slug), v.sort
FROM (VALUES
  ('women-tunic-long', 'Long Tunic', 'লং টিউনিক', 'women-tunic', 1),
  ('women-tunic-short', 'Short Tunic', 'শর্ট টিউনিক', 'women-tunic', 2),
  ('women-sets-cord', 'Cord-Set', 'কর্ড-সেট', 'women-sets', 1),
  ('women-sets-3pcs', '3 Pcs Set', 'থ্রি-পিস সেট', 'women-sets', 2),
  ('women-sets-2pcs', '2 Pcs', 'টু-পিস', 'women-sets', 3),
  ('women-tops-tshirt', 'T-shirt', 'টি-শার্ট', 'women-tops', 1),
  ('women-tops-bd-polo', 'Bangladesh Polo', 'বাংলাদেশ পোলো', 'women-tops', 2),
  ('women-tops-tops', 'Tops', 'টপস', 'women-tops', 3)
) AS v(slug, name, name_bn, parent_slug, sort)
ON CONFLICT (slug) DO NOTHING;

-- Kids level 2 + 3 --------------------------------------------------------------------------
INSERT INTO public.categories (slug, name, name_bn, section, parent_id, sort)
SELECT v.slug, v.name, v.name_bn, 'kids',
       (SELECT id FROM public.categories WHERE slug = 'kids'), v.sort
FROM (VALUES
  ('kids-boys', 'Boys', 'ছেলে', 1),
  ('kids-girls', 'Girls', 'মেয়ে', 2)
) AS v(slug, name, name_bn, sort)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.categories (slug, name, name_bn, section, parent_id, sort)
SELECT v.slug, v.name, v.name_bn, 'kids',
       (SELECT id FROM public.categories WHERE slug = v.parent_slug), v.sort
FROM (VALUES
  ('kids-boys-kabli', 'Kabli', 'কাবলি', 'kids-boys', 1),
  ('kids-boys-denim', 'Boy''s Denim', 'ডেনিম', 'kids-boys', 2),
  ('kids-boys-cord-set', 'Boy''s Cord Set', 'কর্ড সেট', 'kids-boys', 3),
  ('kids-boys-shirt', 'Shirt', 'শার্ট', 'kids-boys', 4),
  ('kids-boys-polo', 'Polo Shirt', 'পোলো শার্ট', 'kids-boys', 5),
  ('kids-boys-panjabi', 'Panjabi', 'পাঞ্জাবি', 'kids-boys', 6),
  ('kids-boys-tank-top', 'Tank Top', 'ট্যাংক টপ', 'kids-boys', 7),
  ('kids-boys-tshirt', 'T-Shirt', 'টি-শার্ট', 'kids-boys', 8),
  ('kids-girls-3pcs', '3 Pcs', 'থ্রি-পিস', 'kids-girls', 1),
  ('kids-girls-2pcs', '2 Pcs', 'টু-পিস', 'kids-girls', 2),
  ('kids-girls-jumpsuit', 'Jumpsuit', 'জাম্পস্যুট', 'kids-girls', 3),
  ('kids-girls-tshirts', 'T-Shirts', 'টি-শার্ট', 'kids-girls', 4),
  ('kids-girls-tops', 'Tops', 'টপস', 'kids-girls', 5)
) AS v(slug, name, name_bn, parent_slug, sort)
ON CONFLICT (slug) DO NOTHING;

-- Shipping zones ------------------------------------------------------------------------------
INSERT INTO public.shipping_zones (name, districts, fee_paisa, free_over_paisa, eta_days) VALUES
  ('Dhaka city',
   ARRAY['Dhaka', 'Gazipur', 'Narayanganj', 'Munshiganj', 'Narsingdi', 'Manikganj'],
   6000, 200000, '2-3 days'),
   ('Outside Dhaka',
    ARRAY['Chattogram', 'Cumilla', 'Sylhet', 'Rajshahi', 'Khulna', 'Barishal',
          'Rangpur', 'Mymensingh', 'Cox''s Bazar', 'Jashore', 'Dinajpur', 'Bogra'],
    12000, 300000, '3-5 days')
ON CONFLICT (name) DO UPDATE SET
  districts = EXCLUDED.districts, fee_paisa = EXCLUDED.fee_paisa,
  free_over_paisa = EXCLUDED.free_over_paisa, eta_days = EXCLUDED.eta_days;

-- Coupons ------------------------------------------------------------------------------------------------
INSERT INTO public.coupons
  (code, type, value, min_subtotal_paisa, starts_at, ends_at, usage_limit, used_count, active)
VALUES
  ('WELCOME10', 'percent', 10, 100000,
   '2025-01-01T00:00:00+06:00', '2030-12-31T23:59:59+06:00', 5000, 0, true),
  ('FREESHIP', 'free_shipping', 0, 150000,
   '2025-01-01T00:00:00+06:00', '2030-12-31T23:59:59+06:00', NULL, 0, true)
ON CONFLICT (code) DO UPDATE SET
  type = EXCLUDED.type, value = EXCLUDED.value,
  min_subtotal_paisa = EXCLUDED.min_subtotal_paisa,
  starts_at = EXCLUDED.starts_at, ends_at = EXCLUDED.ends_at,
  usage_limit = EXCLUDED.usage_limit, active = EXCLUDED.active;

-- Demo products: 8 per section (24 total), BDT prices in paisa ----------------------------------------------
INSERT INTO public.products (
  slug, name, name_bn, description, section, category_id,
  price_paisa, compare_at_paisa, fabric, care, fit_notes, is_new, is_sale, is_featured, active
)
SELECT v.slug, v.name, v.name_bn, v.description, v.section, c.id,
       v.price_paisa, v.compare_at_paisa, v.fabric,
       'Machine wash cold, dry in shade', v.fit_notes,
       v.is_new, v.is_sale, v.is_featured, true
FROM (VALUES
  ('demo-cotton-panjabi', 'Classic Cotton Panjabi', 'ক্লাসিক কটন পাঞ্জাবি',
   'Breathable everyday cotton panjabi with metal buttons and side slits.',
   'men', 'men-panjabi-cotton', 349900, 429900::integer, '100% Cotton',
   'Regular fit, side slits', false, true, true),
  ('demo-silk-panjabi', 'Premium Silk Panjabi', 'প্রিমিয়াম সিল্ক পাঞ্জাবি',
   'Festive silk-blend panjabi with minimal collar embroidery.',
   'men', 'men-panjabi-silk', 599900, NULL::integer, 'Silk Blend',
   'Slim festive fit', false, false, true),
  ('demo-executive-shirt', 'Executive Formal Shirt', 'এক্সিকিউটিভ ফরমাল শার্ট',
   'Wrinkle-resistant office shirt with spread collar and double cuffs.',
   'men', 'men-shirts-executive', 189900, 229900::integer, 'Cotton Spandex',
   'Slim fit', false, true, false),
  ('demo-slim-chinos', 'Slim-Fit Stretch Chinos', 'স্লিম-ফিট চিনো',
   'All-day stretch chinos that hold their shape from desk to dinner.',
   'men', 'men-trousers-chinos', 219900, NULL::integer, 'Cotton Twill + Elastane',
   'Slim fit, mid rise', true, false, false),
  ('demo-endi-fatua', 'Endi Handloom Fatua', 'এন্ডি হ্যান্ডলুম ফতুয়া',
   'Handloom endi fatua with wooden buttons, proudly made in Bangladesh.',
   'men', 'men-fatua-endi', 279900, NULL::integer, 'Endi Silk',
   'Relaxed fit', false, false, true),
  ('demo-check-lungi', 'Traditional Check Lungi', 'ট্র্যাডিশনাল চেক লুঙ্গি',
   'Soft colourfast cotton lungi in a classic check, extra long.',
   'men', 'men-lungi', 89900, NULL::integer, '100% Cotton',
   'Free size', false, false, false),
  ('demo-embroidered-tupi', 'Embroidered Prayer Tupi', 'এমব্রয়ডারি টুপি',
   'Finely embroidered everyday prayer cap in breathable cotton.',
   'men', 'men-tupi', 49900, NULL::integer, 'Cotton',
   'Free size', true, false, false),
  ('demo-leather-wallet', 'Genuine Leather Wallet', 'জেনুইন লেদার ওয়ালেট',
   'Full-grain leather bifold with 8 card slots and coin pocket.',
   'men', 'men-acc-wallets', 129900, 159900::integer, 'Genuine Leather',
   'Bifold, fits 8 cards', false, true, false),
  ('demo-muslin-sharee', 'Muslin Jamdani Sharee', 'মসলিন জামদানি শাড়ি',
   'Featherlight muslin sharee with handwoven jamdani motifs and blouse piece.',
   'women', 'women-sharee', 899900, NULL::integer, 'Muslin + Jamdani Weave',
   '12 haat + blouse piece', false, false, true),
  ('demo-lawn-3pcs', 'Floral Lawn 3 Pcs Set', 'ফ্লোরাল লন থ্রি-পিস',
   'Breezy printed lawn kameez with straight pajama and chiffon dupatta.',
   'women', 'women-sets-3pcs', 329900, 389900::integer, 'Premium Lawn',
   'Regular fit', false, true, false),
  ('demo-long-tunic', 'Everyday Long Tunic', 'লং টিউনিক',
   'Knee-length everyday tunic with side slits and patch pockets.',
   'women', 'women-tunic-long', 199900, NULL::integer, 'Viscose Crepe',
   'Relaxed, knee length', true, false, false),
  ('demo-party-gown', 'Evening Party Gown', 'পার্টি গাউন',
   'Flowing lined georgette gown with sequin yoke for festive nights.',
   'women', 'women-gown', 459900, NULL::integer, 'Georgette',
   'Maxi, fully lined', false, false, true),
  ('demo-pleated-skirt', 'Pleated Midi Skirt', 'প্লিটেড স্কার্ট',
   'Knife-pleat midi skirt with elastic back waist for easy wear.',
   'women', 'women-skirt', 159900, NULL::integer, 'Poly Crepe',
   'Midi, elastic waist', false, false, false),
  ('demo-ladies-polo', 'Ladies Pique Polo', 'লেডিস পোলো',
   'Sporty pique-knit polo with contrast tipping, cut for women.',
   'women', 'women-ladies-polo', 119900, NULL::integer, 'Pique Cotton',
   'Regular fit', true, false, false),
  ('demo-ladies-blazer', 'Tailored Ladies Blazer', 'লেডিস ব্লেজার',
   'Sharp single-breasted blazer for office and occasions.',
   'women', 'women-blazer', 549900, NULL::integer, 'TR Suiting',
   'Single-breasted', false, false, false),
  ('demo-cotton-tops', 'Printed Cotton Tops', 'প্রিন্টেড কটন টপস',
   'Soft printed cotton tops, comfortable for everyday wear.',
   'women', 'women-tops-tops', 139900, 169900::integer, '100% Cotton',
   'Regular fit', false, true, false),
  ('demo-boys-kabli', 'Boys Festive Kabli Set', 'ছেলেদের কাবলি সেট',
   'Festive kabli with matching pajama for little gentlemen.',
   'kids', 'kids-boys-kabli', 249900, NULL::integer, 'Cotton Blend',
   'Set with pajama', true, false, true),
  ('demo-boys-denim', 'Boy''s Stretch Denim Jeans', 'ছেলেদের ডেনিম',
   'Durable stretch denim with adjustable waist for growing boys.',
   'kids', 'kids-boys-denim', 149900, NULL::integer, 'Stretch Denim',
   'Slim, adjustable waist', false, false, false),
  ('demo-boys-panjabi', 'Kids Cotton Panjabi', 'কিডস কটন পাঞ্জাবি',
   'Soft cotton panjabi for Eid mornings and family photos.',
   'kids', 'kids-boys-panjabi', 179900, 219900::integer, '100% Cotton',
   'Regular fit', false, true, false),
  ('demo-boys-tshirt-2pack', 'Boys Graphic T-Shirt (2-Pack)', 'ছেলেদের টি-শার্ট',
   'Two playful graphic tees in soft jersey cotton.',
   'kids', 'kids-boys-tshirt', 99900, NULL::integer, 'Cotton Jersey',
   'Pack of 2', false, false, false),
  ('demo-girls-3pcs', 'Girls Embroidered 3 Pcs', 'মেয়েদের এমব্রয়ডারি থ্রি-পিস',
   'Twirl-ready embroidered 3 pcs with soft net dupatta.',
   'kids', 'kids-girls-3pcs', 229900, NULL::integer, 'Lawn + Net Dupatta',
   'Regular fit', false, false, true),
  ('demo-girls-jumpsuit', 'Girls Summer Jumpsuit', 'মেয়েদের জাম্পস্যুট',
   'Breezy poplin jumpsuit with tie waist and pockets.',
   'kids', 'kids-girls-jumpsuit', 169900, NULL::integer, 'Cotton Poplin',
   'Relaxed, tie waist', true, false, false),
  ('demo-girls-tops', 'Girls Floral Tops', 'মেয়েদের ফ্লোরাল টপস',
   'Sweet floral jersey tops for everyday play.',
   'kids', 'kids-girls-tops', 89900, 109900::integer, 'Cotton Jersey',
   'Regular fit', false, true, false),
  ('demo-boys-cordset', 'Boy''s Cotton Cord Set', 'ছেলেদের কর্ড সেট',
   'Matching shirt-and-shorts cord set in soft terry.',
   'kids', 'kids-boys-cord-set', 199900, NULL::integer, 'Cotton Terry',
   'Shirt + shorts', true, false, false)
) AS v(slug, name, name_bn, description, section, cat_slug, price_paisa,
        compare_at_paisa, fabric, fit_notes, is_new, is_sale, is_featured)
JOIN public.categories c ON c.slug = v.cat_slug
ON CONFLICT (slug) DO NOTHING;

-- 2 variants per demo product (DEMO- SKUs; sizes differ per section) ----------------------
INSERT INTO public.product_variants (product_id, sku, size, color, color_hex, stock)
SELECT p.id,
       'DEMO-' || upper(substring(p.slug from 6)) || '-' || x.v,
       CASE WHEN x.v = 'A'
         THEN CASE p.section WHEN 'men' THEN 'M' WHEN 'women' THEN 'S' ELSE '6-7Y' END
         ELSE CASE p.section WHEN 'men' THEN 'L' WHEN 'women' THEN 'M' ELSE '8-9Y' END
       END,
       CASE WHEN x.v = 'A' THEN 'White' ELSE 'Black' END,
       CASE WHEN x.v = 'A' THEN '#FFFFFF' ELSE '#172121' END,
       CASE WHEN x.v = 'A' THEN 25 ELSE 15 END
FROM public.products p
CROSS JOIN (VALUES ('A'), ('B')) AS x(v)
WHERE p.slug LIKE 'demo-%'
ON CONFLICT (sku) DO NOTHING;

-- 2 placeholder images per demo product (section hero SVG) -----------------------------------
INSERT INTO public.product_images
  (product_id, position, path_thumb, path_medium, path_large, alt)
SELECT p.id, x.pos,
       '/hero/' || p.section || '.svg',
       '/hero/' || p.section || '.svg',
       '/hero/' || p.section || '.svg',
       p.name || ' image ' || x.pos
FROM public.products p
CROSS JOIN (VALUES (1), (2)) AS x(pos)
WHERE p.slug LIKE 'demo-%'
ON CONFLICT (product_id, position) DO NOTHING;

-- Site settings -----------------------------------------------------------------------------------
INSERT INTO public.site_settings (key, value) VALUES
  ('announcements', '{"enabled": true, "messages": ["Free delivery inside Dhaka on orders over BDT 2,000", "Eid Collection 2026 has arrived", "Easy 7-day exchange, no questions asked"]}'),
  ('hero_copy', '{"men": {"title": "Heritage Panjabi House", "subtitle": "Hand-finished panjabis, fatua and more"}, "women": {"title": "Woven Stories", "subtitle": "Muslin, lawn and festive wear"}, "kids": {"title": "Little Celebrations", "subtitle": "Festive and everyday kidswear"}}'),
  ('shipping_config', '{"currency": "BDT", "currency_divisor": 100, "zones": [{"name": "Dhaka city", "fee_paisa": 6000, "free_over_paisa": 200000}, {"name": "Outside Dhaka", "fee_paisa": 12000, "free_over_paisa": 300000}]}')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
