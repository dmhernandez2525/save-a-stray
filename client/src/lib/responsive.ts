import { BREAKPOINT_TOKENS, type Breakpoint } from "./design-tokens";

export const MOBILE_TOUCH_TARGET_PX = 44;

export function breakpointMediaQuery(breakpoint: Breakpoint): string {
  return `(min-width: ${BREAKPOINT_TOKENS[breakpoint]}px)`;
}

export function isViewportAtLeast(breakpoint: Breakpoint): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(breakpointMediaQuery(breakpoint)).matches;
}
