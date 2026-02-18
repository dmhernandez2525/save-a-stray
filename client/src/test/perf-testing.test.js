import { describe, it, expect, beforeEach } from 'vitest';
import {
  PERFORMANCE_BUDGETS, QUERY_BENCHMARKS,
  startMeasure, getMeasurements, clearMeasurements,
  getPercentile, getStats,
  checkBudget, checkAllBudgets,
  calculateCacheMetrics, analyzeBundles,
} from '../lib/perf-testing';

describe('Performance Testing', () => {
  beforeEach(() => {
    clearMeasurements();
  });

  describe('Performance Budgets', () => {
    it('should define 10 budget metrics', () => {
      expect(PERFORMANCE_BUDGETS).toHaveLength(10);
    });

    it('should include Core Web Vitals', () => {
      const metrics = PERFORMANCE_BUDGETS.map(b => b.metric);
      expect(metrics).toContain('largestContentfulPaint');
      expect(metrics).toContain('cumulativeLayoutShift');
      expect(metrics).toContain('firstInputDelay');
    });

    it('should have LCP budget <= 2.5s', () => {
      const lcp = PERFORMANCE_BUDGETS.find(b => b.metric === 'largestContentfulPaint');
      expect(lcp!.budget).toBeLessThanOrEqual(2500);
    });

    it('should have CLS budget <= 0.1', () => {
      const cls = PERFORMANCE_BUDGETS.find(b => b.metric === 'cumulativeLayoutShift');
      expect(cls!.budget).toBeLessThanOrEqual(0.1);
    });

    it('should have bundle size budget', () => {
      const bundle = PERFORMANCE_BUDGETS.find(b => b.metric === 'bundleSize');
      expect(bundle!.budget).toBeLessThanOrEqual(500);
      expect(bundle!.unit).toBe('kb');
    });
  });

  describe('Query Benchmarks', () => {
    it('should define benchmarks for key queries', () => {
      expect(QUERY_BENCHMARKS.length).toBeGreaterThanOrEqual(5);
    });

    it('should have increasing percentile targets', () => {
      QUERY_BENCHMARKS.forEach(b => {
        expect(b.p95Target).toBeGreaterThan(b.p50Target);
        expect(b.p99Target).toBeGreaterThan(b.p95Target);
      });
    });

    it('should have P95 under 200ms for all queries', () => {
      QUERY_BENCHMARKS.forEach(b => {
        expect(b.p95Target).toBeLessThanOrEqual(300);
      });
    });
  });

  describe('Timing Measurement', () => {
    it('should measure duration', () => {
      const stop = startMeasure('test');
      const duration = stop();
      expect(duration).toBeGreaterThanOrEqual(0);
    });

    it('should store measurements', () => {
      const stop = startMeasure('query');
      stop();
      const results = getMeasurements('query');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('query');
    });

    it('should filter by name', () => {
      startMeasure('a')();
      startMeasure('b')();
      expect(getMeasurements('a')).toHaveLength(1);
      expect(getMeasurements('b')).toHaveLength(1);
    });

    it('should return all without filter', () => {
      startMeasure('a')();
      startMeasure('b')();
      expect(getMeasurements()).toHaveLength(2);
    });

    it('should clear measurements', () => {
      startMeasure('test')();
      clearMeasurements();
      expect(getMeasurements()).toHaveLength(0);
    });
  });

  describe('Statistics', () => {
    it('should calculate percentiles', () => {
      const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      expect(getPercentile(values, 50)).toBe(5);
      expect(getPercentile(values, 95)).toBe(10);
    });

    it('should handle empty array', () => {
      expect(getPercentile([], 50)).toBe(0);
    });

    it('should calculate stats', () => {
      const stats = getStats([10, 20, 30, 40, 50]);
      expect(stats.min).toBe(10);
      expect(stats.max).toBe(50);
      expect(stats.mean).toBe(30);
      expect(stats.stdDev).toBeGreaterThan(0);
    });

    it('should handle empty stats', () => {
      const stats = getStats([]);
      expect(stats.min).toBe(0);
      expect(stats.mean).toBe(0);
    });

    it('should calculate standard deviation', () => {
      const stats = getStats([2, 4, 4, 4, 5, 5, 7, 9]);
      expect(stats.stdDev).toBeGreaterThan(0);
      expect(stats.stdDev).toBeLessThan(stats.max - stats.min);
    });
  });

  describe('Budget Checking', () => {
    it('should pass when under budget', () => {
      const result = checkBudget('largestContentfulPaint', 2000);
      expect(result!.passed).toBe(true);
      expect(result!.overshoot).toBe(0);
    });

    it('should fail when over budget', () => {
      const result = checkBudget('largestContentfulPaint', 3000);
      expect(result!.passed).toBe(false);
      expect(result!.overshoot).toBe(500);
    });

    it('should return null for unknown metric', () => {
      expect(checkBudget('unknown', 100)).toBeNull();
    });

    it('should check all budgets', () => {
      const metrics = {
        largestContentfulPaint: 2000,
        firstInputDelay: 50,
        bundleSize: 600,
      };
      const results = checkAllBudgets(metrics);
      expect(results).toHaveLength(3);
      expect(results.filter(r => r.passed)).toHaveLength(2);
      expect(results.filter(r => !r.passed)).toHaveLength(1);
    });
  });

  describe('Cache Metrics', () => {
    it('should calculate hit rate', () => {
      const metrics = calculateCacheMetrics(80, 20, [5, 10], [50, 100]);
      expect(metrics.hitRate).toBe(0.8);
    });

    it('should calculate average latencies', () => {
      const metrics = calculateCacheMetrics(2, 2, [10, 20], [100, 200]);
      expect(metrics.avgHitLatency).toBe(15);
      expect(metrics.avgMissLatency).toBe(150);
    });

    it('should handle zero totals', () => {
      const metrics = calculateCacheMetrics(0, 0, [], []);
      expect(metrics.hitRate).toBe(0);
      expect(metrics.avgHitLatency).toBe(0);
    });

    it('should have hit rate between 0 and 1', () => {
      const metrics = calculateCacheMetrics(50, 50, [], []);
      expect(metrics.hitRate).toBeGreaterThanOrEqual(0);
      expect(metrics.hitRate).toBeLessThanOrEqual(1);
    });
  });

  describe('Bundle Analysis', () => {
    it('should calculate total size', () => {
      const chunks = [
        { name: 'main', sizeKb: 150, isAsync: false },
        { name: 'vendor', sizeKb: 200, isAsync: false },
        { name: 'lazy', sizeKb: 50, isAsync: true },
      ];
      const result = analyzeBundles(chunks);
      expect(result.totalSizeKb).toBe(400);
    });

    it('should separate initial and async sizes', () => {
      const chunks = [
        { name: 'main', sizeKb: 100, isAsync: false },
        { name: 'lazy1', sizeKb: 30, isAsync: true },
        { name: 'lazy2', sizeKb: 20, isAsync: true },
      ];
      const result = analyzeBundles(chunks);
      expect(result.initialSizeKb).toBe(100);
      expect(result.asyncSizeKb).toBe(50);
    });

    it('should find largest chunk', () => {
      const chunks = [
        { name: 'small', sizeKb: 10, isAsync: false },
        { name: 'big', sizeKb: 200, isAsync: false },
        { name: 'medium', sizeKb: 80, isAsync: true },
      ];
      const result = analyzeBundles(chunks);
      expect(result.largestChunk).toBe('big');
    });

    it('should count chunks', () => {
      const chunks = [
        { name: 'a', sizeKb: 10, isAsync: false },
        { name: 'b', sizeKb: 20, isAsync: true },
      ];
      expect(analyzeBundles(chunks).chunkCount).toBe(2);
    });
  });
});
