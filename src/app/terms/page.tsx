import type { Metadata } from "next";
import Link from "next/link";
import LegalLayout from "@/components/legal-layout";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  title: `Terms of Service | ${SITE.name}`,
  description: `Terms for shopping at ${SITE.name} — orders, payments, delivery, exchanges and acceptable use.`,
};

export default function TermsPage() {
  return (
    <LegalLayout
      eyebrow="Legal · Terms"
      title="Terms of service."
      intro="Short version: pay honestly, give a reachable phone number, and we'll get you well-made clothes with a fair exchange policy."
      updated="October 2026"
    >
      <h2>Orders & pricing</h2>
      <ul>
        <li>All prices are in Bangladeshi Taka (৳, BDT) inclusive of VAT where applicable.</li>
        <li>An order is confirmed when we SMS/confirm it; we may cancel and refund if an item is out of stock or mispriced.</li>
        <li>High-value COD orders may need phone/OTP confirmation before dispatch.</li>
      </ul>
      <h2>Payments</h2>
      <p>
        Cash on delivery, plus bKash / Nagad / cards via SSLCommerz where enabled.
        Online payments are verified with the gateway before dispatch; failed or
        unverified payments are automatically cancelled.
      </p>
      <h2>Delivery & exchanges</h2>
      <p>
        Timelines and the 7-day size-exchange policy are on our{" "}
        <Link href="/shipping-returns">Shipping &amp; Returns</Link> page and form part
        of these terms. Risk passes to you on delivery; inspect your parcel on arrival.
      </p>
      <h2>Acceptable use</h2>
      <ul>
        <li>Provide accurate contact and address details.</li>
        <li>No fraud, chargeback abuse, or misuse of reviews, coupons and contact forms.</li>
        <li>Product photos and copy are ours — please don&apos;t reuse them commercially without permission.</li>
      </ul>
      <h2>Governing law</h2>
      <p>
        These terms are governed by the laws of Bangladesh. Disputes will first be
        handled through good-faith support at <a href={`mailto:${SITE.email}`}>{SITE.email}</a>{" "}
        ({SITE.phone}).
      </p>
    </LegalLayout>
  );
}
