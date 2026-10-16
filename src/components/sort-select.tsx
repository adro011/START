"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const OPTIONS = [
  { value: "", label: "Sort: Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "rating", label: "Top rated" },
  { value: "popular", label: "Most reviewed" },
];

export default function SortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const sort = params.get("sort") ?? "";

  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <span className="sr-only">Sort products</span>
      <select
        value={sort}
        aria-label="Sort products"
        onChange={(e) => {
          const next = new URLSearchParams(params.toString());
          if (e.target.value) next.set("sort", e.target.value);
          else next.delete("sort");
          next.delete("page");
          router.replace(`${pathname}?${next.toString()}`, { scroll: false });
        }}
        className="rounded-lg border px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D5573B]"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
