# Software Design Document: Unified Shelter Registration Flow

**Version:** 1.0.0
**Author:** Daniel Hernandez
**Created:** January 22, 2026
**Last Updated:** January 22, 2026
**Status:** Implemented

---

## 1. Overview

### 1.1 Purpose
Provide a unified registration flow that allows users to register as either an adopter or shelter staff member. When registering as shelter staff, users can create their shelter organization in the same step, eliminating the previous two-step process.

### 1.2 Goals
- Single-page registration for both user types
- Inline shelter creation during shelter staff registration
- Automatic user-shelter linking
- Clear role selection UI with conditional form fields

### 1.3 Non-Goals
- Multi-tenant shelter management (multiple shelters per user)
- Invitation-based shelter staff onboarding
- Shelter verification during registration

---

## 2. Background

### 2.1 Current State (Before)
The shelter registration required two separate steps:
1. Navigate to `/newShelter` to create a shelter (returns shelterId)
2. Navigate to `/RegisterShelter/:shelterId` to create the admin user account

This was confusing for new users and required understanding the multi-step flow.

### 2.2 Problem Statement
New shelter staff had to complete a disconnected two-step process to set up their account, leading to abandonment and confusion.

### 2.3 User Stories
- As a shelter admin, I want to register my account and create my shelter in one step so that I can start using the platform immediately
- As an adopter, I want a clear registration form that doesn't overwhelm me with shelter-specific fields

---

## 3. Technical Design

### 3.1 Architecture Overview
```
Register Page (/register)
├── Role Selector (Adopter | Shelter Staff)
├── Common Fields (name, email, password)
├── Conditional Shelter Fields (when Shelter Staff selected)
│   ├── Shelter Name
│   ├── Shelter Location
│   └── Shelter Payment Email
└── Submit → register mutation
    ├── If endUser: create user only
    └── If shelter + shelter fields: create shelter → create user → link
```

### 3.2 GraphQL Schema Changes

```graphql
# Extended register mutation arguments
mutation register(
  name: String!
  email: String!
  password: String!
  userRole: String!
  shelterId: String          # Legacy: link to existing shelter
  shelterName: String        # NEW: create shelter inline
  shelterLocation: String    # NEW: shelter address
  shelterPaymentEmail: String # NEW: shelter payment email
): UserAuthPayload
```

### 3.3 Backend Logic (auth.ts)

1. Validate registration input (name, email, password)
2. Check for duplicate email/name
3. If `userRole === 'shelter'` AND shelter fields provided:
   a. Create new Shelter document
   b. Set `resolvedShelterId` to new shelter's `_id`
4. Create User with `shelterId = resolvedShelterId`
5. Add user to shelter's `users` array
6. Generate JWT token and return auth payload

### 3.4 Frontend Component (Register.tsx)

- Class component with role toggle state
- `userRole` defaults to `"endUser"`
- Role selector buttons toggle between Adopter and Shelter Staff
- Shelter fields conditionally rendered when `userRole === "shelter"`
- Submit button text changes based on role
- Shelter users redirected to `/Shelter` dashboard; adopters to `/Landing`

---

## 4. Files Modified

| File | Change |
|------|--------|
| `shared/types/index.ts` | Added `shelterName`, `shelterLocation`, `shelterPaymentEmail` to `RegisterInput` |
| `server/schema/mutations.ts` | Added shelter args to `register` mutation, updated `RegisterArgs` |
| `server/services/auth.ts` | Added Shelter import, inline shelter creation logic |
| `client/src/graphql/mutations.ts` | Added shelter variables to `REGISTER_USER` mutation |
| `client/src/types/index.ts` | Added shelter fields to `RegisterFormState` |
| `client/src/components/Register.tsx` | Added role selector, conditional shelter fields |
| `client/src/components/RegisterShelter.tsx` | Updated state initialization for type compatibility |
| `tests/api-integration.test.js` | Added test for shelter registration args |
| `tests/auth.test.js` | Added Shelter mock, shelter registration tests |
| `client/src/test/Register.test.js` | New: 18 tests for Register component with role selection |

---

## 5. Testing

- **Backend:** 106 tests passing (schema args, auth service shelter flow)
- **Frontend:** 118 tests passing (role selector, conditional fields, form state)
- **TypeScript:** Both server and client compile without errors
