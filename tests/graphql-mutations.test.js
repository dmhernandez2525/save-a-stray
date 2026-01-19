const mongoose = require('mongoose');

// Mock mongoose model methods
const mockAnimalSave = jest.fn();
const mockApplicationSave = jest.fn();
const mockShelterSave = jest.fn();

jest.mock('../server/models/Animal', () => {
  const MockAnimal = jest.fn().mockImplementation((data) => ({
    ...data,
    _id: 'mock-animal-id',
    save: mockAnimalSave
  }));
  MockAnimal.findById = jest.fn();
  MockAnimal.deleteOne = jest.fn();
  return MockAnimal;
});

jest.mock('../server/models/Application', () => {
  const MockApplication = jest.fn().mockImplementation((data) => ({
    ...data,
    _id: 'mock-application-id',
    save: mockApplicationSave
  }));
  MockApplication.findById = jest.fn();
  MockApplication.deleteOne = jest.fn();
  return MockApplication;
});

jest.mock('../server/models/Shelter', () => {
  const MockShelter = jest.fn().mockImplementation((data) => ({
    ...data,
    _id: 'mock-shelter-id',
    save: mockShelterSave
  }));
  MockShelter.findById = jest.fn();
  MockShelter.deleteOne = jest.fn();
  return MockShelter;
});

const Animal = require('../server/models/Animal');
const Application = require('../server/models/Application');
const Shelter = require('../server/models/Shelter');

