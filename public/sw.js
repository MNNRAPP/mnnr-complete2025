const CACHE_NAME = 'mnnr-v1';
const PRECACHE = ['/', '/offline.html', '/manifest.json'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((names) => Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))));
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('/api/')) return;
  if (e.request.url.includes('clerk')) return;
  e.respondWith(
    fetch(e.request).then((r) => {
      if (r.ok) { const c = r.clone(); caches.open(CACHE_NAME).then((cache) => cache.put(e.request, c)); }
      return r;
    }).catch(() => caches.match(e.request).then((r) => r || caches.match('/offline.html')))
  );
});
