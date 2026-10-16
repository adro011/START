import type { Metadata } from "next";
import LegalLayout from "@/components/legal-layout";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  title: `Shipping & Returns | ${SITE.name}`,
  description: `Delivery across Bangladesh (COD available), charges, timelines and 7-day size exchange at ${SITE.name}.`,
};

export default function ShippingReturnsPage() {
  return (
    <LegalLayout
      eyebrow="Help · Shipping & returns"
      title="Delivery, COD & easy exchange."
      intro="Cash on delivery across Bangladesh, clear timelines by zone, and a 7-day size exchange — no drama."
      updated="October 2026"
    >
      <h2>Where we deliver</h2>
      <p>
        We deliver to all 64 districts of Bangladesh via our courier partners
        (Steadfast / Pathao / RedX). Delivery is <strong>cash on delivery (COD)</strong> by
        default; bKash, Nagad and cards are available online via SSLCommerz where enabled.
      </p>
      <h2>Charges & timelines</h2>
      <ul>
        <li><strong>Inside Dhaka:</strong> flat fee, delivery in 2–3 working days.</li>
        <li><strong>Outside Dhaka:</strong> flat fee, delivery in 3–5 working days.</li>
        <li><strong>Free delivery</strong> on orders above the threshold shown at checkout.</li>
        <li>Eid / wedding season may add 1–2 days — we&apos;ll SMS you if your parcel is delayed.</li>
      </ul>
      <p>
        Please keep your phone reachable (+880 1XXXXXXXXX format). Two failed
        delivery attempts may return the parcel to us; redelivery is charged again.
      </p>
      <h2>7-day size exchange</h2>
      <ul>
        <li>Exchange for a different size within <strong>7 days</strong> of delivery.</li>
        <li>Item must be unworn, unwashed, with tags attached.</li>
        <li>Sale items at 30%+ off are final sale unless faulty.</li>
        <li>To request: email <a href={`mailto:${SITE.email}`}>{SITE.email}</a> with your order number and photos.</li>
      </ul>
      <h2>Faulty or wrong item?</h2>
      <p>
        Tell us within 48 hours with photos and we&apos;ll replace or refund you —
        return shipping is on us in this case. Refunds go to bKash/Nagad/bank within
        5–7 working days after we receive the return.
      </p>
    </LegalLayout>
  );
}
