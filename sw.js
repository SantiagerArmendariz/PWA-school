// Service Worker for Portfolio PWA
const CACHE_NAME = "portfolio-pwa-v1.0.0";
const STATIC_CACHE = "portfolio-static-v1.0.0";
const DYNAMIC_CACHE = "portfolio-dynamic-v1.0.0";

// Files to cache immediately
const STATIC_FILES = [
  "/",
  "/index.html",
  "/styles/main.css",
  "/styles/animations.css",
  "/scripts/main.js",
  "/scripts/animations.js",
  "/main.js",
  "/manifest.json",
  "/custom/logo-16x16.png",
  "/custom/logo-32x32.png",
  "/custom/logo-64x64.png",
  "/custom/logo-128x128.png",
  "/custom/logo-192x192.png",
  "/custom/logo-256x256.png",
  "/custom/logo-384x384.png",
  "/custom/logo-512x512.png",
  "/custom/logo-1024x1024.png",
  "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&family=Inter:wght@300;400;500;600&display=swap",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css",
];

// Files to cache dynamically
const DYNAMIC_FILES = [
  "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg",
  "https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg",
  "https://images.pexels.com/photos/326503/pexels-photo-326503.jpeg",
  "https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg",
  "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg",
];

// Install Event
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...");

  event.waitUntil(
    Promise.all([
      // Cache static files
      caches.open(STATIC_CACHE).then((cache) => {
        console.log("Service Worker: Caching static files");
        return cache.addAll(STATIC_FILES);
      }),
      // Cache dynamic files
      caches.open(DYNAMIC_CACHE).then((cache) => {
        console.log("Service Worker: Caching dynamic files");
        return cache.addAll(DYNAMIC_FILES);
      }),
    ]).then(() => {
      console.log("Service Worker: Installation complete");
      return self.skipWaiting();
    })
  );
});

// Activate Event
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activating...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete old caches
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log("Service Worker: Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("Service Worker: Activation complete");
        return self.clients.claim();
      })
  );
});

// Fetch Event
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle different types of requests
  if (request.method === "GET") {
    event.respondWith(handleGetRequest(request));
  } else if (request.method === "POST") {
    event.respondWith(handlePostRequest(request));
  }
});

// Handle GET requests
async function handleGetRequest(request) {
  const url = new URL(request.url);

  // Strategy: Cache First for static assets
  if (isStaticAsset(request)) {
    return cacheFirst(request);
  }

  // Strategy: Network First for HTML pages
  if (request.headers.get("accept")?.includes("text/html")) {
    return networkFirst(request);
  }

  // Strategy: Stale While Revalidate for images
  if (request.headers.get("accept")?.includes("image")) {
    return staleWhileRevalidate(request);
  }

  // Default: Network First
  return networkFirst(request);
}

// Handle POST requests (for contact form)
async function handlePostRequest(request) {
  try {
    // Try to send the request
    const response = await fetch(request);
    return response;
  } catch (error) {
    // If offline, store the request for later sync
    const requestData = await request.clone().json();
    await storeOfflineRequest(requestData);

    // Return a custom response
    return new Response(
      JSON.stringify({
        success: false,
        message: "Mensaje guardado. Se enviará cuando tengas conexión.",
        offline: true,
      }),
      {
        status: 202,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Cache Strategies
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    return getOfflineFallback(request);
  }
}

async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(DYNAMIC_CACHE);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || getOfflineFallback(request);
  }
}

async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);

  const networkResponsePromise = fetch(request)
    .then((networkResponse) => {
      const cache = caches.open(DYNAMIC_CACHE);
      cache.then((c) => c.put(request, networkResponse.clone()));
      return networkResponse;
    })
    .catch(() => cachedResponse);

  return cachedResponse || networkResponsePromise;
}

// Helper Functions
function isStaticAsset(request) {
  const url = new URL(request.url);
  return (
    url.pathname.includes(".css") ||
    url.pathname.includes(".js") ||
    url.pathname.includes(".woff") ||
    url.pathname.includes(".woff2") ||
    url.pathname.includes("fonts.googleapis.com") ||
    url.pathname.includes("cdnjs.cloudflare.com")
  );
}

function getOfflineFallback(request) {
  const url = new URL(request.url);

  // Return offline page for HTML requests
  if (request.headers.get("accept")?.includes("text/html")) {
    return caches.match("/index.html");
  }

  // Return placeholder for images
  if (request.headers.get("accept")?.includes("image")) {
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f0f0f0"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999">Sin conexión</text></svg>',
      { headers: { "Content-Type": "image/svg+xml" } }
    );
  }

  return new Response("Offline", { status: 503 });
}

async function storeOfflineRequest(data) {
  // Store in IndexedDB for later sync
  const dbName = "PortfolioOfflineDB";
  const storeName = "offlineRequests";

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);

      store.add({
        data,
        timestamp: Date.now(),
        synced: false,
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    };

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(storeName)) {
        const store = db.createObjectStore(storeName, {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("timestamp", "timestamp");
        store.createIndex("synced", "synced");
      }
    };
  });
}

// Background Sync
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(syncOfflineRequests());
  }
});

async function syncOfflineRequests() {
  const dbName = "PortfolioOfflineDB";
  const storeName = "offlineRequests";

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const index = store.index("synced");

      index.getAll(false).onsuccess = async (event) => {
        const requests = event.target.result;

        for (const req of requests) {
          try {
            await fetch("/api/contact", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(req.data),
            });

            // Mark as synced
            req.synced = true;
            store.put(req);
          } catch (error) {
            console.error("Failed to sync request:", error);
          }
        }

        resolve();
      };
    };
  });
}

// Push Notifications
self.addEventListener("push", (event) => {
  const options = {
    body: event.data ? event.data.text() : "Nueva actualización disponible",
    icon: "/custom/logo-192x192.png",
    badge: "/custom/logo-192x192.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "Ver",
        icon: "/custom/logo-192x192.png",
      },
      {
        action: "close",
        title: "Cerrar",
        icon: "/custom/logo-192x192.png",
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification("Mi Portafolio Digital", options)
  );
});

// Notification Click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/"));
  }
});

// Periodic Background Sync (if supported)
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "portfolio-sync") {
    event.waitUntil(syncOfflineRequests());
  }
});

console.log("Service Worker: Loaded successfully");
