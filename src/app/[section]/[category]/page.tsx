import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Filters, { LoadMore } from "@/components/filters";
import SortSelect from "@/components/sort-select";
import { ProductCard } from "@/components/product-card";
import { CATEGORIES, asCatalogProduct, getBySection, getCategory, isValidSection, priceBounds } from "@/lib/catalog";
import { getLiveCategories, getLiveProducts } from "@/lib/storefront";

export const revalidate = 300;

export async function generateStaticParams() {
  // Live-first so new Supabase categories get static pages; local fallback
  // keeps offline builds green.
  let cats = CATEGORIES;
  try {
    const live = await getLiveCategories();
    if (live.categories.length > 0) cats = live.categories;
  } catch {
    /* local fallback */
  }
  const out: { section: string; category: string }[] = [];
  for (const c of cats) {
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
  const cat = await resolveCategory(category);
  return {
    title: cat ? `${cat.name} — ${section}` : "Category",
    description: cat ? `Shop ${cat.name} (${section}) with COD across Bangladesh.` : undefined,
  };
}

async function resolveCategory(slug: string) {
  try {
    const { categories } = await getLiveCategories();
    if (categories.length > 0) {
      const hit = getCategory(slug, categories);
      if (hit) return hit;
    }
  } catch {
    /* local fallback below */
  }
  return getCategory(slug);
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
  // Live-first (Supabase) with local fallback; helpers take the source list.
  const [{ products: liveProducts }, { categories: liveCategories }] = await Promise.all([
    getLiveProducts(),
    getLiveCategories(),
  ]);
  const allProducts = liveProducts.length > 0 ? liveProducts : undefined;
  const allCategories = liveCategories.length > 0 ? liveCategories : CATEGORIES;
  const cat = getCategory(category, allCategories);
  if (!cat || (cat.section !== section && !allCategories.find((c) => c.section === section && c.children?.some((k) => k.slug === category)))) {
    // Allow child slugs belonging to this section
    const belongs = allCategories.some((c) => c.section === section && (c.slug === category || c.children?.some((k) => k.slug === category)));
    if (!belongs) notFound();
  }
  const raw = await searchParams;
  const first = (v: string | string[] | undefined): string | undefined => (Array.isArray(v) ? v[0] : v);
  const sp = { sort: first(raw.sort), maxPrice: first(raw.maxPrice), sizes: first(raw.sizes), inStock: first(raw.inStock), page: first(raw.page) };

  const cats = allCategories.filter((c) => c.section === section).map((c) => ({ slug: c.slug, name: c.name }));
  const filtered = getBySection(section, {
    category,
    sort: sp.sort as "newest" | "price-asc" | "price-desc" | "rating" | "popular" | undefined,
    maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
    sizes: sp.sizes ? sp.sizes.split(",").filter(Boolean) : undefined,
    inStock: sp.inStock === "1",
  }, allProducts);

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
    <main className="mx-auto max-w-[1280px] px-4 py-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="text-xs text-ash" aria-label="Breadcrumb">
        <Link href="/" className="underline">Home</Link> /{" "}
        <Link href={`/${section}`} className="capitalize underline">{section}</Link> /{" "}
        <span className="text-[#F5F5F5]">{name}</span>
      </nav>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">{name}</h1>
          <p className="text-sm text-ash">{filtered.length} result{filtered.length === 1 ? "" : "s"}</p>
        </div>
        <Suspense>
          <SortSelect />
        </Suspense>
      </div>
      <div className="mt-4 grid gap-6 lg:grid-cols-[240px_1fr]">
        <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-white/10" />}>
          <Filters categories={cats} sizes={["S", "M", "L", "XL"]} bounds={priceBounds(allProducts)} />
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
