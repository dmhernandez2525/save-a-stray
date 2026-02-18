// ── Scaling & Infrastructure Utilities ────────────────────────
// Circuit breakers, caching, monitoring, and capacity planning

// ── Circuit Breaker ──────────────────────────────────────────

export type CircuitState = 'closed' | 'open' | 'half-open';

export interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;    // ms before trying again
  halfOpenRequests: number; // max requests in half-open state
}

const DEFAULT_CIRCUIT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  resetTimeout: 30000,
  halfOpenRequests: 3,
};

export interface CircuitBreakerState {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailure: number;
  totalRequests: number;
  totalFailures: number;
}

export function createCircuitBreaker(
  config: Partial<CircuitBreakerConfig> = {}
): {
  getState: () => CircuitBreakerState;
  recordSuccess: () => void;
  recordFailure: () => void;
  canExecute: () => boolean;
  reset: () => void;
} {
  const cfg = { ...DEFAULT_CIRCUIT_CONFIG, ...config };
  let state: CircuitState = 'closed';
  let failures = 0;
  let successes = 0;
  let lastFailure = 0;
  let totalRequests = 0;
  let totalFailures = 0;
  let halfOpenAttempts = 0;

  function tryReset(): void {
    if (state === 'open' && Date.now() - lastFailure >= cfg.resetTimeout) {
      state = 'half-open';
      halfOpenAttempts = 0;
    }
  }

  return {
    getState() {
      tryReset();
      return { state, failures, successes, lastFailure, totalRequests, totalFailures };
    },
    recordSuccess() {
      totalRequests++;
      successes++;
      if (state === 'half-open') {
        halfOpenAttempts++;
        if (halfOpenAttempts >= cfg.halfOpenRequests) {
          state = 'closed';
          failures = 0;
          halfOpenAttempts = 0;
        }
      } else {
        failures = 0;
      }
    },
    recordFailure() {
      totalRequests++;
      totalFailures++;
      failures++;
      lastFailure = Date.now();
      if (state === 'half-open' || failures >= cfg.failureThreshold) {
        state = 'open';
      }
    },
    canExecute() {
      tryReset();
      if (state === 'closed') return true;
      if (state === 'half-open') return halfOpenAttempts < cfg.halfOpenRequests;
      return false;
    },
    reset() {
      state = 'closed';
      failures = 0;
      successes = 0;
      lastFailure = 0;
      halfOpenAttempts = 0;
    },
  };
}

// ── In-Memory Cache ──────────────────────────────────────────

export interface CacheEntry<T> {
  value: T;
  expiry: number;
  tags: string[];
}

export interface CacheConfig {
  maxEntries: number;
  defaultTtl: number;  // ms
}

export function createCache<T>(config: Partial<CacheConfig> = {}): {
  get: (key: string) => T | null;
  set: (key: string, value: T, ttl?: number, tags?: string[]) => void;
  invalidate: (key: string) => boolean;
  invalidateByTag: (tag: string) => number;
  clear: () => void;
  size: () => number;
  stats: () => { hits: number; misses: number; hitRate: number; size: number };
} {
  const cfg: CacheConfig = { maxEntries: 1000, defaultTtl: 300000, ...config };
  const store = new Map<string, CacheEntry<T>>();
  let hits = 0;
  let misses = 0;

  function evict(): void {
    if (store.size <= cfg.maxEntries) return;
    // Remove expired entries first
    const now = Date.now();
    for (const [key, entry] of store) {
      if (entry.expiry <= now) store.delete(key);
    }
    // If still over limit, remove oldest entries
    while (store.size > cfg.maxEntries) {
      const firstKey = store.keys().next().value as string;
      store.delete(firstKey);
    }
  }

  return {
    get(key: string): T | null {
      const entry = store.get(key);
      if (!entry) { misses++; return null; }
      if (entry.expiry <= Date.now()) {
        store.delete(key);
        misses++;
        return null;
      }
      hits++;
      return entry.value;
    },
    set(key: string, value: T, ttl?: number, tags?: string[]): void {
      store.set(key, {
        value,
        expiry: Date.now() + (ttl || cfg.defaultTtl),
        tags: tags || [],
      });
      evict();
    },
    invalidate(key: string): boolean {
      return store.delete(key);
    },
    invalidateByTag(tag: string): number {
      let count = 0;
      for (const [key, entry] of store) {
        if (entry.tags.includes(tag)) {
          store.delete(key);
          count++;
        }
      }
      return count;
    },
    clear(): void {
      store.clear();
      hits = 0;
      misses = 0;
    },
    size(): number {
      return store.size;
    },
    stats() {
      const total = hits + misses;
      return {
        hits,
        misses,
        hitRate: total > 0 ? Math.round((hits / total) * 100) : 0,
        size: store.size,
      };
    },
  };
}

// ── Rate Limiter ─────────────────────────────────────────────

export interface RateLimiterConfig {
  maxRequests: number;
  windowMs: number;
}

