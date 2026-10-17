import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { asCatalogProduct, searchProducts } from "@/lib/catalog";
import { getLiveProducts } from "@/lib/storefront";

export const metadata: Metadata = {
  title: "Search",
  description: "Search panjabi, sharee, kabli and more.",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const qRaw = raw.q;
  const query = (Array.isArray(qRaw) ? qRaw[0] : qRaw ?? "").trim();
  // Live-first (Supabase) with local fallback.
  let list = undefined as Parameters<typeof searchProducts>[2] | undefined;
  try {
    const { products } = await getLiveProducts();
    if (products.length > 0) list = products;
  } catch {
    /* local fallback */
  }
  const results = query ? searchProducts(query, 24, list) : [];

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <nav className="text-xs text-ash" aria-label="Breadcrumb">
        <Link href="/" className="underline">Home</Link> / <span className="text-[#F5F5F5]">Search</span>
      </nav>
      <h1 className="mt-2 text-2xl font-semibold">
        {query ? <>Results for “{query}” ({results.length})</> : "Search"}
      </h1>
      {!query && <p className="mt-1 text-sm text-ash">Tip: press Ctrl/⌘+K anywhere to search.</p>}
      {query && results.length === 0 && (
        <p className="mt-4 text-sm text-ash">No matches. Try “panjabi”, “sharee”, “kabli” or “3pcs”.</p>
      )}
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {results.map((p) => (
          <ProductCard key={p.slug} product={asCatalogProduct(p)} />
        ))}
      </div>
    </main>
  );
}
