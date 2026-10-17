import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  title: `Size Guides | ${SITE.name}`,
  description: `Men, Women and Kids size charts at ${SITE.name} — chest, length and fit notes in inches. When in doubt, size up for festive wear.`,
};

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto border border-white/15">
      <table>
        <thead>
          <tr>{head.map((h) => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.join("-")}>{r.map((c, i) => <td key={i}>{c}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function SizeGuidesPage() {
  return (
    <main className="bg-black text-[#F5F5F5]">
      <article className="mx-auto w-full max-w-4xl px-5 py-14 sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">Help · Size guides</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">Measure once, wear for years.</h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-steel">
          All measurements in <strong>inches</strong>. Measure over light clothing and compare
          with your best-fitting garment. Between sizes? Size up for panjabis and festive
          wear, down for fitted shirts and tops. Questions? Write to{" "}
          <a className="text-gold underline underline-offset-4" href={`mailto:${SITE.email}`}>{SITE.email}</a>.
        </p>
        <div aria-hidden="true" className="my-8 h-px w-full bg-white/10" />

        <h2 className="font-serif text-3xl">Men — Panjabi / Kurta / Shirts</h2>
        <p className="mt-2 text-sm text-steel">Size = chest. Length measured shoulder to hem.</p>
        <div className="mt-4">
          <Table head={["Size", "Chest", "Length", "Sleeve", "Shoulder"]}
            rows={[["38 (M)", "38", "42", "24", "17.5"], ["40 (L)", "40", "43", "24.5", "18"], ["42 (XL)", "42", "44", "25", "18.5"], ["44 (XXL)", "44", "45", "25.5", "19"]]} />
        </div>

        <h2 className="mt-12 font-serif text-3xl">Women — Tunic / 3-Pcs / Tops</h2>
        <p className="mt-2 text-sm text-steel">Tops run relaxed; sharees are one-size with fall/pico done.</p>
        <div className="mt-4">
          <Table head={["Size", "Bust", "Waist", "Hip", "Length"]}
            rows={[["S (36)", "36", "30", "38", "42"], ["M (38)", "38", "32", "40", "43"], ["L (40)", "40", "34", "42", "44"], ["XL (42)", "42", "36", "44", "44"]]} />
        </div>

        <h2 className="mt-12 font-serif text-3xl">Kids (by age)</h2>
        <p className="mt-2 text-sm text-steel">Kids grow fast — when in doubt, take the bigger size.</p>
        <div className="mt-4">
          <Table head={["Age", "Chest", "Length", "Waist (bottoms)"]}
            rows={[["4–5 yrs", "26", "26", "22"], ["6–7 yrs", "28", "28", "23"], ["8–9 yrs", "30", "31", "24"], ["10–11 yrs", "32", "34", "25"]]} />
        </div>

        <div className="mt-10 rounded-none border border-white/15 bg-[#181818] px-5 py-4 text-sm leading-relaxed text-steel">
          <p><strong>Still unsure?</strong> Send your chest/length + the product name to {SITE.phone} (WhatsApp) and we&apos;ll confirm your size before you order. Exchanges are free within 7 days — see <Link href="/shipping-returns" className="text-gold underline underline-offset-4">Shipping &amp; Returns</Link>.</p>
        </div>
      </article>
    </main>
  );
}
