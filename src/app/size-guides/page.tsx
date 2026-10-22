import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/config/site";
import { page, rec, text, toArray } from "@/lib/content";

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
  const p = page("size-guides");
  const table = (name: string) => ({
    head: toArray(rec(rec(p[name]).head)).map((h) => text(h)),
    rows: toArray(rec(rec(p[name]).row)).map((r) => toArray(rec(r)).map((c) => text(c))),
  });
  const MEN = table("men");
  const WOMEN = table("women");
  const KIDS = table("kids");

  return (
    <main className="bg-black text-[var(--color-smoke)]">
      <article className="mx-auto w-full max-w-4xl px-5 py-14 sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">{text(p.eyebrow)}</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">{text(p.title)}</h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-steel">{text(p.intro)}</p>
        <div aria-hidden="true" className="my-8 h-px w-full bg-white/10" />

        <h2 className="font-serif text-3xl">{text(rec(p.men).title)}</h2>
        <p className="mt-2 text-sm text-steel">{text(rec(p.men).note)}</p>
        <div className="mt-4">
          <Table head={MEN.head} rows={MEN.rows} />
        </div>

        <h2 className="mt-12 font-serif text-3xl">{text(rec(p.women).title)}</h2>
        <p className="mt-2 text-sm text-steel">{text(rec(p.women).note)}</p>
        <div className="mt-4">
          <Table head={WOMEN.head} rows={WOMEN.rows} />
        </div>

        <h2 className="mt-12 font-serif text-3xl">{text(rec(p.kids).title)}</h2>
        <p className="mt-2 text-sm text-steel">{text(rec(p.kids).note)}</p>
        <div className="mt-4">
          <Table head={KIDS.head} rows={KIDS.rows} />
        </div>

        <div className="mt-10 rounded-none border border-white/15 bg-[var(--color-dark-iron)] px-5 py-4 text-sm leading-relaxed text-steel">
          <p><strong>{text(rec(p.help).title)}</strong> {text(rec(p.help).body)} <Link href="/shipping-returns" className="text-gold underline underline-offset-4">Shipping &amp; Returns</Link>.</p>
        </div>
      </article>
    </main>
  );
}
