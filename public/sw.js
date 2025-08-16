// Service Worker for Model D Synthesizer
const CACHE_NAME = "minimoog-v1";
const STATIC_CACHE = "minimoog-static-v1";
const AUDIO_CACHE = "minimoog-audio-v1";

// Files to cache immediately
const STATIC_FILES = [
  "/",
  "/index.html",
  "/images/minimoog-logo.webp",
  "/images/minimoog-icon.png",
  "/images/arrow.svg",
];

// Audio files to cache
const AUDIO_FILES = [
  "/audio/audio-processors/modulation-monitor-processor.js",
  "/audio/audio-processors/overload-meter-processor.js",
  "/audio/moog-filters/huovilainen/huovilainenFilterKernel.wasm",
];

// Install event - cache static files with better error handling
self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(STATIC_FILES).catch((error) => {
          console.warn("Failed to cache some static files:", error);
          // Continue with partial caching
          return Promise.resolve();
        });
      }),
      caches.open(AUDIO_CACHE).then((cache) => {
        return cache.addAll(AUDIO_FILES).catch((error) => {
          console.warn("Failed to cache some audio files:", error);
          // Continue with partial caching
          return Promise.resolve();
        });
      }),
    ]).catch((error) => {
      console.warn(
        "Service worker installation completed with warnings:",
        error
      );
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== AUDIO_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache when possible
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Handle different types of requests
  if (url.pathname.endsWith(".wasm")) {
    // WASM files - cache first, then network
    event.respondWith(handleWasmRequest(request));
  } else if (url.pathname.includes("/audio/")) {
    // Audio files - cache first, then network
    event.respondWith(handleAudioRequest(request));
  } else if (
    url.pathname.includes("/images/") ||
    url.pathname.includes(".css") ||
    url.pathname.includes(".js")
  ) {
    // Static assets - cache first, then network
    event.respondWith(handleStaticRequest(request));
  } else {
    // Other requests - network first, then cache
    event.respondWith(handleNetworkFirstRequest(request));
  }
});

async function handleWasmRequest(request) {
  const cache = await caches.open(AUDIO_CACHE);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // If network fails and we have a cached version, return it
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

async function handleAudioRequest(request) {
  const cache = await caches.open(AUDIO_CACHE);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

async function handleNetworkFirstRequest(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle any background sync operations
  // Background sync completed
}

// Push notification handling
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: "/images/minimoog-icon.png",
      badge: "/images/arrow.svg",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1,
      },
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

// Notification click handling
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(clients.openWindow("/"));
});
