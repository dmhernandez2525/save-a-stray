# Software Design Document: Frontend Migration (F1.1)

**Version:** 1.0.0  
**Author:** Codex  
**Created:** February 15, 2026  
**Last Updated:** February 15, 2026  
**Status:** In Progress  
**Feature ID:** F1.1

---

## 1. Overview

### 1.1 Purpose
Complete the Phase 1 frontend migration work for the Vite-based client stack with strict TypeScript, dependency modernization, and production-safe build configuration.

### 1.2 Goals
- Remove remaining Create React App artifacts from the client directory.
- Upgrade the client build/runtime toolchain to current stable versions where safe.
- Keep strict TypeScript checks green for client code.
- Add explicit Vite environment handling with `VITE_` enforcement.
- Add path aliases for `@/components`, `@/lib`, `@/types`, and `@/graphql`.
- Add build-size analysis support to track bundle regressions.
- Keep Render-compatible output path (`client/build`).

### 1.3 Non-Goals
- Full Apollo Client v4 migration of legacy render-prop usage.
- Full legacy test cleanup and warning elimination in this feature.
- Tailwind design-token redesign (covered by F1.2).

---

## 2. Current State

- Client already uses Vite and TypeScript, but dependency versions and config are partially outdated.
- CRA default assets (`manifest.json`, `logo192.png`, `logo512.png`) were still present in `client/public`.
- Path aliases were incomplete in TypeScript/Vite config.
- Build analysis output was not available.
- Environment handling was split between inline conditionals and ad-hoc constants.

---

## 3. Technical Design

### 3.1 Dependency and Tooling Updates
- Upgraded client build/test stack:
  - `vite` `^7.1.4`
  - `vitest` `^3.2.4`
  - `@vitest/coverage-v8` `^3.2.4`
  - `tailwindcss` `^4.1.13`
  - `@tailwindcss/vite` `^4.1.13`
  - `react` `^19.1.1`
  - `react-dom` `^19.1.1`
  - `react-router-dom` `^7.9.1`
- Kept `@apollo/client` on 3.x to avoid a breaking migration in F1.1 scope.

### 3.2 Vite Configuration
- Added Tailwind v4 Vite plugin.
- Added strict dev server behavior and HMR overlay.
- Added explicit `envPrefix: 'VITE_'`.
- Added vendor chunk splitting strategy for stable production output.
- Added conditional bundle analysis using `rollup-plugin-visualizer`.

### 3.3 TypeScript and Alias Configuration
- Enabled `types` for Vitest and Testing Library matchers.
- Added alias paths in `client/tsconfig.json`:
  - `@/components/*`
  - `@/lib/*`
  - `@/types/*`
  - `@/graphql/*`

### 3.4 Environment Access Pattern
- Consolidated client environment logic in `client/src/config/env.ts`.
- Added URL normalization and fallback logic for `VITE_API_URL`.
- Added explicit `ImportMetaEnv` typing in `client/src/vite-env.d.ts`.

### 3.5 Lint Architecture
- Added shared lint config file `client/eslint.shared.config.js`.
- `client/eslint.config.js` now re-exports shared config.
- Added React 19-focused rules for hook dependencies and refresh boundaries.

### 3.6 CRA Artifact Removal
- Removed obsolete CRA assets from `client/public`:
  - `manifest.json`
  - `logo192.png`
  - `logo512.png`

---

## 4. Implementation Notes

### 4.1 Files Updated
- `client/package.json`
- `client/package-lock.json`
- `client/vite.config.ts`
- `client/tsconfig.json`
- `client/postcss.config.js`
- `client/tailwind.config.js`
- `client/src/index.css`
- `client/src/config/env.ts`
- `client/src/vite-env.d.ts`
- `client/src/main.tsx`
- `client/src/components/FacebookLogin.tsx`
- `client/eslint.shared.config.js`
- `client/eslint.config.js`
- `client/src/test/vite-aliases.test.ts`
- `client/public/manifest.json` (removed)
- `client/public/logo192.png` (removed)
- `client/public/logo512.png` (removed)

### 4.2 Build Analysis
- Added script: `npm run build:analyze`.
- Output report: `client/build/bundle-analysis.html`.

---

## 5. Validation Strategy

### 5.1 Required Checks
- `cd client && npm run typecheck`
- `cd client && npm run lint`
- `cd client && npm run test:run`
- `cd client && npm run build`
- `cd client && npm run build:analyze`

### 5.2 Focused Test Coverage Added
- `client/src/test/vite-aliases.test.ts` validates alias resolution for component, lib, graphql, and types modules.

---

## 6. Risks and Follow-Ups

- Apollo Client 4 migration remains pending and should be handled in F1.3 with planned hook import updates and render-prop replacement.
- Existing lint warnings in legacy files are pre-existing and not a blocker for build/typecheck/test pass.
- One existing build warning for unresolved legacy image path remains and should be cleaned in F1.2 CSS migration.

---

## 7. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | Feb 15, 2026 | Codex | Initial F1.1 SDD for frontend migration |
