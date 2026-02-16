const CACHE_VERSION = 'sas-v1';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;
const API_CACHE = `api-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/favicon.ico',
  '/android-chrome-192x192.png',
  '/android-chrome-384x384.png',
];

const API_ROUTES = ['/graphql'];
const SYNC_QUEUE = 'sync-queue';
const SYNC_TAG = 'background-sync';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => {
            return (
              key !== STATIC_CACHE &&
              key !== DYNAMIC_CACHE &&
              key !== API_CACHE
            );
          })
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  const isApiRequest = API_ROUTES.some((route) => url.pathname.startsWith(route));

  if (request.method !== 'GET') {
    if (isApiRequest) {
      event.respondWith(handleMutationRequest(request));
    }
    return;
  }

  if (isApiRequest) {
    event.respondWith(networkFirstStrategy(request, API_CACHE));
    return;
  }

  if (request.destination === 'image') {
    event.respondWith(cacheFirstStrategy(request, DYNAMIC_CACHE));
    return;
  }

  const isNavigation = request.mode === 'navigate';
  if (isNavigation) {
    event.respondWith(networkFirstWithOfflineFallback(request));
    return;
  }

  event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
});

async function networkFirstStrategy(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (_err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ errors: [{ message: 'Offline' }] }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function cacheFirstStrategy(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (_err) {
    return new Response('', { status: 408 });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkFetch = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => cached);

  return cached || networkFetch;
}

async function networkFirstWithOfflineFallback(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (_err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    return caches.match('/offline.html');
  }
}

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();
  const options = {
    body: data.body || '',
    icon: '/android-chrome-192x192.png',
    badge: '/favicon-32x32.png',
    data: { url: data.url || '/' },
    actions: data.actions || [],
    tag: data.tag || 'default',
    renotify: Boolean(data.renotify),
  };
  event.waitUntil(self.registration.showNotification(data.title || 'Save A Stray', options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});

async function handleMutationRequest(request) {
  try {
    const response = await fetch(request.clone());
    return response;
  } catch (_err) {
    const body = await request.clone().text();
    await addToSyncQueue({ url: request.url, body, headers: Object.fromEntries(request.headers) });
    if (self.registration.sync) {
      await self.registration.sync.register(SYNC_TAG);
    }
    return new Response(
      JSON.stringify({ data: null, extensions: { offline: true, queued: true } }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function addToSyncQueue(entry) {
  const cache = await caches.open(SYNC_QUEUE);
  const existing = await cache.match('/sync-queue');
  const queue = existing ? await existing.json() : [];
  queue.push({ ...entry, timestamp: Date.now() });
  await cache.put('/sync-queue', new Response(JSON.stringify(queue)));
}

async function getSyncQueue() {
  const cache = await caches.open(SYNC_QUEUE);
  const response = await cache.match('/sync-queue');
  if (!response) return [];
  return response.json();
}

async function clearSyncQueue() {
  const cache = await caches.open(SYNC_QUEUE);
  await cache.delete('/sync-queue');
}

self.addEventListener('sync', (event) => {
  if (event.tag === SYNC_TAG) {
    event.waitUntil(replayQueuedRequests());
  }
});

async function replayQueuedRequests() {
  const queue = await getSyncQueue();
  if (queue.length === 0) return;

  const failed = [];
  for (const entry of queue) {
    try {
      await fetch(entry.url, {
        method: 'POST',
        headers: entry.headers,
        body: entry.body,
      });
    } catch (_err) {
      failed.push(entry);
    }
  }

  if (failed.length > 0) {
    const cache = await caches.open(SYNC_QUEUE);
    await cache.put('/sync-queue', new Response(JSON.stringify(failed)));
  } else {
    await clearSyncQueue();
  }

  const clients = await self.clients.matchAll();
  for (const client of clients) {
    client.postMessage({
      type: 'SYNC_COMPLETE',
      replayed: queue.length - failed.length,
      remaining: failed.length,
    });
  }
}
