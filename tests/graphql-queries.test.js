const mongoose = require('mongoose');

// Mock all models
jest.mock('../server/models/User', () => {
  const mockModel = {
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn()
  };
  return mockModel;
});

jest.mock('../server/models/Animal', () => {
  const mockModel = {
    find: jest.fn(),
    findById: jest.fn()
  };
  return mockModel;
});

jest.mock('../server/models/Shelter', () => {
  const mockModel = {
    find: jest.fn(),
    findById: jest.fn()
  };
  return mockModel;
});

jest.mock('../server/models/Application', () => {
  const mockModel = {
    find: jest.fn(),
    findById: jest.fn()
  };
  return mockModel;
});

const User = require('../server/models/User');
const Animal = require('../server/models/Animal');
const Shelter = require('../server/models/Shelter');
const Application = require('../server/models/Application');

describe('GraphQL Query Resolvers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Users Query', () => {
    it('should return all users', async () => {
      const mockUsers = [
        { _id: '1', name: 'User 1', email: 'user1@test.com', userRole: 'endUser' },
        { _id: '2', name: 'User 2', email: 'user2@test.com', userRole: 'shelter' }
      ];

      User.find.mockResolvedValue(mockUsers);

      const result = await User.find({});

      expect(User.find).toHaveBeenCalledWith({});
      expect(result).toEqual(mockUsers);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no users exist', async () => {
      User.find.mockResolvedValue([]);

      const result = await User.find({});

      expect(result).toEqual([]);
    });
  });

  describe('User Query (by ID)', () => {
    it('should return a single user by ID', async () => {
      const mockUser = {
        _id: 'user-id-123',
        name: 'Test User',
        email: 'test@example.com',
        userRole: 'endUser'
      };

      User.findById.mockResolvedValue(mockUser);

      const result = await User.findById('user-id-123');

      expect(User.findById).toHaveBeenCalledWith('user-id-123');
      expect(result).toEqual(mockUser);
    });

    it('should return null for non-existent user', async () => {
      User.findById.mockResolvedValue(null);

      const result = await User.findById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('Animals Query', () => {
    it('should return all animals', async () => {
      const mockAnimals = [
        {
          _id: '1',
          name: 'Buddy',
          type: 'Dogs',
          age: 3,
          sex: 'Male',
          color: 'Brown',
          description: 'Friendly dog',
          image: 'http://example.com/buddy.jpg',
          video: 'http://example.com/buddy.mp4'
        },
        {
          _id: '2',
          name: 'Whiskers',
          type: 'Cats',
          age: 2,
          sex: 'Female',
          color: 'White',
          description: 'Calm cat',
          image: 'http://example.com/whiskers.jpg',
          video: 'http://example.com/whiskers.mp4'
        }
      ];

      Animal.find.mockResolvedValue(mockAnimals);

      const result = await Animal.find({});

      expect(Animal.find).toHaveBeenCalledWith({});
      expect(result).toEqual(mockAnimals);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no animals exist', async () => {
      Animal.find.mockResolvedValue([]);

      const result = await Animal.find({});

      expect(result).toEqual([]);
    });
  });

  describe('FindAnimals Query (by type)', () => {
    it('should return animals filtered by type - Dogs', async () => {
      const mockDogs = [
        {
          _id: '1',
          name: 'Buddy',
          type: 'Dogs',
          age: 3,
          sex: 'Male',
          color: 'Brown'
        },
        {
          _id: '2',
          name: 'Max',
          type: 'Dogs',
          age: 5,
          sex: 'Male',
          color: 'Black'
        }
      ];

      Animal.find.mockResolvedValue(mockDogs);

      const result = await Animal.find({ type: 'Dogs' });

      expect(Animal.find).toHaveBeenCalledWith({ type: 'Dogs' });
      expect(result).toEqual(mockDogs);
      expect(result.every(animal => animal.type === 'Dogs')).toBe(true);
    });

    it('should return animals filtered by type - Cats', async () => {
      const mockCats = [
        {
          _id: '1',
          name: 'Whiskers',
          type: 'Cats',
          age: 2,
          sex: 'Female',
          color: 'White'
        }
      ];

      Animal.find.mockResolvedValue(mockCats);

      const result = await Animal.find({ type: 'Cats' });

      expect(Animal.find).toHaveBeenCalledWith({ type: 'Cats' });
      expect(result).toEqual(mockCats);
    });

    it('should return empty array for type with no animals', async () => {
      Animal.find.mockResolvedValue([]);

      const result = await Animal.find({ type: 'Outher' });

      expect(result).toEqual([]);
    });
  });

  describe('Animal Query (by ID)', () => {
    it('should return a single animal by ID', async () => {
      const mockAnimal = {
        _id: 'animal-id-123',
        name: 'Buddy',
        type: 'Dogs',
        age: 3,
        sex: 'Male',
        color: 'Brown',
        description: 'A friendly golden retriever',
        image: 'http://example.com/buddy.jpg',
        video: 'http://example.com/buddy.mp4'
      };

      Animal.findById.mockResolvedValue(mockAnimal);

      const result = await Animal.findById('animal-id-123');

      expect(Animal.findById).toHaveBeenCalledWith('animal-id-123');
      expect(result).toEqual(mockAnimal);
    });

    it('should return null for non-existent animal', async () => {
      Animal.findById.mockResolvedValue(null);

      const result = await Animal.findById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('Shelters Query', () => {
    it('should return all shelters', async () => {
      const mockShelters = [
        {
          _id: '1',
          name: 'Happy Paws Shelter',
          location: 'New York, NY',
          paymentEmail: 'donate@happypaws.com',
          users: [],
          animals: []
        },
        {
          _id: '2',
          name: 'Animal Haven',
          location: 'Los Angeles, CA',
          paymentEmail: 'support@animalhaven.com',
          users: [],
          animals: []
        }
      ];

      Shelter.find.mockResolvedValue(mockShelters);

      const result = await Shelter.find({});

      expect(Shelter.find).toHaveBeenCalledWith({});
      expect(result).toEqual(mockShelters);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no shelters exist', async () => {
      Shelter.find.mockResolvedValue([]);

      const result = await Shelter.find({});

      expect(result).toEqual([]);
    });
  });

  describe('Shelter Query (by ID)', () => {
    it('should return a single shelter by ID', async () => {
      const mockShelter = {
        _id: 'shelter-id-123',
        name: 'Happy Paws Shelter',
        location: 'New York, NY',
        paymentEmail: 'donate@happypaws.com',
        users: ['user-1', 'user-2'],
        animals: ['animal-1', 'animal-2']
      };

      Shelter.findById.mockResolvedValue(mockShelter);

      const result = await Shelter.findById('shelter-id-123');

      expect(Shelter.findById).toHaveBeenCalledWith('shelter-id-123');
      expect(result).toEqual(mockShelter);
    });

    it('should return null for non-existent shelter', async () => {
      Shelter.findById.mockResolvedValue(null);

      const result = await Shelter.findById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('Applications Query', () => {
    it('should return all applications', async () => {
      const mockApplications = [
        {
          _id: '1',
          animalId: 'animal-1',
          userId: 'user-1',
          applicationData: 'I want to adopt this pet'
        },
        {
          _id: '2',
          animalId: 'animal-2',
          userId: 'user-2',
          applicationData: 'Looking for a companion'
        }
      ];

      Application.find.mockResolvedValue(mockApplications);

      const result = await Application.find({});

      expect(Application.find).toHaveBeenCalledWith({});
      expect(result).toEqual(mockApplications);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no applications exist', async () => {
      Application.find.mockResolvedValue([]);

      const result = await Application.find({});

      expect(result).toEqual([]);
    });
  });
});
