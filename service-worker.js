const CACHE_NAME = 'som-e-luz-v3';
const ASSETS = [
  './',
  './index.html',
  './css/estilo.css',
  './javascript/script.js',
  './manifest.json',
  './img/icon-192.png',
  './img/icon-512.png',
  './img/ambienteexclusivoesofisticado.jpg',
  './img/somprofissionalcomdea.jpg',
  './img/suafestabrilhacomnossapistadeled.jpg'
];

// Instala o Service Worker e guarda os arquivos essenciais no cache
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
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
    })
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