import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import {
  CATEGORIES,
  PRODUCTS,
  searchProducts,
  type Category,
  type Product,
  type Section,
} from "@/lib/catalog";

/**
 * Supabase-backed storefront data (server-only).
 *
 * Live-first with local fallback: every getter tries the public RLS-readable
 * tables and maps rows onto the exact `Product` / `Category` shapes the UI
 * already renders. Any failure (no env, network, RLS, empty) falls back to
 * the local TS mirror so pages never break — including offline builds.
 *
 * Slug bridges (DB uses section-prefixed slugs, URLs use short slugs):
 * - category leaves: strip `{section}-`, then CATEGORY_ALIASES.
 * - products: DB `demo-*` slugs are used as-is (they become the canonical
 *   /product/[slug] URLs once live).
 */

const IMAGE_FALLBACK: Record<string, string> = {
  men: "/hero/men.svg",
  women: "/hero/women.svg",
  kids: "/hero/kids.svg",
};

/** DB leaf slug (prefix-stripped) → local URL slug, for known divergences. */
const CATEGORY_ALIASES: Record<string, string> = {
  "panjabi-sets": "panjabi-pajama-sets",
  "sets-cotton": "pajama-set-cotton",
  "sets-silk": "pajama-set-silk",
  scarves: "scarves-mufflers",
  tshirts: "t-shirts",
  "shoes-shoes": "shoes-formal",
  "shoes-nagras": "shoes-nagra",
  sets: "pcs-sets",
  "sets-cord": "pcs-cord-set",
  "sets-3pcs": "pcs-3pcs",
  "sets-2pcs": "pcs-2pcs",
  tops: "tops-shirt",
  "tops-bd-polo": "tops-polo",
  "tops-tops": "tops-top",
  "boys-tank-top": "boys-tank",
  "girls-tshirts": "girls-tshirt",
};

export function mapCategorySlug(dbSlug: string, section: string): string {
  const stripped = dbSlug.startsWith(`${section}-`)
    ? dbSlug.slice(section.length + 1)
    : dbSlug;
  return CATEGORY_ALIASES[stripped] ?? stripped;
}

interface DbCategory {
  id: string;
  parent_id: string | null;
  slug: string;
  name: string;
  name_bn: string | null;
  section: "men" | "women" | "kids";
  sort: number | null;
  image_path: string | null;
}

interface DbProduct {
  id: string;
  slug: string;
  name: string;
  name_bn: string | null;
  description: string | null;
  description_bn: string | null;
  section: "men" | "women" | "kids";
  category_id: string | null;
  price_paisa: number;
  compare_at_paisa: number | null;
  fabric: string | null;
  care: string | null;
  fit_notes: string | null;
  is_new: boolean | null;
  is_sale: boolean | null;
  is_featured: boolean | null;
  active: boolean | null;
  categories?: { slug: string; name: string } | null;
}

interface DbVariant {
  product_id: string;
  sku: string;
  size: string;
  color: string;
  color_hex: string | null;
  stock: number;
  price_override_paisa: number | null;
}

interface DbImage {
  product_id: string;
  position: number;
  path_thumb: string | null;
  path_medium: string | null;
  path_large: string | null;
  alt: string | null;
}

interface DbReview {
  product_id: string;
  rating: number;
}

interface DbReviewRow {
  user_id: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  created_at: string | null;
}

interface DbProfile {
  id: string;
  full_name: string | null;
}

/** Review shape the UI renders (mirrors components/reviews.tsx). */
export interface LiveReview {
  name: string;
  rating: number;
  title: string;
  body: string;
  date: string;
}

type ServerSupabase = NonNullable<Awaited<ReturnType<typeof createClient>>>;

