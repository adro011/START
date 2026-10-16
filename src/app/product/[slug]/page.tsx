import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Gallery from "@/components/gallery";
import Reviews from "@/components/reviews";
import WhatsAppOrder from "@/components/whatsapp-order";
import RecentlyViewed from "@/components/recently-viewed";
import TrackRecent from "./track-recent";
import VariantPicker from "./variant-picker";
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
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <TrackRecent slug={product.slug} />
      <nav className="text-xs text-neutral-600" aria-label="Breadcrumb">
        <Link href={`/${product.section}`} className="capitalize underline">{product.section}</Link>
        {" / "}
        <Link href={`/${product.section}?category=${product.category}`} className="underline">{product.categoryName}</Link>
        {" / "}
        <span className="text-neutral-800">{product.name}</span>
      </nav>

      <div className="mt-4 grid gap-8 md:grid-cols-2">
        <Gallery images={product.images} name={product.name} />
        <div>
          <div className="flex flex-wrap gap-1.5">
            {product.isNew && <span className="rounded-full bg-neutral-900 px-2.5 py-0.5 text-xs font-medium text-white">New</span>}
            {product.isSale && <span className="rounded-full bg-red-700 px-2.5 py-0.5 text-xs font-medium text-white">Sale</span>}
          </div>
          <h1 className="mt-2 text-2xl font-semibold md:text-3xl">{product.name}</h1>
          <p className="mt-1 text-sm text-neutral-600">
            {product.categoryName} · ★ {product.rating.toFixed(1)} ({product.reviewCount} reviews)
          </p>

          <div className="mt-4">
            <VariantPicker product={product} />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <WhatsAppOrder name={product.name} slug={product.slug} />
          </div>

          <div className="mt-6 divide-y rounded-xl border">
            <details className="px-4 py-3" open>
              <summary className="cursor-pointer font-medium">Details</summary>
              <p className="mt-2 text-sm text-neutral-700">{product.description}</p>
              {product.fitNotes && <p className="mt-1 text-sm text-neutral-700">{product.fitNotes}</p>}
            </details>
            <details className="px-4 py-3">
              <summary className="cursor-pointer font-medium">Fabric &amp; care</summary>
              <p className="mt-2 text-sm text-neutral-700">{product.fabric}</p>
              <p className="mt-1 text-sm text-neutral-700">{product.care}</p>
            </details>
            <details className="px-4 py-3">
              <summary className="cursor-pointer font-medium">Shipping &amp; returns</summary>
              <p className="mt-2 text-sm text-neutral-700">
                Dhaka ৳60 · Outside Dhaka ৳120. Free delivery over ৳2,500.
                7-day easy exchange (tags intact, unworn).
              </p>
            </details>
          </div>
        </div>
      </div>

      <Reviews slug={product.slug} rating={product.rating} reviewCount={product.reviewCount} />

      <section aria-label="Related products" className="mt-10">
        <h2 className="text-lg font-semibold">Complete the look</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          {related.map((p) => (
            <ProductCard key={p.slug} product={asCatalogProduct(p)} />
          ))}
        </div>
      </section>

      <RecentlyViewed exclude={product.slug} />
    </main>
  );
}
