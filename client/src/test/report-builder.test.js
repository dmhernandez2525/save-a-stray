import { describe, it, expect, beforeEach } from 'vitest';
import {
  validateReportConfig,
  determineTrend,
  formatMetricValue,
  buildReport,
  saveReport,
  getStoredReports,
  getReportById,
  addAnnotation,
  exportReportAsCsv,
  exportReportAsJson,
  saveScheduledReport,
  getScheduledReports,
  calculateNextRun,
  REPORT_TEMPLATES,
} from '../lib/report-builder';

const validConfig = {
  title: 'Monthly Summary',
  shelterId: 'shelter123',
  metrics: ['animals', 'adoptions'],
  startDate: '2026-01-01',
  endDate: '2026-01-31',
  format: 'csv',
};

describe('Report Builder', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('validateReportConfig', () => {
    it('should pass with valid config', () => {
      const result = validateReportConfig(validConfig);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail with missing title', () => {
      const result = validateReportConfig({ ...validConfig, title: '' });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Report title is required');
    });

    it('should fail with missing shelterId', () => {
      const result = validateReportConfig({ ...validConfig, shelterId: '' });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Shelter ID is required');
    });

    it('should fail with empty metrics', () => {
      const result = validateReportConfig({ ...validConfig, metrics: [] });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('At least one metric must be selected');
    });

    it('should fail with missing dates', () => {
      const result = validateReportConfig({ ...validConfig, startDate: '', endDate: '' });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Start and end dates are required');
    });

    it('should fail when start date is after end date', () => {
      const result = validateReportConfig({ ...validConfig, startDate: '2026-02-01', endDate: '2026-01-01' });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Start date must be before end date');
    });

    it('should fail with invalid format', () => {
      const result = validateReportConfig({ ...validConfig, format: 'xlsx' });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Format must be pdf, csv, or json');
    });

    it('should fail with unknown metric', () => {
      const result = validateReportConfig({ ...validConfig, metrics: ['animals', 'unknown_metric'] });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Unknown metric: unknown_metric');
    });

    it('should accept all valid metrics', () => {
      const allMetrics = ['animals', 'adoptions', 'applications', 'intakes', 'outcomes', 'capacity'];
      const result = validateReportConfig({ ...validConfig, metrics: allMetrics });
      expect(result.valid).toBe(true);
    });
  });

  describe('determineTrend', () => {
    it('should return up for positive change > 2%', () => {
      expect(determineTrend(5)).toBe('up');
      expect(determineTrend(2.1)).toBe('up');
    });

    it('should return down for negative change < -2%', () => {
      expect(determineTrend(-5)).toBe('down');
      expect(determineTrend(-2.1)).toBe('down');
    });

    it('should return stable for small changes', () => {
      expect(determineTrend(0)).toBe('stable');
      expect(determineTrend(1.5)).toBe('stable');
      expect(determineTrend(-1.5)).toBe('stable');
    });
  });

  describe('formatMetricValue', () => {
    it('should format ratios as percentages', () => {
      expect(formatMetricValue(0.85, 'ratio')).toBe('85%');
      expect(formatMetricValue(0.5, 'percent')).toBe('50%');
    });

    it('should format days with decimal', () => {
      expect(formatMetricValue(3.5, 'days')).toBe('3.5 days');
    });

    it('should format currency with dollar sign', () => {
      expect(formatMetricValue(49.99, 'currency')).toBe('$49.99');
    });

    it('should format counts with locale string', () => {
      const formatted = formatMetricValue(1234, 'count');
      expect(formatted).toContain('1');
      expect(formatted).toContain('234');
    });
  });

  describe('buildReport', () => {
    it('should create a report with correct fields', () => {
      const metrics = [
        { name: 'Total Animals', value: 50, unit: 'count' },
        { name: 'Adoptions', value: 12, unit: 'count' },
      ];
      const report = buildReport(validConfig, metrics);

      expect(report.id).toMatch(/^rpt_/);
      expect(report.title).toBe('Monthly Summary');
      expect(report.metrics).toHaveLength(2);
      expect(report.version).toBe(1);
      expect(report.annotations).toEqual([]);
      expect(report.generatedAt).toBeDefined();
    });
  });

  describe('saveReport / getStoredReports / getReportById', () => {
    it('should save and retrieve reports', () => {
      const report = buildReport(validConfig, []);
      saveReport(report);

      const stored = getStoredReports();
      expect(stored).toHaveLength(1);
      expect(stored[0].id).toBe(report.id);
    });

    it('should retrieve report by ID', () => {
      const report = buildReport(validConfig, []);
      saveReport(report);

      const found = getReportById(report.id);
      expect(found).not.toBeNull();
      expect(found.title).toBe('Monthly Summary');
    });

    it('should return null for unknown report ID', () => {
      expect(getReportById('nonexistent')).toBeNull();
    });

    it('should keep most recent reports first', () => {
      const r1 = buildReport({ ...validConfig, title: 'First' }, []);
      const r2 = buildReport({ ...validConfig, title: 'Second' }, []);
      saveReport(r1);
      saveReport(r2);

      const stored = getStoredReports();
      expect(stored[0].title).toBe('Second');
      expect(stored[1].title).toBe('First');
    });

    it('should limit stored reports to 50', () => {
      for (let i = 0; i < 55; i++) {
        saveReport(buildReport({ ...validConfig, title: `Report ${i}` }, []));
      }
      expect(getStoredReports().length).toBeLessThanOrEqual(50);
    });
  });

  describe('addAnnotation', () => {
    it('should add annotation to a report', () => {
      const report = buildReport(validConfig, [{ name: 'Animals', value: 50, unit: 'count' }]);
      saveReport(report);

      const annotation = addAnnotation(report.id, 'Jane', 'Great month!', 'Animals');
      expect(annotation).not.toBeNull();
      expect(annotation.author).toBe('Jane');
      expect(annotation.text).toBe('Great month!');
      expect(annotation.metricName).toBe('Animals');

      const updated = getReportById(report.id);
      expect(updated.annotations).toHaveLength(1);
    });

    it('should return null for nonexistent report', () => {
      expect(addAnnotation('fake', 'User', 'Note')).toBeNull();
    });
  });

  describe('exportReportAsCsv', () => {
    it('should produce valid CSV with headers', () => {
      const report = buildReport(validConfig, [
        { name: 'Animals', value: 50, unit: 'count', trend: 'up', changePercent: 10 },
        { name: 'Adoptions', value: 12, unit: 'count' },
      ]);

      const csv = exportReportAsCsv(report);
      const lines = csv.split('\n');
      expect(lines[0]).toBe('Metric,Value,Unit,Trend,Change %');
      expect(lines[1]).toBe('Animals,50,count,up,10');
      expect(lines[2]).toBe('Adoptions,12,count,,');
    });

    it('should handle empty metrics', () => {
      const report = buildReport(validConfig, []);
      const csv = exportReportAsCsv(report);
      const lines = csv.split('\n');
      expect(lines).toHaveLength(1); // Just headers
    });
  });

  describe('exportReportAsJson', () => {
    it('should produce valid JSON', () => {
      const report = buildReport(validConfig, [
        { name: 'Animals', value: 50, unit: 'count' },
      ]);

      const json = exportReportAsJson(report);
      const parsed = JSON.parse(json);
      expect(parsed.title).toBe('Monthly Summary');
      expect(parsed.metrics).toHaveLength(1);
      expect(parsed.period.start).toBe('2026-01-01');
      expect(parsed.period.end).toBe('2026-01-31');
    });

    it('should include annotations', () => {
      const report = buildReport(validConfig, []);
      report.annotations = [{ id: 'a1', author: 'Bob', text: 'Note', createdAt: '2026-01-15T00:00:00Z' }];

      const json = exportReportAsJson(report);
      const parsed = JSON.parse(json);
      expect(parsed.annotations).toHaveLength(1);
    });
  });

  describe('Scheduled Reports', () => {
    it('should save and retrieve scheduled reports', () => {
      const schedule = {
        id: 'sch1',
        config: validConfig,
        frequency: 'monthly',
        nextRunAt: '2026-03-01T00:00:00Z',
        recipients: ['admin@shelter.com'],
        enabled: true,
      };

      saveScheduledReport(schedule);
      const stored = getScheduledReports();
      expect(stored).toHaveLength(1);
      expect(stored[0].id).toBe('sch1');
    });

    it('should update existing scheduled report', () => {
      const schedule = {
        id: 'sch2',
        config: validConfig,
        frequency: 'weekly',
        nextRunAt: '2026-02-23T00:00:00Z',
        recipients: ['admin@shelter.com'],
        enabled: true,
      };

      saveScheduledReport(schedule);
      saveScheduledReport({ ...schedule, enabled: false });

      const stored = getScheduledReports();
      expect(stored).toHaveLength(1);
      expect(stored[0].enabled).toBe(false);
    });
  });

  describe('calculateNextRun', () => {
    const base = new Date('2026-01-15T10:00:00Z');

    it('should calculate daily next run', () => {
      const next = calculateNextRun('daily', base);
      expect(new Date(next).getDate()).toBe(16);
    });

    it('should calculate weekly next run', () => {
      const next = calculateNextRun('weekly', base);
      expect(new Date(next).getDate()).toBe(22);
    });

    it('should calculate monthly next run', () => {
      const next = calculateNextRun('monthly', base);
      expect(new Date(next).getMonth()).toBe(1); // February
    });

    it('should calculate quarterly next run', () => {
      const next = calculateNextRun('quarterly', base);
      expect(new Date(next).getMonth()).toBe(3); // April
    });

    it('should calculate annual next run', () => {
      const next = calculateNextRun('annually', base);
      expect(new Date(next).getFullYear()).toBe(2027);
    });

    it('should default to current date when no base provided', () => {
      const next = calculateNextRun('daily');
      const nextDate = new Date(next);
      expect(nextDate.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('REPORT_TEMPLATES', () => {
    it('should define 6 templates', () => {
      expect(REPORT_TEMPLATES).toHaveLength(6);
    });

    it('should have unique IDs', () => {
      const ids = REPORT_TEMPLATES.map(t => t.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('should include SAC and Asilomar templates', () => {
      const names = REPORT_TEMPLATES.map(t => t.id);
      expect(names).toContain('sac-annual');
      expect(names).toContain('asilomar-annual');
    });

    it('should have valid frequency values', () => {
      const validFreqs = ['daily', 'weekly', 'monthly', 'quarterly', 'annually'];
      REPORT_TEMPLATES.forEach(t => {
        expect(validFreqs).toContain(t.frequency);
      });
    });

    it('should have non-empty metrics arrays', () => {
      REPORT_TEMPLATES.forEach(t => {
        expect(t.metrics.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Storage error handling', () => {
    it('should handle corrupted reports storage', () => {
      localStorage.setItem('sas_reports', 'not json');
      expect(getStoredReports()).toEqual([]);
    });

    it('should handle corrupted schedules storage', () => {
      localStorage.setItem('sas_report_schedules', 'bad');
      expect(getScheduledReports()).toEqual([]);
    });
  });
});
