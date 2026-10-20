"use client";

import { useState, useEffect, useCallback } from "react";
import type { SiteSection, SectionKind } from "@/lib/site-content";

const KIND_LABELS: Record<SectionKind, string> = {
  hero: "Hero / Cover",
  panels: "Hero Panels",
  statement: "Statement / Story",
  grid: "Product Grid",
  split: "Split Layout",
  carousel: "Carousel",
  trust: "Trust Badges",
  instagram: "Instagram Feed",
  newsletter: "Newsletter",
  custom: "Custom",
};

const KIND_DESCRIPTIONS: Record<SectionKind, string> = {
  hero: "Full-screen entrance with headline, subheadline, CTA, background image",
  panels: "Animated spring panels (Women / Men / Kids) with hover expansion",
  statement: "Brand story with title, body, optional CTA and image",
  grid: "Product rail or category tiles with view-all link",
  split: "Hero + tiles or sale banner with CTA and optional badge",
  carousel: "Testimonials or rotating content cards",
  trust: "Trust badges row (icons + titles + descriptions)",
  instagram: "Instagram feed embed",
  newsletter: "Email signup with title, subtitle, placeholder, button",
  custom: "Free-form JSON content",
};

const DEFAULT_CONTENT_TEMPLATES: Record<SectionKind, unknown> = {
  hero: {
    headline: "HABIBI",
    subheadline: "COME TO HABIBI",
    cta: { label: "SHOP NOW", href: "/shop" },
    background: "/hero/hero-cover.svg",
  },
  panels: {
    panels: [
      { index: 0, title: "WOMEN", slug: "women", image: "/hero/women.svg", color: "#FFC000" },
      { index: 1, title: "MEN", slug: "men", image: "/hero/men.svg", color: "#29ABE2" },
      { index: 2, title: "KIDS", slug: "kids", image: "/hero/kids.svg", color: "#1EAEDB" },
    ],
  },
  statement: {
    title: "CRAFTED FOR THE FEW WHO DARE",
    body: "Every piece begins in the atelier — hand-cut, hand-stitched, finished with obsession.",
    cta: { label: "OUR STORY", href: "/about" },
  },
  grid: {
    title: "NEW ARRIVALS",
    subtitle: "Fresh drops, limited quantities",
    section: "women",
    limit: 8,
    showViewAll: true,
    viewAllHref: "/shop?section=women&sort=newest",
  },
  split: {
    title: "SEASONAL SALE",
    subtitle: "Up to 50% off selected styles",
    cta: { label: "SHOP SALE", href: "/sale" },
    image: "/hero/sale-banner.svg",
    badge: "LIMITED TIME",
  },
  carousel: {
    title: "WHAT OUR CLIENTS SAY",
    items: [
      { quote: "The fit is impeccable.", author: "A. Rahman", role: "Founder" },
      { quote: "Sharp, comfortable, timeless.", author: "S. Khan", role: "Creative Director" },
    ],
  },
  trust: {
    items: [
      { icon: "shield", title: "AUTHENTICITY GUARANTEED", description: "Every piece verified" },
      { icon: "truck", title: "FREE SHIPPING", description: "On orders over ৳5000" },
      { icon: "rotate-ccw", title: "EASY RETURNS", description: "30 days, no questions" },
      { icon: "lock", title: "SECURE PAYMENT", description: "SSL encrypted checkout" },
    ],
  },
  instagram: {
    title: "HABIBI IN THE WILD",
    handle: "@habibi",
    limit: 6,
  },
  newsletter: {
    title: "JOIN THE INNER CIRCLE",
    subtitle: "Early access, exclusive drops, and the stories behind the stitches.",
    placeholder: "your@email.com",
    button: "SUBSCRIBE",
    privacyNote: "We respect your inbox. Unsubscribe anytime.",
  },
  custom: {},
};

