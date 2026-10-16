import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Filters, { LoadMore } from "@/components/filters";
import SortSelect from "@/components/sort-select";
import { ProductCard } from "@/components/product-card";
import { CATEGORIES, asCatalogProduct, getBySection, getCategory, isValidSection } from "@/lib/catalog";

export function generateStaticParams() {
  const out: { section: string; category: string }[] = [];
  for (const c of CATEGORIES) {
    out.push({ section: c.section, category: c.slug });
    for (const k of c.children ?? []) out.push({ section: c.section, category: k.slug });
  }
  return out;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string; category: string }>;
}): Promise<Metadata> {
  const { section, category } = await params;
  const cat = getCategory(category);
  return {
    title: cat ? `${cat.name} — ${section}` : "Category",
    description: cat ? `Shop ${cat.name} (${section}) with COD across Bangladesh.` : undefined,
  };
}

const PAGE_SIZE = 12;

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ section: string; category: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { section, category } = await params;
  if (!isValidSection(section) || section === "new-arrivals" || section === "sale") notFound();
  const cat = getCategory(category);
  if (!cat || (cat.section !== section && !CATEGORIES.find((c) => c.section === section && c.children?.some((k) => k.slug === category)))) {
    // Allow child slugs belonging to this section
    const belongs = CATEGORIES.some((c) => c.section === section && (c.slug === category || c.children?.some((k) => k.slug === category)));
    if (!belongs) notFound();
  }
  const raw = await searchParams;
  const first = (v: string | string[] | undefined): string | undefined => (Array.isArray(v) ? v[0] : v);
  const sp = { sort: first(raw.sort), maxPrice: first(raw.maxPrice), sizes: first(raw.sizes), inStock: first(raw.inStock), page: first(raw.page) };

  const cats = CATEGORIES.filter((c) => c.section === section).map((c) => ({ slug: c.slug, name: c.name }));
  const filtered = getBySection(section, {
    category,
    sort: sp.sort as "newest" | "price-asc" | "price-desc" | "rating" | "popular" | undefined,
    maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
    sizes: sp.sizes ? sp.sizes.split(",").filter(Boolean) : undefined,
    inStock: sp.inStock === "1",
  });

  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const visible = filtered.slice(0, page * PAGE_SIZE);
  const name = cat?.name ?? category;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "/" },
      { "@type": "ListItem", position: 2, name: section, item: `/${section}` },
      { "@type": "ListItem", position: 3, name, item: `/${section}/${category}` },
    ],
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="text-xs text-neutral-600" aria-label="Breadcrumb">
        <Link href="/" className="underline">Home</Link> /{" "}
        <Link href={`/${section}`} className="capitalize underline">{section}</Link> /{" "}
        <span className="text-neutral-800">{name}</span>
      </nav>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">{name}</h1>
          <p className="text-sm text-neutral-600">{filtered.length} result{filtered.length === 1 ? "" : "s"}</p>
        </div>
        <Suspense>
          <SortSelect />
        </Suspense>
      </div>
      <div className="mt-4 grid gap-6 lg:grid-cols-[240px_1fr]">
        <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-neutral-100" />}>
          <Filters categories={cats} sizes={["S", "M", "L", "XL"]} />
        </Suspense>
        <div>
          {visible.length === 0 ? (
            <div className="rounded-xl border p-10 text-center text-sm">
              Nothing here yet — try <Link href={`/${section}`} className="underline">all {section}</Link>.
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
