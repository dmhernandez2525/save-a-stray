import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Frontend Utility Smoke Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('localStorage mock', () => {
    it('should allow setting and getting items', () => {
      localStorage.setItem('auth-token', 'test-token-123');
      expect(localStorage.setItem).toHaveBeenCalledWith('auth-token', 'test-token-123');
    });

    it('should allow removing items', () => {
      localStorage.removeItem('auth-token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('auth-token');
    });

    it('should allow clearing storage', () => {
      localStorage.clear();
      expect(localStorage.clear).toHaveBeenCalled();
    });
  });

  describe('Environment detection', () => {
    it('should detect test environment', () => {
      // Vitest sets import.meta.env.MODE
      expect(typeof import.meta.env).toBe('object');
    });
  });

  describe('React Testing Library setup', () => {
    it('should have jest-dom matchers available', () => {
      // Create a simple DOM element to test matchers
      const div = document.createElement('div');
      div.textContent = 'Hello World';
      document.body.appendChild(div);

      expect(div).toBeInTheDocument();
      expect(div).toHaveTextContent('Hello World');
      expect(div).toBeVisible();

      document.body.removeChild(div);
    });
  });
});
