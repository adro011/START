"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProduct } from "@/lib/catalog";
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
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      const arr = raw ? (JSON.parse(raw) as string[]) : [];
      setSlugs(arr.filter((s) => s !== exclude).slice(0, 4));
    } catch {
      /* ignore */
    }
  }, [exclude]);

  if (slugs.length === 0) return null;
  return (
    <section aria-label="Recently viewed" className="mt-10">
      <h2 className="text-lg font-semibold">Recently viewed</h2>
      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
        {slugs.map((s) => {
          const p = getProduct(s);
          if (!p) return null;
          return (
            <Link key={s} href={`/product/${s}`} className="rounded-xl border p-3 text-sm hover:bg-neutral-50">
              <span className="block font-medium">{p.name}</span>
              <span className="text-neutral-600">{formatBDT(p.pricePaisa)}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
