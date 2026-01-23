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
