import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import {
  REGISTRY_API_UNAUTHORIZED,
  getRegistryApiSession,
} from "@/lib/registry/api-auth";

const SectionSchema = z.enum(["men", "women", "kids"]);

const UpdateProductSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().min(1).max(5000).optional(),
  section: SectionSchema.optional(),
  category_id: z.string().uuid().optional().nullable(),
  price_paisa: z.coerce.number().int().nonnegative().optional(),
  compare_at_paisa: z.coerce.number().int().nonnegative().optional().nullable(),
  fabric: z.string().max(500).optional().nullable(),
  care: z.string().max(500).optional().nullable(),
  fit_notes: z.string().max(500).optional().nullable(),
  is_new: z.coerce.boolean().optional(),
  is_sale: z.coerce.boolean().optional(),
  is_featured: z.coerce.boolean().optional(),
  active: z.coerce.boolean().optional(),
});

const idempotencyStore = new Map<string, { status: number; body: unknown }>();

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Idempotency-Key",
  };
}

function json(body: unknown, status = 200): NextResponse {
  return NextResponse.json(body, { status, headers: corsHeaders() });
}

export async function OPTIONS(): Promise<Response> {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    const session = await getRegistryApiSession();
    if (!session) return json(REGISTRY_API_UNAUTHORIZED, 401);

    const { id } = await params;
    const supabase = createServiceRoleClient();
    if (!supabase) {
      return json({ ok: false, error: "Supabase not configured" }, 500);
    }

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (error || !data) {
      return json({ ok: false, error: error?.message ?? "Product not found" }, 404);
    }

    return json({ ok: true, product: data });
  } catch {
    return json({ ok: false, error: "Unexpected error" }, 500);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    const session = await getRegistryApiSession();
    if (!session) return json(REGISTRY_API_UNAUTHORIZED, 401);

    const { id } = await params;
    const ip = (request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "anon")
      .split(",")[0]
      ?.trim() ?? "anon";
    if (!rateLimit(`registry:update-product:${ip}`, 20, 60 * 1000).allowed) {
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

    const parsed = UpdateProductSchema.safeParse(body);
    if (!parsed.success) {
      return json({ ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }, 400);
    }

    const supabase = createServiceRoleClient();
    if (!supabase) {
      return json({ ok: false, error: "Supabase not configured" }, 500);
    }

    const updatePayload = stripUndefined(parsed.data);
    if (Object.keys(updatePayload).length === 0) {
      return json({ ok: false, error: "No fields to update" }, 400);
    }

    const { data, error } = await supabase
      .from("products")
      .update(updatePayload)
      .eq("id", id)
      .is("deleted_at", null)
      .select()
      .single();

    if (error || !data) {
      return json({ ok: false, error: error?.message ?? "Product not found" }, 404);
    }

    const response = { ok: true, product: data };
    if (idempotencyKey) {
      idempotencyStore.set(idempotencyKey, { status: 200, body: response });
    }
    return json(response);
  } catch {
    return json({ ok: false, error: "Unexpected error" }, 500);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    const session = await getRegistryApiSession();
    if (!session) return json(REGISTRY_API_UNAUTHORIZED, 401);

    const { id } = await params;
    const ip = (request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "anon")
      .split(",")[0]
      ?.trim() ?? "anon";
    if (!rateLimit(`registry:delete-product:${ip}`, 10, 60 * 1000).allowed) {
      return json({ ok: false, error: "Rate limited. Try again later." }, 429);
    }

    const supabase = createServiceRoleClient();
    if (!supabase) {
      return json({ ok: false, error: "Supabase not configured" }, 500);
    }

    const { error } = await supabase
      .from("products")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .is("deleted_at", null);

    if (error) {
      return json({ ok: false, error: error.message }, 500);
    }

    return json({ ok: true, message: "Product soft-deleted" });
  } catch {
    return json({ ok: false, error: "Unexpected error" }, 500);
  }
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned as T;
}
