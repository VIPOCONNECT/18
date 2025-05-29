/**
 * נגן מוזיקה לרכב - Service Worker
 * שלב 4: תכונות מתקדמות ו-PWA
 */

const CACHE_NAME = 'car-music-player-v1';

// קבצים לשמירה במטמון לשימוש במצב לא מקוון
const assetsToCache = [
  './',
  './index.html',
  './css/styles.css',
  './js/app.js',
  './js/player.js',
  './js/playlists.js',
  './js/theme.js',
  './manifest.json',
  './images/icon-192x192.png',
  './images/icon-512x512.png'
];

// התקנת ה-Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('מטמון נפתח');
        return cache.addAll(assetsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// הפעלת ה-Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => caches.delete(cacheName))
      );
    }).then(() => self.clients.claim())
  );
});

// טיפול בבקשות רשת
self.addEventListener('fetch', event => {
  // תגובה לבקשות API של YouTube יועברו ישירות לרשת
  if (event.request.url.includes('youtube.com') || 
      event.request.url.includes('youtu.be') || 
      event.request.url.includes('googleapis.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // החזרת משאב מהמטמון אם קיים
        if (response) {
          return response;
        }

        // שליחת בקשת רשת אם המשאב לא נמצא במטמון
        return fetch(event.request)
          .then(response => {
            // אם אין תשובה או קוד סטטוס לא תקין, החזר את התשובה כמו שהיא
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // שכפול התשובה (כי גוף התשובה יכול להיקרא רק פעם אחת)
            const responseToCache = response.clone();

            // הוספת התשובה למטמון לשימוש בעתיד
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          });
      }).catch(() => {
        // במקרה של שגיאה ובקשת דף, החזר את דף הבית
        if (event.request.url.includes('.html')) {
          return caches.match('./index.html');
        }
        return new Response('אין חיבור לאינטרנט');
      })
  );
});
