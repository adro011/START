"use client";

import { useState } from "react";
import type { Section } from "@/lib/catalog";

const TABLES: Record<Section, { size: string; chest: string; length: string }[]> = {
  men: [
    { size: "S", chest: '38"', length: '42"' },
    { size: "M", chest: '40"', length: '43"' },
    { size: "L", chest: '42"', length: '44"' },
    { size: "XL", chest: '44"', length: '45"' },
  ],
  women: [
    { size: "S", chest: '36"', length: '42"' },
    { size: "M", chest: '38"', length: '43"' },
    { size: "L", chest: '40"', length: '44"' },
    { size: "XL", chest: '42"', length: '45"' },
  ],
  kids: [
    { size: "S (4–6y)", chest: '26"', length: '28"' },
    { size: "M (7–9y)", chest: '28"', length: '32"' },
    { size: "L (10–12y)", chest: '30"', length: '36"' },
    { size: "XL (13–14y)", chest: '32"', length: '38"' },
  ],
};

export default function SizeGuide({ section }: { section: Section }) {
  const [open, setOpen] = useState(false);
  const rows = TABLES[section];

  return (
    <>
      <button onClick={() => setOpen(true)} className="text-sm underline underline-offset-2">
        Size guide
      </button>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Size guide"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOpen(false)}
        >
          <div className="w-full max-w-md rounded-xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold capitalize">Size guide · {section}</h2>
              <button onClick={() => setOpen(false)} aria-label="Close size guide" className="rounded-full border px-2.5 py-1 text-sm">
                ✕
              </button>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-neutral-500">
                  <th className="py-2">Size</th>
                  <th>Chest</th>
                  <th>Length</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.size} className="border-b last:border-0">
                    <td className="py-2 font-medium">{r.size}</td>
                    <td>{r.chest}</td>
                    <td>{r.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-xs text-neutral-500">
              Between sizes? Take the larger for panjabi/sharee drape, smaller for fitted tops.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
