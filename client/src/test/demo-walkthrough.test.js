import { describe, it, expect, beforeEach } from 'vitest';
import {
  WALKTHROUGHS,
  startWalkthrough, nextStep, previousStep, skipWalkthrough,
  getCurrentStep, getProgress, isWalkthroughComplete,
  getWalkthroughsForRole, resetWalkthroughState,
  trackDemoInteraction, getDemoAnalytics, clearDemoAnalytics,
} from '../lib/demo-walkthrough';

describe('Demo Walkthrough System', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Walkthrough Definitions', () => {
    it('should define at least 2 walkthroughs', () => {
      expect(WALKTHROUGHS.length).toBeGreaterThanOrEqual(2);
    });

    it('should have adopter tour', () => {
      const adopter = WALKTHROUGHS.find(w => w.id === 'adopter-tour');
      expect(adopter).toBeDefined();
      expect(adopter!.steps.length).toBeGreaterThan(5);
    });

    it('should have shelter tour', () => {
      const shelter = WALKTHROUGHS.find(w => w.id === 'shelter-tour');
      expect(shelter).toBeDefined();
      expect(shelter!.steps.length).toBeGreaterThan(3);
    });

    it('should have unique step IDs within each walkthrough', () => {
      WALKTHROUGHS.forEach(w => {
        const ids = w.steps.map(s => s.id);
        expect(new Set(ids).size).toBe(ids.length);
      });
    });

    it('should have valid positions', () => {
      WALKTHROUGHS.forEach(w => {
        w.steps.forEach(step => {
          expect(['top', 'bottom', 'left', 'right']).toContain(step.position);
        });
      });
    });
  });

  describe('startWalkthrough', () => {
    it('should return first step', () => {
      const step = startWalkthrough('adopter-tour');
      expect(step).not.toBeNull();
      expect(step!.id).toBe('welcome');
    });

    it('should return null for invalid walkthrough', () => {
      expect(startWalkthrough('nonexistent')).toBeNull();
    });
  });

  describe('Navigation', () => {
    it('should advance to next step', () => {
      startWalkthrough('adopter-tour');
      const step = nextStep();
      expect(step).not.toBeNull();
      expect(step!.id).toBe('browse');
    });

    it('should go back to previous step', () => {
      startWalkthrough('adopter-tour');
      nextStep();
      const step = previousStep();
      expect(step!.id).toBe('welcome');
    });

    it('should not go before first step', () => {
      startWalkthrough('adopter-tour');
      const step = previousStep();
      expect(step!.id).toBe('welcome');
    });

    it('should return null when walkthrough ends', () => {
      startWalkthrough('shelter-tour');
      const shelterTour = WALKTHROUGHS.find(w => w.id === 'shelter-tour')!;
      for (let i = 0; i < shelterTour.steps.length; i++) {
        nextStep();
      }
      // After last step, nextStep returns null
      expect(getCurrentStep()).toBeNull();
    });

    it('should mark walkthrough as complete', () => {
      startWalkthrough('shelter-tour');
      const shelterTour = WALKTHROUGHS.find(w => w.id === 'shelter-tour')!;
      for (let i = 0; i < shelterTour.steps.length; i++) {
        nextStep();
      }
      expect(isWalkthroughComplete('shelter-tour')).toBe(true);
    });
  });

  describe('Skip', () => {
    it('should skip active walkthrough', () => {
      startWalkthrough('adopter-tour');
      skipWalkthrough();
      expect(getCurrentStep()).toBeNull();
    });

    it('should not mark as complete when skipped', () => {
      startWalkthrough('adopter-tour');
      skipWalkthrough();
      expect(isWalkthroughComplete('adopter-tour')).toBe(false);
    });
  });

  describe('getCurrentStep', () => {
    it('should return null when no walkthrough active', () => {
      expect(getCurrentStep()).toBeNull();
    });

    it('should return current step', () => {
      startWalkthrough('adopter-tour');
      const step = getCurrentStep();
      expect(step!.id).toBe('welcome');
    });
  });

  describe('getProgress', () => {
    it('should return 0 when no walkthrough active', () => {
      const progress = getProgress();
      expect(progress.current).toBe(0);
      expect(progress.total).toBe(0);
      expect(progress.percentage).toBe(0);
    });

    it('should track progress', () => {
      startWalkthrough('adopter-tour');
      const p1 = getProgress();
      expect(p1.current).toBe(1);
      expect(p1.total).toBeGreaterThan(5);

      nextStep();
      const p2 = getProgress();
      expect(p2.current).toBe(2);
      expect(p2.percentage).toBeGreaterThan(p1.percentage);
    });
  });

  describe('getWalkthroughsForRole', () => {
    it('should return adopter walkthroughs', () => {
      const tours = getWalkthroughsForRole('adopter');
      expect(tours.length).toBeGreaterThan(0);
      expect(tours[0].role).toBe('adopter');
    });

    it('should return shelter staff walkthroughs', () => {
      const tours = getWalkthroughsForRole('shelter_staff');
      expect(tours.length).toBeGreaterThan(0);
    });
  });

  describe('resetWalkthroughState', () => {
    it('should reset all state', () => {
      startWalkthrough('adopter-tour');
      nextStep();
      resetWalkthroughState();
      expect(getCurrentStep()).toBeNull();
      expect(isWalkthroughComplete('adopter-tour')).toBe(false);
    });
  });
});

describe('Demo Analytics', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('trackDemoInteraction', () => {
    it('should track interactions', () => {
      trackDemoInteraction('animals', 'view');
      trackDemoInteraction('animals', 'filter');
      const analytics = getDemoAnalytics();
      expect(analytics.totalInteractions).toBe(2);
    });

    it('should limit to 500 entries', () => {
      for (let i = 0; i < 550; i++) {
        trackDemoInteraction('test', 'action');
      }
      const analytics = getDemoAnalytics();
      expect(analytics.totalInteractions).toBeLessThanOrEqual(500);
    });
  });

  describe('getDemoAnalytics', () => {
    it('should return empty stats when no interactions', () => {
      const analytics = getDemoAnalytics();
      expect(analytics.totalInteractions).toBe(0);
      expect(analytics.mostUsedFeature).toBeNull();
    });

    it('should calculate feature breakdown', () => {
      trackDemoInteraction('animals', 'view');
      trackDemoInteraction('animals', 'filter');
      trackDemoInteraction('applications', 'submit');
      const analytics = getDemoAnalytics();
      expect(analytics.featureBreakdown.animals).toBe(2);
      expect(analytics.featureBreakdown.applications).toBe(1);
    });

    it('should find most used feature', () => {
      trackDemoInteraction('animals', 'view');
      trackDemoInteraction('animals', 'filter');
      trackDemoInteraction('applications', 'view');
      const analytics = getDemoAnalytics();
      expect(analytics.mostUsedFeature).toBe('animals');
    });
  });

  describe('clearDemoAnalytics', () => {
    it('should clear all analytics', () => {
      trackDemoInteraction('test', 'action');
      clearDemoAnalytics();
      expect(getDemoAnalytics().totalInteractions).toBe(0);
    });
  });
});
