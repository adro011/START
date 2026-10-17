import Link from 'next/link';
import { PRODUCTS, type Product } from '@/lib/catalog';
import { getLiveProducts } from '@/lib/storefront';
import { formatBDT } from '@/lib/format';

interface Row { slug: string; name: string; section?: string; price_paisa?: number; pricePaisa?: number; active?: boolean; }

export default async function AdminProductsPage({ searchParams }: { searchParams?: Promise<Record<string, string | undefined>> }) {
  const sp = (await searchParams) ?? {};
  const q = (sp.q ?? '').toLowerCase();
  const section = sp.section ?? '';
  const status = sp.status ?? 'all';

  // Live-first (Supabase): the registry table reflects real DB rows.
  // Local fallback keeps the page usable offline. Live rows are active-only.
  let source: Product[] = PRODUCTS;
  try {
    const res = await getLiveProducts();
    if (res.products.length > 0) {
      source = res.products;
    }
  } catch {
    /* local fallback */
  }
  const all = (source as unknown as Row[]).map((p) => ({
    slug: p.slug,
    name: p.name,
    section: p.section ?? '',
    pricePaisa: p.price_paisa ?? p.pricePaisa ?? 0,
    active: p.active ?? true,
  }));

  const rows = all.filter((p) => {
    if (q && !`${p.name} ${p.slug}`.toLowerCase().includes(q)) return false;
    if (section && p.section !== section) return false;
    if (status === 'active' && !p.active) return false;
    if (status === 'draft' && p.active) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Products</h1>
          <p className="text-sm text-ash">{rows.length} of {all.length} · search + filter are URL-driven</p>
        </div>
        <Link href="/admin/products/new" className="rounded bg-gold px-3 py-2 text-sm font-medium text-black hover:bg-gold-dark">+ New product</Link>
      </div>

      <form method="get" className="flex flex-wrap gap-2 text-sm">
        <input name="q" defaultValue={sp.q ?? ''} placeholder="Search name or slug…" aria-label="Search products" className="min-w-52 flex-1 rounded border border-white/15 bg-[#111111] text-[#F5F5F5] placeholder:text-ash px-3 py-2" />
        <select name="section" defaultValue={section} aria-label="Filter by section" className="rounded border border-white/15 bg-[#111111] text-[#F5F5F5] placeholder:text-ash px-3 py-2">
          <option value="">All sections</option>
          <option value="men">Men</option>
          <option value="women">Women</option>
          <option value="kids">Kids</option>
        </select>
        <select name="status" defaultValue={status} aria-label="Filter by status" className="rounded border border-white/15 bg-[#111111] text-[#F5F5F5] placeholder:text-ash px-3 py-2">
          <option value="all">All</option>
          <option value="active">Published</option>
          <option value="draft">Draft</option>
        </select>
        <button type="submit" className="rounded border border-white/15 px-3 py-2 font-medium hover:bg-white/10">Filter</button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-white/15">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="bg-[#202020] text-xs uppercase tracking-wider text-ash">
              <th className="px-3 py-2">Product</th><th className="px-3 py-2">Section</th><th className="px-3 py-2">Price</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {rows.map((p) => (
              <tr key={p.slug}>
                <td className="px-3 py-2"><span className="font-medium">{p.name}</span><span className="block text-xs text-ash">{p.slug}</span></td>
                <td className="px-3 py-2">{p.section}</td>
                <td className="px-3 py-2">{formatBDT(p.pricePaisa)}</td>
                <td className="px-3 py-2">{p.active ? <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">Published</span> : <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold">Draft</span>}</td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/admin/products/${p.slug}`} className="rounded border border-white/15 px-2 py-1 text-xs font-medium hover:bg-white/10">Edit</Link>
                    {/* Publish toggle: stub link — real toggle flips `active` + revalidateTag('products'). */}
                    <Link href={`/admin/products/${p.slug}`} title="Toggle publish in edit form (stub)" className="rounded border border-white/15 px-2 py-1 text-xs font-medium hover:bg-white/10">{p.active ? 'Unpublish' : 'Publish'}</Link>
                    {/* TODO: soft-delete via deleted_at (set deleted_at=now(), keep row for audit). */}
                    <button type="button" disabled title="TODO: soft-delete via deleted_at" className="cursor-not-allowed rounded border border-white/15 px-2 py-1 text-xs text-ash">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 ? <tr><td colSpan={5} className="px-3 py-8 text-center text-ash">No products match. Try clearing filters.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
