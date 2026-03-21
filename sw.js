const CACHE_NAME = 'acim-reader-cache-v5';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/lessons.json',
  '/manifest.json',
  '/splash.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png'
];

// Установка Service Worker и кэширование файлов
self.addEventListener('install', event => {
  self.skipWaiting(); // Принудительно устанавливаем новую версию
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Кэш открыт');
        return cache.addAll(urlsToCache);
      })
  );
});

// Активация и удаление старых кэшей
self.addEventListener('activate', event => {
  event.waitUntil(clients.claim()); // Сразу захватываем управление страницами
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Перехват запросов (работа в офлайне)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Возвращаем из кэша, если есть
        if (response) {
          return response;
        }
        // Иначе делаем реальный запрос
        return fetch(event.request);
      })
  );
});
