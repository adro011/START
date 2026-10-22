"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useWishlist } from "@/store/wishlist";
import { lookupProduct, type LookupEntry } from "@/lib/live-lookup";
import { formatBDT } from "@/lib/format";

export default function WishlistPage() {
  const { slugs, toggle } = useWishlist();
  // Slugs may be live Supabase slugs (demo-*) — resolve via the live feed
  // first, local mirror second. Missing entries are dropped from view.
  const [products, setProducts] = useState<LookupEntry[]>([]);
  useEffect(() => {
    let alive = true;
    Promise.all(slugs.map((s) => lookupProduct(s))).then((rows) => {
      if (alive) setProducts(rows.filter((r): r is LookupEntry => r !== undefined));
    }).catch(() => {
      /* keep previous */
    });
    return () => {
      alive = false;
    };
  }, [slugs]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <nav className="text-xs text-ash" aria-label="Breadcrumb">
        <Link href="/account" className="underline">Account</Link> / <span className="text-[var(--color-smoke)]">Wishlist</span>
      </nav>
      <h1 className="mt-2 text-2xl font-semibold">Wishlist ({slugs.length})</h1>
      {products.length === 0 ? (
        <p className="mt-4 text-sm text-ash">
          Nothing saved yet — tap the ♡ on any product. Stored on this device (persisted); syncs to Supabase wishlist after sign-in.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {products.map((p) => (
            <li key={p.slug} className="flex items-center justify-between gap-3 rounded-xl border p-3 text-sm">
              <Link href={`/product/${p.slug}`} className="font-medium hover:underline">{p.name}</Link>
              <span className="flex items-center gap-3">
                <span>{formatBDT(p.pricePaisa)}</span>
                <button onClick={() => toggle(p.slug)} className="text-xs underline">Remove</button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
