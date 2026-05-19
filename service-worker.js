const CACHE_NAME = 'som-e-luz-v35';
const ASSETS = [
  './',
  'index.html',
  'css/style.css',
  'js/script.js',
  'manifest.json',
  'img/icon-192.png',
  'img/icon-512.png',
  'img/ambienteexclusivoesofisticado.jpg',
  'img/somprofissionalcomdea.jpg',
  'img/suafestabrilhacomnossapistadeled.jpg'
];

// Instala o Service Worker e guarda os arquivos essenciais
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Ativa e remove caches velhos que estão quebrando o carrossel
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

// Intercepta as requisições com segurança
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      // Se estiver no cache, usa. Se não, busca na rede na hora
      return cachedResponse || fetch(e.request);
    }).catch(() => {
      // Previne travamentos caso a rede falhe e o arquivo não esteja no cache
      if (e.request.mode === 'navigate') {
        return caches.match('index.html');
      }
    })
  );
});
