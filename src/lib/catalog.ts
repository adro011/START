// Plain TS data layer — intentionally NOT `server-only` so both
// server components and client components (search palette) can import it.
// Money is integer paisa everywhere (249000 = ৳2,490).

import type { CatalogProduct } from "@/types/catalog";

export type Section = "men" | "women" | "kids";
export type VirtualSection = Section | "new-arrivals" | "sale";

export type ProductImage = { src: string; alt: string };
export type ProductColor = { name: string; hex: string };
export type ProductVariant = {
  sku: string;
  size: string;
  color: string;
  colorHex: string;
  stock: number;
  priceOverridePaisa?: number | null;
};

export type Product = {
  slug: string;
  name: string;
  nameBn?: string;
  description: string;
  fabric: string;
  care: string;
  fitNotes?: string;
  section: Section;
  /** category slug (matches CATEGORIES) */
  category: string;
  categoryName: string;
  pricePaisa: number;
  compareAtPaisa?: number;
  images: ProductImage[];
  sizes: string[];
  colors: ProductColor[];
  variants: ProductVariant[];
  rating: number;
  reviewCount: number;
  isNew: boolean;
  isSale: boolean;
  isFeatured: boolean;
};

export type CategoryChild = { slug: string; name: string };

export type Category = {
  slug: string;
  name: string;
  nameBn?: string;
  section: Section;
  /** Navigation group slug (Traditional Wear, Topwear, Boys, …). */
  group?: string;
  image?: string;
  children?: CategoryChild[];
};

export type CategoryGroup = {
  slug: string;
  name: string;
  section: Section;
  children: CategoryChild[];
};

export const SECTIONS: VirtualSection[] = ["men", "women", "kids", "new-arrivals", "sale"];

export function isValidSection(s: string): s is VirtualSection {
  return (SECTIONS as string[]).includes(s);
}

export const SIZES_DEFAULT = ["S", "M", "L", "XL"] as const;

/* ------------------------------------------------------------------ */
/* Categories — single authoritative taxonomy (64 leaf categories).    */
/*                                                                     */
/* Groups are pure navigation groupings; leaves are the product         */
/* categories referenced by every product and route.                   */
/*                                                                     */
/* Counts: MEN 14 · WOMEN 14 · BOYS 16 · GIRLS 20 = 64                */
/* ------------------------------------------------------------------ */

type SectionGroupDef = { slug: string; name: string; children: string[] };

/** group slug → leaf slugs (ordering is the storefront display order). */
const GROUP_DEFS: Record<Section, SectionGroupDef[]> = {
  men: [
    {
      slug: "traditional-wear",
      name: "Traditional Wear",
      children: ["punjabi", "sherwani"],
    },
    {
      slug: "topwear",
      name: "Topwear",
      children: ["shirts", "t-shirts", "vests"],
    },
    {
      slug: "bottomwear",
      name: "Bottomwear",
      children: [
        "pants",
        "jeans",
        "gabardine-pants",
        "trousers",
        "three-quarter-pants",
        "two-quarter-pants",
      ],
    },
    {
      slug: "accessories-essentials",
      name: "Accessories & Essentials",
      children: ["ties", "wallets", "mens-undergarments"],
    },
  ],
  women: [
    {
      slug: "dresses-sets",
      name: "Dresses & Sets",
      children: [
        "womens-dresses",
        "gowns",
        "ready-made-three-piece-sets",
        "unstitched-three-piece-sets",
        "one-piece-outfits",
        "two-piece-sets",
        "three-piece-sets",
      ],
    },
    {
      slug: "sarees",
      name: "Sarees",
      children: ["katan-silk-sarees", "cotton-sarees", "jamdani-sarees", "party-wear-sarees"],
    },
    { slug: "ethnic-wear", name: "Ethnic Wear", children: ["lehengas"] },
    {
      slug: "accessories-essentials",
      name: "Accessories & Essentials",
      children: ["womens-handbags", "womens-undergarments"],
    },
  ],
  kids: [
    {
      slug: "boys",
      name: "Boys",
      children: [
        "boys-clothing-sets",
        "boys-t-shirts",
        "boys-shirts",
        "boys-polo-shirts",
        "boys-jeans",
        "boys-casual-pants",
        "boys-shorts",
        "boys-trousers",
        "boys-punjabi-kurta",
        "boys-sherwani",
        "boys-hoodies",
        "boys-jackets",
        "boys-sweaters",
        "boys-pajama-sets",
        "boys-tracksuits",
        "boys-undergarments",
      ],
    },
    {
      slug: "girls",
      name: "Girls",
      children: [
        "girls-clothing-sets",
        "girls-frocks",
        "girls-dresses",
        "girls-t-shirts",
        "girls-tops",
        "girls-skirts",
        "girls-jeans",
        "girls-leggings",
        "girls-casual-pants",
        "girls-one-piece-dresses",
        "girls-two-piece-sets",
        "girls-three-piece-sets",
        "girls-salwar-kameez",
        "girls-lehengas",
        "girls-gowns",
        "girls-hoodies",
        "girls-jackets",
        "girls-sweaters",
        "girls-nightwear",
        "girls-undergarments",
      ],
    },
  ],
};

