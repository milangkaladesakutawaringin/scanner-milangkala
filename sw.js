const CACHE_NAME = "scan-qr-gelang-v6-notif-petugas";

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./vendor/html5-qrcode.min.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-512-maskable.png"
];

// Simpan seluruh kebutuhan utama scanner saat perangkat masih online.
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

// Aktifkan versi cache baru.
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// Untuk file aplikasi satu-origin: gunakan cache jika tersedia,
// sambil memperbarui cache dari jaringan ketika internet tersedia.
self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);

  if (url.origin !== self.location.origin || request.method !== "GET") return;

  event.respondWith(
    caches.match(request).then(cachedResponse => {
      const networkFetch = fetch(request).then(response => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return response;
      }).catch(() => cachedResponse || caches.match("./index.html"));

      return cachedResponse || networkFetch;
    })
  );
});
