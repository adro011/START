"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { lookupProduct, type LookupEntry } from "@/lib/live-lookup";
import { formatBDT } from "@/lib/format";

const KEY = "brand-recently-viewed";

export function pushRecent(slug: string) {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? (JSON.parse(raw) as string[]) : [];
    localStorage.setItem(KEY, JSON.stringify([slug, ...arr.filter((x) => x !== slug)].slice(0, 8)));
  } catch {
    /* ignore */
  }
}

export default function RecentlyViewed({ exclude }: { exclude: string }) {
  const [slugs, setSlugs] = useState<string[]>([]);
  // Stored slugs may be live Supabase slugs — resolve via the live feed
  // first, local mirror second.
  const [items, setItems] = useState<LookupEntry[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      const arr = raw ? (JSON.parse(raw) as string[]) : [];
      setSlugs(arr.filter((s) => s !== exclude).slice(0, 4));
    } catch {
      /* ignore */
    }
  }, [exclude]);

  useEffect(() => {
    if (slugs.length === 0) {
      setItems([]);
      return;
    }
    let alive = true;
    Promise.all(slugs.map((s) => lookupProduct(s))).then((rows) => {
      if (alive) setItems(rows.filter((r): r is LookupEntry => r !== undefined));
    }).catch(() => {
      /* keep previous */
    });
    return () => {
      alive = false;
    };
  }, [slugs]);

  if (slugs.length === 0) return null;
  return (
    <section aria-label="Recently viewed" className="mt-10">
      <h2 className="text-lg font-semibold">Recently viewed</h2>
      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
        {items.map((p) => (
          <Link key={p.slug} href={`/product/${p.slug}`} className="rounded-xl border p-3 text-sm hover:bg-white/5">
            <span className="block font-medium">{p.name}</span>
            <span className="text-ash">{formatBDT(p.pricePaisa)}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
