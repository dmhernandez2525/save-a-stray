import { describe, it, expect, beforeEach } from 'vitest';
import {
  sanitizeHtml, sanitizeForUrl, stripScriptTags, sanitizeFilename,
  checkPasswordStrength,
  generateCsrfToken, validateCsrfToken,
  REQUIRED_SECURITY_HEADERS, checkSecurityHeaders,
  OWASP_CHECKLIST,
  logAuditEvent, getAuditLog, clearAuditLog,
  isValidUrl, isSafeRedirectUrl,
} from '../lib/security-audit';

describe('Security Audit', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('HTML Sanitization', () => {
    it('should escape HTML tags', () => {
      expect(sanitizeHtml('<script>alert("xss")</script>')).not.toContain('<script>');
      expect(sanitizeHtml('<b>bold</b>')).toBe('&lt;b&gt;bold&lt;/b&gt;');
    });

    it('should escape quotes', () => {
      expect(sanitizeHtml('"hello"')).toBe('&quot;hello&quot;');
      expect(sanitizeHtml("'hello'")).toBe('&#x27;hello&#x27;');
    });

    it('should escape ampersands', () => {
      expect(sanitizeHtml('a & b')).toBe('a &amp; b');
    });

    it('should handle empty string', () => {
      expect(sanitizeHtml('')).toBe('');
    });
  });

  describe('URL Sanitization', () => {
    it('should encode special characters', () => {
      expect(sanitizeForUrl('hello world')).toBe('hello%20world');
      expect(sanitizeForUrl('<script>')).not.toContain('<');
    });
  });

  describe('Script Tag Stripping', () => {
    it('should remove script tags', () => {
      expect(stripScriptTags('Hello<script>alert(1)</script>World')).toBe('HelloWorld');
    });

    it('should handle multiple script tags', () => {
      const input = '<script>a</script>text<script>b</script>';
      expect(stripScriptTags(input)).toBe('text');
    });

    it('should preserve non-script HTML', () => {
      expect(stripScriptTags('<b>bold</b>')).toBe('<b>bold</b>');
    });
  });

  describe('Filename Sanitization', () => {
    it('should remove special characters', () => {
      expect(sanitizeFilename('my file (1).csv')).toBe('my_file__1_.csv');
    });

    it('should prevent directory traversal', () => {
      expect(sanitizeFilename('../../../etc/passwd')).not.toContain('..');
    });

    it('should limit length to 255', () => {
      const long = 'a'.repeat(300) + '.csv';
      expect(sanitizeFilename(long).length).toBeLessThanOrEqual(255);
    });
  });

  describe('Password Strength', () => {
    it('should rate weak passwords', () => {
      const result = checkPasswordStrength('123');
      expect(result.level).toBe('weak');
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it('should rate strong passwords', () => {
      const result = checkPasswordStrength('MyStr0ng!Pass#2025');
      expect(result.level).toBe('strong');
      expect(result.score).toBeGreaterThanOrEqual(4);
    });

    it('should penalize common passwords', () => {
      const result = checkPasswordStrength('password123');
      expect(result.suggestions).toContain('Avoid common passwords');
    });

    it('should penalize repeated characters', () => {
      const result = checkPasswordStrength('aaabbbccc');
      expect(result.suggestions).toContain('Avoid repeated characters');
    });

    it('should suggest missing character types', () => {
      const result = checkPasswordStrength('alllowercase');
      expect(result.suggestions.some(s => s.includes('uppercase'))).toBe(true);
    });
  });

  describe('CSRF Token', () => {
    it('should generate 64-char hex token', () => {
      const token = generateCsrfToken();
      expect(token).toHaveLength(64);
      expect(token).toMatch(/^[0-9a-f]+$/);
    });

    it('should generate unique tokens', () => {
      const t1 = generateCsrfToken();
      const t2 = generateCsrfToken();
      expect(t1).not.toBe(t2);
    });

    it('should validate matching tokens', () => {
      const token = 'abc123def456';
      expect(validateCsrfToken(token, token)).toBe(true);
    });

    it('should reject mismatched tokens', () => {
      expect(validateCsrfToken('abc123', 'xyz789')).toBe(false);
    });

    it('should reject different length tokens', () => {
      expect(validateCsrfToken('short', 'longer_token')).toBe(false);
    });
  });

  describe('Security Headers', () => {
    it('should define 7 required headers', () => {
      expect(REQUIRED_SECURITY_HEADERS).toHaveLength(7);
    });

    it('should include CSP as critical', () => {
      const csp = REQUIRED_SECURITY_HEADERS.find(h => h.header === 'Content-Security-Policy');
      expect(csp!.severity).toBe('critical');
    });

    it('should check headers present', () => {
      const headers = { 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY' };
      const results = checkSecurityHeaders(headers);
      const xcto = results.find(r => r.header === 'X-Content-Type-Options');
      expect(xcto!.present).toBe(true);
      expect(xcto!.value).toBe('nosniff');
    });

    it('should report missing headers', () => {
      const results = checkSecurityHeaders({});
      const missing = results.filter(r => !r.present);
      expect(missing).toHaveLength(7);
    });

    it('should include severity for each check', () => {
      const results = checkSecurityHeaders({});
      results.forEach(r => {
        expect(['critical', 'high', 'medium', 'low']).toContain(r.severity);
      });
    });
  });

  describe('OWASP Checklist', () => {
    it('should cover all 10 OWASP categories', () => {
      expect(OWASP_CHECKLIST).toHaveLength(10);
    });

    it('should have IDs A01 through A10', () => {
      const ids = OWASP_CHECKLIST.map(c => c.id);
      for (let i = 1; i <= 10; i++) {
        expect(ids).toContain(`A${i.toString().padStart(2, '0')}`);
      }
    });

    it('should include injection prevention', () => {
      const injection = OWASP_CHECKLIST.find(c => c.id === 'A03');
      expect(injection!.category).toBe('Injection');
    });

    it('should include auth failures', () => {
      const auth = OWASP_CHECKLIST.find(c => c.id === 'A07');
      expect(auth!.category).toContain('Auth');
    });
  });

  describe('Audit Logging', () => {
    it('should log events', () => {
      logAuditEvent({ userId: 'u1', action: 'login', resource: 'session', resourceId: 's1', result: 'success' });
      const log = getAuditLog();
      expect(log).toHaveLength(1);
      expect(log[0].action).toBe('login');
    });

    it('should include timestamp', () => {
      logAuditEvent({ userId: 'u1', action: 'login', resource: 'session', resourceId: 's1', result: 'success' });
      const log = getAuditLog();
      expect(new Date(log[0].timestamp).getTime()).not.toBeNaN();
    });

    it('should filter by userId', () => {
      logAuditEvent({ userId: 'u1', action: 'login', resource: 'session', resourceId: 's1', result: 'success' });
      logAuditEvent({ userId: 'u2', action: 'login', resource: 'session', resourceId: 's2', result: 'success' });
      expect(getAuditLog({ userId: 'u1' })).toHaveLength(1);
    });

    it('should filter by action', () => {
      logAuditEvent({ userId: 'u1', action: 'login', resource: 'session', resourceId: 's1', result: 'success' });
      logAuditEvent({ userId: 'u1', action: 'logout', resource: 'session', resourceId: 's1', result: 'success' });
      expect(getAuditLog({ action: 'login' })).toHaveLength(1);
    });

    it('should filter by result', () => {
      logAuditEvent({ userId: 'u1', action: 'login', resource: 'session', resourceId: 's1', result: 'success' });
      logAuditEvent({ userId: 'u2', action: 'login', resource: 'session', resourceId: 's2', result: 'failure' });
      expect(getAuditLog({ result: 'failure' })).toHaveLength(1);
    });

    it('should limit to 500 entries', () => {
      for (let i = 0; i < 550; i++) {
        logAuditEvent({ userId: 'u1', action: 'view', resource: 'animal', resourceId: `a${i}`, result: 'success' });
      }
      expect(getAuditLog().length).toBeLessThanOrEqual(500);
    });

    it('should clear audit log', () => {
      logAuditEvent({ userId: 'u1', action: 'login', resource: 'session', resourceId: 's1', result: 'success' });
      clearAuditLog();
      expect(getAuditLog()).toHaveLength(0);
    });
  });

  describe('URL Validation', () => {
    it('should accept valid HTTP URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://example.com')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('javascript:alert(1)')).toBe(false);
      expect(isValidUrl('ftp://example.com')).toBe(false);
    });

    it('should reject empty string', () => {
      expect(isValidUrl('')).toBe(false);
    });
  });

  describe('Safe Redirect', () => {
    const allowed = ['saveastray.com', 'www.saveastray.com'];

    it('should allow redirects to allowed hosts', () => {
      expect(isSafeRedirectUrl('https://saveastray.com/dashboard', allowed)).toBe(true);
    });

    it('should reject redirects to unknown hosts', () => {
      expect(isSafeRedirectUrl('https://evil.com/steal', allowed)).toBe(false);
    });

    it('should allow relative URLs', () => {
      expect(isSafeRedirectUrl('/dashboard', allowed)).toBe(true);
    });

    it('should reject protocol-relative URLs', () => {
      expect(isSafeRedirectUrl('//evil.com/steal', allowed)).toBe(false);
    });
  });
});
