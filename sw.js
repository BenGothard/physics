/**
 * sw.js — Service Worker for offline support and caching
 */

const CACHE_NAME = 'physicsquest-v2';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './css/main.css',
  './css/components.css',
  './css/animations.css',
  './css/dashboard.css',
  './css/lesson.css',
  './css/quiz.css',
  './css/boss-battle.css',
  './css/simulation.css',
  './css/skill-tree.css',
  './css/achievements.css',
  './css/responsive.css',
  './js/router.js',
  './js/store.js',
  './js/xp.js',
  './js/sound.js',
  './js/utils.js',
  './js/app.js',
  './js/achievements.js',
  './js/daily-challenge.js',
  './js/streak.js',
  './js/components/nav.js',
  './js/pages/dashboard.js',
  './js/pages/course-list.js',
  './js/pages/course-overview.js',
  './js/pages/lesson.js',
  './js/pages/quiz-page.js',
  './js/pages/profile.js',
  './js/pages/skill-tree.js',
  './js/pages/boss-battle.js',
  './js/pages/sandbox.js',
  './js/pages/challenges.js',
  './js/pages/leaderboard.js',
  './js/pages/settings.js',
  './js/simulations/sim-base.js',
  './js/simulations/projectile.js',
  './js/simulations/pendulum.js',
  './js/simulations/spring.js',
  './data/courses.json',
  './data/levels.json',
  './data/achievements.json',
  './data/skill-tree.json',
  './data/quizzes/mechanics/kinematics.json',
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

  // Only cache same-origin http/https requests — fixes chrome-extension:// errors
  const url = new URL(event.request.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }
  if (url.origin !== self.location.origin) {
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
            cache.put(event.request, responseToCache).catch(() => {});
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
