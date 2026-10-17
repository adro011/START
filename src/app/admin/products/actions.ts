"use server";

import { revalidatePath } from "next/cache";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export interface SaveProductInput {
  id?: string;
  name: string;
  slug: string;
  section: "men" | "women" | "kids";
  category: string;
  price_paisa: number;
  compare_at_paisa: number | null;
  active: boolean;
  sizes: string[];
  colors: { name: string; hex: string }[];
  stock: Record<string, number>;
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
  const supabase = createServiceRoleClient();
  if (!supabase) return { ok: false, error: "Supabase not configured" };

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
        price_paisa: input.price_paisa,
        compare_at_paisa: input.compare_at_paisa,
        active: input.active,
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
        price_paisa: input.price_paisa,
        compare_at_paisa: input.compare_at_paisa,
        active: input.active,
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

  const variants = input.sizes.flatMap((size) =>
    input.colors.map((color) => ({
      product_id: productId,
      sku: buildSku(input.slug, size, color.name),
      size,
      color: color.name,
      color_hex: color.hex,
      stock: Math.max(0, input.stock[`${size}__${color.name}`] ?? 0),
    }))
  );
  if (variants.length > 0) {
    const { error: varErr } = await supabase.from("product_variants").insert(variants);
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

  revalidatePath("/admin/products");
  return { ok: true, id: productId! };
}
