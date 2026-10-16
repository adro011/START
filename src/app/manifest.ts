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
    background_color: '#FBF6F3',
    theme_color: '#D5573B',
    lang: 'en-BD',
    icons: [
      {
        src: '/icons/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icons/maskable.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  };
}
