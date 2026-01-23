# Software Design Document: Debounced Real-Time Search

**Phase:** 14
**Status:** Implemented
**Date:** January 22, 2026

---

## 1. Overview

The debounced real-time search feature improves the user experience when searching for animals by preventing excessive API calls during rapid text input. Text and numeric filter inputs (name, breed, color, minAge, maxAge) are debounced with a 300ms delay, while discrete selections (type buttons, sex/status dropdowns) trigger queries immediately.

---

## 2. Problem Statement

Previously, every keystroke in the search filters triggered an immediate GraphQL query. This caused:
- Unnecessary network requests during typing
- Potential rate limiting issues
- Poor perceived performance with results flashing on each keystroke
- Wasted server resources processing partial queries

---

## 3. Solution Design

### Dual-State Architecture

The `UserLanding` component maintains two filter states:

| State | Purpose | Update Timing |
|-------|---------|---------------|
| `filters` | Controlled input values (what the user sees) | Immediate on every change |
| `queryFilters` | Variables passed to Apollo Query | Debounced for text/numeric, immediate for selects |

### Filter Categories

| Category | Fields | Behavior |
|----------|--------|----------|
| Text inputs | `name`, `breed`, `color` | 300ms debounce |
| Numeric inputs | `minAge`, `maxAge` | 300ms debounce |
| Buttons | `type` (Dogs/Cats/Other) | Immediate |
| Selects | `sex`, `status` | Immediate |

### Debounce Logic

```
User types in text field
  → `filters` state updates immediately (input stays responsive)
  → Timer starts/resets for 300ms
  → If user keeps typing, timer resets
  → After 300ms of inactivity:
    → `queryFilters` updates
    → Apollo Query re-renders with new variables
    → API call fires

User clicks button/changes select
  → `filters` and `queryFilters` update simultaneously
  → Any pending debounce timer is canceled
  → API call fires immediately
```

### Visual Feedback

A "Searching..." indicator appears when `filters` differs from `queryFilters`, indicating a debounce is pending. This disappears once the query fires.

---

## 4. Implementation Details

### Debounce Utility

A generic `debounce` utility function (`client/src/util/debounce.ts`) provides:
- Configurable delay
- Argument forwarding
- Cancel method for cleanup

### Component Changes

| File | Change |
|------|--------|
| `client/src/util/debounce.ts` | Created - generic debounce utility |
| `client/src/components/UserLanding.tsx` | Added dual-state filter architecture |
| `client/src/test/debounce.test.js` | Created - debounce utility tests |
| `client/src/test/UserLanding.test.js` | Added debounced search behavior tests |

### Key Implementation Decisions

1. **Timer-based debounce in class component**: Since `UserLanding` is a class component, `setTimeout`/`clearTimeout` is used directly rather than a React hook.
2. **Cleanup on unmount**: `componentWillUnmount` clears any pending timers to prevent memory leaks.
3. **Immediate cancel on discrete changes**: When a button/select changes, any pending debounce is canceled and the new complete filter set fires immediately. This prevents stale debounced queries from overwriting intentional selections.

---

## 5. Testing

### Debounce Utility Tests (7 tests)
- Delays function execution by specified ms
- Resets timer on subsequent calls
- Passes arguments correctly
- Uses latest arguments on multiple calls
- Provides cancel method
- Allows multiple independent calls after completion
- Handles zero delay

### Debounced Search Behavior Tests (5 tests)
- Debounces text input changes (simulates typing character by character)
- Immediately fires for type button changes
- Immediately fires for sex select changes
- Cancels pending debounce when immediate filter changes
- Debounces numeric age filter changes

---

## 6. Performance Impact

| Metric | Before | After |
|--------|--------|-------|
| API calls per "Buddy" search | 5 (one per keystroke) | 1 (after 300ms pause) |
| Input responsiveness | Immediate | Immediate (filters state still instant) |
| Network overhead | High during typing | Minimal |
