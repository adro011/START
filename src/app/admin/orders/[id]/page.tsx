import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDemoOrder } from '@/lib/admin-data';
import { formatBDT } from '@/lib/format';
import { advanceStatus, assignCourier, cancelOrder } from '../actions';

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = getDemoOrder(decodeURIComponent(id));
  if (!order) notFound();

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/orders" className="text-sm text-ash hover:underline">← Orders</Link>
          <h1 className="mt-1 text-2xl font-semibold">{order.orderNo}</h1>
          <p className="text-sm text-ash">{order.customerName} · {order.phone} · {new Date(order.createdAt).toLocaleString('en-BD')}</p>
        </div>
        <Link href={`/admin/orders/${order.id}/invoice`} className="rounded border border-white/15 px-3 py-2 text-sm font-medium hover:bg-white/5">🧾 Invoice / packing slip</Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-white/15 p-4 text-sm"><p className="text-xs uppercase tracking-wider text-ash">Status</p><p className="mt-1 font-semibold">{order.status}</p><p className="text-ash">{order.paymentMethod} · {order.paymentStatus}</p></div>
        <div className="rounded-lg border border-white/15 p-4 text-sm"><p className="text-xs uppercase tracking-wider text-ash">Total</p><p className="mt-1 font-semibold">{formatBDT(order.totalPaisa)}</p><p className="text-ash">Sub {formatBDT(order.subtotalPaisa)} · Ship {formatBDT(order.shippingPaisa)}{order.couponCode ? ` · ${order.couponCode}` : ''}</p></div>
        <div className="rounded-lg border border-white/15 p-4 text-sm"><p className="text-xs uppercase tracking-wider text-ash">Address</p><p className="mt-1">{order.address.line1}, {order.address.area}, {order.address.district}</p></div>
      </div>

      <section className="rounded-lg border border-white/15 p-4">
        <h2 className="text-sm font-semibold">Timeline (from order_events)</h2>
        <ol className="mt-3 space-y-0 border-l-2 border-white/15 pl-0">
          {order.events.map((e, i) => (
            <li key={i} className="relative pb-4 pl-5">
              <span aria-hidden className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-gold" />
              <p className="text-sm font-medium">{e.status}</p>
              <p className="text-xs text-ash">{e.note ?? ''}{e.actor ? ` · ${e.actor}` : ''} · {new Date(e.at).toLocaleString('en-BD')}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-lg border border-white/15 p-4">
        <h2 className="text-sm font-semibold">Advance status</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {['confirmed', 'packed', 'shipped', 'delivered'].map((s) => (
            <form key={s} action={advanceStatus}>
              <input type="hidden" name="orderId" value={order.id} />
              <input type="hidden" name="to" value={s} />
              <button type="submit" className="rounded border border-white/15 px-3 py-1.5 text-sm font-medium hover:bg-white/5">Mark {s}</button>
            </form>
          ))}
          <form action={cancelOrder}>
            <input type="hidden" name="orderId" value={order.id} />
            <button type="submit" className="rounded border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50">Cancel order</button>
          </form>
        </div>
        <p className="mt-2 text-xs text-ash">Cancelling restores stock via the <code>cancel_order</code> RPC (stock restore happens server-side in one transaction).</p>
      </section>

      <section className="rounded-lg border border-white/15 p-4">
        <h2 className="text-sm font-semibold">Courier + tracking</h2>
        <form action={assignCourier} className="mt-3 grid gap-3 sm:grid-cols-3">
          <input type="hidden" name="orderId" value={order.id} />
          <label className="block text-sm">Courier<input name="courier" defaultValue={order.courier ?? ''} placeholder="Steadfast / Pathao / RedX" className="textInput mt-1 w-full bg-[#111111] px-3 py-2 text-[var(--color-smoke)] placeholder:text-ash" /></label>
          <label className="block text-sm">Tracking no<input name="tracking" defaultValue={order.trackingNo ?? ''} placeholder="SF-…" className="textInput mt-1 w-full bg-[#111111] px-3 py-2 text-[var(--color-smoke)] placeholder:text-ash" /></label>
          <div className="flex items-end"><button type="submit" className="rounded bg-gold px-4 py-2 text-sm font-medium text-black hover:bg-gold-dark">Save</button></div>
        </form>
      </section>

      <section className="rounded-lg border border-white/15 p-4">
        <h2 className="text-sm font-semibold">Items</h2>
        <ul className="mt-2 divide-y divide-white/10 text-sm">
          {order.items.map((it, i) => (
            <li key={i} className="flex justify-between gap-3 py-2"><span>{it.name} <span className="text-ash">· {it.size} / {it.color} × {it.qty}</span></span><span>{formatBDT(it.unitPricePaisa * it.qty)}</span></li>
          ))}
        </ul>
      </section>
    </div>
  );
}
