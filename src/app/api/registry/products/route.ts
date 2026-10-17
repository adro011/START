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

const SectionSchema = z.enum(["men", "women", "kids"]);

const ListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
  section: SectionSchema.optional(),
  active: z.coerce.boolean().optional(),
  search: z.string().max(200).optional(),
});

const CreateProductSchema = z.object({
  slug: z.string().min(1).max(200),
  name: z.string().min(1).max(255),
  description: z.string().min(1).max(5000),
  section: SectionSchema,
  category_id: z.string().uuid().optional().nullable(),
  price_paisa: z.coerce.number().int().nonnegative(),
  compare_at_paisa: z.coerce.number().int().nonnegative().optional().nullable(),
  fabric: z.string().max(500).optional().nullable(),
  care: z.string().max(500).optional().nullable(),
  fit_notes: z.string().max(500).optional().nullable(),
  is_new: z.coerce.boolean().default(false),
  is_sale: z.coerce.boolean().default(false),
  is_featured: z.coerce.boolean().default(false),
  active: z.coerce.boolean().default(true),
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
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      section: searchParams.get("section") ?? undefined,
      active: searchParams.get("active") ?? undefined,
      search: searchParams.get("search") ?? undefined,
    });
    if (!parsed.success) {
      return json({ ok: false, error: parsed.error.issues[0]?.message ?? "Invalid query" }, 400);
    }

    const { page, limit, section, active, search } = parsed.data;
    const offset = (page - 1) * limit;

    const supabase = createServiceRoleClient();
    if (!supabase) {
      return json({ ok: false, error: "Supabase not configured" }, 500);
    }

    let query = supabase.from("products").select("*", { count: "exact" }).is("deleted_at", null);
    if (section) query = query.eq("section", section);
    if (active !== undefined) query = query.eq("active", active);
    if (search) query = query.ilike("name", `%${search}%`);

    const { data, error, count } = await query
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });

    if (error) {
      return json({ ok: false, error: error.message }, 500);
    }

    return json({
      ok: true,
      products: data ?? [],
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
    if (!rateLimit(`registry:create-product:${ip}`, 10, 60 * 1000).allowed) {
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

    const parsed = CreateProductSchema.safeParse(body);
    if (!parsed.success) {
      return json({ ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }, 400);
    }

    const supabase = createServiceRoleClient();
    if (!supabase) {
      return json({ ok: false, error: "Supabase not configured" }, 500);
    }

    const insertPayload = stripUndefined(parsed.data);
    const { data, error } = await supabase.from("products").insert(insertPayload).select().single();

    if (error || !data) {
      return json({ ok: false, error: error?.message ?? "Failed to create product" }, 500);
    }

    const response = { ok: true, product: data };
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