/** leaf slug → display label (the 64 authoritative category names). */
const CATEGORY_NAMES: Record<string, string> = {
  // Men — Traditional Wear
  punjabi: "Punjabi (Traditional Kurta)",
  sherwani: "Sherwani",
  // Men — Topwear
  shirts: "Shirts",
  "t-shirts": "T-Shirts",
  vests: "Vests (Undershirts)",
  // Men — Bottomwear
  pants: "Pants",
  jeans: "Jeans",
  "gabardine-pants": "Gabardine Pants",
  trousers: "Trousers",
  "three-quarter-pants": "Three-Quarter Pants",
  "two-quarter-pants": "Two-Quarter Pants (Shorts)",
  // Men — Accessories & Essentials
  ties: "Ties",
  wallets: "Wallets",
  "mens-undergarments": "Men's Undergarments",

  // Women — Dresses & Sets
  "womens-dresses": "Women's Dresses",
  gowns: "Gowns",
  "ready-made-three-piece-sets": "Ready-Made Three-Piece Sets",
  "unstitched-three-piece-sets": "Unstitched Three-Piece Sets",
  "one-piece-outfits": "One-Piece Outfits",
  "two-piece-sets": "Two-Piece Sets",
  "three-piece-sets": "Three-Piece Sets",
  // Women — Sarees
  "katan-silk-sarees": "Katan Silk Sarees",
  "cotton-sarees": "Cotton Sarees",
  "jamdani-sarees": "Jamdani Sarees",
  "party-wear-sarees": "Party Wear Sarees",
  // Women — Ethnic Wear
  lehengas: "Lehengas",
  // Women — Accessories & Essentials
  "womens-handbags": "Women's Handbags",
  "womens-undergarments": "Women's Undergarments",

  // Boys
  "boys-clothing-sets": "Boys' Clothing Sets",
  "boys-t-shirts": "T-Shirts",
  "boys-shirts": "Shirts",
  "boys-polo-shirts": "Polo Shirts",
  "boys-jeans": "Jeans",
  "boys-casual-pants": "Casual Pants",
  "boys-shorts": "Shorts",
  "boys-trousers": "Trousers",
  "boys-punjabi-kurta": "Punjabi / Kurta",
  "boys-sherwani": "Sherwani",
  "boys-hoodies": "Hoodies",
  "boys-jackets": "Jackets",
  "boys-sweaters": "Sweaters",
  "boys-pajama-sets": "Pajama Sets",
  "boys-tracksuits": "Tracksuits",
  "boys-undergarments": "Undergarments",

  // Girls
  "girls-clothing-sets": "Girls' Clothing Sets",
  "girls-frocks": "Frocks",
  "girls-dresses": "Dresses",
  "girls-t-shirts": "T-Shirts",
  "girls-tops": "Tops",
  "girls-skirts": "Skirts",
  "girls-jeans": "Jeans",
  "girls-leggings": "Leggings",
  "girls-casual-pants": "Casual Pants",
  "girls-one-piece-dresses": "One-Piece Dresses",
  "girls-two-piece-sets": "Two-Piece Sets",
  "girls-three-piece-sets": "Three-Piece Sets",
  "girls-salwar-kameez": "Salwar Kameez",
  "girls-lehengas": "Lehengas",
  "girls-gowns": "Gowns",
  "girls-hoodies": "Hoodies",
  "girls-jackets": "Jackets",
  "girls-sweaters": "Sweaters",
  "girls-nightwear": "Nightwear",
  "girls-undergarments": "Undergarments",
};

const SECTION_ORDER: Section[] = ["men", "women", "kids"];

function toChild(slug: string): CategoryChild {
  return { slug, name: CATEGORY_NAMES[slug] ?? slug };
}

/** Navigation groups (group → ordered leaf categories). */
export const CATEGORY_GROUPS: CategoryGroup[] = SECTION_ORDER.flatMap((section) =>
  GROUP_DEFS[section].map((g) => ({
    slug: g.slug,
    name: g.name,
    section,
    children: g.children.map(toChild),
  })),
);

/** Flat leaf-category list (the product-facing taxonomy). */
export const CATEGORIES: Category[] = SECTION_ORDER.flatMap((section) =>
  GROUP_DEFS[section].flatMap((g) =>
    g.children.map((slug) => ({
      slug,
      name: CATEGORY_NAMES[slug] ?? slug,
      section,
      group: g.slug,
    })),
  ),
);

export function getCategoryGroups(section: Section): CategoryGroup[] {
  return GROUP_DEFS[section].map((g) => ({
    slug: g.slug,
    name: g.name,
    section,
    children: g.children.map(toChild),
  }));
}

export function getSectionCategories(section: Section): Category[] {
  return CATEGORIES.filter((c) => c.section === section);
}

export function getCategory(slug: string, list: Category[] = CATEGORIES): Category | undefined {
  const direct = list.find((c) => c.slug === slug);
  if (direct) return direct;
  for (const c of list) {
    const child = c.children?.find((k) => k.slug === slug);
    if (child) return { slug: child.slug, name: child.name, section: c.section };
  }
  return undefined;
}

/* ------------------------------------------------------------------ */
/* Variant builder                                                     */
/* ------------------------------------------------------------------ */

function buildVariants(
  prefix: string,
  sizes: string[],
  colors: ProductColor[],
  seed = 0,
): ProductVariant[] {
  const out: ProductVariant[] = [];
  sizes.forEach((size, si) => {
    colors.forEach((c, ci) => {
      const idx = si * colors.length + ci + seed;
      const stock = (prefix.length * 3 + idx * 7 + seed * 5) % 13; // 0–12 deterministic
      out.push({
        sku: `DEMO-${prefix}-${c.name.slice(0, 3).toUpperCase()}-${size}`,
        size,
        color: c.name,
        colorHex: c.hex,
        stock,
      });
    });
  });
  return out;
}

const S = ["S", "M", "L", "XL"];

/* ------------------------------------------------------------------ */
/* 24 demo products (8 per section)                                    */
/* ------------------------------------------------------------------ */

