"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { CatalogProduct } from "@/types/catalog";
import { useCart } from "@/store/cart";
import { getProduct } from "@/lib/catalog";
import { cn, formatBDT } from "../lib/format";

/**
 * Product card: hover image swap (images[1]), quick-add with the first
 * in-stock size (resolves the real SKU via the catalog lib, adds a proper
 * CartItem to the cart store), wishlist heart (local state), sale/new
 * badges, paisa pricing, star text.
 */
export function ProductCard({ product }: { product: CatalogProduct }) {
  const p = product;
  const [wished, setWished] = useState(false);
  const [added, setAdded] = useState(false);
  const { add } = useCart();

  const imgs = Array.isArray(p.images) ? p.images : [];
  const [first, second] = [imgs[0], imgs[1]];
  const firstSize =
    Array.isArray(p.sizes) && p.sizes.length > 0 ? p.sizes[0] : undefined;

  const onSale = p.isSale || (p.compareAtPaisa ?? 0) > p.pricePaisa;
  const rating = p.rating > 0 ? p.rating : null;

  const quickAdd = () => {
    if (!firstSize) return;
    const full = getProduct(p.slug);
    const variant =
      full?.variants.find((v) => v.size === firstSize && v.stock > 0) ??
      full?.variants.find((v) => v.size === firstSize) ??
      full?.variants[0];
    add({
      sku: variant?.sku ?? `${p.slug}-${firstSize}-STD`,
      slug: p.slug,
      name: p.name,
      image: first?.src ?? "",
      size: firstSize,
      color: variant?.color ?? p.colors[0]?.name ?? "As shown",
      pricePaisa: variant?.priceOverridePaisa ?? p.pricePaisa,
      qty: 1,
      stock: variant?.stock ?? 99,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  };

  return (
    <article className="group relative flex w-full flex-col">
      <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-[#F2CCC3] via-[#FBF6F3] to-[#7E9181]/30">
        {first ? (
          <Link
            href={`/product/${p.slug}`}
            aria-label={p.name}
            className="absolute inset-0"
          >
            <Image
              src={first.src}
              alt={first.alt || p.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
              className="object-cover transition-all duration-500 group-hover:scale-[1.04]"
            />
            {second && (
              <Image
                src={second.src}
                alt={second.alt || p.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
                className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                aria-hidden="true"
              />
            )}
          </Link>
        ) : (
          <Link
            href={`/product/${p.slug}`}
            aria-label={p.name}
            className="absolute inset-0 flex items-center justify-center"
          >
            <span
              className="font-display text-[40px] font-semibold text-[#7D451B]/40"
              aria-hidden="true"
            >
              {p.name.slice(0, 1)}
            </span>
          </Link>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1.5">
          {onSale && (
            <span className="bg-[#D5573B] px-2 py-1 text-[10.5px] font-semibold tracking-[0.12em] text-white uppercase">
              Sale
            </span>
          )}
          {p.isNew && (
            <span className="bg-[#172121] px-2 py-1 text-[10.5px] font-semibold tracking-[0.12em] text-[#FBF6F3] uppercase">
              New
            </span>
          )}
        </div>

        {/* Wishlist heart */}
        <button
          type="button"
          aria-pressed={wished}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          onClick={() => setWished((w) => !w)}
          className={cn(
            "absolute top-2 right-2 rounded-full bg-[#FBF6F3]/90 p-2 backdrop-blur transition-all duration-200 active:scale-90",
            wished ? "text-[#D5573B]" : "text-[#172121]/60 hover:text-[#D5573B]",
            wished && "scale-110",
          )}
        >
          <svg viewBox="0 0 24 24" fill={wished ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" className="h-[17px] w-[17px]" aria-hidden="true">
            <path d="M12 20.5C7 16.5 3.5 13.3 3.5 9.6 3.5 7 5.5 5 8 5c1.6 0 3.1.8 4 2.1C12.9 5.8 14.4 5 16 5c2.5 0 4.5 2 4.5 4.6 0 3.7-3.5 6.9-8.5 10.9Z" />
          </svg>
        </button>

        {/* Quick-add slides up on hover (always reachable on touch) */}
        {firstSize && (
          <div className="absolute inset-x-2 bottom-2 translate-y-0 transition-transform duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] md:translate-y-[120%] md:group-hover:translate-y-0 md:group-focus-within:translate-y-0">
            <button
              type="button"
              onClick={quickAdd}
              className={cn(
                "w-full py-2.5 text-[12px] font-semibold tracking-[0.14em] uppercase backdrop-blur transition-colors",
                added
                  ? "bg-[#7E9181] text-white"
                  : "bg-[#172121]/90 text-[#FBF6F3] hover:bg-[#D5573B]",
              )}
            >
              {added ? "Added ✓" : `Quick add · ${firstSize}`}
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 px-0.5 pt-3 pb-1">
        <Link
          href={`/product/${p.slug}`}
          className="text-[14.5px] leading-snug font-medium text-[#172121] underline-offset-4 hover:text-[#7D451B] hover:underline"
        >
          {p.name}
        </Link>
        <div className="flex items-baseline gap-2">
          <span className="text-[15px] font-semibold text-[#7D451B]">
            {formatBDT(p.pricePaisa)}
          </span>
          {p.compareAtPaisa != null && p.compareAtPaisa > p.pricePaisa && (
            <s className="text-[13px] text-[#172121]/45">
              {formatBDT(p.compareAtPaisa)}
            </s>
          )}
        </div>
        {rating !== null && (
          <p className="text-[12.5px] text-[#172121]/60" aria-label={`Rated ${rating} out of 5`}>
            <span aria-hidden="true" className="tracking-[0.1em] text-[#7D451B]">
              {"★".repeat(Math.round(rating))}
              <span className="text-[#172121]/25">
                {"★".repeat(Math.max(0, 5 - Math.round(rating)))}
              </span>
            </span>{" "}
            {rating.toFixed(1)}
            {p.reviewCount > 0 && ` (${p.reviewCount})`}
          </p>
        )}
      </div>
    </article>
  );
}
