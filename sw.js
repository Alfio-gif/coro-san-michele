const CACHE = 'coro-sm-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon.svg'
];

const SYNC_URL = "https://script.google.com/macros/s/AKfycbxLi3Z4XDa1P4ZDRutiuZul48QNJEhWTVlAJlqbyXGUvINANpYr32uV0Qh-pXRiF-YPZw/exec";

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ASSETS))
      .catch(err => console.warn('Install cache error:', err))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE).map(key => caches.delete(key))
    ))
  );
  clients.claim();
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Same-origin app shell: stale-while-revalidate
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(request).then(cached => {
        return fetch(request).then(response => {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(request, copy));
          return response;
        }).catch(() => cached);
      })
    );
    return;
  }

  // Apps Script sync: network-first, fallback to cache
  if (url.href.startsWith(SYNC_URL)) {
    event.respondWith(
      fetch(request).then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open('coro-sm-sync').then(cache => cache.put(request, copy));
        }
        return response;
      }).catch(() => caches.match(request))
    );
    return;
  }

  // Fonts and logo: runtime cache
  if (url.hostname.endsWith('fonts.googleapis.com') ||
      url.hostname.endsWith('gstatic.com') ||
      url.hostname.endsWith('googleusercontent.com')) {
    event.respondWith(
      fetch(request).then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(request, copy));
        }
        return response;
      }).catch(() => caches.match(request))
    );
  }
});
