import { describe, it, expect } from 'vitest';
import {
  predictAdoption,
  calculateLosStats,
  identifyAtRiskAnimals,
  SEASONAL_FACTORS, forecastDemand, forecastYear,
  OPTIMAL_POSTING_TIMES, getBestPostingTimes,
  calculateAccuracy,
} from '../lib/predictive-analytics';

const healthyAnimal = {
  id: 'a1', species: 'dog', breed: 'Labrador', age: 'young', size: 'medium',
  daysInShelter: 5, hasPhotos: true, photoCount: 5, hasVideo: true,
  spayedNeutered: true, houseTrained: true, goodWithKids: true,
  goodWithDogs: true, goodWithCats: true, specialNeeds: false,
  listingViews: 50, favoriteCount: 5, applicationCount: 2,
};

const challengingAnimal = {
  id: 'a2', species: 'cat', age: 'senior', size: 'large',
  daysInShelter: 120, hasPhotos: false, photoCount: 0, hasVideo: false,
  spayedNeutered: false, houseTrained: false, goodWithKids: false,
  goodWithDogs: false, goodWithCats: false, specialNeeds: true,
  listingViews: 3, favoriteCount: 0, applicationCount: 0,
};

describe('Predictive Analytics', () => {

  describe('Adoption Prediction', () => {
    it('should predict high likelihood for appealing animals', () => {
      const result = predictAdoption(healthyAnimal);
      expect(result.likelihood).toBeGreaterThan(60);
      expect(result.riskLevel).toBe('low');
    });

    it('should predict low likelihood for challenging animals', () => {
      const result = predictAdoption(challengingAnimal);
      expect(result.likelihood).toBeLessThan(40);
      expect(result.riskLevel).toBe('high');
    });

    it('should include factor breakdown', () => {
      const result = predictAdoption(healthyAnimal);
      expect(result.factors.length).toBeGreaterThan(5);
      result.factors.forEach(f => {
        expect(f.factor).toBeTruthy();
        expect(['positive', 'negative', 'neutral']).toContain(f.impact);
        expect(f.weight).toBeGreaterThan(0);
      });
    });

    it('should estimate days to adoption', () => {
      const result = predictAdoption(healthyAnimal);
      expect(result.estimatedDays).toBeGreaterThan(0);
    });

    it('should provide recommended actions for low likelihood', () => {
      const result = predictAdoption(challengingAnimal);
      expect(result.recommendedActions.length).toBeGreaterThan(0);
    });

    it('should recommend photos when missing', () => {
      const result = predictAdoption({ ...healthyAnimal, hasPhotos: false, photoCount: 0 });
      expect(result.recommendedActions.some(a => a.toLowerCase().includes('photo'))).toBe(true);
    });

    it('should include confidence level', () => {
      const result = predictAdoption(healthyAnimal);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(100);
    });
  });

  describe('Length of Stay Stats', () => {
    const stays = [
      { species: 'dog', age: 'puppy', days: 5 },
      { species: 'dog', age: 'adult', days: 30 },
      { species: 'cat', age: 'kitten', days: 10 },
      { species: 'cat', age: 'adult', days: 45 },
      { species: 'dog', age: 'senior', days: 90 },
    ];

    it('should calculate average days', () => {
      const stats = calculateLosStats(stays);
      expect(stats.averageDays).toBe(36); // (5+30+10+45+90)/5
    });

    it('should calculate median', () => {
      const stats = calculateLosStats(stays);
      expect(stats.medianDays).toBeGreaterThan(0);
    });

    it('should calculate P90', () => {
      const stats = calculateLosStats(stays);
      expect(stats.p90Days).toBeGreaterThanOrEqual(stats.medianDays);
    });

    it('should break down by species', () => {
      const stats = calculateLosStats(stays);
      expect(stats.bySpecies['dog']).toBeDefined();
      expect(stats.bySpecies['cat']).toBeDefined();
    });

    it('should break down by age', () => {
      const stats = calculateLosStats(stays);
      expect(stats.byAge['puppy']).toBeDefined();
      expect(stats.byAge['adult']).toBeDefined();
    });

    it('should determine trend', () => {
      const stats = calculateLosStats(stays);
      expect(['improving', 'stable', 'worsening']).toContain(stats.trend);
    });

    it('should handle empty data', () => {
      const stats = calculateLosStats([]);
      expect(stats.averageDays).toBe(0);
      expect(stats.trend).toBe('stable');
    });
  });

  describe('At-Risk Detection', () => {
    const animals = [
      { id: 'a1', daysInShelter: 100, adoptionLikelihood: 15, species: 'dog', specialNeeds: false },
      { id: 'a2', daysInShelter: 65, adoptionLikelihood: 40, species: 'cat', specialNeeds: true },
      { id: 'a3', daysInShelter: 10, adoptionLikelihood: 80, species: 'dog', specialNeeds: false },
      { id: 'a4', daysInShelter: 5, adoptionLikelihood: 25, species: 'cat', specialNeeds: false },
    ];

    it('should identify at-risk animals', () => {
      const alerts = identifyAtRiskAnimals(animals);
      expect(alerts.length).toBeGreaterThan(0);
    });

    it('should flag critical stays', () => {
      const alerts = identifyAtRiskAnimals(animals);
      const critical = alerts.find(a => a.animalId === 'a1');
      expect(critical).toBeDefined();
      expect(critical!.urgency).toBe('critical');
    });

    it('should flag high stays', () => {
      const alerts = identifyAtRiskAnimals(animals);
      const high = alerts.find(a => a.animalId === 'a2');
      expect(high).toBeDefined();
      expect(high!.urgency).toBe('high');
    });

    it('should not flag healthy animals', () => {
      const alerts = identifyAtRiskAnimals(animals);
      const healthy = alerts.find(a => a.animalId === 'a3');
      expect(healthy).toBeUndefined();
    });

    it('should sort by risk score descending', () => {
      const alerts = identifyAtRiskAnimals(animals);
      for (let i = 1; i < alerts.length; i++) {
        expect(alerts[i - 1].riskScore).toBeGreaterThanOrEqual(alerts[i].riskScore);
      }
    });

    it('should include suggested actions', () => {
      const alerts = identifyAtRiskAnimals(animals);
      alerts.forEach(a => expect(a.suggestedAction.length).toBeGreaterThan(10));
    });
  });

  describe('Demand Forecasting', () => {
    it('should define 12 seasonal factors', () => {
      expect(Object.keys(SEASONAL_FACTORS)).toHaveLength(12);
    });

    it('should have higher factors in spring/summer', () => {
      expect(SEASONAL_FACTORS.may).toBeGreaterThan(SEASONAL_FACTORS.december);
    });

    it('should forecast monthly demand', () => {
      const forecast = forecastDemand(100, 80, 'may');
      expect(forecast.expectedIntake).toBeGreaterThan(0);
      expect(forecast.expectedAdoptions).toBeGreaterThan(0);
      expect(forecast.seasonalFactor).toBe(SEASONAL_FACTORS.may);
    });

    it('should apply growth rate', () => {
      const f0 = forecastDemand(100, 80, 'january', 0);
      const f10 = forecastDemand(100, 80, 'january', 0.10);
      expect(f10.expectedIntake).toBeGreaterThan(f0.expectedIntake);
    });

    it('should forecast full year', () => {
      const forecasts = forecastYear(100, 80);
      expect(forecasts).toHaveLength(12);
    });

    it('should calculate net change', () => {
      const forecast = forecastDemand(120, 80, 'march');
      expect(forecast.netChange).toBe(forecast.expectedIntake - forecast.expectedAdoptions);
    });
  });

  describe('Optimal Posting Times', () => {
    it('should define 7 posting time recommendations', () => {
      expect(OPTIMAL_POSTING_TIMES).toHaveLength(7);
    });

    it('should get top N posting times', () => {
      const top = getBestPostingTimes(3);
      expect(top).toHaveLength(3);
    });

    it('should sort by engagement score', () => {
      const top = getBestPostingTimes(5);
      for (let i = 1; i < top.length; i++) {
        expect(top[i - 1].engagementScore).toBeGreaterThanOrEqual(top[i].engagementScore);
      }
    });

    it('should include weekends as best times', () => {
      const top = getBestPostingTimes(2);
      const weekend = top.filter(t => t.dayOfWeek === 'Saturday' || t.dayOfWeek === 'Sunday');
      expect(weekend.length).toBeGreaterThan(0);
    });
  });

  describe('Prediction Accuracy', () => {
    it('should calculate accuracy', () => {
      const result = calculateAccuracy([
        { predicted: 50, actual: 48 },
        { predicted: 30, actual: 60 },
        { predicted: 80, actual: 82 },
      ]);
      expect(result.totalPredictions).toBe(3);
      expect(result.accuracy).toBeGreaterThan(0);
    });

    it('should calculate mean absolute error', () => {
      const result = calculateAccuracy([
        { predicted: 50, actual: 40 },
        { predicted: 30, actual: 20 },
      ]);
      expect(result.meanAbsoluteError).toBe(10);
    });

    it('should handle empty predictions', () => {
      const result = calculateAccuracy([]);
      expect(result.totalPredictions).toBe(0);
      expect(result.accuracy).toBe(0);
    });

    it('should count correct predictions within threshold', () => {
      const result = calculateAccuracy([
        { predicted: 100, actual: 100 },
        { predicted: 100, actual: 110 },
        { predicted: 100, actual: 200 },
      ]);
      expect(result.correctPredictions).toBe(2); // 0% and ~9% error are within 15%
    });
  });
});
