import type { Metadata } from "next";
import Link from "next/link";
import CheckoutForm from "./checkout-form";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Guest or account checkout with COD across Bangladesh.",
};

export default function CheckoutPage() {
  // Read at render time: SSLCommerz stays disabled unless explicitly enabled.
  const sslEnabled = process.env.PAYMENT_SSLCOMMERZ_ENABLED === "true";

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="text-2xl font-semibold">Checkout</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Guest checkout welcome — or <Link href="/login" className="underline">sign in</Link> to sync addresses.
      </p>
      <div className="mt-4">
        <CheckoutForm sslEnabled={sslEnabled} />
      </div>
    </main>
  );
}
