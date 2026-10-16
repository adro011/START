import type { Metadata } from "next";
import LegalLayout from "@/components/legal-layout";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  title: `Privacy Policy | ${SITE.name}`,
  description: `How ${SITE.name} collects, uses and protects your personal data — orders, accounts and marketing in Bangladesh.`,
};

export default function PrivacyPage() {
  return (
    <LegalLayout
      eyebrow="Legal · Privacy"
      title="Privacy policy."
      intro={`We collect the minimum needed to run your order — and never sell your data. Questions: ${SITE.email}.`}
      updated="October 2026"
    >
      <h2>What we collect</h2>
      <ul>
        <li><strong>Orders:</strong> name, phone (+880), address (division → district → area), order items.</li>
        <li><strong>Accounts:</strong> email, order history, wishlist, addresses you save.</li>
        <li><strong>Support:</strong> messages you send via contact form, email or WhatsApp.</li>
        <li><strong>Analytics:</strong> cookie-less page stats (no cross-site tracking).</li>
      </ul>
      <h2>How we use it</h2>
      <ul>
        <li>To fulfil, deliver and support your orders (including courier + payment partners).</li>
        <li>To prevent fraud — e.g. phone confirmation for high-value COD orders.</li>
        <li>To send order updates. Marketing emails only if you opt in; unsubscribe anytime.</li>
      </ul>
      <h2>Sharing</h2>
      <p>
        We share order details only with delivery couriers, payment gateways
        (SSLCommerz / bKash / Nagad where used) and email infrastructure — never
        with data brokers. We disclose data if required by Bangladeshi law.
      </p>
      <h2>Your rights</h2>
      <p>
        Ask for a copy, correction or deletion of your data at{" "}
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a>. Account deletion
        removes your profile and addresses; anonymised order records may be kept
        for accounts and tax purposes.
      </p>
      <h2>Retention & security</h2>
      <p>
        Order records are kept as required for business and tax compliance.
        Access is role-based; payments are processed by PCI-compliant gateways —
        we never see or store your card or mobile-banking PIN.
      </p>
    </LegalLayout>
  );
}
