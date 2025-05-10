const CACHE_NAME = "app-cache-v1";

// Install event: Only cache essential files (optional)
self.addEventListener("install", (event) => {
    self.skipWaiting(); // Activate immediately
});

// Fetch event: Cache all `.html`, `.css`, and `.js` dynamically
self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") return;

    const url = new URL(event.request.url);

    // Cache only .html, .css, .js (including files inside `/static/`)
    if (!url.pathname.match(/\.(html|css|js|png)$/)) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || fetch(event.request).then((fetchResponse) => {
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, fetchResponse.clone()); // Cache dynamically
                    return fetchResponse;
                });
            });
        })
    );
});

// Activate event: Remove old caches
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
});
