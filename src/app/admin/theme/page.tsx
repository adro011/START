"use client";

import { useState, useEffect, useCallback } from "react";
import type { ThemeToken } from "@/lib/site-content";

const TOKEN_GROUPS = [
  { label: "Colors", prefix: "color-" },
  { label: "Typography", prefix: "font-" },
  { label: "Spacing", prefix: "space-" },
  { label: "Durations", prefix: "duration-" },
  { label: "Easing", prefix: "easing-" },
  { label: "Stagger", prefix: "stagger-" },
] as const;

export default function AdminThemePage() {
  const [tokens, setTokens] = useState<ThemeToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<string | null>(null);

  const fetchTokens = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/theme", { credentials: "same-origin" });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setTokens(data.tokens ?? []);
    } catch (e) {
      console.error(e);
      setErrors({ fetch: "Failed to load theme tokens" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  const handleEdit = (token: ThemeToken) => {
    setEditingKey(token.key);
    setEditValue(token.value);
    setEditDescription(token.description ?? "");
    setErrors({});
  };

  const handleCancel = () => {
    setEditingKey(null);
    setEditValue("");
    setEditDescription("");
    setErrors({});
  };

  const handleSave = async () => {
    if (!editingKey) return;
    setSaving(editingKey);
    setErrors({});

    try {
      const res = await fetch("/api/admin/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ key: editingKey, value: editValue, description: editDescription }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Save failed");

      setSuccess("Token saved");
      setEditingKey(null);
      setEditValue("");
      setEditDescription("");
      await fetchTokens();
    } catch (e: unknown) {
      setErrors({ save: e instanceof Error ? e.message : "Save failed" });
    } finally {
      setSaving(null);
    }
  };

  const handleDelete = async (key: string) => {
    if (!confirm(`Delete token "${key}"? This cannot be undone.`)) return;
    try {
      const res = await fetch("/api/admin/theme", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ key }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Delete failed");
      await fetchTokens();
    } catch (e: unknown) {
      setErrors({ delete: e instanceof Error ? e.message : "Delete failed" });
    }
  };

  const handleAddToken = () => {
    const key = `custom-${Date.now()}`;
    setEditingKey(key);
    setEditValue("");
    setEditDescription("");
  };

  const groupedTokens = TOKEN_GROUPS.map((group) => ({
    label: group.label,
    tokens: tokens.filter((t) => t.key.startsWith(group.prefix)),
  })).filter((g) => g.tokens.length > 0);

  const ungroupedTokens = tokens.filter(
    (t) => !TOKEN_GROUPS.some((g) => t.key.startsWith(g.prefix))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Theme Tokens</h1>
          <p className="text-sm text-ash">Edit design tokens — changes inject as CSS variables site-wide.</p>
        </div>
        <button
          onClick={handleAddToken}
          className="rounded bg-gold px-4 py-2 text-sm font-medium text-black hover:bg-gold-dark transition-colors"
        >
          + Add Token
        </button>
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

      {editingKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-2xl bg-[#181818] rounded-lg border border-white/15 shadow-elevation3">
            <div className="flex items-center justify-between border-b border-white/15 p-4">
              <h2 className="text-lg font-semibold">Edit Token: {editingKey}</h2>
              <button
                onClick={handleCancel}
                className="text-ash hover:text-white text-2xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ash mb-1">Key</label>
                <input
                  value={editingKey}
                  disabled
                  className="w-full bg-[#111] text-white/50 px-3 py-2 rounded text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ash mb-1">Value</label>
                <input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full textInput bg-[#111] text-white px-3 py-2 rounded text-sm font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ash mb-1">Description (optional)</label>
                <input
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full textInput bg-[#111] text-white px-3 py-2 rounded text-sm"
                />
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
                  {saving === editingKey ? "Saving…" : "Save Token"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {groupedTokens.map((group) => (
          <div key={group.label} className="rounded-lg border border-white/15 overflow-hidden">
            <div className="bg-[#202020] px-4 py-2 text-xs uppercase tracking-wider text-ash">
              {group.label}
            </div>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-white/10">
                {group.tokens.map((token) => (
                  <tr key={token.key} className={editingKey === token.key ? "bg-white/5" : ""}>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-gold w-64">{token.key}</td>
                    <td className="px-4 py-3">
                      <code className="font-mono text-xs text-white/90 bg-[#0a0a0a] px-2 py-1 rounded">{token.value}</code>
                    </td>
                    <td className="px-4 py-3 text-ash max-w-md truncate">{token.description ?? "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleEdit(token)}
                          className="rounded px-2 py-1 text-xs text-steel hover:text-white hover:bg-white/10 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(token.key)}
                          className="rounded px-2 py-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        {ungroupedTokens.length > 0 && (
          <div className="rounded-lg border border-white/15 overflow-hidden">
            <div className="bg-[#202020] px-4 py-2 text-xs uppercase tracking-wider text-ash">
              Other
            </div>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-white/10">
                {ungroupedTokens.map((token) => (
                  <tr key={token.key} className={editingKey === token.key ? "bg-white/5" : ""}>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-gold w-64">{token.key}</td>
                    <td className="px-4 py-3">
                      <code className="font-mono text-xs text-white/90 bg-[#0a0a0a] px-2 py-1 rounded">{token.value}</code>
                    </td>
                    <td className="px-4 py-3 text-ash max-w-md truncate">{token.description ?? "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleEdit(token)}
                          className="rounded px-2 py-1 text-xs text-steel hover:text-white hover:bg-white/10 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(token.key)}
                          className="rounded px-2 py-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tokens.length === 0 && !loading && (
          <div className="rounded-lg border border-white/15 p-8 text-center text-ash">
            No theme tokens. Click "Add Token" to create one.
          </div>
        )}
      </div>
    </div>
  );
}