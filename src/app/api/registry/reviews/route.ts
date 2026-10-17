import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import {
  REGISTRY_API_UNAUTHORIZED,
  getRegistryApiSession,
} from "@/lib/registry/api-auth";

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;

const ListQuerySchema = z.object({
  product_id: z.string().uuid(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
});

const CreateReviewSchema = z.object({
  product_id: z.string().uuid(),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().max(200).optional().nullable(),
  body: z.string().max(5000).optional().nullable(),
  photos: z.array(z.string().max(1000)).max(3).optional().nullable(),
  user_id: z.string().uuid().optional().nullable(),
});

const idempotencyStore = new Map<string, { status: number; body: unknown }>();

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Idempotency-Key",
  };
}

function json(body: unknown, status = 200): NextResponse {
  return NextResponse.json(body, { status, headers: corsHeaders() });
}

export async function OPTIONS(): Promise<Response> {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function GET(request: Request): Promise<Response> {
  try {
    const session = await getRegistryApiSession();
    if (!session) return json(REGISTRY_API_UNAUTHORIZED, 401);

    const searchParams = new URL(request.url).searchParams;
    const parsed = ListQuerySchema.safeParse({
      product_id: searchParams.get("product_id"),
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });
    if (!parsed.success) {
      return json({ ok: false, error: parsed.error.issues[0]?.message ?? "Invalid query" }, 400);
    }

    const { product_id, page, limit } = parsed.data;
    const offset = (page - 1) * limit;

    const supabase = createServiceRoleClient();
    if (!supabase) {
      return json({ ok: false, error: "Supabase not configured" }, 500);
    }

    const { data, error, count } = await supabase
      .from("reviews")
      .select("*", { count: "exact" })
      .eq("product_id", product_id)
      .eq("approved", true)
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });

    if (error) {
      return json({ ok: false, error: error.message }, 500);
    }

    return json({
      ok: true,
      reviews: data ?? [],
      page,
      limit,
      total: count ?? 0,
      totalPages: Math.max(1, Math.ceil((count ?? 0) / limit)),
    });
  } catch {
    return json({ ok: false, error: "Unexpected error" }, 500);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const session = await getRegistryApiSession();
    if (!session) return json(REGISTRY_API_UNAUTHORIZED, 401);

    const ip = (request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "anon")
      .split(",")[0]
      ?.trim() ?? "anon";
    if (!rateLimit(`registry:create-review:${ip}`, 20, 60 * 1000).allowed) {
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

    const parsed = CreateReviewSchema.safeParse(body);
    if (!parsed.success) {
      return json({ ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }, 400);
    }

    const supabase = createServiceRoleClient();
    if (!supabase) {
      return json({ ok: false, error: "Supabase not configured" }, 500);
    }

    const insertPayload = stripUndefined(parsed.data);
    const { data, error } = await supabase.from("reviews").insert(insertPayload).select().single();

    if (error || !data) {
      return json({ ok: false, error: error?.message ?? "Failed to create review" }, 500);
    }

    const response = { ok: true, review: data };
    if (idempotencyKey) {
      idempotencyStore.set(idempotencyKey, { status: 201, body: response });
    }
    return json(response, 201);
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
