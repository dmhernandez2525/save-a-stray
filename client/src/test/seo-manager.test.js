import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateMetaTags, generateAnimalMeta, generateShelterMeta,
  generateAnimalSchema, generateOrganizationSchema, generateEventSchema,
  generateBreadcrumbSchema, generateWebSiteSchema, renderJsonLd,
  STATIC_PAGES, generateSitemapEntries, generateSitemapXml,
  generateRobotsTxt,
  generateSlug, generateAnimalSlug, generateShelterSlug,
  generateShareUrl, getSupportedPlatforms,
  trackAnalyticsEvent, getAnalyticsEvents, getAnalyticsSummary, clearAnalyticsEvents,
  PAGE_SPEED_HINTS, getPageSpeedHints, getHighImpactHints,
} from '../lib/seo-manager';

describe('SEO Manager', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Meta Tags', () => {
    it('should generate default meta tags', () => {
      const meta = generateMetaTags();
      expect(meta.title).toContain('Save A Stray');
      expect(meta.description.length).toBeGreaterThan(20);
      expect(meta.robots).toBe('index, follow');
    });

    it('should merge custom config with defaults', () => {
      const meta = generateMetaTags({ title: 'Custom Title' });
      expect(meta.title).toBe('Custom Title');
      expect(meta.description).toContain('Connect with shelters'); // default preserved
    });

    it('should auto-fill OG tags from title/description', () => {
      const meta = generateMetaTags({ title: 'Test', description: 'Desc' });
      expect(meta.ogTitle).toBe('Test');
      expect(meta.ogDescription).toBe('Desc');
      expect(meta.twitterTitle).toBe('Test');
    });

    it('should allow custom OG tags', () => {
      const meta = generateMetaTags({ title: 'Main', ogTitle: 'OG Title' });
      expect(meta.ogTitle).toBe('OG Title');
      expect(meta.title).toBe('Main');
    });

    it('should include keywords', () => {
      const meta = generateMetaTags();
      expect(meta.keywords).toBeDefined();
      expect(meta.keywords!.length).toBeGreaterThan(0);
    });
  });

  describe('Animal Meta', () => {
    it('should generate animal-specific meta', () => {
      const meta = generateAnimalMeta({
        name: 'Buddy', species: 'dog', breed: 'Labrador', age: '3 years',
        shelter: 'Happy Paws', id: 'abc123',
      });
      expect(meta.title).toContain('Buddy');
      expect(meta.title).toContain('Labrador');
      expect(meta.description).toContain('Labrador');
      expect(meta.description).toContain('Happy Paws');
      expect(meta.canonical).toBe('/animals/abc123');
    });

    it('should handle missing optional fields', () => {
      const meta = generateAnimalMeta({ name: 'Luna', species: 'cat', id: 'xyz789' });
      expect(meta.title).toContain('Luna');
      expect(meta.title).toContain('cat');
    });
  });

  describe('Shelter Meta', () => {
    it('should generate shelter-specific meta', () => {
      const meta = generateShelterMeta({
        name: 'Happy Paws', city: 'Austin', state: 'TX', animalCount: 42, id: 'sh123',
      });
      expect(meta.title).toContain('Happy Paws');
      expect(meta.title).toContain('Austin, TX');
      expect(meta.description).toContain('42 animals');
    });

    it('should handle missing location', () => {
      const meta = generateShelterMeta({ name: 'Test Shelter', id: 'sh456' });
      expect(meta.title).toContain('Test Shelter');
    });
  });

  describe('Structured Data', () => {
    it('should generate animal schema', () => {
      const schema = generateAnimalSchema({ name: 'Buddy', species: 'dog' });
      expect(schema.type).toBe('Animal');
      expect(schema.data['@context']).toBe('https://schema.org');
      expect(schema.data['name']).toBe('Buddy');
    });

    it('should generate organization schema', () => {
      const schema = generateOrganizationSchema({ name: 'Happy Paws', phone: '555-1234' });
      expect(schema.type).toBe('Organization');
      expect(schema.data['@type']).toBe('Organization');
      expect(schema.data['telephone']).toBe('555-1234');
    });

    it('should generate event schema', () => {
      const schema = generateEventSchema({
        name: 'Adoption Day', startDate: '2026-03-01', location: 'Central Park',
      });
      expect(schema.type).toBe('Event');
      expect(schema.data['name']).toBe('Adoption Day');
    });

    it('should generate breadcrumb schema', () => {
      const schema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Animals', url: '/animals' },
      ]);
      expect(schema.type).toBe('BreadcrumbList');
      const items = schema.data['itemListElement'] as unknown[];
      expect(items).toHaveLength(2);
    });

    it('should generate website schema', () => {
      const schema = generateWebSiteSchema();
      expect(schema.type).toBe('WebSite');
      expect(schema.data['name']).toBe('Save A Stray');
    });

    it('should render JSON-LD', () => {
      const schema = generateWebSiteSchema();
      const json = renderJsonLd(schema);
      const parsed = JSON.parse(json);
      expect(parsed['@context']).toBe('https://schema.org');
    });
  });

  describe('Sitemap', () => {
    it('should define static pages', () => {
      expect(STATIC_PAGES.length).toBeGreaterThan(5);
    });

    it('should have homepage at priority 1.0', () => {
      const home = STATIC_PAGES.find(p => p.url === '/');
      expect(home!.priority).toBe(1.0);
    });

    it('should generate sitemap entries with dynamic pages', () => {
      const dynamic = [{ url: '/animals/buddy-abc123', lastmod: '2026-02-15' }];
      const entries = generateSitemapEntries(dynamic);
      expect(entries.length).toBe(STATIC_PAGES.length + 1);
    });

    it('should generate valid XML', () => {
      const entries = generateSitemapEntries([]);
      const xml = generateSitemapXml(entries, 'https://saveastray.com');
      expect(xml).toContain('<?xml version="1.0"');
      expect(xml).toContain('<urlset');
      expect(xml).toContain('<loc>https://saveastray.com/</loc>');
      expect(xml).toContain('</urlset>');
    });

    it('should include priority and changefreq', () => {
      const entries = generateSitemapEntries([]);
      const xml = generateSitemapXml(entries, 'https://saveastray.com');
      expect(xml).toContain('<priority>');
      expect(xml).toContain('<changefreq>');
    });
  });

  describe('Robots.txt', () => {
    it('should generate valid robots.txt', () => {
      const robots = generateRobotsTxt('https://saveastray.com');
      expect(robots).toContain('User-agent: *');
      expect(robots).toContain('Allow: /');
      expect(robots).toContain('Sitemap:');
    });

    it('should disallow API endpoints', () => {
      const robots = generateRobotsTxt('https://saveastray.com');
      expect(robots).toContain('Disallow: /api/');
      expect(robots).toContain('Disallow: /graphql');
    });

    it('should disallow admin and demo pages', () => {
      const robots = generateRobotsTxt('https://saveastray.com');
      expect(robots).toContain('Disallow: /admin/');
      expect(robots).toContain('Disallow: /demo/');
    });
  });

  describe('URL Slugs', () => {
    it('should generate basic slug', () => {
      expect(generateSlug('Hello World')).toBe('hello-world');
    });

    it('should remove special characters', () => {
      expect(generateSlug("Buddy's Adventure!")).toBe('buddys-adventure');
    });

    it('should collapse multiple hyphens', () => {
      expect(generateSlug('hello   ---   world')).toBe('hello-world');
    });

    it('should trim leading/trailing hyphens', () => {
      expect(generateSlug(' -hello- ')).toBe('hello');
    });

    it('should generate animal slug with ID suffix', () => {
      const slug = generateAnimalSlug({ name: 'Buddy', species: 'dog', id: 'abc123def456' });
      expect(slug).toBe('/animals/buddy-dog-def456');
    });

    it('should generate shelter slug with ID suffix', () => {
      const slug = generateShelterSlug({ name: 'Happy Paws Rescue', id: 'sh123456789' });
      expect(slug).toBe('/shelters/happy-paws-rescue-456789');
    });
  });

  describe('Social Sharing', () => {
    const shareConfig = {
      url: 'https://saveastray.com/animals/buddy',
      title: 'Meet Buddy',
      description: 'Buddy is looking for a forever home!',
    };

    it('should generate Facebook share URL', () => {
      const url = generateShareUrl('facebook', shareConfig);
      expect(url).toContain('facebook.com/sharer');
      expect(url).toContain(encodeURIComponent(shareConfig.url));
    });

    it('should generate Twitter share URL', () => {
      const url = generateShareUrl('twitter', shareConfig);
      expect(url).toContain('twitter.com/intent/tweet');
      expect(url).toContain(encodeURIComponent(shareConfig.url));
    });

    it('should generate LinkedIn share URL', () => {
      const url = generateShareUrl('linkedin', shareConfig);
      expect(url).toContain('linkedin.com/sharing');
    });

    it('should generate Pinterest share URL', () => {
      const url = generateShareUrl('pinterest', shareConfig);
      expect(url).toContain('pinterest.com/pin');
    });

    it('should generate email share URL', () => {
      const url = generateShareUrl('email', shareConfig);
      expect(url).toContain('mailto:');
    });

    it('should include hashtags in Twitter URL', () => {
      const url = generateShareUrl('twitter', { ...shareConfig, hashtags: ['AdoptDontShop', 'SaveAStray'] });
      expect(url).toContain('hashtags');
    });

    it('should return empty for unknown platform', () => {
      expect(generateShareUrl('unknown', shareConfig)).toBe('');
    });

    it('should list 5 supported platforms', () => {
      expect(getSupportedPlatforms()).toHaveLength(5);
    });
  });

  describe('Analytics Events', () => {
    it('should track events', () => {
      trackAnalyticsEvent({ category: 'adoption', action: 'view_animal' });
      const events = getAnalyticsEvents();
      expect(events).toHaveLength(1);
      expect(events[0].category).toBe('adoption');
    });

    it('should track multiple events', () => {
      trackAnalyticsEvent({ category: 'adoption', action: 'view' });
      trackAnalyticsEvent({ category: 'search', action: 'filter' });
      expect(getAnalyticsEvents()).toHaveLength(2);
    });

    it('should include timestamps', () => {
      trackAnalyticsEvent({ category: 'test', action: 'click' });
      const events = getAnalyticsEvents();
      expect(new Date(events[0].timestamp).getTime()).not.toBeNaN();
    });

    it('should calculate summary', () => {
      trackAnalyticsEvent({ category: 'adoption', action: 'view' });
      trackAnalyticsEvent({ category: 'adoption', action: 'apply' });
      trackAnalyticsEvent({ category: 'search', action: 'filter' });
      const summary = getAnalyticsSummary();
      expect(summary.totalEvents).toBe(3);
      expect(summary.topCategories[0].category).toBe('adoption');
      expect(summary.topCategories[0].count).toBe(2);
    });

    it('should handle empty analytics summary', () => {
      const summary = getAnalyticsSummary();
      expect(summary.totalEvents).toBe(0);
      expect(summary.topCategories).toHaveLength(0);
    });

    it('should clear analytics', () => {
      trackAnalyticsEvent({ category: 'test', action: 'click' });
      clearAnalyticsEvents();
      expect(getAnalyticsEvents()).toHaveLength(0);
    });

    it('should limit to 1000 entries', () => {
      for (let i = 0; i < 1050; i++) {
        trackAnalyticsEvent({ category: 'test', action: 'action' });
      }
      expect(getAnalyticsEvents().length).toBeLessThanOrEqual(1000);
    });
  });

  describe('Page Speed Hints', () => {
    it('should define at least 10 hints', () => {
      expect(PAGE_SPEED_HINTS.length).toBeGreaterThanOrEqual(10);
    });

    it('should have valid categories', () => {
      PAGE_SPEED_HINTS.forEach(hint => {
        expect(['performance', 'accessibility', 'seo', 'best-practices']).toContain(hint.category);
      });
    });

    it('should have valid impact levels', () => {
      PAGE_SPEED_HINTS.forEach(hint => {
        expect(['high', 'medium', 'low']).toContain(hint.impact);
      });
    });

    it('should filter by category', () => {
      const perf = getPageSpeedHints('performance');
      perf.forEach(h => expect(h.category).toBe('performance'));
    });

    it('should return all when no filter', () => {
      expect(getPageSpeedHints()).toHaveLength(PAGE_SPEED_HINTS.length);
    });

    it('should get high impact hints', () => {
      const high = getHighImpactHints();
      high.forEach(h => expect(h.impact).toBe('high'));
      expect(high.length).toBeGreaterThan(3);
    });
  });
});
