"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export interface VariantInput {
  size: string;
  color: string;
  colorHex: string;
  stock: number;
  /** Variant-specific selling price (paisa). Omit/null → inherit base price. */
  priceOverridePaisa?: number | null;
  sku?: string;
}

export interface SaveProductInput {
  id?: string;
  name: string;
  slug: string;
  section: "men" | "women" | "kids";
  category: string;
  description?: string;
  fabric?: string;
  price_paisa: number;
  compare_at_paisa: number | null;
  active: boolean;
  is_new?: boolean;
  is_sale?: boolean;
  is_featured?: boolean;
  variants: VariantInput[];
  images: { position: number; alt: string; name: string }[];
}

export type SaveProductResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

function buildSku(slug: string, size: string, color: string): string {
  return `${slug}-${size}-${color}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function saveProduct(input: SaveProductInput): Promise<SaveProductResult> {
  await requireAdmin();
  const supabase = createServiceRoleClient();
  if (!supabase) return { ok: false, error: "Supabase not configured" };

  if (!Number.isFinite(input.price_paisa) || input.price_paisa < 0) {
    return { ok: false, error: "Price must be a non-negative number." };
  }
  if (
    input.compare_at_paisa != null &&
    (!Number.isFinite(input.compare_at_paisa) || input.compare_at_paisa <= input.price_paisa)
  ) {
    return { ok: false, error: "Compare-at price must be greater than the selling price." };
  }

  let productId = input.id;

  if (!productId) {
    const { data: bySlug } = await supabase
      .from("products")
      .select("id")
      .eq("slug", input.slug)
      .maybeSingle();
    productId = bySlug?.id;
  }

  let categoryId: string | null = null;
  if (input.category) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", input.category)
      .maybeSingle();
    categoryId = cat?.id ?? null;
  }

  if (productId) {
    const { error } = await supabase
      .from("products")
      .update({
        name: input.name,
        slug: input.slug,
        section: input.section,
        category_id: categoryId,
        description: input.description ?? undefined,
        fabric: input.fabric ?? undefined,
        price_paisa: input.price_paisa,
        compare_at_paisa: input.compare_at_paisa,
        active: input.active,
        is_new: input.is_new ?? false,
        is_sale: input.is_sale ?? false,
        is_featured: input.is_featured ?? false,
      })
      .eq("id", productId);
    if (error) return { ok: false, error: error.message };
  } else {
    const { data, error } = await supabase
      .from("products")
      .insert({
        name: input.name,
        slug: input.slug,
        section: input.section,
        category_id: categoryId,
        description: input.description ?? "",
        fabric: input.fabric ?? "",
        price_paisa: input.price_paisa,
        compare_at_paisa: input.compare_at_paisa,
        active: input.active,
        is_new: input.is_new ?? false,
        is_sale: input.is_sale ?? false,
        is_featured: input.is_featured ?? false,
      })
      .select("id")
      .single();
    if (error) return { ok: false, error: error.message };
    productId = data.id;
  }

  const { error: delVarErr } = await supabase
    .from("product_variants")
    .delete()
    .eq("product_id", productId!);
  if (delVarErr) return { ok: false, error: delVarErr.message };

  if (input.variants.length > 0) {
    const rows = input.variants.map((v) => ({
      product_id: productId,
      sku: v.sku?.trim() || buildSku(input.slug, v.size, v.color),
      size: v.size,
      color: v.color,
      color_hex: v.colorHex,
      stock: Math.max(0, v.stock),
      price_override_paisa: v.priceOverridePaisa ?? null,
    }));
    const { error: varErr } = await supabase.from("product_variants").insert(rows);
    if (varErr) return { ok: false, error: varErr.message };
  }

  const { error: delImgErr } = await supabase
    .from("product_images")
    .delete()
    .eq("product_id", productId!);
  if (delImgErr) return { ok: false, error: delImgErr.message };

  if (input.images.length > 0) {
    const imageRows = input.images.map((img) => ({
      product_id: productId,
      position: img.position,
      path_medium: img.name,
      alt: img.alt,
    }));
    const { error: imgErr } = await supabase.from("product_images").insert(imageRows);
    if (imgErr) return { ok: false, error: imgErr.message };
  }

  revalidatePath("/");
  revalidatePath("/admin/products");
  revalidatePath("/admin/products/[id]", "page");
  return { ok: true, id: productId! };
}
