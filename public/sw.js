const CACHE_NAME = 'lc-static-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/vite.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k))))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  // Network-first for API (don't cache POST/PUT/DELETE requests)
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request).then((res) => {
        // Only cache GET requests for API calls
        if (request.method === 'GET') {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, resClone));
        }
        return res;
      }).catch(() => {
        // Only try to match cached GET requests
        if (request.method === 'GET') {
          return caches.match(request);
        }
        // For non-GET requests, just throw the error
        throw new Error('Network request failed');
      })
    );
    return;
  }
  // Stale-while-revalidate for same-origin GET
  if (request.method === 'GET' && new URL(request.url).origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const net = fetch(request).then((res) => {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, resClone));
          return res;
        }).catch(() => cached);
        return cached || net;
      })
    );
  }
});







