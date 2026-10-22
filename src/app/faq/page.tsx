import type { Metadata } from "next";
import { SITE } from "@/config/site";
import { page, rec, text, toArray } from "@/lib/content";

export const metadata: Metadata = {
  title: `FAQ | ${SITE.name}`,
  description: `Ordering, COD and online payments, delivery across Bangladesh, exchanges, and sizing — answers from ${SITE.name}.`,
};

export default function FaqPage() {
  const p = page("faq");
  const FAQS = toArray(rec(p.faq)).map((f) => ({ q: text(rec(f).q), a: text(rec(f).a) }));
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  return (
    <main className="bg-black text-[var(--color-smoke)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="mx-auto w-full max-w-3xl px-5 py-14 sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">{text(p.eyebrow)}</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">{text(p.title)}</h1>
        <p className="mt-4 leading-relaxed text-steel">
          {text(p.intro)}{" "}
          <a className="text-gold underline underline-offset-4" href={`mailto:${SITE.email}`}>{SITE.email}</a>
          {" "}· {SITE.phone}
        </p>
        <div aria-hidden="true" className="my-8 h-px w-full bg-white/10" />
        <div className="divide-y divide-white/10 border-y border-white/15">
          {FAQS.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="cursor-pointer list-none font-serif text-xl leading-snug marker:hidden [&::-webkit-details-marker]:hidden">
                <span className="mr-3 inline-block text-gold transition-transform group-open:rotate-45">+</span>
                {f.q}
              </summary>
              <p className="mt-3 pl-7 leading-relaxed text-steel">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
