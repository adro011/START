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
      <p className="text-sm text-neutral-600">
        Showing {shown} of {total}
      </p>
      <button
        onClick={() => router.replace(`${pathname}?${setParam(params, "page", String(page + 1))}`, { scroll: false })}
        className="mt-2 rounded-full border px-6 py-2 text-sm font-medium hover:bg-neutral-100"
      >
        Load more
      </button>
    </div>
  );
}

export default function Filters({
  categories,
  sizes,
}: {
  categories: { slug: string; name: string }[];
  sizes: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const bounds = priceBounds();

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
            onClick={() => update("category", null)}
            className={`rounded-full border px-3 py-1 text-xs ${activeCat === "" ? "bg-neutral-900 text-white" : "hover:bg-neutral-100"}`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.slug}
              onClick={() => update("category", activeCat === c.slug ? null : c.slug)}
              className={`rounded-full border px-3 py-1 text-xs ${activeCat === c.slug ? "bg-neutral-900 text-white" : "hover:bg-neutral-100"}`}
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
          min={bounds.min}
          max={bounds.max}
          step={10000}
          value={maxPrice ? Number(maxPrice) : bounds.max}
          onChange={(e) => update("maxPrice", e.target.value)}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-neutral-600">
          <span>{formatBDT(bounds.min)}</span>
          <span>{formatBDT(bounds.max)}</span>
        </div>
      </div>

      <div>
        <p className="mb-2 font-semibold">Size</p>
        <div className="flex flex-wrap gap-1.5">
          {sizes.map((s) => (
            <button
              key={s}
              onClick={() => toggleSize(s)}
              aria-pressed={activeSizes.includes(s)}
              className={`rounded border px-3 py-1 text-xs ${activeSizes.includes(s) ? "bg-neutral-900 text-white" : "hover:bg-neutral-100"}`}
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
        />
        In stock only
      </label>

      {(activeCat || maxPrice || activeSizes.length > 0 || inStock) && (
        <button
          onClick={() => router.replace(pathname, { scroll: false })}
          className="text-xs underline"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