async function fetchCategories(): Promise<Category[] | null> {
  const supabase = createPublicClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("categories")
    .select("id, parent_id, slug, name, name_bn, section, sort, image_path")
    .order("sort", { ascending: true, nullsFirst: false })
    .order("slug", { ascending: true });
  if (error || !data || data.length === 0) return null;
  const rows = data as unknown as DbCategory[];
  const byId = new Map(rows.map((r) => [r.id, r]));
  const rootIds = new Set(rows.filter((r) => r.parent_id === null).map((r) => r.id));

  // New taxonomy: sections (parent NULL) → groups (parent = section) → leaves
  // (parent = group). Map level-3 leaves onto the flat Category shape.
  const leaves: Category[] = [];
  for (const row of rows) {
    if (!row.parent_id || rootIds.has(row.parent_id)) continue; // roots + groups
    const groupRow = byId.get(row.parent_id);
    if (!groupRow?.parent_id || !rootIds.has(groupRow.parent_id)) continue;
    leaves.push({
      slug: mapCategorySlug(row.slug, row.section),
      name: row.name,
      nameBn: row.name_bn ?? undefined,
      section: row.section,
      group: mapCategorySlug(groupRow.slug, row.section),
    });
  }

  // Guard: the live tree must match the authoritative local taxonomy (64 leaf
  // slugs per section), otherwise fall back so the storefront never renders a
  // stale category tree after a taxonomy change.
  if (leaves.length !== CATEGORIES.length) return null;
  const localBySection = new Map<Section, Set<string>>();
  for (const c of CATEGORIES) {
    const set = localBySection.get(c.section) ?? new Set<string>();
    set.add(c.slug);
    localBySection.set(c.section, set);
  }
  const liveBySection = new Map<Section, Set<string>>();
  for (const l of leaves) {
    const set = liveBySection.get(l.section) ?? new Set<string>();
    set.add(l.slug);
    liveBySection.set(l.section, set);
  }
  for (const [section, localSet] of localBySection) {
    const liveSet = liveBySection.get(section);
    if (!liveSet || liveSet.size !== localSet.size) return null;
    for (const slug of localSet) if (!liveSet.has(slug)) return null;
  }
  return leaves;
}

async function fetchProducts(): Promise<Product[] | null> {
  const supabase = createPublicClient();
  if (!supabase) return null;
  const { data: prows, error: perror } = await supabase
    .from("products")
    .select(
      "id, slug, name, name_bn, description, description_bn, section, category_id, price_paisa, compare_at_paisa, fabric, care, fit_notes, is_new, is_sale, is_featured, active, categories:category_id(slug, name)",
    )
    .eq("active", true)
    .is("deleted_at", null)
    .order("slug", { ascending: true });
  if (perror || !prows || prows.length === 0) return null;
  const products = prows as unknown as DbProduct[];
  const ids = products.map((p) => p.id);
  const [{ data: vrows }, { data: irows }, { data: rrows }] = await Promise.all([
    supabase
      .from("product_variants")
      .select("product_id, sku, size, color, color_hex, stock, price_override_paisa")
      .in("product_id", ids)
      .order("sku", { ascending: true }),
    supabase
      .from("product_images")
      .select("product_id, position, path_thumb, path_medium, path_large, alt")
      .in("product_id", ids)
      .order("position", { ascending: true }),
    supabase
      .from("reviews")
      .select("product_id, rating")
      .in("product_id", ids)
      .eq("approved", true),
  ]);
  const variants = (vrows ?? []) as unknown as DbVariant[];
  const images = (irows ?? []) as unknown as DbImage[];
  const reviews = (rrows ?? []) as unknown as DbReview[];

  const byProduct = new Map<string, DbVariant[]>();
  for (const v of variants) {
    const arr = byProduct.get(v.product_id) ?? [];
    arr.push(v);
    byProduct.set(v.product_id, arr);
  }
  const imgByProduct = new Map<string, DbImage[]>();
  for (const im of images) {
    const arr = imgByProduct.get(im.product_id) ?? [];
    arr.push(im);
    imgByProduct.set(im.product_id, arr);
  }
  const ratings = new Map<string, { sum: number; n: number }>();
  for (const r of reviews) {
    const cur = ratings.get(r.product_id) ?? { sum: 0, n: 0 };
    cur.sum += r.rating;
    cur.n += 1;
    ratings.set(r.product_id, cur);
  }

  const out: Product[] = [];
  for (const p of products) {
    if (p.section !== "men" && p.section !== "women" && p.section !== "kids") continue;
    const vs = byProduct.get(p.id) ?? [];
    if (vs.length === 0) continue; // purchasable products need variants
    const sizes: string[] = [];
    const colors: { name: string; hex: string }[] = [];
    for (const v of vs) {
      if (!sizes.includes(v.size)) sizes.push(v.size);
      if (!colors.some((c) => c.name === v.color)) {
        colors.push({ name: v.color, hex: v.color_hex ?? "#172121" });
      }
    }
    const ims = imgByProduct.get(p.id) ?? [];
    const fb = IMAGE_FALLBACK[p.section];
    const mappedImages = (
      ims.length > 0
        ? ims.map((im) => ({
            src: im.path_medium ?? im.path_large ?? im.path_thumb ?? fb,
            alt: im.alt ?? p.name,
          }))
        : [{ src: fb, alt: p.name }]
    );
    const catSlug = p.categories?.slug;
    const catName = p.categories?.name ?? "";
    const agg = ratings.get(p.id);
    out.push({
      slug: p.slug,
      name: p.name,
      nameBn: p.name_bn ?? undefined,
      description: p.description ?? "",
      fabric: p.fabric ?? "",
      care: p.care ?? "",
      fitNotes: p.fit_notes ?? undefined,
      section: p.section,
      category: catSlug ? mapCategorySlug(catSlug, p.section) : "",
      categoryName: catName,
      pricePaisa: p.price_paisa,
      compareAtPaisa: p.compare_at_paisa ?? undefined,
      images: mappedImages,
      sizes,
      colors,
      variants: vs.map((v) => ({
        sku: v.sku,
        size: v.size,
        color: v.color,
        colorHex: v.color_hex ?? "#172121",
        stock: v.stock,
        priceOverridePaisa: v.price_override_paisa,
      })),
      rating: agg && agg.n > 0 ? Math.round((agg.sum / agg.n) * 10) / 10 : 0,
      reviewCount: agg?.n ?? 0,
      isNew: p.is_new ?? false,
      isSale: p.is_sale ?? false,
      isFeatured: p.is_featured ?? false,
    });
  }
  if (out.length === 0) return null;
  // Guard: products must reference categories from the authoritative local
  // taxonomy; a stale DB tree falls back to the local mirror so filters,
  // category pages and related products stay consistent.
  const knownCategories = new Set(CATEGORIES.map((c) => c.slug));
  if (!out.every((p) => knownCategories.has(p.category))) return null;
  return out;
}

