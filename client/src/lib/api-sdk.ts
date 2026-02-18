/**
 * Client SDK for the Save A Stray public REST API v1.
 * Provides typed methods for all API endpoints with pagination support.
 */

export interface ApiConfig {
  baseUrl: string;
  apiKey: string;
  version?: string;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface SingleResponse<T> {
  data: T;
}

export interface ApiError {
  error: string;
  status: number;
}

export interface AnimalFilters extends PaginationParams {
  status?: string;
  type?: string;
  breed?: string;
}

export interface ApiUsageMetrics {
  requestCount: number;
  errorCount: number;
  lastRequestAt: number;
  avgResponseTimeMs: number;
}

export class SaveAStrayApi {
  private baseUrl: string;
  private apiKey: string;
  private metrics: ApiUsageMetrics = {
    requestCount: 0,
    errorCount: 0,
    lastRequestAt: 0,
    avgResponseTimeMs: 0,
  };

  constructor(config: ApiConfig) {
    const version = config.version || 'v1';
    this.baseUrl = `${config.baseUrl}/api/${version}`;
    this.apiKey = config.apiKey;
  }

  private async request<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    const startTime = Date.now();
    this.metrics.requestCount++;
    this.metrics.lastRequestAt = startTime;

    const response = await fetch(url.toString(), {
      headers: {
        'X-API-Key': this.apiKey,
        'Accept': 'application/json',
      },
    });

    const elapsed = Date.now() - startTime;
    this.metrics.avgResponseTimeMs =
      (this.metrics.avgResponseTimeMs * (this.metrics.requestCount - 1) + elapsed) / this.metrics.requestCount;

    if (!response.ok) {
      this.metrics.errorCount++;
      const errorBody = await response.json().catch(() => ({ error: 'Unknown error' }));
      const err = new Error(errorBody.error || `HTTP ${response.status}`) as Error & ApiError;
      err.error = errorBody.error || `HTTP ${response.status}`;
      err.status = response.status;
      throw err;
    }

    return response.json();
  }

  async getAnimals(filters?: AnimalFilters): Promise<PaginatedResponse<Record<string, unknown>>> {
    return this.request('/animals', filters as Record<string, string | number | undefined>);
  }

  async getAnimal(id: string): Promise<SingleResponse<Record<string, unknown>>> {
    return this.request(`/animals/${encodeURIComponent(id)}`);
  }

  async searchAnimals(query: string, pagination?: PaginationParams): Promise<PaginatedResponse<Record<string, unknown>>> {
    return this.request('/animals/search', { q: query, ...pagination });
  }

  async getShelters(pagination?: PaginationParams): Promise<PaginatedResponse<Record<string, unknown>>> {
    return this.request('/shelters', pagination ? { ...pagination } : undefined);
  }

  async getShelter(id: string): Promise<SingleResponse<Record<string, unknown>>> {
    return this.request(`/shelters/${encodeURIComponent(id)}`);
  }

  async getShelterAnimals(shelterId: string, filters?: AnimalFilters): Promise<PaginatedResponse<Record<string, unknown>>> {
    return this.request(`/shelters/${encodeURIComponent(shelterId)}/animals`, filters as Record<string, string | number | undefined>);
  }

  async getEvents(pagination?: PaginationParams): Promise<PaginatedResponse<Record<string, unknown>>> {
    return this.request('/events', pagination ? { ...pagination } : undefined);
  }

  async getSuccessStories(pagination?: PaginationParams): Promise<PaginatedResponse<Record<string, unknown>>> {
    return this.request('/success-stories', pagination ? { ...pagination } : undefined);
  }

  async getStats(): Promise<SingleResponse<Record<string, unknown>>> {
    return this.request('/stats');
  }

  async getDocs(): Promise<Record<string, unknown>> {
    return this.request('/docs');
  }

  getUsageMetrics(): ApiUsageMetrics {
    return { ...this.metrics };
  }

  resetMetrics(): void {
    this.metrics = { requestCount: 0, errorCount: 0, lastRequestAt: 0, avgResponseTimeMs: 0 };
  }
}

/**
 * Create a pre-configured API client.
 */
export function createApiClient(baseUrl: string, apiKey: string): SaveAStrayApi {
  return new SaveAStrayApi({ baseUrl, apiKey });
}
