-- brand-store 0017: ABRAR category taxonomy migration (MEN / WOMEN / KIDS).
--
-- Establishes the new authoritative taxonomy:
--   MEN   14 leaf categories across 4 groups
--   WOMEN 14 leaf categories across 4 groups
--   BOYS  16 leaf categories
--   GIRLS 20 leaf categories
--   (64 leaf categories total)
--
-- Groups are level-2 (parent = section root); leaves are level-3 (parent = group).
-- Section-prefixed slugs keep the `mapCategorySlug` bridge (strip `{section}-`)
-- aligned with the local TS taxonomy in src/lib/catalog.ts.
--
-- NON-DESTRUCTIVE CORE: this file only INSERTS/UPDATES the new tree and REMAPS
-- products onto the new leaf categories. It does NOT delete the legacy tree.
-- See the "OPTIONAL CLEANUP" section at the bottom — run that ONLY after
-- verifying the remaps, with a backup, and with explicit approval (parent_id
-- has ON DELETE CASCADE).

-- 1. Groups (level-2) --------------------------------------------------------
INSERT INTO public.categories (slug, name, name_bn, section, parent_id, sort)
SELECT v.slug, v.name, NULL, v.section, r.id, v.sort
FROM (VALUES
  ('men-traditional-wear',        'Traditional Wear',          'men',   1),
  ('men-topwear',                 'Topwear',                   'men',   2),
  ('men-bottomwear',              'Bottomwear',                'men',   3),
  ('men-accessories-essentials',  'Accessories & Essentials',  'men',   4),
  ('women-dresses-sets',          'Dresses & Sets',            'women', 1),
  ('women-sarees',                'Sarees',                    'women', 2),
  ('women-ethnic-wear',           'Ethnic Wear',               'women', 3),
  ('women-accessories-essentials','Accessories & Essentials',  'women', 4)
) AS v(slug, name, section, sort)
JOIN public.categories r ON r.slug = v.section AND r.parent_id IS NULL
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  section = EXCLUDED.section,
  parent_id = EXCLUDED.parent_id,
  sort = EXCLUDED.sort;

-- kids-boys / kids-girls already exist as groups (0004) — reuse them as-is.

