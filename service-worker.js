var cacheName = 'PWA-share-1';
var filesToCache = [
    '/',
    '/pwaShare/index.html',
    '/pwaShare/end.html',
    '/pwaShare/js/jquery-1.7.2.min.js',
    '/pwaShare/js/jquery.fullPage.min.js',
    '/pwaShare/js/jquery.easings.min.js',
    '/pwaShare/css/jquery.fullPage.css',
    '/pwaShare/css/example.css',
    '/pwaShare/images/appshell.png',
    '/pwaShare/images/cc-good.png',
    '/pwaShare/images/flipkart-1.jpeg',
    '/pwaShare/images/flipkart-2.jpeg',
    '/pwaShare/images/flipkart-3.jpeg',
    '/pwaShare/images/shell.png',
    '/pwaShare/images/slider.png',
    '/pwaShare/images/sw-1.png',
    '/pwaShare/images/sw-2.png',
    '/pwaShare/images/sw-3.png',
    '/pwaShare/images/sw-4.png',
    '/pwaShare/images/sw-5.png',
    '/pwaShare/images/sw-lifecycle.png'
];

self.addEventListener('install',function(e){
    console.log('[ServiceWorker] Install');
    e.waitUntil(
        caches.open(cacheName).then(function(cache){
            console.log('[ServiceWorker] Caching app shell');
            return cache.addAll(filesToCache);
        })
    )
});

self.addEventListener('activate',function(e){
    console.log('[ServiceWorker] Activate');
    e.waitUntil(
        caches.keys().then(function(keyList){
            return Promise.all(keyList.map(function(key){
                console.log(key);
                console.log('[ServiceWorker] Removing old cache', key);
                if(key !== cacheName){
                    return caches.delete(key);
                }
            }))
        })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                var fetchRequest = event.request.clone();

                return fetch(fetchRequest).then(
                    function(response) {
                        // Check if we received a valid response
                        if(!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        var responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(function(cache) {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
    );
});

self.addEventListener('message', function(event) {
    var promise = self.clients.matchAll()
        .then(function(clientList) {
            var senderId = event.source ? event.source.id: 'unknown';
            if (!event.source) {
                console.log('event.source is null; we don\'t know the sender of the ' +
            'message');
            }
            clientList.forEach(function(client) {
                if (client.id === senderId) {
                    return;
                }

                client.postMessage({
                    client: senderId,
                    message: event.data
                })
            })
        })
    if (event.waitUntil) {
        event.waitUntil(promise);
    }
});


self.addEventListener('activate', function(event) {
    event.waitUntil(self.clients.claim());
})
