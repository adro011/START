/* Minimal PWA service worker: cache-first for immutable, content-hashed static
 * assets; network-first navigations with an offline fallback.
 *
 * NOTE: page navigations/HTML are intentionally NOT cached. Next.js HTML
 * references build-specific chunk URLs; caching HTML past a new deploy makes the
 * browser request chunks that no longer exist (ChunkLoadError / "Cannot find
 * module"). The SW is registered in production only (see sw-register.tsx). */
const VERSION = 'v2';
const STATIC_CACHE = `static-${VERSION}`;
const PRECACHE = ['/offline', '/hero/icons/icon-192.png', '/hero/icons/maskable-192.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== STATIC_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

function isStaticAsset(url) {
  return (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/hero/') ||
    /\.(?:css|js|woff2?|webp|avif|png|jpe?g|svg)$/.test(url.pathname)
  );
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Navigations: network-first, fall back to cached /offline page.
  // Do NOT cache the HTML response (see header comment).
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('/offline', { ignoreSearch: true })),
    );
    return;
  }

  // Static: cache-first, populate lazily.
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            const copy = res.clone();
            caches.open(STATIC_CACHE).then((c) => c.put(req, copy)).catch(() => {});
            return res;
          }),
      ),
    );
  }
});