-- 2. Leaf categories (level-3) ----------------------------------------------
INSERT INTO public.categories (slug, name, name_bn, section, parent_id, sort)
SELECT v.slug, v.name, NULL, v.section, p.id, v.sort
FROM (VALUES
  -- Men · Traditional Wear
  ('men-punjabi',             'Punjabi (Traditional Kurta)',   'men', 'men-traditional-wear',        1),
  ('men-sherwani',            'Sherwani',                      'men', 'men-traditional-wear',        2),
  -- Men · Topwear
  ('men-shirts',              'Shirts',                        'men', 'men-topwear',                 1),
  ('men-t-shirts',            'T-Shirts',                      'men', 'men-topwear',                 2),
  ('men-vests',               'Vests (Undershirts)',           'men', 'men-topwear',                 3),
  -- Men · Bottomwear
  ('men-pants',               'Pants',                         'men', 'men-bottomwear',              1),
  ('men-jeans',               'Jeans',                         'men', 'men-bottomwear',              2),
  ('men-gabardine-pants',     'Gabardine Pants',               'men', 'men-bottomwear',              3),
  ('men-trousers',            'Trousers',                      'men', 'men-bottomwear',              4),
  ('men-three-quarter-pants', 'Three-Quarter Pants',           'men', 'men-bottomwear',              5),
  ('men-two-quarter-pants',   'Two-Quarter Pants (Shorts)',    'men', 'men-bottomwear',              6),
  -- Men · Accessories & Essentials
  ('men-ties',                'Ties',                          'men', 'men-accessories-essentials',  1),
  ('men-wallets',             'Wallets',                       'men', 'men-accessories-essentials',  2),
  ('men-mens-undergarments',  'Men''s Undergarments',          'men', 'men-accessories-essentials',  3),

  -- Women · Dresses & Sets
  ('women-womens-dresses',              'Women''s Dresses',               'women', 'women-dresses-sets', 1),
  ('women-gowns',                       'Gowns',                          'women', 'women-dresses-sets', 2),
  ('women-ready-made-three-piece-sets', 'Ready-Made Three-Piece Sets',    'women', 'women-dresses-sets', 3),
  ('women-unstitched-three-piece-sets', 'Unstitched Three-Piece Sets',    'women', 'women-dresses-sets', 4),
  ('women-one-piece-outfits',           'One-Piece Outfits',              'women', 'women-dresses-sets', 5),
  ('women-two-piece-sets',              'Two-Piece Sets',                 'women', 'women-dresses-sets', 6),
  ('women-three-piece-sets',            'Three-Piece Sets',               'women', 'women-dresses-sets', 7),
  -- Women · Sarees
  ('women-katan-silk-sarees',  'Katan Silk Sarees',   'women', 'women-sarees', 1),
  ('women-cotton-sarees',      'Cotton Sarees',       'women', 'women-sarees', 2),
  ('women-jamdani-sarees',     'Jamdani Sarees',      'women', 'women-sarees', 3),
  ('women-party-wear-sarees',  'Party Wear Sarees',   'women', 'women-sarees', 4),
  -- Women · Ethnic Wear
  ('women-lehengas',           'Lehengas',            'women', 'women-ethnic-wear', 1),
  -- Women · Accessories & Essentials
  ('women-womens-handbags',       'Women''s Handbags',       'women', 'women-accessories-essentials', 1),
  ('women-womens-undergarments',  'Women''s Undergarments',  'women', 'women-accessories-essentials', 2),

  -- Boys
  ('kids-boys-clothing-sets',  'Boys'' Clothing Sets',  'kids', 'kids-boys', 1),
  ('kids-boys-t-shirts',       'T-Shirts',              'kids', 'kids-boys', 2),
  ('kids-boys-shirts',         'Shirts',                'kids', 'kids-boys', 3),
  ('kids-boys-polo-shirts',    'Polo Shirts',           'kids', 'kids-boys', 4),
  ('kids-boys-jeans',          'Jeans',                 'kids', 'kids-boys', 5),
  ('kids-boys-casual-pants',   'Casual Pants',          'kids', 'kids-boys', 6),
  ('kids-boys-shorts',         'Shorts',                'kids', 'kids-boys', 7),
  ('kids-boys-trousers',       'Trousers',              'kids', 'kids-boys', 8),
  ('kids-boys-punjabi-kurta',  'Punjabi / Kurta',       'kids', 'kids-boys', 9),
  ('kids-boys-sherwani',       'Sherwani',              'kids', 'kids-boys', 10),
  ('kids-boys-hoodies',        'Hoodies',               'kids', 'kids-boys', 11),
  ('kids-boys-jackets',        'Jackets',               'kids', 'kids-boys', 12),
  ('kids-boys-sweaters',       'Sweaters',              'kids', 'kids-boys', 13),
  ('kids-boys-pajama-sets',    'Pajama Sets',           'kids', 'kids-boys', 14),
  ('kids-boys-tracksuits',     'Tracksuits',            'kids', 'kids-boys', 15),
  ('kids-boys-undergarments',  'Undergarments',         'kids', 'kids-boys', 16),

  -- Girls
  ('kids-girls-clothing-sets',    'Girls'' Clothing Sets',  'kids', 'kids-girls', 1),
  ('kids-girls-frocks',           'Frocks',                 'kids', 'kids-girls', 2),
  ('kids-girls-dresses',          'Dresses',                'kids', 'kids-girls', 3),
  ('kids-girls-t-shirts',         'T-Shirts',               'kids', 'kids-girls', 4),
  ('kids-girls-tops',             'Tops',                   'kids', 'kids-girls', 5),
  ('kids-girls-skirts',           'Skirts',                 'kids', 'kids-girls', 6),
  ('kids-girls-jeans',            'Jeans',                  'kids', 'kids-girls', 7),
  ('kids-girls-leggings',         'Leggings',               'kids', 'kids-girls', 8),
  ('kids-girls-casual-pants',     'Casual Pants',           'kids', 'kids-girls', 9),
  ('kids-girls-one-piece-dresses','One-Piece Dresses',      'kids', 'kids-girls', 10),
  ('kids-girls-two-piece-sets',   'Two-Piece Sets',         'kids', 'kids-girls', 11),
  ('kids-girls-three-piece-sets', 'Three-Piece Sets',       'kids', 'kids-girls', 12),
  ('kids-girls-salwar-kameez',    'Salwar Kameez',          'kids', 'kids-girls', 13),
  ('kids-girls-lehengas',         'Lehengas',               'kids', 'kids-girls', 14),
  ('kids-girls-gowns',            'Gowns',                  'kids', 'kids-girls', 15),
  ('kids-girls-hoodies',          'Hoodies',                'kids', 'kids-girls', 16),
  ('kids-girls-jackets',          'Jackets',                'kids', 'kids-girls', 17),
  ('kids-girls-sweaters',         'Sweaters',               'kids', 'kids-girls', 18),
  ('kids-girls-nightwear',        'Nightwear',              'kids', 'kids-girls', 19),
  ('kids-girls-undergarments',    'Undergarments',          'kids', 'kids-girls', 20)
) AS v(slug, name, section, group_slug, sort)
JOIN public.categories p ON p.slug = v.group_slug
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  section = EXCLUDED.section,
  parent_id = EXCLUDED.parent_id,
  sort = EXCLUDED.sort;

