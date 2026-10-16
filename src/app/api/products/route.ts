import { z } from 'zod';
import { PRODUCTS } from '@/lib/catalog';

const QuerySchema = z.object({
  section: z.enum(['men', 'women', 'kids']).optional(),
});

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const parsed = QuerySchema.safeParse({ section: url.searchParams.get('section') ?? undefined });
  if (!parsed.success) {
    return Response.json({ ok: false, error: 'Invalid ?section (men|women|kids)' }, { status: 400 });
  }
  const list = (PRODUCTS as unknown as { section?: string }[]).filter((p) =>
    parsed.data.section ? p.section === parsed.data.section : true,
  );
  return Response.json({ ok: true, count: list.length, products: list });
}