export const PRODUCTS: Product[] = [
  // ================= MEN =================
  {
    slug: "classic-cotton-panjabi-white",
    name: "Classic Cotton Panjabi — White",
    description:
      "Everyday premium cotton panjabi with metal buttons, side slits and a structured band collar. Breathable weave for Jummah, office and Eid.",
    fabric: "100% premium cotton, 140 GSM",
    care: "Machine wash cold, hang dry in shade, warm iron.",
    fitNotes: "Regular fit. Model is 5'9\" and wears size M.",
    section: "men",
    category: "punjabi",
    categoryName: "Punjabi (Traditional Kurta)",
    pricePaisa: 249000,
    compareAtPaisa: 299000,
    images: [
      { src: "/products/classic-cotton-panjabi-white-1.jpg", alt: "Classic Cotton Panjabi front view" },
      { src: "/products/classic-cotton-panjabi-white-2.jpg", alt: "Classic Cotton Panjabi collar detail" },
      { src: "/products/classic-cotton-panjabi-white-3.jpg", alt: "Classic Cotton Panjabi on model" }
    ],
    sizes: [...S],
    colors: [
      { name: "White", hex: "#f5f5f4" },
      { name: "Ecru", hex: "#e7dcc8" },
    ],
    variants: buildVariants("PANJABI01", S, [
      { name: "White", hex: "#f5f5f4" },
      { name: "Ecru", hex: "#e7dcc8" },
    ], 1),
    rating: 4.8,
    reviewCount: 214,
    isNew: true,
    isSale: true,
    isFeatured: true,
  },
  {
    slug: "premium-silk-panjabi-maroon",
    name: "Premium Silk Panjabi — Maroon",
    description:
      "Festive silk-blend panjabi with subtle self-jacquard, wooden buttons and contrast piping. Made for weddings and Eid mornings.",
    fabric: "Silk–cotton blend, artisanal finish",
    care: "Dry clean recommended. Cool iron inside out.",
    fitNotes: "Slim-regular fit with extra shoulder room.",
    section: "men",
    category: "punjabi",
    categoryName: "Punjabi (Traditional Kurta)",
    pricePaisa: 499000,
    compareAtPaisa: 599000,
    images: [
      { src: "/products/premium-silk-panjabi-maroon-1.jpg", alt: "Silk Panjabi front view" },
      { src: "/products/premium-silk-panjabi-maroon-2.jpg", alt: "Silk Panjabi fabric close-up" }
    ],
    sizes: [...S],
    colors: [
      { name: "Maroon", hex: "#7f1d1d" },
      { name: "Navy", hex: "#1e3a5f" },
    ],
    variants: buildVariants("SILK02", S, [
      { name: "Maroon", hex: "#7f1d1d" },
      { name: "Navy", hex: "#1e3a5f" },
    ], 2),
    rating: 4.9,
    reviewCount: 96,
    isNew: false,
    isSale: true,
    isFeatured: true,
  },
  {
    slug: "addi-panjabi-sky",
    name: "Addi Panjabi — Sky",
    description: "Featherlight Addi cotton panjabi with snap buttons. Coolest pick for summer prayers and all-day wear.",
    fabric: "Addi voile cotton",
    care: "Gentle machine wash, line dry.",
    section: "men",
    category: "punjabi",
    categoryName: "Punjabi (Traditional Kurta)",
    pricePaisa: 329000,
    images: [
      { src: "/products/addi-panjabi-sky-1.jpg", alt: "Addi Panjabi front" },
      { src: "/products/addi-panjabi-sky-2.jpg", alt: "Addi Panjabi back" }
    ],
    sizes: [...S],
    colors: [
      { name: "Sky", hex: "#bae6fd" },
      { name: "Mint", hex: "#a7f3d0" },
    ],
    variants: buildVariants("ADDI03", S, [
      { name: "Sky", hex: "#bae6fd" },
      { name: "Mint", hex: "#a7f3d0" },
    ], 3),
    rating: 4.6,
    reviewCount: 58,
    isNew: true,
    isSale: false,
    isFeatured: false,
  },
  {
    slug: "endi-fatua-natural",
    name: "Endi Fatua — Natural",
    description: "Handloom Endi fatua with wooden toggles. Textured, breathable, proudly heritage.",
    fabric: "Handloom Endi cotton",
    care: "Hand wash cold with mild detergent.",
    section: "men",
    category: "shirts",
    categoryName: "Shirts",
    pricePaisa: 189000,
    images: [
      { src: "/products/endi-fatua-natural-1.jpg", alt: "Endi Fatua front" },
      { src: "/products/endi-fatua-natural-2.jpg", alt: "Endi Fatua texture detail" }
    ],
    sizes: [...S],
    colors: [
      { name: "Natural", hex: "#d6c7a8" },
      { name: "Olive", hex: "#7e9181" },
    ],
    variants: buildVariants("FATUA04", S, [
      { name: "Natural", hex: "#d6c7a8" },
      { name: "Olive", hex: "#7e9181" },
    ], 4),
    rating: 4.7,
    reviewCount: 41,
    isNew: false,
    isSale: false,
    isFeatured: false,
  },
  {
    slug: "slim-chino-trousers-khaki",
    name: "Slim Chinos — Khaki",
    description: "Stretch twill chinos with clean tapered leg. Office to dawat without a change.",
    fabric: "Cotton twill with 2% elastane",
    care: "Machine wash, tumble low.",
    fitNotes: "Slim fit, mid-rise. Take usual size.",
    section: "men",
    category: "trousers",
    categoryName: "Trousers",
    pricePaisa: 179000,
    compareAtPaisa: 229000,
    images: [
      { src: "/products/slim-chino-trousers-khaki-1.jpg", alt: "Khaki chinos front" },
      { src: "/products/slim-chino-trousers-khaki-2.jpg", alt: "Khaki chinos detail" }
    ],
    sizes: [...S],
    colors: [
      { name: "Khaki", hex: "#c2a878" },
      { name: "Charcoal", hex: "#374151" },
    ],
    variants: buildVariants("CHINO05", S, [
      { name: "Khaki", hex: "#c2a878" },
      { name: "Charcoal", hex: "#374151" },
    ], 5),
    rating: 4.5,
    reviewCount: 133,
    isNew: false,
    isSale: true,
    isFeatured: false,
  },
  {
    slug: "executive-shirt-lightblue",
    name: "Executive Shirt — Light Blue",
    description: "Wrinkle-resistant poplin shirt with reinforced collar. Boardroom ready.",
    fabric: "Cotton poplin, easy-iron",
    care: "Machine wash, warm iron.",
    section: "men",
    category: "shirts",
    categoryName: "Shirts",
    pricePaisa: 159000,
    images: [
      { src: "/products/executive-shirt-lightblue-1.jpg", alt: "Executive shirt front" },
      { src: "/products/executive-shirt-lightblue-2.jpg", alt: "Executive shirt cuff detail" }
    ],
    sizes: [...S],
    colors: [
      { name: "Light Blue", hex: "#bfdbfe" },
      { name: "White", hex: "#ffffff" },
    ],
    variants: buildVariants("SHIRT06", S, [
      { name: "Light Blue", hex: "#bfdbfe" },
      { name: "White", hex: "#ffffff" },
    ], 6),
    rating: 4.4,
    reviewCount: 87,
    isNew: true,
    isSale: false,
    isFeatured: false,
  },
  {
    slug: "taaga-coaty-charcoal",
    name: "Taaga Coaty — Charcoal",
    description: "Structured sleeveless coaty to layer over any panjabi. Instant wedding-guest upgrade.",
    fabric: "Matte suiting blend",
    care: "Dry clean only.",
    section: "men",
    category: "sherwani",
    categoryName: "Sherwani",
    pricePaisa: 359000,
    images: [
      { src: "/products/taaga-coaty-charcoal-1.jpg", alt: "Coaty front" },
      { src: "/products/taaga-coaty-charcoal-2.jpg", alt: "Coaty layered look" }
    ],
    sizes: [...S],
    colors: [
      { name: "Charcoal", hex: "#374151" },
      { name: "Beige", hex: "#e5d5b8" },
    ],
    variants: buildVariants("COATY07", S, [
      { name: "Charcoal", hex: "#374151" },
      { name: "Beige", hex: "#e5d5b8" },
    ], 7),
    rating: 4.7,
    reviewCount: 29,
    isNew: false,
    isSale: false,
    isFeatured: true,
  },
  {
    slug: "comfort-lungi-check",
    name: "Comfort Lungi — Green Check",
    description: "Soft combed-cotton lungi with colourfast checks. Home essential.",
    fabric: "100% combed cotton",
    care: "Machine wash cold, sun dry.",
    section: "men",
    category: "pants",
    categoryName: "Pants",
    pricePaisa: 99000,
    compareAtPaisa: 129000,
    images: [
      { src: "/products/comfort-lungi-check-1.jpg", alt: "Lungi folded" },
      { src: "/products/comfort-lungi-check-2.jpg", alt: "Lungi check detail" }
    ],
    sizes: [...S],
    colors: [
      { name: "Green Check", hex: "#4d7c0f" },
      { name: "Blue Check", hex: "#1e40af" },
    ],
    variants: buildVariants("LUNGI08", S, [
      { name: "Green Check", hex: "#4d7c0f" },
      { name: "Blue Check", hex: "#1e40af" },
    ], 8),
    rating: 4.3,
    reviewCount: 302,
    isNew: false,
    isSale: true,
    isFeatured: false,
  },

  // ================= WOMEN =================
  {
    slug: "muslin-sharee-rose",
    name: "Muslin Sharee — Rose",
    description:
      "Whisper-light muslin sharee with hand-finished edge and unstitched blouse piece. Drapes like a dream for Eid and weddings.",
    fabric: "Pure muslin, blouse piece included",
    care: "Dry clean recommended, store folded in muslin cloth.",
    section: "women",
    category: "cotton-sarees",
    categoryName: "Cotton Sarees",
    pricePaisa: 549000,
    images: [
      { src: "/products/muslin-sharee-rose-1.jpg", alt: "Muslin sharee drape" },
      { src: "/products/muslin-sharee-rose-2.jpg", alt: "Muslin sharee border detail" },
      { src: "/products/muslin-sharee-rose-3.jpg", alt: "Muslin sharee blouse piece" }
    ],
    sizes: [...S],
    colors: [
      { name: "Rose", hex: "#f2ccc3" },
      { name: "Ivory", hex: "#faf7f2" },
    ],
    variants: buildVariants("SHAREE09", S, [
      { name: "Rose", hex: "#f2ccc3" },
      { name: "Ivory", hex: "#faf7f2" },
    ], 1),
    rating: 4.9,
    reviewCount: 178,
    isNew: true,
    isSale: false,
    isFeatured: true,
  },
  {
    slug: "jamdani-sharee-emerald",
    name: "Jamdani Sharee — Emerald",
    description: "Heritage Jamdani with discontinuous-weave motifs. A keeper piece woven in Demra tradition.",
    fabric: "Fine cotton-silk Jamdani",
    care: "Dry clean only. Kata wash by specialist as needed.",
    section: "women",
    category: "jamdani-sarees",
    categoryName: "Jamdani Sarees",
    pricePaisa: 899000,
    images: [
      { src: "/products/jamdani-sharee-emerald-1.jpg", alt: "Jamdani sharee full drape" },
      { src: "/products/jamdani-sharee-emerald-2.jpg", alt: "Jamdani motif close-up" }
    ],
    sizes: [...S],
    colors: [
      { name: "Emerald", hex: "#065f46" },
      { name: "Crimson", hex: "#991b1b" },
    ],
    variants: buildVariants("JAMD10", S, [
      { name: "Emerald", hex: "#065f46" },
      { name: "Crimson", hex: "#991b1b" },
    ], 2),
    rating: 5.0,
    reviewCount: 64,
    isNew: false,
    isSale: false,
    isFeatured: true,
  },
  {
    slug: "lawn-3pcs-mint",
    name: "Lawn 3Pcs — Mint",
    description: "Premium lawn kameez with embroidered neckline, straight pajama and chiffon dupatta. Everyday elegance.",
    fabric: "Swiss lawn + chiffon dupatta",
    care: "Gentle wash, dry in shade.",
    section: "women",
    category: "ready-made-three-piece-sets",
    categoryName: "Ready-Made Three-Piece Sets",
    pricePaisa: 299000,
    compareAtPaisa: 359000,
    images: [
      { src: "/products/lawn-3pcs-mint-1.jpg", alt: "Lawn 3pcs set" },
      { src: "/products/lawn-3pcs-mint-2.jpg", alt: "Lawn 3pcs embroidery detail" }
    ],
    sizes: [...S],
    colors: [
      { name: "Mint", hex: "#a7f3d0" },
      { name: "Peach", hex: "#fed7aa" },
    ],
    variants: buildVariants("LAWN11", S, [
      { name: "Mint", hex: "#a7f3d0" },
      { name: "Peach", hex: "#fed7aa" },
    ], 3),
    rating: 4.6,
    reviewCount: 241,
    isNew: false,
    isSale: true,
    isFeatured: false,
  },
  {
    slug: "cord-set-lavender",
    name: "Cord-Set — Lavender",
    description: "Relaxed co-ord set: boxy shirt + wide-leg trouser. Airport, brunch, repeat.",
    fabric: "Crepe blend, no iron needed",
    care: "Machine wash, hang dry.",
    section: "women",
    category: "two-piece-sets",
    categoryName: "Two-Piece Sets",
    pricePaisa: 249000,
    images: [
      { src: "/products/cord-set-lavender-1.jpg", alt: "Cord set front" },
      { src: "/products/cord-set-lavender-2.jpg", alt: "Cord set back" }
    ],
    sizes: [...S],
    colors: [
      { name: "Lavender", hex: "#ddd6fe" },
      { name: "Sand", hex: "#e7d8b7" },
    ],
    variants: buildVariants("CORD12", S, [
      { name: "Lavender", hex: "#ddd6fe" },
      { name: "Sand", hex: "#e7d8b7" },
    ], 4),
    rating: 4.5,
    reviewCount: 73,
    isNew: true,
    isSale: false,
    isFeatured: false,
  },
  {
    slug: "long-tunic-terracotta",
    name: "Long Tunic — Terracotta",
    description: "A-line long tunic with side slits and wooden buttons. Pairs with jeans or straight pants.",
    fabric: "Yarn-dyed cotton",
    care: "Machine wash cold.",
    section: "women",
    category: "womens-dresses",
    categoryName: "Women's Dresses",
    pricePaisa: 199000,
    images: [
      { src: "/products/long-tunic-terracotta-1.jpg", alt: "Long tunic front" },
      { src: "/products/long-tunic-terracotta-2.jpg", alt: "Long tunic side slit" }
    ],
    sizes: [...S],
    colors: [
      { name: "Terracotta", hex: "#d5573b" },
      { name: "Sage", hex: "#7e9181" },
    ],
    variants: buildVariants("TUNIC13", S, [
      { name: "Terracotta", hex: "#d5573b" },
      { name: "Sage", hex: "#7e9181" },
    ], 5),
    rating: 4.4,
    reviewCount: 52,
    isNew: false,
    isSale: false,
    isFeatured: false,
  },
  {
    slug: "georgette-gown-midnight",
    name: "Georgette Gown — Midnight",
    description: "Flowing georgette gown with inner slip and belt. Evening-ready in one step.",
    fabric: "Georgette with crepe lining",
    care: "Dry clean recommended.",
    section: "women",
    category: "gowns",
    categoryName: "Gowns",
    pricePaisa: 449000,
    compareAtPaisa: 529000,
    images: [
      { src: "/products/georgette-gown-midnight-1.jpg", alt: "Gown full length" },
      { src: "/products/georgette-gown-midnight-2.jpg", alt: "Gown waist detail" }
    ],
    sizes: [...S],
    colors: [
      { name: "Midnight", hex: "#172121" },
      { name: "Plum", hex: "#6b21a8" },
    ],
    variants: buildVariants("GOWN14", S, [
      { name: "Midnight", hex: "#172121" },
      { name: "Plum", hex: "#6b21a8" },
    ], 6),
    rating: 4.7,
    reviewCount: 39,
    isNew: false,
    isSale: true,
    isFeatured: false,
  },
  {
    slug: "casual-tops-floral",
    name: "Casual Top — Floral",
    description: "Soft rayon top with all-over floral print and smocked back. University-to-outing staple.",
    fabric: "Viscose rayon",
    care: "Gentle wash.",
    section: "women",
    category: "one-piece-outfits",
    categoryName: "One-Piece Outfits",
    pricePaisa: 129000,
    images: [
      { src: "/products/casual-tops-floral-1.jpg", alt: "Floral top front" },
      { src: "/products/casual-tops-floral-2.jpg", alt: "Floral top print detail" }
    ],
    sizes: [...S],
    colors: [
      { name: "Petal Pink", hex: "#f9a8d4" },
      { name: "Bloom Blue", hex: "#93c5fd" },
    ],
    variants: buildVariants("TOP15", S, [
      { name: "Petal Pink", hex: "#f9a8d4" },
      { name: "Bloom Blue", hex: "#93c5fd" },
    ], 7),
    rating: 4.2,
    reviewCount: 118,
    isNew: true,
    isSale: false,
    isFeatured: false,
  },
  {
    slug: "ladies-blazer-sand",
    name: "Ladies Blazer — Sand",
    description: "Single-breasted blazer with soft shoulder. Sharp over sharee-blouse or shirt.",
    fabric: "Poly-viscose suiting",
    care: "Dry clean only.",
    section: "women",
    category: "one-piece-outfits",
    categoryName: "One-Piece Outfits",
    pricePaisa: 399000,
    images: [
      { src: "/products/ladies-blazer-sand-1.jpg", alt: "Blazer front" },
      { src: "/products/ladies-blazer-sand-2.jpg", alt: "Blazer lapel detail" }
    ],
    sizes: [...S],
    colors: [
      { name: "Sand", hex: "#e7d8b7" },
      { name: "Black", hex: "#111827" },
    ],
    variants: buildVariants("BLAZER16", S, [
      { name: "Sand", hex: "#e7d8b7" },
      { name: "Black", hex: "#111827" },
    ], 8),
    rating: 4.6,
    reviewCount: 27,
    isNew: true,
    isSale: false,
    isFeatured: true,
  },

  // ================= KIDS =================
  {
    slug: "boys-kabli-mustard",
    name: "Boys Kabli — Mustard",
    description: "Mini kabli set with pajama. Soft cotton so he can run, jump and sit through the dawat.",
    fabric: "Soft cotton, elastic pajama",
    care: "Machine wash.",
    section: "kids",
    category: "boys-clothing-sets",
    categoryName: "Boys' Clothing Sets",
    pricePaisa: 149000,
    images: [
      { src: "/products/boys-kabli-mustard-1.jpg", alt: "Boys kabli set" },
      { src: "/products/boys-kabli-mustard-2.jpg", alt: "Boys kabli detail" }
    ],
    sizes: [...S],
    colors: [
      { name: "Mustard", hex: "#d97706" },
      { name: "Teal", hex: "#0d9488" },
    ],
    variants: buildVariants("KABLI17", S, [
      { name: "Mustard", hex: "#d97706" },
      { name: "Teal", hex: "#0d9488" },
    ], 1),
    rating: 4.8,
    reviewCount: 84,
    isNew: true,
    isSale: false,
    isFeatured: true,
  },
  {
    slug: "boys-panjabi-cream",
    name: "Boys Panjabi — Cream",
    description: "Classic boys panjabi with snap buttons at the back — easy change, no fuss.",
    fabric: "Cotton blend",
    care: "Machine wash.",
    section: "kids",
    category: "boys-punjabi-kurta",
    categoryName: "Punjabi / Kurta",
    pricePaisa: 139000,
    images: [
      { src: "/products/boys-panjabi-cream-1.jpg", alt: "Boys panjabi front" },
      { src: "/products/boys-panjabi-cream-2.jpg", alt: "Boys panjabi back snap" }
    ],
    sizes: [...S],
    colors: [
      { name: "Cream", hex: "#fef3c7" },
      { name: "Sky", hex: "#bae6fd" },
    ],
    variants: buildVariants("BPANJ18", S, [
      { name: "Cream", hex: "#fef3c7" },
      { name: "Sky", hex: "#bae6fd" },
    ], 2),
    rating: 4.7,
    reviewCount: 61,
    isNew: false,
    isSale: false,
    isFeatured: false,
  },
  {
    slug: "boys-denim-set-indigo",
    name: "Boys Denim Set — Indigo",
    description: "Denim shirt + jogger set with grow-room. Playground proof.",
    fabric: "Soft denim + jersey",
    care: "Machine wash inside out.",
    section: "kids",
    category: "boys-clothing-sets",
    categoryName: "Boys' Clothing Sets",
    pricePaisa: 189000,
    compareAtPaisa: 229000,
    images: [
      { src: "/products/boys-denim-set-indigo-1.jpg", alt: "Boys denim set" },
      { src: "/products/boys-denim-set-indigo-2.jpg", alt: "Boys denim set detail" }
    ],
    sizes: [...S],
    colors: [
      { name: "Indigo", hex: "#3730a3" },
      { name: "Stone", hex: "#a8a29e" },
    ],
    variants: buildVariants("BDEN19", S, [
      { name: "Indigo", hex: "#3730a3" },
      { name: "Stone", hex: "#a8a29e" },
    ], 3),
    rating: 4.5,
    reviewCount: 47,
    isNew: false,
    isSale: true,
    isFeatured: false,
  },
  {
    slug: "girls-3pcs-peach",
    name: "Girls 3Pcs — Peach",
    description: "Frock-style kameez with churidar and net dupatta. Twirl-approved for Eid.",
    fabric: "Georgette + cotton lining",
    care: "Gentle wash.",
    section: "kids",
    category: "girls-three-piece-sets",
    categoryName: "Three-Piece Sets",
    pricePaisa: 179000,
    images: [
      { src: "/products/girls-3pcs-peach-1.jpg", alt: "Girls 3pcs set" },
      { src: "/products/girls-3pcs-peach-2.jpg", alt: "Girls 3pcs dupatta detail" },
      { src: "/products/girls-3pcs-peach-3.jpg", alt: "Girls 3pcs back" }
    ],
    sizes: [...S],
    colors: [
      { name: "Peach", hex: "#fed7aa" },
      { name: "Mint", hex: "#a7f3d0" },
    ],
    variants: buildVariants("G3PCS20", S, [
      { name: "Peach", hex: "#fed7aa" },
      { name: "Mint", hex: "#a7f3d0" },
    ], 4),
    rating: 4.8,
    reviewCount: 92,
    isNew: true,
    isSale: false,
    isFeatured: false,
  },
  {
    slug: "girls-2pcs-sky",
    name: "Girls 2Pcs — Sky",
    description: "Printed tunic + pajama set in breathable cotton. School-to-play in comfort.",
    fabric: "100% cotton",
    care: "Machine wash.",
    section: "kids",
    category: "girls-two-piece-sets",
    categoryName: "Two-Piece Sets",
    pricePaisa: 159000,
    images: [
      { src: "/products/girls-2pcs-sky-1.jpg", alt: "Girls 2pcs set" },
      { src: "/products/girls-2pcs-sky-2.jpg", alt: "Girls 2pcs print detail" }
    ],
    sizes: [...S],
    colors: [
      { name: "Sky", hex: "#bae6fd" },
      { name: "Lemon", hex: "#fef08a" },
    ],
    variants: buildVariants("G2PCS21", S, [
      { name: "Sky", hex: "#bae6fd" },
      { name: "Lemon", hex: "#fef08a" },
    ], 5),
    rating: 4.6,
    reviewCount: 38,
    isNew: false,
    isSale: false,
    isFeatured: false,
  },
  {
    slug: "girls-jumpsuit-coral",
    name: "Girls Jumpsuit — Coral",
    description: "One-and-done jumpsuit with tie waist and pockets for treasures.",
    fabric: "Rayon twill",
    care: "Machine wash.",
    section: "kids",
    category: "girls-one-piece-dresses",
    categoryName: "One-Piece Dresses",
    pricePaisa: 149000,
    compareAtPaisa: 189000,
    images: [
      { src: "/products/girls-jumpsuit-coral-1.jpg", alt: "Girls jumpsuit front" },
      { src: "/products/girls-jumpsuit-coral-2.jpg", alt: "Girls jumpsuit pocket detail" }
    ],
    sizes: [...S],
    colors: [
      { name: "Coral", hex: "#fb7185" },
      { name: "Denim Blue", hex: "#60a5fa" },
    ],
    variants: buildVariants("GJUMP22", S, [
      { name: "Coral", hex: "#fb7185" },
      { name: "Denim Blue", hex: "#60a5fa" },
    ], 6),
    rating: 4.4,
    reviewCount: 25,
    isNew: false,
    isSale: true,
    isFeatured: false,
  },
  {
    slug: "kids-tee-duo-mint",
    name: "Kids Tee Duo — Mint / White",
    description: "Pack of 2 soft jersey tees. Tagless, itch-free, playground ready.",
    fabric: "Cotton jersey 180 GSM",
    care: "Machine wash.",
    section: "kids",
    category: "boys-t-shirts",
    categoryName: "T-Shirts",
    pricePaisa: 99000,
    images: [
      { src: "/products/kids-tee-duo-mint-1.jpg", alt: "Kids tee pack" },
      { src: "/products/kids-tee-duo-mint-2.jpg", alt: "Kids tee fabric" }
    ],
    sizes: [...S],
    colors: [
      { name: "Mint", hex: "#a7f3d0" },
      { name: "White", hex: "#ffffff" },
    ],
    variants: buildVariants("KTEE23", S, [
      { name: "Mint", hex: "#a7f3d0" },
      { name: "White", hex: "#ffffff" },
    ], 7),
    rating: 4.5,
    reviewCount: 140,
    isNew: false,
    isSale: false,
    isFeatured: false,
  },
  {
    slug: "girls-top-yellow",
    name: "Girls Top — Sunny Yellow",
    description: "Puff-sleeve top with smocked waist. Sunshine, wearable.",
    fabric: "Cotton poplin",
    care: "Gentle wash.",
    section: "kids",
    category: "girls-tops",
    categoryName: "Tops",
    pricePaisa: 89000,
    images: [
      { src: "/products/girls-top-yellow-1.jpg", alt: "Girls yellow top" },
      { src: "/products/girls-top-yellow-2.jpg", alt: "Girls top sleeve detail" }
    ],
    sizes: [...S],
    colors: [
      { name: "Yellow", hex: "#facc15" },
      { name: "Pink", hex: "#f9a8d4" },
    ],
    variants: buildVariants("GTOP24", S, [
      { name: "Yellow", hex: "#facc15" },
      { name: "Pink", hex: "#f9a8d4" },
    ], 8),
    rating: 4.3,
    reviewCount: 33,
    isNew: true,
    isSale: false,
    isFeatured: false,
  },
];

