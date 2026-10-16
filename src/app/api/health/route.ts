import { PRODUCTS } from '@/lib/catalog';
import { createClient } from '@/lib/supabase/server';

export async function GET(): Promise<Response> {
  const fallback = Array.isArray(PRODUCTS) ? PRODUCTS.length : 0;
  try {
    const supabase = await createClient();
    if (!supabase) {
      return Response.json({ ok: true, products: fallback, source: 'local', time: new Date().toISOString() });
    }
    const { count, error } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('active', true)
      .is('deleted_at', null);
    if (error || count === null) {
      return Response.json({ ok: true, products: fallback, source: 'local', time: new Date().toISOString() });
    }
    return Response.json({ ok: true, products: count, source: 'supabase', time: new Date().toISOString() });
  } catch {
    return Response.json({ ok: true, products: fallback, source: 'local', time: new Date().toISOString() });
  }
}
