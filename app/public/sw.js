// Service Worker Neutralizado para v21 - Estabilização Urgente
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(names.map((name) => caches.delete(name)));
    })
  );
  self.clients.claim();
});
self.addEventListener("fetch", (event) => {
  // Pass-through total: não intercepta nada
  return;
});