/* ------------------------------------------------------------------ */
/* Queries                                                             */
/* ------------------------------------------------------------------ */

export function getProduct(slug: string, list: Product[] = PRODUCTS): Product | undefined {
  return list.find((p) => p.slug === slug);
}

export type SortKey = "newest" | "price-asc" | "price-desc" | "rating" | "popular";

export type SectionFilter = {
  category?: string;
  sort?: SortKey | string;
  query?: string;
  maxPrice?: number;
  sizes?: string[];
  inStock?: boolean;
};

export function getBySection(section: string, f: SectionFilter = {}, list: Product[] = PRODUCTS): Product[] {
  let out = [...list];
  if (section === "new-arrivals") out = out.filter((p) => p.isNew);
  else if (section === "sale") out = out.filter((p) => p.isSale);
  else out = out.filter((p) => p.section === section);

  if (f.category) out = out.filter((p) => p.category === f.category);
  if (f.query) {
    const q = f.query.toLowerCase().trim();
    out = out.filter((p) =>
      `${p.name} ${p.categoryName} ${p.section} ${p.description}`.toLowerCase().includes(q),
    );
  }
  if (typeof f.maxPrice === "number" && Number.isFinite(f.maxPrice)) {
    out = out.filter((p) => effectivePrice(p) <= (f.maxPrice as number));
  }
  if (f.sizes && f.sizes.length > 0) {
    const want = new Set(f.sizes);
    out = out.filter((p) => p.sizes.some((s) => want.has(s)));
  }
  if (f.inStock) out = out.filter((p) => p.variants.some((v) => v.stock > 0));

  switch (f.sort) {
    case "price-asc":
      out.sort((a, b) => effectivePrice(a) - effectivePrice(b));
      break;
    case "price-desc":
      out.sort((a, b) => effectivePrice(b) - effectivePrice(a));
      break;
    case "rating":
      out.sort((a, b) => b.rating - a.rating);
      break;
    case "popular":
      out.sort((a, b) => b.reviewCount - a.reviewCount);
      break;
    case "newest":
      out.sort((a, b) => Number(b.isNew) - Number(a.isNew));
      break;
    default:
      break;
  }
  return out;
}

