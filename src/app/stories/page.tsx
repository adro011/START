import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SITE } from "@/config/site";
import { toArray, page, rec, text } from "@/lib/content";

export const metadata: Metadata = {
  title: `Stories | ${SITE.name}`,
  description: `Notes from ${SITE.name} — fabric, fit and festive dressing across Bangladesh.`,
};

export default function StoriesPage() {
  const p = page("stories");
  const STORIES = toArray(rec(p.story)).map((s) => ({
    slug: text(rec(s).slug),
    eyebrow: text(rec(s).eyebrow),
    title: text(rec(s).title),
    excerpt: text(rec(s).excerpt),
    img: text(rec(s).image),
    alt: text(rec(s).alt),
  }));

  return (
    <main className="bg-black text-[var(--color-smoke)]">
      <section className="mx-auto w-full max-w-6xl px-5 py-14 sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">{text(p.eyebrow)}</p>
        <h1 className="mt-3 max-w-2xl font-serif text-4xl leading-tight sm:text-6xl">
          {text(p.title)}
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-steel">
          {text(p.intro)}
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {STORIES.map((s) => (
            <article key={s.slug} className="group border border-white/15 bg-[var(--color-dark-iron)]">
              <div className="relative aspect-[16/10] overflow-hidden bg-[var(--color-dark-iron)]">
                <Image src={s.img} alt={s.alt} fill sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
              </div>
              <div className="p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">{s.eyebrow}</p>
                <h2 className="mt-2 font-serif text-2xl leading-snug">{s.title}</h2>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-steel">{s.excerpt}</p>
                <span className="mt-4 inline-block text-sm font-semibold uppercase tracking-[0.14em] underline underline-offset-4 group-hover:text-gold">
                  {text(p.readmore)} →
                </span>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap items-center gap-3 border-t border-white/15 pt-8">
          <p className="text-sm text-steel">{text(rec(p.footer).note)}</p>
          <Link href="/#newsletter" className="bg-gold px-6 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-black hover:bg-gold-dark">
            {text(rec(p.footer).cta)}
          </Link>
          <Link href="/about" className="px-2 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-gold underline underline-offset-4">
            {text(rec(p.footer).about)}
          </Link>
        </div>
      </section>
    </main>
  );
}
