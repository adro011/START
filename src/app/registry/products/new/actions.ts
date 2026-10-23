"use server";

import { z } from "zod";
import { getSession } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { registryFormSchema } from "./product-form";

type RegistryProductInput = z.infer<typeof registryFormSchema>;

export async function saveRegistryProduct(
  input: RegistryProductInput,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  // 1. Session gate — registry staff only. All async, awaited, try/catch.
  let session;
  try {
    session = await getSession();
  } catch {
    return { ok: false, error: "Unable to verify session." };
  }
  if (!session || (session.role !== "admin" && session.role !== "staff")) {
    return { ok: false, error: "Registry staff sign-in required." };
  }

  // 2. Server-side re-validation — never trust the client.
  let parsed: RegistryProductInput;
  try {
    parsed = registryFormSchema.parse(input);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return {
        ok: false,
        error: err.errors.map((e) => `${String(e.path.join(".")) || "form"}: ${e.message}`).join(" · "),
      };
    }
    return { ok: false, error: "Invalid input." };
  }

  // 3. Persist — service-role client (server only), every async op awaited.
  const supabase = createServiceRoleClient();
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured in this environment." };
  }

  const section: "men" | "women" | "kids" = (() => {
    if (parsed.type === "women" || parsed.type === "female") return "women";
    if (parsed.type === "children") return "kids";
    if (parsed.type === "new-arrivals") {
      if (parsed.newArrivalAudience === "women") return "women";
      if (parsed.newArrivalAudience === "children") return "kids";
      return "men";
    }
    return "men";
  })();

  let productId: string | null = null;
  try {
    const { data, error } = await supabase
      .from("products")
      .insert({
        name: parsed.name,
        slug: parsed.slug,
        description: parsed.description,
        section,
        category_id: null,
        price_paisa: Math.round((parsed.price ?? 0) * 100),
        compare_at_paisa: null,
        is_new: parsed.type === "new-arrivals",
        active: parsed.status === "published",
      })
      .select("id")
      .single();
    if (error) return { ok: false, error: error.message };
    productId = data.id;
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to create product." };
  }

  if (productId && parsed.images.length > 0) {
    try {
      const imageRows = parsed.images.slice(0, 5).map((file, index) => ({
        product_id: productId,
        position: index + 1,
        path_thumb: null,
        path_medium: file.name,
        path_large: null,
        alt: "",
        blur_data_url: null,
      }));
      const { error } = await supabase.from("product_images").insert(imageRows);
      if (error) return { ok: false, error: error.message };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "Failed to attach images." };
    }
  }

  return { ok: true, id: productId! };
}
