import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';

const NAV = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/coupons', label: 'Coupons' },
  { href: '/admin/categories', label: 'Categories' },
  { href: '/admin/registrations', label: 'Registrations' },
  { href: '/admin/settings', label: 'Settings' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Server-side gate: non-admin is blocked here before any child renders.
  const session = await requireAdmin('/admin');

  return (
    <div className="min-h-screen bg-[var(--color-dark-iron)] text-[var(--color-smoke)]">
      <header className="sticky top-0 z-20 border-b border-white/15 bg-black text-white md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/admin" className="text-sm font-semibold tracking-wide">ADMIN</Link>
          <span className="truncate text-xs text-steel">{session.user.email}</span>
        </div>
        <nav aria-label="Admin" className="flex gap-1 overflow-x-auto px-3 pb-3">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="whitespace-nowrap rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium hover:bg-white/15">
              {n.label}
            </Link>
          ))}
        </nav>
      </header>

      <div className="mx-auto flex w-full max-w-7xl gap-0 md:gap-6 md:px-6 md:py-6">
        <aside className="sticky top-6 hidden h-fit w-56 shrink-0 rounded-lg border border-white/15 bg-[var(--color-dark-iron)] p-3 md:block">
          <p className="px-2 text-xs font-semibold uppercase tracking-[0.18em] text-ash">Admin</p>
          <p className="truncate px-2 pb-2 text-xs text-ash">{session.user.email}{session.isDev ? ' · dev' : ''}</p>
          <nav aria-label="Admin" className="flex flex-col gap-1">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="rounded px-3 py-2 text-sm font-medium text-steel hover:bg-white/10 hover:text-[var(--color-smoke)]">
                {n.label}
              </Link>
            ))}
          </nav>
          <Link href="/" className="mt-3 block rounded px-3 py-2 text-xs text-ash hover:bg-white/10">← View store</Link>
        </aside>

        <main className="min-w-0 flex-1 bg-[var(--color-dark-iron)] p-4 sm:p-6 md:rounded-lg md:border md:border-white/15">{children}</main>
      </div>
    </div>
  );
}
