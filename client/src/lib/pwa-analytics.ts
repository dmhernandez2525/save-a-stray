import { isStandalone, isOnline } from './pwa';

interface PwaMetrics {
  installed: boolean;
  standalone: boolean;
  online: boolean;
  installPromptShown: number;
  installAccepted: number;
  installDismissed: number;
  offlineSessions: number;
  cacheHits: number;
  cacheMisses: number;
}

const METRICS_KEY = 'pwa-analytics';

function getMetrics(): PwaMetrics {
  try {
    const stored = localStorage.getItem(METRICS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // Ignore parse errors
  }
  return {
    installed: false,
    standalone: isStandalone(),
    online: isOnline(),
    installPromptShown: 0,
    installAccepted: 0,
    installDismissed: 0,
    offlineSessions: 0,
    cacheHits: 0,
    cacheMisses: 0,
  };
}

function saveMetrics(metrics: PwaMetrics): void {
  localStorage.setItem(METRICS_KEY, JSON.stringify(metrics));
}

function incrementMetric(key: keyof PwaMetrics): void {
  const metrics = getMetrics();
  const current = metrics[key];
  if (typeof current === 'number') {
    (metrics[key] as number) = current + 1;
    saveMetrics(metrics);
  }
}

export function initPwaAnalytics(): void {
  window.addEventListener('pwa:install-prompt-available', () => {
    incrementMetric('installPromptShown');
  });

  window.addEventListener('pwa:app-installed', () => {
    const metrics = getMetrics();
    metrics.installed = true;
    metrics.installAccepted += 1;
    saveMetrics(metrics);
  });

  window.addEventListener('offline', () => {
    incrementMetric('offlineSessions');
  });

  const metrics = getMetrics();
  metrics.standalone = isStandalone();
  metrics.online = isOnline();
  saveMetrics(metrics);
}

export function trackInstallDismissed(): void {
  incrementMetric('installDismissed');
}

export function getPwaAnalytics(): PwaMetrics {
  return getMetrics();
}
