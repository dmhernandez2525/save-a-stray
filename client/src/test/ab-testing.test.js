import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  assignVariant,
  getVariant,
  recordImpression,
  recordConversion,
  getExperimentResults,
  calculateSignificance,
  clearExperiments,
} from '../lib/ab-testing';

describe('A/B Testing Framework', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('assignVariant', () => {
    it('should assign a variant from the experiment', () => {
      const experiment = { id: 'exp1', name: 'Test', variants: ['A', 'B'] };
      const variant = assignVariant(experiment);
      expect(['A', 'B']).toContain(variant);
    });

    it('should persist the same variant across calls', () => {
      const experiment = { id: 'exp2', name: 'Sticky', variants: ['X', 'Y', 'Z'] };
      const first = assignVariant(experiment);
      const second = assignVariant(experiment);
      expect(second).toBe(first);
    });

    it('should assign different experiments independently', () => {
      const exp1 = { id: 'exp_a', name: 'A', variants: ['v1'] };
      const exp2 = { id: 'exp_b', name: 'B', variants: ['v2'] };
      expect(assignVariant(exp1)).toBe('v1');
      expect(assignVariant(exp2)).toBe('v2');
    });

    it('should use weights when provided', () => {
      // With weight [1, 0], should always pick the first variant
      const experiment = { id: 'weighted', name: 'Weighted', variants: ['winner', 'loser'], weights: [1, 0] };
      const variant = assignVariant(experiment);
      expect(variant).toBe('winner');
    });

    it('should handle single variant experiment', () => {
      const experiment = { id: 'single', name: 'Single', variants: ['only'] };
      expect(assignVariant(experiment)).toBe('only');
    });
  });

  describe('getVariant', () => {
    it('should return null for unassigned experiment', () => {
      expect(getVariant('unknown')).toBeNull();
    });

    it('should return assigned variant', () => {
      const experiment = { id: 'get_test', name: 'Get', variants: ['A'] };
      assignVariant(experiment);
      expect(getVariant('get_test')).toBe('A');
    });
  });

  describe('recordImpression', () => {
    it('should increment impression count', () => {
      const experiment = { id: 'imp_test', name: 'Imp', variants: ['A'] };
      assignVariant(experiment);

      recordImpression('imp_test');
      recordImpression('imp_test');

      const results = getExperimentResults('imp_test');
      expect(results).toHaveLength(1);
      expect(results[0].impressions).toBe(2);
    });

    it('should not record if experiment not assigned', () => {
      recordImpression('unassigned');
      const results = getExperimentResults('unassigned');
      expect(results).toHaveLength(0);
    });
  });

  describe('recordConversion', () => {
    it('should increment conversion count', () => {
      const experiment = { id: 'conv_test', name: 'Conv', variants: ['A'] };
      assignVariant(experiment);

      recordConversion('conv_test');
      recordConversion('conv_test');
      recordConversion('conv_test');

      const results = getExperimentResults('conv_test');
      expect(results[0].conversions).toBe(3);
    });

    it('should not record if experiment not assigned', () => {
      recordConversion('unassigned');
      const results = getExperimentResults('unassigned');
      expect(results).toHaveLength(0);
    });
  });

  describe('getExperimentResults', () => {
    it('should calculate conversion rate', () => {
      const experiment = { id: 'rate_test', name: 'Rate', variants: ['A'] };
      assignVariant(experiment);

      recordImpression('rate_test');
      recordImpression('rate_test');
      recordImpression('rate_test');
      recordImpression('rate_test');
      recordConversion('rate_test');

      const results = getExperimentResults('rate_test');
      expect(results[0].conversionRate).toBe(0.25);
    });

    it('should return empty array for unknown experiment', () => {
      expect(getExperimentResults('nonexistent')).toEqual([]);
    });

    it('should handle zero impressions', () => {
      const experiment = { id: 'zero_test', name: 'Zero', variants: ['A'] };
      assignVariant(experiment);
      recordConversion('zero_test');

      const results = getExperimentResults('zero_test');
      expect(results[0].conversionRate).toBe(0);
      expect(results[0].conversions).toBe(1);
      expect(results[0].impressions).toBe(0);
    });
  });

  describe('calculateSignificance', () => {
    it('should detect significant difference with large sample', () => {
      // Control: 5% conversion, Variant: 10% conversion, large sample
      const result = calculateSignificance(50, 1000, 100, 1000);
      expect(result.isSignificant).toBe(true);
      expect(result.pValue).toBeLessThan(0.05);
    });

    it('should not detect significance with small sample', () => {
      // Very small sample
      const result = calculateSignificance(1, 10, 2, 10);
      expect(result.isSignificant).toBe(false);
    });

    it('should return non-significant for equal rates', () => {
      const result = calculateSignificance(50, 1000, 50, 1000);
      expect(result.zScore).toBe(0);
      expect(result.isSignificant).toBe(false);
    });

    it('should handle zero impressions', () => {
      const result = calculateSignificance(0, 0, 10, 100);
      expect(result.pValue).toBe(1);
      expect(result.isSignificant).toBe(false);
    });

    it('should handle zero standard error', () => {
      // Both have 100% conversion
      const result = calculateSignificance(10, 10, 10, 10);
      expect(result.zScore).toBe(0);
      expect(result.isSignificant).toBe(false);
    });

    it('should return a z-score with correct sign', () => {
      // Control better than variant
      const result = calculateSignificance(100, 1000, 50, 1000);
      expect(result.zScore).toBeGreaterThan(0);

      // Variant better than control
      const result2 = calculateSignificance(50, 1000, 100, 1000);
      expect(result2.zScore).toBeLessThan(0);
    });
  });

  describe('clearExperiments', () => {
    it('should clear all assignments and results', () => {
      const experiment = { id: 'clear_test', name: 'Clear', variants: ['A'] };
      assignVariant(experiment);
      recordImpression('clear_test');
      recordConversion('clear_test');

      clearExperiments();

      expect(getVariant('clear_test')).toBeNull();
      expect(getExperimentResults('clear_test')).toEqual([]);
    });
  });

  describe('Storage error handling', () => {
    it('should handle corrupted localStorage for assignments', () => {
      localStorage.setItem('sas_ab_assignments', 'not json');
      const variant = assignVariant({ id: 'recovery', name: 'Recovery', variants: ['A'] });
      expect(variant).toBe('A');
    });

    it('should handle corrupted localStorage for results', () => {
      localStorage.setItem('sas_ab_results', 'bad data');
      const results = getExperimentResults('anything');
      expect(results).toEqual([]);
    });
  });
});
