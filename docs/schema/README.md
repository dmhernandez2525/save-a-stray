# GraphQL Schema Documentation

**Last Updated:** February 15, 2026
**Feature:** F1.3 GraphQL Enhancement

---

## Overview

This folder documents schema-level contracts introduced and hardened in F1.3:

- Cursor pagination for animals and applications
- Input validation via custom scalars (`Email`, `URL`, `Date`)
- Query abuse protection (depth + complexity limits)
- Generated TypeScript types for connection queries on both server and client
- Deprecation metadata for compatibility aliases

---

## Generation Commands

Run these from repository root:

```bash
npm run schema:export
npm run schema:types
```

Or run both:

```bash
npm run schema:generate
```

Outputs:

- `docs/schema/schema.graphql`
- `shared/types/graphql/generated/`
- `client/src/types/generated/graphql/`

---

## Custom Scalars

| Scalar  | Validation Rule                | Typical Usage                                                   |
| ------- | ------------------------------ | --------------------------------------------------------------- |
| `Email` | RFC email format               | auth, shelter staff invites, contacts                           |
| `URL`   | absolute `http` or `https` URL | shelter website links                                           |
| `Date`  | ISO-8601 datetime parsing      | event scheduling, foster timelines, medical/intake/outcome logs |

---

## Cursor Pagination

### Query Fields

- `animalsConnection(first, after, status, type, shelterId)`
- `applicationsConnection(first, after, status, userId, shelterId)`

### Connection Types

- `AnimalConnection`
- `ApplicationConnection`
- `PageInfo`

### Deprecated Alias

- `applicationConnectionById` is retained for backward compatibility and marked:
  - `deprecationReason: "Use applicationsConnection instead."`

---

## Query Protection Limits

These limits are enforced through GraphQL validation rules:

- `GRAPHQL_MAX_DEPTH` (default `8`)
- `GRAPHQL_MAX_COMPLEXITY` (default `300`)

Error codes returned when limits are exceeded:

- `QUERY_DEPTH_LIMIT_EXCEEDED`
- `QUERY_COMPLEXITY_LIMIT_EXCEEDED`

---

## Error Contract

Apollo error formatting normalizes GraphQL responses with stable codes:

- `UNAUTHENTICATED`
- `FORBIDDEN`
- `BAD_USER_INPUT`
- `QUERY_DEPTH_LIMIT_EXCEEDED`
- `QUERY_COMPLEXITY_LIMIT_EXCEEDED`
- `INTERNAL_SERVER_ERROR`

Internal errors are masked from clients while still logged server-side.
