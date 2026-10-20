"use server";

import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import { z } from "zod";

/* -------------------------------------------------------------------------- */
/*  Zod schemas per section kind                                              */
/* -------------------------------------------------------------------------- */

const PanelItemSchema = z.object({
  index: z.number().int().nonnegative(),
  title: z.string().min(1),
  slug: z.string().min(1),
  image: z.string().url().or(z.string().startsWith("/")).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

const CtaSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
});

const CoverContentSchema = z.object({
  headline: z.string().min(1),
  subheadline: z.string().optional(),
  cta: CtaSchema.optional(),
  background: z.string().optional(),
});

const PanelsContentSchema = z.object({
  panels: z.array(PanelItemSchema).min(1).max(6),
});

const StatementContentSchema = z.object({
  title: z.string().min(1),
  body: z.string().optional(),
  cta: CtaSchema.optional(),
  image: z.string().optional(),
});

const GridContentSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  section: z.enum(["men", "women", "kids"]).optional(),
  limit: z.number().int().positive().max(24).optional(),
  showViewAll: z.boolean().optional(),
  viewAllHref: z.string().optional(),
  items: z
    .array(
      z.object({
        title: z.string().min(1),
        slug: z.string().min(1),
        image: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .optional(),
});

const SplitContentSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  cta: CtaSchema.optional(),
  image: z.string().optional(),
  badge: z.string().optional(),
  items: z
    .array(
      z.object({
        title: z.string().min(1),
        slug: z.string().min(1),
        image: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .optional(),
});

const CarouselContentSchema = z.object({
  title: z.string().optional(),
  items: z.array(
    z.object({
      quote: z.string().min(1),
      author: z.string().min(1),
      role: z.string().optional(),
    })
  ),
});

const TrustContentSchema = z.object({
  items: z.array(
    z.object({
      icon: z.string().min(1),
      title: z.string().min(1),
      description: z.string().optional(),
    })
  ),
});

const InstagramContentSchema = z.object({
  title: z.string().optional(),
  handle: z.string().optional(),
  limit: z.number().int().positive().max(12).optional(),
});

const NewsletterContentSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  placeholder: z.string().optional(),
  button: z.string().min(1),
  privacyNote: z.string().optional(),
});

const CustomContentSchema = z.record(z.unknown());

/* -------------------------------------------------------------------------- */
/*  Type exports                                                              */
/* -------------------------------------------------------------------------- */

export type CoverContent = z.infer<typeof CoverContentSchema>;
export type PanelsContent = z.infer<typeof PanelsContentSchema>;
export type StatementContent = z.infer<typeof StatementContentSchema>;
export type GridContent = z.infer<typeof GridContentSchema>;
export type SplitContent = z.infer<typeof SplitContentSchema>;
export type CarouselContent = z.infer<typeof CarouselContentSchema>;
export type TrustContent = z.infer<typeof TrustContentSchema>;
export type InstagramContent = z.infer<typeof InstagramContentSchema>;
export type NewsletterContent = z.infer<typeof NewsletterContentSchema>;
export type CustomContent = z.infer<typeof CustomContentSchema>;

export type SectionKind =
  | "hero"
  | "panels"
  | "statement"
  | "grid"
  | "split"
  | "carousel"
  | "trust"
  | "instagram"
  | "newsletter"
  | "custom";

