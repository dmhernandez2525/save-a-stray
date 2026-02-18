import { describe, it, expect } from 'vitest';
import {
  createCircuitBreaker,
  createCache,
  createRateLimiter,
  createHealthChecker,
  DEFAULT_ALERT_RULES, evaluateAlertRule, checkAlerts,
  calculateCapacity,
  calculateBackoff, shouldRetry,
  DEGRADATION_MODES, getDegradationConfig, isFeatureEnabled,
  INDEX_RECOMMENDATIONS, getIndexRecommendations,
} from '../lib/scaling-infra';

describe('Scaling Infrastructure', () => {

  describe('Circuit Breaker', () => {
    it('should start in closed state', () => {
      const cb = createCircuitBreaker();
      expect(cb.getState().state).toBe('closed');
    });

    it('should allow execution when closed', () => {
      const cb = createCircuitBreaker();
      expect(cb.canExecute()).toBe(true);
    });

    it('should open after failure threshold', () => {
      const cb = createCircuitBreaker({ failureThreshold: 3 });
      cb.recordFailure();
      cb.recordFailure();
      cb.recordFailure();
      expect(cb.getState().state).toBe('open');
      expect(cb.canExecute()).toBe(false);
    });

    it('should reset failure count on success', () => {
      const cb = createCircuitBreaker({ failureThreshold: 3 });
      cb.recordFailure();
      cb.recordFailure();
      cb.recordSuccess();
      expect(cb.getState().state).toBe('closed');
      expect(cb.getState().failures).toBe(0);
    });

    it('should track total requests and failures', () => {
      const cb = createCircuitBreaker();
      cb.recordSuccess();
      cb.recordSuccess();
      cb.recordFailure();
      const state = cb.getState();
      expect(state.totalRequests).toBe(3);
      expect(state.totalFailures).toBe(1);
    });

    it('should reset state', () => {
      const cb = createCircuitBreaker({ failureThreshold: 2 });
      cb.recordFailure();
      cb.recordFailure();
      cb.reset();
      expect(cb.getState().state).toBe('closed');
      expect(cb.canExecute()).toBe(true);
    });

    it('should transition to half-open after timeout', () => {
      const cb = createCircuitBreaker({ failureThreshold: 1, resetTimeout: 0 });
      cb.recordFailure();
      // With resetTimeout=0, getState triggers tryReset immediately
      // so the first getState already transitions to half-open
      const state = cb.getState();
      expect(state.state).toBe('half-open');
    });

    it('should close from half-open after enough successes', () => {
      const cb = createCircuitBreaker({ failureThreshold: 1, resetTimeout: 0, halfOpenRequests: 2 });
      cb.recordFailure();
      // Now half-open after timeout
      cb.getState(); // trigger tryReset
      cb.recordSuccess();
      cb.recordSuccess();
      expect(cb.getState().state).toBe('closed');
    });
  });

  describe('Cache', () => {
    it('should store and retrieve values', () => {
      const cache = createCache();
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    it('should return null for missing keys', () => {
      const cache = createCache();
      expect(cache.get('missing')).toBeNull();
    });

    it('should expire entries', () => {
      const cache = createCache({ defaultTtl: 0 });
      cache.set('key1', 'value1');
      // TTL of 0ms means it expires immediately
      expect(cache.get('key1')).toBeNull();
    });

    it('should use custom TTL', () => {
      const cache = createCache();
      cache.set('key1', 'value1', 100000); // 100s TTL
      expect(cache.get('key1')).toBe('value1');
    });

    it('should invalidate by key', () => {
      const cache = createCache();
      cache.set('key1', 'value1');
      expect(cache.invalidate('key1')).toBe(true);
      expect(cache.get('key1')).toBeNull();
    });

    it('should invalidate by tag', () => {
      const cache = createCache();
      cache.set('animal-1', 'data1', undefined, ['animals']);
      cache.set('animal-2', 'data2', undefined, ['animals']);
      cache.set('shelter-1', 'data3', undefined, ['shelters']);
      const removed = cache.invalidateByTag('animals');
      expect(removed).toBe(2);
      expect(cache.get('shelter-1')).toBe('data3');
    });

    it('should track hit/miss stats', () => {
      const cache = createCache();
      cache.set('key1', 'value1');
      cache.get('key1'); // hit
      cache.get('missing'); // miss
      const stats = cache.stats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBe(50);
    });

    it('should clear all entries', () => {
      const cache = createCache();
      cache.set('a', 1);
      cache.set('b', 2);
      cache.clear();
      expect(cache.size()).toBe(0);
    });

    it('should evict entries when over max', () => {
      const cache = createCache({ maxEntries: 3 });
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);
      cache.set('d', 4);
      expect(cache.size()).toBeLessThanOrEqual(3);
    });
  });

  describe('Rate Limiter', () => {
    it('should allow requests within limit', () => {
      const limiter = createRateLimiter({ maxRequests: 5, windowMs: 60000 });
      const result = limiter.check('user1');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it('should block requests over limit', () => {
      const limiter = createRateLimiter({ maxRequests: 2, windowMs: 60000 });
      limiter.check('user1');
      limiter.check('user1');
      const result = limiter.check('user1');
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should track per-key', () => {
      const limiter = createRateLimiter({ maxRequests: 2, windowMs: 60000 });
      limiter.check('user1');
      limiter.check('user1');
      const result = limiter.check('user2');
      expect(result.allowed).toBe(true);
    });

    it('should reset per-key', () => {
      const limiter = createRateLimiter({ maxRequests: 1, windowMs: 60000 });
      limiter.check('user1');
      limiter.reset('user1');
      const result = limiter.check('user1');
      expect(result.allowed).toBe(true);
    });

    it('should reset all', () => {
      const limiter = createRateLimiter({ maxRequests: 1, windowMs: 60000 });
      limiter.check('user1');
      limiter.check('user2');
      limiter.resetAll();
      expect(limiter.check('user1').allowed).toBe(true);
      expect(limiter.check('user2').allowed).toBe(true);
    });

    it('should include resetAt timestamp', () => {
      const limiter = createRateLimiter({ maxRequests: 5, windowMs: 60000 });
      const result = limiter.check('user1');
      expect(result.resetAt).toBeGreaterThan(Date.now());
    });
  });

  describe('Health Checker', () => {
    it('should return healthy with no checks', () => {
      const checker = createHealthChecker();
      const health = checker.getHealth();
      expect(health.status).toBe('healthy');
      expect(health.checks).toHaveLength(0);
    });

    it('should include uptime', () => {
      const checker = createHealthChecker(Date.now() - 10000);
      const health = checker.getHealth();
      expect(health.uptime).toBeGreaterThanOrEqual(10000);
    });

    it('should report passing checks', () => {
      const checker = createHealthChecker();
      checker.addCheck('db', () => ({ status: 'pass', latency: 5 }));
      const health = checker.getHealth();
      expect(health.status).toBe('healthy');
      expect(health.checks[0].status).toBe('pass');
    });

    it('should report degraded on warnings', () => {
      const checker = createHealthChecker();
      checker.addCheck('db', () => ({ status: 'pass' }));
      checker.addCheck('cache', () => ({ status: 'warn', message: 'High miss rate' }));
      expect(checker.getHealth().status).toBe('degraded');
    });

    it('should report unhealthy on failures', () => {
      const checker = createHealthChecker();
      checker.addCheck('db', () => ({ status: 'fail', message: 'Connection refused' }));
      expect(checker.getHealth().status).toBe('unhealthy');
    });

    it('should handle check errors gracefully', () => {
      const checker = createHealthChecker();
      checker.addCheck('broken', () => { throw new Error('fail'); });
      const health = checker.getHealth();
      expect(health.status).toBe('unhealthy');
      expect(health.checks[0].status).toBe('fail');
    });

    it('should include timestamp', () => {
      const checker = createHealthChecker();
      const health = checker.getHealth();
      expect(new Date(health.timestamp).getTime()).not.toBeNaN();
    });
  });

  describe('Alert Rules', () => {
    it('should define at least 7 default rules', () => {
      expect(DEFAULT_ALERT_RULES.length).toBeGreaterThanOrEqual(7);
    });

    it('should evaluate gt condition', () => {
      const rule = { id: 't', name: 't', metric: 'cpu', condition: 'gt' as const, threshold: 80, severity: 'warning' as const };
      expect(evaluateAlertRule(rule, 90)).toBe(true);
      expect(evaluateAlertRule(rule, 70)).toBe(false);
    });

    it('should evaluate lt condition', () => {
      const rule = { id: 't', name: 't', metric: 'free', condition: 'lt' as const, threshold: 10, severity: 'warning' as const };
      expect(evaluateAlertRule(rule, 5)).toBe(true);
      expect(evaluateAlertRule(rule, 15)).toBe(false);
    });

    it('should check alerts against metrics', () => {
      const results = checkAlerts({ cpu_percent: 90, error_rate: 2, p95_latency_ms: 100 });
      const cpuTriggered = results.filter(r => r.rule.metric === 'cpu_percent' && r.triggered);
      expect(cpuTriggered.length).toBeGreaterThan(0);
    });

    it('should not trigger for healthy metrics', () => {
      const results = checkAlerts({ cpu_percent: 20, memory_percent: 30 });
      const triggered = results.filter(r => r.triggered);
      expect(triggered).toHaveLength(0);
    });

    it('should include severity levels', () => {
      DEFAULT_ALERT_RULES.forEach(rule => {
        expect(['critical', 'warning', 'info']).toContain(rule.severity);
      });
    });
  });

  describe('Capacity Planning', () => {
    it('should calculate capacity metrics', () => {
      const result = calculateCapacity({
        currentUsers: 100,
        maxConcurrent: 50,
        avgRequestsPerUser: 10,
        avgResponseTimeMs: 50,
        peakMultiplier: 3,
      });
      expect(result.currentLoad).toBeGreaterThan(0);
      expect(result.recommendedInstances).toBeGreaterThanOrEqual(1);
      expect(result.estimatedMaxUsers).toBeGreaterThan(0);
    });

    it('should recommend more instances for higher load', () => {
      const low = calculateCapacity({
        currentUsers: 10, maxConcurrent: 5, avgRequestsPerUser: 5,
        avgResponseTimeMs: 50, peakMultiplier: 2,
      });
      const high = calculateCapacity({
        currentUsers: 1000, maxConcurrent: 500, avgRequestsPerUser: 20,
        avgResponseTimeMs: 50, peakMultiplier: 3,
      });
      expect(high.recommendedInstances).toBeGreaterThan(low.recommendedInstances);
    });

    it('should calculate headroom', () => {
      const result = calculateCapacity({
        currentUsers: 10, maxConcurrent: 5, avgRequestsPerUser: 5,
        avgResponseTimeMs: 50, peakMultiplier: 1,
      });
      expect(result.headroom).toBeGreaterThanOrEqual(0);
      expect(result.headroom).toBeLessThanOrEqual(100);
    });
  });

  describe('Retry with Backoff', () => {
    it('should calculate increasing delays', () => {
      const d0 = calculateBackoff(0, { maxRetries: 5, baseDelay: 100, maxDelay: 10000, backoffFactor: 2 });
      const d1 = calculateBackoff(1, { maxRetries: 5, baseDelay: 100, maxDelay: 10000, backoffFactor: 2 });
      // d1 base is 200, d0 base is 100. With jitter, d1 should generally be larger
      expect(d1).toBeGreaterThan(d0 * 0.5); // accounting for jitter variation
    });

    it('should not exceed max delay', () => {
      const delay = calculateBackoff(10, { maxRetries: 20, baseDelay: 1000, maxDelay: 5000, backoffFactor: 2 });
      if (delay >= 0) {
        expect(delay).toBeLessThanOrEqual(5000);
      }
    });

    it('should return -1 when retries exhausted', () => {
      expect(calculateBackoff(3, { maxRetries: 3 })).toBe(-1);
    });

    it('should check if retry is allowed', () => {
      expect(shouldRetry(0, { maxRetries: 3 })).toBe(true);
      expect(shouldRetry(2, { maxRetries: 3 })).toBe(true);
      expect(shouldRetry(3, { maxRetries: 3 })).toBe(false);
    });
  });

  describe('Degradation Modes', () => {
    it('should define 5 degradation levels', () => {
      expect(Object.keys(DEGRADATION_MODES)).toHaveLength(5);
    });

    it('should have normal mode with no disabled features', () => {
      const config = getDegradationConfig('normal');
      expect(config.disabledFeatures).toHaveLength(0);
    });

    it('should progressively disable more features', () => {
      const reduced = getDegradationConfig('reduced').disabledFeatures.length;
      const minimal = getDegradationConfig('minimal').disabledFeatures.length;
      const readOnly = getDegradationConfig('read-only').disabledFeatures.length;
      expect(minimal).toBeGreaterThan(reduced);
      expect(readOnly).toBeGreaterThan(minimal);
    });

    it('should check feature availability', () => {
      expect(isFeatureEnabled('analytics', 'normal')).toBe(true);
      expect(isFeatureEnabled('analytics', 'reduced')).toBe(false);
    });

    it('should disable all features in maintenance', () => {
      expect(isFeatureEnabled('browsing', 'maintenance')).toBe(false);
    });

    it('should include user-facing messages', () => {
      Object.values(DEGRADATION_MODES).forEach(config => {
        expect(config.message.length).toBeGreaterThan(10);
      });
    });
  });

  describe('Index Recommendations', () => {
    it('should define at least 8 index recommendations', () => {
      expect(INDEX_RECOMMENDATIONS.length).toBeGreaterThanOrEqual(8);
    });

    it('should have valid index types', () => {
      INDEX_RECOMMENDATIONS.forEach(rec => {
        expect(['single', 'compound', 'text', 'geo']).toContain(rec.type);
      });
    });

    it('should filter by collection', () => {
      const animalIndexes = getIndexRecommendations('animals');
      animalIndexes.forEach(r => expect(r.collection).toBe('animals'));
      expect(animalIndexes.length).toBeGreaterThan(0);
    });

    it('should return all when no filter', () => {
      expect(getIndexRecommendations()).toHaveLength(INDEX_RECOMMENDATIONS.length);
    });

    it('should include reasons', () => {
      INDEX_RECOMMENDATIONS.forEach(rec => {
        expect(rec.reason.length).toBeGreaterThan(10);
      });
    });
  });
});
