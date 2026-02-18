// ── Security Audit Utilities ──────────────────────────────────
// Tools for security validation, input sanitization, and audit logging

// ── Input Sanitization ────────────────────────────────────────

export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

export function sanitizeForUrl(input: string): string {
  return encodeURIComponent(input);
}

export function stripScriptTags(input: string): string {
  return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
}

export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/\.{2,}/g, '.').slice(0, 255);
}

// ── Password Validation ───────────────────────────────────────

export interface PasswordStrength {
  score: number;
  level: 'weak' | 'fair' | 'good' | 'strong';
  suggestions: string[];
}

export function checkPasswordStrength(password: string): PasswordStrength {
  let score = 0;
  const suggestions: string[] = [];

  if (password.length >= 8) score += 1;
  else suggestions.push('Use at least 8 characters');

  if (password.length >= 12) score += 1;

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  else suggestions.push('Use both uppercase and lowercase letters');

  if (/\d/.test(password)) score += 1;
  else suggestions.push('Include at least one number');

  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) score += 1;
  else suggestions.push('Include at least one special character');

  // Penalize common patterns
  if (/^(password|123456|qwerty|admin)/i.test(password)) {
    score = Math.max(0, score - 3);
    suggestions.push('Avoid common passwords');
  }

  if (/(.)\1{2,}/.test(password)) {
    score = Math.max(0, score - 1);
    suggestions.push('Avoid repeated characters');
  }

  const level = score <= 1 ? 'weak' : score <= 2 ? 'fair' : score <= 3 ? 'good' : 'strong';
  return { score, level, suggestions };
}

// ── CSRF Token Management ─────────────────────────────────────

export function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

export function validateCsrfToken(token: string, expected: string): boolean {
  if (token.length !== expected.length) return false;
  let result = 0;
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return result === 0;
}

// ── Security Headers Validation ───────────────────────────────

export interface SecurityHeaderCheck {
  header: string;
  present: boolean;
  value: string | null;
  recommendation: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export const REQUIRED_SECURITY_HEADERS = [
  { header: 'Content-Security-Policy', severity: 'critical' as const, recommendation: "Add CSP header to prevent XSS" },
  { header: 'X-Content-Type-Options', severity: 'high' as const, recommendation: 'Set to "nosniff"' },
  { header: 'X-Frame-Options', severity: 'high' as const, recommendation: 'Set to "DENY" or "SAMEORIGIN"' },
  { header: 'Strict-Transport-Security', severity: 'high' as const, recommendation: 'Set max-age to at least 31536000' },
  { header: 'X-XSS-Protection', severity: 'medium' as const, recommendation: 'Set to "1; mode=block"' },
  { header: 'Referrer-Policy', severity: 'medium' as const, recommendation: 'Set to "strict-origin-when-cross-origin"' },
  { header: 'Permissions-Policy', severity: 'low' as const, recommendation: 'Restrict browser features' },
];

export function checkSecurityHeaders(headers: Record<string, string>): SecurityHeaderCheck[] {
  return REQUIRED_SECURITY_HEADERS.map(req => ({
    header: req.header,
    present: req.header in headers,
    value: headers[req.header] ?? null,
    recommendation: req.recommendation,
    severity: req.severity,
  }));
}

// ── OWASP Top 10 Checklist ────────────────────────────────────

export interface SecurityCheckItem {
  id: string;
  category: string;
  description: string;
  status: 'pass' | 'fail' | 'warn' | 'not_tested';
}

export const OWASP_CHECKLIST: Omit<SecurityCheckItem, 'status'>[] = [
  { id: 'A01', category: 'Broken Access Control', description: 'Auth checks on all protected routes' },
  { id: 'A02', category: 'Cryptographic Failures', description: 'Passwords hashed with bcrypt/argon2' },
  { id: 'A03', category: 'Injection', description: 'Parameterized queries, no string concatenation' },
  { id: 'A04', category: 'Insecure Design', description: 'Rate limiting on auth endpoints' },
  { id: 'A05', category: 'Security Misconfiguration', description: 'Security headers present' },
  { id: 'A06', category: 'Vulnerable Components', description: 'No known CVEs in dependencies' },
  { id: 'A07', category: 'Auth Failures', description: 'Account lockout after failed attempts' },
  { id: 'A08', category: 'Data Integrity', description: 'CSRF protection enabled' },
  { id: 'A09', category: 'Logging Failures', description: 'Security events are logged' },
  { id: 'A10', category: 'SSRF', description: 'URL validation on server-side requests' },
];

// ── Audit Log ─────────────────────────────────────────────────

export interface AuditLogEntry {
  timestamp: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  result: 'success' | 'failure' | 'denied';
  ip?: string;
  metadata?: Record<string, string>;
}

const AUDIT_LOG_KEY = 'security_audit_log';
const MAX_AUDIT_ENTRIES = 500;

export function logAuditEvent(entry: Omit<AuditLogEntry, 'timestamp'>): void {
  try {
    const data = localStorage.getItem(AUDIT_LOG_KEY);
    const log: AuditLogEntry[] = data ? JSON.parse(data) : [];
    log.unshift({ ...entry, timestamp: new Date().toISOString() });
    if (log.length > MAX_AUDIT_ENTRIES) log.length = MAX_AUDIT_ENTRIES;
    localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(log));
  } catch {
    // Silent fail
  }
}

export function getAuditLog(filters?: { userId?: string; action?: string; result?: string }): AuditLogEntry[] {
  try {
    const data = localStorage.getItem(AUDIT_LOG_KEY);
    let log: AuditLogEntry[] = data ? JSON.parse(data) : [];
    if (filters?.userId) log = log.filter(e => e.userId === filters.userId);
    if (filters?.action) log = log.filter(e => e.action === filters.action);
    if (filters?.result) log = log.filter(e => e.result === filters.result);
    return log;
  } catch {
    return [];
  }
}

export function clearAuditLog(): void {
  localStorage.removeItem(AUDIT_LOG_KEY);
}

// ── URL Validation ────────────────────────────────────────────

export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function isSafeRedirectUrl(url: string, allowedHosts: string[]): boolean {
  try {
    const parsed = new URL(url);
    return allowedHosts.includes(parsed.hostname);
  } catch {
    if (!url.startsWith('/') || url.startsWith('//') || url.startsWith('/\\')) return false;
    // Normalize path to prevent traversal (e.g. /../../admin)
    const segments = url.split('/').filter(Boolean);
    let depth = 0;
    for (const seg of segments) {
      if (seg === '..') depth--;
      else if (seg !== '.') depth++;
      if (depth < 0) return false;
    }
    return true;
  }
}
