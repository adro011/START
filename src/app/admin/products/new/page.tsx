import Link from 'next/link';
import ProductForm from '../product-form';

export default async function NewProductPage() {
  // Protected by admin layout → requireAdmin() (server).
  return (
    <div className="space-y-4">
      <div>
        <Link href="/admin/products" className="text-sm text-ash hover:underline">← Products</Link>
        <h1 className="mt-1 text-2xl font-semibold">New product</h1>
      </div>
      <ProductForm />
    </div>
  );
}
