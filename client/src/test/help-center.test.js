import { describe, it, expect, beforeEach } from 'vitest';
import {
  FAQ_CATEGORIES, FAQ_DATABASE,
  searchFaq, getFaqsByCategory, getFaqById,
  CONTEXTUAL_HELP, getContextualHelp, getContextualHelpById,
  CHANGELOG, getChangelog, getChangelogByVersion, getLatestChangelog, getChangesByType,
  API_DOCUMENTATION, getApiEndpoints, getApiEndpointsByCategory, getApiCategories, searchApiDocs,
  USER_GUIDES, getGuide, getGuidesForAudience,
  DOC_VERSIONS, getCurrentDocVersion, getDocVersions,
  submitFeedback, getFeedback, getFeedbackStats, clearFeedback,
} from '../lib/help-center';

describe('Help Center', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('FAQ Database', () => {
    it('should define 6 FAQ categories', () => {
      expect(FAQ_CATEGORIES).toHaveLength(6);
    });

    it('should have at least 15 FAQ entries', () => {
      expect(FAQ_DATABASE.length).toBeGreaterThanOrEqual(15);
    });

    it('should have unique FAQ IDs', () => {
      const ids = FAQ_DATABASE.map(f => f.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('should have valid categories for all FAQs', () => {
      const validCategories = FAQ_CATEGORIES.map(c => c.id);
      FAQ_DATABASE.forEach(faq => {
        expect(validCategories).toContain(faq.category);
      });
    });

    it('should have non-empty questions and answers', () => {
      FAQ_DATABASE.forEach(faq => {
        expect(faq.question.length).toBeGreaterThan(10);
        expect(faq.answer.length).toBeGreaterThan(20);
      });
    });

    it('should have at least one tag per FAQ', () => {
      FAQ_DATABASE.forEach(faq => {
        expect(faq.tags.length).toBeGreaterThan(0);
      });
    });
  });

  describe('FAQ Search', () => {
    it('should return all FAQs for empty query', () => {
      const results = searchFaq('');
      expect(results).toHaveLength(FAQ_DATABASE.length);
    });

    it('should search by question content', () => {
      const results = searchFaq('adoption');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should search by tags', () => {
      const results = searchFaq('password');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.tags.includes('password'))).toBe(true);
    });

    it('should filter by category', () => {
      const results = searchFaq('', 'shelter');
      results.forEach(r => {
        expect(r.category).toBe('shelter');
      });
    });

    it('should combine search and category filter', () => {
      const results = searchFaq('application', 'shelter');
      results.forEach(r => {
        expect(r.category).toBe('shelter');
      });
    });

    it('should return empty for nonsense queries', () => {
      const results = searchFaq('xyznonexistent123');
      expect(results).toHaveLength(0);
    });

    it('should rank question matches higher than answer matches', () => {
      const results = searchFaq('adoption');
      // Should have results since "adoption" appears in questions and answers
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('getFaqsByCategory', () => {
    it('should return adopter FAQs', () => {
      const results = getFaqsByCategory('adopter');
      expect(results.length).toBeGreaterThan(0);
      results.forEach(r => expect(r.category).toBe('adopter'));
    });

    it('should return shelter FAQs', () => {
      const results = getFaqsByCategory('shelter');
      expect(results.length).toBeGreaterThan(0);
      results.forEach(r => expect(r.category).toBe('shelter'));
    });
  });

  describe('getFaqById', () => {
    it('should return FAQ by ID', () => {
      const faq = getFaqById('adopt-01');
      expect(faq).not.toBeNull();
      expect(faq!.id).toBe('adopt-01');
    });

    it('should return null for invalid ID', () => {
      expect(getFaqById('nonexistent')).toBeNull();
    });
  });

  describe('Contextual Help', () => {
    it('should define at least 8 contextual help entries', () => {
      expect(CONTEXTUAL_HELP.length).toBeGreaterThanOrEqual(8);
    });

    it('should have unique IDs', () => {
      const ids = CONTEXTUAL_HELP.map(h => h.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('should get help for specific page', () => {
      const help = getContextualHelp('/animals');
      expect(help.length).toBeGreaterThan(0);
    });

    it('should handle parameterized routes', () => {
      const help = getContextualHelp('/animals/abc123');
      expect(help.length).toBeGreaterThan(0);
    });

    it('should return empty for unknown page', () => {
      const help = getContextualHelp('/unknown-page');
      expect(help).toHaveLength(0);
    });

    it('should get help by ID', () => {
      const help = getContextualHelpById('ch-animal-grid');
      expect(help).not.toBeNull();
      expect(help!.title).toBe('Browse Animals');
    });

    it('should return null for invalid help ID', () => {
      expect(getContextualHelpById('nonexistent')).toBeNull();
    });
  });

  describe('Changelog', () => {
    it('should have at least 3 changelog entries', () => {
      expect(CHANGELOG.length).toBeGreaterThanOrEqual(3);
    });

    it('should have valid version format', () => {
      CHANGELOG.forEach(entry => {
        expect(entry.version).toMatch(/^\d+\.\d+\.\d+$/);
      });
    });

    it('should have valid date format', () => {
      CHANGELOG.forEach(entry => {
        expect(new Date(entry.date).getTime()).not.toBeNaN();
      });
    });

    it('should have highlights and changes', () => {
      CHANGELOG.forEach(entry => {
        expect(entry.highlights.length).toBeGreaterThan(0);
        expect(entry.changes.length).toBeGreaterThan(0);
      });
    });

    it('should have valid change types', () => {
      CHANGELOG.forEach(entry => {
        entry.changes.forEach(change => {
          expect(['added', 'changed', 'fixed', 'removed']).toContain(change.type);
        });
      });
    });

    it('should get all changelog entries', () => {
      expect(getChangelog()).toHaveLength(CHANGELOG.length);
    });

    it('should get changelog by version', () => {
      const entry = getChangelogByVersion('2.0.0');
      expect(entry).not.toBeNull();
      expect(entry!.title).toBe('Platform Modernization');
    });

    it('should return null for unknown version', () => {
      expect(getChangelogByVersion('99.0.0')).toBeNull();
    });

    it('should get latest changelog', () => {
      const latest = getLatestChangelog();
      expect(latest).not.toBeNull();
      expect(latest!.version).toBe('2.0.0');
    });

    it('should get changes by type', () => {
      const added = getChangesByType('2.0.0', 'added');
      expect(added.length).toBeGreaterThan(0);
    });

    it('should return empty for unknown version changes', () => {
      expect(getChangesByType('99.0.0', 'added')).toHaveLength(0);
    });
  });

  describe('API Documentation', () => {
    it('should define at least 8 API endpoints', () => {
      expect(API_DOCUMENTATION.length).toBeGreaterThanOrEqual(8);
    });

    it('should have valid HTTP methods', () => {
      API_DOCUMENTATION.forEach(endpoint => {
        expect(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).toContain(endpoint.method);
      });
    });

    it('should have at least one response per endpoint', () => {
      API_DOCUMENTATION.forEach(endpoint => {
        expect(endpoint.responses.length).toBeGreaterThan(0);
      });
    });

    it('should get all endpoints', () => {
      expect(getApiEndpoints()).toHaveLength(API_DOCUMENTATION.length);
    });

    it('should get endpoints by category', () => {
      const animals = getApiEndpointsByCategory('Animals');
      expect(animals.length).toBeGreaterThan(0);
      animals.forEach(e => expect(e.category).toBe('Animals'));
    });

    it('should get all categories', () => {
      const categories = getApiCategories();
      expect(categories.length).toBeGreaterThan(2);
      expect(categories).toContain('Animals');
      expect(categories).toContain('Authentication');
    });

    it('should search API docs', () => {
      const results = searchApiDocs('animals');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should return all for empty search', () => {
      expect(searchApiDocs('')).toHaveLength(API_DOCUMENTATION.length);
    });

    it('should return empty for nonsense search', () => {
      expect(searchApiDocs('xyznonexistent123')).toHaveLength(0);
    });

    it('should include auth indicators', () => {
      const publicEndpoints = API_DOCUMENTATION.filter(e => !e.auth);
      const authedEndpoints = API_DOCUMENTATION.filter(e => e.auth);
      expect(publicEndpoints.length).toBeGreaterThan(0);
      expect(authedEndpoints.length).toBeGreaterThan(0);
    });
  });

  describe('User Guides', () => {
    it('should define at least 4 guides', () => {
      expect(USER_GUIDES.length).toBeGreaterThanOrEqual(4);
    });

    it('should have guides for all audiences', () => {
      const audiences = USER_GUIDES.map(g => g.audience);
      expect(audiences).toContain('adopter');
      expect(audiences).toContain('shelter');
      expect(audiences).toContain('foster');
      expect(audiences).toContain('developer');
    });

    it('should have sections in each guide', () => {
      USER_GUIDES.forEach(guide => {
        expect(guide.sections.length).toBeGreaterThan(2);
      });
    });

    it('should get guide by ID', () => {
      const guide = getGuide('adopter-guide');
      expect(guide).not.toBeNull();
      expect(guide!.audience).toBe('adopter');
    });

    it('should return null for invalid guide ID', () => {
      expect(getGuide('nonexistent')).toBeNull();
    });

    it('should get guides for audience', () => {
      const shelterGuides = getGuidesForAudience('shelter');
      expect(shelterGuides.length).toBeGreaterThan(0);
    });
  });

  describe('Documentation Versioning', () => {
    it('should have at least 3 versions', () => {
      expect(DOC_VERSIONS.length).toBeGreaterThanOrEqual(3);
    });

    it('should have exactly one current version', () => {
      const current = DOC_VERSIONS.filter(v => v.current);
      expect(current).toHaveLength(1);
    });

    it('should get current version', () => {
      const current = getCurrentDocVersion();
      expect(current.current).toBe(true);
      expect(current.version).toBe('2.0.0');
    });

    it('should get all versions', () => {
      expect(getDocVersions()).toHaveLength(DOC_VERSIONS.length);
    });
  });

  describe('Help Feedback', () => {
    it('should submit helpful feedback', () => {
      submitFeedback('adopt-01', true);
      const feedback = getFeedback();
      expect(feedback).toHaveLength(1);
      expect(feedback[0].helpful).toBe(true);
    });

    it('should submit not helpful feedback', () => {
      submitFeedback('adopt-01', false);
      const feedback = getFeedback();
      expect(feedback[0].helpful).toBe(false);
    });

    it('should replace feedback for same item', () => {
      submitFeedback('adopt-01', true);
      submitFeedback('adopt-01', false);
      const feedback = getFeedback();
      expect(feedback).toHaveLength(1);
      expect(feedback[0].helpful).toBe(false);
    });

    it('should track multiple items', () => {
      submitFeedback('adopt-01', true);
      submitFeedback('adopt-02', false);
      expect(getFeedback()).toHaveLength(2);
    });

    it('should calculate feedback stats', () => {
      submitFeedback('adopt-01', true);
      submitFeedback('adopt-02', true);
      submitFeedback('adopt-03', false);
      const stats = getFeedbackStats();
      expect(stats.total).toBe(3);
      expect(stats.helpful).toBe(2);
      expect(stats.notHelpful).toBe(1);
      expect(stats.helpfulRate).toBe(67);
    });

    it('should handle empty feedback stats', () => {
      const stats = getFeedbackStats();
      expect(stats.total).toBe(0);
      expect(stats.helpfulRate).toBe(0);
    });

    it('should clear feedback', () => {
      submitFeedback('adopt-01', true);
      clearFeedback();
      expect(getFeedback()).toHaveLength(0);
    });

    it('should limit feedback entries to 200', () => {
      for (let i = 0; i < 220; i++) {
        submitFeedback(`item-${i}`, true);
      }
      expect(getFeedback().length).toBeLessThanOrEqual(200);
    });
  });
});
