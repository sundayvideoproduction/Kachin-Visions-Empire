// Service Worker for PWA
const CACHE_NAME = 'quickchat-v1.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://unpkg.com/@supabase/supabase-js@2',
    'https://img.icons8.com/color/96/000000/chat.png'
];

// Install event
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.log('Cache installation failed:', error);
            })
    );
});

// Activate event
self.addEventListener('activate', event => {
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
    );
});

// Fetch event
self.addEventListener('fetch', event => {
    // Skip Supabase realtime connections
    if (event.request.url.includes('realtime')) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                
                // Clone the request
                const fetchRequest = event.request.clone();
                
                return fetch(fetchRequest).then(response => {
                    // Check if valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    // Clone the response
                    const responseToCache = response.clone();
                    
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    
                    return response;
                });
            })
            .catch(() => {
                // Return offline page or fallback
                if (event.request.headers.get('accept').includes('text/html')) {
                    return caches.match('/index.html');
                }
            })
    );
});

// Handle push notifications
self.addEventListener('push', event => {
    const options = {
        body: event.data ? event.data.text() : 'New message received',
        icon: 'https://img.icons8.com/color/96/000000/chat.png',
        badge: 'https://img.icons8.com/color/96/000000/chat.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        }
    };
    
    event.waitUntil(
        self.registration.showNotification('QuickChat', options)
    );
});

// Handle notification click
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    event.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then(clientList => {
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
});