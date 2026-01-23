const validText = require('../server/validation/valid-text').default;
const validateLoginInput = require('../server/validation/login').default;
const validateRegisterInput = require('../server/validation/register').default;

describe('Validation Utilities', () => {
  describe('validText', () => {
    it('should return true for non-empty strings', () => {
      expect(validText('hello')).toBe(true);
      expect(validText('  text with spaces  ')).toBe(true);
    });

    it('should return false for empty strings', () => {
      expect(validText('')).toBe(false);
      expect(validText('   ')).toBe(false);
    });

    it('should return false for non-string values', () => {
      expect(validText(null)).toBe(false);
      expect(validText(undefined)).toBe(false);
      expect(validText(123)).toBe(false);
      expect(validText({})).toBe(false);
    });
  });

  describe('validateLoginInput', () => {
    it('should return valid for correct login data', () => {
      const result = validateLoginInput({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.isValid).toBe(true);
      expect(result.message).toBe('');
    });

    it('should return invalid for missing email', () => {
      const result = validateLoginInput({
        email: '',
        password: 'password123',
      });
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('Email');
    });

    it('should return invalid for invalid email format', () => {
      const result = validateLoginInput({
        email: 'not-an-email',
        password: 'password123',
      });
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('Email is invalid');
    });

    it('should return invalid for missing password', () => {
      const result = validateLoginInput({
        email: 'test@example.com',
        password: '',
      });
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('Password');
    });
  });

  describe('validateRegisterInput', () => {
    it('should return valid for correct registration data', () => {
      const result = validateRegisterInput({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'securepassword123',
        userRole: 'user',
      });
      expect(result.isValid).toBe(true);
      expect(result.message).toBe('');
    });

    it('should return invalid for password too short', () => {
      const result = validateRegisterInput({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'short',
        userRole: 'user',
      });
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('Password length');
    });

    it('should return invalid for name too short', () => {
      const result = validateRegisterInput({
        name: 'J',
        email: 'john@example.com',
        password: 'securepassword123',
        userRole: 'user',
      });
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('Name length');
    });
  });
});
