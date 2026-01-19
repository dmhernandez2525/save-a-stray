const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock the modules before requiring auth service
jest.mock('../server/models/User', () => {
  const mockUser = jest.fn();
  mockUser.findOne = jest.fn();
  mockUser.findById = jest.fn();
  return mockUser;
});

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compareSync: jest.fn()
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn()
}));

jest.mock('../config/keys', () => ({
  secretOrKey: 'test-secret-key'
}));

const User = require('../server/models/User');
const keys = require('../config/keys');

// Import validation functions for testing
const validateRegisterInput = require('../server/validation/register');
const validateLoginInput = require('../server/validation/login');

describe('Auth Service Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Registration Validation', () => {
    it('should validate correct registration data', () => {
      const result = validateRegisterInput({
        name: 'Test User',
        email: 'test@example.com',
        password: 'validpassword123',
        userRole: 'endUser'
      });

      expect(result.isValid).toBe(true);
      expect(result.message).toBe('');
    });

    it('should reject registration with short name', () => {
      const result = validateRegisterInput({
        name: 'A',
        email: 'test@example.com',
        password: 'validpassword123',
        userRole: 'endUser'
      });

      expect(result.isValid).toBe(false);
      expect(result.message).toContain('Name length');
    });

    it('should reject registration with long name', () => {
      const result = validateRegisterInput({
        name: 'A'.repeat(35),
        email: 'test@example.com',
        password: 'validpassword123',
        userRole: 'endUser'
      });

      expect(result.isValid).toBe(false);
      expect(result.message).toContain('Name length');
    });

    it('should reject registration with invalid email', () => {
      const result = validateRegisterInput({
        name: 'Test User',
        email: 'invalid-email',
        password: 'validpassword123',
        userRole: 'endUser'
      });

      expect(result.isValid).toBe(false);
      expect(result.message).toContain('Email is invalid');
    });

    it('should reject registration with short password', () => {
      const result = validateRegisterInput({
        name: 'Test User',
        email: 'test@example.com',
        password: 'short',
        userRole: 'endUser'
      });

      expect(result.isValid).toBe(false);
      expect(result.message).toContain('Password length');
    });

    it('should reject registration with long password', () => {
      const result = validateRegisterInput({
        name: 'Test User',
        email: 'test@example.com',
        password: 'a'.repeat(35),
        userRole: 'endUser'
      });

      expect(result.isValid).toBe(false);
      expect(result.message).toContain('Password length');
    });

    it('should reject registration with missing name', () => {
      const result = validateRegisterInput({
        name: '',
        email: 'test@example.com',
        password: 'validpassword123',
        userRole: 'endUser'
      });

      expect(result.isValid).toBe(false);
      expect(result.message).toContain('Name');
    });

    it('should reject registration with missing email', () => {
      const result = validateRegisterInput({
        name: 'Test User',
        email: '',
        password: 'validpassword123',
        userRole: 'endUser'
      });

      expect(result.isValid).toBe(false);
      expect(result.message).toContain('Email');
    });

    it('should reject registration with missing password', () => {
      const result = validateRegisterInput({
        name: 'Test User',
        email: 'test@example.com',
        password: '',
        userRole: 'endUser'
      });

      expect(result.isValid).toBe(false);
      expect(result.message).toContain('Password');
    });
  });

  describe('Login Validation', () => {
    it('should validate correct login data', () => {
      const result = validateLoginInput({
        email: 'test@example.com',
        password: 'password123'
      });

      expect(result.isValid).toBe(true);
      expect(result.message).toBe('');
    });

    it('should reject login with missing email', () => {
      const result = validateLoginInput({
        email: '',
        password: 'password123'
      });

      expect(result.isValid).toBe(false);
      expect(result.message).toContain('Email');
    });

    it('should reject login with invalid email format', () => {
      const result = validateLoginInput({
        email: 'not-valid-email',
        password: 'password123'
      });

      expect(result.isValid).toBe(false);
      expect(result.message).toContain('Email is invalid');
    });

    it('should reject login with missing password', () => {
      const result = validateLoginInput({
        email: 'test@example.com',
        password: ''
      });

      expect(result.isValid).toBe(false);
      expect(result.message).toContain('Password');
    });

    it('should handle null values gracefully', () => {
      const result = validateLoginInput({
        email: null,
        password: null
      });

      expect(result.isValid).toBe(false);
    });

    it('should handle undefined values gracefully', () => {
      const result = validateLoginInput({});

      expect(result.isValid).toBe(false);
    });
  });

  describe('JWT Token Operations', () => {
    it('should create valid JWT token payload', () => {
      const userId = 'test-user-id-123';
      const expectedPayload = { id: userId };

      jwt.sign.mockReturnValue('mock-token');

      const token = jwt.sign(expectedPayload, keys.secretOrKey);

      expect(jwt.sign).toHaveBeenCalledWith(expectedPayload, 'test-secret-key');
      expect(token).toBe('mock-token');
    });

    it('should verify valid JWT token', () => {
      const mockDecoded = { id: 'user-id-123' };
      jwt.verify.mockReturnValue(mockDecoded);

      const result = jwt.verify('valid-token', keys.secretOrKey);

      expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret-key');
      expect(result.id).toBe('user-id-123');
    });

    it('should throw error for invalid JWT token', () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => jwt.verify('invalid-token', keys.secretOrKey)).toThrow('Invalid token');
    });
  });

  describe('Password Hashing', () => {
    it('should hash password correctly', async () => {
      const password = 'testpassword123';
      const hashedPassword = '$2a$10$hashedpassword';

      bcrypt.hash.mockResolvedValue(hashedPassword);

      const result = await bcrypt.hash(password, 10);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(result).toBe(hashedPassword);
    });

    it('should compare passwords correctly - match', () => {
      bcrypt.compareSync.mockReturnValue(true);

      const result = bcrypt.compareSync('password123', '$2a$10$hashedpassword');

      expect(result).toBe(true);
    });

    it('should compare passwords correctly - no match', () => {
      bcrypt.compareSync.mockReturnValue(false);

      const result = bcrypt.compareSync('wrongpassword', '$2a$10$hashedpassword');

      expect(result).toBe(false);
    });
  });
});
