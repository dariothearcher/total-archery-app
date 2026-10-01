// The web app without internet: every file of this version is kept by the
// browser. A new version is fetched in the background and waits until the
// archer taps "Update" (then the page sends "update").
//
// VERSION and FILES are written by tool/finish_web.py after the build; the
// online demo has no service worker.
const VERSION = '503c26dec59c';
const FILES = [
  "./",
  "assets/AssetManifest.bin",
  "assets/AssetManifest.bin.json",
  "assets/FontManifest.json",
  "assets/NOTICES",
  "assets/assets/fonts/BarlowCondensed-Bold.ttf",
  "assets/assets/fonts/BarlowCondensed-Medium.ttf",
  "assets/assets/fonts/BarlowCondensed-SemiBold.ttf",
  "assets/assets/fonts/LICENSE-Roboto.txt",
  "assets/assets/fonts/OFL-BarlowCondensed.txt",
  "assets/assets/fonts/OFL-SourceSans3.txt",
  "assets/assets/fonts/SourceSans3-Bold.ttf",
  "assets/assets/fonts/SourceSans3-Regular.ttf",
  "assets/assets/fonts/SourceSans3-Semibold.ttf",
  "assets/assets/sounds/whistle_1.wav",
  "assets/assets/sounds/whistle_2.wav",
  "assets/assets/sounds/whistle_3.wav",
  "assets/fonts/MaterialIcons-Regular.otf",
  "assets/fonts/fallback/Roboto-Regular.ttf",
  "assets/packages/cupertino_icons/assets/CupertinoIcons.ttf",
  "assets/packages/material_ui/shaders/ink_sparkle.frag",
  "assets/packages/wakelock_plus/assets/no_sleep.js",
  "assets/shaders/ink_sparkle.frag",
  "assets/shaders/stretch_effect.frag",
  "canvaskit/skwasm.js",
  "canvaskit/skwasm.wasm",
  "drift_worker.js",
  "favicon.png",
  "flutter.js",
  "flutter_bootstrap.js",
  "icons/Icon-192.png",
  "icons/Icon-512.png",
  "icons/Icon-maskable-192.png",
  "icons/Icon-maskable-512.png",
  "index.html",
  "main.dart.mjs",
  "main.dart.wasm",
  "manifest.json",
  "sqlite3.wasm",
  "version.json"
];
const CACHE = 'ta-app-' + VERSION;

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(FILES)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // Only the app's old versions: the files the app keeps (the backup's
    // safety copy) live in another cache.
    for (const key of await caches.keys()) {
      if (key.startsWith('ta-app-') && key !== CACHE) {
        await caches.delete(key);
      }
    }
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  if (event.data === 'update') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  const scope = new URL(self.registration.scope);
  if (request.method !== 'GET' || url.origin !== scope.origin ||
      !url.pathname.startsWith(scope.pathname)) {
    return;
  }
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    // Every page of the app is the same page (the routes are after the #).
    const key = request.mode === 'navigate' ? scope.href : request;
    const kept = await cache.match(key, { ignoreSearch: true });
    if (kept) {
      return kept;
    }
    // Files not kept at install (another browser's engine): kept once used.
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  })());
});
