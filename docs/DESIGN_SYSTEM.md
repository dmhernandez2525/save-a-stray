# Save A Stray Design System

**Version:** 1.0.0  
**Last Updated:** February 15, 2026  
**Status:** Active

## Overview

This document defines the visual system used by the client application:

- Tailwind CSS v4 utility classes
- shadcn/ui components built on Radix primitives
- CSS custom properties for semantic theme tokens
- Light and dark theme support through `ThemeProvider`

## Token Sources

### Runtime CSS Variables

Theme variables are defined in `client/src/index.css` under `:root` and `.dark`.
These include semantic tokens such as:

- `--background`, `--foreground`
- `--card`, `--card-foreground`
- `--primary`, `--secondary`, `--accent`
- `--muted`, `--destructive`, `--success`, `--warning`
- `--border`, `--input`, `--ring`
- `--sidebar-*`

### Typed Token Map

Typed token references for docs, utilities, and test coverage are in:

- `client/src/lib/design-tokens.ts`

Exports include:

- `COLOR_TOKENS`
- `SPACING_TOKENS`
- `TYPOGRAPHY_TOKENS`
- `BREAKPOINT_TOKENS`

## Typography

- Headings: `font-capriola`
- Body text: `font-nunito`
- Base font defaults are applied in `client/src/index.css`

## Spacing and Layout

### Breakpoints

The canonical breakpoints are:

- `sm`: 640
- `md`: 768
- `lg`: 1024
- `xl`: 1280
- `2xl`: 1400

Utility helpers are in `client/src/lib/responsive.ts`:

- `breakpointMediaQuery()`
- `isViewportAtLeast()`
- `MOBILE_TOUCH_TARGET_PX` (44px minimum)

### Reusable Layout Components

Layout primitives live in `client/src/layouts/`:

- `PageLayout`
- `AuthLayout`
- `DashboardLayout`

These standardize page shell spacing, breakpoint behavior, and dashboard structure.

## Dark Mode

Theme behavior is handled by `client/src/components/ThemeProvider.tsx`:

- Supports `light`, `dark`, and `system`
- Persists preference in `localStorage` (`save-a-stray-theme`)
- Applies root class (`light` or `dark`)
- Syncs with system preference changes
- Syncs across tabs via the `storage` event

Theme toggles are currently exposed in:

- `client/src/components/Nav.tsx`
- `client/src/components/BottomNav.tsx`

## shadcn/ui and Radix

shadcn config is tracked in `client/components.json`.

Current primitives in use are in `client/src/components/ui/` and include:

- `avatar`, `badge`, `button`, `card`
- `dialog`, `dropdown-menu`, `input`, `label`
- `progress`, `select`, `separator`, `sheet`
- `skeleton`, `switch`, `tabs`, `textarea`, `tooltip`

## Usage Rules

- Prefer semantic Tailwind tokens (`bg-background`, `text-foreground`) over hardcoded colors.
- Prefer shared layout components over ad-hoc page wrappers.
- Keep mobile-first classes as the default and layer `md:`, `lg:`, `xl:` overrides.
- Avoid legacy stylesheet imports and inline styles unless values are truly dynamic.
- Keep touch targets at or above 44x44 pixels.
