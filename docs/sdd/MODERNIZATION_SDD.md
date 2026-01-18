# Software Design Document: save-a-stray Modernization

**Version:** 1.0.0
**Author:** Daniel Hernandez
**Created:** January 2026
**Status:** Draft - Awaiting Review

---

## 1. Executive Summary

This document outlines the modernization strategy for save-a-stray, upgrading from 2019-era technologies to current LTS versions while adopting Tailwind v4 and Shadcn for styling.

### Current State
- **Node.js:** Unspecified (likely 12.x)
- **React:** 16.10.1 (Legacy)
- **Build Tool:** Create React App 3.3.0 (Deprecated)
- **GraphQL:** graphql 14.5.8 + express-graphql 0.9.0
- **Apollo Client:** 2.6.4 (Legacy)
- **Styling:** Custom CSS
- **Database:** MongoDB with Mongoose 5.7.5
- **Auth:** Firebase Admin 8.6.0, Passport 0.4.0

### Target State
- **Node.js:** 22.x LTS
- **React:** 19.x
- **Build Tool:** Vite 6.x
- **GraphQL:** graphql 16.x + graphql-yoga or Apollo Server 4
- **Apollo Client:** 3.x
- **Styling:** Tailwind CSS v4 + Shadcn
- **Database:** MongoDB with Mongoose 8.x
- **Auth:** Firebase Admin 13.x, Passport 0.7.x

---

## 2. Current Technology Audit

### Backend (package.json)

| Package | Current | LTS/Latest | Action | Breaking Changes |
|---------|---------|------------|--------|------------------|
| Node.js | ~12.x | 22.x | **Upgrade** | Major - async/ESM changes |
| express | 4.17.1 | 4.21.x | Upgrade | Minor |
| mongoose | 5.7.5 | 8.x | **Upgrade** | Major - query API changes |
| graphql | 14.5.8 | 16.x | **Upgrade** | Major - execute API |
| express-graphql | 0.9.0 | Deprecated | **Replace** | Use graphql-http or yoga |
| bcryptjs | 2.4.3 | 2.4.3 | Keep | None |
| jsonwebtoken | 8.5.1 | 9.x | Upgrade | Minor - algorithm defaults |
| passport | 0.4.0 | 0.7.x | Upgrade | Minor |
| passport-facebook | 3.0.0 | 3.0.0 | Keep | None |
| passport-google | 0.3.0 | Deprecated | **Replace** | Use passport-google-oauth20 |
| body-parser | 1.19.0 | Deprecated | **Remove** | Use express.json() |
| faker | 4.1.0 | Deprecated | **Replace** | Use @faker-js/faker |
| firebase-admin | 8.6.0 | 13.x | **Upgrade** | Major - API changes |
| google-auth-library | 5.4.0 | 9.x | **Upgrade** | Major |
| validator | 11.1.0 | 13.x | Upgrade | Minor |
| nodemon | 1.19.3 | 3.x | Upgrade | None |
| concurrently | 4.1.2 | 9.x | Upgrade | Minor |

### Frontend (client/package.json)

| Package | Current | LTS/Latest | Action | Breaking Changes |
|---------|---------|------------|--------|------------------|
| react | 16.10.1 | 19.x | **Upgrade** | Major - Hooks, Concurrent |
| react-dom | 16.10.1 | 19.x | **Upgrade** | Major |
| react-scripts | 3.3.0 | Deprecated | **Replace with Vite** | Major - Build config |
| react-router-dom | 5.1.2 | 7.x | **Upgrade** | Major - API changes |
| apollo-client | 2.6.4 | Deprecated | **Replace** | Use @apollo/client 3.x |
| apollo-cache-inmemory | 1.6.3 | Deprecated | **Remove** | Bundled in @apollo/client |
| apollo-link | 1.2.13 | Deprecated | **Remove** | Bundled in @apollo/client |
| apollo-link-http | 1.5.16 | Deprecated | **Remove** | Bundled in @apollo/client |
| apollo-link-error | 1.1.12 | Deprecated | **Remove** | Bundled in @apollo/client |
| react-apollo | 3.1.2 | Deprecated | **Remove** | Use @apollo/client hooks |
| react-adopt | 0.6.0 | Deprecated | **Remove** | Use React Context |
| graphql-tag | 2.10.1 | 2.12.x | Upgrade | Minor |

### New Dependencies to Add

| Package | Version | Purpose |
|---------|---------|---------|
| tailwindcss | 4.x | Styling |
| @shadcn/ui | latest | Component library |
| vite | 6.x | Build tool |
| @vitejs/plugin-react | 5.x | React plugin for Vite |
| typescript | 5.9.x | Type safety |
| vitest | 2.x | Testing |
| @testing-library/react | 16.x | Component testing |
| @apollo/client | 3.x | GraphQL client |
| graphql-http | 1.x | GraphQL server |

---

## 3. Migration Strategy

### Phase 1: Backend Modernization (PR #1)
**Scope:** Node.js, Express, Mongoose, and auth layer updates
**Breaking Changes:** Minimal - API contract unchanged

#### Steps:
1. Add `engines` in package.json for Node 22.x
2. Replace `body-parser` with `express.json()`
3. Upgrade Express to 4.21.x
4. Upgrade Mongoose to 8.x
   - Update query syntax (no more callbacks)
   - Update connection string format
5. Replace `faker` with `@faker-js/faker`
6. Upgrade `jsonwebtoken` to 9.x
7. Upgrade `passport` to 0.7.x
8. Replace `passport-google` with `passport-google-oauth20`
9. Upgrade `firebase-admin` to 13.x
10. Upgrade `google-auth-library` to 9.x

