import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Gallery from "@/components/gallery";
import Reviews from "@/components/reviews";
import WhatsAppOrder from "@/components/whatsapp-order";
import RecentlyViewed from "@/components/recently-viewed";
import TrackRecent from "./track-recent";
import VariantPicker from "./variant-picker";
import TrustPanel from "./trust-panel";
import PairWellWith from "./pair-well-with";
import { asCatalogProduct, getProduct, getRelated, PRODUCTS } from "@/lib/catalog";
import { formatBDT } from "@/lib/format";
import { ProductCard } from "@/components/product-card";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) return { title: "Product not found" };
  return {
    title: `${p.name} — ${formatBDT(p.pricePaisa)}`,
    description: p.description.slice(0, 155),
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const related = getRelated(product);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((i) => i.src),
    sku: product.variants[0]?.sku,
    aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviewCount },
    offers: {
      "@type": "Offer",
      priceCurrency: "BDT",
      price: (product.pricePaisa / 100).toFixed(2),
      availability: product.variants.some((v) => v.stock > 0) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <main className="mx-auto max-w-[1280px] px-4 pb-24 pt-5 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <TrackRecent slug={product.slug} />
      <nav className="text-[13px] text-[#172121]/60" aria-label="Breadcrumb">
        <Link href={`/${product.section}`} className="capitalize underline-offset-4 hover:text-clay hover:underline">
          {product.section}
        </Link>
        {" / "}
        <Link href={`/${product.section}?category=${product.category}`} className="underline-offset-4 hover:text-clay hover:underline">
          {product.categoryName}
        </Link>
        {" / "}
        <span aria-current="page" className="text-[#172121]">{product.name}</span>
      </nav>

      <div className="mt-4 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
        <Gallery images={product.images} name={product.name} />

        {/* Sticky buy column */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="flex flex-wrap items-center gap-2">
            {product.isNew && (
              <span className="bg-[#172121] px-2.5 py-1 text-[10.5px] font-semibold tracking-[0.16em] text-[#FBF6F3] uppercase">
                New
              </span>
            )}
            {product.isSale && (
              <span className="bg-clay px-2.5 py-1 text-[10.5px] font-semibold tracking-[0.16em] text-white uppercase">
                Sale
              </span>
            )}
            <span className="text-[12px] font-semibold tracking-[0.2em] text-[#172121]/50 uppercase">
              {product.categoryName}
            </span>
          </div>

          <h1
            className="mt-2 text-[clamp(1.9rem,4vw,3rem)] leading-[1.02] font-medium tracking-tight text-[#172121]"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {product.name}
          </h1>
          <p className="mt-2 text-[14px] text-[#172121]/70">
            <span aria-hidden="true" className="tracking-[0.12em] text-[#7D451B]">
              {"★".repeat(Math.max(1, Math.round(product.rating)))}
            </span>{" "}
            <span className="font-semibold text-[#172121]">{product.rating.toFixed(1)}</span>
            {" · "}
            <a href="#reviews" className="underline-offset-4 hover:text-clay hover:underline">
              {product.reviewCount} reviews
            </a>
          </p>
          <p className="mt-3 max-w-[52ch] text-[15px] leading-relaxed text-[#172121]/75">
            {product.description}
          </p>

          <div className="mt-2">
            <VariantPicker product={product} />
          </div>

          <div className="mt-3">
            <WhatsAppOrder name={product.name} slug={product.slug} />
          </div>

          <div className="mt-4">
            <TrustPanel />
          </div>

          {related[0] && (
            <div className="mt-4">
              <PairWellWith product={related[0]} />
            </div>
          )}

          <div className="mt-5 divide-y divide-[#172121]/10 border-y border-[#172121]/10">
            <details className="group py-4" open>
              <summary className="flex cursor-pointer list-none items-center justify-between text-[14px] font-semibold tracking-[0.06em] uppercase [&::-webkit-details-marker]:hidden">
                Details
                <span aria-hidden="true" className="text-[#7D451B] transition-transform duration-300 group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2 text-[14.5px] leading-relaxed text-[#172121]/75">{product.description}</p>
              {product.fitNotes && <p className="mt-1 text-[14.5px] text-[#172121]/75">{product.fitNotes}</p>}
            </details>
            <details className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-[14px] font-semibold tracking-[0.06em] uppercase [&::-webkit-details-marker]:hidden">
                Fabric &amp; care
                <span aria-hidden="true" className="text-[#7D451B] transition-transform duration-300 group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2 text-[14.5px] text-[#172121]/75">{product.fabric}</p>
              <p className="mt-1 text-[14.5px] text-[#172121]/75">{product.care}</p>
            </details>
            <details className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-[14px] font-semibold tracking-[0.06em] uppercase [&::-webkit-details-marker]:hidden">
                Shipping &amp; returns
                <span aria-hidden="true" className="text-[#7D451B] transition-transform duration-300 group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2 text-[14.5px] leading-relaxed text-[#172121]/75">
                Dhaka ৳60 · Outside Dhaka ৳120. Free delivery over ৳2,500.
                7-day easy exchange (tags intact, unworn). Cash on delivery nationwide.
              </p>
            </details>
          </div>
        </div>
      </div>

      <div id="reviews">
        <Reviews slug={product.slug} rating={product.rating} reviewCount={product.reviewCount} />
      </div>

      <section aria-label="Related products" className="mt-12">
        <p className="kicker text-clay">Complete the look</p>
        <h2
          className="display-xl mt-2"
          style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}
        >
          You may also love
        </h2>
        <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
          {related.map((p) => (
            <ProductCard key={p.slug} product={asCatalogProduct(p)} />
          ))}
        </div>
      </section>

      <RecentlyViewed exclude={product.slug} />
    </main>
  );
}
