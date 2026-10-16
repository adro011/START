"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { CATEGORIES, SEARCH_INDEX } from "@/lib/catalog";

const RECENT_KEY = "brand-search-recent";

function subsequenceMatch(needle: string, haystack: string): boolean {
  const n = needle.toLowerCase().replace(/\s+/g, "");
  const h = haystack.toLowerCase().replace(/\s+/g, "");
  if (!n) return true;
  let j = 0;
  for (let i = 0; i < h.length && j < n.length; i++) if (h[i] === n[j]) j++;
  return j === n.length;
}

export default function SearchPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-search", onOpen);
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      if (raw) setRecent(JSON.parse(raw) as string[]);
    } catch {
      /* ignore */
    }
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-search", onOpen);
    };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 180);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 30);
  }, [open ]);

  const results = useMemo(() => {
    if (!debounced) return [];
    return SEARCH_INDEX.filter((e) =>
      subsequenceMatch(debounced, `${e.name} ${e.categoryName} ${e.section}`),
    ).slice(0, 8);
  }, [debounced]);

  const catSuggestions = useMemo(() => {
    if (!debounced) return CATEGORIES.slice(0, 6);
    return CATEGORIES.filter((c) =>
      subsequenceMatch(debounced, `${c.name} ${c.section}`),
    ).slice(0, 6);
  }, [debounced]);

  function commitSearch(q: string) {
    const v = q.trim();
    if (!v) return;
    setRecent((r) => {
      const next = [v, ...r.filter((x) => x !== v)].slice(0, 6);
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(v)}`);
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search products"
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4"
      onClick={() => setOpen(false)}
    >
      <div
        className="mt-16 w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            commitSearch(query);
          }}
        >
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search panjabi, sharee, kabli…  (Esc to close)"
            className="w-full border-b px-4 py-3 text-base outline-none"
          />
        </form>
        <div className="max-h-80 overflow-y-auto p-2">
          {debounced === "" && recent.length > 0 && (
            <div className="px-2 py-1">
              <p className="px-2 text-xs font-semibold uppercase tracking-wider text-neutral-600">
                Recent
              </p>
              {recent.map((r) => (
                <button
                  key={r}
                  onClick={() => commitSearch(r)}
                  className="block w-full rounded px-2 py-1.5 text-left text-sm hover:bg-neutral-100"
                >
                  {r}
                </button>
              ))}
            </div>
          )}
          {catSuggestions.length > 0 && (
            <div className="px-2 py-1">
              <p className="px-2 text-xs font-semibold uppercase tracking-wider text-neutral-600">
                Categories
              </p>
              <div className="flex flex-wrap gap-1 px-2 py-1">
                {catSuggestions.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/${c.section}?category=${c.slug}`}
                    onClick={() => setOpen(false)}
                    className="rounded-full border px-2.5 py-1 text-xs hover:bg-neutral-100"
                  >
                    {c.name} · {c.section}
                  </Link>
                ))}
              </div>
            </div>
          )}
          {results.map((r) => (
            <Link
              key={r.slug}
              href={`/product/${r.slug}`}
              onClick={() => {
                commitSearch(r.name);
              }}
              className="block rounded px-3 py-2 text-sm hover:bg-neutral-100"
            >
              <span className="font-medium">{r.name}</span>
              <span className="ml-2 text-xs text-neutral-600">
                {r.categoryName} · {r.section}
              </span>
            </Link>
          ))}
          {debounced !== "" && results.length === 0 && (
            <div className="px-3 py-6 text-center text-sm text-neutral-600">
              No matches for “{debounced}”. Try “panjabi”, “sharee” or “kabli”.
              <div>
                <button
                  onClick={() => commitSearch(debounced)}
                  className="mt-2 underline"
                >
                  Search anyway →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
