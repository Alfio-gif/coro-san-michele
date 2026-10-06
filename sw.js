self.addEventListener("install", event => {
  event.waitUntil(
    caches.open("coro-cache").then(cache => {
      return cache.addAll([
        "/coro-san-michele/",
        "/coro-san-michele/index.html"
      ]);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
