import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const METRICS_KEY = 'pwa-analytics';

function getMetrics() {
  try {
    const stored = localStorage.getItem(METRICS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // Ignore
  }
  return {
    installed: false,
    standalone: false,
    online: true,
    installPromptShown: 0,
    installAccepted: 0,
    installDismissed: 0,
    offlineSessions: 0,
    cacheHits: 0,
    cacheMisses: 0,
  };
}

function saveMetrics(metrics) {
  localStorage.setItem(METRICS_KEY, JSON.stringify(metrics));
}

function incrementMetric(key) {
  const metrics = getMetrics();
  if (typeof metrics[key] === 'number') {
    metrics[key] += 1;
    saveMetrics(metrics);
  }
}

describe('PWA Analytics', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should return default metrics when none stored', () => {
    const metrics = getMetrics();
    expect(metrics.installed).toBe(false);
    expect(metrics.installPromptShown).toBe(0);
    expect(metrics.offlineSessions).toBe(0);
  });

  it('should persist metrics to localStorage', () => {
    const metrics = getMetrics();
    metrics.installed = true;
    saveMetrics(metrics);

    const stored = JSON.parse(localStorage.getItem(METRICS_KEY));
    expect(stored.installed).toBe(true);
  });

  it('should increment installPromptShown', () => {
    incrementMetric('installPromptShown');
    incrementMetric('installPromptShown');

    const metrics = getMetrics();
    expect(metrics.installPromptShown).toBe(2);
  });

  it('should increment installAccepted', () => {
    incrementMetric('installAccepted');

    const metrics = getMetrics();
    expect(metrics.installAccepted).toBe(1);
  });

  it('should increment installDismissed', () => {
    incrementMetric('installDismissed');
    incrementMetric('installDismissed');
    incrementMetric('installDismissed');

    const metrics = getMetrics();
    expect(metrics.installDismissed).toBe(3);
  });

  it('should increment offlineSessions', () => {
    incrementMetric('offlineSessions');

    const metrics = getMetrics();
    expect(metrics.offlineSessions).toBe(1);
  });

  it('should track install rates (accepted / shown)', () => {
    incrementMetric('installPromptShown');
    incrementMetric('installPromptShown');
    incrementMetric('installPromptShown');
    incrementMetric('installAccepted');

    const metrics = getMetrics();
    const rate = metrics.installPromptShown > 0
      ? metrics.installAccepted / metrics.installPromptShown
      : 0;

    expect(rate).toBeCloseTo(0.333, 2);
  });

  it('should handle corrupted localStorage gracefully', () => {
    localStorage.setItem(METRICS_KEY, 'invalid json{{{');

    const metrics = getMetrics();
    expect(metrics.installed).toBe(false);
    expect(metrics.installPromptShown).toBe(0);
  });

  it('should not increment non-numeric fields', () => {
    incrementMetric('installed');

    const metrics = getMetrics();
    expect(metrics.installed).toBe(false);
  });

  it('should track cache hits and misses', () => {
    incrementMetric('cacheHits');
    incrementMetric('cacheHits');
    incrementMetric('cacheMisses');

    const metrics = getMetrics();
    const hitRate = metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses);
    expect(hitRate).toBeCloseTo(0.667, 2);
  });
});
