import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Filters, { LoadMore } from "@/components/filters";
import SortSelect from "@/components/sort-select";
import { ProductCard } from "@/components/product-card";
import Reveal from "@/components/reveal";
import { CATEGORIES, asCatalogProduct, getBySection, isValidSection, priceBounds } from "@/lib/catalog";
import { getLiveCategories, getLiveProducts } from "@/lib/storefront";

export const revalidate = 300;

export function generateStaticParams() {
  return [{ section: "men" }, { section: "women" }, { section: "kids" }, { section: "new-arrivals" }, { section: "sale" }];
}

export async function generateMetadata({ params }: { params: Promise<{ section: string }> }): Promise<Metadata> {
  const { section } = await params;
  const title = section === "new-arrivals" ? "New Arrivals" : section === "sale" ? "Sale" : section[0].toUpperCase() + section.slice(1);
  return { title: `${title} — Shop`, description: `Shop ${title.toLowerCase()} fashion in Bangladesh. COD, easy exchange.`, alternates: { canonical: `/${section}` } };
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
  // Live-first (Supabase) with local fallback; helpers take the source list.
  const [{ products: liveProducts }, { categories: liveCategories }] = await Promise.all([
    getLiveProducts(),
    getLiveCategories(),
  ]);
  const allProducts = liveProducts.length > 0 ? liveProducts : undefined;
  const allCategories = liveCategories.length > 0 ? liveCategories : CATEGORIES;
  const cats = allCategories.filter((c) => section === "new-arrivals" || section === "sale" ? true : c.section === realSection)
    .map((c) => ({ slug: c.slug, name: c.name }));

  const sizes = ["S", "M", "L", "XL"];

  const filtered = getBySection(realSection, {
    category: sp.category,
    sort: sp.sort as "newest" | "price-asc" | "price-desc" | "rating" | "popular" | undefined,
    query: sp.q,
    maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
    sizes: sp.sizes ? sp.sizes.split(",").filter(Boolean) : undefined,
    inStock: sp.inStock === "1",
  }, allProducts);

  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const visible = filtered.slice(0, page * PAGE_SIZE);

  const title = section === "new-arrivals" ? "New Arrivals" : section === "sale" ? "Sale" : section[0].toUpperCase() + section.slice(1);

  return (
    <main
      className="mx-auto min-h-screen max-w-[1280px] bg-[#010101] px-4 py-6 text-[var(--color-smoke)]"
      data-particle-id={`section.${section}.main`}
      data-particle-type="section"
      data-particle-label={`${title} Storefront Main Container`}
      data-editable="true"
    >
      {/* Hero / Header Banner Section */}
      <section
        data-spotlight-section
        className="relative overflow-hidden rounded-xl border border-white/10 bg-[#010101] p-6 md:p-8"
        data-particle-id={`section.${section}.hero`}
        data-particle-type="section"
        data-particle-label={`${title} Hero Header Section`}
        data-editable="true"
      >
        <div
          data-spotlight-target
          className="relative z-10"
          data-particle-id={`section.${section}.hero.inner`}
          data-particle-type="section"
          data-particle-label={`${title} Hero Spotlight Target`}
          data-editable="true"
        >
          <nav
            className="text-xs text-ash"
            aria-label="Breadcrumb"
            data-particle-id={`section.${section}.breadcrumb`}
            data-particle-type="section"
            data-particle-label={`${title} Breadcrumb Navigation`}
            data-editable="true"
          >
            <Link
              href="/"
              className="underline transition-colors hover:text-[var(--abrar-accent)]"
              data-particle-id={`section.${section}.breadcrumb.home`}
              data-particle-type="link"
              data-particle-label="Breadcrumb Home Link"
              data-editable="true"
            >
              Home
            </Link>{" "}
            /{" "}
            <span
              className="capitalize text-[var(--color-smoke)]"
              data-particle-id={`section.${section}.breadcrumb.current`}
              data-particle-type="text"
              data-particle-label={`Breadcrumb Current Section (${title})`}
              data-editable="true"
            >
              {title}
            </span>
          </nav>

          <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p
                className="text-[11px] font-semibold tracking-[0.2em] text-[var(--abrar-accent)] uppercase"
                data-particle-id={`section.${section}.kicker`}
                data-particle-type="badge"
                data-particle-label={`${title} Section Kicker`}
                data-editable="true"
              >
                ABRAR EXCLUSIVE // {title}
              </p>
              <h1
                className="mt-1 text-2xl font-semibold capitalize text-[var(--color-smoke)] md:text-3xl"
                data-particle-id={`section.${section}.title`}
                data-particle-type="heading"
                data-particle-label={`${title} Page Heading`}
                data-editable="true"
              >
                {title}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2.5">
                <span
                  className="inline-flex items-center rounded-full border border-[var(--abrar-accent)]/40 bg-[var(--abrar-surface)] px-2.5 py-0.5 text-xs font-medium text-[var(--abrar-accent)]"
                  data-particle-id={`section.${section}.count_badge`}
                  data-particle-type="badge"
                  data-particle-label={`${title} Product Count Badge`}
                  data-editable="true"
                >
                  {filtered.length} result{filtered.length === 1 ? "" : "s"}
                </span>
                <p
                  className="text-sm text-ash"
                  data-particle-id={`section.${section}.subtitle`}
                  data-particle-type="text"
                  data-particle-label={`${title} Section Subtitle Description`}
                  data-editable="true"
                >
                  Curated luxury silhouettes crafted for Bangladesh.
                </p>
              </div>
            </div>
            <div
              data-particle-id={`section.${section}.sort_wrapper`}
              data-particle-type="section"
              data-particle-label={`${title} Sort Selector Wrapper`}
              data-editable="true"
            >
              <Suspense>
                <SortSelect />
              </Suspense>
            </div>
          </div>

          {/* Section chips */}
          <div
            className="mt-5 flex gap-1.5 overflow-x-auto pb-1"
            data-particle-id={`section.${section}.pills`}
            data-particle-type="section"
            data-particle-label="Section Navigation Pills"
            data-editable="true"
          >
            <Link
              href="/men"
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                section === "men"
                  ? "border-[var(--abrar-accent)] bg-[var(--abrar-accent)] text-[#010101]"
                  : "border-white/15 bg-[var(--abrar-surface)] text-[var(--color-smoke)] hover:border-[var(--abrar-accent)]/60 hover:text-[var(--abrar-accent)]"
              }`}
              data-particle-id={`section.${section}.pill.men`}
              data-particle-type="link"
              data-particle-label="Men Section Pill"
              data-editable="true"
            >
              Men
            </Link>
            <Link
              href="/women"
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                section === "women"
                  ? "border-[var(--abrar-accent)] bg-[var(--abrar-accent)] text-[#010101]"
                  : "border-white/15 bg-[var(--abrar-surface)] text-[var(--color-smoke)] hover:border-[var(--abrar-accent)]/60 hover:text-[var(--abrar-accent)]"
              }`}
              data-particle-id={`section.${section}.pill.women`}
              data-particle-type="link"
              data-particle-label="Women Section Pill"
              data-editable="true"
            >
              Women
            </Link>
            <Link
              href="/kids"
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                section === "kids"
                  ? "border-[var(--abrar-accent)] bg-[var(--abrar-accent)] text-[#010101]"
                  : "border-white/15 bg-[var(--abrar-surface)] text-[var(--color-smoke)] hover:border-[var(--abrar-accent)]/60 hover:text-[var(--abrar-accent)]"
              }`}
              data-particle-id={`section.${section}.pill.kids`}
              data-particle-type="link"
              data-particle-label="Kids Section Pill"
              data-editable="true"
            >
              Kids
            </Link>
            <Link
              href="/new-arrivals"
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                section === "new-arrivals"
                  ? "border-[var(--abrar-accent)] bg-[var(--abrar-accent)] text-[#010101]"
                  : "border-white/15 bg-[var(--abrar-surface)] text-[var(--color-smoke)] hover:border-[var(--abrar-accent)]/60 hover:text-[var(--abrar-accent)]"
              }`}
              data-particle-id={`section.${section}.pill.new_arrivals`}
              data-particle-type="link"
              data-particle-label="New Arrivals Section Pill"
              data-editable="true"
            >
              New Arrivals
            </Link>
            <Link
              href="/sale"
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                section === "sale"
                  ? "border-[var(--abrar-accent)] bg-[var(--abrar-accent)] text-[#010101]"
                  : "border-[var(--abrar-accent)]/40 bg-[var(--abrar-surface)] text-[var(--abrar-accent)] hover:border-[var(--abrar-accent)]"
              }`}
              data-particle-id={`section.${section}.pill.sale`}
              data-particle-type="link"
              data-particle-label="Sale Section Pill"
              data-editable="true"
            >
              Sale
            </Link>
          </div>
        </div>
      </section>

      {/* Product Grid & Filters Section */}
      <section
        data-spotlight-section
        className="mt-6 rounded-xl border border-white/10 bg-[#010101] p-4 md:p-6"
        data-particle-id={`section.${section}.catalog_section`}
        data-particle-type="section"
        data-particle-label={`${title} Catalog & Product Grid Section`}
        data-editable="true"
      >
        <div
          data-spotlight-target
          className="grid gap-6 lg:grid-cols-[240px_1fr] lg:items-start"
          data-particle-id={`section.${section}.catalog.inner`}
          data-particle-type="section"
          data-particle-label={`${title} Catalog Spotlight Target`}
          data-editable="true"
        >
          <div
            data-particle-id={`section.${section}.filters_sidebar`}
            data-particle-type="section"
            data-particle-label={`${title} Filters Sidebar`}
            data-editable="true"
          >
            <Suspense>
              <Filters categories={cats.slice(0, 18)} sizes={sizes} bounds={priceBounds(allProducts)} />
            </Suspense>
          </div>
          <div
            data-particle-id={`section.${section}.results_column`}
            data-particle-type="section"
            data-particle-label={`${title} Product Results Column`}
            data-editable="true"
          >
            {visible.length === 0 ? (
              <div
                className="rounded-xl border border-white/15 bg-[var(--abrar-surface)] p-10 text-center"
                data-particle-id={`section.${section}.empty_state`}
                data-particle-type="card"
                data-particle-label={`${title} Empty State Card`}
                data-editable="true"
              >
                <p
                  className="font-medium text-[var(--color-smoke)]"
                  data-particle-id={`section.${section}.empty_state.title`}
                  data-particle-type="heading"
                  data-particle-label="Empty State Title"
                  data-editable="true"
                >
                  No products match those filters.
                </p>
                <p
                  className="mt-1 text-sm text-ash"
                  data-particle-id={`section.${section}.empty_state.description`}
                  data-particle-type="text"
                  data-particle-label="Empty State Suggestion Text"
                  data-editable="true"
                >
                  Try clearing the price cap or trying “Panjabi”, “Sharee”, “Kabli”.
                </p>
                <Link
                  href={`/${section}`}
                  className="mt-3 inline-block text-sm text-[var(--abrar-accent)] underline hover:text-[var(--color-smoke)]"
                  data-particle-id={`section.${section}.empty_state.clear_link`}
                  data-particle-type="link"
                  data-particle-label="Clear Filters Link"
                  data-editable="true"
                >
                  Clear filters
                </Link>
              </div>
            ) : (
              <div
                className="grid grid-cols-2 gap-3 md:grid-cols-3"
                data-particle-id={`section.${section}.product_grid`}
                data-particle-type="section"
                data-particle-label={`${title} Product Grid Wrapper`}
                data-editable="true"
              >
                {visible.map((p, i) => (
                  <Reveal key={p.slug} delay={(i % 6) * 50}>
                    <div
                      data-particle-id={`section.${section}.product_card.${p.slug}`}
                      data-particle-type="card"
                      data-particle-label={`Product Card: ${p.name}`}
                      data-editable="true"
                    >
                      <ProductCard product={asCatalogProduct(p)} />
                    </div>
                  </Reveal>
                ))}
              </div>
            )}
            <div
              data-particle-id={`section.${section}.load_more`}
              data-particle-type="section"
              data-particle-label={`${title} Load More Pagination`}
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
