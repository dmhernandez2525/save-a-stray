import { describe, it, expect, vi, beforeEach } from 'vitest';
import { detectSwipeDirection, createLongPressHandler } from '../lib/touch-gestures';

describe('Touch Gestures', () => {
  describe('detectSwipeDirection', () => {
    it('should detect left swipe', () => {
      const result = detectSwipeDirection(200, 100, 100, 100);
      expect(result).toBe('left');
    });

    it('should detect right swipe', () => {
      const result = detectSwipeDirection(100, 100, 200, 100);
      expect(result).toBe('right');
    });

    it('should detect up swipe', () => {
      const result = detectSwipeDirection(100, 200, 100, 100);
      expect(result).toBe('up');
    });

    it('should detect down swipe', () => {
      const result = detectSwipeDirection(100, 100, 100, 200);
      expect(result).toBe('down');
    });

    it('should return null for small movements below threshold', () => {
      const result = detectSwipeDirection(100, 100, 110, 105);
      expect(result).toBeNull();
    });

    it('should use custom threshold', () => {
      const result = detectSwipeDirection(100, 100, 130, 100, 20);
      expect(result).toBe('right');
    });

    it('should prefer horizontal when deltaX > deltaY', () => {
      const result = detectSwipeDirection(100, 100, 200, 130);
      expect(result).toBe('right');
    });

    it('should prefer vertical when deltaY > deltaX', () => {
      const result = detectSwipeDirection(100, 100, 130, 200);
      expect(result).toBe('down');
    });

    it('should return null when both deltas are zero', () => {
      const result = detectSwipeDirection(100, 100, 100, 100);
      expect(result).toBeNull();
    });

    it('should handle negative coordinates', () => {
      const result = detectSwipeDirection(-100, 0, -200, 0);
      expect(result).toBe('left');
    });
  });

  describe('createLongPressHandler', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    it('should call onLongPress after default duration', () => {
      const onLongPress = vi.fn();
      const handler = createLongPressHandler({ onLongPress });

      handler.onTouchStart();
      expect(onLongPress).not.toHaveBeenCalled();

      vi.advanceTimersByTime(500);
      expect(onLongPress).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });

    it('should call onLongPress after custom duration', () => {
      const onLongPress = vi.fn();
      const handler = createLongPressHandler({ onLongPress, duration: 300 });

      handler.onTouchStart();
      vi.advanceTimersByTime(300);
      expect(onLongPress).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });

    it('should not call onLongPress if touch ends early', () => {
      const onLongPress = vi.fn();
      const handler = createLongPressHandler({ onLongPress });

      handler.onTouchStart();
      vi.advanceTimersByTime(200);
      handler.onTouchEnd();
      vi.advanceTimersByTime(500);

      expect(onLongPress).not.toHaveBeenCalled();
      vi.useRealTimers();
    });

    it('should not call onLongPress if touch is cancelled', () => {
      const onLongPress = vi.fn();
      const handler = createLongPressHandler({ onLongPress });

      handler.onTouchStart();
      vi.advanceTimersByTime(200);
      handler.onTouchCancel();
      vi.advanceTimersByTime(500);

      expect(onLongPress).not.toHaveBeenCalled();
      vi.useRealTimers();
    });
  });
});
