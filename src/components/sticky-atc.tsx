"use client";

import { formatBDT } from "@/lib/format";

export default function StickyATC({
  name,
  pricePaisa,
  disabled,
  onAdd,
}: {
  name: string;
  pricePaisa: number;
  disabled?: boolean;
  onAdd: () => void;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-white/95 p-3 backdrop-blur md:hidden">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-neutral-500">{name}</p>
          <p className="text-base font-semibold">{formatBDT(pricePaisa)}</p>
        </div>
        <button
          onClick={onAdd}
          disabled={disabled}
          className="flex-1 rounded-full bg-neutral-900 py-3 text-sm font-semibold text-white disabled:opacity-40"
        >
          {disabled ? "Out of stock" : "Add to bag"}
        </button>
      </div>
    </div>
  );
}
