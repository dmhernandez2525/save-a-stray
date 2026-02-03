# Software Design Document: Styling Modernization (Tailwind v4 + shadcn/ui)

**Version:** 1.0.0
**Author:** Codex
**Created:** February 3, 2026
**Last Updated:** February 3, 2026
**Status:** In Progress
**Feature IDs:** F1.2

---

## 1. Overview

### 1.1 Purpose
Modernize the frontend styling stack by upgrading to Tailwind CSS v4, aligning shadcn/ui usage with the new Tailwind pipeline, formalizing design tokens, and providing a first-class dark mode experience. This work reduces legacy CSS debt and aligns styling with the project’s long-term design system.

### 1.2 Goals
- Upgrade Tailwind CSS to v4 and adopt the recommended Vite integration.
- Replace deprecated Tailwind animation tooling with the v4-supported alternative.
- Centralize design tokens using CSS variables and Tailwind theme extensions.
- Implement a consistent dark mode experience via class-based theming.
- Reduce legacy CSS by migrating component styles to Tailwind utilities.
- Keep build output and render configuration compatible with the current Vite setup.

### 1.3 Non-Goals
- Full UI redesign or brand refresh.
- Rewriting all UI components in a single pass.
- Introducing new third-party component libraries beyond shadcn/ui.

---

## 2. Background

### 2.1 Current State
- Tailwind CSS v3 with a custom `tailwind.config.js` and `@tailwind` directives in `client/src/index.css`.
- Partial shadcn/ui component usage with custom utility classes.
- Dark mode variables exist in CSS but no global UI toggle.
- Legacy CSS files remain in `client/src/components/css/` and some SCSS usage persists.

### 2.2 Problem Statement
The existing stack mixes Tailwind v3 configuration, legacy CSS files, and ad-hoc component styles. This prevents consistent theming, increases maintenance cost, and blocks adoption of Tailwind v4 features and performance improvements.

### 2.3 User Stories
- As a user, I want a cohesive visual style that works in both light and dark mode.
- As a developer, I want predictable design tokens and utility classes so new UI is faster to build.
- As a maintainer, I want fewer custom CSS files to manage and less styling drift.

---

## 3. Technical Design

### 3.1 Architecture Overview
```
Vite → Tailwind v4 (Vite plugin) → Tailwind theme tokens → Components
```

### 3.2 Dependencies
- Upgrade `tailwindcss` to v4.
- Add `@tailwindcss/vite` for the recommended Vite integration.
- Replace `tailwindcss-animate` with `tw-animate-css` (Tailwind v4-compatible).
- Remove `autoprefixer` if unused (Tailwind v4 handles vendor prefixing).

### 3.3 Tailwind Pipeline Updates
- Vite config loads Tailwind via `@tailwindcss/vite`.
- `client/src/index.css` replaces `@tailwind` directives with `@import "tailwindcss"`.
- `tw-animate-css` is imported in `index.css` to preserve animation utilities.
- `postcss.config.js` is simplified to avoid double-processing Tailwind.

### 3.4 Design Tokens
- Continue using CSS variables under `:root` and `.dark` to define colors, radii, and shadows.
- Tailwind theme extensions map to CSS variables to keep utilities consistent across themes.
- Tokens are documented in `index.css` and used by shadcn/ui components.

### 3.5 Dark Mode
- Maintain `darkMode: ["class"]` and use a `dark` class on the root element.
- Add a global UI toggle (Nav or settings) to switch themes.
- Persist theme choice via `ThemeProvider` using `localStorage` key `save-a-stray-theme`.

### 3.6 Legacy CSS Migration
- Migrate legacy component CSS into Tailwind utilities in-place, prioritizing:
  - `App.css`
  - `Animal.css`
  - `AnimalFeedItem.css`
  - `AnimalShow.css`
  - `auth.css`
- Retain any large/complex styling temporarily, then remove files once migrated.

---

## 4. Implementation Plan

### 4.1 Phase 1: Tailwind v4 Upgrade (Config)
1. Update dependencies (`tailwindcss`, `@tailwindcss/vite`, `tw-animate-css`).
2. Update Vite configuration to use Tailwind v4 plugin.
3. Update `index.css` to use `@import "tailwindcss"` and `@import "tw-animate-css"`.
4. Simplify PostCSS configuration.

### 4.2 Phase 2: Tokens + Dark Mode
1. Validate token mappings in `tailwind.config.js`.
2. Implement a theme toggle and persist user preference.
3. Confirm dark mode across major routes (Splash, Landing, Shelter, Animal).

### 4.3 Phase 3: Legacy CSS Migration
1. Migrate high-traffic components to Tailwind utilities.
2. Remove deprecated CSS files once migration is complete.
3. Audit for unused classes and dead styles.

---

## 5. Testing Strategy

### 5.1 Build Validation
- `npm run build` in `client/` succeeds with Tailwind v4.

### 5.2 Visual Regression
- Smoke-check core pages in light and dark mode.
- Validate shadcn/ui components render as expected.

### 5.3 Accessibility
- Confirm contrast ratios for text and primary UI elements in both themes.

---

## 6. Security Considerations
- No new data flows or authentication changes.
- Theme preference storage should not expose sensitive data.

---

## 7. Performance Considerations
- Tailwind v4 reduces runtime overhead and improves build performance.
- Removing legacy CSS reduces bundle size and avoids duplicated styles.

---

## 8. Rollout Plan
- Land Tailwind v4 upgrade behind a short-lived feature branch.
- Verify builds and basic visual checks before merging.
- Continue migration of legacy CSS in follow-up PRs.

---

## 9. Open Questions
- Should the theme preference be user-scoped (profile) or device-scoped (localStorage only)?
- Which legacy CSS files are safe to remove immediately after migration without regressions?

---

## 10. References
- Tailwind v4 Upgrade Guide: https://tailwindcss.com/docs/upgrade-guide
- Tailwind v4 Vite Plugin: https://tailwindcss.com/docs/v4-alpha#vite
- shadcn/ui Tailwind v4 notes: https://ui.shadcn.com/docs/tailwind-v4
- tw-animate-css: https://www.npmjs.com/package/tw-animate-css

---

## 11. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | Feb 3, 2026 | Codex | Initial draft for Tailwind v4 migration |
