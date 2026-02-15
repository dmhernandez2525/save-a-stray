# Software Design Document: Styling Modernization (F1.2)

**Version:** 1.1.0  
**Author:** Codex  
**Created:** February 3, 2026  
**Last Updated:** February 15, 2026  
**Status:** In Progress  
**Feature IDs:** F1.2

## 1. Overview

### 1.1 Purpose
Complete Phase 1 styling modernization by standardizing Tailwind usage, hardening dark mode behavior, removing remaining legacy CSS artifacts, and establishing a reusable design-system foundation.

### 1.2 Goals

- Remove remaining legacy references tied to `client/src/components/css/`.
- Keep dark mode class-based and system-aware with persisted user preference.
- Add reusable layout primitives for consistent page structure.
- Add typed design token and responsive utility sources for maintainable styling.
- Document token usage and component conventions in `docs/DESIGN_SYSTEM.md`.

### 1.3 Non-Goals

- Full visual redesign of every page.
- Full refactor of all existing large legacy components in one PR.
- Replacing shadcn/ui with a different component system.

## 2. Current State and Gaps

### 2.1 Baseline

- Tailwind v4 and shadcn-style UI components are already in use.
- `ThemeProvider` existed with localStorage and system preference support.
- Dark mode toggles were present in desktop and mobile navigation.

### 2.2 Gaps addressed in F1.2

- Stale legacy path references to `components/css` still existed.
- `ThemeProvider` accepted unvalidated storage values and did not sync across tabs.
- Reusable layout primitives (`PageLayout`, `AuthLayout`, `DashboardLayout`) were missing.
- Typed token references and responsive helpers were not formalized.
- Design system documentation was missing.

## 3. Technical Design

### 3.1 Theming

- Keep Tailwind dark mode strategy: `darkMode: ["class"]`.
- Use `ThemeProvider` as the single source for:
  - `theme` (`light`, `dark`, `system`)
  - `resolvedTheme` (`light`, `dark`)
  - `setTheme` updates
- ThemeProvider implementation details:
  - Validate stored values before applying.
  - Apply both root class and `color-scheme`.
  - React to OS theme changes when in `system` mode.
  - React to `storage` events for cross-tab sync.

### 3.2 Design Tokens

- Keep CSS variable tokens in `client/src/index.css` for runtime theming.
- Add typed token maps in `client/src/lib/design-tokens.ts` for color, spacing, typography, and breakpoints.
- Add responsive helpers in `client/src/lib/responsive.ts`.

### 3.3 Layout Primitives

- Add reusable layout components in `client/src/layouts/`:
  - `PageLayout`
  - `AuthLayout`
  - `DashboardLayout`
- Export through `client/src/layouts/index.ts`.
- Use these as migration-safe primitives for gradual adoption without forcing large rewrites.

### 3.4 Legacy Artifact Cleanup

- Remove `client/src/App.scss` (unused legacy stylesheet).
- Remove stale `components/css` references from test files.
- Replace stale splash image path with Tailwind-native gradient background.
- Remove inline style where static Tailwind arbitrary values are sufficient.

### 3.5 shadcn/ui Configuration

- Add `client/components.json` to keep shadcn configuration explicit and reproducible.
- Continue using Radix primitives through existing `client/src/components/ui/*` wrappers.

## 4. Implementation Summary

### 4.1 Files Added

- `client/components.json`
- `client/src/layouts/PageLayout.tsx`
- `client/src/layouts/AuthLayout.tsx`
- `client/src/layouts/DashboardLayout.tsx`
- `client/src/layouts/index.ts`
- `client/src/lib/design-tokens.ts`
- `client/src/lib/responsive.ts`
- `client/src/test/ThemeProvider.test.tsx`
- `client/src/test/layouts.visual.test.tsx`
- `client/src/test/responsive.test.ts`
- `docs/DESIGN_SYSTEM.md`

### 4.2 Files Updated

- `client/src/components/ThemeProvider.tsx`
- `client/src/components/Splash.tsx`
- `client/src/components/BottomNav.tsx`
- `client/src/components/layouts/ShelterDashboardLayout.tsx`
- `client/src/test/setup.js`
- Legacy test files that contained `components/css` mocks

### 4.3 Files Removed

- `client/src/App.scss`

## 5. Testing Strategy

### 5.1 Automated Checks

- `cd client && npm run lint`
- `cd client && npm run typecheck`
- `cd client && npm run test:run`
- `cd client && npm run build`

### 5.2 New F1.2 Coverage

- Theme behavior, persistence, and system mode transitions:
  - `client/src/test/ThemeProvider.test.tsx`
- Layout visual baselines (snapshot regression):
  - `client/src/test/layouts.visual.test.tsx`
- Responsive breakpoint utility verification:
  - `client/src/test/responsive.test.ts`

## 6. Risks and Follow-Ups

- Several legacy components remain large and include additional inline style usage. Those are tracked for incremental cleanup in future feature branches.
- Layout primitives are available now, but broad adoption should be done feature-by-feature to avoid high-risk UI regressions.

## 7. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | Feb 3, 2026 | Codex | Initial draft |
| 1.1.0 | Feb 15, 2026 | Codex | Updated to implemented F1.2 architecture and validation plan |
