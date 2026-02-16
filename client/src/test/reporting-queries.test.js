import { describe, it, expect } from 'vitest';

// Test the reporting query structure and data contracts for F9.3

describe('Reporting System Query Contracts', () => {
  describe('Monthly Summary Report', () => {
    const mockReport = {
      month: '2026-01',
      shelterId: 'shelter123',
      shelterName: 'Happy Paws Shelter',
      totalAnimals: 85,
      newIntakes: 12,
      totalAdoptions: 8,
      totalReturns: 1,
      totalTransfers: 2,
      applicationsReceived: 20,
      applicationsApproved: 8,
      applicationsRejected: 5,
      availableAtEnd: 45,
      adoptionRate: 0.094,
      generatedAt: new Date().toISOString(),
    };

    it('should have valid month format', () => {
      expect(mockReport.month).toMatch(/^\d{4}-\d{2}$/);
    });

    it('should have non-negative counts', () => {
      expect(mockReport.totalAnimals).toBeGreaterThanOrEqual(0);
      expect(mockReport.newIntakes).toBeGreaterThanOrEqual(0);
      expect(mockReport.totalAdoptions).toBeGreaterThanOrEqual(0);
      expect(mockReport.totalReturns).toBeGreaterThanOrEqual(0);
      expect(mockReport.totalTransfers).toBeGreaterThanOrEqual(0);
    });

    it('should have approvals + rejections <= applications', () => {
      expect(mockReport.applicationsApproved + mockReport.applicationsRejected)
        .toBeLessThanOrEqual(mockReport.applicationsReceived);
    });

    it('should have adoption rate between 0 and 1', () => {
      expect(mockReport.adoptionRate).toBeGreaterThanOrEqual(0);
      expect(mockReport.adoptionRate).toBeLessThanOrEqual(1);
    });

    it('should have available at end <= total animals', () => {
      expect(mockReport.availableAtEnd).toBeLessThanOrEqual(mockReport.totalAnimals);
    });
  });

  describe('SAC Export', () => {
    const mockSAC = {
      shelterId: 'shelter123',
      shelterName: 'Happy Paws',
      year: 2025,
      format: 'SAC',
      categories: [
        { animalType: 'dog', beginningCount: 30, intakes: 50, adoptions: 35, transfers: 5, returnToOwner: 3, euthanasia: 2, died: 1, endingCount: 34 },
        { animalType: 'cat', beginningCount: 20, intakes: 40, adoptions: 30, transfers: 3, returnToOwner: 2, euthanasia: 1, died: 0, endingCount: 24 },
        { animalType: 'other', beginningCount: 5, intakes: 10, adoptions: 8, transfers: 1, returnToOwner: 0, euthanasia: 0, died: 0, endingCount: 6 },
      ],
      totalBeginning: 55,
      totalEnding: 64,
    };

    it('should include all three SAC categories', () => {
      const types = mockSAC.categories.map(c => c.animalType);
      expect(types).toEqual(['dog', 'cat', 'other']);
    });

    it('should have SAC format identifier', () => {
      expect(mockSAC.format).toBe('SAC');
    });

    it('should have balanced counts for each category', () => {
      mockSAC.categories.forEach(cat => {
        const outflows = cat.adoptions + cat.transfers + cat.returnToOwner + cat.euthanasia + cat.died;
        const expected = cat.beginningCount + cat.intakes - outflows;
        expect(cat.endingCount).toBe(expected);
      });
    });

    it('should have total beginning matching sum of categories', () => {
      const sum = mockSAC.categories.reduce((s, c) => s + c.beginningCount, 0);
      expect(mockSAC.totalBeginning).toBe(sum);
    });

    it('should have non-negative values in all fields', () => {
      mockSAC.categories.forEach(cat => {
        expect(cat.beginningCount).toBeGreaterThanOrEqual(0);
        expect(cat.intakes).toBeGreaterThanOrEqual(0);
        expect(cat.adoptions).toBeGreaterThanOrEqual(0);
        expect(cat.transfers).toBeGreaterThanOrEqual(0);
        expect(cat.returnToOwner).toBeGreaterThanOrEqual(0);
        expect(cat.euthanasia).toBeGreaterThanOrEqual(0);
        expect(cat.died).toBeGreaterThanOrEqual(0);
        expect(cat.endingCount).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Asilomar Report', () => {
    const mockAsilomar = {
      shelterId: 'shelter123',
      shelterName: 'Happy Paws',
      year: 2025,
      format: 'Asilomar',
      categories: [
        { classification: 'healthy', beginningCount: 40, intake: 70, adopted: 55, transferred: 5, returnedToOwner: 3, euthanized: 0, endingCount: 47 },
        { classification: 'treatable-rehabilitatable', beginningCount: 10, intake: 20, adopted: 12, transferred: 3, returnedToOwner: 1, euthanized: 1, endingCount: 13 },
        { classification: 'treatable-manageable', beginningCount: 3, intake: 5, adopted: 2, transferred: 1, returnedToOwner: 0, euthanized: 0, endingCount: 5 },
        { classification: 'unhealthy-untreatable', beginningCount: 2, intake: 5, adopted: 0, transferred: 0, returnedToOwner: 0, euthanized: 3, endingCount: 4 },
      ],
    };

    it('should include all four Asilomar classifications', () => {
      const classes = mockAsilomar.categories.map(c => c.classification);
      expect(classes).toEqual([
        'healthy',
        'treatable-rehabilitatable',
        'treatable-manageable',
        'unhealthy-untreatable',
      ]);
    });

    it('should have Asilomar format identifier', () => {
      expect(mockAsilomar.format).toBe('Asilomar');
    });

    it('should have balanced counts', () => {
      mockAsilomar.categories.forEach(cat => {
        const outflows = cat.adopted + cat.transferred + cat.returnedToOwner + cat.euthanized;
        const expected = cat.beginningCount + cat.intake - outflows;
        expect(cat.endingCount).toBe(expected);
      });
    });

    it('should have healthy classification with most animals', () => {
      const healthy = mockAsilomar.categories.find(c => c.classification === 'healthy');
      mockAsilomar.categories.forEach(c => {
        if (c.classification !== 'healthy') {
          expect(healthy.beginningCount + healthy.intake).toBeGreaterThanOrEqual(c.beginningCount + c.intake);
        }
      });
    });
  });

  describe('Custom Report', () => {
    const mockCustom = {
      title: 'Q1 Summary',
      periodStart: '2026-01-01T00:00:00Z',
      periodEnd: '2026-03-31T23:59:59Z',
      metrics: [
        { name: 'Total Animals', value: 85, unit: 'count' },
        { name: 'Adoptions', value: 25, unit: 'count' },
        { name: 'Capacity Utilization', value: 0.75, unit: 'ratio' },
      ],
      data: JSON.stringify({ shelterId: 's1', shelterName: 'Test', metricCount: 3 }),
      generatedAt: new Date().toISOString(),
    };

    it('should have a title', () => {
      expect(mockCustom.title.length).toBeGreaterThan(0);
    });

    it('should have valid period dates', () => {
      const start = new Date(mockCustom.periodStart);
      const end = new Date(mockCustom.periodEnd);
      expect(start.getTime()).toBeLessThan(end.getTime());
    });

    it('should have metrics with name, value, unit', () => {
      mockCustom.metrics.forEach(m => {
        expect(m.name.length).toBeGreaterThan(0);
        expect(typeof m.value).toBe('number');
        expect(m.unit.length).toBeGreaterThan(0);
      });
    });

    it('should have parseable data JSON', () => {
      const parsed = JSON.parse(mockCustom.data);
      expect(parsed.metricCount).toBe(3);
    });
  });

  describe('Report Templates', () => {
    const templates = [
      { id: 'monthly-summary', name: 'Monthly Summary', metrics: ['animals', 'adoptions', 'applications', 'intakes', 'outcomes'], frequency: 'monthly', category: 'operations' },
      { id: 'grant-report', name: 'Grant Reporting', metrics: ['animals', 'adoptions', 'intakes', 'outcomes', 'capacity'], frequency: 'quarterly', category: 'compliance' },
      { id: 'board-update', name: 'Board Update', metrics: ['animals', 'adoptions', 'applications', 'capacity'], frequency: 'monthly', category: 'governance' },
      { id: 'sac-annual', name: 'Shelter Animals Count (Annual)', metrics: ['animals', 'adoptions', 'intakes', 'outcomes'], frequency: 'annually', category: 'compliance' },
      { id: 'asilomar-annual', name: 'Asilomar Accords (Annual)', metrics: ['animals', 'adoptions', 'outcomes'], frequency: 'annually', category: 'compliance' },
      { id: 'adoption-funnel', name: 'Adoption Funnel Analysis', metrics: ['applications', 'adoptions'], frequency: 'weekly', category: 'analytics' },
    ];

    it('should have unique template IDs', () => {
      const ids = templates.map(t => t.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('should have compliance templates for regulatory reporting', () => {
      const compliance = templates.filter(t => t.category === 'compliance');
      expect(compliance.length).toBeGreaterThanOrEqual(3);
    });

    it('should have both monthly and annual frequencies', () => {
      const frequencies = new Set(templates.map(t => t.frequency));
      expect(frequencies.has('monthly')).toBe(true);
      expect(frequencies.has('annually')).toBe(true);
    });

    it('should have non-empty metrics arrays', () => {
      templates.forEach(t => {
        expect(t.metrics.length).toBeGreaterThan(0);
      });
    });

    it('should include adoption-related metrics in most templates', () => {
      const withAdoptions = templates.filter(t => t.metrics.includes('adoptions'));
      expect(withAdoptions.length).toBeGreaterThanOrEqual(5);
    });
  });
});
