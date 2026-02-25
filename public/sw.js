const CACHE_NAME = 'bodipo-pwa-cache-v2';

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            // Basic cache array
            return cache.addAll([
                '/',
                '/index.html',
                '/logo-n.png',
                '/src/index.css'
            ]);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Solo aplicamos caché para métodos GET
    if (event.request.method !== 'GET') {
        return;
    }

    // Sincronización optimizada y ligera de llamadas a la API
    if (event.request.url.includes('/api/')) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Opcional: Clonar y cachear si necesitamos persistencia offline
                    return response;
                })
                .catch(() => {
                    // Fallback en caso de que la red falle para optimizar la fluidez
                    return caches.match(event.request);
                })
        );
        return;
    }

    // Network First, fallback a Cache para recursos estáticos
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});

self.addEventListener('push', (event) => {
    if (event.data) {
        try {
            const data = event.data.json();
            const options = {
                body: data.body,
                icon: data.icon || '/logo-n.png',
                badge: '/logo-n.png',
                vibrate: [100, 50, 100],
                data: {
                    url: data.url || '/'
                }
            };
            event.waitUntil(
                self.registration.showNotification(data.title || 'Bodipo Business', options)
            );
        } catch (e) {
            console.error('Error procesando push:', e);
        }
    }
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});
