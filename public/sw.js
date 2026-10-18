// Állatmentő Portál - PWA Service Worker (v1.0)
const CACHE_NAME = 'allatmento-v1';

const STATIC_PRECACHE = [
  '/',
  '/manifest.json',
  '/logo.png',
  '/dog.png',
  '/cat.png',
  '/wild.png',
  '/other.png'
];

// Telepítéskor pre-cache alapvető fájlok
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_PRECACHE).catch((err) => {
        console.warn('[SW] Pre-cache figyelmeztetés:', err);
      });
    })
  );
  self.skipWaiting();
});

// Aktiváláskor régi gyorsítótárak törlése
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Hálózati kérések kezelése
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Csak GET kérések kezelése (POST/PUT/DELETE API hívásokat az IndexedDB Queue kezeli)
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // Külső API, Firebase vagy backend kérések kihagyása a cache-ből
  if (
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/upload') ||
    url.pathname.startsWith('/reports') ||
    url.hostname.includes('firebase') ||
    url.hostname.includes('firestore') ||
    url.hostname.includes('onrender.com') ||
    url.hostname.includes('vercel.app') && url.pathname.includes('/api')
  ) {
    return;
  }

  // Navigációs (HTML) kérések: Network-first, offline fallback esetén a cache-ből
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(async () => {
          // Ha nincs hálózat (offline), a cache-ből adjuk vissza a korábban megnyitott oldalt vagy a főoldalt
          const cached = await caches.match(request);
          if (cached) return cached;
          const fallback = await caches.match('/');
          return fallback || new Response('Offline mód: Nincs internetkapcsolat.', {
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          });
        })
    );
    return;
  }

  // Statikus fájlok (JS, CSS, képek, betűtípusok): Stale-While-Revalidate
  if (
    url.pathname.startsWith('/_next/static') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }
});

// PWA Background Sync esemény kezelése (amikor visszatér a térerő)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-reports' || event.tag === 'allatmento-sync') {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'TRIGGER_OFFLINE_SYNC' });
        });
      })
    );
  }
});
