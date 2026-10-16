import type { MetadataRoute } from 'next';
import { DEMO_CATEGORIES } from '@/lib/admin-data';
import { PRODUCTS } from '@/lib/catalog';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes = ['', '/men', '/women', '/kids', '/new-arrivals', '/sale', '/track'].map((p) => ({
    url: `${baseUrl}${p || '/'}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: p === '' ? 1 : 0.7,
  }));

  const products = (PRODUCTS as unknown as { slug: string; updatedAt?: string }[]).map((p) => ({
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
