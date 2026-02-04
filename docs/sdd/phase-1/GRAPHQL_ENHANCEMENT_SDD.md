# Software Design Document: GraphQL Enhancement (Apollo Server v4 + DataLoader)

**Version:** 1.0.0
**Author:** Codex
**Created:** February 3, 2026
**Last Updated:** February 3, 2026
**Status:** In Progress
**Feature IDs:** F1.3

---

## 1. Overview

### 1.1 Purpose
Upgrade the GraphQL server to Apollo Server v4, add DataLoader-backed batching to eliminate N+1 queries, introduce subscription support for real-time updates, and formalize schema documentation.

### 1.2 Goals
- Replace `graphql-http` with Apollo Server v4 and Express middleware.
- Add request-scoped DataLoader instances for core models.
- Introduce GraphQL subscriptions for critical real-time use cases.
- Add query optimizations (pagination, limits, projection, indexes).
- Generate and publish schema documentation as a static artifact.

### 1.3 Non-Goals
- Replacing the Express server or switching to a different API paradigm.
- Rewriting the entire schema or changing API surface for existing clients.
- Implementing all Phase 2 communication subscriptions.

---

## 2. Background

### 2.1 Current State
- GraphQL migration to Apollo Server v4 is in progress (formerly `graphql-http`).
- Resolvers live under `server/schema/*`.
- No DataLoader usage; some queries fetch related data in resolver loops.
- No WebSocket subscriptions.
- Schema documentation is ad-hoc (no build artifact).

### 2.2 Problem Statement
Current GraphQL queries are vulnerable to N+1 patterns, lack real-time subscriptions for key workflows, and have no formal schema documentation. This limits scalability and developer experience.

### 2.3 User Stories
- As a frontend developer, I want predictable query performance so pages remain fast with larger datasets.
- As a shelter staff user, I want status changes to appear in real-time without refreshing.
- As an API consumer, I want clean schema docs so I can integrate confidently.

---

## 3. Technical Design

### 3.1 Architecture Overview
```
Express + Apollo Server v4
  ├── HTTP GraphQL Endpoint (/graphql)
  ├── DataLoader Layer (request-scoped)
  └── WebSocket Subscriptions (/graphql)
```

### 3.2 Dependencies
- `@apollo/server`
- `@apollo/server/express4`
- `graphql-ws` + `ws` (subscriptions)
- `graphql-subscriptions` (PubSub)
- `dataloader`

### 3.3 Server Integration
- Replace `graphql-http` with Apollo Server v4 using `expressMiddleware`.
- Add context builder that injects user info + DataLoaders per request.

### 3.4 DataLoader Strategy
- **UserLoader**: batch user lookups by `_id`.
- **ShelterLoader**: batch shelter lookups by `_id`.
- **AnimalLoader**: batch animal lookups by `_id`.
- **ApplicationLoader**: batch application lookups by `_id`.
- Each loader caches for the duration of a single request to avoid stale reads.

### 3.5 Query Optimization
- Add pagination defaults for high-cardinality queries (`animals`, `applications`).
- Enforce max `limit` values at resolver level.
- Project only requested fields where feasible.
- Add/confirm MongoDB indexes for query filters used in GraphQL.

### 3.6 Subscriptions
- Implement basic subscription topics:
  - `applicationStatusChanged(applicationId)`
  - `newApplication(shelterId)`
  - `animalStatusChanged(animalId)`
- Use `graphql-ws` server bound to the same HTTP server instance.

### 3.7 Schema Documentation
- Export `schema.graphql` via `npm run schema:export`.
- Publish output to `docs/schema/` in the repo.
- Optionally add markdown docs later (graphql-markdown or similar).

---

## 4. Implementation Plan

### Phase 1: Apollo Server v4 Migration
1. Add Apollo Server dependencies and Express middleware.
2. Replace `graphql-http` wiring with Apollo Server setup.
3. Ensure CORS and auth integration remain intact.

### Phase 2: DataLoader Integration
1. Introduce DataLoader classes and context injection.
2. Refactor resolvers to use loaders.

### Phase 3: Subscriptions
1. Add `graphql-ws` server.
2. Add pub/sub mechanism (in-memory for now, Redis later).
3. Implement subscription resolvers.

### Phase 4: Documentation
1. Add schema export script.
2. Generate schema docs and commit to `docs/schema/`.

---

## 5. Testing Strategy

### Unit Tests
- DataLoader batching behavior.
- Resolver-level pagination validation.

### Integration Tests
- GraphQL queries against Apollo Server.
- Subscription connection + event delivery.

### E2E Tests
- Application status updates reflect in real-time UI.

---

## 6. Security Considerations
- Ensure auth checks in context still protect user-specific data.
- Validate subscription access by user role and shelter membership.

---

## 7. Performance Considerations
- DataLoader reduces N+1 database queries.
- Subscriptions should be rate-limited by topic and scope.
- Consider Redis-backed pub/sub for multi-instance deployments.

---

## 8. Rollout Plan
- Deploy Apollo Server v4 behind a feature flag if needed.
- Enable subscriptions only after load testing.
- Monitor query timing and error rate in logs.

---

## 9. Open Questions
- Should subscription support be limited to authenticated clients only?
- Do we need a Redis pub/sub layer before enabling subscriptions in production?
- Which schema documentation generator best fits CI and repo size constraints?

---

## 10. References
- Apollo Server v4 Docs: https://www.apollographql.com/docs/apollo-server/
- DataLoader: https://github.com/graphql/dataloader
- graphql-ws: https://github.com/enisdenjo/graphql-ws

---

## 11. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | Feb 3, 2026 | Codex | Initial draft for GraphQL enhancement |
