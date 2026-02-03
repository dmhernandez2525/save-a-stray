# Software Design Document: save-a-stray Modernization

**Version:** 2.1.0
**Author:** Daniel Hernandez
**Created:** January 2026
**Last Updated:** February 3, 2026
**Status:** In Progress - React 19 + Tailwind v4 upgrade underway

---

## 1. Executive Summary

This document outlines the modernization strategy for save-a-stray, upgrading from 2019-era technologies to current LTS versions. **Most phases are complete, but modernization is still active.** The remaining work includes React 19, Tailwind CSS v4, dependency refresh, and completing the TypeScript strict mode migration for backend files.

### Migration Status

| Phase | Description | Status |
|-------|-------------|--------|
| Phase 1 | Backend Dependencies | Complete |
| Phase 2 | GraphQL Server | Complete |
| Phase 3 | Frontend Build System | Complete |
| Phase 4 | Apollo Client 3 | Complete |
| Phase 5 | React & Router | Complete |
| Phase 6 | Styling (Tailwind + Shadcn) | Complete |
| Phase 7 | Testing Infrastructure | Complete |
| Ongoing | TypeScript Strict Migration | In Progress |

### Previous State (2019)

- **Node.js:** ~12.x
- **React:** 16.10.1
- **Build Tool:** Create React App 3.3.0
- **GraphQL:** graphql 14.5.8 + express-graphql 0.9.0
- **Apollo Client:** 2.6.4
- **Styling:** Custom CSS
- **Database:** Mongoose 5.7.5
- **Auth:** Firebase Admin 8.6.0, Passport 0.4.0

### Current State (February 2026)

- **Node.js:** 20+ LTS
- **React:** 19.1.1 (upgrade in progress)
- **Build Tool:** Vite 7.1.4
- **GraphQL:** Apollo Server v4 + graphql 16.11.0
- **Apollo Client:** 4.0.4
- **Styling:** Tailwind CSS 4.1.13 + Shadcn-style components (migration in progress)
- **Database:** Mongoose 8.9.5
- **Auth:** Passport.js 0.7.0 + JWT + bcryptjs
- **TypeScript:** 5.9.3 (strict mode enabled, migration partial)
- **Testing:** Vitest 2.1.8 (frontend), Jest 29.7.0 (backend)

### Target State (Post-Phase 1 Modernization)

- **React:** 19.x (client)
- **Build Tool:** Vite 6.x with optimized HMR
- **Styling:** Tailwind CSS 4.x + shadcn/ui (updated tokens + dark mode support)
- **TypeScript:** Strict mode, no legacy `.js` duplicates in server

---

## 2. Completed Migrations

### Phase 1: Backend Dependencies (Complete)

- Express upgraded to 4.21.2
- Mongoose upgraded to 8.9.5 (callback → async/await)
- Replaced `body-parser` with `express.json()`
- Replaced `faker` with `@faker-js/faker`
- Upgraded `jsonwebtoken` to 9.x
- Upgraded `passport` to 0.7.0
- Upgraded `validator` to 13.12.0
- Added TypeScript with strict mode

### Phase 2: GraphQL Server (Complete)

- Replaced deprecated `express-graphql` with Apollo Server v4
- Upgraded `graphql` to 16.11.0
- Added WebSocket subscriptions (graphql-ws)
- Introduced request-scoped DataLoaders for N+1 mitigation

### Phase 3: Frontend Build System (Complete)

- Replaced Create React App with Vite 6.0.7
- Added TypeScript configuration (strict mode)
- Updated project structure
- Configured path aliases (`@/*`)

### Phase 4: Apollo Client 3 (Complete)

- Replaced all `apollo-*` packages with `@apollo/client` 3.12.5
- Updated to hooks pattern (useQuery, useMutation)
- Removed deprecated packages (react-apollo, apollo-link-*, etc.)
- Updated cache configuration

### Phase 5: React & Router (Complete)

- Upgraded React to 18.3.1
- Upgraded React Router to 7.1.1 (Routes/Route pattern)
- Updated component patterns

### Phase 6: Styling (Complete)

- Added Tailwind CSS 3.4.17
- Added Shadcn-style UI components (button, card, input, label)
- Added Radix UI primitives
- Added `cn()` utility for class merging
- Legacy CSS files still exist alongside Tailwind

### Phase 7: Testing Infrastructure (Complete)

- Added Vitest 2.1.8 for frontend testing
- Added @testing-library/react 16.1.0
- Configured jsdom test environment
- Added test setup file
- Backend uses Jest 29.7.0 with supertest

---

## 3. Remaining Work

### React 19 Upgrade (Planned)

- Upgrade `react` and `react-dom` to 19.x
- Align `@types/react` and `@types/react-dom` to React 19
- Validate React Router 7 compatibility
- Verify Vite build + HMR on React 19

### Tailwind CSS v4 Upgrade (Planned)

- Upgrade Tailwind to v4
- Update Tailwind config, PostCSS, and build output as needed
- Refresh design tokens and shadcn/ui configuration
- Verify dark mode implementation

### TypeScript Strict Migration (In Progress)

The TypeScript compiler is configured in strict mode, but many server files still have both `.js` and `.ts` versions. The `.ts` files are being developed alongside the legacy `.js` files.

**Files with dual versions (need .js removal):**
- `server/models/*.{js,ts}`
- `server/schema/*.{js,ts}`
- `server/schema/types/*.{js,ts}`
- `server/services/*.{js,ts}`
- `server/validation/*.{js,ts}`
- `config/*.{js,ts}`
- `index.{js,ts}`

**Action Required:**
1. Ensure all `.ts` files compile correctly
2. Update `tsconfig.json` if needed
3. Remove legacy `.js` files
4. Update any imports referencing `.js` files

### Legacy CSS Cleanup (Low Priority)

Component-specific CSS files in `client/src/components/css/` coexist with Tailwind classes. These can be removed as components are refactored to use Tailwind exclusively.

**CSS files to eventually remove:**
- `Animal.css`, `AnimalFeedItem.css`, `AnimalShow.css`
- `App.css`, `ShelterLanding.css`
- `application.css`, `auth.css`, `slug.css`
- `splash.css`, `tos.css`, `userLanding.css`

---

## 4. Differences from Original Plan

| Planned | Actual | Reason |
|---------|--------|--------|
| React 19.x | React 18.3.1 → 19.x (planned) | 19.x now stable; upgrade scheduled in Phase 1 |
| Node.js 22.x | Node.js 20+ | 20.x is current LTS |
| Tailwind v4 | Tailwind 3.4.17 → 4.x (planned) | v4 now stable; upgrade scheduled in Phase 1 |
| graphql-yoga | Apollo Server v4 | Standardized server + subscriptions |
| Firebase Auth retained | Custom JWT + bcryptjs | Reduced external dependencies |

---

## 5. Success Criteria

- [x] All packages on supported versions
- [x] Vite build system operational
- [x] Apollo Client 3 integrated
- [x] React Router 7 working
- [x] Tailwind CSS configured (v3)
- [x] TypeScript strict mode enabled
- [ ] React 19 upgrade completed
- [ ] Tailwind CSS v4 upgrade completed
- [ ] All server files migrated to TypeScript-only
- [ ] Legacy CSS files removed
- [ ] 85% test coverage achieved
- [ ] No TypeScript compilation errors

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | Jan 2026 | Original | Initial modernization plan |
| 2.0.0 | Jan 22, 2026 | Claude Code | Updated to reflect completed migration status |
| 2.1.0 | Feb 3, 2026 | Codex | Added React 19 + Tailwind v4 upgrade plan |
