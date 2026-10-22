import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getLiveOrders, type LiveOrder } from "@/lib/storefront";
import { formatBDT } from "@/lib/format";

export const metadata: Metadata = { title: "My account" };

const STATUS_STEPS = ["pending", "confirmed", "packed", "shipped", "delivered"] as const;

const BADGE_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  packed: "bg-indigo-100 text-indigo-800",
  shipped: "bg-sky-100 text-sky-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-700",
  returned: "bg-red-100 text-red-700",
};

function StatusBadge({ status }: { status: string }) {
  const cls = BADGE_STYLES[status] ?? "bg-neutral-200 text-neutral-700";
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}

function OrderCard({ order }: { order: LiveOrder }) {
  const stepIndex = STATUS_STEPS.indexOf(order.status as (typeof STATUS_STEPS)[number]);
  const terminal = order.status === "cancelled" || order.status === "returned";
  return (
    <li className="rounded-xl border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <Link href={`/account/orders/${order.id}`} className="font-mono font-semibold underline">
            {order.order_no}
          </Link>
          <p className="text-xs text-ash">
            Placed {new Date(order.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            {" · "}{formatBDT(order.total_paisa)}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>
      {!terminal && (
        <ol className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
          {STATUS_STEPS.map((s, i) => (
            <li key={s} className={i <= stepIndex ? "font-semibold text-[var(--color-smoke)]" : "text-steel"}>
              <span aria-hidden>{i <= stepIndex ? "●" : "○"}</span> <span className="capitalize">{s}</span>
            </li>
          ))}
        </ol>
      )}
      {order.events.length > 0 && (
        <ol className="mt-3 space-y-1.5 border-t pt-3 text-xs text-ash">
          {order.events.map((ev) => (
            <li key={ev.id} className="flex flex-wrap gap-x-2">
              <span className="font-medium text-[var(--color-smoke)]">{ev.status}</span>
              {ev.note && <span>— {ev.note}</span>}
              <span className="ml-auto text-ash">
                {new Date(ev.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                {ev.actor ? ` · ${ev.actor}` : ""}
              </span>
            </li>
          ))}
        </ol>
      )}
    </li>
  );
}

export default async function AccountPage() {
  const session = await getSession();
  const orders = session ? await getLiveOrders(session.user.id) : null;

  return (
    <main className="relative mx-auto max-w-3xl px-4 py-6">
      {/* ── Bottom-left small registry icon ── */}
      <div className="fixed bottom-4 left-4 z-50">
        <Link
          href="/registry/login"
          aria-label="Shop registry"
          className="flex items-center justify-center h-8 w-8 rounded border border-gold/40 text-gold/70 hover:text-gold hover:border-gold transition-colors duration-200"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M9 21V9" />
          </svg>
        </Link>
      </div>

      <h1 className="text-2xl font-semibold">Account</h1>

      {!session ? (
        <div className="mt-6 rounded-xl border border-dashed p-6 text-center">
          <p className="font-medium">You&apos;re browsing as a guest</p>
          <p className="mt-1 text-sm text-ash">
            Sign in with Supabase Auth to see your orders, saved addresses and wishlist.
          </p>
          <Link
            href="/login?next=/account"
            className="mt-4 inline-block rounded-lg bg-gold px-4 py-2 text-sm font-medium text-black hover:bg-gold-dark"
          >
            Sign in
          </Link>
        </div>
      ) : (
        <>
          <p className="mt-1 text-sm text-ash">
            Signed in as {session.user.email} — orders sync live from Supabase (RLS-scoped to your account).
          </p>
          <section className="mt-6">
            <h2 className="text-lg font-semibold">Orders</h2>
            {orders === null ? (
              <p className="mt-3 rounded-xl border border-dashed p-4 text-sm text-ash">
                Couldn&apos;t reach the database right now — orders will appear once the connection is back.
              </p>
            ) : orders.length === 0 ? (
              <p className="mt-3 rounded-xl border border-dashed p-4 text-sm text-ash">
                No orders yet. <Link href="/" className="underline">Start shopping</Link>
              </p>
            ) : (
              <ul className="mt-3 grid gap-3">
                {orders.map((o) => (
                  <OrderCard key={o.id} order={o} />
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link href="/account/addresses" className="rounded-xl border p-4 hover:bg-white/5">
          <p className="font-medium">Addresses</p>
          <p className="text-sm text-ash">Dhaka / outside Dhaka zones</p>
        </Link>
        <Link href="/account/wishlist" className="rounded-xl border p-4 hover:bg-white/5">
          <p className="font-medium">Wishlist</p>
          <p className="text-sm text-ash">Saved products on this device</p>
        </Link>
        <Link href="/track" className="rounded-xl border p-4 hover:bg-white/5">
          <p className="font-medium">Track order</p>
          <p className="text-sm text-ash">Order no + phone</p>
        </Link>
      </div>
    </main>
  );
}
