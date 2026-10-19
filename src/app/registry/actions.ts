"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

const MAX_LIMIT = 50;
const SECTION_FALLBACK_IMAGE: Record<string, string> = {
  men: "/hero/men.jpg",
  women: "/hero/women.jpg",
  kids: "/hero/kids.jpg",
};

export type RegistryStatus = "active" | "inactive" | "deleted";

export interface RegistryProduct {
  id: string;
  slug: string;
  name: string;
  type: string;
  price: number;
  compareAt: number | null;
  active: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  image: string | null;
  images: string[];
  sizes: string[];
  status: RegistryStatus;
}

export interface RegistryListResult {
  products: RegistryProduct[];
  hasNextPage: boolean;
  page: number;
  limit: number;
}

interface DbVariantRow {
  size: string | null;
}

interface DbImageRow {
  path_thumb: string | null;
  alt: string | null;
  position: number;
}

interface DbProductRow {
  id: string;
  slug: string;
  name: string;
  section: string;
  price_paisa: number;
  compare_at_paisa: number | null;
  active: boolean | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  product_variants: DbVariantRow[] | null;
  product_images: DbImageRow[] | null;
}

function statusOf(row: Pick<DbProductRow, "active" | "deleted_at">): RegistryStatus {
  if (row.deleted_at) return "deleted";
  return row.active === false ? "inactive" : "active";
}

function mapRow(r: DbProductRow): RegistryProduct {
  const variants = r.product_variants ?? [];
  const sizes = [...new Set(variants.map((v) => v.size).filter((s): s is string => !!s))];
  const images = r.product_images ?? [];
  const thumbs = [...new Set(
    [...images]
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      .map((im) => im.path_thumb)
      .filter((s): s is string => !!s),
  )];
  const image = thumbs[0] ?? SECTION_FALLBACK_IMAGE[r.section] ?? null;
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    type: r.section,
    price: r.price_paisa,
    compareAt: r.compare_at_paisa,
    active: r.active ?? false,
    deletedAt: r.deleted_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    image,
    images: thumbs,
    sizes,
    status: statusOf(r),
  };
}

export async function getRegistryProducts(f: {
  page?: number;
  limit?: number;
  q?: string | null;
  type?: string | null;
  size?: string | null;
  status?: string | null;
} = {}): Promise<RegistryListResult> {
  await requireStaff();
  const supabase = createServiceRoleClient();
  if (!supabase) {
    return { products: [], hasNextPage: false, page: f.page ?? 1, limit: MAX_LIMIT };
  }

  const page = Number.isFinite(Number(f.page ?? 1)) ? Math.max(1, Number(f.page)) : 1;
  const limit = Math.min(Math.max(1, Number(f.limit ?? MAX_LIMIT)), MAX_LIMIT);
  const offset = (page - 1) * limit;

  // Filters run in the DATABASE, before paging. Filtering the fetched page in
  // JS (the previous behaviour) meant any match past the first page was never
  // seen and `hasNextPage` was computed from the filtered slice of one page.
  let query = supabase
    .from("products")
    .select(
      `id, slug, name, section, price_paisa, compare_at_paisa, active, deleted_at, created_at, updated_at,
      product_variants(size),
      product_images(path_thumb, alt, position)`
    );

  // status is derived from deleted_at/active; "" = all (matches the UI default).
  if (f.status === "deleted") {
    query = query.not("deleted_at", "is", null);
  } else if (f.status === "inactive") {
    query = query.is("deleted_at", null).eq("active", false);
  } else if (f.status === "active") {
    query = query.is("deleted_at", null).eq("active", true);
  }

  if (f.type) query = query.eq("section", f.type);

  if (f.q) {
    // Strip characters that would break PostgREST's `or` grammar.
    const safe = f.q.replace(/[%,()*]/g, " ").trim();
    if (safe) query = query.or(`name.ilike.%${safe}%,slug.ilike.%${safe}%`);
  }

  if (f.size) {
    // Resolve product ids with a variant of this size first, then keep the
    // main select's unfiltered variant list (so the card's sizes stay whole).
    const { data: vrows, error: verror } = await supabase
      .from("product_variants")
      .select("product_id")
      .eq("size", f.size);
    if (verror) return { products: [], hasNextPage: false, page, limit };
    const ids = [...new Set((vrows ?? []).map((v) => String((v as { product_id: string }).product_id)))];
    if (ids.length === 0) return { products: [], hasNextPage: false, page, limit };
    query = query.in("id", ids);
  }

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit); // +1 row to detect next page (bounded query)

  if (error || !data) {
    return { products: [], hasNextPage: false, page, limit };
  }

  const rows = (data as unknown as DbProductRow[]).map(mapRow);
  const hasNextPage = rows.length > limit;
  return { products: rows.slice(0, limit), hasNextPage, page, limit };
}

export async function getRegistryProduct(id: string): Promise<RegistryProduct | null> {
  await requireStaff();
  const supabase = createServiceRoleClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("products")
    .select(
      `id, slug, name, section, price_paisa, compare_at_paisa, active, deleted_at, created_at, updated_at,
      product_variants(size, color),
      product_images(path_thumb, path_medium, alt, position)`
    )
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return mapRow(data as unknown as DbProductRow);
}

type SoftDeleteResult = { ok: true } | { ok: false; error: string };

/** Next.js <form action> typing only allows void returns; server actions may
 *  return values at runtime, so call sites cast through this type. */
export type RegistryFormAction = (formData: FormData) => void | Promise<void>;

export async function softDeleteProduct(formData: FormData): Promise<SoftDeleteResult> {
  "use server";
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, error: "Missing product id" };
  const supabase = createServiceRoleClient();
  if (!supabase) return { ok: false, error: "Supabase not configured" };
  const { error } = await supabase
    .from("products")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/registry");
  revalidatePath(`/registry/products/${id}`);
  return { ok: true };
}

export async function restoreProduct(formData: FormData): Promise<SoftDeleteResult> {
  "use server";
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, error: "Missing product id" };
  const supabase = createServiceRoleClient();
  if (!supabase) return { ok: false, error: "Supabase not configured" };
  const { error } = await supabase.from("products").update({ deleted_at: null }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/registry");
  revalidatePath(`/registry/products/${id}`);
  return { ok: true };
}

export interface UpdateRegistryProductInput {
  id: string;
  name: string;
  section: "men" | "women" | "kids";
  price_paisa: number;
  active: boolean;
}

export async function updateRegistryProduct(formData: FormData): Promise<{ ok: true } | { ok: false; error: string }> {
  "use server";
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const section = String(formData.get("section") ?? "");
  const price_paisa = Number(formData.get("price_paisa"));
  const active = formData.get("active") === "on";
  if (!id) return { ok: false, error: "Missing product id" };
  if (!name) return { ok: false, error: "Name is required" };
  if (section !== "men" && section !== "women" && section !== "kids") {
    return { ok: false, error: "Invalid section" };
  }
  if (!Number.isFinite(price_paisa) || price_paisa < 0) {
    return { ok: false, error: "Invalid price" };
  }
  const supabase = createServiceRoleClient();
  if (!supabase) return { ok: false, error: "Supabase not configured" };
  const { error } = await supabase
    .from("products")
    .update({ name, section, price_paisa, active })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/registry");
  redirect(`/registry/products/${id}?saved=1`);
}
