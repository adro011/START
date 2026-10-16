import Link from 'next/link';
import { DEMO_ORDERS } from '@/lib/admin-data';
import { formatBDT } from '@/lib/format';

const STATUSES = ['all', 'pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'returned'] as const;

export default async function AdminOrdersPage({ searchParams }: { searchParams?: Promise<Record<string, string | undefined>> }) {
  const sp = (await searchParams) ?? {};
  const status = sp.status ?? 'all';
  const rows = DEMO_ORDERS.filter((o) => (status === 'all' ? true : o.status === status));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Orders</h1>
        <p className="text-sm text-stone-500">{rows.length} orders · demo stub → Supabase orders table</p>
      </div>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by status">
        {STATUSES.map((s) => (
          <Link key={s} href={s === 'all' ? '/admin/orders' : `/admin/orders?status=${s}`}
            aria-current={status === s ? 'page' : undefined}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${status === s ? 'bg-stone-900 text-white' : 'bg-stone-100 hover:bg-stone-200'}`}>
            {s}
          </Link>
        ))}
      </div>
      <div className="overflow-x-auto rounded-lg border border-stone-200">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="bg-stone-50 text-xs uppercase tracking-wider text-stone-500">
              <th className="px-3 py-2">Order</th><th className="px-3 py-2">Customer</th><th className="px-3 py-2">Items</th><th className="px-3 py-2">Total</th><th className="px-3 py-2">Payment</th><th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {rows.map((o) => (
              <tr key={o.id}>
                <td className="px-3 py-2"><Link href={`/admin/orders/${o.id}`} className="font-medium hover:underline">{o.orderNo}</Link><span className="block text-xs text-stone-500">{new Date(o.createdAt).toLocaleDateString('en-BD')}</span></td>
                <td className="px-3 py-2">{o.customerName}<span className="block text-xs text-stone-500">{o.phone}</span></td>
                <td className="px-3 py-2">{o.items.reduce((s, i) => s + i.qty, 0)}</td>
                <td className="px-3 py-2">{formatBDT(o.totalPaisa)}</td>
                <td className="px-3 py-2 text-xs">{o.paymentMethod} · {o.paymentStatus}</td>
                <td className="px-3 py-2"><span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-semibold">{o.status}</span></td>
              </tr>
            ))}
            {rows.length === 0 ? <tr><td colSpan={6} className="px-3 py-8 text-center text-stone-500">No orders with this status.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
