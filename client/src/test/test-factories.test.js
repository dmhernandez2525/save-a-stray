import { describe, it, expect } from 'vitest';
import {
  createAnimal, createAnimalList, createUser, createAdmin, createShelterStaff,
  createShelter, createApplication, createDraftApplication, createEvent,
  createDonation, createSuccessStory, createMessage, createNotification,
  createGraphQLContext, createAdminContext, createShelterContext,
  createPaginatedResponse, createErrorResponse, createBatchAnimals,
} from './test-factories';

describe('Test Factories', () => {
  describe('createAnimal', () => {
    it('should create animal with defaults', () => {
      const animal = createAnimal();
      expect(animal._id).toBeDefined();
      expect(animal.name).toBe('Buddy');
      expect(animal.type).toBe('dog');
      expect(animal.status).toBe('available');
    });

    it('should allow overrides', () => {
      const animal = createAnimal({ name: 'Luna', type: 'cat' });
      expect(animal.name).toBe('Luna');
      expect(animal.type).toBe('cat');
    });

    it('should generate unique IDs', () => {
      const a1 = createAnimal();
      const a2 = createAnimal();
      expect(a1._id).not.toBe(a2._id);
    });
  });

  describe('createAnimalList', () => {
    it('should create specified count', () => {
      expect(createAnimalList(3)).toHaveLength(3);
      expect(createAnimalList(10)).toHaveLength(10);
    });

    it('should vary types', () => {
      const animals = createAnimalList(4);
      const types = new Set(animals.map(a => a.type));
      expect(types.size).toBeGreaterThan(1);
    });
  });

  describe('createUser', () => {
    it('should create user with defaults', () => {
      const user = createUser();
      expect(user.role).toBe('user');
      expect(user.email).toBe('test@example.com');
    });
  });

  describe('createAdmin', () => {
    it('should create admin user', () => {
      const admin = createAdmin();
      expect(admin.role).toBe('admin');
    });
  });

  describe('createShelterStaff', () => {
    it('should create shelter staff user', () => {
      const staff = createShelterStaff();
      expect(staff.role).toBe('shelter_staff');
    });
  });

  describe('createShelter', () => {
    it('should create shelter with defaults', () => {
      const shelter = createShelter();
      expect(shelter.name).toBe('Happy Paws Shelter');
      expect(shelter.maxCapacity).toBe(100);
      expect(shelter.coordinates.type).toBe('Point');
    });

    it('should allow custom animals', () => {
      const shelter = createShelter({ animals: ['a1', 'a2'] });
      expect(shelter.animals).toHaveLength(2);
    });
  });

  describe('createApplication', () => {
    it('should create submitted application', () => {
      const app = createApplication();
      expect(app.status).toBe('submitted');
      expect(app.isDraft).toBe(false);
    });
  });

  describe('createDraftApplication', () => {
    it('should create draft application', () => {
      const app = createDraftApplication();
      expect(app.status).toBe('draft');
      expect(app.isDraft).toBe(true);
      expect(app.submittedAt).toBeNull();
    });
  });

  describe('createEvent', () => {
    it('should create future event', () => {
      const event = createEvent();
      expect(new Date(event.date).getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('createDonation', () => {
    it('should create completed donation', () => {
      const donation = createDonation();
      expect(donation.status).toBe('completed');
      expect(donation.amount).toBe(5000);
    });
  });

  describe('createSuccessStory', () => {
    it('should create approved story', () => {
      const story = createSuccessStory();
      expect(story.approved).toBe(true);
      expect(story.title).toContain('Buddy');
    });
  });

  describe('createMessage', () => {
    it('should create unread message', () => {
      const msg = createMessage();
      expect(msg.read).toBe(false);
      expect(msg.content.length).toBeGreaterThan(0);
    });
  });

  describe('createNotification', () => {
    it('should create unread notification', () => {
      const notif = createNotification();
      expect(notif.read).toBe(false);
      expect(notif.type).toBe('application_update');
    });
  });

  describe('GraphQL Context Factories', () => {
    it('should create default context', () => {
      const ctx = createGraphQLContext();
      expect(ctx.userId).toBe('user1');
      expect(ctx.userRole).toBe('user');
    });

    it('should create admin context', () => {
      const ctx = createAdminContext();
      expect(ctx.userRole).toBe('admin');
    });

    it('should create shelter context', () => {
      const ctx = createShelterContext();
      expect(ctx.userRole).toBe('shelter_staff');
      expect(ctx.shelterId).toBe('shelter1');
    });
  });

  describe('API Response Factories', () => {
    it('should create paginated response', () => {
      const res = createPaginatedResponse([{ name: 'Buddy' }]);
      expect(res.data).toHaveLength(1);
      expect(res.pagination.total).toBe(1);
      expect(res.pagination.hasMore).toBe(false);
    });

    it('should create error response', () => {
      const res = createErrorResponse('Not found', 404);
      expect(res.error).toBe('Not found');
      expect(res.status).toBe(404);
    });
  });

  describe('createBatchAnimals', () => {
    it('should create specified count', () => {
      expect(createBatchAnimals(20)).toHaveLength(20);
    });

    it('should support dogs only', () => {
      const animals = createBatchAnimals(5, 'dogs');
      expect(animals.every(a => a.type === 'dog')).toBe(true);
    });

    it('should support cats only', () => {
      const animals = createBatchAnimals(5, 'cats');
      expect(animals.every(a => a.type === 'cat')).toBe(true);
    });

    it('should include mixed types by default', () => {
      const animals = createBatchAnimals(10);
      const types = new Set(animals.map(a => a.type));
      expect(types.size).toBeGreaterThan(1);
    });

    it('should include both available and adopted', () => {
      const animals = createBatchAnimals(10);
      const statuses = new Set(animals.map(a => a.status));
      expect(statuses.has('available')).toBe(true);
    });
  });
});
