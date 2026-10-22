import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { asCatalogProduct, searchProducts } from "@/lib/catalog";
import { getLiveProducts } from "@/lib/storefront";

export const metadata: Metadata = {
  title: "Search",
  description: "Search panjabi, sharee, kabli and more.",
};

const QUICK_SEARCH_PILLS = [
  { label: "Panjabi", query: "panjabi" },
  { label: "Sharee", query: "sharee" },
  { label: "Kabli", query: "kabli" },
  { label: "3pcs", query: "3pcs" },
  { label: "Men", href: "/men" },
  { label: "Women", href: "/women" },
];

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
    <main
      className="mx-auto min-h-screen max-w-6xl bg-[#010101] px-4 py-6 text-[var(--color-smoke)]"
      data-particle-id="search.main"
      data-particle-type="section"
      data-particle-label="Search Page Main Container"
      data-editable="true"
    >
      {/* Search Hero / Header Banner Section */}
      <section
        data-spotlight-section
        className="relative overflow-hidden rounded-xl border border-white/10 bg-[#010101] p-6 md:p-8"
        data-particle-id="search.hero"
        data-particle-type="section"
        data-particle-label="Search Hero Header Banner"
        data-editable="true"
      >
        <div
          data-spotlight-target
          className="relative z-10"
          data-particle-id="search.hero.inner"
          data-particle-type="section"
          data-particle-label="Search Hero Spotlight Target"
          data-editable="true"
        >
          <nav
            className="text-xs text-ash"
            aria-label="Breadcrumb"
            data-particle-id="search.breadcrumb"
            data-particle-type="section"
            data-particle-label="Search Breadcrumb Navigation"
            data-editable="true"
          >
            <Link
              href="/"
              className="underline transition-colors hover:text-[var(--abrar-accent)]"
              data-particle-id="search.breadcrumb.home"
              data-particle-type="link"
              data-particle-label="Breadcrumb Home Link"
              data-editable="true"
            >
              Home
            </Link>{" "}
            /{" "}
            <span
              className="text-[var(--color-smoke)]"
              data-particle-id="search.breadcrumb.current"
              data-particle-type="text"
              data-particle-label="Breadcrumb Search Current Label"
              data-editable="true"
            >
              Search
            </span>
          </nav>

          <p
            className="mt-3 text-[11px] font-semibold tracking-[0.2em] text-[var(--abrar-accent)] uppercase"
            data-particle-id="search.kicker"
            data-particle-type="badge"
            data-particle-label="Search Section Kicker"
            data-editable="true"
          >
            ABRAR EXCLUSIVE // CATALOG INDEX
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1
              className="text-2xl font-semibold text-[var(--color-smoke)] md:text-3xl"
              data-particle-id="search.title"
              data-particle-type="heading"
              data-particle-label="Search Page Heading"
              data-editable="true"
            >
              {query ? <>Results for “{query}” ({results.length})</> : "Search"}
            </h1>
            <span
              className="inline-flex items-center rounded-full border border-[var(--abrar-accent)]/40 bg-[var(--abrar-surface)] px-2.5 py-0.5 text-xs font-medium text-[var(--abrar-accent)]"
              data-particle-id="search.count_badge"
              data-particle-type="badge"
              data-particle-label="Search Results Count Badge"
              data-editable="true"
            >
              {results.length} match{results.length === 1 ? "" : "es"}
            </span>
          </div>

          {!query && (
            <p
              className="mt-2 text-sm text-ash"
              data-particle-id="search.subtitle"
              data-particle-type="text"
              data-particle-label="Search Tip Subtitle"
              data-editable="true"
            >
              Tip: press Ctrl/⌘+K anywhere to search.
            </p>
          )}

          {/* Quick Search / Category Pills */}
          <div
            className="mt-5 flex gap-1.5 overflow-x-auto pb-1"
            data-particle-id="search.pills"
            data-particle-type="section"
            data-particle-label="Search Quick Filter Pills"
            data-editable="true"
          >
            {QUICK_SEARCH_PILLS.map((pill) => {
              const href = pill.href ?? `/search?q=${encodeURIComponent(pill.query!)}`;
              const active = pill.query && query.toLowerCase() === pill.query.toLowerCase();
              const slugKey = (pill.query ?? pill.label).toLowerCase().replace(/[^a-z0-9]+/g, "_");
              return (
                <Link
                  key={pill.label}
                  href={href}
                  className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? "border-[var(--abrar-accent)] bg-[var(--abrar-accent)] text-[#010101]"
                      : "border-white/15 bg-[var(--abrar-surface)] text-[var(--color-smoke)] hover:border-[var(--abrar-accent)]/60 hover:text-[var(--abrar-accent)]"
                  }`}
                  data-particle-id={`search.pill.${slugKey}`}
                  data-particle-type="link"
                  data-particle-label={`Search Pill: ${pill.label}`}
                  data-editable="true"
                >
                  {pill.label}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Search Results Grid Section */}
      <section
        data-spotlight-section
        className="mt-6 rounded-xl border border-white/10 bg-[#010101] p-4 md:p-6"
        data-particle-id="search.results_section"
        data-particle-type="section"
        data-particle-label="Search Results Grid Section"
        data-editable="true"
      >
        <div
          data-spotlight-target
          data-particle-id="search.results.inner"
          data-particle-type="section"
          data-particle-label="Search Results Spotlight Target"
          data-editable="true"
        >
          {query && results.length === 0 && (
            <div
              className="rounded-xl border border-white/15 bg-[var(--abrar-surface)] p-8 text-center"
              data-particle-id="search.empty_state"
              data-particle-type="card"
              data-particle-label="Search Empty State Card"
              data-editable="true"
            >
              <p
                className="text-sm text-ash"
                data-particle-id="search.empty_state.text"
                data-particle-type="text"
                data-particle-label="Search Empty State Text"
                data-editable="true"
              >
                No matches. Try “panjabi”, “sharee”, “kabli” or “3pcs”.
              </p>
            </div>
          )}
          <div
            className="grid grid-cols-2 gap-3 md:grid-cols-4"
            data-particle-id="search.product_grid"
            data-particle-type="section"
            data-particle-label="Search Product Results Grid Wrapper"
            data-editable="true"
          >
            {results.map((p) => (
              <div
                key={p.slug}
                data-particle-id={`search.product_card.${p.slug}`}
                data-particle-type="card"
                data-particle-label={`Search Result Card: ${p.name}`}
                data-editable="true"
              >
                <ProductCard product={asCatalogProduct(p)} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
