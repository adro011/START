import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SITE } from '@/config/site';
import { getDemoOrder } from '@/lib/admin-data';
import { formatBDT } from '@/lib/format';

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = getDemoOrder(decodeURIComponent(id));
  if (!order) notFound();
  const brand = (SITE as unknown as { name?: string; supportEmail?: string })?.name ?? 'brand-store';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <Link href={`/admin/orders/${order.id}`} className="text-sm text-stone-500 hover:underline">← {order.orderNo}</Link>
        <button id="print-btn" type="button" className="rounded bg-stone-900 px-4 py-2 text-sm font-medium text-white">Print</button>
      </div>

      {/* Invoice */}
      <section className="rounded-lg border border-stone-200 bg-white p-6 text-sm" aria-label="Invoice">
        <div className="flex justify-between gap-4">
          <div><p className="text-lg font-semibold">{brand}</p><p className="text-stone-500">Invoice · {order.orderNo}</p></div>
          <div className="text-right text-stone-500"><p>{new Date(order.createdAt).toLocaleDateString('en-BD')}</p><p>{order.paymentMethod} · {order.paymentStatus}</p></div>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div><p className="font-semibold">Bill / ship to</p><p>{order.address.name}<br />{order.address.line1}<br />{order.address.area}, {order.address.district}, {order.address.division}<br />{order.address.phone}</p></div>
          <div><p className="font-semibold">Courier</p><p>{order.courier ?? '—'}{order.trackingNo ? ` · ${order.trackingNo}` : ''}</p></div>
        </div>
        <table className="mt-4 w-full border-collapse text-left">
          <thead><tr className="border-y"><th className="py-2">Item</th><th className="py-2">Qty</th><th className="py-2 text-right">Amount</th></tr></thead>
          <tbody>
            {order.items.map((it, i) => (
              <tr key={i} className="border-b"><td className="py-2">{it.name} <span className="text-stone-500">· {it.size}/{it.color}</span></td><td className="py-2">{it.qty}</td><td className="py-2 text-right">{formatBDT(it.unitPricePaisa * it.qty)}</td></tr>
            ))}
          </tbody>
        </table>
        <div className="mt-3 space-y-1 text-right">
          <p>Subtotal: {formatBDT(order.subtotalPaisa)}</p>
          <p>Discount: −{formatBDT(order.discountPaisa)}</p>
          <p>Shipping: {formatBDT(order.shippingPaisa)}</p>
          <p className="text-base font-semibold">Total: {formatBDT(order.totalPaisa)}</p>
        </div>
      </section>

      {/* Packing slip (no prices) */}
      <section className="rounded-lg border border-dashed border-stone-300 bg-white p-6 text-sm" aria-label="Packing slip">
        <p className="text-lg font-semibold">Packing slip</p>
        <p className="text-stone-500">{order.orderNo} · {order.address.district} · {order.items.reduce((s, i) => s + i.qty, 0)} pcs</p>
        <ul className="mt-3 space-y-1">
          {order.items.map((it, i) => (
            <li key={i} className="flex justify-between border-b py-1.5"><span>☐ {it.name} · {it.size}/{it.color}</span><span>× {it.qty}</span></li>
          ))}
        </ul>
        <p className="mt-3">Ship to: {order.address.name}, {order.address.line1}, {order.address.area}, {order.address.district} — {order.address.phone}</p>
      </section>

      <script dangerouslySetInnerHTML={{ __html: "document.getElementById('print-btn')?.addEventListener('click',function(){window.print()});" }} />
      <style>{`@media print { body * { visibility: hidden; } section, section * { visibility: visible; } section { position: relative; } }`}</style>
    </div>
  );
}
