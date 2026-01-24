const mongoose = require('mongoose');

// Import models (TypeScript default exports)
const Animal = require('../server/models/Animal').default;
const User = require('../server/models/User').default;
const Shelter = require('../server/models/Shelter').default;

describe('Mongoose Models Schema Tests', () => {
  describe('Animal Model', () => {
    it('should have required fields defined in schema', () => {
      const animalSchema = Animal.schema.obj;

      expect(animalSchema.name).toBeDefined();
      expect(animalSchema.name.required).toBe(true);
      expect(animalSchema.name.type).toBe(String);

      expect(animalSchema.type).toBeDefined();
      expect(animalSchema.type.required).toBe(true);

      expect(animalSchema.age).toBeDefined();
      expect(animalSchema.age.type).toBe(Number);

      expect(animalSchema.sex).toBeDefined();
      expect(animalSchema.color).toBeDefined();
      expect(animalSchema.description).toBeDefined();
      expect(animalSchema.image).toBeDefined();
    });

    it('should have breed field with default empty string', () => {
      const animalSchema = Animal.schema.obj;
      expect(animalSchema.breed).toBeDefined();
      expect(animalSchema.breed.type).toBe(String);
      expect(animalSchema.breed.default).toBe('');
    });

    it('should have status field with enum and default', () => {
      const animalSchema = Animal.schema.obj;
      expect(animalSchema.status).toBeDefined();
      expect(animalSchema.status.enum).toEqual(['available', 'pending', 'adopted']);
      expect(animalSchema.status.default).toBe('available');
    });

    it('should have applications reference field', () => {
      const animalSchema = Animal.schema.obj;
      expect(animalSchema.applications).toBeDefined();
      expect(Array.isArray(animalSchema.applications)).toBe(true);
    });
  });

  describe('User Model', () => {
    it('should have required fields defined in schema', () => {
      const userSchema = User.schema.obj;

      expect(userSchema.name).toBeDefined();
      expect(userSchema.name.required).toBe(true);

      expect(userSchema.email).toBeDefined();
      expect(userSchema.email.required).toBe(true);

      expect(userSchema.userRole).toBeDefined();
      expect(userSchema.userRole.required).toBe(true);

      expect(userSchema.password).toBeDefined();
      expect(userSchema.password.required).toBe(true);
    });

    it('should have optional fields defined', () => {
      const userSchema = User.schema.obj;

      expect(userSchema.date).toBeDefined();
      expect(userSchema.fbookId).toBeDefined();
      expect(userSchema.shelterId).toBeDefined();
      expect(userSchema.paymentEmail).toBeDefined();
    });

    it('should have favorites array reference field', () => {
      const userSchema = User.schema.obj;
      expect(userSchema.favorites).toBeDefined();
      expect(Array.isArray(userSchema.favorites)).toBe(true);
    });
  });

  describe('Application Model', () => {
    const Application = require('../server/models/Application').default;

    it('should have required fields defined in schema', () => {
      const appSchema = Application.schema.obj;

      expect(appSchema.animalId).toBeDefined();
      expect(appSchema.animalId.required).toBe(true);

      expect(appSchema.userId).toBeDefined();
      expect(appSchema.userId.required).toBe(true);

      expect(appSchema.applicationData).toBeDefined();
      expect(appSchema.applicationData.required).toBe(true);
    });

    it('should have status field with enum and default', () => {
      const appSchema = Application.schema.obj;
      expect(appSchema.status).toBeDefined();
      expect(appSchema.status.enum).toEqual(['submitted', 'under_review', 'approved', 'rejected']);
      expect(appSchema.status.default).toBe('submitted');
    });

    it('should have submittedAt field with Date type and default', () => {
      const appSchema = Application.schema.obj;
      expect(appSchema.submittedAt).toBeDefined();
      expect(appSchema.submittedAt.type).toBe(Date);
      expect(appSchema.submittedAt.default).toBe(Date.now);
    });
  });

  describe('AdoptionFee Model', () => {
    const AdoptionFee = require('../server/models/AdoptionFee').default;

    it('should be a valid mongoose model', () => {
      expect(AdoptionFee).toBeDefined();
      expect(AdoptionFee.modelName).toBe('adoptionFee');
    });

    it('should have required fields defined in schema', () => {
      const schema = AdoptionFee.schema.obj;

      expect(schema.animalId).toBeDefined();
      expect(schema.animalId.required).toBe(true);
      expect(schema.animalId.type).toBe(String);

      expect(schema.shelterId).toBeDefined();
      expect(schema.shelterId.required).toBe(true);

      expect(schema.amount).toBeDefined();
      expect(schema.amount.required).toBe(true);
      expect(schema.amount.type).toBe(Number);
    });

    it('should have currency with default USD', () => {
      const schema = AdoptionFee.schema.obj;
      expect(schema.currency).toBeDefined();
      expect(schema.currency.default).toBe('USD');
    });

    it('should have waived boolean field with default false', () => {
      const schema = AdoptionFee.schema.obj;
      expect(schema.waived).toBeDefined();
      expect(schema.waived.type).toBe(Boolean);
      expect(schema.waived.default).toBe(false);
    });

    it('should have status field with enum and default', () => {
      const schema = AdoptionFee.schema.obj;
      expect(schema.status).toBeDefined();
      expect(schema.status.enum).toEqual(['pending', 'paid', 'waived', 'refunded']);
      expect(schema.status.default).toBe('pending');
    });

    it('should have optional fields with defaults', () => {
      const schema = AdoptionFee.schema.obj;
      expect(schema.description).toBeDefined();
      expect(schema.description.default).toBe('');
      expect(schema.waivedReason).toBeDefined();
      expect(schema.waivedReason.default).toBe('');
      expect(schema.paidBy).toBeDefined();
      expect(schema.paidBy.default).toBe('');
    });

    it('should have date fields', () => {
      const schema = AdoptionFee.schema.obj;
      expect(schema.paidAt).toBeDefined();
      expect(schema.paidAt.type).toBe(Date);
      expect(schema.paidAt.default).toBe(null);
      expect(schema.createdAt).toBeDefined();
      expect(schema.createdAt.type).toBe(Date);
    });
  });

  describe('Shelter Model', () => {
    it('should be a valid mongoose model', () => {
      expect(Shelter).toBeDefined();
      expect(Shelter.modelName).toBe('shelter');
    });

    it('should have required fields defined in schema', () => {
      const shelterSchema = Shelter.schema.obj;

      expect(shelterSchema.name).toBeDefined();
      expect(shelterSchema.name.required).toBe(true);

      expect(shelterSchema.location).toBeDefined();
      expect(shelterSchema.location.required).toBe(true);

      expect(shelterSchema.paymentEmail).toBeDefined();
      expect(shelterSchema.paymentEmail.required).toBe(true);
    });

    it('should have reference fields for users and animals', () => {
      const shelterSchema = Shelter.schema.obj;

      expect(shelterSchema.users).toBeDefined();
      expect(Array.isArray(shelterSchema.users)).toBe(true);

      expect(shelterSchema.animals).toBeDefined();
      expect(Array.isArray(shelterSchema.animals)).toBe(true);
    });
  });
});