#### Mongoose 8 Migration Notes:
```javascript
// OLD (Mongoose 5)
User.findOne({ email }, callback);
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// NEW (Mongoose 8)
const user = await User.findOne({ email });
await mongoose.connect(uri);
```

---

### Phase 2: GraphQL Server Migration (PR #2)
**Scope:** Replace deprecated express-graphql
**Breaking Changes:** Server implementation only

#### Steps:
1. Install `graphql-http` or `graphql-yoga`
2. Upgrade `graphql` to 16.x
3. Replace express-graphql middleware
4. Update resolver patterns
5. Add TypeScript for schemas (optional)

#### Migration Example:
```javascript
// OLD (express-graphql)
app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true
}));

// NEW (graphql-http)
import { createHandler } from 'graphql-http/lib/use/express';
app.all('/graphql', createHandler({ schema }));
```

---

### Phase 3: Frontend Build System (PR #3)
**Scope:** Replace CRA with Vite, add TypeScript
**Breaking Changes:** Build configuration only

#### Steps:
1. Create new Vite project structure
2. Move components to new structure
3. Configure Vite for React
4. Add TypeScript configuration
5. Update import paths
6. Remove react-scripts
7. Update npm scripts

#### New Project Structure:
```
client/
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── graphql/
│   ├── services/
│   ├── types/
│   └── main.tsx
├── public/
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
└── package.json
```

---

### Phase 4: Apollo Client 3 Migration (PR #4)
**Scope:** Upgrade Apollo Client, remove deprecated packages
**Breaking Changes:** Import paths, caching API

#### Steps:
1. Replace all apollo-* packages with `@apollo/client`
2. Update ApolloProvider setup
3. Migrate to hooks (useQuery, useMutation)
4. Remove react-adopt (use React Context)
5. Update cache policies

#### Migration Example:
```jsx
// OLD (Apollo Client 2)
import { ApolloProvider } from 'react-apollo';
import ApolloClient from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';

const client = new ApolloClient({
  link: new HttpLink({ uri: '/graphql' }),
  cache: new InMemoryCache()
});

// NEW (Apollo Client 3)
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

const client = new ApolloClient({
  uri: '/graphql',
  cache: new InMemoryCache()
});
```

---

### Phase 5: React & Router Upgrade (PR #5)
**Scope:** React 19, React Router 7
**Breaking Changes:** Component patterns, routing API

#### React Router 7 Migration:
```jsx
// OLD (v5)
import { Switch, Route } from 'react-router-dom';
<Switch>
  <Route path="/adopt" component={AdoptPage} />
</Switch>

// NEW (v7)
import { Routes, Route } from 'react-router-dom';
<Routes>
  <Route path="/adopt" element={<AdoptPage />} />
</Routes>
```

---

### Phase 6: Styling Migration (PR #6)
**Scope:** Replace CSS with Tailwind v4 + Shadcn
**Breaking Changes:** All component styles

#### Steps:
1. Install Tailwind v4 and configure
2. Install Shadcn CLI and initialize
3. Add base Shadcn components
4. Migrate components one by one
5. Remove old CSS files

#### Component Migration Example:
```jsx
// OLD
<button className="adopt-button">Adopt Now</button>
// .adopt-button { background: green; padding: 10px; }

// NEW (Shadcn)
import { Button } from '@/components/ui/button';
<Button variant="default">Adopt Now</Button>
```

---

### Phase 7: Testing Infrastructure (PR #7)
**Scope:** Add Vitest, React Testing Library
**Breaking Changes:** None

#### Configuration:
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      thresholds: { global: { lines: 85 } },
    },
  },
});
```

---

## 4. Risk Assessment

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Mongoose 8 query breaks | High | Medium | Comprehensive testing |
| Firebase Admin API changes | High | Medium | Test auth flows thoroughly |
| Apollo Client 3 cache differences | Medium | Medium | Gradual migration |
| React Router API changes | Medium | High | Incremental migration |
| GraphQL server migration | Medium | Low | Maintain schema compatibility |
| Styling inconsistencies | Medium | Medium | Component-by-component migration |

---

## 5. Dependencies & Prerequisites

### Development Environment
- Node.js 22.x LTS installed
- MongoDB 6.x+ available
- pnpm or npm 10.x

### External Dependencies
- MongoDB Atlas cluster (existing)
- Firebase project (existing)
- Google OAuth credentials (existing)

---

## 6. Success Criteria

- [ ] All tests passing
- [ ] No console errors/warnings
- [ ] Lighthouse performance score > 90
- [ ] Bundle size < 500KB
- [ ] 85% test coverage
- [ ] All features functional
- [ ] Firebase auth working
- [ ] GraphQL API responsive

---

## 7. Rollback Plan

Each PR can be reverted independently. If critical issues arise:
1. Revert the specific PR
2. Document the issue
3. Fix in a new branch
4. Re-attempt migration

---

## 8. Timeline Estimate

| Phase | Estimated Effort |
|-------|------------------|
| Phase 1: Backend | 4-6 hours |
| Phase 2: GraphQL Server | 3-4 hours |
| Phase 3: Build System | 6-8 hours |
| Phase 4: Apollo Client 3 | 4-6 hours |
| Phase 5: React/Router | 4-6 hours |
| Phase 6: Styling | 8-12 hours |
| Phase 7: Testing | 4-6 hours |
| **Total** | **33-48 hours** |

---

## 9. Open Questions for Review

1. **GraphQL Server:** graphql-http (minimal) or graphql-yoga (batteries included)?
2. **Firebase:** Keep Firebase Auth or switch to custom JWT?
3. **TypeScript:** Strict mode from start or gradual?
4. **Testing:** Unit-first or E2E-first approach?
