-- brand-store 0006: demo top-up (richer variants, 3rd image, approved reviews).
-- Idempotent: variants/images use ON CONFLICT DO NOTHING; reviews use a
-- NOT EXISTS guard (UNIQUE ignores NULL user_id). Safe to re-run.
-- Cleanup: DELETE FROM products WHERE slug LIKE 'demo-%' (cascades).

-- C/D variants: one new size + one new section colour per product ----------------
-- men: XL · Navy #1F2A44 | women: L · Maroon #7D2A3C | kids: 10-11Y/4-5Y · Teal #2A7D6B
-- D variants of 4 hero products carry stock 3 ("Only 3 left" scarcity UI).
INSERT INTO public.product_variants (product_id, sku, size, color, color_hex, stock)
SELECT p.id,
       'DEMO-' || upper(substring(p.slug from 6)) || '-' || x.v,
       CASE p.section
         WHEN 'men' THEN 'XL'
         WHEN 'women' THEN 'L'
         ELSE CASE WHEN x.v = 'C' THEN '10-11Y' ELSE '4-5Y' END
       END,
       CASE WHEN x.v = 'C'
         THEN CASE p.section WHEN 'men' THEN 'Navy' WHEN 'women' THEN 'Maroon' ELSE 'Teal' END
         ELSE 'White'
       END,
       CASE WHEN x.v = 'C'
         THEN CASE p.section WHEN 'men' THEN '#1F2A44' WHEN 'women' THEN '#7D2A3C' ELSE '#2A7D6B' END
         ELSE '#FFFFFF'
       END,
       CASE WHEN x.v = 'D' AND p.slug IN ('demo-cotton-panjabi', 'demo-muslin-sharee', 'demo-boys-kabli', 'demo-lawn-3pcs')
         THEN 3
         WHEN x.v = 'D' THEN 8
         ELSE 20
       END
FROM public.products p
CROSS JOIN (VALUES ('C'), ('D')) AS x(v)
WHERE p.slug LIKE 'demo-%'
ON CONFLICT (sku) DO NOTHING;

-- 3rd gallery image per demo product (same local placeholder, new alt) ------------
INSERT INTO public.product_images
  (product_id, position, path_thumb, path_medium, path_large, alt)
SELECT p.id, 3,
       '/hero/' || p.section || '.svg',
       '/hero/' || p.section || '.svg',
       '/hero/' || p.section || '.svg',
       p.name || ' image 3'
FROM public.products p
WHERE p.slug LIKE 'demo-%'
ON CONFLICT (product_id, position) DO NOTHING;

-- Approved demo reviews (user_id NULL = guest demo voice, warm + concise) ----------
-- NOTE: UNIQUE(product_id, user_id) ignores NULL user_ids, so idempotency here
-- comes from the NOT EXISTS guard on (product, title), not ON CONFLICT.
INSERT INTO public.reviews (product_id, user_id, rating, title, body, approved)
SELECT p.id, NULL, v.rating, v.title, v.body, true
FROM public.products p
JOIN (VALUES
  ('demo-cotton-panjabi', 5, 'Perfect Eid panjabi', 'Breathable cotton, true to size. Neat collar stitching and no fading after three washes.'),
  ('demo-cotton-panjabi', 5, 'Great value', 'Bought for my brother''s holud. Drapes nicely and looks far more premium than the price.'),
  ('demo-muslin-sharee', 5, 'Heirloom feel', 'Featherlight muslin with a crisp jamdani border. Drapes beautifully for evening events.'),
  ('demo-muslin-sharee', 4, 'Lovely, handle with care', 'Gorgeous weave. Add a soft fall and gentle wash, as expected with real muslin.'),
  ('demo-silk-panjabi', 5, 'Wedding ready', 'Rich sheen, sharp cut. Got compliments all night at a wedding in Chattogram.'),
  ('demo-silk-panjabi', 5, 'Premium finish', 'Buttons, lining and fall are all clean. Sizing matches the guide exactly.'),
  ('demo-lawn-3pcs', 5, 'My daily go-to', 'Soft lawn, colourfast prints. The dupatta is full length, which is rare at this price.'),
  ('demo-lawn-3pcs', 4, 'Comfortable summer set', 'Airy and well stitched. Slightly long sleeves for me, easily altered.'),
  ('demo-boys-kabli', 5, 'My son loves it', 'Festive without being fussy. He wore it all Eid day and stayed comfortable.'),
  ('demo-boys-kabli', 5, 'Great festive set', 'Good buttons, soft inner seams. True to the size chart for kids.'),
  ('demo-slim-chinos', 5, 'Perfect office chinos', 'Stretch is just right, no sagging by evening. The ink navy goes with everything.'),
  ('demo-executive-shirt', 5, 'Crisp all day', 'Holds its shape from morning meetings to dinner. Minimal ironing needed.')
) AS v(slug, rating, title, body) ON v.slug = p.slug
WHERE NOT EXISTS (
  SELECT 1 FROM public.reviews r WHERE r.product_id = p.id AND r.title = v.title
);
