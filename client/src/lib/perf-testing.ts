// ── Performance Testing Utilities ─────────────────────────────
// Tools for measuring and enforcing performance budgets

export interface PerformanceBudget {
  metric: string;
  budget: number;
  unit: 'ms' | 'kb' | 'count' | 'ratio';
  category: 'loading' | 'runtime' | 'network' | 'bundle';
}

export const PERFORMANCE_BUDGETS: PerformanceBudget[] = [
  { metric: 'firstContentfulPaint', budget: 1800, unit: 'ms', category: 'loading' },
  { metric: 'largestContentfulPaint', budget: 2500, unit: 'ms', category: 'loading' },
  { metric: 'timeToInteractive', budget: 3500, unit: 'ms', category: 'loading' },
  { metric: 'totalBlockingTime', budget: 300, unit: 'ms', category: 'runtime' },
  { metric: 'cumulativeLayoutShift', budget: 0.1, unit: 'ratio', category: 'loading' },
  { metric: 'firstInputDelay', budget: 100, unit: 'ms', category: 'runtime' },
  { metric: 'bundleSize', budget: 500, unit: 'kb', category: 'bundle' },
  { metric: 'initialLoadSize', budget: 200, unit: 'kb', category: 'bundle' },
  { metric: 'imageOptimization', budget: 100, unit: 'kb', category: 'network' },
  { metric: 'apiLatencyP95', budget: 100, unit: 'ms', category: 'network' },
];

export interface QueryBenchmark {
  name: string;
  p50Target: number;
  p95Target: number;
  p99Target: number;
}

export const QUERY_BENCHMARKS: QueryBenchmark[] = [
  { name: 'animals', p50Target: 20, p95Target: 50, p99Target: 100 },
  { name: 'animal', p50Target: 10, p95Target: 30, p99Target: 60 },
  { name: 'shelters', p50Target: 15, p95Target: 40, p99Target: 80 },
  { name: 'shelter', p50Target: 10, p95Target: 30, p99Target: 60 },
  { name: 'searchAnimals', p50Target: 30, p95Target: 80, p99Target: 150 },
  { name: 'shelterAnalytics', p50Target: 50, p95Target: 150, p99Target: 300 },
  { name: 'platformOverview', p50Target: 40, p95Target: 100, p99Target: 200 },
];

// ── Performance Measurement ───────────────────────────────────

export interface TimingResult {
  name: string;
  duration: number;
  timestamp: number;
}

const MAX_MEASUREMENTS = 10000;
const measurements: TimingResult[] = [];

export function startMeasure(name: string): () => number {
  const start = performance.now();
  return () => {
    const duration = Math.round((performance.now() - start) * 100) / 100;
    if (measurements.length >= MAX_MEASUREMENTS) {
      measurements.splice(0, Math.floor(MAX_MEASUREMENTS / 4));
    }
    measurements.push({ name, duration, timestamp: Date.now() });
    return duration;
  };
}

export function getMeasurements(name?: string): TimingResult[] {
  return name ? measurements.filter(m => m.name === name) : [...measurements];
}

export function clearMeasurements(): void {
  measurements.length = 0;
}

export function getPercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

export function getStats(values: number[]): {
  min: number; max: number; mean: number; median: number;
  p95: number; p99: number; stdDev: number;
} {
  if (values.length === 0) return { min: 0, max: 0, mean: 0, median: 0, p95: 0, p99: 0, stdDev: 0 };
  const sorted = [...values].sort((a, b) => a - b);
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;

  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    mean: Math.round(mean * 100) / 100,
    median: getPercentile(values, 50),
    p95: getPercentile(values, 95),
    p99: getPercentile(values, 99),
    stdDev: Math.round(Math.sqrt(variance) * 100) / 100,
  };
}

// ── Budget Checking ───────────────────────────────────────────

export interface BudgetResult {
  metric: string;
  value: number;
  budget: number;
  passed: boolean;
  overshoot: number;
}

export function checkBudget(metric: string, value: number): BudgetResult | null {
  const budget = PERFORMANCE_BUDGETS.find(b => b.metric === metric);
  if (!budget) return null;
  return {
    metric,
    value,
    budget: budget.budget,
    passed: value <= budget.budget,
    overshoot: Math.max(0, value - budget.budget),
  };
}

export function checkAllBudgets(metrics: Record<string, number>): BudgetResult[] {
  return Object.entries(metrics)
    .map(([metric, value]) => checkBudget(metric, value))
    .filter((r): r is BudgetResult => r !== null);
}

// ── Cache Analysis ────────────────────────────────────────────

export interface CacheMetrics {
  hits: number;
  misses: number;
  hitRate: number;
  avgHitLatency: number;
  avgMissLatency: number;
}

export function calculateCacheMetrics(
  hits: number, misses: number,
  hitLatencies: number[], missLatencies: number[]
): CacheMetrics {
  const total = hits + misses;
  return {
    hits,
    misses,
    hitRate: total > 0 ? Math.round((hits / total) * 10000) / 10000 : 0,
    avgHitLatency: hitLatencies.length > 0
      ? Math.round(hitLatencies.reduce((s, v) => s + v, 0) / hitLatencies.length * 100) / 100
      : 0,
    avgMissLatency: missLatencies.length > 0
      ? Math.round(missLatencies.reduce((s, v) => s + v, 0) / missLatencies.length * 100) / 100
      : 0,
  };
}

// ── Bundle Size Analysis ──────────────────────────────────────

export interface BundleChunk {
  name: string;
  sizeKb: number;
  isAsync: boolean;
}

export function analyzeBundles(chunks: BundleChunk[]): {
  totalSizeKb: number;
  initialSizeKb: number;
  asyncSizeKb: number;
  largestChunk: string;
  chunkCount: number;
} {
  if (chunks.length === 0) {
    return { totalSizeKb: 0, initialSizeKb: 0, asyncSizeKb: 0, largestChunk: '', chunkCount: 0 };
  }

  const totalSizeKb = chunks.reduce((s, c) => s + c.sizeKb, 0);
  const initial = chunks.filter(c => !c.isAsync);
  const async = chunks.filter(c => c.isAsync);
  const largest = chunks.reduce((max, c) => c.sizeKb > max.sizeKb ? c : max, chunks[0]);

  return {
    totalSizeKb: Math.round(totalSizeKb * 100) / 100,
    initialSizeKb: Math.round(initial.reduce((s, c) => s + c.sizeKb, 0) * 100) / 100,
    asyncSizeKb: Math.round(async.reduce((s, c) => s + c.sizeKb, 0) * 100) / 100,
    largestChunk: largest?.name || '',
    chunkCount: chunks.length,
  };
}
