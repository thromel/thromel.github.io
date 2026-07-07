/*
 * Kill-switch service worker.
 *
 * Earlier versions of this site registered a caching service worker. The
 * current site does not use one, but returning visitors may still have the
 * old worker installed and serving stale cached pages. This worker replaces
 * it, clears every cache, unregisters itself, and reloads open tabs so
 * visitors always get the live site.
 */
self.addEventListener('install', function () {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    (async function () {
      var hadCaches = false;

      try {
        var keys = await caches.keys();
        hadCaches = keys.length > 0;
        await Promise.all(keys.map(function (key) { return caches.delete(key); }));
      } catch (_) {}

      try {
        await self.registration.unregister();
      } catch (_) {}

      if (!hadCaches) {
        return;
      }

      try {
        var clients = await self.clients.matchAll({ type: 'window' });
        clients.forEach(function (client) { client.navigate(client.url); });
      } catch (_) {}
    })()
  );
});
