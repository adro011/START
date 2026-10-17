"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { priceBounds } from "@/lib/catalog";
import { formatBDT } from "@/lib/format";

function setParam(
  params: { toString(): string },
  key: string,
  value: string | null,
): URLSearchParams {
  const next = new URLSearchParams(params.toString());
  if (value === null || value === "") next.delete(key);
  else next.set(key, value);
  next.delete("page");
  return next;
}

export function LoadMore({ total, pageSize = 12 }: { total: number; pageSize?: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const page = Math.max(1, Number(params.get("page") ?? 1));
  const shown = Math.min(page * pageSize, total);
  if (shown >= total) return null;
  return (
    <div className="mt-8 text-center">
      <p className="text-sm text-ash">
        Showing {shown} of {total}
      </p>
      <button
        type="button"
        onClick={() => router.replace(`${pathname}?${setParam(params, "page", String(page + 1))}`, { scroll: false })}
        className="mt-2 rounded-full border px-6 py-2 text-sm font-medium hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFC000]"
      >
        Load more
      </button>
    </div>
  );
}

export default function Filters({
  categories,
  sizes,
  bounds,
}: {
  categories: { slug: string; name: string }[];
  sizes: string[];
  /** Live price range; defaults to the local catalog bounds. */
  bounds?: { min: number; max: number };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const liveBounds = bounds ?? priceBounds();

  const update = useCallback(
    (key: string, value: string | null) => {
      router.replace(`${pathname}?${setParam(params, key, value)}`, { scroll: false });
    },
    [router, pathname, params],
  );

  const activeCat = params.get("category") ?? "";
  const activeSizes = (params.get("sizes") ?? "").split(",").filter(Boolean);
  const maxPrice = params.get("maxPrice");
  const inStock = params.get("inStock") === "1";

  function toggleSize(s: string) {
    const next = activeSizes.includes(s)
      ? activeSizes.filter((x) => x !== s)
      : [...activeSizes, s];
    update("sizes", next.length ? next.join(",") : null);
  }

  return (
    <div className="space-y-5 rounded-xl border p-4 text-sm lg:sticky lg:top-20">
      <div>
        <p className="mb-2 font-semibold">Category</p>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => update("category", null)}
            aria-pressed={activeCat === ""}
            className={`rounded-full border px-3 py-1 text-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFC000] ${activeCat === "" ? "bg-gold text-black" : "hover:bg-white/10"}`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => update("category", activeCat === c.slug ? null : c.slug)}
              aria-pressed={activeCat === c.slug}
              className={`rounded-full border px-3 py-1 text-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFC000] ${activeCat === c.slug ? "bg-gold text-black" : "hover:bg-white/10"}`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="maxprice" className="mb-1 block font-semibold">
          Max price {maxPrice ? `· ${formatBDT(Number(maxPrice))}` : ""}
        </label>
        <input
          id="maxprice"
          type="range"
          min={liveBounds.min}
          max={liveBounds.max}
          step={10000}
          value={maxPrice ? Number(maxPrice) : liveBounds.max}
          onChange={(e) => update("maxPrice", e.target.value)}
          className="w-full accent-[#FFC000] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFC000]"
        />
        <div className="flex justify-between text-xs text-ash">
          <span>{formatBDT(liveBounds.min)}</span>
          <span>{formatBDT(liveBounds.max)}</span>
        </div>
      </div>

      <div>
        <p className="mb-2 font-semibold">Size</p>
        <div className="flex flex-wrap gap-1.5">
          {sizes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggleSize(s)}
              aria-pressed={activeSizes.includes(s)}
              className={`rounded border px-3 py-1 text-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFC000] ${activeSizes.includes(s) ? "bg-gold text-black" : "hover:bg-white/10"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={inStock}
          onChange={(e) => update("inStock", e.target.checked ? "1" : null)}
          className="accent-[#FFC000] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFC000]"
        />
        In stock only
      </label>

      {(activeCat || maxPrice || activeSizes.length > 0 || inStock) && (
        <button
          type="button"
          onClick={() => router.replace(pathname, { scroll: false })}
          className="text-xs underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFC000]"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
