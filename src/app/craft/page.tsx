import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  title: `Our Craft | ${SITE.name}`,
  description: `How ${SITE.name} sources cloth, cuts and finishes garments in Bangladesh — cotton, silk, muslin and jamdani.`,
};

const STEPS = [
  { n: "01", title: "Cloth first", body: "We buy cotton, addi, endi, silk and muslin-jamdani from trusted Bangladeshi mills and weaving clusters. Every roll is checked for weave, dye fastness and shrinkage before cutting." },
  { n: "02", title: "Cut with ease", body: "Relaxed shoulders, real pockets, linings where it matters. Panjabis and kurtas are graded from our Dhaka fit blocks — see Size Guides before you order." },
  { n: "03", title: "Finished by hand", body: "Buttons, hems and embroidery are finished and pressed by hand. Each piece is checked twice, then packed in plastic-free packaging." },
];

export default function CraftPage() {
  return (
    <main className="bg-black text-[#F5F5F5]">
      <section className="mx-auto w-full max-w-5xl px-5 pb-4 pt-14 sm:pt-20">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">Our craft</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-6xl">
          Slow cloth, sharp cutting.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-steel">
          {SITE.name} works with weaving families and small factories across
          Bangladesh. We design for heat, humidity, rickshaw rides and wedding
          halls — breathable fabric, modest cuts, colours that survive the wash.
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
          {[
            ["Cotton & blends", "Pre-shrunk, bio-washed. Machine wash cold."],
            ["Silk & endi", "Dry clean or gentle hand wash. Cool iron inside-out."],
            ["Muslin & jamdani", "The heirloom shelf. Dry clean only, store rolled."],
          ].map(([t, b]) => (
            <div key={t} className="bg-[#F2CCC3]/50 p-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em]">{t}</h3>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-[#172121]/80">{b}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/size-guides" className="bg-gold px-6 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-black hover:bg-gold-dark">
            Find your size →
          </Link>
          <Link href="/shipping-returns" className="border border-white/15 px-6 py-3 text-sm font-semibold uppercase tracking-[0.14em] hover:border-gold hover:text-gold">
            Shipping & returns
          </Link>
        </div>
      </section>
    </main>
  );
}