export function getNewArrivals(limit = 8, list: Product[] = PRODUCTS): Product[] {
  return list.filter((p) => p.isNew).slice(0, limit);
}

export function getSale(limit = 8, list: Product[] = PRODUCTS): Product[] {
  return list.filter((p) => p.isSale).slice(0, limit);
}

export function getFeatured(limit = 6, list: Product[] = PRODUCTS): Product[] {
  const feat = list.filter((p) => p.isFeatured);
  return (feat.length > 0 ? feat : list).slice(0, limit);
}

export function getRelated(product: Product, limit = 4, list: Product[] = PRODUCTS): Product[] {
  const others = list.filter((p) => p.slug !== product.slug);
  const sameCat = others.filter((p) => p.category === product.category);
  const sameSec = others.filter((p) => p.section === product.section && p.category !== product.category);
  const rest = others.filter((p) => p.section !== product.section);
  return [...sameCat, ...sameSec, ...rest].slice(0, limit);
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[-_]/g, " ").trim();
}

function isSubsequence(needle: string, haystack: string): boolean {
  const n = needle.replace(/\s+/g, "");
  const h = haystack.replace(/\s+/g, "");
  if (n.length === 0) return true;
  let j = 0;
  for (let i = 0; i < h.length && j < n.length; i++) {
    if (h[i] === n[j]) j++;
  }
  return j === n.length;
}

