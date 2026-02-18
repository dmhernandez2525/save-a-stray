export const COLOR_TOKENS = {
  skyBlue: {
    50: "hsl(204 100% 97%)",
    100: "hsl(202 100% 93%)",
    200: "hsl(200 100% 85%)",
    300: "hsl(199 100% 75%)",
    400: "hsl(199 100% 65%)",
    500: "hsl(199 100% 58%)",
    600: "hsl(199 100% 48%)",
    700: "hsl(199 100% 38%)",
    800: "hsl(199 100% 28%)",
    900: "hsl(199 100% 18%)",
  },
  salmon: {
    50: "hsl(17 100% 97%)",
    100: "hsl(17 100% 92%)",
    200: "hsl(17 100% 84%)",
    300: "hsl(17 100% 74%)",
    400: "hsl(17 100% 64%)",
    500: "hsl(17 100% 54%)",
    600: "hsl(17 100% 44%)",
    700: "hsl(17 100% 34%)",
    800: "hsl(17 100% 24%)",
    900: "hsl(17 100% 14%)",
  },
  gold: {
    50: "hsl(45 100% 96%)",
    100: "hsl(45 100% 90%)",
    200: "hsl(45 100% 80%)",
    300: "hsl(45 100% 65%)",
    400: "hsl(45 100% 50%)",
    500: "hsl(45 100% 42%)",
  },
  warmGray: {
    50: "hsl(30 20% 98%)",
    100: "hsl(30 15% 95%)",
    200: "hsl(30 12% 90%)",
    300: "hsl(30 10% 80%)",
    400: "hsl(30 8% 65%)",
    500: "hsl(30 6% 50%)",
    600: "hsl(30 6% 35%)",
    700: "hsl(30 8% 25%)",
    800: "hsl(30 10% 15%)",
    900: "hsl(30 12% 8%)",
  },
} as const;

export const SPACING_TOKENS = {
  0: "0rem",
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  8: "2rem",
  10: "2.5rem",
  12: "3rem",
  16: "4rem",
  18: "4.5rem",
  20: "5rem",
  24: "6rem",
  32: "8rem",
} as const;

export const TYPOGRAPHY_TOKENS = {
  fonts: {
    heading: "Capriola, sans-serif",
    body: "Nunito, system-ui, sans-serif",
    mono: "source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace",
  },
  sizes: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem",
  },
} as const;

export const BREAKPOINT_TOKENS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1400,
} as const;

export type Breakpoint = keyof typeof BREAKPOINT_TOKENS;
