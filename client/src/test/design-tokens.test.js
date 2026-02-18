import { describe, it, expect } from 'vitest';
import {
  COLOR_TOKENS, SPACING_TOKENS, TYPOGRAPHY_TOKENS, BREAKPOINT_TOKENS,
} from '../lib/design-tokens';

describe('Design Tokens', () => {
  describe('COLOR_TOKENS', () => {
    it('should define skyBlue palette', () => {
      expect(COLOR_TOKENS.skyBlue).toBeDefined();
      expect(Object.keys(COLOR_TOKENS.skyBlue).length).toBeGreaterThanOrEqual(10);
    });

    it('should define salmon palette', () => {
      expect(COLOR_TOKENS.salmon).toBeDefined();
      expect(COLOR_TOKENS.salmon[500]).toBeDefined();
    });

    it('should define gold palette', () => {
      expect(COLOR_TOKENS.gold).toBeDefined();
    });

    it('should define warmGray palette', () => {
      expect(COLOR_TOKENS.warmGray).toBeDefined();
      expect(Object.keys(COLOR_TOKENS.warmGray).length).toBeGreaterThanOrEqual(10);
    });

    it('should use valid HSL format', () => {
      const hslRegex = /^hsl\(\d+\s+\d+%\s+\d+%\)$/;
      Object.values(COLOR_TOKENS.skyBlue).forEach(color => {
        expect(color).toMatch(hslRegex);
      });
    });

    it('should have consistent shade keys', () => {
      const shades = ['50', '100', '200', '300', '400', '500'];
      shades.forEach(shade => {
        expect(COLOR_TOKENS.skyBlue[shade]).toBeDefined();
        expect(COLOR_TOKENS.salmon[shade]).toBeDefined();
      });
    });
  });

  describe('SPACING_TOKENS', () => {
    it('should define spacing scale', () => {
      expect(Object.keys(SPACING_TOKENS).length).toBeGreaterThan(10);
    });

    it('should start with 0', () => {
      expect(SPACING_TOKENS[0]).toBe('0rem');
    });

    it('should use rem units', () => {
      Object.values(SPACING_TOKENS).forEach(value => {
        expect(value).toMatch(/rem$/);
      });
    });

    it('should have increasing values', () => {
      const numericKeys = Object.keys(SPACING_TOKENS).map(Number).sort((a, b) => a - b);
      for (let i = 1; i < numericKeys.length; i++) {
        expect(numericKeys[i]).toBeGreaterThan(numericKeys[i - 1]);
      }
    });
  });

  describe('TYPOGRAPHY_TOKENS', () => {
    it('should define font families', () => {
      expect(TYPOGRAPHY_TOKENS.fonts.heading).toContain('Capriola');
      expect(TYPOGRAPHY_TOKENS.fonts.body).toContain('Nunito');
      expect(TYPOGRAPHY_TOKENS.fonts.mono).toContain('monospace');
    });

    it('should define font sizes', () => {
      expect(TYPOGRAPHY_TOKENS.sizes.base).toBe('1rem');
      expect(Object.keys(TYPOGRAPHY_TOKENS.sizes).length).toBeGreaterThan(5);
    });

    it('should use rem units for sizes', () => {
      Object.values(TYPOGRAPHY_TOKENS.sizes).forEach(size => {
        expect(size).toMatch(/rem$/);
      });
    });
  });

  describe('BREAKPOINT_TOKENS', () => {
    it('should define standard breakpoints', () => {
      expect(BREAKPOINT_TOKENS.sm).toBe(640);
      expect(BREAKPOINT_TOKENS.md).toBe(768);
      expect(BREAKPOINT_TOKENS.lg).toBe(1024);
      expect(BREAKPOINT_TOKENS.xl).toBe(1280);
    });

    it('should have increasing values', () => {
      expect(BREAKPOINT_TOKENS.md).toBeGreaterThan(BREAKPOINT_TOKENS.sm);
      expect(BREAKPOINT_TOKENS.lg).toBeGreaterThan(BREAKPOINT_TOKENS.md);
      expect(BREAKPOINT_TOKENS.xl).toBeGreaterThan(BREAKPOINT_TOKENS.lg);
    });

    it('should use numeric values in pixels', () => {
      Object.values(BREAKPOINT_TOKENS).forEach(value => {
        expect(typeof value).toBe('number');
        expect(value).toBeGreaterThan(0);
      });
    });
  });
});
