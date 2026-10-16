import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';

const NAV = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/coupons', label: 'Coupons' },
  { href: '/admin/categories', label: 'Categories' },
  { href: '/admin/settings', label: 'Settings' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Server-side gate: non-admin is blocked here before any child renders.
  const session = await requireAdmin('/admin');

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900">
      <header className="sticky top-0 z-20 border-b border-stone-200 bg-stone-950 text-white md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/admin" className="text-sm font-semibold tracking-wide">ADMIN</Link>
          <span className="truncate text-xs text-stone-300">{session.user.email}</span>
        </div>
        <nav aria-label="Admin" className="flex gap-1 overflow-x-auto px-3 pb-3">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="whitespace-nowrap rounded-full bg-stone-800 px-3 py-1.5 text-xs font-medium hover:bg-stone-700">
              {n.label}
            </Link>
          ))}
        </nav>
      </header>

      <div className="mx-auto flex w-full max-w-7xl gap-0 md:gap-6 md:px-6 md:py-6">
        <aside className="sticky top-6 hidden h-fit w-56 shrink-0 rounded-lg border border-stone-200 bg-white p-3 md:block">
          <p className="px-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Admin</p>
          <p className="truncate px-2 pb-2 text-xs text-stone-500">{session.user.email}{session.isDev ? ' · dev' : ''}</p>
          <nav aria-label="Admin" className="flex flex-col gap-1">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="rounded px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 hover:text-stone-950">
                {n.label}
              </Link>
            ))}
          </nav>
          <Link href="/" className="mt-3 block rounded px-3 py-2 text-xs text-stone-500 hover:bg-stone-100">← View store</Link>
        </aside>

        <main className="min-w-0 flex-1 bg-white p-4 sm:p-6 md:rounded-lg md:border md:border-stone-200">{children}</main>
      </div>
    </div>
  );
}
