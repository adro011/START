"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/catalog";
import { getProduct } from "@/lib/catalog";
import { formatBDT, cn } from "@/lib/format";
import { useCart } from "@/store/cart";

/**
 * Compact cross-sell card inside the buy column: thumbnail, name, price,
 * one-tap quick add (first in-stock size). Mirrors ProductCard logic.
 */
export default function PairWellWith({ product }: { product: Product }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  function quickAdd() {
    const full = getProduct(product.slug);
    const firstSize = product.sizes[0];
    const variant =
      full?.variants.find((v) => v.size === firstSize && v.stock > 0) ??
      full?.variants.find((v) => v.size === firstSize) ??
      full?.variants[0];
    add({
      sku: variant?.sku ?? `${product.slug}-${firstSize ?? "STD"}-STD`,
      slug: product.slug,
      name: product.name,
      image: product.images[0]?.src ?? "",
      size: firstSize ?? "M",
      color: variant?.color ?? product.colors[0]?.name ?? "As shown",
      pricePaisa: variant?.priceOverridePaisa ?? product.pricePaisa,
      qty: 1,
      stock: variant?.stock ?? 99,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  }

  const img = product.images[0];

  return (
    <section aria-label="Pairs well with" className="border border-[#172121]/12 bg-white/50 p-3">
      <p className="px-1 text-[12px] font-semibold tracking-[0.18em] text-[#172121]/60 uppercase">
        Pairs well with
      </p>
      <div className="mt-2 flex items-center gap-3">
        <Link
          href={`/product/${product.slug}`}
          aria-label={`View ${product.name}`}
          className="relative block h-20 w-16 shrink-0 overflow-hidden bg-[#F2CCC3]/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D5573B]"
        >
          {img && (
            <Image src={img.src} alt={img.alt || product.name} fill sizes="64px" className="object-cover" />
          )}
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            href={`/product/${product.slug}`}
            className="link-lux block truncate text-[14px] font-medium hover:text-[#7D451B]"
          >
            {product.name}
          </Link>
          <p className="mt-0.5 text-[14px] font-semibold text-[#7D451B]">
            {formatBDT(product.pricePaisa)}
          </p>
          <button
            type="button"
            onClick={quickAdd}
            className={cn(
              "mt-1.5 px-4 py-1.5 text-[12px] font-semibold tracking-[0.1em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D5573B]",
              added ? "bg-[#7E9181] text-white" : "bg-[#172121] text-[#FBF6F3] hover:bg-clay",
            )}
          >
            {added ? "✓ Added" : "Add to bag"}
          </button>
        </div>
      </div>
    </section>
  );
}
