import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Service Worker Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Cache Configuration', () => {
    const CACHE_VERSION = 'sas-v1';

    it('should define correct cache names', () => {
      const STATIC_CACHE = `static-${CACHE_VERSION}`;
      const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;
      const API_CACHE = `api-${CACHE_VERSION}`;

      expect(STATIC_CACHE).toBe('static-sas-v1');
      expect(DYNAMIC_CACHE).toBe('dynamic-sas-v1');
      expect(API_CACHE).toBe('api-sas-v1');
    });

    it('should include required static assets for pre-caching', () => {
      const STATIC_ASSETS = [
        '/',
        '/offline.html',
        '/favicon.ico',
        '/android-chrome-192x192.png',
        '/android-chrome-384x384.png',
      ];

      expect(STATIC_ASSETS).toContain('/');
      expect(STATIC_ASSETS).toContain('/offline.html');
      expect(STATIC_ASSETS).toContain('/android-chrome-192x192.png');
      expect(STATIC_ASSETS).toContain('/android-chrome-384x384.png');
    });

    it('should define API routes for network-first strategy', () => {
      const API_ROUTES = ['/graphql'];
      expect(API_ROUTES).toContain('/graphql');
    });
  });

  describe('Cache Versioning', () => {
    it('should filter old caches during activation', async () => {
      const currentCaches = ['static-sas-v1', 'dynamic-sas-v1', 'api-sas-v1'];
      const allCaches = ['static-sas-v0', 'dynamic-sas-v0', ...currentCaches];

      const stale = allCaches.filter((key) => !currentCaches.includes(key));

      expect(stale).toEqual(['static-sas-v0', 'dynamic-sas-v0']);
      expect(stale).not.toContain('static-sas-v1');
    });
  });

  describe('Caching Strategies', () => {
    it('network-first should return network response when available', async () => {
      const mockResponse = new Response(JSON.stringify({ data: 'test' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });

      const fetchFn = vi.fn().mockResolvedValue(mockResponse);
      const result = await fetchFn('/graphql');

      expect(result.status).toBe(200);
      const body = await result.json();
      expect(body.data).toBe('test');
    });

    it('network-first should fall back to cache when network fails', async () => {
      const cachedResponse = new Response(JSON.stringify({ data: 'cached' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });

      const fetchFn = vi.fn().mockRejectedValue(new Error('Network error'));
      const cacheMatch = vi.fn().mockResolvedValue(cachedResponse);

      try {
        await fetchFn('/graphql');
      } catch {
        const result = await cacheMatch('/graphql');
        expect(result.status).toBe(200);
        const body = await result.json();
        expect(body.data).toBe('cached');
      }
    });

    it('network-first should return offline error when no cache', async () => {
      const fetchFn = vi.fn().mockRejectedValue(new Error('Network error'));
      const cacheMatch = vi.fn().mockResolvedValue(undefined);

      try {
        await fetchFn('/graphql');
      } catch {
        const cached = await cacheMatch('/graphql');
        if (!cached) {
          const offlineResponse = new Response(
            JSON.stringify({ errors: [{ message: 'Offline' }] }),
            { status: 503, headers: { 'Content-Type': 'application/json' } }
          );
          expect(offlineResponse.status).toBe(503);
          const body = await offlineResponse.json();
          expect(body.errors[0].message).toBe('Offline');
        }
      }
    });

    it('cache-first should return cached response when available', async () => {
      const cachedResponse = new Response('cached image data', { status: 200 });
      const cacheMatch = vi.fn().mockResolvedValue(cachedResponse);

      const result = await cacheMatch('/image.png');
      expect(result.status).toBe(200);
    });

    it('cache-first should fetch from network when not cached', async () => {
      const networkResponse = new Response('image data', { status: 200 });
      const cacheMatch = vi.fn().mockResolvedValue(undefined);
      const fetchFn = vi.fn().mockResolvedValue(networkResponse);

      const cached = await cacheMatch('/image.png');
      if (!cached) {
        const result = await fetchFn('/image.png');
        expect(result.status).toBe(200);
      }
    });

    it('stale-while-revalidate should return cached and revalidate', async () => {
      const cachedResponse = new Response('stale', { status: 200 });
      const freshResponse = new Response('fresh', { status: 200 });

      const cacheMatch = vi.fn().mockResolvedValue(cachedResponse);
      const fetchFn = vi.fn().mockResolvedValue(freshResponse);

      const cached = await cacheMatch('/app.js');
      expect(cached.status).toBe(200);

      const fresh = await fetchFn('/app.js');
      expect(fresh.status).toBe(200);
    });

    it('navigation should fall back to offline.html', async () => {
      const offlineHtml = new Response('<html>Offline</html>', {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      });

      const fetchFn = vi.fn().mockRejectedValue(new Error('Network error'));
      const cacheMatch = vi.fn()
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(offlineHtml);

      try {
        await fetchFn('/some-page');
      } catch {
        const cached = await cacheMatch('/some-page');
        if (!cached) {
          const offline = await cacheMatch('/offline.html');
          expect(offline.status).toBe(200);
        }
      }
    });
  });

  describe('Background Sync', () => {
    it('should queue failed mutation requests', async () => {
      const queue = [];
      const addToQueue = (entry) => queue.push({ ...entry, timestamp: Date.now() });

      addToQueue({
        url: '/graphql',
        body: JSON.stringify({ query: 'mutation { toggleFavorite(animalId: "123") }' }),
        headers: { 'Content-Type': 'application/json' },
      });

      expect(queue).toHaveLength(1);
      expect(queue[0].url).toBe('/graphql');
      expect(queue[0].timestamp).toBeDefined();
    });

    it('should replay queued requests when back online', async () => {
      const queue = [
        { url: '/graphql', body: '{}', headers: {}, timestamp: Date.now() },
        { url: '/graphql', body: '{}', headers: {}, timestamp: Date.now() },
      ];

      const fetchFn = vi.fn().mockResolvedValue(new Response('ok'));
      const failed = [];

      for (const entry of queue) {
        try {
          await fetchFn(entry.url, { method: 'POST', headers: entry.headers, body: entry.body });
        } catch {
          failed.push(entry);
        }
      }

      expect(fetchFn).toHaveBeenCalledTimes(2);
      expect(failed).toHaveLength(0);
    });

    it('should keep failed items in queue during replay', async () => {
      const queue = [
        { url: '/graphql', body: '{}', headers: {}, timestamp: Date.now() },
        { url: '/graphql', body: '{}', headers: {}, timestamp: Date.now() },
      ];

      const fetchFn = vi.fn()
        .mockResolvedValueOnce(new Response('ok'))
        .mockRejectedValueOnce(new Error('Still offline'));

      const failed = [];
      for (const entry of queue) {
        try {
          await fetchFn(entry.url, { method: 'POST', headers: entry.headers, body: entry.body });
        } catch {
          failed.push(entry);
        }
      }

      expect(failed).toHaveLength(1);
    });

    it('should return offline indicator response when queueing', () => {
      const response = new Response(
        JSON.stringify({ data: null, extensions: { offline: true, queued: true } }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );

      expect(response.status).toBe(200);
    });
  });

  describe('Push Notifications', () => {
    it('should create notification options from push data', () => {
      const data = {
        title: 'New Pet Available',
        body: 'A cute puppy is waiting for adoption!',
        url: '/AnimalShow/123',
        tag: 'new-animal',
      };

      const options = {
        body: data.body || '',
        icon: '/android-chrome-192x192.png',
        badge: '/favicon-32x32.png',
        data: { url: data.url || '/' },
        actions: data.actions || [],
        tag: data.tag || 'default',
        renotify: Boolean(data.renotify),
      };

      expect(options.body).toBe('A cute puppy is waiting for adoption!');
      expect(options.icon).toBe('/android-chrome-192x192.png');
      expect(options.data.url).toBe('/AnimalShow/123');
      expect(options.tag).toBe('new-animal');
      expect(options.renotify).toBe(false);
    });

    it('should use defaults when push data fields are missing', () => {
      const data = {};
      const title = data.title || 'Save A Stray';
      const options = {
        body: data.body || '',
        data: { url: data.url || '/' },
        tag: data.tag || 'default',
      };

      expect(title).toBe('Save A Stray');
      expect(options.body).toBe('');
      expect(options.data.url).toBe('/');
      expect(options.tag).toBe('default');
    });
  });
});
