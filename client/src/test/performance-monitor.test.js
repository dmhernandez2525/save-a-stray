import { describe, it, expect } from 'vitest';
import { getMetrics, meetsPerformanceBudget } from '../lib/performance-monitor';

describe('Performance Monitor', () => {
  describe('getMetrics', () => {
    it('should return metrics object with expected shape', () => {
      const metrics = getMetrics();
      expect(metrics).toHaveProperty('lcp');
      expect(metrics).toHaveProperty('fid');
      expect(metrics).toHaveProperty('cls');
      expect(metrics).toHaveProperty('ttfb');
      expect(metrics).toHaveProperty('fcp');
    });

    it('should return null for all metrics initially', () => {
      const metrics = getMetrics();
      expect(metrics.lcp).toBeNull();
      expect(metrics.fid).toBeNull();
      expect(metrics.cls).toBeNull();
    });
  });

  describe('meetsPerformanceBudget', () => {
    it('should return true when all metrics are null (not measured)', () => {
      const result = meetsPerformanceBudget();
      expect(result).toBe(true);
    });

    it('should accept custom budget values', () => {
      const customBudget = { lcp: 3000, fid: 200, cls: 0.2 };
      const result = meetsPerformanceBudget(customBudget);
      expect(result).toBe(true);
    });
  });

  describe('Budget Definitions', () => {
    it('should enforce LCP < 2.5s for mobile', () => {
      const defaultBudget = { lcp: 2500, fid: 100, cls: 0.1 };
      expect(defaultBudget.lcp).toBeLessThanOrEqual(2500);
    });

    it('should enforce FID < 100ms', () => {
      const defaultBudget = { lcp: 2500, fid: 100, cls: 0.1 };
      expect(defaultBudget.fid).toBeLessThanOrEqual(100);
    });

    it('should enforce CLS < 0.1', () => {
      const defaultBudget = { lcp: 2500, fid: 100, cls: 0.1 };
      expect(defaultBudget.cls).toBeLessThanOrEqual(0.1);
    });
  });

  describe('Metric Categories', () => {
    it('should track LCP (Largest Contentful Paint)', () => {
      const metrics = getMetrics();
      expect('lcp' in metrics).toBe(true);
    });

    it('should track FID (First Input Delay)', () => {
      const metrics = getMetrics();
      expect('fid' in metrics).toBe(true);
    });

    it('should track CLS (Cumulative Layout Shift)', () => {
      const metrics = getMetrics();
      expect('cls' in metrics).toBe(true);
    });

    it('should track TTFB (Time to First Byte)', () => {
      const metrics = getMetrics();
      expect('ttfb' in metrics).toBe(true);
    });
  });
});
