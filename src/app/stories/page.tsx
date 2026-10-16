import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  title: `Stories | ${SITE.name}`,
  description: `Notes from ${SITE.name} — fabric, fit and festive dressing across Bangladesh.`,
};

const STORIES = [
  {
    slug: "eid-edit",
    eyebrow: "Festive · Eid",
    title: "The Eid edit: five outfits, zero stress",
    excerpt: "Breathable panjabis, one heirloom jamdani sharee, and kids' sets that survive salami chaos — our stylists' picks for the morning rush.",
    img: "/hero/men.svg",
    alt: "Eid festive menswear editorial",
  },
  {
    slug: "jamdani-notes",
    eyebrow: "Fabric · Jamdani",
    title: "How to spot — and keep — good jamdani",
    excerpt: "Count the motifs, feel the hand, store it rolled. A weaver and our cutter explain what makes muslin-jamdani worth handing down.",
    img: "/hero/women.svg",
    alt: "Jamdani weave editorial",
  },
  {
    slug: "kids-that-last",
    eyebrow: "Kids · Fit",
    title: "Kids grow. Their clothes should keep up",
    excerpt: "Room-to-grow hems, soft waistbands and reinforced knees: how we cut boys' and girls' sets for a full year of wear.",
    img: "/hero/kids.svg",
    alt: "Kids festive wear editorial",
  },
];

export default function StoriesPage() {
  return (
    <main className="bg-[#FBF6F3] text-[#172121]">
      <section className="mx-auto w-full max-w-6xl px-5 py-14 sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7D451B]">Journal · Stories</p>
        <h1 className="mt-3 max-w-2xl font-serif text-4xl leading-tight sm:text-6xl">
          Notes on cloth, fit & festive days.
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-[#172121]/80">
          Short reads from our Dhaka studio — fabric guides, fit tips and
          behind-the-seams peeks. New stories every month.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {STORIES.map((s) => (
            <article key={s.slug} className="group border border-[#172121]/10 bg-white/60">
              <div className="relative aspect-[16/10] overflow-hidden bg-[#172121]">
                <Image src={s.img} alt={s.alt} fill sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
              </div>
              <div className="p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">{s.eyebrow}</p>
                <h2 className="mt-2 font-serif text-2xl leading-snug">{s.title}</h2>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-[#172121]/75">{s.excerpt}</p>
                <span className="mt-4 inline-block text-sm font-semibold uppercase tracking-[0.14em] underline underline-offset-4 group-hover:text-clay">
                  Read story →
                </span>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap items-center gap-3 border-t border-[#172121]/10 pt-8">
          <p className="text-sm text-[#172121]/70">Like this? Get one thoughtful email a month — no spam.</p>
          <Link href="/#newsletter" className="bg-[#172121] px-6 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-[#FBF6F3] hover:bg-clay">
            Join the letter
          </Link>
          <Link href="/about" className="px-2 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-clay underline underline-offset-4">
            About {SITE.name}
          </Link>
        </div>
      </section>
    </main>
  );
}
