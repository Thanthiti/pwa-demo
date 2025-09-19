const CACHE_VERSION = "v1"; // เปลี่ยนเป็น v2, v3... ทุกครั้งที่แก้ไข
const CACHE_NAME = `pwa-demo-cache-${CACHE_VERSION}`;
const FILES_TO_CACHE = ["/", "/index.html", "/app.js", "/style.css"];

self.addEventListener("install", (event) => {
  self.skipWaiting(); // ใช้ service worker ใหม่ทันที
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
});


self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim(); // SW ใหม่คุมทุก client ทันที
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResp) => {
      return cachedResp || fetch(event.request);
    })
  );
});
