import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Order detail" };

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <nav className="text-xs text-neutral-600" aria-label="Breadcrumb">
        <Link href="/account" className="underline">Account</Link> / <span className="text-neutral-800">Order {id}</span>
      </nav>
      <h1 className="mt-2 font-mono text-xl font-semibold">Order {id}</h1>
      <ol className="mt-4 space-y-1.5 text-sm">
        {["pending", "confirmed", "packed", "shipped", "delivered"].map((s, i) => (
          <li key={s} className={i <= 1 ? "font-semibold" : "text-neutral-400"}>
            <span aria-hidden>{i <= 1 ? "●" : "○"}</span> <span className="capitalize">{s}</span>
            {i === 0 && <span className="ml-2 text-xs text-neutral-600">— demo event from localStorage / RPC in production</span>}
          </li>
        ))}
      </ol>
      <p className="mt-4 text-sm text-neutral-600">
        Demo data — real timeline comes from <code>order_events</code> via the account RLS policy.
      </p>
      <Link href="/track" className="mt-4 inline-block text-sm underline">Track with phone →</Link>
    </main>
  );
}
