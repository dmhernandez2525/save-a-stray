import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SaveAStrayApi, createApiClient } from '../lib/api-sdk';

describe('API SDK', () => {
  let api;
  let mockFetch;

  beforeEach(() => {
    mockFetch = vi.fn();
    global.fetch = mockFetch;
    api = new SaveAStrayApi({ baseUrl: 'https://api.test.com', apiKey: 'test-key-123' });
  });

  const mockJsonResponse = (data, status = 200) => ({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
  });

  describe('constructor', () => {
    it('should set base URL with default version', () => {
      const client = new SaveAStrayApi({ baseUrl: 'https://example.com', apiKey: 'key' });
      expect(client).toBeDefined();
    });

    it('should allow custom version', () => {
      const client = new SaveAStrayApi({ baseUrl: 'https://example.com', apiKey: 'key', version: 'v2' });
      expect(client).toBeDefined();
    });
  });

  describe('getAnimals', () => {
    it('should fetch animals list', async () => {
      const response = { data: [{ name: 'Buddy' }], pagination: { total: 1, limit: 20, offset: 0, hasMore: false } };
      mockFetch.mockResolvedValue(mockJsonResponse(response));

      const result = await api.getAnimals();
      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);

      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain('/api/v1/animals');
    });

    it('should pass filter parameters', async () => {
      mockFetch.mockResolvedValue(mockJsonResponse({ data: [], pagination: { total: 0, limit: 20, offset: 0, hasMore: false } }));

      await api.getAnimals({ status: 'available', type: 'dog', limit: 10 });

      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain('status=available');
      expect(url).toContain('type=dog');
      expect(url).toContain('limit=10');
    });

    it('should include API key header', async () => {
      mockFetch.mockResolvedValue(mockJsonResponse({ data: [], pagination: {} }));
      await api.getAnimals();

      const headers = mockFetch.mock.calls[0][1].headers;
      expect(headers['X-API-Key']).toBe('test-key-123');
    });
  });

  describe('getAnimal', () => {
    it('should fetch single animal by ID', async () => {
      mockFetch.mockResolvedValue(mockJsonResponse({ data: { _id: 'abc', name: 'Max' } }));

      const result = await api.getAnimal('abc');
      expect(result.data.name).toBe('Max');

      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain('/animals/abc');
    });
  });

  describe('searchAnimals', () => {
    it('should search with query parameter', async () => {
      mockFetch.mockResolvedValue(mockJsonResponse({ data: [], pagination: {} }));

      await api.searchAnimals('golden retriever');

      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain('q=golden');
    });

    it('should pass pagination with search', async () => {
      mockFetch.mockResolvedValue(mockJsonResponse({ data: [], pagination: {} }));

      await api.searchAnimals('cat', { limit: 5, offset: 10 });

      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain('limit=5');
      expect(url).toContain('offset=10');
    });
  });

  describe('getShelters', () => {
    it('should fetch shelters list', async () => {
      mockFetch.mockResolvedValue(mockJsonResponse({ data: [{ name: 'Happy Paws' }], pagination: { total: 1 } }));

      const result = await api.getShelters();
      expect(result.data).toHaveLength(1);
    });
  });

  describe('getShelter', () => {
    it('should fetch single shelter', async () => {
      mockFetch.mockResolvedValue(mockJsonResponse({ data: { name: 'Happy Paws' } }));

      const result = await api.getShelter('s1');
      expect(result.data.name).toBe('Happy Paws');
    });
  });

  describe('getShelterAnimals', () => {
    it('should fetch animals for a specific shelter', async () => {
      mockFetch.mockResolvedValue(mockJsonResponse({ data: [], pagination: {} }));

      await api.getShelterAnimals('s1', { status: 'available' });

      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain('/shelters/s1/animals');
      expect(url).toContain('status=available');
    });
  });

  describe('getEvents', () => {
    it('should fetch events', async () => {
      mockFetch.mockResolvedValue(mockJsonResponse({ data: [{ title: 'Adoption Day' }], pagination: {} }));

      const result = await api.getEvents();
      expect(result.data).toHaveLength(1);
    });
  });

  describe('getSuccessStories', () => {
    it('should fetch success stories', async () => {
      mockFetch.mockResolvedValue(mockJsonResponse({ data: [{ title: 'Buddy Found Home' }], pagination: {} }));

      const result = await api.getSuccessStories();
      expect(result.data).toHaveLength(1);
    });
  });

  describe('getStats', () => {
    it('should fetch platform stats', async () => {
      mockFetch.mockResolvedValue(mockJsonResponse({ data: { totalAnimals: 500, totalShelters: 25 } }));

      const result = await api.getStats();
      expect(result.data.totalAnimals).toBe(500);
    });
  });

  describe('getDocs', () => {
    it('should fetch API documentation', async () => {
      mockFetch.mockResolvedValue(mockJsonResponse({ openapi: '3.0.3', info: { title: 'Save A Stray API' } }));

      const result = await api.getDocs();
      expect(result.openapi).toBe('3.0.3');
    });
  });

  describe('Error Handling', () => {
    it('should throw Error with status on non-OK response', async () => {
      mockFetch.mockResolvedValue(mockJsonResponse({ error: 'Not found' }, 404));

      await expect(api.getAnimal('invalid')).rejects.toThrow('Not found');
      mockFetch.mockResolvedValue(mockJsonResponse({ error: 'Not found' }, 404));
      try {
        await api.getAnimal('invalid');
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect(err.error).toBe('Not found');
        expect(err.status).toBe(404);
      }
    });

    it('should handle 401 unauthorized', async () => {
      mockFetch.mockResolvedValue(mockJsonResponse({ error: 'Invalid API key' }, 401));

      await expect(api.getAnimals()).rejects.toThrow('Invalid API key');
    });

    it('should handle 429 rate limit', async () => {
      mockFetch.mockResolvedValue(mockJsonResponse({ error: 'Rate limit exceeded' }, 429));

      await expect(api.getAnimals()).rejects.toThrow('Rate limit exceeded');
    });

    it('should increment error count on failure', async () => {
      mockFetch.mockResolvedValue(mockJsonResponse({ error: 'Error' }, 500));

      try { await api.getAnimals(); } catch { /* expected */ }

      const metrics = api.getUsageMetrics();
      expect(metrics.errorCount).toBe(1);
    });
  });

  describe('Usage Metrics', () => {
    it('should track request count', async () => {
      mockFetch.mockResolvedValue(mockJsonResponse({ data: [] }));

      await api.getAnimals();
      await api.getShelters();

      const metrics = api.getUsageMetrics();
      expect(metrics.requestCount).toBe(2);
    });

    it('should track last request timestamp', async () => {
      mockFetch.mockResolvedValue(mockJsonResponse({ data: [] }));

      const before = Date.now();
      await api.getAnimals();
      const metrics = api.getUsageMetrics();

      expect(metrics.lastRequestAt).toBeGreaterThanOrEqual(before);
    });

    it('should calculate avg response time', async () => {
      mockFetch.mockResolvedValue(mockJsonResponse({ data: [] }));

      await api.getAnimals();

      const metrics = api.getUsageMetrics();
      expect(metrics.avgResponseTimeMs).toBeGreaterThanOrEqual(0);
    });

    it('should reset metrics', async () => {
      mockFetch.mockResolvedValue(mockJsonResponse({ data: [] }));
      await api.getAnimals();

      api.resetMetrics();
      const metrics = api.getUsageMetrics();
      expect(metrics.requestCount).toBe(0);
      expect(metrics.errorCount).toBe(0);
    });
  });

  describe('createApiClient', () => {
    it('should create a configured client', () => {
      const client = createApiClient('https://api.test.com', 'my-key');
      expect(client).toBeInstanceOf(SaveAStrayApi);
    });
  });
});
