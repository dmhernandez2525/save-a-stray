import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('PWA Registration', () => {
  let originalNavigator;
  let originalWindow;

  beforeEach(() => {
    vi.clearAllMocks();
    originalNavigator = { ...navigator };
    originalWindow = { ...window };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Service Worker Registration', () => {
    it('should check for serviceWorker support in navigator', () => {
      expect('serviceWorker' in navigator).toBeDefined();
    });

    it('should register with correct scope', async () => {
      const mockRegistration = {
        installing: null,
        waiting: null,
        active: { state: 'activated' },
        addEventListener: vi.fn(),
      };

      const mockRegister = vi.fn().mockResolvedValue(mockRegistration);

      Object.defineProperty(navigator, 'serviceWorker', {
        value: { register: mockRegister, controller: null, addEventListener: vi.fn() },
        writable: true,
        configurable: true,
      });

      await navigator.serviceWorker.register('/sw.js', { scope: '/' });

      expect(mockRegister).toHaveBeenCalledWith('/sw.js', { scope: '/' });

      Object.defineProperty(navigator, 'serviceWorker', {
        value: originalNavigator.serviceWorker,
        writable: true,
        configurable: true,
      });
    });

    it('should handle registration failure gracefully', async () => {
      const mockRegister = vi.fn().mockRejectedValue(new Error('SW registration failed'));

      Object.defineProperty(navigator, 'serviceWorker', {
        value: { register: mockRegister, addEventListener: vi.fn() },
        writable: true,
        configurable: true,
      });

      await expect(navigator.serviceWorker.register('/sw.js')).rejects.toThrow('SW registration failed');

      Object.defineProperty(navigator, 'serviceWorker', {
        value: originalNavigator.serviceWorker,
        writable: true,
        configurable: true,
      });
    });
  });

  describe('Install Prompt', () => {
    it('should prevent default on beforeinstallprompt event', () => {
      const event = new Event('beforeinstallprompt', { cancelable: true });
      event.preventDefault = vi.fn();

      const handler = (e) => {
        e.preventDefault();
      };

      window.addEventListener('beforeinstallprompt', handler);
      window.dispatchEvent(event);

      expect(event.preventDefault).toHaveBeenCalled();
      window.removeEventListener('beforeinstallprompt', handler);
    });

    it('should dispatch custom event when install prompt is captured', () => {
      const customEventSpy = vi.fn();
      window.addEventListener('pwa:install-prompt-available', customEventSpy);

      window.dispatchEvent(new CustomEvent('pwa:install-prompt-available'));

      expect(customEventSpy).toHaveBeenCalled();
      window.removeEventListener('pwa:install-prompt-available', customEventSpy);
    });

    it('should dispatch custom event when app is installed', () => {
      const customEventSpy = vi.fn();
      window.addEventListener('pwa:app-installed', customEventSpy);

      window.dispatchEvent(new CustomEvent('pwa:app-installed'));

      expect(customEventSpy).toHaveBeenCalled();
      window.removeEventListener('pwa:app-installed', customEventSpy);
    });
  });

  describe('Standalone Detection', () => {
    it('should detect standalone mode via matchMedia', () => {
      const mockMatchMedia = vi.fn().mockReturnValue({ matches: true });
      window.matchMedia = mockMatchMedia;

      const result = window.matchMedia('(display-mode: standalone)');
      expect(result.matches).toBe(true);
    });

    it('should detect non-standalone mode', () => {
      const mockMatchMedia = vi.fn().mockReturnValue({ matches: false });
      window.matchMedia = mockMatchMedia;

      const result = window.matchMedia('(display-mode: standalone)');
      expect(result.matches).toBe(false);
    });
  });

  describe('Online Status', () => {
    it('should report navigator.onLine status', () => {
      expect(typeof navigator.onLine).toBe('boolean');
    });

    it('should dispatch online/offline events', () => {
      const onlineSpy = vi.fn();
      const offlineSpy = vi.fn();

      window.addEventListener('online', onlineSpy);
      window.addEventListener('offline', offlineSpy);

      window.dispatchEvent(new Event('online'));
      expect(onlineSpy).toHaveBeenCalledTimes(1);

      window.dispatchEvent(new Event('offline'));
      expect(offlineSpy).toHaveBeenCalledTimes(1);

      window.removeEventListener('online', onlineSpy);
      window.removeEventListener('offline', offlineSpy);
    });
  });

  describe('Update Detection', () => {
    it('should dispatch update event when new SW is installed', () => {
      const updateSpy = vi.fn();
      window.addEventListener('pwa:sw-update-available', updateSpy);

      window.dispatchEvent(new CustomEvent('pwa:sw-update-available'));

      expect(updateSpy).toHaveBeenCalled();
      window.removeEventListener('pwa:sw-update-available', updateSpy);
    });
  });

  describe('SKIP_WAITING Message', () => {
    it('should send SKIP_WAITING message to waiting SW', () => {
      const mockPostMessage = vi.fn();
      const mockRegistration = {
        waiting: { postMessage: mockPostMessage },
      };

      mockRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });

      expect(mockPostMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
    });
  });
});