export interface SiteSection {
  key: string;
  label: string;
  kind: SectionKind;
  sort: number;
  enabled: boolean;
  content: unknown;
  styles: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface ThemeToken {
  key: string;
  value: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContentVersion {
  id: number;
  section_key: string;
  content: unknown;
  styles: Record<string, string>;
  editor: string | null;
  message: string | null;
  created_at: string;
}

/* -------------------------------------------------------------------------- */
/*  Validation helpers                                                        */
/* -------------------------------------------------------------------------- */

const KIND_SCHEMA: Record<SectionKind, z.ZodSchema<unknown>> = {
  hero: CoverContentSchema,
  panels: PanelsContentSchema,
  statement: StatementContentSchema,
  grid: GridContentSchema,
  split: SplitContentSchema,
  carousel: CarouselContentSchema,
  trust: TrustContentSchema,
  instagram: InstagramContentSchema,
  newsletter: NewsletterContentSchema,
  custom: CustomContentSchema,
};

function validateContent(kind: SectionKind, content: unknown): unknown {
  const schema = KIND_SCHEMA[kind];
  if (!schema) return content;
  const result = schema.safeParse(content);
  return result.success ? result.data : content;
}

function validateStyles(styles: unknown): Record<string, string> {
  if (!styles || typeof styles !== "object") return {};
  const allowedKeys = new Set([
    // Colors
    "color-primary-gold",
    "color-primary-gold-hover",
    "color-primary-gold-text",
    "color-accent-cyan",
    "color-accent-link-blue",
    "color-accent-teal-action",
    "color-semantic-success",
    "color-semantic-error",
    "color-semantic-warning",
    "color-semantic-info",
    "color-surface-level0",
    "color-surface-level1",
    "color-surface-level2",
    "color-surface-level3",
    "color-surface-level4",
    "color-surface-level5",
    "color-border-primary",
    "color-border-secondary",
    "color-border-focus",
    // Typography
    "font-family-display",
    "font-family-ui",
    "font-family-mono",
    "font-size-hero",
    "font-size-display2",
    "font-size-display3",
    "font-size-display4",
    "font-size-feature",
    "font-size-card-title",
    "font-size-body-large",
    "font-size-body",
    "font-size-body-small",
    "font-size-caption",
    // Spacing
    "space-4",
    "space-6",
    "space-8",
    "space-10",
    "space-12",
    "space-14",
    // Durations
    "duration-fast",
    "duration-standard",
    "duration-slow",
    "duration-hero",
    // Easing
    "easing-lamborghini",
    "easing-spring",
    // Stagger
    "stagger-tight",
    "stagger-standard",
    "stagger-section",
  ]);
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(styles as Record<string, unknown>)) {
    if (allowedKeys.has(k) && typeof v === "string") {
      out[k] = v;
    }
  }
  return out;
}

/* -------------------------------------------------------------------------- */
/*  Server-only getters (cached per request)                                  */
/* -------------------------------------------------------------------------- */

export const getSiteSections = cache(async (): Promise<SiteSection[]> => {
  try {
    const supabase = createPublicClient();
    if (!supabase) throw new Error("no supabase client");
    const { data, error } = await supabase
      .from("site_sections")
      .select("*")
      .eq("enabled", true)
      .order("sort", { ascending: true });
    if (error || !data) throw error ?? new Error("no data");
    return (data as SiteSection[]).map((s) => ({
      ...s,
      content: validateContent(s.kind as SectionKind, s.content),
      styles: validateStyles(s.styles),
    }));
  } catch (e) {
    console.warn("site-content: getSiteSections failed, returning empty", e);
    return [];
  }
});

export const getAllSiteSections = cache(async (): Promise<SiteSection[]> => {
  try {
    const supabase = createPublicClient();
    if (!supabase) throw new Error("no supabase client");
    const { data, error } = await supabase
      .from("site_sections")
      .select("*")
      .order("sort", { ascending: true });
    if (error || !data) throw error ?? new Error("no data");
    return (data as SiteSection[]).map((s) => ({
      ...s,
      content: validateContent(s.kind as SectionKind, s.content),
      styles: validateStyles(s.styles),
    }));
  } catch (e) {
    console.warn("site-content: getAllSiteSections failed, returning empty", e);
    return [];
  }
});

export const getThemeTokens = cache(async (): Promise<ThemeToken[]> => {
  try {
    const supabase = createPublicClient();
    if (!supabase) throw new Error("no supabase client");
    const { data, error } = await supabase
      .from("theme_tokens")
      .select("*")
      .order("key", { ascending: true });
    if (error || !data) throw error ?? new Error("no data");
    return data as ThemeToken[];
  } catch (e) {
    console.warn("site-content: getThemeTokens failed, returning empty", e);
    return [];
  }
});

export const getThemeTokenMap = cache(async (): Promise<Record<string, string>> => {
  const tokens = await getThemeTokens();
  return Object.fromEntries(tokens.map((t) => [t.key, t.value]));
});

export const getContentVersions = cache(
  async (sectionKey: string): Promise<ContentVersion[]> => {
    try {
      const supabase = createPublicClient();
      if (!supabase) throw new Error("no supabase client");
      const { data, error } = await supabase
        .from("content_versions")
        .select("*")
        .eq("section_key", sectionKey)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error || !data) throw error ?? new Error("no data");
      return data as ContentVersion[];
    } catch (e) {
      console.warn(
        `site-content: getContentVersions(${sectionKey}) failed`,
        e
      );
      return [];
    }
  }
);

/* -------------------------------------------------------------------------- */
/*  Admin write helpers (server actions)                                      */
/* -------------------------------------------------------------------------- */

export interface SaveSectionInput {
  key: string;
  label?: string;
  kind?: SectionKind;
  sort?: number;
  enabled?: boolean;
  content?: unknown;
  styles?: Record<string, string>;
}

