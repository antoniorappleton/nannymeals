const CACHE_NAME = "nannymeal-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/onboarding.html",
  "/plan.html",
  "/grocery.html",
  "/assets/styles.css",
  "/assets/images/hero.webp",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }),
  );
});
