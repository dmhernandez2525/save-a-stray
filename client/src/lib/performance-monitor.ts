export interface PerformanceBudget {
  lcp: number;
  fid: number;
  cls: number;
}

export interface PerformanceMetrics {
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  ttfb: number | null;
  fcp: number | null;
}

const DEFAULT_BUDGET: PerformanceBudget = {
  lcp: 2500,
  fid: 100,
  cls: 0.1,
};

let collectedMetrics: PerformanceMetrics = {
  lcp: null,
  fid: null,
  cls: null,
  ttfb: null,
  fcp: null,
};

type MetricCallback = (metrics: PerformanceMetrics) => void;
const listeners: MetricCallback[] = [];

export function observePerformance(budget: PerformanceBudget = DEFAULT_BUDGET): void {
  if (typeof PerformanceObserver === 'undefined') return;

  observeLCP();
  observeFID();
  observeCLS();
  observeNavigation();

  // Check budget after page load settles
  window.addEventListener('load', () => {
    setTimeout(() => checkBudget(budget), 5000);
  });
}

function observeLCP(): void {
  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1];
      collectedMetrics.lcp = last.startTime;
      notifyListeners();
    });
    observer.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch {
    // LCP not supported
  }
}

function observeFID(): void {
  try {
    const observer = new PerformanceObserver((list) => {
      const entry = list.getEntries()[0] as PerformanceEventTiming;
      collectedMetrics.fid = entry.processingStart - entry.startTime;
      notifyListeners();
    });
    observer.observe({ type: 'first-input', buffered: true });
  } catch {
    // FID not supported
  }
}

function observeCLS(): void {
  try {
    let clsValue = 0;
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const layoutShift = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
        if (!layoutShift.hadRecentInput) {
          clsValue += layoutShift.value;
        }
      }
      collectedMetrics.cls = clsValue;
      notifyListeners();
    });
    observer.observe({ type: 'layout-shift', buffered: true });
  } catch {
    // CLS not supported
  }
}

function observeNavigation(): void {
  try {
    const observer = new PerformanceObserver((list) => {
      const entry = list.getEntries()[0] as PerformanceNavigationTiming;
      collectedMetrics.ttfb = entry.responseStart - entry.requestStart;
      collectedMetrics.fcp = entry.responseEnd - entry.requestStart;
      notifyListeners();
    });
    observer.observe({ type: 'navigation', buffered: true });
  } catch {
    // Navigation timing not supported
  }
}

function checkBudget(budget: PerformanceBudget): void {
  const violations: string[] = [];

  if (collectedMetrics.lcp !== null && collectedMetrics.lcp > budget.lcp) {
    violations.push(`LCP: ${Math.round(collectedMetrics.lcp)}ms (budget: ${budget.lcp}ms)`);
  }
  if (collectedMetrics.fid !== null && collectedMetrics.fid > budget.fid) {
    violations.push(`FID: ${Math.round(collectedMetrics.fid)}ms (budget: ${budget.fid}ms)`);
  }
  if (collectedMetrics.cls !== null && collectedMetrics.cls > budget.cls) {
    violations.push(`CLS: ${collectedMetrics.cls.toFixed(3)} (budget: ${budget.cls})`);
  }

  if (violations.length > 0 && process.env.NODE_ENV === 'development') {
    console.warn('[Performance Budget Exceeded]', violations.join(', '));
  }
}

function notifyListeners(): void {
  for (const listener of listeners) {
    listener({ ...collectedMetrics });
  }
}

export function onMetricsUpdate(callback: MetricCallback): () => void {
  listeners.push(callback);
  return () => {
    const idx = listeners.indexOf(callback);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}

export function getMetrics(): PerformanceMetrics {
  return { ...collectedMetrics };
}

export function meetsPerformanceBudget(budget: PerformanceBudget = DEFAULT_BUDGET): boolean {
  if (collectedMetrics.lcp !== null && collectedMetrics.lcp > budget.lcp) return false;
  if (collectedMetrics.fid !== null && collectedMetrics.fid > budget.fid) return false;
  if (collectedMetrics.cls !== null && collectedMetrics.cls > budget.cls) return false;
  return true;
}
