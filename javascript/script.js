const CACHE_NAME = 'som-e-luz-v30';
const ASSETS = [
  '/Som-e-Luz/',
  '/Som-e-Luz/index.html',
  '/Som-e-Luz/css/style.css',
  '/Som-e-Luz/js/script.js',
  '/Som-e-Luz/manifest.json',
  '/Som-e-Luz/img/icon-192.png',
  '/Som-e-Luz/img/icon-512.png',
  '/Som-e-Luz/img/ambienteexclusivoesofisticado.jpg',
  '/Som-e-Luz/img/somprofissionalcomdea.jpg',
  '/Som-e-Luz/img/suafestabrilhacomnossapistadeled.jpg'
];

// Instala o Service Worker e guarda os arquivos essenciais no cache
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Ativa e limpa caches antigos se houver atualização
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Serve os arquivos direto do cache quando estiver offline
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    })
  );
});
