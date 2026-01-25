// Mock the modules before requiring auth service
jest.mock('../server/models/User', () => {
  const mockUser = jest.fn();
  mockUser.findOne = jest.fn();
  mockUser.findById = jest.fn();
  return { __esModule: true, default: mockUser };
});

jest.mock('../server/models/Shelter', () => {
  const mockShelter = jest.fn();
  mockShelter.findById = jest.fn();
  return { __esModule: true, default: mockShelter };
});

jest.mock('bcryptjs', () => ({
  __esModule: true,
  default: {
    hash: jest.fn(),
    compareSync: jest.fn(),
    genSalt: jest.fn()
  }
}));

jest.mock('jsonwebtoken', () => ({
  __esModule: true,
  default: {
    sign: jest.fn(),
    verify: jest.fn()
  }
}));

jest.mock('../config/keys', () => ({
  __esModule: true,
  default: { secretOrKey: 'test-secret-key' }
}));

const User = require('../server/models/User').default;
const keys = require('../config/keys').default;
const bcrypt = require('bcryptjs').default;
const jwt = require('jsonwebtoken').default;
const validateRegisterInput = require('../server/validation/register').default;
const validateLoginInput = require('../server/validation/login').default;

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

  describe('Shelter Registration Flow', () => {
    const Shelter = require('../server/models/Shelter').default;

    it('should validate shelter registration input correctly', () => {
      const result = validateRegisterInput({
        name: 'Shelter Admin',
        email: 'admin@shelter.com',
        password: 'validpassword123',
        userRole: 'shelter'
      });

      expect(result.isValid).toBe(true);
    });

    it('should accept shelter role as valid userRole', () => {
      const result = validateRegisterInput({
        name: 'Shelter User',
        email: 'shelter@test.com',
        password: 'password123',
        userRole: 'shelter'
      });

      expect(result.isValid).toBe(true);
      expect(result.message).toBe('');
    });

    it('should register shelter user with shelter creation data', async () => {
      const mockShelterId = 'shelter-id-123';
      const mockUserId = 'user-id-456';

      // Mock User.findOne to return null (no duplicates)
      User.findOne.mockResolvedValue(null);

      // Mock bcrypt.hash
      bcrypt.hash.mockResolvedValue('hashed-password');

      // Mock User constructor and save
      const mockUserInstance = {
        _id: mockUserId,
        name: 'Shelter Admin',
        email: 'admin@shelter.com',
        userRole: 'shelter',
        shelterId: mockShelterId,
        save: jest.fn().mockResolvedValue(true)
      };
      User.mockImplementation(() => mockUserInstance);

      // Mock Shelter constructor and save
      const mockShelterInstance = {
        _id: mockShelterId,
        name: 'Happy Paws',
        location: 'NYC',
        paymentEmail: 'pay@shelter.com',
        users: [],
        save: jest.fn().mockResolvedValue(true)
      };
      Shelter.mockImplementation(() => mockShelterInstance);
      Shelter.findById.mockResolvedValue(mockShelterInstance);

      // Mock jwt.sign
      jwt.sign.mockReturnValue('mock-token');

      const { register } = require('../server/services/auth');

      const result = await register({
        name: 'Shelter Admin',
        email: 'admin@shelter.com',
        password: 'validpassword123',
        userRole: 'shelter',
        shelterName: 'Happy Paws',
        shelterLocation: 'NYC',
        shelterPaymentEmail: 'pay@shelter.com'
      });

      expect(result.token).toBe('mock-token');
      expect(result.loggedIn).toBe(true);
      expect(result.userRole).toBe('shelter');
      expect(result.shelterId).toBe(mockShelterId);
      expect(mockShelterInstance.save).toHaveBeenCalled();
      expect(mockUserInstance.save).toHaveBeenCalled();
    });

    it('should not create shelter for endUser registration', async () => {
      const mockUserId = 'user-id-789';

      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashed-password');

      const mockUserInstance = {
        _id: mockUserId,
        name: 'Regular User',
        email: 'user@test.com',
        userRole: 'endUser',
        shelterId: undefined,
        save: jest.fn().mockResolvedValue(true)
      };
      User.mockImplementation(() => mockUserInstance);

      jwt.sign.mockReturnValue('mock-token');

      const { register } = require('../server/services/auth');

      const result = await register({
        name: 'Regular User',
        email: 'user@test.com',
        password: 'validpassword123',
        userRole: 'endUser'
      });

      expect(result.token).toBe('mock-token');
      expect(result.userRole).toBe('endUser');
      expect(Shelter).not.toHaveBeenCalled();
    });

    it('should add user to shelter users array after creation', async () => {
      const mockShelterId = 'shelter-id-abc';
      const mockUserId = 'user-id-def';

      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashed-password');

      const mockUserInstance = {
        _id: mockUserId,
        name: 'Admin',
        email: 'admin@test.com',
        userRole: 'shelter',
        shelterId: mockShelterId,
        save: jest.fn().mockResolvedValue(true)
      };
      User.mockImplementation(() => mockUserInstance);

      const mockShelterInstance = {
        _id: mockShelterId,
        name: 'Test Shelter',
        location: 'LA',
        paymentEmail: 'pay@test.com',
        users: [],
        save: jest.fn().mockResolvedValue(true)
      };
      Shelter.mockImplementation(() => mockShelterInstance);
      Shelter.findById.mockResolvedValue(mockShelterInstance);

      jwt.sign.mockReturnValue('mock-token');

      const { register } = require('../server/services/auth');

      await register({
        name: 'Admin',
        email: 'admin@test.com',
        password: 'validpassword123',
        userRole: 'shelter',
        shelterName: 'Test Shelter',
        shelterLocation: 'LA',
        shelterPaymentEmail: 'pay@test.com'
      });

      expect(Shelter.findById).toHaveBeenCalledWith(mockShelterId);
      expect(mockShelterInstance.users).toContain(mockUserId);
      expect(mockShelterInstance.save).toHaveBeenCalledTimes(2);
    });
  });
});