export function searchProducts(q: string, limit = 12, list: Product[] = PRODUCTS): Product[] {
  const query = normalize(q);
  if (!query) return [];
  const scored: { p: Product; score: number }[] = [];
  for (const p of list) {
    const hay = normalize(`${p.name} ${p.slug} ${p.categoryName} ${p.section} ${p.fabric}`);
    if (hay.includes(query)) {
      scored.push({ p, score: 0 });
    } else if (query.length >= 2 && isSubsequence(query, hay)) {
      scored.push({ p, score: 1 });
    }
  }
  scored.sort((a, b) => a.score - b.score || b.p.rating - a.p.rating);
  return scored.slice(0, limit).map((s) => s.p);
}

export function priceBounds(list: Product[] = PRODUCTS): { min: number; max: number } {
  let min = Number.POSITIVE_INFINITY;
  let max = 0;
  for (const p of list) {
    const e = effectivePrice(p);
    if (e < min) min = e;
    if (e > max) max = e;
  }
  return { min: min === Number.POSITIVE_INFINITY ? 0 : min, max };
}

export function effectivePrice(p: Product): number {
  return p.pricePaisa;
}

export function variantUnitPrice(p: Product, sku: string): number {
  const v = p.variants.find((x) => x.sku === sku);
  if (v?.priceOverridePaisa) return v.priceOverridePaisa;
  return p.pricePaisa;
}

