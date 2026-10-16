import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  title: `About | ${SITE.name}`,
  description: `${SITE.name} — ${SITE.tagline}. A modern Bangladeshi heritage label for Men, Women and Kids.`,
};

const VALUES = [
  { title: "Honest cloth", body: "Cotton, silk, muslin and jamdani from mills and weavers we know by name. Fabric, fit and care notes on every product." },
  { title: "Fair prices in BDT", body: "Clear ৳ pricing, no inflated discounts. COD across Bangladesh and bKash/Nagad/cards via SSLCommerz." },
  { title: "Easy exchange", body: "Wrong size? Exchange within 7 days — no interrogation. Details on our Shipping & Returns page." },
];

export default function AboutPage() {
  return (
    <main className="bg-[#FBF6F3] text-[#172121]">
      <section className="mx-auto w-full max-w-5xl px-5 pb-6 pt-14 sm:pt-20">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7D451B]">
          Our story
        </p>
        <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-6xl">
          A heritage label, made for everyday Bangladesh.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[#172121]/80">
          {SITE.name} started with a simple frustration: festive wear that
          only comes out twice a year. So we cut panjabis, sharees, tunics
          and kids&apos; sets you can wear to Eid, weddings — and ordinary
          Tuesdays. {SITE.tagline}
        </p>
      </section>
      <section className="mx-auto grid w-full max-w-5xl gap-4 px-5 py-8 sm:grid-cols-3">
        {VALUES.map((v) => (
          <div key={v.title} className="border border-[#172121]/10 bg-white/60 p-6">
            <div aria-hidden="true" className="h-0.5 w-10 bg-[#D5573B]" />
            <h2 className="mt-4 font-serif text-2xl">{v.title}</h2>
            <p className="mt-2 text-[0.98rem] leading-relaxed text-[#172121]/80">{v.body}</p>
          </div>
        ))}
      </section>
      <section className="bg-[#172121] text-[#FBF6F3]">
        <div className="mx-auto grid w-full max-w-5xl gap-8 px-5 py-14 sm:grid-cols-3">
          {[
            ["3", "sections — Men, Women, Kids"],
            ["64", "districts served with COD"],
            ["7 days", "easy size exchange"],
          ].map(([n, label]) => (
            <div key={label}>
              <p className="font-serif text-5xl text-[#F2CCC3]">{n}</p>
              <p className="mt-2 text-sm uppercase tracking-[0.18em] text-[#FBF6F3]/70">{label}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="mx-auto w-full max-w-5xl px-5 py-14">
        <h2 className="font-serif text-3xl">Come say hello</h2>
        <p className="mt-3 max-w-2xl leading-relaxed text-[#172121]/80">
          Questions about fit, fabric or delivery to your district? Write to{" "}
          <a className="text-clay underline underline-offset-4" href={`mailto:${SITE.email}`}>{SITE.email}</a>{" "}
          or call <a className="text-clay underline underline-offset-4" href={`tel:${SITE.phone}`}>{SITE.phone}</a>.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/craft" className="bg-clay px-6 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-white hover:bg-[#172121]">
            Our craft →
          </Link>
          <Link href="/stories" className="border border-[#172121]/25 px-6 py-3 text-sm font-semibold uppercase tracking-[0.14em] hover:border-[#D5573B] hover:text-clay">
            Journal
          </Link>
          <Link href="/contact" className="border border-[#172121]/25 px-6 py-3 text-sm font-semibold uppercase tracking-[0.14em] hover:border-[#D5573B] hover:text-clay">
            Contact
          </Link>
        </div>
      </section>
    </main>
  );
}
