import { describe, it, expect } from 'vitest';
import {
  LIFESTYLE_QUESTIONNAIRE,
  calculateMatchScore, rankMatches,
  getMatchLabel,
  validateQuestionnaireAnswers, getQuestionnaireProgress,
} from '../lib/ai-matching';

const mockPet = {
  id: 'pet1', name: 'Buddy', species: 'dog', breed: 'Labrador',
  size: 'large', energyLevel: 'high', goodWithKids: true,
  goodWithDogs: true, goodWithCats: false, houseTrained: true,
  specialNeeds: false, temperament: ['friendly', 'playful'],
};

const idealAnswers = {
  housing: 'house_yard',
  activity_level: 4,
  exercise: 'active',
  children: true,
  children_ages: ['child'],
  other_pets: ['dogs'],
  experience: 'experienced',
  size_preference: ['large'],
  special_needs: false,
};

describe('AI Pet Matching', () => {

  describe('Lifestyle Questionnaire', () => {
    it('should have at least 10 questions', () => {
      expect(LIFESTYLE_QUESTIONNAIRE.length).toBeGreaterThanOrEqual(10);
    });

    it('should have unique IDs', () => {
      const ids = LIFESTYLE_QUESTIONNAIRE.map(q => q.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('should have valid question types', () => {
      LIFESTYLE_QUESTIONNAIRE.forEach(q => {
        expect(['single', 'multiple', 'scale', 'boolean']).toContain(q.type);
      });
    });

    it('should have options for single/multiple types', () => {
      LIFESTYLE_QUESTIONNAIRE.filter(q => q.type === 'single' || q.type === 'multiple').forEach(q => {
        expect(q.options).toBeDefined();
        expect(q.options!.length).toBeGreaterThan(1);
      });
    });

    it('should have scale range for scale types', () => {
      LIFESTYLE_QUESTIONNAIRE.filter(q => q.type === 'scale').forEach(q => {
        expect(q.scaleMin).toBeDefined();
        expect(q.scaleMax).toBeDefined();
        expect(q.scaleMax!).toBeGreaterThan(q.scaleMin!);
      });
    });

    it('should cover key categories', () => {
      const categories = [...new Set(LIFESTYLE_QUESTIONNAIRE.map(q => q.category))];
      expect(categories.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Match Scoring', () => {
    it('should calculate overall score', () => {
      const result = calculateMatchScore(idealAnswers, mockPet);
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
    });

    it('should produce high score for ideal match', () => {
      const result = calculateMatchScore(idealAnswers, mockPet);
      expect(result.overallScore).toBeGreaterThanOrEqual(70);
    });

    it('should produce lower score for poor match', () => {
      const poorAnswers = {
        housing: 'apartment',
        exercise: 'minimal',
        children: false,
        other_pets: ['cats'],
        experience: 'first_time',
        size_preference: ['small'],
        special_needs: false,
      };
      const result = calculateMatchScore(poorAnswers, mockPet);
      expect(result.overallScore).toBeLessThan(60);
    });

    it('should include breakdown with factors', () => {
      const result = calculateMatchScore(idealAnswers, mockPet);
      expect(result.breakdown.length).toBeGreaterThan(3);
      result.breakdown.forEach(b => {
        expect(b.factor).toBeTruthy();
        expect(b.score).toBeGreaterThanOrEqual(0);
        expect(b.score).toBeLessThanOrEqual(100);
        expect(b.weight).toBeGreaterThan(0);
        expect(b.explanation).toBeTruthy();
      });
    });

    it('should include top reasons for good match', () => {
      const result = calculateMatchScore(idealAnswers, mockPet);
      expect(result.topReasons.length).toBeGreaterThan(0);
    });

    it('should flag concerns for bad factors', () => {
      const poorAnswers = {
        housing: 'apartment',
        exercise: 'minimal',
        other_pets: ['cats'],
        experience: 'first_time',
        size_preference: ['small'],
      };
      const result = calculateMatchScore(poorAnswers, mockPet);
      expect(result.concerns.length).toBeGreaterThan(0);
    });

    it('should calculate confidence level', () => {
      const result = calculateMatchScore(idealAnswers, mockPet);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(100);
    });

    it('should include pet info in result', () => {
      const result = calculateMatchScore(idealAnswers, mockPet);
      expect(result.petId).toBe('pet1');
      expect(result.petName).toBe('Buddy');
    });
  });

  describe('Ranking', () => {
    const pets = [
      { ...mockPet, id: 'p1', name: 'Buddy', size: 'large', energyLevel: 'high' },
      { ...mockPet, id: 'p2', name: 'Tiny', size: 'small', energyLevel: 'low', goodWithKids: false },
      { ...mockPet, id: 'p3', name: 'Max', size: 'large', energyLevel: 'medium' },
    ];

    it('should rank multiple pets', () => {
      const results = rankMatches(idealAnswers, pets);
      expect(results).toHaveLength(3);
    });

    it('should sort by score descending', () => {
      const results = rankMatches(idealAnswers, pets);
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].overallScore).toBeGreaterThanOrEqual(results[i].overallScore);
      }
    });

    it('should rank ideal match higher', () => {
      const results = rankMatches(idealAnswers, pets);
      // Buddy (large, high energy) should rank higher than Tiny (small, low energy) for these answers
      const buddyIdx = results.findIndex(r => r.petName === 'Buddy');
      const tinyIdx = results.findIndex(r => r.petName === 'Tiny');
      expect(buddyIdx).toBeLessThan(tinyIdx);
    });

    it('should handle empty pet list', () => {
      expect(rankMatches(idealAnswers, [])).toHaveLength(0);
    });
  });

  describe('Match Labels', () => {
    it('should return Excellent Match for 90+', () => {
      expect(getMatchLabel(95).label).toBe('Excellent Match');
    });

    it('should return Great Match for 75-89', () => {
      expect(getMatchLabel(80).label).toBe('Great Match');
    });

    it('should return Good Match for 60-74', () => {
      expect(getMatchLabel(65).label).toBe('Good Match');
    });

    it('should return Fair Match for 40-59', () => {
      expect(getMatchLabel(50).label).toBe('Fair Match');
    });

    it('should return Low Match for below 40', () => {
      expect(getMatchLabel(20).label).toBe('Low Match');
    });

    it('should include color for each label', () => {
      [95, 80, 65, 50, 20].forEach(score => {
        expect(getMatchLabel(score).color).toMatch(/^#[0-9a-f]{6}$/);
      });
    });
  });

  describe('Questionnaire Validation', () => {
    it('should validate complete answers', () => {
      const result = validateQuestionnaireAnswers({
        housing: 'apartment', activity_level: 3, experience: 'some', exercise: 'moderate',
      });
      expect(result.valid).toBe(true);
      expect(result.missing).toHaveLength(0);
    });

    it('should flag missing required fields', () => {
      const result = validateQuestionnaireAnswers({});
      expect(result.valid).toBe(false);
      expect(result.missing.length).toBeGreaterThan(0);
      expect(result.missing).toContain('housing');
    });

    it('should warn about children ages', () => {
      const result = validateQuestionnaireAnswers({
        housing: 'house_yard', activity_level: 3, experience: 'some', exercise: 'moderate',
        children: true,
      });
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should not warn about children ages when no children', () => {
      const result = validateQuestionnaireAnswers({
        housing: 'house_yard', activity_level: 3, experience: 'some', exercise: 'moderate',
        children: false,
      });
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe('Questionnaire Progress', () => {
    it('should track progress', () => {
      const progress = getQuestionnaireProgress({
        housing: 'apartment', activity_level: 3,
      });
      expect(progress.answered).toBe(2);
      expect(progress.total).toBe(LIFESTYLE_QUESTIONNAIRE.length);
      expect(progress.percentage).toBeGreaterThan(0);
    });

    it('should return 0 for empty answers', () => {
      const progress = getQuestionnaireProgress({});
      expect(progress.answered).toBe(0);
      expect(progress.percentage).toBe(0);
    });

    it('should return 100% for complete answers', () => {
      const all = {};
      LIFESTYLE_QUESTIONNAIRE.forEach(q => { all[q.id] = 'test'; });
      const progress = getQuestionnaireProgress(all);
      expect(progress.percentage).toBe(100);
    });
  });
});
