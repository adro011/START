import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProduct } from '@/lib/catalog';
import ProductForm from '../product-form';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  // Protected by admin layout → requireAdmin() (server).
  const { id } = await params;
  const product = (getProduct as (slug: string) => Record<string, unknown> | null | undefined)?.(decodeURIComponent(id));
  if (!product) notFound();
  return (
    <div className="space-y-4">
      <div>
        <Link href="/admin/products" className="text-sm text-stone-500 hover:underline">← Products</Link>
        <h1 className="mt-1 text-2xl font-semibold">Edit — {String((product as { name?: unknown }).name ?? id)}</h1>
      </div>
      <ProductForm initial={product as Record<string, unknown>} />
    </div>
  );
}
