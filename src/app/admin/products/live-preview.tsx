"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/format";
import { formatBDT } from "@/lib/format";
import ZoomImage from "@/components/zoom-image";

interface PreviewColor {
  name: string;
  hex: string;
}

interface LivePreviewProps {
  name: string;
  categoryName: string;
  section: string;
  description: string;
  pricePaisa: number;
  compareAtPaisa?: number | null;
  isNew: boolean;
  isSale: boolean;
  colors: PreviewColor[];
  sizes: string[];
  /** key `${size}__${color}` → stock. */
  stock: Record<string, number>;
  /** key `${size}__${color}` → optional override price (paisa). */
  prices?: Record<string, number>;
  images: { url: string; alt: string }[];
}

/**
 * Safe live preview of the public Product Details page, driven entirely by
 * unsaved form state. It reuses the same visual language as the storefront
 * (gold price, colour swatches, size buttons, zoom image) but never touches
 * the cart, inventory or real orders — the "Add to bag" control is inert.
 */
export default function LivePreview(props: LivePreviewProps) {
  const { name, categoryName, description, pricePaisa, compareAtPaisa, isNew, isSale, colors, sizes, stock, prices, images } = props;
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [color, setColor] = useState(colors[0]?.name ?? "");
  const [size, setSize] = useState<string | null>(null);

  const selStock = size ? stock[`${size}__${color}`] ?? 0 : 0;
  const override = size ? prices?.[`${size}__${color}`] : undefined;
  const unit = override ?? pricePaisa;
  const image = images[0]?.url;

  const shownSizes = useMemo(() => {
    if (color) return sizes.filter((s) => (stock[`${s}__${color}`] ?? 0) >= 0);
    return sizes;
  }, [sizes, stock, color]);

  const discounted =
    isSale || (compareAtPaisa != null && compareAtPaisa > pricePaisa);

  return (
    <div className="rounded-lg border border-white/15 bg-[var(--color-dark-iron)] p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ash">Live preview</p>
        <div className="flex gap-1 rounded border border-white/15 p-0.5" role="group" aria-label="Preview device">
          {(["desktop", "mobile"] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDevice(d)}
              aria-pressed={device === d}
              className={cn(
                "rounded px-3 py-1 text-xs font-medium capitalize",
                device === d ? "bg-gold text-black" : "text-steel hover:text-[var(--color-smoke)]",
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className={cn("gap-6", device === "desktop" ? "grid grid-cols-2" : "grid grid-cols-1")}>
        {/* Image */}
        <div className="aspect-[3/4] w-full overflow-hidden border border-white/10 bg-[var(--color-charcoal)]">
          {image ? (
            <ZoomImage src={image} alt={name || "Product preview"} sizes="(max-width:768px) 100vw, 40vw" viewer={false} />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-ash">No image</div>
          )}
        </div>

        {/* Buy column */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {isNew && <span className="bg-[var(--abrar-ink)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-paper)]">New</span>}
            {isSale && <span className="bg-clay px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white">Sale</span>}
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ash">{categoryName || "Category"}</span>
          </div>

          <h3 className="mt-2 text-[clamp(1.3rem,2.4vw,1.7rem)] leading-tight font-medium text-[var(--color-smoke)]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {name || "Product name"}
          </h3>

          <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="text-[26px] leading-none font-medium text-gold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {formatBDT(unit)}
            </span>
            {discounted && compareAtPaisa != null && (
              <span className="text-[13px] text-ash line-through">{formatBDT(compareAtPaisa)}</span>
            )}
            {discounted && (
              <span className="bg-gold px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-black">Sale</span>
            )}
          </div>

          {description && <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-steel">{description}</p>}

          {/* Colours */}
          <div className="mt-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em]">Colour {color ? <span className="font-normal normal-case text-ash">— {color}</span> : null}</p>
            <div className="mt-1.5 flex gap-2">
              {colors.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => { setColor(c.name); setSize(null); }}
                  aria-pressed={color === c.name}
                  title={c.name}
                  style={{ backgroundColor: c.hex }}
                  className={cn("h-7 w-7 rounded-full border border-white/15", color === c.name && "ring-2 ring-gold ring-offset-1 ring-offset-black")}
                >
                  <span className="sr-only">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div className="mt-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em]">Size {size ? <span className="font-normal normal-case">— {size}</span> : ""}</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {shownSizes.map((s) => {
                const out = (stock[`${s}__${color}`] ?? 0) === 0;
                return (
                  <button
                    key={s}
                    type="button"
                    disabled={out}
                    onClick={() => setSize(s)}
                    aria-pressed={size === s}
                    className={cn(
                      "min-w-10 border px-3 py-2 text-[13px] font-medium",
                      size === s ? "border-gold bg-gold text-black" : "border-white/15 hover:border-white/40",
                      out && "opacity-35 line-through",
                    )}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            {size && selStock > 0 && selStock <= 3 && (
              <p className="mt-1.5 text-[12px] font-semibold text-red-700">Only {selStock} left</p>
            )}
          </div>

          {/* Inert add-to-bag */}
          <button
            type="button"
            tabIndex={-1}
            aria-disabled="true"
            className="mt-4 w-full cursor-not-allowed bg-gold/25 py-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-black/60"
          >
            {size ? (selStock === 0 ? "Sold out" : "Add to bag (preview)") : "Select a size"}
          </button>
        </div>
      </div>
    </div>
  );
}
