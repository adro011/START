import type { MetadataRoute } from 'next';
import { SITE } from '@/config/site';
import { asset, designValue } from '@/lib/content';

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
    background_color: designValue('backgrounds', 'page.color', '#000000'),
    theme_color: designValue('backgrounds', 'page.color', '#000000'),
    lang: 'en-BD',
    icons: [
      {
        src: asset('brand', 'pwa192', '/hero/icons/icon-192.png'),
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: asset('brand', 'pwa512', '/hero/icons/icon-512.png'),
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: asset('brand', 'pwaMaskable192', '/hero/icons/maskable-192.png'),
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: asset('brand', 'pwaMaskable512', '/hero/icons/maskable-512.png'),
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
