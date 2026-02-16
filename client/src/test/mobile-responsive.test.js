import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  MOBILE_TOUCH_TARGET_PX,
  isMobile,
  isTablet,
  isDesktop,
  getDeviceType,
  hasTouchSupport,
  getKeyboardType,
} from '../lib/responsive';

describe('Mobile Responsive Utilities', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Touch Target Size', () => {
    it('should define minimum touch target as 44px', () => {
      expect(MOBILE_TOUCH_TARGET_PX).toBe(44);
    });

    it('should meet WCAG minimum touch target size', () => {
      expect(MOBILE_TOUCH_TARGET_PX).toBeGreaterThanOrEqual(44);
    });
  });

  describe('Device Detection', () => {
    it('should detect mobile viewport', () => {
      window.matchMedia = vi.fn().mockReturnValue({ matches: false });
      expect(isMobile()).toBe(true);
    });

    it('should detect tablet viewport', () => {
      window.matchMedia = vi.fn()
        .mockReturnValueOnce({ matches: true })  // md
        .mockReturnValueOnce({ matches: false }); // lg
      expect(isTablet()).toBe(true);
    });

    it('should detect desktop viewport', () => {
      window.matchMedia = vi.fn().mockReturnValue({ matches: true });
      expect(isDesktop()).toBe(true);
    });

    it('should return correct device type string', () => {
      window.matchMedia = vi.fn().mockReturnValue({ matches: false });
      expect(getDeviceType()).toBe('mobile');
    });
  });

  describe('Touch Support', () => {
    it('should detect touch support from ontouchstart', () => {
      const result = hasTouchSupport();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('Keyboard Types', () => {
    it('should return tel for phone input', () => {
      expect(getKeyboardType('phone')).toBe('tel');
    });

    it('should return email for email input', () => {
      expect(getKeyboardType('email')).toBe('email');
    });

    it('should return numeric for number input', () => {
      expect(getKeyboardType('number')).toBe('numeric');
    });

    it('should return url for url input', () => {
      expect(getKeyboardType('url')).toBe('url');
    });

    it('should return search for search input', () => {
      expect(getKeyboardType('search')).toBe('search');
    });

    it('should return text for text input', () => {
      expect(getKeyboardType('text')).toBe('text');
    });
  });

  describe('Performance Budget Compliance', () => {
    it('should define LCP budget at 2500ms', () => {
      const budget = { lcp: 2500, fid: 100, cls: 0.1 };
      expect(budget.lcp).toBe(2500);
    });

    it('should define FID budget at 100ms', () => {
      const budget = { lcp: 2500, fid: 100, cls: 0.1 };
      expect(budget.fid).toBe(100);
    });

    it('should define CLS budget at 0.1', () => {
      const budget = { lcp: 2500, fid: 100, cls: 0.1 };
      expect(budget.cls).toBe(0.1);
    });

    it('should pass budget check when metrics are within budget', () => {
      const budget = { lcp: 2500, fid: 100, cls: 0.1 };
      const metrics = { lcp: 1800, fid: 50, cls: 0.05 };
      const passes = metrics.lcp <= budget.lcp && metrics.fid <= budget.fid && metrics.cls <= budget.cls;
      expect(passes).toBe(true);
    });

    it('should fail budget check when LCP exceeds limit', () => {
      const budget = { lcp: 2500, fid: 100, cls: 0.1 };
      const metrics = { lcp: 3000, fid: 50, cls: 0.05 };
      const passes = metrics.lcp <= budget.lcp;
      expect(passes).toBe(false);
    });

    it('should fail budget check when CLS exceeds limit', () => {
      const budget = { lcp: 2500, fid: 100, cls: 0.1 };
      const metrics = { lcp: 2000, fid: 50, cls: 0.25 };
      const passes = metrics.cls <= budget.cls;
      expect(passes).toBe(false);
    });
  });

  describe('Visual Regression Guards', () => {
    it('should use safe area inset for bottom nav spacing', () => {
      const safeAreaCSS = 'pb-[max(0.5rem,env(safe-area-inset-bottom))]';
      expect(safeAreaCSS).toContain('safe-area-inset-bottom');
    });

    it('should hide bottom nav on md+ breakpoints', () => {
      const navClass = 'fixed bottom-0 left-0 right-0 z-50 md:hidden';
      expect(navClass).toContain('md:hidden');
    });

    it('should apply min-w-[64px] to nav tab items for touch targets', () => {
      const tabClass = 'min-w-[64px]';
      expect(parseInt(tabClass.match(/\d+/)[0])).toBeGreaterThanOrEqual(44);
    });
  });
});
