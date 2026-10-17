import { z } from 'zod';
import { getLiveProducts } from '@/lib/storefront';
import { PRODUCTS, type Product } from '@/lib/catalog';

const QuerySchema = z.object({
  section: z.enum(['men', 'women', 'kids']).optional(),
});

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const parsed = QuerySchema.safeParse({ section: url.searchParams.get('section') ?? undefined });
  if (!parsed.success) {
    return Response.json({ ok: false, error: 'Invalid ?section (men|women|kids)' }, { status: 400 });
  }
  // Live-first (Supabase) with local fallback — also feeds client widgets
  // (search palette, wishlist, recently viewed) with live slugs.
  let all: Product[] = PRODUCTS;
  try {
    const { products } = await getLiveProducts();
    if (products.length > 0) all = products;
  } catch {
    /* local fallback */
  }
  const list = all.filter((p) =>
    parsed.data.section ? p.section === parsed.data.section : true,
  );
  return Response.json({ ok: true, count: list.length, products: list, live: all !== PRODUCTS });
}
