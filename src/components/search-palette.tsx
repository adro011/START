"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { CATEGORIES, SEARCH_INDEX, type SearchIndexEntry } from "@/lib/catalog";
import { useProductIndex } from "@/lib/live-lookup";
import { cn } from "@/lib/format";

const RECENT_KEY = "brand-search-recent";

const RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFC000]";

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
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const prevFocus = useRef<HTMLElement | null>(null);
  const router = useRouter();
  // Live product index (empty until the /api/products feed resolves).
  const liveIndex = useProductIndex();

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

  // Focus the input on open (remember the trigger), lock scroll, restore on close.
  useEffect(() => {
    if (!open) return;
    prevFocus.current = document.activeElement as HTMLElement | null;
    setActiveIndex(null);
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prevOverflow;
      prevFocus.current?.focus?.();
    };
  }, [open ]);

  const results = useMemo(() => {
    if (!debounced) return [];
    // Live-first: Supabase-backed index when the feed resolved, bundled
    // mirror otherwise. Union by slug so new DB products appear instantly.
    const live = liveIndex.size > 0
      ? [...liveIndex.values()].map((e) => ({
          slug: e.slug,
          name: e.name,
          section: e.section,
          category: e.category,
          categoryName: e.categoryName,
        }) as SearchIndexEntry)
      : [];
    const seen = new Set(live.map((e) => e.slug));
    const merged = [...live, ...SEARCH_INDEX.filter((e) => !seen.has(e.slug))];
    return merged.filter((e) =>
      subsequenceMatch(debounced, `${e.name} ${e.categoryName} ${e.section}`),
    ).slice(0, 8);
  }, [debounced, liveIndex]);

  // Arrow target resets whenever the result set changes.
  useEffect(() => {
    setActiveIndex(null);
  }, [debounced]);

  // Keep the arrow-highlighted option on screen.
  useEffect(() => {
    if (activeIndex === null) return;
    document.getElementById(`search-palette-opt-${activeIndex}`)?.scrollIntoView({ block: "nearest" });
  }, [activeIndex ]);

  const catSuggestions = useMemo(() => {
    if (!debounced) return CATEGORIES.slice(0, 6);
    return CATEGORIES.filter((c) =>
      subsequenceMatch(debounced, `${c.name} ${c.section}`),
    ).slice(0, 6);
  }, [debounced]);

  function recordRecent(v: string) {
    setRecent((r) => {
      const next = [v, ...r.filter((x) => x !== v)].slice(0, 6);
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  function commitSearch(q: string) {
    const v = q.trim();
    if (!v) return;
    recordRecent(v);
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(v)}`);
  }

  function visitResult(index: number) {
    const r = results[index];
    if (!r) return;
    recordRecent(r.name);
    setOpen(false);
    router.push(`/product/${r.slug}`);
  }

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (results.length === 0) return;
      setActiveIndex((a) => (a === null ? 0 : (a + 1) % results.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (results.length === 0) return;
      setActiveIndex((a) =>
        a === null ? results.length - 1 : (a - 1 + results.length) % results.length,
      );
    } else if (e.key === "Home") {
      if (results.length === 0) return;
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === "End") {
      if (results.length === 0) return;
      e.preventDefault();
      setActiveIndex(results.length - 1);
    } else if (e.key === "Enter") {
      // Enter on a highlighted result visits it; otherwise commit the search.
      if (activeIndex !== null && results[activeIndex]) {
        e.preventDefault();
        visitResult(activeIndex);
      }
    } else if (e.key === "Tab") {
      // Traps-ish Tab cycle inside the palette panel.
      const root = panelRef.current;
      if (!root) return;
      const items = [...root.querySelectorAll<HTMLElement>("input, a[href], button:not([disabled])")];
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  if (!open) return null;

  const activeId = activeIndex !== null ? `search-palette-opt-${activeIndex}` : undefined;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search products"
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4"
      onClick={() => setOpen(false)}
    >
      <div
        ref={panelRef}
        className="mt-16 w-full max-w-lg overflow-hidden rounded-xl bg-[#181818] text-[#F5F5F5] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            commitSearch(query);
          }}
        >
          <div className="textInputWrapper">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onInputKeyDown}
              role="combobox"
              aria-expanded={results.length > 0}
              aria-controls="search-palette-listbox"
              aria-activedescendant={activeId}
              aria-label="Search products"
              autoComplete="off"
              placeholder="Search panjabi, sharee, kabli…  (Esc to close)"
              className={cn("w-full border-b px-4 py-3 text-base outline-none", RING)}
            />
          </div>
        </form>
        <div className="max-h-80 overflow-y-auto p-2">
          {debounced === "" && recent.length > 0 && (
            <div className="px-2 py-1">
              <p className="px-2 text-xs font-semibold uppercase tracking-wider text-ash">
                Recent
              </p>
              {recent.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => commitSearch(r)}
                  className={cn("block w-full rounded px-2 py-1.5 text-left text-sm hover:bg-white/10", RING)}
                >
                  {r}
                </button>
              ))}
            </div>
          )}
          {catSuggestions.length > 0 && (
            <div className="px-2 py-1">
              <p className="px-2 text-xs font-semibold uppercase tracking-wider text-ash">
                Categories
              </p>
              <div className="flex flex-wrap gap-1 px-2 py-1">
                {catSuggestions.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/${c.section}?category=${c.slug}`}
                    onClick={() => setOpen(false)}
                    className={cn("rounded-full border px-2.5 py-1 text-xs hover:bg-white/10", RING)}
                  >
                    {c.name} · {c.section}
                  </Link>
                ))}
              </div>
            </div>
          )}
          <div role="listbox" id="search-palette-listbox" aria-label="Product results">
            {results.map((r, i) => (
              <Link
                key={r.slug}
                id={`search-palette-opt-${i}`}
                role="option"
                aria-selected={i === activeIndex}
                href={`/product/${r.slug}`}
                onClick={() => {
                  commitSearch(r.name);
                }}
                onMouseEnter={() => setActiveIndex(i)}
                className={cn(
                  "block rounded px-3 py-2 text-sm hover:bg-white/10",
                  RING,
                  i === activeIndex && "bg-white/10",
                )}
              >
                <span className="font-medium">{r.name}</span>
                <span className="ml-2 text-xs text-ash">
                  {r.categoryName} · {r.section}
                </span>
              </Link>
            ))}
          </div>
          {debounced !== "" && results.length === 0 && (
            <div className="px-3 py-6 text-center text-sm text-ash">
              No matches for “{debounced}”. Try “panjabi”, “sharee” or “kabli”.
              <div>
                <button
                  type="button"
                  onClick={() => commitSearch(debounced)}
                  className={cn("mt-2 underline", RING)}
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
