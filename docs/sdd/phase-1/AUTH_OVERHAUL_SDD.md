# Software Design Document: Authentication Overhaul

**Version:** 1.0.0
**Author:** Codex
**Created:** February 3, 2026
**Last Updated:** February 3, 2026
**Status:** Draft
**Feature IDs:** F1.4

---

## 1. Overview

### 1.1 Purpose
Modernize authentication to support refresh tokens, OAuth providers (Google, Facebook, Apple), password reset, email verification, optional TOTP-based 2FA, and session management.

### 1.2 Goals
- Add JWT refresh tokens with rotation and revocation.
- Implement OAuth flows for Google, Facebook, and Apple.
- Provide password reset and email verification flows.
- Add optional TOTP 2FA with backup codes.
- Introduce session management with device tracking.

### 1.3 Non-Goals
- Replacing the existing JWT access token mechanism entirely.
- Rebuilding the user account model from scratch.
- Implementing SMS-based 2FA for Phase 1.

---

## 2. Background

### 2.1 Current State
- JWT access tokens issued on login.
- LocalStorage holds the access token.
- OAuth integrations exist in legacy form (Google/Facebook) but are not fully configured.
- No refresh tokens, no email verification, and no 2FA.

### 2.2 Problem Statement
The current auth flow lacks token rotation, verification, and recovery mechanisms. This increases security risk, complicates session management, and blocks features like 2FA and password reset.

### 2.3 User Stories
- As a user, I want to reset my password securely if I forget it.
- As a user, I want to verify my email so my account is trusted.
- As a user, I want to stay logged in without re-entering my password every session.
- As a shelter admin, I want to enable 2FA to protect sensitive data.

---

## 3. Technical Design

### 3.1 Token Strategy
- **Access token**: short-lived JWT (15 minutes).
- **Refresh token**: long-lived, stored server-side as hashed token.
- Refresh token rotation on every refresh.
- Access token remains stored in localStorage for compatibility (future option: move to in-memory storage).

### 3.2 Session Management
Introduce a `Session` collection:
- `userId`
- `refreshTokenHash`
- `deviceName` / `userAgent`
- `ipAddress`
- `createdAt`, `expiresAt`, `revokedAt`

Provide API for:
- list sessions
- revoke session
- revoke all sessions

### 3.3 OAuth Providers
- Google OAuth via Passport strategy.
- Facebook OAuth via Passport strategy.
- Apple Sign-In via Passport Apple strategy.

### 3.4 Password Reset
- Generate reset token (random + hashed).
- Store token with expiry.
- Email reset link with token.

### 3.5 Email Verification
- Generate verification token (random + hashed).
- Store token with expiry.
- Email verification link.

### 3.6 TOTP 2FA
- Store encrypted TOTP secret in user profile.
- Provide setup QR code.
- Require TOTP on login when enabled.
- Generate one-time backup codes (hashed).

---

## 4. GraphQL Schema Changes

### 4.1 Types
```graphql
type Session {
  id: ID!
  userId: ID!
  deviceName: String
  ipAddress: String
  userAgent: String
  createdAt: DateTime!
  expiresAt: DateTime!
  revokedAt: DateTime
}
```

### 4.2 Mutations
```graphql
extend type Mutation {
  refreshToken: AuthPayload!
  revokeSession(sessionId: ID!): Boolean!
  revokeAllSessions: Boolean!
  requestPasswordReset(email: String!): Boolean!
  resetPassword(token: String!, newPassword: String!): Boolean!
  requestEmailVerification: Boolean!
  verifyEmail(token: String!): Boolean!
  enableTotp: TotpSetupPayload!
  confirmTotp(code: String!): Boolean!
  disableTotp(code: String!): Boolean!
}
```

---

## 5. Implementation Plan

### Phase 1: Token + Session Infrastructure
1. Add `Session` model and refresh token storage.
2. Add refresh token mutation and rotation logic.

### Phase 2: Email Flows
1. Implement password reset flow.
2. Implement email verification flow.

### Phase 3: OAuth Expansion
1. Configure Google + Facebook OAuth.
2. Add Apple OAuth.

### Phase 4: 2FA
1. Add TOTP setup and verification.
2. Add backup codes.

---

## 6. Testing Strategy

### Unit Tests
- Refresh token rotation.
- Password reset token validation.
- Email verification token validation.
- TOTP setup and validation.

### Integration Tests
- OAuth login flows (mocked).
- Session revocation behavior.
- Refresh token expiration.

### E2E Tests
- Register → verify email → login.
- Login → refresh token.
- Enable 2FA → login with TOTP.

---

## 7. Security Considerations
- Hash all reset and verification tokens.
- Revoke refresh tokens on password change.
- Enforce rate limits for auth endpoints.
- Encrypt TOTP secrets at rest.

---

## 8. Performance Considerations
- Session queries should be indexed by `userId`.
- Refresh token lookups indexed by hash.

---

## 9. Rollout Plan
- Deploy token refresh first (backwards-compatible).
- Roll out email verification and password reset.
- Enable OAuth providers after credentials are set.
- Offer 2FA as opt-in.

---

## 10. Open Questions
- Should access tokens move to httpOnly cookies in a later phase?
- Do we require email verification before allowing applications?
- Should sessions auto-expire after 30 or 90 days?

---

## 11. References
- JWT Best Practices: https://datatracker.ietf.org/doc/html/rfc7519
- OWASP Authentication Guidelines: https://owasp.org/www-project-cheat-sheets/cheatsheets/Authentication_Cheat_Sheet.html

---

## 12. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | Feb 3, 2026 | Codex | Initial draft for authentication overhaul |
