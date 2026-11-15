// Caché persistente del runtime de LibreOffice WebAssembly (~260 MB).
//
// Los navegadores no guardan de forma fiable ficheros tan grandes en su caché HTTP
// (Chrome descarta entradas mayores que una fracción de su caché), así que sin esto
// cada apertura del editor vuelve a descargar el runtime completo. Aquí se guarda en
// Cache Storage (cuota mucho mayor y persistente) y el service worker /office/sw.js
// lo sirve desde ahí. La versión la marca runtime/manifest.json, que genera
// `npm run office:runtime` / `npm run office:manifest`.

export const CACHE_PREFIX = 'teca-office-runtime-';
export const RUNTIME_PATH = '/office/runtime/';
const DEFAULT_FILES = ['soffice.js', 'soffice.wasm', 'soffice.data', 'soffice.data.js.metadata'];
const CONTENT_TYPES = {
  js: 'text/javascript',
  wasm: 'application/wasm',
  data: 'application/octet-stream',
  metadata: 'application/octet-stream',
};

export function isSupported() {
  return typeof window !== 'undefined' && window.isSecureContext && 'caches' in window && 'serviceWorker' in navigator;
}

async function readManifest() {
  try {
    const response = await fetch(`${RUNTIME_PATH}manifest.json`, { cache: 'no-store' });
    if (response.ok) {
      const manifest = await response.json();
      if (manifest?.version && Array.isArray(manifest.files)) return manifest;
    }
  } catch {
    // Sin manifiesto se usa una versión fija; basta con regenerarlo para invalidar.
  }
  return { version: 'unversioned', files: DEFAULT_FILES.map((name) => ({ name, size: 0 })) };
}

function contentTypeFor(name) {
  return CONTENT_TYPES[name.split('.').pop()] || 'application/octet-stream';
}

async function removeOldCaches(currentName) {
  const names = await caches.keys();
  await Promise.all(names.filter((name) => name.startsWith(CACHE_PREFIX) && name !== currentName).map((name) => caches.delete(name)));
}

export async function registerServiceWorker() {
  if (!isSupported()) return null;
  return navigator.serviceWorker.register('/office/sw.js', { scope: '/office/' });
}

/**
 * Comprueba si el runtime de la versión publicada ya está entero en este navegador.
 */
export async function isRuntimeCached() {
  if (!isSupported()) return false;
  const manifest = await readManifest();
  const cache = await caches.open(CACHE_PREFIX + manifest.version);
  const hits = await Promise.all(manifest.files.map((file) => cache.match(RUNTIME_PATH + file.name)));
  return hits.every(Boolean);
}

/**
 * Descarga a Cache Storage los ficheros que falten. Llama a onProgress({ loaded, total })
 * mientras descarga. Si ya está todo en caché, termina sin tocar la red (salvo el manifiesto).
 */
export async function ensureRuntimeCached(options = {}) {
  if (!isSupported()) throw new Error('Este navegador no permite guardar el editor en caché');
  // Una sola descarga a la vez entre pestañas (precarga en segundo plano + editor).
  if (navigator.locks?.request) {
    return navigator.locks.request('teca-office-runtime-download', () => fillCache(options));
  }
  return fillCache(options);
}

async function fillCache({ onProgress, signal } = {}) {
  const manifest = await readManifest();
  const cacheName = CACHE_PREFIX + manifest.version;
  const cache = await caches.open(cacheName);
  await removeOldCaches(cacheName);

  const missing = [];
  for (const file of manifest.files) {
    if (!(await cache.match(RUNTIME_PATH + file.name))) missing.push(file);
  }
  if (!missing.length) return { downloaded: false, version: manifest.version };

  try { await navigator.storage?.persist?.(); } catch { /* opcional */ }

  const total = missing.reduce((sum, file) => sum + (file.size || 0), 0);
  let loaded = 0;
  onProgress?.({ loaded, total });

  for (const file of missing) {
    const url = RUNTIME_PATH + file.name;
    const response = await fetch(url, { cache: 'no-store', signal });
    if (!response.ok || !response.body) throw new Error(`No se pudo descargar ${file.name} (HTTP ${response.status})`);
    const counted = response.body.pipeThrough(new TransformStream({
      transform(chunk, controller) {
        loaded += chunk.byteLength;
        onProgress?.({ loaded, total });
        controller.enqueue(chunk);
      },
    }));
    // Cabeceras limpias: el cuerpo ya viene descomprimido, así que no se conserva
    // Content-Encoding/Content-Length del servidor.
    await cache.put(url, new Response(counted, {
      status: 200,
      headers: { 'Content-Type': contentTypeFor(file.name), 'X-Teca-Runtime-Version': manifest.version },
    }));
  }
  return { downloaded: true, version: manifest.version };
}

/**
 * Precarga en segundo plano tras iniciar sesión, para que el editor abra al momento.
 * No lo hace en móviles ni con ahorro de datos o conexiones lentas.
 */
export async function warmRuntimeInBackground() {
  if (!isSupported()) return;
  const connection = navigator.connection;
  if (connection?.saveData || ['slow-2g', '2g', '3g'].includes(connection?.effectiveType) || connection?.type === 'cellular') return;
  if (window.matchMedia?.('(max-width: 767px)').matches) return;
  await registerServiceWorker();
  if (await isRuntimeCached()) return;
  await ensureRuntimeCached();
}
