/* Service worker del editor de TECA (ámbito /office/).
 * Sirve el runtime de LibreOffice WebAssembly desde Cache Storage para no volver a
 * descargarlo en cada apertura. Lo que no está en caché va a la red sin cambios.
 * El llenado y la invalidación por versión los hace /office/runtime-cache.js. */
'use strict';

const CACHE_PREFIX = 'teca-office-runtime-';
const RUNTIME_PATH = '/office/runtime/';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(RUNTIME_PATH)) return;
  if (url.pathname.endsWith('/manifest.json')) return;

  event.respondWith((async () => {
    const names = (await caches.keys()).filter((name) => name.startsWith(CACHE_PREFIX));
    for (const name of names) {
      const cached = await (await caches.open(name)).match(url.pathname);
      if (cached) return cached;
    }
    return fetch(request);
  })());
});
