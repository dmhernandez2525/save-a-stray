import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  trackEvent,
  trackPageView,
  trackSearch,
  trackAnimalView,
  trackApplicationStart,
  trackApplicationSubmit,
  trackFavoriteToggle,
  trackShare,
  trackSignup,
  trackLogin,
  getStoredEvents,
  getSessionMetrics,
  getSessionDuration,
  clearStoredEvents,
  getEventsByCategory,
  getEventSummary,
} from '../lib/analytics-tracker';

describe('Analytics Tracker', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('trackEvent', () => {
    it('should store an event with correct fields', () => {
      trackEvent('test', 'action', 'label', 42);
      const events = getStoredEvents();
      expect(events).toHaveLength(1);
      expect(events[0].category).toBe('test');
      expect(events[0].action).toBe('action');
      expect(events[0].label).toBe('label');
      expect(events[0].value).toBe(42);
      expect(events[0].timestamp).toBeGreaterThan(0);
    });

    it('should store events without optional fields', () => {
      trackEvent('test', 'action');
      const events = getStoredEvents();
      expect(events).toHaveLength(1);
      expect(events[0].label).toBeUndefined();
      expect(events[0].value).toBeUndefined();
    });

    it('should accumulate multiple events', () => {
      trackEvent('a', 'one');
      trackEvent('b', 'two');
      trackEvent('c', 'three');
      expect(getStoredEvents()).toHaveLength(3);
    });

    it('should trim events when exceeding max stored count', () => {
      // Store 501 events (max is 500)
      const events = Array.from({ length: 501 }, (_, i) => ({
        category: 'bulk',
        action: `action_${i}`,
        timestamp: Date.now() + i,
      }));
      localStorage.setItem('sas_analytics_events', JSON.stringify(events));

      trackEvent('new', 'event');
      const stored = getStoredEvents();
      expect(stored.length).toBeLessThanOrEqual(500);
    });
  });

  describe('trackPageView', () => {
    it('should record a page view event', () => {
      trackPageView('/home');
      const events = getStoredEvents();
      expect(events).toHaveLength(1);
      expect(events[0].category).toBe('navigation');
      expect(events[0].action).toBe('page_view');
      expect(events[0].label).toBe('/home');
    });

    it('should increment session page view count', () => {
      trackPageView('/home');
      trackPageView('/browse');
      const session = getSessionMetrics();
      expect(session.pageViews).toBe(2);
    });
  });

  describe('trackSearch', () => {
    it('should record a search event with result count', () => {
      trackSearch('golden retriever', 15);
      const events = getStoredEvents();
      expect(events[0].category).toBe('search');
      expect(events[0].action).toBe('search_executed');
      expect(events[0].label).toBe('golden retriever');
      expect(events[0].value).toBe(15);
    });

    it('should increment session search count', () => {
      trackSearch('cat', 5);
      trackSearch('dog', 10);
      const session = getSessionMetrics();
      expect(session.searches).toBe(2);
    });
  });

  describe('trackAnimalView', () => {
    it('should record an animal view event', () => {
      trackAnimalView('animal123');
      const events = getStoredEvents();
      expect(events[0].category).toBe('animal');
      expect(events[0].action).toBe('view');
      expect(events[0].label).toBe('animal123');
    });

    it('should increment session animal view count', () => {
      trackAnimalView('a1');
      trackAnimalView('a2');
      trackAnimalView('a3');
      expect(getSessionMetrics().animalViews).toBe(3);
    });
  });

  describe('trackApplicationStart', () => {
    it('should record application start event', () => {
      trackApplicationStart('animal456');
      const events = getStoredEvents();
      expect(events[0].category).toBe('application');
      expect(events[0].action).toBe('started');
      expect(events[0].label).toBe('animal456');
    });

    it('should increment session application starts', () => {
      trackApplicationStart('a1');
      expect(getSessionMetrics().applicationStarts).toBe(1);
    });
  });

  describe('trackApplicationSubmit', () => {
    it('should record application submit event', () => {
      trackApplicationSubmit('animal789');
      const events = getStoredEvents();
      expect(events[0].category).toBe('application');
      expect(events[0].action).toBe('submitted');
    });
  });

  describe('trackFavoriteToggle', () => {
    it('should record favorite added event', () => {
      trackFavoriteToggle('animal1', true);
      const events = getStoredEvents();
      expect(events[0].action).toBe('added');
    });

    it('should record favorite removed event', () => {
      trackFavoriteToggle('animal1', false);
      const events = getStoredEvents();
      expect(events[0].action).toBe('removed');
    });

    it('should increment session favorite toggle count', () => {
      trackFavoriteToggle('a1', true);
      trackFavoriteToggle('a2', true);
      expect(getSessionMetrics().favoriteToggles).toBe(2);
    });
  });

  describe('trackShare', () => {
    it('should record share event with platform and entity', () => {
      trackShare('facebook', 'animal', 'abc');
      const events = getStoredEvents();
      expect(events[0].category).toBe('share');
      expect(events[0].action).toBe('facebook');
      expect(events[0].label).toBe('animal:abc');
    });
  });

  describe('trackSignup', () => {
    it('should record signup event', () => {
      trackSignup('email');
      const events = getStoredEvents();
      expect(events[0].category).toBe('auth');
      expect(events[0].action).toBe('signup');
      expect(events[0].label).toBe('email');
    });
  });

  describe('trackLogin', () => {
    it('should record login event', () => {
      trackLogin('google');
      const events = getStoredEvents();
      expect(events[0].category).toBe('auth');
      expect(events[0].action).toBe('login');
      expect(events[0].label).toBe('google');
    });
  });

  describe('Session Management', () => {
    it('should create a new session with valid fields', () => {
      const session = getSessionMetrics();
      expect(session.sessionId).toMatch(/^sess_/);
      expect(session.startedAt).toBeGreaterThan(0);
      expect(session.pageViews).toBe(0);
      expect(session.searches).toBe(0);
      expect(session.animalViews).toBe(0);
      expect(session.applicationStarts).toBe(0);
      expect(session.favoriteToggles).toBe(0);
    });

    it('should persist session across calls within 30 minutes', () => {
      const session1 = getSessionMetrics();
      trackPageView('/test');
      const session2 = getSessionMetrics();
      expect(session2.sessionId).toBe(session1.sessionId);
      expect(session2.pageViews).toBe(1);
    });

    it('should create new session after 30 minutes of inactivity', () => {
      const session1 = getSessionMetrics();
      const expiredSession = {
        ...session1,
        lastActivityAt: Date.now() - 31 * 60 * 1000,
      };
      sessionStorage.setItem('sas_analytics_session', JSON.stringify(expiredSession));

      const session2 = getSessionMetrics();
      expect(session2.sessionId).not.toBe(session1.sessionId);
    });

    it('should calculate session duration', () => {
      const session = getSessionMetrics();
      // Simulate some time passing
      const updated = { ...session, startedAt: Date.now() - 5000, lastActivityAt: Date.now() };
      sessionStorage.setItem('sas_analytics_session', JSON.stringify(updated));

      const duration = getSessionDuration();
      expect(duration).toBeGreaterThanOrEqual(4000);
      expect(duration).toBeLessThanOrEqual(6000);
    });
  });

  describe('clearStoredEvents', () => {
    it('should remove all stored events', () => {
      trackEvent('a', 'b');
      trackEvent('c', 'd');
      expect(getStoredEvents()).toHaveLength(2);

      clearStoredEvents();
      expect(getStoredEvents()).toHaveLength(0);
    });
  });

  describe('getEventsByCategory', () => {
    it('should filter events by category', () => {
      trackEvent('navigation', 'page_view');
      trackEvent('search', 'executed');
      trackEvent('navigation', 'page_view');
      trackEvent('animal', 'view');

      const navEvents = getEventsByCategory('navigation');
      expect(navEvents).toHaveLength(2);

      const searchEvents = getEventsByCategory('search');
      expect(searchEvents).toHaveLength(1);
    });

    it('should return empty array for unknown category', () => {
      expect(getEventsByCategory('nonexistent')).toHaveLength(0);
    });
  });

  describe('getEventSummary', () => {
    it('should group events by category:action', () => {
      trackEvent('nav', 'view');
      trackEvent('nav', 'view');
      trackEvent('nav', 'click');
      trackEvent('search', 'execute');

      const summary = getEventSummary();
      expect(summary['nav:view']).toBe(2);
      expect(summary['nav:click']).toBe(1);
      expect(summary['search:execute']).toBe(1);
    });

    it('should return empty object when no events', () => {
      expect(getEventSummary()).toEqual({});
    });
  });

  describe('Storage error handling', () => {
    it('should handle corrupted localStorage gracefully', () => {
      localStorage.setItem('sas_analytics_events', 'invalid json');
      expect(getStoredEvents()).toEqual([]);
    });

    it('should handle corrupted sessionStorage gracefully', () => {
      sessionStorage.setItem('sas_analytics_session', 'invalid');
      const session = getSessionMetrics();
      expect(session.sessionId).toMatch(/^sess_/);
    });
  });
});