export function createRateLimiter(config: RateLimiterConfig): {
  check: (key: string) => { allowed: boolean; remaining: number; resetAt: number };
  reset: (key: string) => void;
  resetAll: () => void;
} {
  const windows = new Map<string, { count: number; start: number }>();

  return {
    check(key: string) {
      const now = Date.now();
      let entry = windows.get(key);

      if (!entry || now - entry.start >= config.windowMs) {
        entry = { count: 0, start: now };
        windows.set(key, entry);
      }

      entry.count++;
      const allowed = entry.count <= config.maxRequests;
      const remaining = Math.max(0, config.maxRequests - entry.count);
      const resetAt = entry.start + config.windowMs;

      return { allowed, remaining, resetAt };
    },
    reset(key: string) {
      windows.delete(key);
    },
    resetAll() {
      windows.clear();
    },
  };
}

// ── Health Check System ──────────────────────────────────────

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  checks: { name: string; status: 'pass' | 'fail' | 'warn'; latency?: number; message?: string }[];
  timestamp: string;
}

export function createHealthChecker(startTime: number = Date.now()): {
  addCheck: (name: string, checker: () => { status: 'pass' | 'fail' | 'warn'; latency?: number; message?: string }) => void;
  getHealth: () => HealthStatus;
} {
  const checkers: { name: string; checker: () => { status: 'pass' | 'fail' | 'warn'; latency?: number; message?: string } }[] = [];

  return {
    addCheck(name, checker) {
      checkers.push({ name, checker });
    },
    getHealth(): HealthStatus {
      const checks = checkers.map(({ name, checker }) => {
        try {
          return { name, ...checker() };
        } catch {
          return { name, status: 'fail' as const, message: 'Check threw an error' };
        }
      });

      const hasFail = checks.some(c => c.status === 'fail');
      const hasWarn = checks.some(c => c.status === 'warn');

      return {
        status: hasFail ? 'unhealthy' : hasWarn ? 'degraded' : 'healthy',
        uptime: Date.now() - startTime,
        checks,
        timestamp: new Date().toISOString(),
      };
    },
  };
}

// ── Monitoring & Alerts ──────────────────────────────────────

export interface AlertRule {
  id: string;
  name: string;
  metric: string;
  condition: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  threshold: number;
  severity: 'critical' | 'warning' | 'info';
}

export const DEFAULT_ALERT_RULES: AlertRule[] = [
  { id: 'cpu-high', name: 'High CPU Usage', metric: 'cpu_percent', condition: 'gt', threshold: 80, severity: 'warning' },
  { id: 'cpu-critical', name: 'Critical CPU Usage', metric: 'cpu_percent', condition: 'gt', threshold: 95, severity: 'critical' },
  { id: 'memory-high', name: 'High Memory Usage', metric: 'memory_percent', condition: 'gt', threshold: 85, severity: 'warning' },
  { id: 'error-rate', name: 'High Error Rate', metric: 'error_rate', condition: 'gt', threshold: 5, severity: 'warning' },
  { id: 'error-critical', name: 'Critical Error Rate', metric: 'error_rate', condition: 'gt', threshold: 15, severity: 'critical' },
  { id: 'latency-high', name: 'High API Latency', metric: 'p95_latency_ms', condition: 'gt', threshold: 500, severity: 'warning' },
  { id: 'latency-critical', name: 'Critical API Latency', metric: 'p95_latency_ms', condition: 'gt', threshold: 2000, severity: 'critical' },
  { id: 'disk-high', name: 'High Disk Usage', metric: 'disk_percent', condition: 'gt', threshold: 80, severity: 'warning' },
];

export function evaluateAlertRule(rule: AlertRule, value: number): boolean {
  const conditionMap: Record<string, (v: number, t: number) => boolean> = {
    gt: (v, t) => v > t,
    lt: (v, t) => v < t,
    eq: (v, t) => v === t,
    gte: (v, t) => v >= t,
    lte: (v, t) => v <= t,
  };
  return (conditionMap[rule.condition] || (() => false))(value, rule.threshold);
}

export function checkAlerts(
  metrics: Record<string, number>,
  rules: AlertRule[] = DEFAULT_ALERT_RULES
): { rule: AlertRule; value: number; triggered: boolean }[] {
  return rules
    .filter(rule => rule.metric in metrics)
    .map(rule => ({
      rule,
      value: metrics[rule.metric],
      triggered: evaluateAlertRule(rule, metrics[rule.metric]),
    }));
}

// ── Capacity Planning ────────────────────────────────────────

export interface CapacityMetrics {
  currentUsers: number;
  maxConcurrent: number;
  avgRequestsPerUser: number;
  avgResponseTimeMs: number;
  peakMultiplier: number;
}