async function fetchLiveReviews(productSlug: string): Promise<LiveReview[] | null> {
  const supabase = createPublicClient();
  if (!supabase) return null;
  // Resolve slug → product id via the products table, then approved reviews only.
  const { data: prow, error: perror } = await supabase
    .from("products")
    .select("id")
    .eq("slug", productSlug)
    .maybeSingle();
  if (perror || !prow) return null;
  const { data: rrows, error: rerror } = await supabase
    .from("reviews")
    .select("user_id, rating, title, body, created_at")
    .eq("product_id", prow.id)
    .eq("approved", true)
    .order("created_at", { ascending: false });
  if (rerror || !rrows || rrows.length === 0) return null;
  const rows = rrows as unknown as DbReviewRow[];
  // Batch-resolve reviewer names; guest reviews (user_id NULL) stay "Verified buyer".
  const uids = [...new Set(rows.map((r) => r.user_id).filter((u): u is string => !!u))];
  const names = new Map<string, string>();
  if (uids.length > 0) {
    const { data: prows, error: prerror } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", uids);
    if (!prerror && prows) {
      for (const p of prows as unknown as DbProfile[]) names.set(p.id, p.full_name ?? "");
    }
  }
  return rows.map((r) => ({
    name: r.user_id ? names.get(r.user_id) || "Verified buyer" : "Verified buyer",
    rating: r.rating,
    title: r.title ?? "",
    body: r.body ?? "",
    date: (r.created_at ?? "").slice(0, 10),
  }));
}

/** Live reviews (Supabase, approved only). null = unavailable → demo fallback. Per-request cached. */
export const getLiveReviews = cache(async (productSlug: string): Promise<LiveReview[] | null> => {
  try {
    const live = await fetchLiveReviews(productSlug);
    if (live) return live;
  } catch (e) {
    console.warn("storefront: live reviews failed, demo fallback", e);
  }
  return null;
});

