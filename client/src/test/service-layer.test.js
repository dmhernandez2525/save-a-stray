import { describe, it, expect } from 'vitest';

// Test service layer business logic contracts

describe('Service Layer', () => {
  describe('Status Transitions', () => {
    const VALID_TRANSITIONS = {
      available: ['pending', 'foster', 'medical_hold', 'not_available'],
      pending: ['available', 'adopted', 'not_available'],
      adopted: ['available'],
      foster: ['available', 'adopted', 'medical_hold'],
      medical_hold: ['available', 'foster', 'not_available'],
      not_available: ['available'],
    };

    function isValidTransition(from, to) {
      return (VALID_TRANSITIONS[from] || []).includes(to);
    }

    it('should allow available to pending', () => {
      expect(isValidTransition('available', 'pending')).toBe(true);
    });

    it('should allow pending to adopted', () => {
      expect(isValidTransition('pending', 'adopted')).toBe(true);
    });

    it('should not allow available to adopted directly', () => {
      expect(isValidTransition('available', 'adopted')).toBe(false);
    });

    it('should allow adopted back to available (return)', () => {
      expect(isValidTransition('adopted', 'available')).toBe(true);
    });

    it('should allow foster to adopted', () => {
      expect(isValidTransition('foster', 'adopted')).toBe(true);
    });

    it('should allow medical hold to available', () => {
      expect(isValidTransition('medical_hold', 'available')).toBe(true);
    });

    it('should not allow pending to foster', () => {
      expect(isValidTransition('pending', 'foster')).toBe(false);
    });
  });

  describe('Match Scoring', () => {
    function calculateMatchScore(profile, animal) {
      let score = 50; // base score

      // Type preference
      if (profile.preferredTypes && profile.preferredTypes.includes(animal.type)) score += 15;

      // Size compatibility
      if (profile.housingType === 'apartment' && animal.size === 'large') score -= 10;
      if (profile.housingType === 'house_yard' && animal.size !== 'small') score += 5;

      // Activity level match
      if (profile.activityLevel === animal.energyLevel) score += 10;
      const levels = ['low', 'moderate', 'high'];
      const diff = Math.abs(levels.indexOf(profile.activityLevel) - levels.indexOf(animal.energyLevel));
      if (diff === 1) score += 5;

      // Kids compatibility
      if (profile.hasChildren && animal.goodWithKids) score += 10;
      if (profile.hasChildren && !animal.goodWithKids) score -= 15;

      // Other pets compatibility
      if (profile.hasOtherDogs && animal.goodWithDogs) score += 5;
      if (profile.hasOtherDogs && !animal.goodWithDogs) score -= 10;
      if (profile.hasOtherCats && animal.goodWithCats) score += 5;
      if (profile.hasOtherCats && !animal.goodWithCats) score -= 10;

      // Experience
      if (profile.petExperience === 'experienced') score += 5;
      if (profile.petExperience === 'none' && animal.specialNeeds) score -= 10;

      return Math.max(0, Math.min(100, score));
    }

    it('should give higher score for type match', () => {
      const profile = { preferredTypes: ['dog'], housingType: 'house_yard', activityLevel: 'moderate' };
      const dog = { type: 'dog', size: 'medium', energyLevel: 'moderate', goodWithKids: true, goodWithDogs: true, goodWithCats: true };
      const cat = { ...dog, type: 'cat' };

      expect(calculateMatchScore(profile, dog)).toBeGreaterThan(calculateMatchScore(profile, cat));
    });

    it('should penalize large dogs in apartments', () => {
      const profile = { housingType: 'apartment', activityLevel: 'low' };
      const large = { type: 'dog', size: 'large', energyLevel: 'low', goodWithKids: true, goodWithDogs: true, goodWithCats: true };
      const small = { ...large, size: 'small' };

      expect(calculateMatchScore(profile, small)).toBeGreaterThan(calculateMatchScore(profile, large));
    });

    it('should reward activity level match', () => {
      const profile = { activityLevel: 'high', housingType: 'house_yard' };
      const match = { type: 'dog', size: 'medium', energyLevel: 'high', goodWithKids: true, goodWithDogs: true, goodWithCats: true };
      const mismatch = { ...match, energyLevel: 'low' };

      expect(calculateMatchScore(profile, match)).toBeGreaterThan(calculateMatchScore(profile, mismatch));
    });

    it('should penalize non-kid-friendly for families', () => {
      const profile = { hasChildren: true, activityLevel: 'moderate', housingType: 'house_yard' };
      const kidFriendly = { type: 'dog', size: 'medium', energyLevel: 'moderate', goodWithKids: true, goodWithDogs: true, goodWithCats: true };
      const notKidFriendly = { ...kidFriendly, goodWithKids: false };

      expect(calculateMatchScore(profile, kidFriendly)).toBeGreaterThan(calculateMatchScore(profile, notKidFriendly));
    });

    it('should return score between 0 and 100', () => {
      const profile = { activityLevel: 'moderate', housingType: 'apartment', hasChildren: true, hasOtherDogs: true, hasOtherCats: true, petExperience: 'none' };
      const animal = { type: 'dog', size: 'large', energyLevel: 'high', goodWithKids: false, goodWithDogs: false, goodWithCats: false, specialNeeds: true };
      const score = calculateMatchScore(profile, animal);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('Foster Matching', () => {
    function calculateFosterScore(foster, animal) {
      let score = 50;
      if (foster.acceptedTypes.includes(animal.type)) score += 20;
      if (foster.maxAnimals > foster.currentAnimals) score += 10;
      if (foster.hasExperience && animal.specialNeeds) score += 15;
      if (!foster.hasExperience && animal.specialNeeds) score -= 10;
      if (foster.hasYard && animal.size === 'large') score += 10;
      return Math.max(0, Math.min(100, score));
    }

    it('should prefer fosters with matching type preference', () => {
      const foster = { acceptedTypes: ['cat'], maxAnimals: 3, currentAnimals: 1, hasExperience: true, hasYard: false };
      const cat = { type: 'cat', size: 'small', specialNeeds: false };
      const dog = { type: 'dog', size: 'medium', specialNeeds: false };

      expect(calculateFosterScore(foster, cat)).toBeGreaterThan(calculateFosterScore(foster, dog));
    });

    it('should prefer fosters with capacity', () => {
      const full = { acceptedTypes: ['dog'], maxAnimals: 2, currentAnimals: 2, hasExperience: true, hasYard: true };
      const available = { ...full, currentAnimals: 0 };
      const animal = { type: 'dog', size: 'medium', specialNeeds: false };

      expect(calculateFosterScore(available, animal)).toBeGreaterThan(calculateFosterScore(full, animal));
    });

    it('should reward experience for special needs', () => {
      const experienced = { acceptedTypes: ['dog'], maxAnimals: 3, currentAnimals: 0, hasExperience: true, hasYard: true };
      const newFoster = { ...experienced, hasExperience: false };
      const specialNeeds = { type: 'dog', size: 'medium', specialNeeds: true };

      expect(calculateFosterScore(experienced, specialNeeds)).toBeGreaterThan(calculateFosterScore(newFoster, specialNeeds));
    });
  });

  describe('Retry Logic', () => {
    function calculateRetryDelay(attempt, baseMs = 1000, maxMs = 60000) {
      const delay = Math.min(baseMs * Math.pow(2, attempt - 1), maxMs);
      return delay;
    }

    it('should double delay each attempt', () => {
      expect(calculateRetryDelay(1)).toBe(1000);
      expect(calculateRetryDelay(2)).toBe(2000);
      expect(calculateRetryDelay(3)).toBe(4000);
    });

    it('should cap at max delay', () => {
      expect(calculateRetryDelay(20, 1000, 60000)).toBe(60000);
    });

    it('should respect custom base delay', () => {
      expect(calculateRetryDelay(1, 500)).toBe(500);
      expect(calculateRetryDelay(2, 500)).toBe(1000);
    });
  });

  describe('Rate Limiting', () => {
    const TIER_LIMITS = { free: 100, basic: 1000, premium: 10000 };

    function checkRateLimit(tier, currentCount) {
      const limit = TIER_LIMITS[tier] || 0;
      return {
        allowed: currentCount < limit,
        remaining: Math.max(0, limit - currentCount),
        limit,
      };
    }

    it('should allow requests under limit', () => {
      const result = checkRateLimit('basic', 500);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(500);
    });

    it('should reject requests at limit', () => {
      const result = checkRateLimit('free', 100);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should have increasing limits per tier', () => {
      expect(TIER_LIMITS.basic).toBeGreaterThan(TIER_LIMITS.free);
      expect(TIER_LIMITS.premium).toBeGreaterThan(TIER_LIMITS.basic);
    });
  });

  describe('Pagination', () => {
    function paginate(total, limit, offset) {
      return {
        total,
        limit: Math.min(limit, 100),
        offset: Math.max(offset, 0),
        hasMore: offset + limit < total,
        pages: Math.ceil(total / limit),
        currentPage: Math.floor(offset / limit) + 1,
      };
    }

    it('should calculate hasMore correctly', () => {
      expect(paginate(50, 20, 0).hasMore).toBe(true);
      expect(paginate(50, 20, 40).hasMore).toBe(false);
    });

    it('should calculate pages correctly', () => {
      expect(paginate(100, 20, 0).pages).toBe(5);
      expect(paginate(21, 20, 0).pages).toBe(2);
    });

    it('should cap limit at 100', () => {
      expect(paginate(1000, 200, 0).limit).toBe(100);
    });

    it('should calculate current page', () => {
      expect(paginate(100, 20, 0).currentPage).toBe(1);
      expect(paginate(100, 20, 20).currentPage).toBe(2);
      expect(paginate(100, 20, 40).currentPage).toBe(3);
    });
  });

  describe('Search Scoring', () => {
    function searchScore(query, animal) {
      const q = query.toLowerCase();
      let score = 0;
      if (animal.name.toLowerCase().includes(q)) score += 10;
      if (animal.breed && animal.breed.toLowerCase().includes(q)) score += 8;
      if (animal.type.toLowerCase().includes(q)) score += 5;
      if (animal.description && animal.description.toLowerCase().includes(q)) score += 3;
      return score;
    }

    it('should rank name matches highest', () => {
      const animal = { name: 'Golden', type: 'dog', breed: 'Labrador', description: 'A friendly golden dog' };
      const nameScore = searchScore('Golden', animal);
      const descScore = searchScore('friendly', animal);
      expect(nameScore).toBeGreaterThan(descScore);
    });

    it('should rank breed matches above type', () => {
      const animal = { name: 'Max', type: 'dog', breed: 'Labrador', description: '' };
      expect(searchScore('Labrador', animal)).toBeGreaterThan(searchScore('dog', animal));
    });
  });

  describe('Email Validation', () => {
    function isValidEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    it('should accept valid emails', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('name.last@domain.org')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });
});