export default function AdminSectionsPage() {
  const [sections, setSections] = useState<SiteSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<SiteSection> & { content: unknown; styles: Record<string, string> }>({
    content: {},
    styles: {},
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<string | null>(null);

  const fetchSections = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/sections", { credentials: "same-origin" });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setSections(data.sections ?? []);
    } catch (e) {
      console.error(e);
      setErrors({ fetch: "Failed to load sections" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  const handleEdit = (section: SiteSection) => {
    setEditingKey(section.key);
    setEditForm({
      key: section.key,
      label: section.label,
      kind: section.kind,
      sort: section.sort,
      enabled: section.enabled,
      content: section.content,
      styles: section.styles,
    });
    setErrors({});
  };

  const handleCancel = () => {
    setEditingKey(null);
    setEditForm({ content: {}, styles: {} });
    setErrors({});
  };

  const handleInputChange = (field: string, value: unknown) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleContentChange = (newContent: unknown) => {
    setEditForm((prev) => ({ ...prev, content: newContent }));
  };

  const handleStylesChange = (newStyles: Record<string, string>) => {
    setEditForm((prev) => ({ ...prev, styles: newStyles }));
  };

  const handleSave = async () => {
    if (!editingKey) return;
    setSaving(editingKey);
    setErrors({});

    try {
      const res = await fetch("/api/admin/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ action: "save", ...editForm }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Save failed");

      setSuccess("Section saved");
      setEditingKey(null);
      setEditForm({ content: {}, styles: {} });
      await fetchSections();
    } catch (e: unknown) {
      setErrors({ save: e instanceof Error ? e.message : "Save failed" });
    } finally {
      setSaving(null);
    }
  };

  const handleDelete = async (key: string) => {
    if (!confirm(`Delete section "${key}"? This cannot be undone.`)) return;
    try {
      const res = await fetch("/api/admin/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ action: "delete", key }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Delete failed");
      await fetchSections();
    } catch (e: unknown) {
      setErrors({ delete: e instanceof Error ? e.message : "Delete failed" });
    }
};

  const handleAddSection = async (kind: SectionKind) => {
    const key = `${kind}-${Date.now()}`;
    const template = DEFAULT_CONTENT_TEMPLATES[kind];
    try {
      const res = await fetch("/api/admin/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          action: "save",
          key,
          label: KIND_LABELS[kind],
          kind,
          sort: sections.length * 10,
          enabled: true,
          content: template,
          styles: {},
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Create failed");
      await fetchSections();
      setEditingKey(key);
    } catch (e: unknown) {
      setErrors({ create: e instanceof Error ? e.message : "Create failed" });
    }
  };

  const renderContentEditor = () => {
    if (!editingKey) return null;
    const section = sections.find((s) => s.key === editingKey);
    const kind = (editForm.kind ?? section?.kind ?? "custom") as SectionKind;

    return (
      <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 p-4">
        <div className="w-full max-w-4xl bg-[#181818] rounded-lg border border-white/15 shadow-elevation3 max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/15 p-4 bg-[#181818]">
            <h2 className="text-lg font-semibold">Edit Section: {editForm.key}</h2>
            <button
              onClick={handleCancel}
              className="text-ash hover:text-white text-2xl leading-none"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="p-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ash mb-1">Key (immutable)</label>
                <input
                  value={editForm.key ?? ""}
                  disabled
                  className="w-full bg-[#111] text-white/50 px-3 py-2 rounded text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ash mb-1">Label</label>
                <input
                  value={editForm.label ?? ""}
                  onChange={(e) => handleInputChange("label", e.target.value)}
                  className="w-full textInput bg-[#111] text-white px-3 py-2 rounded text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ash mb-1">Kind</label>
                <select
                  value={editForm.kind ?? kind}
                  onChange={(e) => handleInputChange("kind", e.target.value as SectionKind)}
                  className="w-full textInput bg-[#111] text-white px-3 py-2 rounded text-sm"
                  disabled={!!section}
                >
                  {Object.entries(KIND_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ash mb-1">Sort Order</label>
                <input
                  type="number"
                  value={editForm.sort ?? 0}
                  onChange={(e) => handleInputChange("sort", Number(e.target.value))}
                  className="w-full textInput bg-[#111] text-white px-3 py-2 rounded text-sm"
                />
              </div>
              <div className="sm:col-span-2 flex items-end">
                <label className="w-full flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editForm.enabled ?? true}
                    onChange={(e) => handleInputChange("enabled", e.target.checked)}
                    className="w-4 h-4 accent-gold"
                  />
                  <span className="text-sm text-white">Enabled</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ash mb-1">
                Content (JSON) — {KIND_DESCRIPTIONS[kind]}
              </label>
              <textarea
                value={JSON.stringify(editForm.content, null, 2)}
                onChange={(e) => {
                  try {
                    handleContentChange(JSON.parse(e.target.value));
                  } catch {
                    // Ignore invalid JSON while typing
                  }
                }}
                className="w-full h-64 font-mono text-xs bg-[#0a0a0a] text-white/90 px-3 py-2 rounded border border-white/10 resize-y"
                spellCheck={false}
              />
              {errors.content && <p className="mt-1 text-sm text-red-400">{errors.content}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ash mb-1">
                Styles (JSON) — Whitelisted CSS vars only
              </label>
              <textarea
                value={JSON.stringify(editForm.styles, null, 2)}
                onChange={(e) => {
                  try {
                    handleStylesChange(JSON.parse(e.target.value));
                  } catch {
                    // Ignore invalid JSON while typing
                  }
                }}
                className="w-full h-48 font-mono text-xs bg-[#0a0a0a] text-white/90 px-3 py-2 rounded border border-white/10 resize-y"
                spellCheck={false}
              />
              {errors.styles && <p className="mt-1 text-sm text-red-400">{errors.styles}</p>}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <button type="button" onClick={handleCancel} className="rounded px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors">
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving === editingKey}
                className="rounded bg-gold px-4 py-2 text-sm font-medium text-black hover:bg-gold-dark transition-colors disabled:opacity-50"
              >
                {saving === editingKey ? "Saving…" : "Save Section"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Sections</h1>
          <p className="text-sm text-ash">Manage homepage sections — content, styles, and order.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(KIND_LABELS).map(([kind, label]) => (
            <button
              key={kind}
              onClick={() => handleAddSection(kind as SectionKind)}
              className="rounded bg-white/5 px-3 py-2 text-xs font-medium text-steel hover:bg-white/10 hover:text-white transition-colors"
            >
              + {label}
            </button>
          ))}
        </div>
      </div>

      {success && (
        <div className="rounded bg-green-900/30 border border-green-500/30 p-3 text-sm text-green-300" role="alert">
          {success}
        </div>
      )}
      {errors.fetch && (
        <div className="rounded bg-red-900/30 border border-red-500/30 p-3 text-sm text-red-300" role="alert">
          {errors.fetch}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-white/15">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="bg-[#202020] text-xs uppercase tracking-wider text-ash">
              <th className="px-3 py-2 w-12">Drag</th>
              <th className="px-3 py-2">Key</th>
              <th className="px-3 py-2">Label</th>
              <th className="px-3 py-2">Kind</th>
              <th className="px-3 py-2">Sort</th>
              <th className="px-3 py-2">Enabled</th>
              <th className="px-3 py-2 w-36">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-ash">Loading…</td>
              </tr>
            ) : sections.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-ash">No sections. Click a button above to add one.</td>
              </tr>
            ) : (
              sections.map((s, i) => (
                <tr key={s.key} className={editingKey === s.key ? "bg-white/5" : ""}>
                  <td className="px-3 py-2 text-ash cursor-grab">☰ {i + 1}</td>
                  <td className="px-3 py-2 font-mono text-xs font-semibold">{s.key}</td>
                  <td className="px-3 py-2">{s.label}</td>
                  <td className="px-3 py-2">
                    <span className="inline-block rounded bg-white/10 px-2 py-0.5 text-xs font-medium uppercase">{KIND_LABELS[s.kind] ?? s.kind}</span>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">{s.sort}</td>
                  <td className="px-3 py-2">
                    <span className={`inline-block w-2 h-2 rounded-full ${s.enabled ? "bg-green-500" : "bg-red-500"}`} />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(s)}
                        className="rounded px-2 py-1 text-xs text-steel hover:text-white hover:bg-white/10 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(s.key)}
                        className="rounded px-2 py-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {renderContentEditor()}
    </div>
  );
}