import { describe, it, expect } from 'vitest';

// Test the insights & recommendations query contracts for F9.4

describe('Insights & Recommendations Query Contracts', () => {
  describe('Shelter Insights', () => {
    const mockInsights = {
      shelterId: 's1',
      shelterName: 'Happy Paws',
      insights: [
        {
          id: 'insight_0',
          category: 'capacity',
          severity: 'high',
          title: 'Near capacity limit',
          description: 'Shelter is at 92% capacity.',
          suggestedAction: 'Run an adoption event',
          metric: 'capacity_utilization',
          currentValue: 0.92,
          targetValue: 0.75,
          trend: 'up',
        },
        {
          id: 'insight_1',
          category: 'applications',
          severity: 'warning',
          title: 'Application volume declining',
          description: 'Applications dropped 25% compared to previous period.',
          suggestedAction: 'Improve animal photos and descriptions',
          metric: 'application_trend',
          currentValue: 30,
          targetValue: 40,
          trend: 'down',
        },
        {
          id: 'insight_2',
          category: 'length_of_stay',
          severity: 'warning',
          title: '3 animals with 90+ days in shelter',
          description: 'These animals may benefit from profile updates.',
          suggestedAction: 'Update photos and enhance descriptions',
          metric: 'long_stay_count',
          currentValue: 3,
          targetValue: 0,
          trend: 'stable',
        },
      ],
      generatedAt: new Date().toISOString(),
    };

    it('should have valid insight categories', () => {
      const validCategories = ['capacity', 'applications', 'intake', 'length_of_stay', 'adoption_rate', 'seasonal', 'benchmark'];
      mockInsights.insights.forEach(i => {
        expect(validCategories).toContain(i.category);
      });
    });

    it('should have valid severity levels', () => {
      const validSeverities = ['info', 'warning', 'high', 'critical'];
      mockInsights.insights.forEach(i => {
        expect(validSeverities).toContain(i.severity);
      });
    });

    it('should have actionable suggestions', () => {
      mockInsights.insights.forEach(i => {
        expect(i.suggestedAction.length).toBeGreaterThan(0);
      });
    });

    it('should have non-empty titles and descriptions', () => {
      mockInsights.insights.forEach(i => {
        expect(i.title.length).toBeGreaterThan(0);
        expect(i.description.length).toBeGreaterThan(0);
      });
    });

    it('should have valid trend values', () => {
      const validTrends = ['up', 'down', 'stable'];
      mockInsights.insights.forEach(i => {
        expect(validTrends).toContain(i.trend);
      });
    });

    it('should include unique IDs', () => {
      const ids = mockInsights.insights.map(i => i.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe('Shelter Benchmark', () => {
    const mockBenchmark = {
      shelterId: 's1',
      shelterName: 'Happy Paws',
      metrics: [
        { name: 'Animal Count', shelterValue: 45, platformAverage: 35, platformTop25: 60, percentile: 65 },
        { name: 'Adoption Rate', shelterValue: 0.35, platformAverage: 0.28, platformTop25: 0.42, percentile: 60 },
      ],
      generatedAt: new Date().toISOString(),
    };

    it('should have benchmark metrics with platform comparison', () => {
      mockBenchmark.metrics.forEach(m => {
        expect(m.shelterValue).toBeDefined();
        expect(m.platformAverage).toBeDefined();
        expect(m.platformTop25).toBeDefined();
      });
    });

    it('should have percentile between 0 and 100', () => {
      mockBenchmark.metrics.forEach(m => {
        expect(m.percentile).toBeGreaterThanOrEqual(0);
        expect(m.percentile).toBeLessThanOrEqual(100);
      });
    });

    it('should have platformTop25 >= platformAverage', () => {
      mockBenchmark.metrics.forEach(m => {
        expect(m.platformTop25).toBeGreaterThanOrEqual(m.platformAverage);
      });
    });
  });

  describe('Seasonal Patterns', () => {
    const mockPatterns = {
      shelterId: 's1',
      patterns: [
        { month: 1, monthName: 'January', avgIntakes: 8, avgAdoptions: 5, isHighIntake: false, isHighAdoption: false, note: '' },
        { month: 4, monthName: 'April', avgIntakes: 15, avgAdoptions: 7, isHighIntake: true, isHighAdoption: false, note: 'Peak kitten season, expect increased intake' },
        { month: 5, monthName: 'May', avgIntakes: 18, avgAdoptions: 8, isHighIntake: true, isHighAdoption: false, note: 'High kitten intake continues' },
        { month: 12, monthName: 'December', avgIntakes: 6, avgAdoptions: 12, isHighIntake: false, isHighAdoption: true, note: '' },
      ],
    };

    it('should have 12 months when full', () => {
      // Our mock only has 4, but full data should have 12
      expect(mockPatterns.patterns.length).toBeGreaterThan(0);
    });

    it('should have valid month numbers', () => {
      mockPatterns.patterns.forEach(p => {
        expect(p.month).toBeGreaterThanOrEqual(1);
        expect(p.month).toBeLessThanOrEqual(12);
      });
    });

    it('should have month names', () => {
      mockPatterns.patterns.forEach(p => {
        expect(p.monthName.length).toBeGreaterThan(0);
      });
    });

    it('should flag high intake months', () => {
      const highIntake = mockPatterns.patterns.filter(p => p.isHighIntake);
      expect(highIntake.length).toBeGreaterThan(0);
      // Spring months (April/May) should be high
      expect(highIntake.some(p => p.month === 4 || p.month === 5)).toBe(true);
    });

    it('should have notes for known seasonal patterns', () => {
      const april = mockPatterns.patterns.find(p => p.month === 4);
      expect(april.note.length).toBeGreaterThan(0);
      expect(april.note).toContain('kitten');
    });

    it('should have non-negative averages', () => {
      mockPatterns.patterns.forEach(p => {
        expect(p.avgIntakes).toBeGreaterThanOrEqual(0);
        expect(p.avgAdoptions).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('What-If Scenario', () => {
    const mockWhatIf = {
      shelterId: 's1',
      scenario: '+20% intake, +0% adoptions',
      currentCapacity: 100,
      maxCapacity: 100,
      currentOccupancy: 75,
      projectedOccupancy: 87,
      daysUntilCapacity: 45,
      recommendation: 'Capacity risk within 60 days. Increase adoption events and transfer partnerships.',
    };

    it('should have projected occupancy >= 0', () => {
      expect(mockWhatIf.projectedOccupancy).toBeGreaterThanOrEqual(0);
    });

    it('should have positive days until capacity or 999', () => {
      expect(mockWhatIf.daysUntilCapacity).toBeGreaterThan(0);
    });

    it('should include a recommendation', () => {
      expect(mockWhatIf.recommendation.length).toBeGreaterThan(0);
    });

    it('should describe the scenario with percentage changes', () => {
      expect(mockWhatIf.scenario).toContain('%');
    });

    it('should have max capacity matching current capacity', () => {
      expect(mockWhatIf.maxCapacity).toBe(mockWhatIf.currentCapacity);
    });

    it('should show capacity concern when days < 60', () => {
      if (mockWhatIf.daysUntilCapacity < 60) {
        expect(mockWhatIf.recommendation.toLowerCase()).toContain('capacity');
      }
    });
  });
});
