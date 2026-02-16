interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferredInstallPrompt: BeforeInstallPromptEvent | null = null;
let swRegistration: ServiceWorkerRegistration | null = null;

export function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
      swRegistration = registration;

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            dispatchPwaEvent('sw-update-available');
          }
        });
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'SW registration failed';
      dispatchPwaEvent('sw-error', { message });
    }
  });
}

export function captureInstallPrompt(): void {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    deferredInstallPrompt = e as BeforeInstallPromptEvent;
    dispatchPwaEvent('install-prompt-available');
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    dispatchPwaEvent('app-installed');
  });
}

export async function promptInstall(): Promise<boolean> {
  if (!deferredInstallPrompt) return false;

  await deferredInstallPrompt.prompt();
  const { outcome } = await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  return outcome === 'accepted';
}

export function isInstallAvailable(): boolean {
  return deferredInstallPrompt !== null;
}

export function applyServiceWorkerUpdate(): void {
  if (!swRegistration?.waiting) return;
  swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
  window.location.reload();
}

export function getRegistration(): ServiceWorkerRegistration | null {
  return swRegistration;
}

function dispatchPwaEvent(type: string, detail?: Record<string, unknown>): void {
  window.dispatchEvent(new CustomEvent(`pwa:${type}`, { detail }));
}

export function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator && (navigator as Record<string, unknown>).standalone === true)
  );
}

export function isOnline(): boolean {
  return navigator.onLine;
}

export function onSyncComplete(callback: (replayed: number, remaining: number) => void): void {
  navigator.serviceWorker?.addEventListener('message', (event) => {
    if (event.data?.type === 'SYNC_COMPLETE') {
      callback(event.data.replayed, event.data.remaining);
    }
  });
}

export function onOnlineStatusChange(callback: (online: boolean) => void): () => void {
  const onOnline = (): void => callback(true);
  const onOffline = (): void => callback(false);
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
}
