import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Filters, { LoadMore } from "@/components/filters";
import SortSelect from "@/components/sort-select";
import { ProductCard } from "@/components/product-card";
import { CATEGORIES, asCatalogProduct, getBySection, isValidSection } from "@/lib/catalog";

export function generateStaticParams() {
  return [{ section: "men" }, { section: "women" }, { section: "kids" }, { section: "new-arrivals" }, { section: "sale" }];
}

export async function generateMetadata({ params }: { params: Promise<{ section: string }> }): Promise<Metadata> {
  const { section } = await params;
  const title = section === "new-arrivals" ? "New Arrivals" : section === "sale" ? "Sale" : section[0].toUpperCase() + section.slice(1);
  return { title: `${title} — Shop`, description: `Shop ${title.toLowerCase()} fashion in Bangladesh. COD, easy exchange.` };
}

type RawSP = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined): string | undefined =>
  Array.isArray(v) ? v[0] : v;

const PAGE_SIZE = 12;

export default async function SectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<RawSP>;
}) {
  const { section } = await params;
  if (!isValidSection(section)) notFound();
  const raw = await searchParams;
  const sp = {
    category: first(raw.category),
    sort: first(raw.sort),
    q: first(raw.q),
    maxPrice: first(raw.maxPrice),
    sizes: first(raw.sizes),
    inStock: first(raw.inStock),
    page: first(raw.page),
  };

  const realSection = section === "new-arrivals" || section === "sale" ? section : (section as "men" | "women" | "kids");
  const cats = CATEGORIES.filter((c) => section === "new-arrivals" || section === "sale" ? true : c.section === realSection)
    .map((c) => ({ slug: c.slug, name: c.name }));

  const sizes = ["S", "M", "L", "XL"];

  const filtered = getBySection(realSection, {
    category: sp.category,
    sort: sp.sort as "newest" | "price-asc" | "price-desc" | "rating" | "popular" | undefined,
    query: sp.q,
    maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
    sizes: sp.sizes ? sp.sizes.split(",").filter(Boolean) : undefined,
    inStock: sp.inStock === "1",
  });

  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const visible = filtered.slice(0, page * PAGE_SIZE);

  const title = section === "new-arrivals" ? "New Arrivals" : section === "sale" ? "Sale" : section[0].toUpperCase() + section.slice(1);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <nav className="text-xs text-neutral-500" aria-label="Breadcrumb">
        <Link href="/" className="underline">Home</Link> / <span className="capitalize text-neutral-800">{title}</span>
      </nav>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold capitalize md:text-3xl">{title}</h1>
          <p className="text-sm text-neutral-500">{filtered.length} result{filtered.length === 1 ? "" : "s"}</p>
        </div>
        <Suspense>
          <SortSelect />
        </Suspense>
      </div>

      {/* Section chips */}
      <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
        <Link href="/men" className={`shrink-0 rounded-full border px-3 py-1 text-xs ${section === "men" ? "bg-neutral-900 text-white" : ""}`}>Men</Link>
        <Link href="/women" className={`shrink-0 rounded-full border px-3 py-1 text-xs ${section === "women" ? "bg-neutral-900 text-white" : ""}`}>Women</Link>
        <Link href="/kids" className={`shrink-0 rounded-full border px-3 py-1 text-xs ${section === "kids" ? "bg-neutral-900 text-white" : ""}`}>Kids</Link>
        <Link href="/new-arrivals" className={`shrink-0 rounded-full border px-3 py-1 text-xs ${section === "new-arrivals" ? "bg-neutral-900 text-white" : ""}`}>New Arrivals</Link>
        <Link href="/sale" className={`shrink-0 rounded-full border px-3 py-1 text-xs ${section === "sale" ? "bg-red-700 text-white" : "text-red-700"}`}>Sale</Link>
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-[240px_1fr]">
        <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-neutral-100" />}>
          <Filters categories={cats.slice(0, 18)} sizes={sizes} />
        </Suspense>
        <div>
          {visible.length === 0 ? (
            <div className="rounded-xl border p-10 text-center">
              <p className="font-medium">No products match those filters.</p>
              <p className="mt-1 text-sm text-neutral-500">Try clearing the price cap or trying “Panjabi”, “Sharee”, “Kabli”.</p>
              <Link href={`/${section}`} className="mt-3 inline-block underline text-sm">Clear filters</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {visible.map((p) => (
                <ProductCard key={p.slug} product={asCatalogProduct(p)} />
              ))}
            </div>
          )}
          <Suspense>
            <LoadMore total={filtered.length} pageSize={PAGE_SIZE} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
