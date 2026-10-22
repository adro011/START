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
    <main
      className="mx-auto min-h-screen max-w-[1280px] bg-[#010101] px-4 py-6 text-[var(--color-smoke)]"
      data-particle-id={`category.${section}.${category}.main`}
      data-particle-type="section"
      data-particle-label={`${name} (${section}) Category Main Container`}
      data-editable="true"
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Category Hero / Header Banner Section */}
      <section
        data-spotlight-section
        className="relative overflow-hidden rounded-xl border border-white/10 bg-[#010101] p-6 md:p-8"
        data-particle-id={`category.${section}.${category}.hero`}
        data-particle-type="section"
        data-particle-label={`${name} Category Hero Banner`}
        data-editable="true"
      >
        <div
          data-spotlight-target
          className="relative z-10"
          data-particle-id={`category.${section}.${category}.hero.inner`}
          data-particle-type="section"
          data-particle-label={`${name} Category Hero Spotlight Target`}
          data-editable="true"
        >
          <nav
            className="text-xs text-ash"
            aria-label="Breadcrumb"
            data-particle-id={`category.${section}.${category}.breadcrumb`}
            data-particle-type="section"
            data-particle-label={`${name} Category Breadcrumb Navigation`}
            data-editable="true"
          >
            <Link
              href="/"
              className="underline transition-colors hover:text-[var(--abrar-accent)]"
              data-particle-id={`category.${section}.${category}.breadcrumb.home`}
              data-particle-type="link"
              data-particle-label="Breadcrumb Home Link"
              data-editable="true"
            >
              Home
            </Link>{" "}
            /{" "}
            <Link
              href={`/${section}`}
              className="capitalize underline transition-colors hover:text-[var(--abrar-accent)]"
              data-particle-id={`category.${section}.${category}.breadcrumb.section`}
              data-particle-type="link"
              data-particle-label={`Breadcrumb ${section} Section Link`}
              data-editable="true"
            >
              {section}
            </Link>{" "}
            /{" "}
            <span
              className="text-[var(--color-smoke)]"
              data-particle-id={`category.${section}.${category}.breadcrumb.current`}
              data-particle-type="text"
              data-particle-label={`Breadcrumb Current Category (${name})`}
              data-editable="true"
            >
              {name}
            </span>
          </nav>

          <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p
                className="text-[11px] font-semibold tracking-[0.2em] text-[var(--abrar-accent)] uppercase"
                data-particle-id={`category.${section}.${category}.kicker`}
                data-particle-type="badge"
                data-particle-label={`${name} Category Section Kicker`}
                data-editable="true"
              >
                {section.toUpperCase()} COLLECTION // {name}
              </p>
              <h1
                className="mt-1 text-2xl font-semibold text-[var(--color-smoke)] md:text-3xl"
                data-particle-id={`category.${section}.${category}.title`}
                data-particle-type="heading"
                data-particle-label={`${name} Category Heading`}
                data-editable="true"
              >
                {name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2.5">
                <span
                  className="inline-flex items-center rounded-full border border-[var(--abrar-accent)]/40 bg-[var(--abrar-surface)] px-2.5 py-0.5 text-xs font-medium text-[var(--abrar-accent)]"
                  data-particle-id={`category.${section}.${category}.count_badge`}
                  data-particle-type="badge"
                  data-particle-label={`${name} Product Count Badge`}
                  data-editable="true"
                >
                  {filtered.length} result{filtered.length === 1 ? "" : "s"}
                </span>
                <p
                  className="text-sm text-ash"
                  data-particle-id={`category.${section}.${category}.subtitle`}
                  data-particle-type="text"
                  data-particle-label={`${name} Category Description`}
                  data-editable="true"
                >
                  Shop {name} in our {section} collection with Cash on Delivery across Bangladesh.
                </p>
              </div>
            </div>
            <div
              data-particle-id={`category.${section}.${category}.sort_wrapper`}
              data-particle-type="section"
              data-particle-label={`${name} Sort Selector Wrapper`}
              data-editable="true"
            >
              <Suspense>
                <SortSelect />
              </Suspense>
            </div>
          </div>

          {/* Sibling Category Pills */}
          {cats.length > 0 && (
            <div
              className="mt-5 flex gap-1.5 overflow-x-auto pb-1"
              data-particle-id={`category.${section}.${category}.pills`}
              data-particle-type="section"
              data-particle-label={`${section} Category Navigation Pills`}
              data-editable="true"
            >
              {cats.slice(0, 10).map((c) => {
                const active = c.slug === category;
                return (
                  <Link
                    key={c.slug}
                    href={`/${section}/${c.slug}`}
                    className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? "border-[var(--abrar-accent)] bg-[var(--abrar-accent)] text-[#010101]"
                        : "border-white/15 bg-[var(--abrar-surface)] text-[var(--color-smoke)] hover:border-[var(--abrar-accent)]/60 hover:text-[var(--abrar-accent)]"
                    }`}
                    data-particle-id={`category.${section}.${category}.pill.${c.slug}`}
                    data-particle-type="link"
                    data-particle-label={`${c.name} Category Pill`}
                    data-editable="true"
                  >
                    {c.name}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Product Grid & Filters Section */}
      <section
        data-spotlight-section
        className="mt-6 rounded-xl border border-white/10 bg-[#010101] p-4 md:p-6"
        data-particle-id={`category.${section}.${category}.catalog_section`}
        data-particle-type="section"
        data-particle-label={`${name} Catalog & Product Grid Section`}
        data-editable="true"
      >
        <div
          data-spotlight-target
          className="grid gap-6 lg:grid-cols-[240px_1fr] lg:items-start"
          data-particle-id={`category.${section}.${category}.catalog.inner`}
          data-particle-type="section"
          data-particle-label={`${name} Catalog Spotlight Target`}
          data-editable="true"
        >
          <div
            data-particle-id={`category.${section}.${category}.filters_sidebar`}
            data-particle-type="section"
            data-particle-label={`${name} Filters Sidebar`}
            data-editable="true"
          >
            <Suspense>
              <Filters categories={cats} sizes={["S", "M", "L", "XL"]} bounds={priceBounds(allProducts)} />
            </Suspense>
          </div>
          <div
            data-particle-id={`category.${section}.${category}.results_column`}
            data-particle-type="section"
            data-particle-label={`${name} Product Results Column`}
            data-editable="true"
          >
            {visible.length === 0 ? (
              <div
                className="rounded-xl border border-white/15 bg-[var(--abrar-surface)] p-10 text-center text-sm text-[var(--color-smoke)]"
                data-particle-id={`category.${section}.${category}.empty_state`}
                data-particle-type="card"
                data-particle-label={`${name} Empty State Card`}
                data-editable="true"
              >
                <span
                  data-particle-id={`category.${section}.${category}.empty_state.text`}
                  data-particle-type="text"
                  data-particle-label="Empty State Message"
                  data-editable="true"
                >
                  Nothing here yet — try{" "}
                </span>
                <Link
                  href={`/${section}`}
                  className="text-[var(--abrar-accent)] underline hover:text-[var(--color-smoke)]"
                  data-particle-id={`category.${section}.${category}.empty_state.link`}
                  data-particle-type="link"
                  data-particle-label={`View All ${section} Link`}
                  data-editable="true"
                >
                  all {section}
                </Link>
                .
              </div>
            ) : (
              <div
                className="grid grid-cols-2 gap-3 md:grid-cols-3"
                data-particle-id={`category.${section}.${category}.product_grid`}
                data-particle-type="section"
                data-particle-label={`${name} Product Grid Wrapper`}
                data-editable="true"
              >
                {visible.map((p) => (
                  <div
                    key={p.slug}
                    data-particle-id={`category.${section}.${category}.product_card.${p.slug}`}
                    data-particle-type="card"
                    data-particle-label={`Product Card: ${p.name}`}
                    data-editable="true"
                  >
                    <ProductCard product={asCatalogProduct(p)} />
                  </div>
                ))}
              </div>
            )}
            <div
              data-particle-id={`category.${section}.${category}.load_more`}
              data-particle-type="section"
              data-particle-label={`${name} Load More Pagination`}
              data-editable="true"
            >
              <Suspense>
                <LoadMore total={filtered.length} pageSize={PAGE_SIZE} />
              </Suspense>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
