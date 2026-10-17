import type { MetadataRoute } from 'next';
import { SITE } from '@/config/site';

// PWA manifest. Brand name comes from src/config/site.ts (BRAND_NAME,
// plan §0) — the single source of truth.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.name} — Premium Fashion Bangladesh`,
    short_name: 'ABRAR',
    description: 'Premium Men, Women and Kids fashion. COD across Bangladesh.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#000000',
    theme_color: '#000000',
    lang: 'en-BD',
    icons: [
      {
        src: '/hero/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/hero/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/hero/icons/maskable-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/hero/icons/maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
