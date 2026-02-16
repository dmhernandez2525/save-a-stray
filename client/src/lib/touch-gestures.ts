export interface SwipeState {
  startX: number;
  startY: number;
  deltaX: number;
  deltaY: number;
  swiping: boolean;
}

export interface SwipeHandlers {
  onTouchStart: (e: TouchEvent | React.TouchEvent) => void;
  onTouchMove: (e: TouchEvent | React.TouchEvent) => void;
  onTouchEnd: () => void;
}

export interface SwipeCallbacks {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
}

const DEFAULT_THRESHOLD = 50;

export function createSwipeHandlers(callbacks: SwipeCallbacks): SwipeHandlers {
  const threshold = callbacks.threshold ?? DEFAULT_THRESHOLD;
  let startX = 0;
  let startY = 0;

  const onTouchStart = (e: TouchEvent | React.TouchEvent): void => {
    const touch = 'touches' in e ? e.touches[0] : (e as TouchEvent).touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
  };

  const onTouchMove = (_e: TouchEvent | React.TouchEvent): void => {
    // Intentional no-op; calculation happens on end
  };

  const onTouchEnd = (): void => {
    // We calculate from the last known touch position vs start
    // This is handled by the component using the hook
  };

  return { onTouchStart, onTouchMove, onTouchEnd };
}

export function detectSwipeDirection(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  threshold: number = DEFAULT_THRESHOLD
): 'left' | 'right' | 'up' | 'down' | null {
  const deltaX = endX - startX;
  const deltaY = endY - startY;
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);

  if (absX < threshold && absY < threshold) return null;

  if (absX > absY) {
    return deltaX > 0 ? 'right' : 'left';
  }
  return deltaY > 0 ? 'down' : 'up';
}

export interface PullToRefreshState {
  pulling: boolean;
  pullDistance: number;
  refreshing: boolean;
}

export function createPullToRefreshHandler(
  onRefresh: () => Promise<void>,
  pullThreshold: number = 80
): {
  onTouchStart: (e: TouchEvent) => void;
  onTouchMove: (e: TouchEvent) => void;
  onTouchEnd: () => void;
  getState: () => PullToRefreshState;
} {
  let startY = 0;
  let pulling = false;
  let pullDistance = 0;
  let refreshing = false;

  const getState = (): PullToRefreshState => ({ pulling, pullDistance, refreshing });

  const onTouchStart = (e: TouchEvent): void => {
    if (window.scrollY === 0) {
      startY = e.touches[0].clientY;
      pulling = true;
    }
  };

  const onTouchMove = (e: TouchEvent): void => {
    if (!pulling) return;
    const currentY = e.touches[0].clientY;
    pullDistance = Math.max(0, currentY - startY);
  };

  const onTouchEnd = (): void => {
    if (pulling && pullDistance >= pullThreshold && !refreshing) {
      refreshing = true;
      onRefresh().finally(() => {
        refreshing = false;
        pullDistance = 0;
      });
    }
    pulling = false;
    pullDistance = 0;
  };

  return { onTouchStart, onTouchMove, onTouchEnd, getState };
}

export interface LongPressCallbacks {
  onLongPress: () => void;
  duration?: number;
}

export function createLongPressHandler(callbacks: LongPressCallbacks): {
  onTouchStart: () => void;
  onTouchEnd: () => void;
  onTouchCancel: () => void;
} {
  const duration = callbacks.duration ?? 500;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const onTouchStart = (): void => {
    timer = setTimeout(() => {
      callbacks.onLongPress();
      timer = null;
    }, duration);
  };

  const clear = (): void => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  return { onTouchStart, onTouchEnd: clear, onTouchCancel: clear };
}
