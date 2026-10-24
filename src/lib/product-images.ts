import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

/** Storage bucket created in supabase/migrations/0002_rls.sql (public read, staff write). */
const BUCKET = "product-images";
const MAX_IMAGES = 5;
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB per image
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/jpg"]);

export const IMAGE_COUNT_CAP = MAX_IMAGES;

function publicUrlFor(path: string): string | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!base) return null;
  return `${base}/storage/v1/object/public/${BUCKET}/${path}`;
}

function safeName(name: string): string {
  const base = name.toLowerCase().replace(/\.[a-z0-9]+$/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return (base || "image").slice(0, 48);
}

export type UploadResult =
  | { ok: true; urls: string[] }
  | { ok: false; error: string };

/** Uploads a single image at an explicit position, returning the public URL. */
export async function uploadProductImage(
  productId: string,
  position: number,
  file: File,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const supabase = createServiceRoleClient();
  if (!supabase) return { ok: false, error: "Supabase is not configured in this environment." };
  if (!file || typeof file.arrayBuffer !== "function") {
    return { ok: false, error: "Invalid image file." };
  }
  if (file.type && !ALLOWED_TYPES.has(file.type.toLowerCase())) {
    return { ok: false, error: `${file.name} is not an accepted image format (JPEG, PNG, WebP, AVIF).` };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: `${file.name} exceeds the 10 MB limit.` };
  }
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${productId}/${position}-${safeName(file.name)}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, {
    contentType: file.type || `image/${ext === "jpg" ? "jpeg" : ext}`,
    upsert: true,
  });
  if (error) return { ok: false, error: `${file.name}: ${error.message}` };
  const url = publicUrlFor(path);
  if (!url) return { ok: false, error: "NEXT_PUBLIC_SUPABASE_URL is not set." };
  return { ok: true, url };
}

/**
 * Uploads product images to the public `product-images` bucket and returns the
 * public object URLs in input order. Storage path: `<productId>/<position>-<slug>.<ext>`.
 */
export async function uploadProductImages(productId: string, files: File[]): Promise<UploadResult> {
  if (files.length === 0) return { ok: true, urls: [] };
  if (files.length > MAX_IMAGES) {
    return { ok: false, error: `Maximum ${MAX_IMAGES} images per product.` };
  }
  const supabase = createServiceRoleClient();
  if (!supabase) return { ok: false, error: "Supabase is not configured in this environment." };

  const urls: string[] = [];
  for (let i = 0; i < files.length; i += 1) {
    const res = await uploadProductImage(productId, i + 1, files[i]);
    if (!res.ok) return { ok: false, error: res.error };
    urls.push(res.url);
  }
  return { ok: true, urls };
}
