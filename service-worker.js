// Service Worker for K VE Video Platform
const CACHE_NAME = 'kve-video-platform-v2.0';
const APP_VERSION = '2.0.0';

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  'icon-192.png',
  'icon-512.png'
];

// Firebase CDN URLs to cache
const FIREBASE_ASSETS = [
  'https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore-compat.js',
  'https://www.gstatic.com/firebasejs/9.22.1/firebase-storage-compat.js',
  'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// External assets to cache
const EXTERNAL_ASSETS = [
  'https://res.cloudinary.com/zaumaran/image/upload/v1764932924/Kachin_Vision_Empire_For_Logo_zpkdbg.png'
];

// Install event - cache assets
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching app assets...');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log('Service Worker installed');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Cache installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      console.log('Service Worker activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - network first, then cache
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle different types of requests
  if (url.origin === self.location.origin) {
    // Local assets - cache first
    event.respondWith(
      caches.match(request)
        .then(response => {
          if (response) {
            return response;
          }
          
          return fetch(request)
            .then(response => {
              // Don't cache if not a success response
              if (!response || response.status !== 200) {
                return response;
              }
              
              // Clone the response
              const responseToCache = response.clone();
              
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(request, responseToCache);
                });
              
              return response;
            })
            .catch(() => {
              // If fetch fails, return offline page
              return caches.match('/index.html');
            });
        })
    );
  } else if (
    url.href.includes('firebase') || 
    url.href.includes('cdnjs.cloudflare.com') ||
    url.href.includes('res.cloudinary.com')
  ) {
    // External assets - cache first, network fallback
    event.respondWith(
      caches.match(request)
        .then(response => {
          if (response) {
            return response;
          }
          
          return fetch(request)
            .then(response => {
              if (!response || response.status !== 200) {
                return response;
              }
              
              const responseToCache = response.clone();
              
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(request, responseToCache);
                });
              
              return response;
            });
        })
    );
  } else if (request.url.match(/\.(mp4|webm|ogg)$/)) {
    // Video files - network first, cache fallback
    event.respondWith(
      fetch(request)
        .then(response => {
          if (!response || response.status !== 200) {
            throw new Error('Network response was not ok');
          }
          
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME + '-videos')
            .then(cache => {
              cache.put(request, responseToCache);
            });
          
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
  } else {
    // Default - network first
    event.respondWith(
      fetch(request)
        .catch(() => {
          return caches.match('/index.html');
        })
    );
  }
});

// Background sync for video preloading
self.addEventListener('sync', event => {
  if (event.tag === 'preload-videos') {
    console.log('Background sync for video preloading');
    event.waitUntil(preloadVideosInBackground());
  }
});

async function preloadVideosInBackground() {
  try {
    const cache = await caches.open(CACHE_NAME + '-videos');
    // You can implement background preloading logic here
    console.log('Background video preloading started');
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Push notifications
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  
  const options = {
    body: data.body || 'New content available in K VE',
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'open',
        title: 'Open App'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'K VE Video Platform', options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.matchAll({ type: 'window' })
        .then(clientList => {
          for (const client of clientList) {
            if (client.url === '/' && 'focus' in client) {
              return client.focus();
            }
          }
          if (clients.openWindow) {
            return clients.openWindow('/');
          }
        })
    );
  }
});

// Periodic background sync (if supported)
if ('periodicSync' in self.registration) {
  self.addEventListener('periodicsync', event => {
    if (event.tag === 'update-content') {
      event.waitUntil(updateContentInBackground());
    }
  });
}

async function updateContentInBackground() {
  try {
    console.log('Periodic background sync for content update');
    // Fetch new data from Firebase
    // Cache updated content
  } catch (error) {
    console.error('Periodic sync failed:', error);
  }
}

// Message handling for updates
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_VIDEO') {
    const videoData = event.data.video;
    cacheVideoInBackground(videoData);
  }
});

async function cacheVideoInBackground(videoData) {
  try {
    const cache = await caches.open(CACHE_NAME + '-videos');
    const response = await fetch(videoData.url);
    await cache.put(videoData.url, response);
    
    console.log('Video cached in background:', videoData.name);
    
    // Send message back to client
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'VIDEO_CACHED',
        videoId: videoData.id
      });
    });
  } catch (error) {
    console.error('Background video caching failed:', error);
  }
}