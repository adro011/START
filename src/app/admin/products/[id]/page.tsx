import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProduct } from '@/lib/catalog';
import { getLiveProducts } from '@/lib/storefront';
import ProductForm from '../product-form';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  // Protected by admin layout → requireAdmin() (server).
  const { id } = await params;
  // Live-first (Supabase) so registry edits load real DB rows.
  let list = undefined as Parameters<typeof getProduct>[1] | undefined;
  try {
    const { products } = await getLiveProducts();
    if (products.length > 0) list = products;
  } catch {
    /* local fallback */
  }
  const product = getProduct(decodeURIComponent(id), list);
  if (!product) notFound();
  // Bridge live Product → the snake_case shape ProductForm hydrates from.
  // (Live query is active-only, so Published defaults true.)
  const initial: Record<string, unknown> = {
    id: (product as { id?: string }).id,
    name: product.name,
    slug: product.slug,
    section: product.section,
    category: product.category,
    description: product.description,
    fabric: product.fabric,
    price_paisa: product.pricePaisa,
    compare_at_paisa: product.compareAtPaisa ?? null,
    active: true,
    is_new: product.isNew,
    is_sale: product.isSale,
    is_featured: product.isFeatured,
    sizes: product.sizes,
    colors: product.colors,
    stock: Object.fromEntries(product.variants.map((v) => [`${v.size}__${v.color}`, v.stock])),
    variantPrices: Object.fromEntries(product.variants.filter((v) => v.priceOverridePaisa != null).map((v) => [`${v.size}__${v.color}`, v.priceOverridePaisa as number])),
    variantSkus: Object.fromEntries(product.variants.filter((v) => !v.sku.startsWith('DEMO-')).map((v) => [`${v.size}__${v.color}`, v.sku])),
    images: product.images.map((im, i) => ({
      id: `live-${product.slug}-${i}`,
      url: im.src,
      alt: im.alt,
      name: im.alt || product.name,
    })),
  };
  return (
    <div className="space-y-4">
      <div>
        <Link href="/admin/products" className="text-sm text-ash hover:underline">← Products</Link>
        <h1 className="mt-1 text-2xl font-semibold">Edit — {String((product as { name?: unknown }).name ?? id)}</h1>
      </div>
      <ProductForm initial={initial} />
    </div>
  );
}
