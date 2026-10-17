-- brand-store 0008: fix casual-tops-floral duplicate variant SKUs.
-- TS had two colors truncating to the same SKU code (Floral Pink + Floral
-- Blue -> FLO), so 0007 inserted only 4 of 8 variants. TS renamed to
-- Petal Pink (PET) + Bloom Blue (BLO); this renames the FLO rows and adds
-- the missing BLO rows with formula-identical stock. Idempotent.

-- Rename the surviving FLO rows (they hold the Pink color data) -----------
UPDATE public.product_variants v
   SET sku = replace(v.sku, '-FLO-', '-PET-'),
       color = 'Petal Pink'
  FROM public.products p
 WHERE p.id = v.product_id
   AND p.slug = 'casual-tops-floral'
   AND v.sku LIKE '%-FLO-%'
   AND v.color = 'Floral Pink';

-- Backfill the missing Bloom Blue rows --------------------------------------
INSERT INTO public.product_variants
  (product_id, sku, size, color, color_hex, stock, price_override_paisa)
SELECT p.id, v.sku, v.size, v.color, v.color_hex, v.stock, NULL
FROM (VALUES
  ('DEMO-TOP15-BLO-S', 'S', 'Bloom Blue', '#93c5fd', 2),
  ('DEMO-TOP15-BLO-M', 'M', 'Bloom Blue', '#93c5fd', 3),
  ('DEMO-TOP15-BLO-L', 'L', 'Bloom Blue', '#93c5fd', 4),
  ('DEMO-TOP15-BLO-XL', 'XL', 'Bloom Blue', '#93c5fd', 5)
) AS v(sku, size, color, color_hex, stock)
JOIN public.products p ON p.slug = 'casual-tops-floral'
ON CONFLICT (sku) DO UPDATE SET color = EXCLUDED.color, color_hex = EXCLUDED.color_hex, stock = EXCLUDED.stock;

-- Expect 8 variants for this product:
-- SELECT count(*) FROM product_variants v JOIN products p ON p.id = v.product_id WHERE p.slug = 'casual-tops-floral';
