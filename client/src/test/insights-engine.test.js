import { describe, it, expect, beforeEach } from 'vitest';
import {
  analyzeTrend,
  generateTrendNarrative,
  scoreAdoptionLikelihood,
  calculateWhatIf,
  prioritizeInsights,
  submitInsightFeedback,
  getInsightFeedback,
  dismissInsight,
  filterDismissedInsights,
  getCategoryEffectiveness,
} from '../lib/insights-engine';

describe('Insights Engine', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('analyzeTrend', () => {
    it('should detect increasing trend', () => {
      const trend = analyzeTrend(120, 100, 'Adoptions', 'this month');
      expect(trend.direction).toBe('increasing');
      expect(trend.changePercent).toBe(20);
    });

    it('should detect decreasing trend', () => {
      const trend = analyzeTrend(80, 100, 'Applications', 'last 30 days');
      expect(trend.direction).toBe('decreasing');
      expect(trend.changePercent).toBe(-20);
    });

    it('should detect stable trend for small changes', () => {
      const trend = analyzeTrend(102, 100, 'Intakes', 'this week');
      expect(trend.direction).toBe('stable');
    });

    it('should flag anomalies for large changes', () => {
      const trend = analyzeTrend(200, 100, 'Intakes', 'this month');
      expect(trend.isAnomaly).toBe(true);
      expect(trend.changePercent).toBe(100);
    });

    it('should not flag small changes as anomalies', () => {
      const trend = analyzeTrend(110, 100, 'Adoptions', 'this month');
      expect(trend.isAnomaly).toBe(false);
    });

    it('should handle zero previous value', () => {
      const trend = analyzeTrend(10, 0, 'New metric', 'period');
      expect(trend.direction).toBe('increasing');
      expect(trend.changePercent).toBe(100);
    });

    it('should handle both zero values', () => {
      const trend = analyzeTrend(0, 0, 'Empty', 'period');
      expect(trend.direction).toBe('stable');
      expect(trend.changePercent).toBe(0);
    });
  });

  describe('generateTrendNarrative', () => {
    it('should generate narrative for increasing trend', () => {
      const trend = { metric: 'Adoptions', direction: 'increasing', changePercent: 15, periodLabel: 'this month', isAnomaly: false };
      const narrative = generateTrendNarrative(trend);
      expect(narrative).toContain('increased');
      expect(narrative).toContain('15%');
      expect(narrative).toContain('this month');
    });

    it('should generate narrative for decreasing trend', () => {
      const trend = { metric: 'Applications', direction: 'decreasing', changePercent: -25, periodLabel: 'last 30 days', isAnomaly: false };
      const narrative = generateTrendNarrative(trend);
      expect(narrative).toContain('decreased');
      expect(narrative).toContain('25%');
    });

    it('should generate narrative for stable trend', () => {
      const trend = { metric: 'Intakes', direction: 'stable', changePercent: 2, periodLabel: 'this week', isAnomaly: false };
      const narrative = generateTrendNarrative(trend);
      expect(narrative).toContain('stable');
    });

    it('should add anomaly warning', () => {
      const trend = { metric: 'Intakes', direction: 'increasing', changePercent: 80, periodLabel: 'today', isAnomaly: true };
      const narrative = generateTrendNarrative(trend);
      expect(narrative).toContain('unusual');
      expect(narrative).toContain('significantly');
    });

    it('should use "notably" for moderate changes', () => {
      const trend = { metric: 'Returns', direction: 'increasing', changePercent: 30, periodLabel: 'quarter', isAnomaly: false };
      const narrative = generateTrendNarrative(trend);
      expect(narrative).toContain('notably');
    });
  });

  describe('scoreAdoptionLikelihood', () => {
    const baseProfile = {
      hasPhoto: true,
      hasDescription: true,
      descriptionLength: 150,
      photoCount: 3,
      hasVideo: false,
      goodWithKids: true,
      goodWithDogs: true,
      goodWithCats: undefined,
      houseTrained: true,
      age: 3,
      daysInShelter: 10,
    };

    it('should give high score for complete profile', () => {
      const result = scoreAdoptionLikelihood(baseProfile);
      expect(result.score).toBeGreaterThan(70);
    });

    it('should penalize missing photo', () => {
      const noPhoto = { ...baseProfile, hasPhoto: false, photoCount: 0 };
      const withPhoto = scoreAdoptionLikelihood(baseProfile);
      const withoutPhoto = scoreAdoptionLikelihood(noPhoto);
      expect(withoutPhoto.score).toBeLessThan(withPhoto.score);
    });

    it('should penalize missing description', () => {
      const noDesc = { ...baseProfile, hasDescription: false, descriptionLength: 0 };
      const result = scoreAdoptionLikelihood(noDesc);
      expect(result.factors).toContain('-10 missing description');
    });

    it('should reward video', () => {
      const withVideo = { ...baseProfile, hasVideo: true };
      const result = scoreAdoptionLikelihood(withVideo);
      expect(result.factors).toContain('+5 has video');
    });

    it('should boost young animals', () => {
      const young = { ...baseProfile, age: 1 };
      const result = scoreAdoptionLikelihood(young);
      expect(result.factors).toContain('+5 young animal');
    });

    it('should penalize senior animals', () => {
      const senior = { ...baseProfile, age: 10 };
      const result = scoreAdoptionLikelihood(senior);
      expect(result.factors).toContain('-5 senior animal');
    });

    it('should penalize long shelter stays', () => {
      const longStay = { ...baseProfile, daysInShelter: 100 };
      const result = scoreAdoptionLikelihood(longStay);
      expect(result.factors).toContain('-10 long stay (90+ days)');
    });

    it('should clamp score between 0 and 100', () => {
      const worst = {
        hasPhoto: false, hasDescription: false, descriptionLength: 0,
        photoCount: 0, hasVideo: false, age: 15, daysInShelter: 200,
        houseTrained: false,
      };
      const result = scoreAdoptionLikelihood(worst);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should reward house trained status', () => {
      const result = scoreAdoptionLikelihood(baseProfile);
      expect(result.factors).toContain('+5 house trained');
    });
  });

  describe('calculateWhatIf', () => {
    it('should project increased occupancy with higher intake', () => {
      const result = calculateWhatIf(50, 100, 10, 8, 50, 0);
      expect(result.projectedOccupancy).toBeGreaterThan(50);
    });

    it('should project decreased occupancy with higher adoptions', () => {
      const result = calculateWhatIf(50, 100, 10, 10, 0, 50);
      expect(result.projectedOccupancy).toBeLessThan(50);
    });

    it('should calculate days until capacity', () => {
      const result = calculateWhatIf(80, 100, 10, 5, 0, 0);
      expect(result.daysUntilCapacity).toBeGreaterThan(0);
      expect(result.daysUntilCapacity).toBeLessThan(999);
    });

    it('should return 999 when not approaching capacity', () => {
      const result = calculateWhatIf(50, 100, 5, 10, 0, 0);
      expect(result.daysUntilCapacity).toBe(999);
    });

    it('should warn when capacity risk is under 60 days', () => {
      const result = calculateWhatIf(95, 100, 20, 5, 0, 0);
      expect(result.recommendation).toContain('Capacity risk');
    });

    it('should suggest accepting transfers when decreasing', () => {
      const result = calculateWhatIf(50, 100, 5, 10, 0, 0);
      expect(result.recommendation).toContain('accepting transfers');
    });

    it('should format scenario string correctly', () => {
      const result = calculateWhatIf(50, 100, 10, 10, 20, -10);
      expect(result.scenario).toContain('+20%');
      expect(result.scenario).toContain('-10%');
    });

    it('should never project negative occupancy', () => {
      const result = calculateWhatIf(5, 100, 1, 50, 0, 0);
      expect(result.projectedOccupancy).toBeGreaterThanOrEqual(0);
    });
  });

  describe('prioritizeInsights', () => {
    it('should sort by severity', () => {
      const insights = [
        { id: '1', category: 'capacity', severity: 'info', title: 'Low', description: '', suggestedAction: '', metric: '', currentValue: 0, targetValue: 0, trend: 'stable' },
        { id: '2', category: 'capacity', severity: 'critical', title: 'Critical', description: '', suggestedAction: '', metric: '', currentValue: 0, targetValue: 0, trend: 'up' },
        { id: '3', category: 'capacity', severity: 'warning', title: 'Medium', description: '', suggestedAction: '', metric: '', currentValue: 0, targetValue: 0, trend: 'down' },
        { id: '4', category: 'capacity', severity: 'high', title: 'High', description: '', suggestedAction: '', metric: '', currentValue: 0, targetValue: 0, trend: 'up' },
      ];

      const sorted = prioritizeInsights(insights);
      expect(sorted[0].severity).toBe('critical');
      expect(sorted[1].severity).toBe('high');
      expect(sorted[2].severity).toBe('warning');
      expect(sorted[3].severity).toBe('info');
    });

    it('should not modify original array', () => {
      const insights = [
        { id: '1', category: 'capacity', severity: 'info', title: '', description: '', suggestedAction: '', metric: '', currentValue: 0, targetValue: 0, trend: 'stable' },
        { id: '2', category: 'capacity', severity: 'high', title: '', description: '', suggestedAction: '', metric: '', currentValue: 0, targetValue: 0, trend: 'up' },
      ];

      prioritizeInsights(insights);
      expect(insights[0].severity).toBe('info'); // Original unchanged
    });
  });

  describe('Insight Feedback', () => {
    it('should store feedback', () => {
      submitInsightFeedback('insight_1', 'helpful', 'Great insight');
      const feedback = getInsightFeedback();
      expect(feedback).toHaveLength(1);
      expect(feedback[0].insightId).toBe('insight_1');
      expect(feedback[0].rating).toBe('helpful');
      expect(feedback[0].comment).toBe('Great insight');
    });

    it('should accumulate multiple feedback entries', () => {
      submitInsightFeedback('i1', 'helpful');
      submitInsightFeedback('i2', 'not_helpful');
      expect(getInsightFeedback()).toHaveLength(2);
    });

    it('should handle corrupted storage', () => {
      localStorage.setItem('sas_insight_feedback', 'bad');
      expect(getInsightFeedback()).toEqual([]);
    });
  });

  describe('dismissInsight / filterDismissedInsights', () => {
    it('should dismiss an insight', () => {
      const insights = [
        { id: 'i1', category: 'capacity', severity: 'high', title: '', description: '', suggestedAction: '', metric: '', currentValue: 0, targetValue: 0, trend: 'up' },
        { id: 'i2', category: 'intake', severity: 'warning', title: '', description: '', suggestedAction: '', metric: '', currentValue: 0, targetValue: 0, trend: 'up' },
      ];

      dismissInsight('i1');
      const filtered = filterDismissedInsights(insights);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('i2');
    });

    it('should not duplicate dismissed IDs', () => {
      dismissInsight('i1');
      dismissInsight('i1');
      const raw = JSON.parse(localStorage.getItem('sas_insights_dismissed'));
      expect(raw).toHaveLength(1);
    });
  });

  describe('getCategoryEffectiveness', () => {
    it('should calculate effectiveness rate', () => {
      submitInsightFeedback('capacity_1', 'helpful');
      submitInsightFeedback('capacity_2', 'helpful');
      submitInsightFeedback('capacity_3', 'not_helpful');

      const result = getCategoryEffectiveness('capacity');
      expect(result.helpful).toBe(2);
      expect(result.total).toBe(3);
      expect(result.rate).toBe(67);
    });

    it('should return 0% for no feedback', () => {
      const result = getCategoryEffectiveness('unknown');
      expect(result.rate).toBe(0);
      expect(result.total).toBe(0);
    });
  });
});
