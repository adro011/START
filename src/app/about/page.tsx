import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/config/site";
import { toArray, page, rec, text } from "@/lib/content";

export const metadata: Metadata = {
  title: `About | ${SITE.name}`,
  description: `${SITE.name} — ${SITE.tagline}. A modern Bangladeshi heritage label for Men, Women and Kids.`,
};

export default function AboutPage() {
  const p = page("about");
  const VALUES = toArray(rec(p.value)).map((v) => ({ title: text(rec(v).title), body: text(rec(v).body) }));
  const STATS = toArray(rec(p.stat)).map((s) => ({ value: text(rec(s).value), label: text(rec(s).label) }));

  return (
    <main className="bg-black text-[var(--color-smoke)]">
      <section className="mx-auto w-full max-w-5xl px-5 pb-6 pt-14 sm:pt-20">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">
          {text(p.eyebrow)}
        </p>
        <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-6xl">
          {text(p.title)}
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-steel">
          {text(p.intro)}
        </p>
      </section>
      <section className="mx-auto grid w-full max-w-5xl gap-4 px-5 py-8 sm:grid-cols-3">
        {VALUES.map((v) => (
          <div key={v.title} className="border border-white/15 bg-[var(--color-dark-iron)] p-6">
            <div aria-hidden="true" className="h-0.5 w-10 bg-gold" />
            <h2 className="mt-4 font-serif text-2xl">{v.title}</h2>
            <p className="mt-2 text-[0.98rem] leading-relaxed text-steel">{v.body}</p>
          </div>
        ))}
      </section>
      <section className="bg-[var(--color-dark-iron)] text-[var(--color-smoke)]">
        <div className="mx-auto grid w-full max-w-5xl gap-8 px-5 py-14 sm:grid-cols-3">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="font-serif text-5xl text-gold">{s.value}</p>
              <p className="mt-2 text-sm uppercase tracking-[0.18em] text-steel">{s.label}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="mx-auto w-full max-w-5xl px-5 py-14">
        <h2 className="font-serif text-3xl">{text(rec(p.hello).title)}</h2>
        <p className="mt-3 max-w-2xl leading-relaxed text-steel">
          {text(rec(p.hello).body)}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/craft" className="bg-gold px-6 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-black hover:bg-gold-dark">
            {text(rec(p.cta).craft)} →
          </Link>
          <Link href="/stories" className="border border-white/15 px-6 py-3 text-sm font-semibold uppercase tracking-[0.14em] hover:border-gold hover:text-gold">
            {text(rec(p.cta).journal)}
          </Link>
          <Link href="/contact" className="border border-white/15 px-6 py-3 text-sm font-semibold uppercase tracking-[0.14em] hover:border-gold hover:text-gold">
            {text(rec(p.cta).contact)}
          </Link>
        </div>
      </section>
    </main>
  );
}
