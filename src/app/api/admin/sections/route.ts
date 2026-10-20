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
    .from("site_sections")
    .select("*")
    .order("sort", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ sections: data ?? [] });
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

  let body: {
    action: "save" | "delete" | "reorder";
    key?: string;
    label?: string;
    kind?: string;
    sort?: number;
    enabled?: boolean;
    content?: unknown;
    styles?: Record<string, string>;
    keys?: string[];
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { action } = body;

  if (action === "save") {
    const { key, label, kind, sort, enabled, content, styles } = body;
    if (!key) return NextResponse.json({ error: "Key required" }, { status: 400 });

    const { data: existing } = await supabase
      .from("site_sections")
      .select("key, content, styles")
      .eq("key", key)
      .maybeSingle();

    let section;
    if (existing) {
      const { data, error } = await supabase
        .from("site_sections")
        .update({
          label,
          kind,
          sort,
          enabled,
          content,
          styles,
        })
        .eq("key", key)
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      section = data;

      await supabase.from("content_versions").insert({
        section_key: key,
        content: content ?? existing.content,
        styles: styles ?? existing.styles,
        editor: "admin",
        message: `Updated ${key}`,
      });
    } else {
      const { data, error } = await supabase
        .from("site_sections")
        .insert({
          key,
          label: label ?? key,
          kind: kind ?? "custom",
          sort: sort ?? 0,
          enabled: enabled ?? true,
          content: content ?? {},
          styles: styles ?? {},
        })
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      section = data;

      await supabase.from("content_versions").insert({
        section_key: key,
        content: content ?? {},
        styles: styles ?? {},
        editor: "admin",
        message: `Created ${key}`,
      });
    }

    revalidatePath("/");
    revalidatePath("/admin/sections");
    return NextResponse.json({ ok: true, section });
  }

  if (action === "delete") {
    const { key } = body;
    if (!key) return NextResponse.json({ error: "Key required" }, { status: 400 });

    const { error } = await supabase.from("site_sections").delete().eq("key", key);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    revalidatePath("/");
    revalidatePath("/admin/sections");
    return NextResponse.json({ ok: true });
  }

  if (action === "reorder") {
    const { keys } = body;
    if (!Array.isArray(keys)) return NextResponse.json({ error: "Keys array required" }, { status: 400 });

    const updates = keys.map((k, i) =>
      supabase.from("site_sections").update({ sort: i * 10 }).eq("key", k)
    );
    const results = await Promise.all(updates);
    const firstError = results.find((r) => r.error);
    if (firstError?.error) return NextResponse.json({ error: firstError.error.message }, { status: 500 });

    revalidatePath("/");
    revalidatePath("/admin/sections");
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}