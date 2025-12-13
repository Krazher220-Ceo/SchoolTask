// Service Worker для PWA
const CACHE_NAME = 'sch1-v1'
const urlsToCache = [
  '/',
  '/sch1',
  '/sch1/dashboard',
  '/sch1/shop',
  '/sch1/ratings',
  '/globals.css',
]

// Установка Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache)
    })
  )
})

// Активация Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// Перехват запросов (Network First стратегия)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Клонируем ответ для кеша
        const responseToCache = response.clone()
        
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache)
        })
        
        return response
      })
      .catch(() => {
        // Если сеть недоступна, используем кеш
        return caches.match(event.request)
      })
  )
})

