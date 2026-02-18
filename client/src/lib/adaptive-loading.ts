export type ConnectionSpeed = '4g' | '3g' | '2g' | 'slow-2g' | 'unknown';
export type LoadingTier = 'full' | 'reduced' | 'minimal';

interface NetworkInformation {
  effectiveType: ConnectionSpeed;
  downlink: number;
  rtt: number;
  saveData: boolean;
  addEventListener: (type: string, listener: () => void) => void;
  removeEventListener: (type: string, listener: () => void) => void;
}

function getConnection(): NetworkInformation | null {
  const nav = navigator as unknown as Record<string, unknown>;
  return (nav.connection || nav.mozConnection || nav.webkitConnection) as NetworkInformation | null;
}

export function getConnectionSpeed(): ConnectionSpeed {
  const connection = getConnection();
  if (!connection) return 'unknown';
  return connection.effectiveType;
}

export function getLoadingTier(): LoadingTier {
  const connection = getConnection();
  if (!connection) return 'full';

  if (connection.saveData) return 'minimal';

  const tierMap: Record<ConnectionSpeed, LoadingTier> = {
    '4g': 'full',
    '3g': 'reduced',
    '2g': 'minimal',
    'slow-2g': 'minimal',
    'unknown': 'full',
  };

  return tierMap[connection.effectiveType] ?? 'full';
}

export function shouldLoadImages(): boolean {
  return getLoadingTier() !== 'minimal';
}

export function getImageQuality(): 'high' | 'medium' | 'low' {
  const qualityMap: Record<LoadingTier, 'high' | 'medium' | 'low'> = {
    full: 'high',
    reduced: 'medium',
    minimal: 'low',
  };
  return qualityMap[getLoadingTier()];
}

export function shouldAutoplayAnimations(): boolean {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return false;
  return getLoadingTier() === 'full';
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function onConnectionChange(callback: (speed: ConnectionSpeed) => void): () => void {
  const connection = getConnection();
  if (!connection) return () => {};

  const handler = (): void => callback(connection.effectiveType);
  connection.addEventListener('change', handler);
  return () => connection.removeEventListener('change', handler);
}

export function getOptimalImageWidth(): number {
  const dpr = window.devicePixelRatio || 1;
  const screenWidth = window.innerWidth;
  const tier = getLoadingTier();

  const maxWidthMap: Record<LoadingTier, number> = {
    full: 1200,
    reduced: 800,
    minimal: 400,
  };

  return Math.min(screenWidth * dpr, maxWidthMap[tier]);
}

export function buildResponsiveSrcSet(
  baseUrl: string,
  widths: number[] = [320, 640, 960, 1280]
): string {
  const tier = getLoadingTier();
  const filteredWidths = tier === 'minimal'
    ? widths.filter(w => w <= 640)
    : tier === 'reduced'
      ? widths.filter(w => w <= 960)
      : widths;

  return filteredWidths
    .map(w => `${baseUrl}?w=${w} ${w}w`)
    .join(', ');
}
