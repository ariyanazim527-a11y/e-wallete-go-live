// E-wallet Go Service Worker
const CACHE_NAME = 'ewallet-go-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Let browser network handle requests with basic fallback
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
