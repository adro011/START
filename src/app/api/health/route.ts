import { PRODUCTS } from '@/lib/catalog';

export async function GET(): Promise<Response> {
  const count = Array.isArray(PRODUCTS) ? PRODUCTS.length : 0;
  return Response.json({ ok: true, products: count, time: new Date().toISOString() });
}
