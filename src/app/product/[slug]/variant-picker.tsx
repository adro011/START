"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/catalog";
import { formatBDT, cn } from "@/lib/format";
import { useCart } from "@/store/cart";
import { FREE_SHIP_THRESHOLD_PAISA } from "@/config/site";
import SizeGuide from "@/components/size-guide";
import BackInStock from "@/components/back-in-stock";
import StickyATC from "@/components/sticky-atc";

const RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]";

/**
 * Buy box: price, colour/size pickers with live stock, quantity stepper,
 * add-to-bag row, back-in-stock signup, and a live free-shipping meter.
 */
export default function VariantPicker({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string>(product.colors[0]?.name ?? "");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const variantsForColor = useMemo(
    () => product.variants.filter((v) => v.color === color),
    [product, color],
  );
  const selected = variantsForColor.find((v) => v.size === size) ?? null;
  const stock = selected?.stock ?? 0;
  const soldOut = !!selected && stock === 0;
  const unitPrice = selected?.priceOverridePaisa ?? product.pricePaisa;
  const maxQty = Math.max(1, Math.min(stock, 10));

  const shipValue = unitPrice * qty;
  const shipPct = Math.min(100, Math.round((shipValue / FREE_SHIP_THRESHOLD_PAISA) * 100));
  const shipDone = shipValue >= FREE_SHIP_THRESHOLD_PAISA;

  function pickSize(s: string) {
    setSize(s);
    setQty(1);
  }

  function handleAdd() {
    if (!selected || stock === 0) return;
    add({
      sku: selected.sku,
      slug: product.slug,
      name: product.name,
      image: product.images[0]?.src ?? "/hero/men.jpg",
      size: selected.size,
      color: selected.color,
      pricePaisa: unitPrice,
      qty: Math.min(qty, maxQty),
      stock: selected.stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p
          className="price text-[34px] leading-none font-medium tracking-tight text-gold"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          {formatBDT(unitPrice)}
        </p>
        {product.compareAtPaisa && product.compareAtPaisa > product.pricePaisa && (
          <p className="text-[15px] text-ash line-through">
            {formatBDT(product.compareAtPaisa)}
          </p>
        )}
        {product.isSale && (
          <span className="bg-gold px-2 py-0.5 text-[11px] font-semibold tracking-[0.14em] text-black uppercase">
            Sale
          </span>
        )}
      </div>

      {/* Colour */}
      <div className="mt-5">
        <p className="text-[13px] font-semibold tracking-[0.08em] uppercase">
          Colour <span className="ml-1 font-normal text-ash normal-case">— {color}</span>
        </p>
        <div className="mt-2 flex gap-2.5">
          {product.colors.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => {
                setColor(c.name);
                setSize(null);
                setQty(1);
              }}
              aria-pressed={color === c.name}
              title={c.name}
              style={{ backgroundColor: c.hex }}
              className={cn(
                "h-9 w-9 rounded-full border border-white/15 transition-transform duration-200 hover:scale-110",
                RING,
                color === c.name && "ring-2 ring-gold ring-offset-2 ring-offset-black",
              )}
            >
              <span className="sr-only">{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Size */}
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[13px] font-semibold tracking-[0.08em] uppercase">
            Size {size ? <span className="ml-1 font-normal normal-case">— {size}</span> : ""}
          </p>
          <SizeGuide section={product.section} />
        </div>
        <div className="flex flex-wrap gap-2">
          {product.sizes.map((s) => {
            const v = variantsForColor.find((x) => x.size === s);
            const out = !v || v.stock === 0;
            return (
              <button
                key={s}
                type="button"
                data-testid="pdp-size"
                disabled={!v || out}
                onClick={() => pickSize(s)}
                aria-pressed={size === s}
                className={cn(
                  "min-w-12 border px-4 py-2.5 text-[14px] font-medium transition-all duration-200",
                  RING,
                  size === s
                    ? "border-gold bg-gold text-black"
                    : "border-white/15 bg-transparent hover:border-white/40",
                  out && "opacity-35 line-through",
                )}
              >
                {s}
              </button>
            );
          })}
        </div>
        {!size && <p className="mt-1.5 text-[13px] text-ash">Select a size to see stock.</p>}
        {selected && stock > 0 && stock <= 3 && (
          <p className="mt-1.5 text-[14px] font-semibold text-red-700" role="status">
            Only {stock} left in {selected.size} / {selected.color}
          </p>
        )}
        {selected && stock > 3 && (
          <p className="mt-1.5 text-[14px] font-medium text-green-700" role="status">
            In stock — ready to ship.
          </p>
        )}
      </div>

      {/* Qty + ATC row */}
      <div className="mt-6 flex gap-3">
        <div
          className="flex items-center border border-white/15"
          role="group"
          aria-label="Quantity"
        >
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
            aria-label="Decrease quantity"
            className={cn("px-3.5 py-3 text-[16px] transition-colors hover:text-gold disabled:opacity-30", RING)}
          >
            −
          </button>
          <span aria-live="polite" aria-label={`Quantity ${qty}`} className="min-w-8 text-center text-[15px] font-semibold">
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
            disabled={qty >= maxQty}
            aria-label="Increase quantity"
            className={cn("px-3.5 py-3 text-[16px] transition-colors hover:text-gold disabled:opacity-30", RING)}
          >
            +
          </button>
        </div>
        <button
          type="button"
          data-testid="pdp-add"
          onClick={handleAdd}
          disabled={!selected || stock === 0}
          className={cn(
            "flex-1 py-3.5 text-[13px] font-semibold tracking-[0.16em] uppercase transition-all duration-300",
            RING,
            !selected || stock === 0
              ? "cursor-not-allowed bg-gold/25 text-black/60"
              : added
                ? "bg-[#7E9181] text-white"
                : "bg-gold text-black hover:bg-gold-dark",
          )}
        >
          {!selected ? "Select a size" : stock === 0 ? "Sold out" : added ? "✓ Added to bag" : "Add to bag"}
        </button>
      </div>

      {/* Notify-me when the selected variant is gone */}
      {soldOut && (
        <div className="mt-3">
          <BackInStock sku={selected.sku} />
        </div>
      )}
      {!selected && (
        <div className="mt-3">
          <BackInStock sku={null} />
        </div>
      )}

      {/* Free-shipping meter (live with qty) */}
      <div className="mt-5 border border-white/15 bg-[var(--color-dark-iron)]/50 px-4 py-3.5">
        <p className="text-[13.5px] font-medium">
          {shipDone ? (
            <>You unlocked <span className="font-semibold text-gold">FREE delivery</span> 🎉</>
          ) : (
            <>{formatBDT(FREE_SHIP_THRESHOLD_PAISA - shipValue)} away from <span className="font-semibold">free delivery</span></>
          )}
        </p>
        <div
          className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10"
          role="progressbar"
          aria-valuenow={shipPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progress to free delivery"
        >
          <div
            className="h-full rounded-full bg-gold transition-[width] duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]"
            style={{ width: `${shipPct}%` }}
          />
        </div>
      </div>

      <StickyATC
        name={product.name}
        pricePaisa={unitPrice}
        disabled={!selected || stock === 0}
        onAdd={handleAdd}
        label={!selected ? "Select a size" : stock === 0 ? "Out of stock" : "Add to bag"}
      />
    </div>
  );
}
