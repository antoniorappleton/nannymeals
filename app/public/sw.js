const CACHE_NAME = "nannymeal-v9";
const ASSETS = [
  "/",
  "/index.html",
  "/onboarding.html",
  "/dashboard.html",
  "/plan.html",
  "/grocery.html",
  "/feedback.html",
  "/swaps.html",
  "/css/global.css",
  "/assets/styles.css",
  "/manifest.json",
  "/favicon.ico",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Serviceworker: limpando cache antigo", cacheName);
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Ignorar pedidos internos do Firebase (essencial para OAuth Redirect)
  if (event.request.url.includes('/__/auth/')) return;
  
  // Ignorar pedidos que não sejam http ou https (ex: chrome-extension)
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Retornar do cache se encontrado, senão buscar da rede
      return response || fetch(event.request).catch(() => {
        // Fallback para index.html se a navegação falhar (offline)
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    }),
  );
});
