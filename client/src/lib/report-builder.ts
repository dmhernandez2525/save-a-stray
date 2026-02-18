/**
 * Client-side report builder utilities for generating, formatting,
 * and exporting shelter reports in various formats.
 */

export interface ReportConfig {
  title: string;
  shelterId: string;
  metrics: string[];
  startDate: string;
  endDate: string;
  format: 'pdf' | 'csv' | 'json';
  frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
}

export interface ReportMetric {
  name: string;
  value: number;
  unit: string;
  trend?: 'up' | 'down' | 'stable';
  changePercent?: number;
}

export interface GeneratedReport {
  id: string;
  title: string;
  config: ReportConfig;
  metrics: ReportMetric[];
  generatedAt: string;
  version: number;
  annotations: ReportAnnotation[];
}

export interface ReportAnnotation {
  id: string;
  author: string;
  text: string;
  metricName?: string;
  createdAt: string;
}

export interface ScheduledReport {
  id: string;
  config: ReportConfig;
  frequency: string;
  nextRunAt: string;
  recipients: string[];
  enabled: boolean;
}

const REPORTS_KEY = 'sas_reports';
const SCHEDULES_KEY = 'sas_report_schedules';

function generateId(): string {
  return `rpt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Validate a report configuration before building.
 */
export function validateReportConfig(config: ReportConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.title || config.title.trim().length === 0) {
    errors.push('Report title is required');
  }
  if (!config.shelterId) {
    errors.push('Shelter ID is required');
  }
  if (!config.metrics || config.metrics.length === 0) {
    errors.push('At least one metric must be selected');
  }
  if (!config.startDate || !config.endDate) {
    errors.push('Start and end dates are required');
  }
  if (config.startDate && config.endDate && new Date(config.startDate) > new Date(config.endDate)) {
    errors.push('Start date must be before end date');
  }
  if (!['pdf', 'csv', 'json'].includes(config.format)) {
    errors.push('Format must be pdf, csv, or json');
  }

  const validMetrics = ['animals', 'adoptions', 'applications', 'intakes', 'outcomes', 'capacity'];
  for (const m of config.metrics) {
    if (!validMetrics.includes(m)) {
      errors.push(`Unknown metric: ${m}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Determine the trend direction from a percentage change.
 */
export function determineTrend(changePercent: number): 'up' | 'down' | 'stable' {
  if (changePercent > 2) return 'up';
  if (changePercent < -2) return 'down';
  return 'stable';
}

/**
 * Format a metric value with its unit for display.
 */
export function formatMetricValue(value: number, unit: string): string {
  if (unit === 'ratio' || unit === 'percent') {
    return `${Math.round(value * 100)}%`;
  }
  if (unit === 'days') {
    return `${value.toFixed(1)} days`;
  }
  if (unit === 'currency') {
    return `$${value.toFixed(2)}`;
  }
  return value.toLocaleString();
}

/**
 * Store a generated report locally.
 */
export function saveReport(report: GeneratedReport): void {
  try {
    const raw = localStorage.getItem(REPORTS_KEY);
    const reports: GeneratedReport[] = raw ? JSON.parse(raw) : [];
    reports.unshift(report);
    // Keep last 50 reports
    const trimmed = reports.slice(0, 50);
    localStorage.setItem(REPORTS_KEY, JSON.stringify(trimmed));
  } catch {
    // Storage unavailable
  }
}

/**
 * Get all stored reports.
 */
export function getStoredReports(): GeneratedReport[] {
  try {
    const raw = localStorage.getItem(REPORTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Get a specific report by ID.
 */
export function getReportById(id: string): GeneratedReport | null {
  const reports = getStoredReports();
  return reports.find(r => r.id === id) ?? null;
}

/**
 * Add an annotation to a report.
 */
export function addAnnotation(reportId: string, author: string, text: string, metricName?: string): ReportAnnotation | null {
  const reports = getStoredReports();
  const report = reports.find(r => r.id === reportId);
  if (!report) return null;

  const annotation: ReportAnnotation = {
    id: generateId(),
    author,
    text,
    metricName,
    createdAt: new Date().toISOString(),
  };

  report.annotations.push(annotation);
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
  return annotation;
}

/**
 * Create a new report from configuration and metrics data.
 */
export function buildReport(config: ReportConfig, metrics: ReportMetric[]): GeneratedReport {
  return {
    id: generateId(),
    title: config.title,
    config,
    metrics,
    generatedAt: new Date().toISOString(),
    version: 1,
    annotations: [],
  };
}

/**
 * Export a report's metrics as CSV string.
 */
export function exportReportAsCsv(report: GeneratedReport): string {
  const headers = ['Metric', 'Value', 'Unit', 'Trend', 'Change %'];
  const rows = report.metrics.map(m => [
    m.name,
    String(m.value),
    m.unit,
    m.trend ?? '',
    m.changePercent !== undefined ? String(m.changePercent) : '',
  ]);
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

/**
 * Export a report as JSON string.
 */
export function exportReportAsJson(report: GeneratedReport): string {
  return JSON.stringify({
    title: report.title,
    generatedAt: report.generatedAt,
    period: {
      start: report.config.startDate,
      end: report.config.endDate,
    },
    metrics: report.metrics,
    annotations: report.annotations,
  }, null, 2);
}

/**
 * Save a scheduled report configuration.
 */
export function saveScheduledReport(schedule: ScheduledReport): void {
  try {
    const raw = localStorage.getItem(SCHEDULES_KEY);
    const schedules: ScheduledReport[] = raw ? JSON.parse(raw) : [];
    const existing = schedules.findIndex(s => s.id === schedule.id);
    if (existing >= 0) {
      schedules[existing] = schedule;
    } else {
      schedules.push(schedule);
    }
    localStorage.setItem(SCHEDULES_KEY, JSON.stringify(schedules));
  } catch {
    // Storage unavailable
  }
}

/**
 * Get all scheduled reports.
 */
export function getScheduledReports(): ScheduledReport[] {
  try {
    const raw = localStorage.getItem(SCHEDULES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Calculate the next run date for a scheduled report.
 */
export function calculateNextRun(frequency: string, fromDate?: Date): string {
  const from = fromDate || new Date();
  const next = new Date(from);

  const frequencyMap: Record<string, () => void> = {
    daily: () => next.setDate(next.getDate() + 1),
    weekly: () => next.setDate(next.getDate() + 7),
    monthly: () => next.setMonth(next.getMonth() + 1),
    quarterly: () => next.setMonth(next.getMonth() + 3),
    annually: () => next.setFullYear(next.getFullYear() + 1),
  };

  const handler = frequencyMap[frequency];
  if (handler) handler();

  return next.toISOString();
}

/**
 * Available report template definitions.
 */
export const REPORT_TEMPLATES = [
  { id: 'monthly-summary', name: 'Monthly Summary', metrics: ['animals', 'adoptions', 'applications', 'intakes', 'outcomes'], frequency: 'monthly' },
  { id: 'grant-report', name: 'Grant Reporting', metrics: ['animals', 'adoptions', 'intakes', 'outcomes', 'capacity'], frequency: 'quarterly' },
  { id: 'board-update', name: 'Board Update', metrics: ['animals', 'adoptions', 'applications', 'capacity'], frequency: 'monthly' },
  { id: 'sac-annual', name: 'Shelter Animals Count', metrics: ['animals', 'adoptions', 'intakes', 'outcomes'], frequency: 'annually' },
  { id: 'asilomar-annual', name: 'Asilomar Accords', metrics: ['animals', 'adoptions', 'outcomes'], frequency: 'annually' },
  { id: 'adoption-funnel', name: 'Adoption Funnel', metrics: ['applications', 'adoptions'], frequency: 'weekly' },
] as const;
