import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceRoleClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("theme_tokens")
    .select("*")
    .order("key", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ tokens: data ?? [] });
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceRoleClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  let body: { key: string; value: string; description?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { key, value, description } = body;
  if (!key || value === undefined) {
    return NextResponse.json({ error: "Key and value required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("theme_tokens")
    .upsert({ key, value, description: description ?? null })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath("/");
  revalidatePath("/admin/theme");
  return NextResponse.json({ ok: true, token: data });
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceRoleClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  let body: { key: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { key } = body;
  if (!key) return NextResponse.json({ error: "Key required" }, { status: 400 });

  const { error } = await supabase.from("theme_tokens").delete().eq("key", key);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath("/");
  revalidatePath("/admin/theme");
  return NextResponse.json({ ok: true });
}