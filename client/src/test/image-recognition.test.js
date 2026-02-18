import { describe, it, expect } from 'vitest';
import {
  BREED_DATABASE, getBreedInfo, searchBreeds, getBreedsByGroup, detectBreed,
  predictBreedMix,
  scoreImageQuality, getQualityLabel,
  generateSimpleHash, compareSimilarity, findDuplicates,
  TAG_CATEGORIES, generateTags,
  COAT_PATTERNS, COAT_COLORS, COAT_LENGTHS, analyzeCoat,
  estimateAge,
} from '../lib/image-recognition';

describe('Image Recognition', () => {

  describe('Breed Database', () => {
    it('should have at least 15 breeds', () => {
      expect(BREED_DATABASE.length).toBeGreaterThanOrEqual(15);
    });

    it('should include both dog and cat breeds', () => {
      const catBreeds = BREED_DATABASE.filter(b => b.group === 'Cat');
      const dogBreeds = BREED_DATABASE.filter(b => b.group !== 'Cat');
      expect(catBreeds.length).toBeGreaterThan(0);
      expect(dogBreeds.length).toBeGreaterThan(0);
    });

    it('should get breed info by name', () => {
      const lab = getBreedInfo('Labrador Retriever');
      expect(lab).not.toBeNull();
      expect(lab!.sizeCategory).toBe('large');
    });

    it('should be case insensitive', () => {
      expect(getBreedInfo('labrador retriever')).not.toBeNull();
    });

    it('should return null for unknown breed', () => {
      expect(getBreedInfo('UnknownBreed')).toBeNull();
    });

    it('should search breeds', () => {
      const results = searchBreeds('lab');
      expect(results.some(b => b.name === 'Labrador Retriever')).toBe(true);
    });

    it('should search by group', () => {
      const results = searchBreeds('sporting');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should return all breeds for empty search', () => {
      expect(searchBreeds('')).toHaveLength(BREED_DATABASE.length);
    });

    it('should get breeds by group', () => {
      const hounds = getBreedsByGroup('hound');
      hounds.forEach(b => expect(b.group.toLowerCase()).toBe('hound'));
    });
  });

  describe('Breed Detection', () => {
    it('should detect dog breeds', () => {
      const predictions = detectBreed({ species: 'dog', size: 'large' });
      expect(predictions.length).toBeGreaterThan(0);
      predictions.forEach(p => {
        expect(p.confidence).toBeGreaterThan(0);
        expect(p.confidence).toBeLessThanOrEqual(100);
      });
    });

    it('should detect cat breeds', () => {
      const predictions = detectBreed({ species: 'cat' });
      expect(predictions.length).toBeGreaterThan(0);
      predictions.forEach(p => expect(p.group).toBe('Cat'));
    });

    it('should filter by species', () => {
      const dogs = detectBreed({ species: 'dog' });
      dogs.forEach(p => expect(p.group).not.toBe('Cat'));
    });

    it('should return max 5 predictions', () => {
      const predictions = detectBreed({ species: 'dog' });
      expect(predictions.length).toBeLessThanOrEqual(5);
    });

    it('should sort by confidence descending', () => {
      const predictions = detectBreed({ species: 'dog' });
      for (let i = 1; i < predictions.length; i++) {
        expect(predictions[i - 1].confidence).toBeGreaterThanOrEqual(predictions[i].confidence);
      }
    });
  });

  describe('Breed Mix Prediction', () => {
    it('should identify purebred for high confidence', () => {
      const mix = predictBreedMix([{ breed: 'Labrador', confidence: 90, group: 'Sporting' }]);
      expect(mix.isPurebred).toBe(true);
      expect(mix.breeds[0].percentage).toBe(100);
    });

    it('should predict mix for lower confidence', () => {
      const mix = predictBreedMix([
        { breed: 'Labrador', confidence: 60, group: 'Sporting' },
        { breed: 'Golden', confidence: 30, group: 'Sporting' },
      ]);
      expect(mix.isPurebred).toBe(false);
      expect(mix.breeds.length).toBeGreaterThan(1);
    });

    it('should handle empty predictions', () => {
      const mix = predictBreedMix([]);
      expect(mix.breeds).toHaveLength(0);
      expect(mix.isPurebred).toBe(false);
    });

    it('should sum percentages close to 100', () => {
      const mix = predictBreedMix([
        { breed: 'A', confidence: 50, group: 'X' },
        { breed: 'B', confidence: 30, group: 'X' },
        { breed: 'C', confidence: 20, group: 'X' },
      ]);
      const total = mix.breeds.reduce((sum, b) => sum + b.percentage, 0);
      expect(total).toBeGreaterThanOrEqual(98);
      expect(total).toBeLessThanOrEqual(102);
    });
  });

  describe('Image Quality', () => {
    it('should score high quality images', () => {
      const score = scoreImageQuality({
        width: 2000, height: 1500, fileSize: 500000,
        brightness: 140, contrast: 60, blurScore: 85, faceDetected: true,
      });
      expect(score.overall).toBeGreaterThan(60);
      expect(score.suggestions.length).toBeLessThanOrEqual(2);
    });

    it('should flag dark images', () => {
      const score = scoreImageQuality({
        width: 1000, height: 800, fileSize: 100000, brightness: 30,
      });
      expect(score.suggestions.some(s => s.toLowerCase().includes('dark'))).toBe(true);
    });

    it('should flag blurry images', () => {
      const score = scoreImageQuality({
        width: 1000, height: 800, fileSize: 100000, blurScore: 20,
      });
      expect(score.suggestions.some(s => s.toLowerCase().includes('blurry'))).toBe(true);
    });

    it('should flag low resolution', () => {
      const score = scoreImageQuality({
        width: 200, height: 200, fileSize: 10000,
      });
      expect(score.suggestions.some(s => s.includes('resolution'))).toBe(true);
    });

    it('should have all scores between 0 and 100', () => {
      const score = scoreImageQuality({
        width: 1000, height: 800, fileSize: 100000,
      });
      expect(score.overall).toBeGreaterThanOrEqual(0);
      expect(score.overall).toBeLessThanOrEqual(100);
      expect(score.sharpness).toBeGreaterThanOrEqual(0);
      expect(score.lighting).toBeGreaterThanOrEqual(0);
    });

    it('should provide quality labels', () => {
      expect(getQualityLabel(85)).toBe('Excellent');
      expect(getQualityLabel(65)).toBe('Good');
      expect(getQualityLabel(45)).toBe('Fair');
      expect(getQualityLabel(25)).toBe('Poor');
    });
  });

  describe('Duplicate Detection', () => {
    it('should generate hash', () => {
      const hash = generateSimpleHash({
        width: 1000, height: 800, dominantColors: ['brown', 'white'], averageBrightness: 140,
      });
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should find identical hashes', () => {
      expect(compareSimilarity('10-8-brownwhite-140', '10-8-brownwhite-140')).toBe(100);
    });

    it('should detect partial similarity', () => {
      const sim = compareSimilarity('10-8-brownwhite-140', '10-8-blackwhite-140');
      expect(sim).toBeGreaterThan(0);
      expect(sim).toBeLessThan(100);
    });

    it('should find duplicates above threshold', () => {
      const existing = [
        { id: 'img1', hash: '10-8-brownwhite-140', animalId: 'a1' },
        { id: 'img2', hash: '5-5-black-60', animalId: 'a2' },
      ];
      const results = findDuplicates('10-8-brownwhite-140', existing);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].similarity).toBe(100);
    });

    it('should exclude below threshold', () => {
      const existing = [
        { id: 'img1', hash: '1-1-red-10', animalId: 'a1' },
      ];
      const results = findDuplicates('20-15-blue-200', existing, 80);
      expect(results).toHaveLength(0);
    });
  });

  describe('Auto-Tagging', () => {
    it('should tag outdoor images', () => {
      const tags = generateTags({ isOutdoor: true });
      expect(tags.some(t => t.tag === 'outdoor')).toBe(true);
    });

    it('should tag indoor images', () => {
      const tags = generateTags({ isOutdoor: false });
      expect(tags.some(t => t.tag === 'indoor')).toBe(true);
    });

    it('should tag group photos', () => {
      const tags = generateTags({ hasMultipleAnimals: true });
      expect(tags.some(t => t.tag === 'group')).toBe(true);
    });

    it('should include activity tags', () => {
      const tags = generateTags({ activity: 'playing' });
      expect(tags.some(t => t.tag === 'playing')).toBe(true);
    });

    it('should include color tags', () => {
      const tags = generateTags({ dominantColors: ['brown', 'white'] });
      expect(tags.some(t => t.category === 'appearance')).toBe(true);
    });

    it('should sort by confidence', () => {
      const tags = generateTags({ isOutdoor: true, activity: 'playing', dominantColors: ['brown'] });
      for (let i = 1; i < tags.length; i++) {
        expect(tags[i - 1].confidence).toBeGreaterThanOrEqual(tags[i].confidence);
      }
    });

    it('should have valid tag categories', () => {
      expect(TAG_CATEGORIES.length).toBe(4);
    });
  });

  describe('Coat Analysis', () => {
    it('should analyze single-color coat', () => {
      const coat = analyzeCoat(['black']);
      expect(coat.primaryColor).toBe('black');
      expect(coat.pattern).toBe('solid');
    });

    it('should analyze multi-color coat', () => {
      const coat = analyzeCoat(['black', 'white', 'brown']);
      expect(coat.primaryColor).toBe('black');
      expect(coat.secondaryColor).toBe('white');
      expect(coat.pattern).toBe('tricolor');
    });

    it('should accept custom pattern', () => {
      const coat = analyzeCoat(['orange', 'black'], 'tabby');
      expect(coat.pattern).toBe('tabby');
    });

    it('should define valid coat constants', () => {
      expect(COAT_PATTERNS.length).toBeGreaterThan(5);
      expect(COAT_COLORS.length).toBeGreaterThan(5);
      expect(COAT_LENGTHS.length).toBeGreaterThan(3);
    });
  });

  describe('Age Estimation', () => {
    it('should estimate puppy age', () => {
      const est = estimateAge({ species: 'dog', teethCondition: 'baby' });
      expect(est.category).toBe('puppy');
      expect(est.minMonths).toBe(0);
    });

    it('should estimate kitten age', () => {
      const est = estimateAge({ species: 'cat', teethCondition: 'baby' });
      expect(est.category).toBe('kitten');
    });

    it('should estimate senior age', () => {
      const est = estimateAge({ species: 'dog', teethCondition: 'worn', eyeClarity: 'cloudy' });
      expect(est.category).toBe('senior');
    });

    it('should provide confidence', () => {
      const est = estimateAge({ species: 'dog', teethCondition: 'clean', eyeClarity: 'clear' });
      expect(est.confidence).toBeGreaterThan(0);
      expect(est.confidence).toBeLessThanOrEqual(90);
    });

    it('should provide age range', () => {
      const est = estimateAge({ species: 'dog' });
      expect(est.minMonths).toBeLessThan(est.maxMonths);
    });
  });
});
