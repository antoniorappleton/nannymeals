const CACHE_NAME = "nannymeal-v12";
const ASSETS = [
  "./",
  "./index.html",
  "./onboarding.html",
  "./dashboard.html",
  "./plan.html",
  "./grocery.html",
  "./feedback.html",
  "./swaps.html",
  "./css/global.css",
  "./assets/styles.css",
  "./manifest.json",
  "./favicon.ico",
  "./src/firebase-init.js",
  "./src/auth.js",
  "./src/db.js",
  "./src/spoonacular.js",
  "./src/onboarding.js",
  "./src/seed-recipes.js",
  "./src/config.js",
  "./src/config.template.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Serviceworker: Caching assets...");
      // Using a loop instead of addAll to accurately identify which file fails if it does
      return Promise.all(
        ASSETS.map((url) => {
          return cache.add(url).catch((err) => {
            console.warn(`Serviceworker: Failed to cache ${url}:`, err);
          });
        })
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Serviceworker: Cleaning old cache", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Ignore Firebase internal requests (essential for OAuth Redirect)
  if (event.request.url.includes('/__/auth/')) return;
  
  // Ignore non-http(s) requests (e.g., chrome-extension)
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return from cache if found, else fetch from network
      return response || fetch(event.request).then((fetchResponse) => {
        // Optional: Cache newly fetched requests on the fly
        // if (event.request.method === 'GET') {
        //   const responseClone = fetchResponse.clone();
        //   caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
        // }
        return fetchResponse;
      }).catch(() => {
        // Fallback for index.html if navigation fails (offline)
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
