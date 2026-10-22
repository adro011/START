import Link from 'next/link';
import { DEMO_ORDERS, DEMO_TOP_PRODUCTS, getLowStock, salesSeries, todayStats } from '@/lib/admin-data';
import { formatBDT } from '@/lib/format';

function Sparkline({ data }: { data: { label: string; revenuePaisa: number }[] }) {
  const W = 300;
  const H = 80;
  const P = 6;
  const max = Math.max(1, ...data.map((d) => d.revenuePaisa));
  const step = (W - P * 2) / Math.max(1, data.length - 1);
  const pts = data
    .map((d, i) => {
      const x = P + i * step;
      const y = H - P - (d.revenuePaisa / max) * (H - P * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  const last = data[data.length - 1];
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`30-day revenue trend, latest ${last?.label}`} className="h-20 w-full">
        <polyline points={pts} fill="none" strokeWidth="2" stroke="currentColor" className="text-[var(--color-smoke)]" />
        {data.map((d, i) => {
          const x = P + i * step;
          const y = H - P - (d.revenuePaisa / max) * (H - P * 2);
          return i % 5 === 0 ? <circle key={d.label} cx={x} cy={y} r="1.6" className="fill-[var(--color-ash)]" /> : null;
        })}
      </svg>
      <div className="flex justify-between text-[11px] text-ash">
        <span>{data[0]?.label}</span>
        <span>{last?.label}</span>
      </div>
    </div>
  );
}

export default async function AdminDashboard() {
  // Protected by src/app/admin/layout.tsx → requireAdmin() (server).
  const stats = todayStats();
  const pending = DEMO_ORDERS.filter((o) => o.status === 'pending');
  const low = getLowStock(5);
  const series = salesSeries(30);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-ash">Demo aggregates from lib/admin-data.ts → replace with Supabase queries.</p>
        </div>
        <div className="flex gap-2 text-sm">
          <Link href="/admin/products/new" className="rounded bg-gold px-3 py-2 font-medium text-black hover:bg-gold-dark">+ Product</Link>
          <Link href="/admin/orders" className="rounded border border-white/15 px-3 py-2 font-medium hover:bg-white/10">Orders</Link>
        </div>
      </div>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-lg border border-white/15 p-4">
          <p className="text-xs uppercase tracking-wider text-ash">Today orders</p>
          <p className="mt-1 text-2xl font-semibold">{stats.orders}</p>
        </div>
        <div className="rounded-lg border border-white/15 p-4">
          <p className="text-xs uppercase tracking-wider text-ash">Today revenue</p>
          <p className="mt-1 text-2xl font-semibold">{formatBDT(stats.revenuePaisa)}</p>
        </div>
        <div className="rounded-lg border border-white/15 p-4">
          <p className="text-xs uppercase tracking-wider text-ash">Pending</p>
          <p className="mt-1 text-2xl font-semibold">{pending.length}</p>
        </div>
        <div className="rounded-lg border border-white/15 p-4">
          <p className="text-xs uppercase tracking-wider text-ash">Low stock ≤5</p>
          <p className="mt-1 text-2xl font-semibold">{low.length}</p>
        </div>
      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-lg border border-white/15 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">30-day sales</h2>
            <span className="text-xs text-ash">hand-rolled SVG, no chart lib</span>
          </div>
          <div className="mt-3"><Sparkline data={series} /></div>
        </div>
        <div className="rounded-lg border border-white/15 p-4">
          <h2 className="text-sm font-semibold">Top products</h2>
          <ul className="mt-3 divide-y divide-white/10 text-sm">
            {DEMO_TOP_PRODUCTS.map((p) => (
              <li key={p.slug} className="flex items-center justify-between gap-3 py-2">
                <Link href={`/admin/products/${p.slug}`} className="truncate font-medium hover:underline">{p.name}</Link>
                <span className="shrink-0 text-ash">{p.qty} sold · {formatBDT(p.revenuePaisa)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-lg border border-white/15 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Pending orders</h2>
            <Link href="/admin/orders?status=pending" className="text-xs font-medium hover:underline">View all →</Link>
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            {pending.length === 0 ? <li className="text-ash">No pending orders.</li> : null}
            {pending.map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-3 rounded border border-white/15 px-3 py-2">
                <Link href={`/admin/orders/${o.id}`} className="font-medium hover:underline">{o.orderNo}</Link>
                <span className="text-ash">{o.customerName} · {formatBDT(o.totalPaisa)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-white/15 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Low stock</h2>
            <Link href="/admin/products" className="text-xs font-medium hover:underline">Manage →</Link>
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            {low.map((i) => (
              <li key={i.sku} className="flex items-center justify-between gap-3 rounded border border-white/15 px-3 py-2">
                <span className="truncate">{i.productName} <span className="text-ash">· {i.size} / {i.color} · {i.sku}</span></span>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${i.stock === 0 ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-900'}`}>{i.stock} left</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