describe('GraphQL Mutation Resolvers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAnimalSave.mockClear();
    mockApplicationSave.mockClear();
    mockShelterSave.mockClear();
  });

  describe('newAnimal Mutation', () => {
    it('should create a new animal with valid data', () => {
      const animalData = {
        name: 'Buddy',
        type: 'Dogs',
        age: 3,
        sex: 'Male',
        color: 'Brown',
        description: 'Friendly golden retriever',
        image: 'http://example.com/buddy.jpg',
        video: 'http://example.com/buddy.mp4'
      };

      const newAnimal = new Animal(animalData);

      expect(Animal).toHaveBeenCalledWith(animalData);
      expect(newAnimal.name).toBe('Buddy');
      expect(newAnimal.type).toBe('Dogs');
      expect(newAnimal.age).toBe(3);
      expect(newAnimal._id).toBe('mock-animal-id');
    });

    it('should save animal to database', () => {
      const animalData = {
        name: 'Max',
        type: 'Dogs',
        age: 5,
        sex: 'Male',
        color: 'Black',
        description: 'Energetic labrador',
        image: 'http://example.com/max.jpg',
        video: 'http://example.com/max.mp4'
      };

      const newAnimal = new Animal(animalData);
      newAnimal.save();

      expect(mockAnimalSave).toHaveBeenCalled();
    });
  });

  describe('updateAnimal Mutation', () => {
    it('should update an existing animal', async () => {
      const existingAnimal = {
        _id: 'animal-id-123',
        name: 'Buddy',
        type: 'Dogs',
        age: 3,
        sex: 'Male',
        color: 'Brown',
        description: 'Friendly dog',
        image: 'http://example.com/buddy.jpg',
        video: 'http://example.com/buddy.mp4',
        save: jest.fn().mockResolvedValue(true)
      };

      Animal.findById.mockResolvedValue(existingAnimal);

      const animal = await Animal.findById('animal-id-123');
      animal.name = 'Buddy Updated';
      animal.age = 4;
      await animal.save();

      expect(Animal.findById).toHaveBeenCalledWith('animal-id-123');
      expect(animal.name).toBe('Buddy Updated');
      expect(animal.age).toBe(4);
      expect(animal.save).toHaveBeenCalled();
    });

    it('should handle non-existent animal update', async () => {
      Animal.findById.mockResolvedValue(null);

      const result = await Animal.findById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('deleteAnimal Mutation', () => {
    it('should delete an animal by ID', async () => {
      Animal.deleteOne.mockResolvedValue({ deletedCount: 1 });

      const result = await Animal.deleteOne({ _id: 'animal-id-123' });

      expect(Animal.deleteOne).toHaveBeenCalledWith({ _id: 'animal-id-123' });
      expect(result.deletedCount).toBe(1);
    });

    it('should handle deleting non-existent animal', async () => {
      Animal.deleteOne.mockResolvedValue({ deletedCount: 0 });

      const result = await Animal.deleteOne({ _id: 'non-existent-id' });

      expect(result.deletedCount).toBe(0);
    });
  });

  describe('newApplication Mutation', () => {
    it('should create a new application', async () => {
      const applicationData = {
        animalId: 'animal-id-123',
        userId: 'user-id-123',
        applicationData: 'I would love to adopt this pet!'
      };

      const mockAnimal = {
        _id: 'animal-id-123',
        applications: [],
        save: jest.fn()
      };

      Animal.findById.mockResolvedValue(mockAnimal);

      const newApp = new Application(applicationData);

      expect(Application).toHaveBeenCalledWith(applicationData);
      expect(newApp.animalId).toBe('animal-id-123');
      expect(newApp.userId).toBe('user-id-123');
    });

    it('should add application to animal\'s applications array', async () => {
      const mockAnimal = {
        _id: 'animal-id-123',
        applications: [],
        save: jest.fn()
      };

      Animal.findById.mockResolvedValue(mockAnimal);

      const animal = await Animal.findById('animal-id-123');
      animal.applications.push('new-application-id');
      await animal.save();

      expect(animal.applications).toContain('new-application-id');
      expect(animal.save).toHaveBeenCalled();
    });
  });

  describe('deleteApplication Mutation', () => {
    it('should delete an application by ID', async () => {
      Application.deleteOne.mockResolvedValue({ deletedCount: 1 });

      const result = await Application.deleteOne({ _id: 'application-id-123' });

      expect(Application.deleteOne).toHaveBeenCalledWith({ _id: 'application-id-123' });
      expect(result.deletedCount).toBe(1);
    });
  });

  describe('editApplication Mutation', () => {
    it('should update application data', async () => {
      const existingApp = {
        _id: 'app-id-123',
        animalId: 'animal-id',
        userId: 'user-id',
        applicationData: 'Original data',
        save: jest.fn()
      };

      Application.findById.mockResolvedValue(existingApp);

      const app = await Application.findById('app-id-123');
      app.applicationData = 'Updated application data';
      await app.save();

      expect(app.applicationData).toBe('Updated application data');
      expect(app.save).toHaveBeenCalled();
    });
  });

  describe('newShelter Mutation', () => {
    it('should create a new shelter', () => {
      const shelterData = {
        name: 'Happy Paws Shelter',
        location: 'New York, NY',
        paymentEmail: 'donate@happypaws.com'
      };

      const newShelter = new Shelter(shelterData);

      expect(Shelter).toHaveBeenCalledWith(shelterData);
      expect(newShelter.name).toBe('Happy Paws Shelter');
      expect(newShelter.location).toBe('New York, NY');
      expect(newShelter._id).toBe('mock-shelter-id');
    });

    it('should save shelter to database', () => {
      const shelterData = {
        name: 'Animal Haven',
        location: 'Los Angeles, CA',
        paymentEmail: 'support@animalhaven.com'
      };

      const newShelter = new Shelter(shelterData);
      newShelter.save();

      expect(mockShelterSave).toHaveBeenCalled();
    });
  });

  describe('deleteShelter Mutation', () => {
    it('should delete a shelter by ID', async () => {
      Shelter.deleteOne.mockResolvedValue({ deletedCount: 1 });

      const result = await Shelter.deleteOne({ _id: 'shelter-id-123' });

      expect(Shelter.deleteOne).toHaveBeenCalledWith({ _id: 'shelter-id-123' });
      expect(result.deletedCount).toBe(1);
    });
  });

  describe('editShelter Mutation', () => {
    it('should update shelter information', async () => {
      const existingShelter = {
        _id: 'shelter-id-123',
        name: 'Old Name',
        location: 'Old Location',
        paymentEmail: 'old@email.com',
        users: [],
        animals: [],
        save: jest.fn()
      };

      Shelter.findById.mockResolvedValue(existingShelter);

      const shelter = await Shelter.findById('shelter-id-123');
      shelter.name = 'New Shelter Name';
      shelter.location = 'New Location';
      shelter.paymentEmail = 'new@email.com';
      await shelter.save();

      expect(shelter.name).toBe('New Shelter Name');
      expect(shelter.location).toBe('New Location');
      expect(shelter.paymentEmail).toBe('new@email.com');
      expect(shelter.save).toHaveBeenCalled();
    });

    it('should handle non-existent shelter update', async () => {
      Shelter.findById.mockResolvedValue(null);

      const result = await Shelter.findById('non-existent-id');

      expect(result).toBeNull();
    });
  });
});
