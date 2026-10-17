import type { MetadataRoute } from 'next';
import { DEMO_CATEGORIES } from '@/lib/admin-data';
import { PRODUCTS, type Product } from '@/lib/catalog';
import { getLiveProducts } from '@/lib/storefront';

const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes = ['', '/men', '/women', '/kids', '/new-arrivals', '/sale', '/track'].map((p) => ({
    url: `${baseUrl}${p || '/'}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: p === '' ? 1 : 0.7,
  }));

  // Live-first (Supabase) with local fallback — never throws (build-safe).
  let list: Product[] = PRODUCTS;
  try {
    const { products } = await getLiveProducts();
    if (products.length > 0) list = products;
  } catch {
    /* local fallback */
  }
  const products = (list as unknown as { slug: string; updatedAt?: string }[]).map((p) => ({
    url: `${baseUrl}/product/${p.slug}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const categories = DEMO_CATEGORIES.map((c) => ({
    url: `${baseUrl}/${c.section}/${c.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...products, ...categories];
}
