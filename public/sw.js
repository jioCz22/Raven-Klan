const CACHE = 'raven-v2'; // ← solo sube este número con cada deploy
const ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/css/raven-extras.css',
  '/css/auth.css',
  '/js/script.js',
  '/js/auth.js',
  '/assets/Logo.png',
];

// Instalar: guarda los archivos en caché
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activar: borra cachés viejas automáticamente
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: red primero, si falla usa caché (siempre muestra lo más nuevo)
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(response => {
        // Guarda la versión nueva en caché
        const copy = response.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return response;
      })
      .catch(() => caches.match(e.request)) // sin internet → usa caché
  );
});