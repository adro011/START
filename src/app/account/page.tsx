import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "My account" };

export default function AccountPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="text-2xl font-semibold">Account</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Demo area — orders read from this browser’s localStorage. <Link href="/login" className="underline">Sign in</Link> (Supabase Auth) will sync everything in production.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Link href="/account/orders/demo" className="rounded-xl border p-4 hover:bg-neutral-50">
          <p className="font-medium">Orders</p>
          <p className="text-sm text-neutral-600">Timeline, invoice, reorder</p>
        </Link>
        <Link href="/account/addresses" className="rounded-xl border p-4 hover:bg-neutral-50">
          <p className="font-medium">Addresses</p>
          <p className="text-sm text-neutral-600">Dhaka / outside Dhaka zones</p>
        </Link>
        <Link href="/account/wishlist" className="rounded-xl border p-4 hover:bg-neutral-50">
          <p className="font-medium">Wishlist</p>
          <p className="text-sm text-neutral-600">Saved products on this device</p>
        </Link>
        <Link href="/track" className="rounded-xl border p-4 hover:bg-neutral-50">
          <p className="font-medium">Track order</p>
          <p className="text-sm text-neutral-600">Order no + phone</p>
        </Link>
      </div>
      <div className="mt-6 rounded-xl border border-dashed p-4 text-sm">
        <p className="font-medium">Sign in (coming soon)</p>
        <p className="text-neutral-600">Magic link + Google via Supabase Auth. Guest checkout already works.</p>
      </div>
    </main>
  );
}
