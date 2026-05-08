const CACHE_NAME = 'lc-static-v3';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/vite.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Always resolves to a Response. Guarantees event.respondWith() never gets
// `undefined` or a thrown error, which is what produces the cryptic
// "TypeError: Failed to convert value to 'Response'".
async function safeFetch(request, fallbackKey) {
  try {
    const res = await fetch(request);
    if (request.method === 'GET' && res && res.ok && res.type === 'basic') {
      const resClone = res.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(request, resClone)).catch(() => {});
    }
    return res;
  } catch {
    if (fallbackKey) {
      const fallback = await caches.match(fallbackKey);
      if (fallback) return fallback;
    }
    const cached = await caches.match(request);
    if (cached) return cached;
    return Response.error();
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Non-GET (POST/PUT/PATCH/DELETE) must pass through untouched so CORS,
  // auth and form submissions behave normally.
  if (request.method !== 'GET') return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }

  // Don't intercept cross-origin requests (e.g. https://api.libraryconnekto.me).
  if (url.origin !== self.location.origin) return;

  // SPA navigation (e.g. /admin/auth, /student, deep links): network-first,
  // fall back to the cached index.html so React Router can take over offline.
  if (request.mode === 'navigate') {
    event.respondWith(safeFetch(request, '/index.html'));
    return;
  }

  // Same-origin /api/ GET — network-first with cache fallback.
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(safeFetch(request));
    return;
  }

  // Same-origin static GET — stale-while-revalidate, always returns a Response.
  event.respondWith(
    caches.match(request).then((cached) => cached || safeFetch(request))
  );
});