-- 3. Remap the 24 storefront products onto the new leaf categories ----------
UPDATE public.products SET category_id = c.id
FROM (VALUES
  ('classic-cotton-panjabi-white', 'men-punjabi'),
  ('premium-silk-panjabi-maroon',  'men-punjabi'),
  ('addi-panjabi-sky',             'men-punjabi'),
  ('endi-fatua-natural',           'men-shirts'),
  ('slim-chino-trousers-khaki',    'men-trousers'),
  ('executive-shirt-lightblue',    'men-shirts'),
  ('taaga-coaty-charcoal',         'men-sherwani'),
  ('comfort-lungi-check',          'men-pants'),
  ('muslin-sharee-rose',           'women-cotton-sarees'),
  ('jamdani-sharee-emerald',       'women-jamdani-sarees'),
  ('lawn-3pcs-mint',               'women-ready-made-three-piece-sets'),
  ('cord-set-lavender',            'women-two-piece-sets'),
  ('long-tunic-terracotta',        'women-womens-dresses'),
  ('georgette-gown-midnight',      'women-gowns'),
  ('casual-tops-floral',           'women-one-piece-outfits'),
  ('ladies-blazer-sand',           'women-one-piece-outfits'),
  ('boys-kabli-mustard',           'kids-boys-clothing-sets'),
  ('boys-panjabi-cream',           'kids-boys-punjabi-kurta'),
  ('boys-denim-set-indigo',        'kids-boys-clothing-sets'),
  ('girls-3pcs-peach',             'kids-girls-three-piece-sets'),
  ('girls-2pcs-sky',               'kids-girls-two-piece-sets'),
  ('girls-jumpsuit-coral',         'kids-girls-one-piece-dresses'),
  ('kids-tee-duo-mint',            'kids-boys-t-shirts'),
  ('girls-top-yellow',             'kids-girls-tops')
) AS m(product_slug, cat_slug)
JOIN public.categories c ON c.slug = m.cat_slug
WHERE public.products.slug = m.product_slug;

-- ---------------------------------------------------------------------------
-- OPTIONAL CLEANUP (run ONLY after verifying the remaps, with a backup, and
-- with explicit approval — parent_id ON DELETE CASCADE deletes descendants).
-- This removes the legacy category tree so the DB matches the new taxonomy
-- exactly. Uncomment to run:
-- ---------------------------------------------------------------------------
-- DELETE FROM public.categories
--  WHERE slug IN (
--    'men-panjabi', 'men-panjabi-sets', 'men-pajama', 'men-coaty',
--    'men-short-kurta', 'men-jackets', 'men-fatua', 'men-lungi',
--    'men-shawls', 'men-scarves', 'men-tshirts', 'men-polos',
--    'men-sleeping-suits', 'men-shoes', 'men-accessories', 'men-tupi',
--    'women-jacket', 'women-gown', 'women-ladies-cap', 'women-skirt',
--    'women-ladies-polo', 'women-tunic', 'women-sets', 'women-tops',
--    'women-sharee', 'women-blazer'
--  );
-- NOTE: old level-3 rows cascade automatically via their level-2 parent.

-- Verify after push (expect 64 leaves + 10 groups + 3 roots):
-- SELECT section, count(*) FROM public.categories
--  WHERE parent_id IN (SELECT id FROM public.categories WHERE parent_id IS NOT NULL)
--  GROUP BY section;
