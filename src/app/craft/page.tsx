import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/config/site";
import { toArray, page, rec, text } from "@/lib/content";

export const metadata: Metadata = {
  title: `Our Craft | ${SITE.name}`,
  description: `How ${SITE.name} sources cloth, cuts and finishes garments in Bangladesh — cotton, silk, muslin and jamdani.`,
};

export default function CraftPage() {
  const p = page("craft");
  const STEPS = toArray(rec(p.step)).map((s) => ({ n: text(rec(s).n), title: text(rec(s).title), body: text(rec(s).body) }));
  const CARE = toArray(rec(p.care)).map((c) => ({ title: text(rec(c).title), body: text(rec(c).body) }));

  return (
    <main className="bg-black text-[var(--color-smoke)]">
      <section className="mx-auto w-full max-w-5xl px-5 pb-4 pt-14 sm:pt-20">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">{text(p.eyebrow)}</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-6xl">
          {text(p.title)}
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-steel">
          {text(p.intro)}
        </p>
      </section>
      <section className="mx-auto w-full max-w-5xl px-5 py-10">
        <ol className="divide-y divide-white/10 border-y border-white/15">
          {STEPS.map((s) => (
            <li key={s.n} className="grid gap-2 py-8 sm:grid-cols-[80px_220px_1fr] sm:gap-6">
              <span className="font-serif text-4xl text-gold">{s.n}</span>
              <h2 className="font-serif text-2xl">{s.title}</h2>
              <p className="leading-relaxed text-steel">{s.body}</p>
            </li>
          ))}
        </ol>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {CARE.map((c) => (
            <div key={c.title} className="bg-[var(--color-blush)]/50 p-6 text-[var(--abrar-ink)]">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em]">{c.title}</h3>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-[var(--abrar-ink)]/80">{c.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/size-guides" className="bg-gold px-6 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-black hover:bg-gold-dark">
            {text(rec(p.cta).size)} →
          </Link>
          <Link href="/shipping-returns" className="border border-white/15 px-6 py-3 text-sm font-semibold uppercase tracking-[0.14em] hover:border-gold hover:text-gold">
            {text(rec(p.cta).shipping)}
          </Link>
        </div>
      </section>
    </main>
  );
}
