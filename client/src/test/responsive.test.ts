import { describe, expect, it, vi } from "vitest";
import {
  MOBILE_TOUCH_TARGET_PX,
  breakpointMediaQuery,
  isViewportAtLeast,
} from "@/lib/responsive";

describe("responsive utilities", () => {
  it("returns valid media query values for breakpoints", () => {
    expect(breakpointMediaQuery("sm")).toBe("(min-width: 640px)");
    expect(breakpointMediaQuery("md")).toBe("(min-width: 768px)");
    expect(breakpointMediaQuery("2xl")).toBe("(min-width: 1400px)");
  });

  it("enforces touch target minimum size for mobile interactions", () => {
    expect(MOBILE_TOUCH_TARGET_PX).toBeGreaterThanOrEqual(44);
  });

  it("checks viewport against breakpoint via matchMedia", () => {
    window.matchMedia = vi.fn().mockReturnValue({
      matches: true,
      media: "(min-width: 768px)",
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });

    expect(isViewportAtLeast("md")).toBe(true);
    expect(window.matchMedia).toHaveBeenCalledWith("(min-width: 768px)");
  });
});