export function calculateCapacity(metrics: CapacityMetrics): {
  currentLoad: number;
  maxLoad: number;
  headroom: number;
  recommendedInstances: number;
  estimatedMaxUsers: number;
} {
  const requestsPerSecond = (metrics.currentUsers * metrics.avgRequestsPerUser) / 60;
  const peakRps = requestsPerSecond * metrics.peakMultiplier;
  const instanceCapacity = 1000 / metrics.avgResponseTimeMs; // rough requests/sec per instance

  const currentLoad = Math.round((requestsPerSecond / instanceCapacity) * 100);
  const maxLoad = Math.round((peakRps / instanceCapacity) * 100);
  const headroom = Math.max(0, 100 - maxLoad);
  const recommendedInstances = Math.max(1, Math.ceil(peakRps / (instanceCapacity * 0.7))); // 70% target utilization
  const estimatedMaxUsers = Math.floor((instanceCapacity * 60 * 0.7) / metrics.avgRequestsPerUser);

  return { currentLoad, maxLoad, headroom, recommendedInstances, estimatedMaxUsers };
}

// ── Retry with Backoff ───────────────────────────────────────

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  backoffFactor: 2,
};

export function calculateBackoff(attempt: number, config: Partial<RetryConfig> = {}): number {
  const cfg = { ...DEFAULT_RETRY_CONFIG, ...config };
  if (attempt >= cfg.maxRetries) return -1; // no more retries
  const delay = cfg.baseDelay * Math.pow(cfg.backoffFactor, attempt);
  // Add jitter (0-25% of delay)
  const jitter = delay * Math.random() * 0.25;
  return Math.min(delay + jitter, cfg.maxDelay);
}

export function shouldRetry(attempt: number, config: Partial<RetryConfig> = {}): boolean {
  const cfg = { ...DEFAULT_RETRY_CONFIG, ...config };
  return attempt < cfg.maxRetries;
}

// ── Degradation Modes ────────────────────────────────────────

export type DegradationLevel = 'normal' | 'reduced' | 'minimal' | 'read-only' | 'maintenance';

export interface DegradationConfig {
  level: DegradationLevel;
  disabledFeatures: string[];
  message: string;
}

export const DEGRADATION_MODES: Record<DegradationLevel, DegradationConfig> = {
  normal: {
    level: 'normal',
    disabledFeatures: [],
    message: 'All systems operating normally.',
  },
  reduced: {
    level: 'reduced',
    disabledFeatures: ['analytics', 'recommendations', 'notifications'],
    message: 'Some non-essential features are temporarily unavailable.',
  },
  minimal: {
    level: 'minimal',
    disabledFeatures: ['analytics', 'recommendations', 'notifications', 'messaging', 'social-sharing', 'exports'],
    message: 'Running in minimal mode. Core browsing and applications are available.',
  },
  'read-only': {
    level: 'read-only',
    disabledFeatures: ['applications', 'messaging', 'profile-updates', 'analytics', 'recommendations', 'notifications', 'social-sharing', 'exports'],
    message: 'Platform is in read-only mode. You can browse animals but cannot submit applications.',
  },
  maintenance: {
    level: 'maintenance',
    disabledFeatures: ['all'],
    message: 'Platform is undergoing scheduled maintenance. Please check back shortly.',
  },
};

export function getDegradationConfig(level: DegradationLevel): DegradationConfig {
  return DEGRADATION_MODES[level];
}

export function isFeatureEnabled(feature: string, level: DegradationLevel): boolean {
  const config = DEGRADATION_MODES[level];
  if (config.disabledFeatures.includes('all')) return false;
  return !config.disabledFeatures.includes(feature);
}

// ── Database Index Recommendations ───────────────────────────

export interface IndexRecommendation {
  collection: string;
  fields: string[];
  type: 'single' | 'compound' | 'text' | 'geo';
  reason: string;
}

export const INDEX_RECOMMENDATIONS: IndexRecommendation[] = [
  { collection: 'animals', fields: ['species', 'status'], type: 'compound', reason: 'Filter by species and availability status' },
  { collection: 'animals', fields: ['shelter'], type: 'single', reason: 'Lookup animals by shelter' },
  { collection: 'animals', fields: ['name', 'breed', 'description'], type: 'text', reason: 'Full-text search on animal listings' },
  { collection: 'shelters', fields: ['location.coordinates'], type: 'geo', reason: 'Geospatial queries for nearby shelters' },
  { collection: 'applications', fields: ['userId', 'status'], type: 'compound', reason: 'User application lookups' },
  { collection: 'applications', fields: ['animalId', 'status'], type: 'compound', reason: 'Application review by animal' },
  { collection: 'users', fields: ['email'], type: 'single', reason: 'Login and uniqueness checks' },
  { collection: 'auth_sessions', fields: ['userId', 'revokedAt'], type: 'compound', reason: 'Active session lookups' },
  { collection: 'messages', fields: ['recipientId', 'read'], type: 'compound', reason: 'Unread message queries' },
  { collection: 'fosters', fields: ['shelterId', 'status'], type: 'compound', reason: 'Shelter foster management' },
];

export function getIndexRecommendations(collection?: string): IndexRecommendation[] {
  if (!collection) return [...INDEX_RECOMMENDATIONS];
  return INDEX_RECOMMENDATIONS.filter(r => r.collection === collection);
}
