const CACHE_NAME = "my-site-cache-v1"
const DATA_CACHE_NAME = "data-cache-01"

const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/manifest.json",
    "css/styles.css",
    "/js/idb.js",
    "/js/index.js",
    "/icons/icon-72x72.png",
    "/icons/icon-96x96.png",
    "/icons/icon-128x128.png",
    "/icons/icon-144x144.png",
    "/icons/icon-152x152.png",
    "/icons/icon-192x192.png",
    "/icons/icon-384x384.png",
    "/icons/icon-512x512.png"
]

self.addEventListener("install", function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("Installing cache data to: " + CACHE_NAME)
            return cache.addAll(FILES_TO_CACHE)
        })
    );
    self.skipWaiting();
});

self.addEventListener("activate", function(event) {
    event.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        console.log("Removing previous cache data", key)
                        return caches.delete(key)
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener("fetch", function(event) {
    if (event.request.url.includes("/api/")) {
        event.respondWith(
            caches.open(DATA_CACHE_NAME)
            .then(cache => {
                return fetch(event.request)
                .then(response => {
                    if (response.status === 200){
                        cache.put(event.request.url, response.clone());
                    }
                    return response;
                })
                .catch(err => {
                    return cache.match(event.request);
                });
            })
            .catch(err => console.log(err))
        );
        return;
    }

    event.respondWith(
        fetch(event.request).catch(function() {
            return caches.match(event.request).then(function (response) {
                if (response) {
                    return response;
                } else if (event.request.headers.get("accept").includes("text/html")) {
                    return caches.match("/")
                }
            });
        })
    );
});