import type { MetadataRoute } from 'next';

// PWA manifest. Brand name is intentionally generic here until
// src/config/site.ts (BRAND_NAME, plan §0) is populated, then
// import the name from there to keep a single source of truth.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Brand Store — Premium Fashion Bangladesh',
    short_name: 'Brand Store',
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
