"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { CatalogProduct } from "@/types/catalog";
import { useCart } from "@/store/cart";
import { cn, formatBDT } from "../lib/format";

/**
 * Product card: hover image swap (images[1]), quick-add with the first
 * in-stock size (resolves the real SKU via the catalog lib, adds a proper
 * CartItem to the cart store), wishlist heart (local state), sale/new
 * badges, paisa pricing, star text.
 */
const ADD_PERCENTAGES = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50] as const;

export function ProductCard({ product }: { product: CatalogProduct }) {
  const p = product;
  const [wished, setWished] = useState(false);
  const [added, setAdded] = useState(false);
  const [addPct, setAddPct] = useState<number | null>(null);
  const { add } = useCart();

  const imgs = Array.isArray(p.images) ? p.images : [];
  const [first, second] = [imgs[0], imgs[1]];
  const firstSize =
    Array.isArray(p.sizes) && p.sizes.length > 0 ? p.sizes[0] : undefined;

  const onSale = p.isSale || (p.compareAtPaisa ?? 0) > p.pricePaisa;
  const rating = p.rating > 0 ? p.rating : null;

  // Struck-through value: the chosen markup (price + %) or the stored
  // compare-at price when no markup chip is active.
  const struckPaisa =
    addPct != null
      ? Math.round(p.pricePaisa * (1 + addPct / 100))
      : p.compareAtPaisa != null && p.compareAtPaisa > p.pricePaisa
        ? p.compareAtPaisa
        : null;

  const quickAdd = () => {
    if (!firstSize) return;
    // Variants ride on the card prop (asCatalogProduct includes them), so
    // quick-add resolves real SKUs for live Supabase products with no lookup.
    const variants = p.variants ?? [];
    const variant =
      variants.find((v) => v.size === firstSize && v.stock > 0) ??
      variants.find((v) => v.size === firstSize) ??
      variants[0];
    add({
      sku: variant?.sku ?? `${p.slug}-${firstSize}-STD`,
      slug: p.slug,
      name: p.name,
      image: first?.src ?? "",
      size: firstSize,
      color: variant?.color ?? p.colors[0]?.name ?? "As shown",
      pricePaisa: variant?.pricePaisa ?? p.pricePaisa,
      qty: 1,
      stock: variant?.stock ?? 99,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  };

  return (
    <article className="group relative flex w-full flex-col" data-cursor="View">
      <div className="lift card-sheen relative aspect-[3/4] overflow-hidden border border-[var(--abrar-ink)]/8 bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-dark)]/25 shadow-[0_0_0_rgba(0,0,0,0)] group-hover:shadow-[0_24px_48px_rgba(23,33,33,0.16)]">
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
              className="object-cover transition-all duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06] group-hover:translate-y-[-2px]"
            />
            {second && (
              <Image
                src={second.src}
                alt={second.alt || p.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
                className="object-cover opacity-0 transition-all duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06] group-hover:opacity-100"
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
              className="font-display text-[40px] font-semibold text-gold/40"
              aria-hidden="true"
            >
              {p.name.slice(0, 1)}
            </span>
          </Link>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {onSale && (
            <span className="bg-gold px-2.5 py-1 text-[10.5px] font-semibold tracking-[0.16em] text-black uppercase shadow-[0_8px_20px_rgba(255,192,0,0.35)]">
              Sale
            </span>
          )}
          {p.isNew && (
            <span className="glass-dark px-2.5 py-1 text-[10.5px] font-semibold tracking-[0.16em] text-[var(--color-smoke)] uppercase">
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
            "absolute top-3 right-3 rounded-full border border-white/40 bg-[var(--color-paper)]/85 p-2 shadow-[0_8px_20px_rgba(23,33,33,0.12)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 active:scale-90",
            wished ? "text-gold pop" : "text-[var(--abrar-ink)]/80 hover:text-gold",
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
                  : "bg-gold text-black hover:bg-gold-dark",
              )}
            >
              {added ? "Added ✓" : `Quick add · ${firstSize}`}
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 px-0.5 pt-3.5 pb-1">
        <p className="text-[11px] font-semibold tracking-[0.2em] text-ash uppercase">{p.colors[0]?.name ?? "Heritage"}</p>
        <Link
          href={`/product/${p.slug}`}
          className="link-lux w-fit text-[15px] leading-snug font-medium text-[var(--color-smoke)] hover:text-gold"
        >
          {p.name}
        </Link>
        <div className="mt-0.5 flex items-baseline gap-2">
          <span className="price text-[16px] font-semibold tracking-tight text-gold" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "19px" }}>
            {formatBDT(p.pricePaisa)}
          </span>
          {struckPaisa != null && (
            <s
              className="text-[13px] text-ash"
              aria-label={
                addPct != null
                  ? `Price with ${addPct}% added`
                  : "Compare-at price"
              }
            >
              {formatBDT(struckPaisa)}
            </s>
          )}
        </div>
        <div className="mt-1.5">
          <p className="text-[9px] font-semibold tracking-[0.2em] text-ash uppercase">
            Price + added %
          </p>
          <div
            className="mt-1 flex flex-wrap gap-1"
            role="group"
            aria-label="Show price with percentage added"
          >
            {ADD_PERCENTAGES.map((pct) => (
              <button
                key={pct}
                type="button"
                aria-pressed={addPct === pct}
                aria-label={`Add ${pct}% to price`}
                onClick={() => setAddPct((v) => (v === pct ? null : pct))}
                className={cn(
                  "rounded-full border px-1.5 py-0.5 text-[9.5px] font-semibold tracking-[0.04em] tabular-nums transition-colors",
                  addPct === pct
                    ? "border-gold bg-gold text-black"
                    : "border-[var(--color-gold)]/25 text-ash hover:border-gold hover:text-gold",
                )}
              >
                +{pct}%
              </button>
            ))}
          </div>
        </div>
        {rating !== null && (
          <p className="text-[12.5px] text-steel" aria-label={`Rated ${rating} out of 5`}>
            <span aria-hidden="true" className="tracking-[0.1em] text-gold">
              {"★".repeat(Math.round(rating))}
              <span className="text-ash">
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
