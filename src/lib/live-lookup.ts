"use client";

/**
 * Client-side product lookup backed by live Supabase data.
 *
 * Widgets that only know a product slug from browser storage (wishlist,
 * recently viewed) or need a live search index (palette) fetch the compact
 * `/api/products` feed — which is live-first on the server — and fall back
 * to the local TS mirror when offline. Results are cached in-memory per
 * session so N widgets share one request.
 */

import { useEffect, useState } from "react";
import { getProduct as getLocalProduct } from "@/lib/catalog";
export interface LookupEntry {
  slug: string;
  name: string;
  section: string;
  category: string;
  categoryName: string;
  pricePaisa: number;
}

let cache: Map<string, LookupEntry> | null = null;
let inflight: Promise<Map<string, LookupEntry>> | null = null;

export function fetchProductIndex(): Promise<Map<string, LookupEntry>> {
  if (cache) return Promise.resolve(cache);
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const res = await fetch("/api/products", { headers: { accept: "application/json" } });
      if (!res.ok) throw new Error(`products feed ${res.status}`);
      const body = (await res.json()) as {
        products?: { slug?: string; name?: string; section?: string; category?: string; categoryName?: string; pricePaisa?: number; price_paisa?: number }[];
      };
      const map = new Map<string, LookupEntry>();
      for (const p of body.products ?? []) {
        if (!p?.slug) continue;
        map.set(p.slug, {
          slug: p.slug,
          name: p.name ?? p.slug,
          section: p.section ?? "",
          category: p.category ?? "",
          categoryName: p.categoryName ?? "",
          pricePaisa: p.pricePaisa ?? p.price_paisa ?? 0,
        });
      }
      if (map.size > 0) {
        cache = map;
        return map;
      }
      throw new Error("empty products feed");
    } catch {
      // Offline / feed down: callers resolve per-slug against the bundled
      // local mirror (lookupProduct) or their own static index (palette).
      return new Map<string, LookupEntry>();
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

/** Resolve one slug: live index first, local mirror second. */
export async function lookupProduct(slug: string): Promise<LookupEntry | undefined> {
  const map = await fetchProductIndex();
  const hit = map.get(slug);
  if (hit) return hit;
  const local = getLocalProduct(slug);
  if (!local) return undefined;
  return {
    slug: local.slug,
    name: local.name,
    section: local.section,
    category: local.category,
    categoryName: local.categoryName,
    pricePaisa: local.pricePaisa,
  };
}

/** React hook: live product index (empty map = loading or unavailable). */
export function useProductIndex(): Map<string, LookupEntry> {
  const [map, setMap] = useState<Map<string, LookupEntry>>(new Map());
  useEffect(() => {
    let alive = true;
    fetchProductIndex().then((m) => {
      if (alive) setMap(m);
    }).catch(() => {
      /* local fallbacks apply at read sites */
    });
    return () => {
      alive = false;
    };
  }, []);
  return map;
}
