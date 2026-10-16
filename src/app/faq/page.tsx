import type { Metadata } from "next";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  title: `FAQ | ${SITE.name}`,
  description: `Ordering, COD and online payments, delivery across Bangladesh, exchanges, and sizing — answers from ${SITE.name}.`,
};

const FAQS = [
  { q: "How do I place an order?", a: "Add your size to cart, check out as guest or with an account, enter your division → district → area and phone, then choose COD or online payment. You'll get an SMS confirmation with your order number (e.g. BR-100231)." },
  { q: "Do you offer Cash on Delivery?", a: "Yes — COD is our default across all 64 districts. High-value COD orders may need a quick phone/OTP confirmation before we dispatch, to protect you and our couriers." },
  { q: "Which online payments do you accept?", a: "bKash, Nagad and cards via SSLCommerz where enabled. Payments are verified with the gateway before dispatch; failed payments are automatically cancelled — you're never charged without confirmation." },
  { q: "How long does delivery take?", a: "Inside Dhaka: 2–3 working days. Outside Dhaka: 3–5 working days. Eid and wedding season can add 1–2 days — we'll SMS you if your parcel is delayed. Keep your +880 phone reachable." },
  { q: "What if the size doesn't fit?", a: "Exchange within 7 days for a different size — unworn, unwashed, tags on. Email us your order number and we'll arrange it. Sale items at 30%+ off are final sale unless faulty." },
  { q: "How do I find my size?", a: "Check our Size Guides (Men/Women/Kids, in inches) and compare with your best-fitting garment. Between sizes? Size up for panjabis and festive wear. Still unsure — WhatsApp us your measurements before ordering." },
  { q: "Can I order via WhatsApp?", a: `Yes. Send the product link + size + district to ${SITE.phone} and we'll place the order for you — same prices, same exchange policy.` },
  { q: "How do I track my order?", a: "Use your order number + phone on our tracking page. You'll also get courier SMS updates once the parcel is dispatched." },
];

export default function FaqPage() {
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
    <main className="bg-[#FBF6F3] text-[#172121]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="mx-auto w-full max-w-3xl px-5 py-14 sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7D451B]">Help · FAQ</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">Good questions.</h1>
        <p className="mt-4 leading-relaxed text-[#172121]/80">
          Ordering, payments, delivery and exchanges — answered plainly. Still stuck?{" "}
          <a className="text-[#D5573B] underline underline-offset-4" href={`mailto:${SITE.email}`}>{SITE.email}</a>
          {" "}· {SITE.phone}
        </p>
        <div aria-hidden="true" className="my-8 h-px w-full bg-[#172121]/10" />
        <div className="divide-y divide-[#172121]/10 border-y border-[#172121]/10">
          {FAQS.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="cursor-pointer list-none font-serif text-xl leading-snug marker:hidden [&::-webkit-details-marker]:hidden">
                <span className="mr-3 inline-block text-[#D5573B] transition-transform group-open:rotate-45">+</span>
                {f.q}
              </summary>
              <p className="mt-3 pl-7 leading-relaxed text-[#172121]/80">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