/** Live products (Supabase) with local fallback. Per-request cached. */
export const getLiveProducts = cache(async (): Promise<{ products: Product[]; live: boolean }> => {
  try {
    const live = await fetchProducts();
    if (live) return { products: live, live: true };
  } catch (e) {
    console.warn("storefront: live products failed, local fallback", e);
  }
  return { products: PRODUCTS, live: false };
});

/** Live categories (Supabase) with local fallback. Per-request cached. */
export const getLiveCategories = cache(async (): Promise<{ categories: Category[]; live: boolean }> => {
  try {
    const live = await fetchCategories();
    if (live) return { categories: live, live: true };
  } catch (e) {
    console.warn("storefront: live categories failed, local fallback", e);
  }
  return { categories: CATEGORIES, live: false };
});

/** Live search (Supabase RPC) with local fallback. Per-request cached. */
export const getLiveSearch = cache(
  async (q: string, limit = 24): Promise<{ products: Product[]; live: boolean }> => {
    const trimmed = q.trim();
    if (!trimmed) return { products: [], live: false };
    try {
      const supabase = createPublicClient();
      if (!supabase) throw new Error("no supabase client");
      const { data, error } = await supabase.rpc("search_products", {
        q: trimmed,
        p_section: null,
        p_limit: limit,
      });
      if (error || !data || data.length === 0) {
        return { products: searchProducts(trimmed, limit, PRODUCTS), live: false };
      }
      const { products } = await getLiveProducts();
      const bySlug = new Map(products.map((p) => [p.slug, p]));
      const matched = (data as Array<{ slug: string }>)
        .map((r) => bySlug.get(r.slug))
        .filter((p): p is Product => p !== undefined);
      if (matched.length === 0) {
        return { products: searchProducts(trimmed, limit, PRODUCTS), live: false };
      }
      return { products: matched, live: true };
    } catch (e) {
      console.warn("storefront: live search failed, local fallback", e);
      return { products: searchProducts(trimmed, limit, PRODUCTS), live: false };
    }
  },
);

// Orders (auth-gated) ----------------------------------------------------------------

export interface OrderEvent {
  id: string;
  status: string;
  note: string | null;
  actor: string | null;
  created_at: string;
}

export interface LiveOrder {
  id: string;
  order_no: string;
  status: string;
  payment_status: string;
  total_paisa: number;
  created_at: string;
  events: OrderEvent[];
}

interface DbOrder {
  id: string;
  order_no: string;
  status: string;
  payment_status: string;
  total_paisa: number;
  created_at: string;
}

/**
 * Live orders for the signed-in user, with their order_events timelines.
 *
 * Uses the anon cookie client (never the service role) so RLS applies:
 * policy "orders owner read" restricts rows to auth.uid() = user_id, and
 * "events read via order" scopes events to those orders. Returns null on any
 * failure (no env, network, RLS) so the UI can fall back instead of crashing.
 */
export async function getLiveOrders(userId: string): Promise<LiveOrder[] | null> {
  try {
    const supabase: ServerSupabase | null = await createClient();
    if (!supabase) return null;
    const { data: orows, error: oerror } = await supabase
      .from("orders")
      .select("id, order_no, status, payment_status, total_paisa, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (oerror || !orows) return null;
    const orders = orows as unknown as DbOrder[];
    if (orders.length === 0) return [];
    const ids = orders.map((o) => o.id);
    const { data: erows, error: eerror } = await supabase
      .from("order_events")
      .select("id, order_id, status, note, actor, created_at")
      .in("order_id", ids)
      .order("created_at", { ascending: true });
    if (eerror || !erows) return null;
    const events = erows as unknown as (OrderEvent & { order_id: string })[];
    const eventsByOrder = new Map<string, OrderEvent[]>();
    for (const ev of events) {
      const arr = eventsByOrder.get(ev.order_id) ?? [];
      arr.push({ id: ev.id, status: ev.status, note: ev.note, actor: ev.actor, created_at: ev.created_at });
      eventsByOrder.set(ev.order_id, arr);
    }
    return orders.map((o) => ({ ...o, events: eventsByOrder.get(o.id) ?? [] }));
  } catch (e) {
    console.warn("storefront: live orders failed, offline fallback", e);
    return null;
  }
}
