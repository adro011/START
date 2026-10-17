import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Addresses" };

export default function AddressesPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <nav className="text-xs text-ash" aria-label="Breadcrumb">
        <Link href="/account" className="underline">Account</Link> / <span className="text-[#F5F5F5]">Addresses</span>
      </nav>
      <h1 className="mt-2 text-2xl font-semibold">Addresses</h1>
      <p className="mt-1 text-sm text-ash">
        Demo — saved addresses live in Supabase <code>addresses</code> once signed in. Checkout always lets you type a new BD address.
      </p>
      <div className="mt-4 rounded-xl border p-4 text-sm">
        <p className="font-medium">Home (default)</p>
        <p className="text-ash">House 12, Road 5, Mirpur 10 — Dhaka · 01712345678</p>
      </div>
      <Link href="/checkout" className="mt-4 inline-block text-sm underline">Add a new address at checkout →</Link>
    </main>
  );
}
