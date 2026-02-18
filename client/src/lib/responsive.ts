import { BREAKPOINT_TOKENS, type Breakpoint } from "./design-tokens";

export const MOBILE_TOUCH_TARGET_PX = 44;
export const MOBILE_MIN_TAP_SIZE = '44px';

export function breakpointMediaQuery(breakpoint: Breakpoint): string {
  return `(min-width: ${BREAKPOINT_TOKENS[breakpoint]}px)`;
}

export function isViewportAtLeast(breakpoint: Breakpoint): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(breakpointMediaQuery(breakpoint)).matches;
}

export function isMobile(): boolean {
  if (typeof window === "undefined") return false;
  return !isViewportAtLeast("md");
}

export function isTablet(): boolean {
  if (typeof window === "undefined") return false;
  return isViewportAtLeast("md") && !isViewportAtLeast("lg");
}

export function isDesktop(): boolean {
  return isViewportAtLeast("lg");
}

export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (isMobile()) return 'mobile';
  if (isTablet()) return 'tablet';
  return 'desktop';
}

export function hasTouchSupport(): boolean {
  if (typeof window === "undefined") return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

export function getKeyboardType(
  inputType: 'text' | 'email' | 'phone' | 'number' | 'url' | 'search'
): string {
  const keyboardMap: Record<string, string> = {
    text: 'text',
    email: 'email',
    phone: 'tel',
    number: 'numeric',
    url: 'url',
    search: 'search',
  };
  return keyboardMap[inputType] ?? 'text';
}

export function onViewportChange(callback: (device: 'mobile' | 'tablet' | 'desktop') => void): () => void {
  const handler = (): void => callback(getDeviceType());
  const mql = window.matchMedia(breakpointMediaQuery("md"));
  const mqlLg = window.matchMedia(breakpointMediaQuery("lg"));
  mql.addEventListener('change', handler);
  mqlLg.addEventListener('change', handler);
  return () => {
    mql.removeEventListener('change', handler);
    mqlLg.removeEventListener('change', handler);
  };
}