export function variantBySku(sku: string, list: Product[] = PRODUCTS): { product: Product; variant: ProductVariant } | undefined {
  for (const p of list) {
    const v = p.variants.find((x) => x.sku === sku);
    if (v) return { product: p, variant: v };
  }
  return undefined;
}

/* Tiny client-safe index for the search palette (keeps bundle small). */
export type SearchIndexEntry = {
  slug: string;
  name: string;
  section: Section;
  category: string;
  categoryName: string;
};

export const SEARCH_INDEX: SearchIndexEntry[] = PRODUCTS.map((p) => ({
  slug: p.slug,
  name: p.name,
  section: p.section,
  category: p.category,
  categoryName: p.categoryName,
}));

/**
 * Bridge to the shared card type (`@/types/catalog`): fills the localized
 * fields the card requires from the demo data. The home page casts; prefer
 * this adapter in new code so missing fields surface here, not at call sites.
 */
export function asCatalogProduct(p: Product): CatalogProduct {
  return {
    slug: p.slug,
    name: p.name,
    nameBn: p.name,
    section: p.section,
    category: p.category,
    pricePaisa: p.pricePaisa,
    compareAtPaisa: p.compareAtPaisa,
    fabric: p.fabric,
    sizes: [...p.sizes],
    colors: p.colors.map((c) => ({ ...c })),
    images: p.images.map((i) => ({ ...i })),
    isNew: p.isNew,
    isSale: p.isSale,
    isFeatured: p.isFeatured,
    rating: p.rating,
    reviewCount: p.reviewCount,
    fabricCare: p.care,
    fitNotes: p.fitNotes ?? "",
    variants: p.variants.map((v) => ({
      sku: v.sku,
      size: v.size,
      color: v.color,
      colorHex: v.colorHex,
      stock: v.stock,
      pricePaisa: v.priceOverridePaisa ?? p.pricePaisa,
    })),
  };
}