export interface SaveSectionResult {
  ok: true;
  section: SiteSection;
}

export interface SaveSectionError {
  ok: false;
  error: string;
}

export type SaveSectionResponse = SaveSectionResult | SaveSectionError;

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export async function saveSection(
  input: SaveSectionInput
): Promise<SaveSectionResponse> {
  await requireAdmin();
  const supabase = createServiceRoleClient();
  if (!supabase) return { ok: false, error: "Supabase not configured" };

  const validatedContent = input.content
    ? validateContent(input.kind ?? "custom", input.content)
    : undefined;
  const validatedStyles = input.styles ? validateStyles(input.styles) : undefined;

  const { data: existing } = await supabase
    .from("site_sections")
    .select("key, content, styles")
    .eq("key", input.key)
    .maybeSingle();

  let section: SiteSection;

  if (existing) {
    const { data, error } = await supabase
      .from("site_sections")
      .update({
        label: input.label,
        kind: input.kind,
        sort: input.sort,
        enabled: input.enabled,
        content: validatedContent ?? existing.content,
        styles: validatedStyles ?? existing.styles,
      })
      .eq("key", input.key)
      .select()
      .single();
    if (error) return { ok: false, error: error.message };
    section = data as SiteSection;

    // Create version record
    await supabase.from("content_versions").insert({
      section_key: input.key,
      content: validatedContent ?? existing.content,
      styles: validatedStyles ?? existing.styles,
      editor: "admin",
      message: `Updated ${input.key}`,
    });
  } else {
    const { data, error } = await supabase
      .from("site_sections")
      .insert({
        key: input.key,
        label: input.label ?? input.key,
        kind: input.kind ?? "custom",
        sort: input.sort ?? 0,
        enabled: input.enabled ?? true,
        content: validatedContent ?? {},
        styles: validatedStyles ?? {},
      })
      .select()
      .single();
    if (error) return { ok: false, error: error.message };
    section = data as SiteSection;

    await supabase.from("content_versions").insert({
      section_key: input.key,
      content: validatedContent ?? {},
      styles: validatedStyles ?? {},
      editor: "admin",
      message: `Created ${input.key}`,
    });
  }

  revalidatePath("/");
  revalidatePath("/admin/sections");
  return { ok: true, section };
}

export async function deleteSection(key: string): Promise<SaveSectionResponse> {
  await requireAdmin();
  const supabase = createServiceRoleClient();
  if (!supabase) return { ok: false, error: "Supabase not configured" };

  const { error } = await supabase.from("site_sections").delete().eq("key", key);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/sections");
  return { ok: true, section: { key, label: "", kind: "custom", sort: 0, enabled: false, content: {}, styles: {}, created_at: "", updated_at: "" } };
}

export async function reorderSections(
  keys: string[]
): Promise<SaveSectionResponse> {
  await requireAdmin();
  const supabase = createServiceRoleClient();
  if (!supabase) return { ok: false, error: "Supabase not configured" };

  const updates = keys.map((key, index) =>
    supabase.from("site_sections").update({ sort: index * 10 }).eq("key", key)
  );
  const results = await Promise.all(updates);
  const firstError = results.find((r) => r.error);
  if (firstError?.error) return { ok: false, error: firstError.error.message };

  revalidatePath("/");
  revalidatePath("/admin/sections");
  return { ok: true, section: { key: "", label: "", kind: "custom", sort: 0, enabled: false, content: {}, styles: {}, created_at: "", updated_at: "" } };
}

export async function saveThemeToken(
  key: string,
  value: string,
  description?: string
): Promise<SaveSectionResponse> {
  await requireAdmin();
  const supabase = createServiceRoleClient();
  if (!supabase) return { ok: false, error: "Supabase not configured" };

  const { error } = await supabase
    .from("theme_tokens")
    .upsert({ key, value, description: description ?? null })
    .select()
    .single();
  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/theme");
  return { ok: true, section: { key: "", label: "", kind: "custom", sort: 0, enabled: false, content: {}, styles: {}, created_at: "", updated_at: "" } };
}

export async function deleteThemeToken(key: string): Promise<SaveSectionResponse> {
  await requireAdmin();
  const supabase = createServiceRoleClient();
  if (!supabase) return { ok: false, error: "Supabase not configured" };

  const { error } = await supabase.from("theme_tokens").delete().eq("key", key);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/theme");
  return { ok: true, section: { key: "", label: "", kind: "custom", sort: 0, enabled: false, content: {}, styles: {}, created_at: "", updated_at: "" } };
}