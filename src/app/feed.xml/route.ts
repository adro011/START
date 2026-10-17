import { SITE } from '@/config/site';
import { PRODUCTS, type Product } from '@/lib/catalog';
import { getLiveProducts } from '@/lib/storefront';

const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

interface FeedRow {
  slug: string;
  name: string;
  description?: string;
  pricePaisa?: number;
  price_paisa?: number;
  images?: { src: string; alt?: string }[] | string[];
  image?: string;
  active?: boolean;
  isFeatured?: boolean;
  brand?: string;
}

function firstImage(p: FeedRow): string {
  if (typeof p.image === 'string' && p.image) return p.image;
  const imgs = p.images as unknown;
  if (Array.isArray(imgs) && imgs.length > 0) {
    const first = imgs[0] as string | { src?: string };
    if (typeof first === 'string') return first;
    if (first && typeof first.src === 'string') return first.src;
  }
  return `${baseUrl}/placeholder.png`;
}

export async function GET(): Promise<Response> {
  const brand = (SITE as unknown as { name?: string })?.name ?? 'brand-store';
  // Live-first (Supabase) with local fallback — never throws.
  let list: Product[] = PRODUCTS;
  try {
    const { products } = await getLiveProducts();
    if (products.length > 0) list = products;
  } catch {
    /* local fallback */
  }
  const rows = list as unknown as FeedRow[];
  const items = rows
    .map((p) => {
      const paisa = p.pricePaisa ?? p.price_paisa ?? 0;
      const priceBdt = `${(paisa / 100).toFixed(2)} BDT`;
      const link = `${baseUrl}/product/${p.slug}`;
      const rawImg = firstImage(p);
      const img = rawImg.startsWith('http') ? rawImg : `${baseUrl}${rawImg.startsWith('/') ? '' : '/'}${rawImg}`;
      const availability = p.active === false ? 'out_of_stock' : 'in_stock';
      return `    <item>
      <g:id>${esc(p.slug)}</g:id>
      <title>${esc(p.name)}</title>
      <description>${esc(p.description ?? p.name)}</description>
      <link>${esc(link)}</link>
      <g:image_link>${esc(img)}</g:image_link>
      <g:price>${esc(priceBdt)}</g:price>
      <g:availability>${availability}</g:availability>
      <g:brand>${esc(p.brand ?? brand)}</g:brand>
      <g:condition>new</g:condition>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${esc(brand)} — Google Merchant feed</title>
    <link>${esc(baseUrl)}</link>
    <description>Demo product feed in BDT (stub → live Supabase products)</description>
${items}
  </channel>
</rss>`;

  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
