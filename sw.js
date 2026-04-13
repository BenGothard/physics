/**
 * sw.js — Service Worker for offline support and caching
 */

const CACHE_NAME = 'physicsquest-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/main.css',
  '/css/components.css',
  '/css/animations.css',
  '/css/dashboard.css',
  '/css/lesson.css',
  '/css/quiz.css',
  '/css/boss-battle.css',
  '/css/simulation.css',
  '/css/skill-tree.css',
  '/css/achievements.css',
  '/css/responsive.css',
  '/js/router.js',
  '/js/store.js',
  '/js/xp.js',
  '/js/sound.js',
  '/js/utils.js',
  '/js/app.js',
  '/data/courses.json',
  '/data/levels.json',
  '/data/achievements.json',
  '/data/skill-tree.json',
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache).catch(() => {
        console.log('Some resources could not be cached during install');
      });
    })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event — Cache first, network fallback
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip external requests (YouTube, etc.)
  if (event.request.url.includes('youtube.com') || event.request.url.includes('feynmanlectures.caltech.edu')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(event.request)
        .then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache successful responses
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // Offline — return a generic offline page if available
          return new Response('You are offline. Please check your internet connection.', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain',
            }),
          });
        });
    })
  );
});
