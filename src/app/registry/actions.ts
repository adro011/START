"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

const MAX_LIMIT = 50;
const SECTION_FALLBACK_IMAGE: Record<string, string> = {
  men: "/hero/men.svg",
  women: "/hero/women.svg",
  kids: "/hero/kids.svg",
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
  const ordered = [...images].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  const image =
    ordered.find((im) => im.path_thumb)?.path_thumb ??
    SECTION_FALLBACK_IMAGE[r.section] ??
    null;
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

  const { data, error } = await supabase
    .from("products")
    .select(
      `id, slug, name, section, price_paisa, compare_at_paisa, active, deleted_at, created_at, updated_at,
      product_variants(size),
      product_images(path_thumb, alt, position)`
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit); // +1 row to detect next page (bounded query)

  if (error || !data) {
    return { products: [], hasNextPage: false, page, limit };
  }

  let products = (data as unknown as DbProductRow[]).map(mapRow);

  if (f.q) {
    const q = f.q.toLowerCase().trim();
    products = products.filter((p) => p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q));
  }
  if (f.type) products = products.filter((p) => p.type === f.type);
  if (f.size) products = products.filter((p) => p.sizes.includes(f.size));
  if (f.status) products = products.filter((p) => p.status === f.status);

  const hasNextPage = products.length > limit;
  return { products: products.slice(0, limit), hasNextPage, page, limit };
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
  const section = formData.get("section");
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
  revalidatePath(`/registry/products/${id}`);
  return { ok: true };
}
