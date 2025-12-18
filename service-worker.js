// Service Worker for KVE Video Platform
const CACHE_NAME = 'kve-video-platform-v5.1';
const STATIC_CACHE = 'static-v5';
const DYNAMIC_CACHE = 'dynamic-v5';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://res.cloudinary.com/zaumaran/image/upload/v1764932924/Kachin_Vision_Empire_For_Logo_zpkdbg.png',
  'https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore-compat.js',
  'https://www.gstatic.com/firebasejs/9.22.1/firebase-storage-compat.js',
  'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Install completed');
        return self.skipWaiting();
      })
      .catch(err => {
        console.error('[Service Worker] Install failed:', err);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE && cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] Activation completed');
      return self.clients.claim();
    })
  );
});

// Fetch event - network first with cache fallback
self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);
  
  // Skip non-GET requests and Firebase/Google APIs
  if (event.request.method !== 'GET' || 
      requestUrl.hostname.includes('firebase') ||
      requestUrl.hostname.includes('googleapis') ||
      requestUrl.hostname.includes('gstatic.com')) {
    return;
  }

  // Handle video requests differently
  if (event.request.url.match(/\.(mp4|webm|avi|mov)$/i)) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        // Return cached video if available
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Otherwise fetch from network
        return fetch(event.request).then(networkResponse => {
          // Cache the video for future use
          return caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        }).catch(() => {
          // Return offline fallback for video
          return new Response(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>Offline</title>
              <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                h1 { color: #ff9900; }
              </style>
            </head>
            <body>
              <h1>Video Not Available Offline</h1>
              <p>This video requires an internet connection to play.</p>
            </body>
            </html>
          `, {
            headers: { 'Content-Type': 'text/html' }
          });
        });
      })
    );
    return;
  }

  // For HTML pages - network first
  if (event.request.headers.get('Accept').includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          // Cache the page
          const responseClone = networkResponse.clone();
          caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(event.request, responseClone);
          });
          return networkResponse;
        })
        .catch(() => {
          // Fallback to cache
          return caches.match(event.request).then(cachedResponse => {
            return cachedResponse || caches.match('/');
          });
        })
    );
    return;
  }

  // For other assets - cache first
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(event.request)
          .then(networkResponse => {
            // Cache dynamic assets
            if (event.request.url.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/i)) {
              const responseClone = networkResponse.clone();
              caches.open(DYNAMIC_CACHE).then(cache => {
                cache.put(event.request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // Return offline image for images
            if (event.request.url.match(/\.(png|jpg|jpeg|gif|svg)$/i)) {
              return caches.match('https://res.cloudinary.com/zaumaran/image/upload/v1764932924/Kachin_Vision_Empire_For_Logo_zpkdbg.png');
            }
            return new Response('Offline', { status: 503 });
          });
      })
  );
});

// Background sync for video preloading
self.addEventListener('sync', event => {
  if (event.tag === 'preload-videos') {
    console.log('[Service Worker] Background sync for video preloading');
    // You can implement background preloading logic here
  }
});

// Push notification handler
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'New content available in K VE!',
    icon: 'https://res.cloudinary.com/zaumaran/image/upload/v1764932924/Kachin_Vision_Empire_For_Logo_zpkdbg.png',
    badge: 'https://res.cloudinary.com/zaumaran/image/upload/v1764932924/Kachin_Vision_Empire_For_Logo_zpkdbg.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 'kve-notification'
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
    self.registration.showNotification('K VE - New Content', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  console.log('[Service Worker] Notification click received.');
  
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else {
    event.waitUntil(
      clients.matchAll({
        type: 'window'
      })
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

// Handle message events from main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});