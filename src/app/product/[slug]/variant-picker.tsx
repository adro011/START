"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/catalog";
import { formatBDT, cn } from "@/lib/format";
import { useCart } from "@/store/cart";
import SizeGuide from "@/components/size-guide";
import BackInStock from "@/components/back-in-stock";
import StickyATC from "@/components/sticky-atc";

export default function VariantPicker({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string>(product.colors[0]?.name ?? "");
  const [added, setAdded] = useState(false);

  const variantsForColor = useMemo(
    () => product.variants.filter((v) => v.color === color),
    [product, color],
  );
  const selected = variantsForColor.find((v) => v.size === size) ?? null;
  const stock = selected?.stock ?? 0;
  const unitPrice =
    selected?.priceOverridePaisa ?? product.pricePaisa;

  function handleAdd() {
    if (!selected) return;
    add({
      sku: selected.sku,
      slug: product.slug,
      name: product.name,
      image: product.images[0]?.src ?? "/hero/men.svg",
      size: selected.size,
      color: selected.color,
      pricePaisa: unitPrice,
      qty: 1,
      stock: selected.stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  return (
    <div>
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-semibold">{formatBDT(unitPrice)}</p>
        {product.compareAtPaisa && product.compareAtPaisa > product.pricePaisa && (
          <p className="text-sm text-neutral-600 line-through">{formatBDT(product.compareAtPaisa)}</p>
        )}
      </div>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between">
          <p className="text-sm font-medium">Colour: {color}</p>
        </div>
        <div className="flex gap-2">
          {product.colors.map((c) => (
            <button
              key={c.name}
              onClick={() => {
                setColor(c.name);
                setSize(null);
              }}
              aria-pressed={color === c.name}
              title={c.name}
              className={cn(
                "h-8 w-8 rounded-full border",
                color === c.name && "ring-2 ring-neutral-900 ring-offset-2",
              )}
              style={{ backgroundColor: c.hex }}
            >
              <span className="sr-only">{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between">
          <p className="text-sm font-medium">Size {size ? `· ${size}` : ""}</p>
          <SizeGuide section={product.section} />
        </div>
        <div className="flex flex-wrap gap-2">
          {product.sizes.map((s) => {
            const v = variantsForColor.find((x) => x.size === s);
            const out = !v || v.stock === 0;
            return (
              <button
                key={s}
                disabled={!v || out}
                onClick={() => setSize(s)}
                aria-pressed={size === s}
                className={cn(
                  "min-w-11 rounded-lg border px-3 py-2 text-sm font-medium",
                  size === s ? "bg-neutral-900 text-white" : "hover:bg-neutral-100",
                  out && "opacity-35 line-through",
                )}
              >
                {s}
              </button>
            );
          })}
        </div>
        {!size && <p className="mt-1 text-xs text-neutral-600">Select a size to see stock.</p>}
        {selected && stock > 0 && stock <= 3 && (
          <p className="mt-1 text-sm font-medium text-red-700">Only {stock} left in {selected.size} / {selected.color}</p>
        )}
        {selected && stock > 3 && (
          <p className="mt-1 text-sm text-green-700">In stock — ready to ship.</p>
        )}
      </div>

      <button
        onClick={handleAdd}
        disabled={!selected || stock === 0}
        className="mt-4 w-full rounded-full bg-neutral-900 py-3 text-sm font-semibold text-white disabled:opacity-40"
      >
        {!selected ? "Select a size" : stock === 0 ? "Out of stock" : added ? "✓ Added to bag" : `Add to bag · ${formatBDT(unitPrice)}`}
      </button>

      {selected && stock === 0 && <BackInStock sku={selected.sku} />}
      {!selected && <BackInStock sku={null} />}

      <StickyATC name={product.name} pricePaisa={unitPrice} disabled={!selected || stock === 0} onAdd={handleAdd} />
    </div>
  );
}
