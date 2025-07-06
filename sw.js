// Portfolio Service Worker - PWA Offline Support
// Version: 1.0.0

const CACHE_NAME = 'romel-portfolio-v1.0.0';
const OFFLINE_URL = '/offline.html';

// Core files to cache immediately (App Shell)
const CORE_CACHE_FILES = [
  '/',
  '/offline.html',
  '/assets/css/developer-theme.css',
  '/assets/css/custom.css', 
  '/assets/js/common.js',
  '/assets/js/theme-toggle.js',
  '/assets/js/search.js',
  '/manifest.json'
];

// Static assets to cache on demand
const STATIC_CACHE_PATTERNS = [
  /\.css$/,
  /\.js$/,
  /\.png$/,
  /\.jpg$/,
  /\.jpeg$/,
  /\.webp$/,
  /\.svg$/,
  /\.woff2?$/,
  /\.ttf$/,
  /\.eot$/
];

// Network-first patterns (dynamic content)
const NETWORK_FIRST_PATTERNS = [
  /\/api\//,
  /\/search/,
  /\.json$/
];

// Install event - Cache core files
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Caching core files');
        return cache.addAll(CORE_CACHE_FILES);
      })
      .then(() => {
        console.log('✅ Core files cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Failed to cache core files:', error);
      })
  );
});

// Activate event - Clean old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - Handle network requests with caching strategies
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);
  
  // Skip cross-origin requests (except for fonts and images)
  if (url.origin !== location.origin && !isStaticAsset(event.request.url)) {
    return;
  }

  event.respondWith(handleFetchRequest(event.request));
});

// Main fetch handling logic
async function handleFetchRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Network-first strategy for dynamic content
    if (shouldUseNetworkFirst(request.url)) {
      return await networkFirstStrategy(request);
    }
    
    // Cache-first strategy for static assets
    if (isStaticAsset(request.url)) {
      return await cacheFirstStrategy(request);
    }
    
    // Stale-while-revalidate for HTML pages
    return await staleWhileRevalidateStrategy(request);
    
  } catch (error) {
    console.error('❌ Fetch failed:', error);
    return handleFetchError(request);
  }
}

// Network-first strategy (dynamic content)
async function networkFirstStrategy(request) {
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
      console.log('📱 Serving from cache (network failed):', request.url);
      return cachedResponse;
    }
    throw error;
  }
}

// Cache-first strategy (static assets)
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    console.log('⚡ Serving from cache:', request.url);
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      console.log('💾 Cached new asset:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('❌ Failed to fetch asset:', request.url);
    throw error;
  }
}

// Stale-while-revalidate strategy (HTML pages)
async function staleWhileRevalidateStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  // Start fetch in background
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        const cache = caches.open(CACHE_NAME);
        cache.then(c => c.put(request, networkResponse.clone()));
      }
      return networkResponse;
    })
    .catch(() => {
      // Network failed, return cached version if available
      return cachedResponse;
    });
  
  // Return cached version immediately if available
  if (cachedResponse) {
    console.log('📄 Serving cached page:', request.url);
    return cachedResponse;
  }
  
  // No cache, wait for network
  return fetchPromise;
}

// Handle fetch errors with offline fallbacks
async function handleFetchError(request) {
  // For navigation requests, show offline page
  if (request.mode === 'navigate') {
    const offlineResponse = await caches.match(OFFLINE_URL);
    if (offlineResponse) {
      return offlineResponse;
    }
  }
  
  // For other requests, return a basic response
  return new Response('Offline - Content not available', {
    status: 503,
    statusText: 'Service Unavailable',
    headers: { 'Content-Type': 'text/plain' }
  });
}

// Utility functions
function isStaticAsset(url) {
  return STATIC_CACHE_PATTERNS.some(pattern => pattern.test(url));
}

function shouldUseNetworkFirst(url) {
  return NETWORK_FIRST_PATTERNS.some(pattern => pattern.test(url));
}

// Handle background sync for improved performance
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('🔄 Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Update cache with latest content when back online
  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(CORE_CACHE_FILES);
    console.log('✅ Background sync completed');
  } catch (error) {
    console.error('❌ Background sync failed:', error);
  }
}

// Handle push notifications (for future implementation)
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const options = {
    body: event.data.text(),
    icon: '/assets/images/icons/manifest-icon-192.png',
    badge: '/assets/images/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Portfolio',
        icon: '/assets/images/icons/action-explore.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/assets/images/icons/action-close.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Portfolio Update', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Performance monitoring
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_STATS') {
    getCacheStats().then(stats => {
      event.ports[0].postMessage(stats);
    });
  }
});

async function getCacheStats() {
  const cache = await caches.open(CACHE_NAME);
  const cachedRequests = await cache.keys();
  
  return {
    cacheSize: cachedRequests.length,
    cacheName: CACHE_NAME,
    cachedUrls: cachedRequests.map(req => req.url)
  };
}