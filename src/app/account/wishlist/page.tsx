"use client";

import Link from "next/link";
import { useWishlist } from "@/store/wishlist";
import { getProduct, type Product } from "@/lib/catalog";
import { formatBDT } from "@/lib/format";

export default function WishlistPage() {
  const { slugs, toggle } = useWishlist();
  const products = slugs.map(getProduct).filter((p): p is Product => p !== undefined);

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <nav className="text-xs text-neutral-500" aria-label="Breadcrumb">
        <Link href="/account" className="underline">Account</Link> / <span className="text-neutral-800">Wishlist</span>
      </nav>
      <h1 className="mt-2 text-2xl font-semibold">Wishlist ({slugs.length})</h1>
      {products.length === 0 ? (
        <p className="mt-4 text-sm text-neutral-500">
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
