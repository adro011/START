import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

const MAX_IMAGES = 5;
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"];

const AddImageSchema = z.object({
  path_thumb: z.string().min(1).max(1000),
  path_medium: z.string().max(1000).optional().nullable(),
  path_large: z.string().max(1000).optional().nullable(),
  alt: z.string().max(200).optional().nullable(),
  position: z.coerce.number().int().min(1).max(MAX_IMAGES).optional(),
});

const RemoveImageSchema = z.object({
  image_id: z.string().uuid(),
});

const idempotencyStore = new Map<string, { status: number; body: unknown }>();

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Idempotency-Key",
  };
}

function json(body: unknown, status = 200): NextResponse {
  return NextResponse.json(body, { status, headers: corsHeaders() });
}

export async function OPTIONS(): Promise<Response> {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

function isImageUrl(url: string): boolean {
  const path = url.split("?")[0].split("#")[0].toLowerCase();
  return IMAGE_EXTENSIONS.some((ext) => path.endsWith(ext));
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    const { id } = await params;
    const ip = (request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "anon")
      .split(",")[0]
      ?.trim() ?? "anon";
    if (!rateLimit(`registry:add-image:${ip}`, 20, 60 * 1000).allowed) {
      return json({ ok: false, error: "Rate limited. Try again later." }, 429);
    }

    const idempotencyKey = request.headers.get("Idempotency-Key");
    if (idempotencyKey) {
      const cached = idempotencyStore.get(idempotencyKey);
      if (cached) {
        return json(cached.body, cached.status);
      }
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return json({ ok: false, error: "Invalid JSON" }, 400);
    }

    const parsed = AddImageSchema.safeParse(body);
    if (!parsed.success) {
      return json({ ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }, 400);
    }
    const { path_thumb, path_medium, path_large, alt, position } = parsed.data;

    if (!isImageUrl(path_thumb)) {
      return json(
        { ok: false, error: "path_thumb must be an image (jpg, jpeg, png, webp, avif, gif)" },
        400,
      );
    }
    if (path_medium && !isImageUrl(path_medium)) {
      return json({ ok: false, error: "path_medium must be an image URL" }, 400);
    }
    if (path_large && !isImageUrl(path_large)) {
      return json({ ok: false, error: "path_large must be an image URL" }, 400);
    }

    const supabase = createServiceRoleClient();
    if (!supabase) {
      return json({ ok: false, error: "Supabase not configured" }, 500);
    }

    const { count: existingCount } = await supabase
      .from("product_images")
      .select("id", { count: "exact", head: true })
      .eq("product_id", id);
    if ((existingCount ?? 0) >= MAX_IMAGES) {
      return json({ ok: false, error: "Max 5 images per product" }, 409);
    }

    let insertPosition: number;
    if (position !== undefined) {
      insertPosition = position;
    } else {
      const { data: rows } = await supabase
        .from("product_images")
        .select("position")
        .eq("product_id", id)
        .order("position", { ascending: false })
        .limit(1);
      insertPosition = Number(rows?.[0]?.position ?? 0) + 1;
    }

    const { data, error } = await supabase
      .from("product_images")
      .insert({ product_id: id, position: insertPosition, path_thumb, path_medium, path_large, alt })
      .select()
      .single();

    if (error || !data) {
      return json({ ok: false, error: error?.message ?? "Failed to add image" }, 500);
    }

    const response = { ok: true, image: data };
    if (idempotencyKey) {
      idempotencyStore.set(idempotencyKey, { status: 201, body: response });
    }
    return json(response, 201);
  } catch {
    return json({ ok: false, error: "Unexpected error" }, 500);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    const { id } = await params;
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return json({ ok: false, error: "Invalid JSON" }, 400);
    }

    const parsed = RemoveImageSchema.safeParse(body);
    if (!parsed.success) {
      return json({ ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }, 400);
    }

    const supabase = createServiceRoleClient();
    if (!supabase) {
      return json({ ok: false, error: "Supabase not configured" }, 500);
    }

    const { error } = await supabase
      .from("product_images")
      .delete()
      .eq("id", parsed.data.image_id)
      .eq("product_id", id);

    if (error) {
      return json({ ok: false, error: error.message }, 500);
    }

    return json({ ok: true, message: "Image removed" });
  } catch {
    return json({ ok: false, error: "Unexpected error" }, 500);
  }
}
