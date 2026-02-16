import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateIframeCode,
  generateScriptCode,
  generateWidgetCss,
  isValidHexColor,
  lightenColor,
  getContrastColor,
  trackWidgetEvent,
  getWidgetEvents,
  getWidgetStats,
  clearWidgetAnalytics,
  mergeCustomization,
  validateCustomization,
  calculateResponsiveColumns,
  calculateItemHeight,
  DEFAULT_CUSTOMIZATION,
  WIDGET_TYPES,
} from '../lib/widget-sdk';

describe('Widget SDK', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Embed Code Generation', () => {
    it('should generate iframe code with token', () => {
      const code = generateIframeCode('sas_embed_abc123', 'https://saveastray.com');
      expect(code).toContain('src="https://saveastray.com/embed/sas_embed_abc123"');
      expect(code).toContain('<iframe');
      expect(code).toContain('border:none');
    });

    it('should use custom max width', () => {
      const code = generateIframeCode('token', 'https://example.com', 600);
      expect(code).toContain('max-width:600px');
    });

    it('should generate script code with data attributes', () => {
      const code = generateScriptCode('sas_embed_abc12345', 'https://saveastray.com', {
        type: 'pet_listing',
        displayMode: 'grid',
        primaryColor: '#4A90D9',
      });
      expect(code).toContain('data-token="sas_embed_abc12345"');
      expect(code).toContain('data-type="pet_listing"');
      expect(code).toContain('data-display="grid"');
      expect(code).toContain('data-color="#4A90D9"');
      expect(code).toContain('sas-widget-');
    });

    it('should use last 8 chars of token for container ID', () => {
      const code = generateScriptCode('sas_embed_12345678', 'https://x.com', {
        type: 'search', displayMode: 'list', primaryColor: '#000',
      });
      expect(code).toContain('id="sas-widget-12345678"');
    });
  });

  describe('CSS Generation', () => {
    it('should generate CSS with customization values', () => {
      const css = generateWidgetCss(DEFAULT_CUSTOMIZATION);
      expect(css).toContain(`max-width: ${DEFAULT_CUSTOMIZATION.maxWidth}px`);
      expect(css).toContain(`background-color: ${DEFAULT_CUSTOMIZATION.backgroundColor}`);
      expect(css).toContain(`color: ${DEFAULT_CUSTOMIZATION.textColor}`);
      expect(css).toContain(`border-radius: ${DEFAULT_CUSTOMIZATION.borderRadius}px`);
    });

    it('should use primary color for links and buttons', () => {
      const css = generateWidgetCss({ ...DEFAULT_CUSTOMIZATION, primaryColor: '#FF0000' });
      expect(css).toContain('color: #FF0000');
      expect(css).toContain('background-color: #FF0000');
    });
  });

  describe('Color Utilities', () => {
    it('should validate hex colors', () => {
      expect(isValidHexColor('#4A90D9')).toBe(true);
      expect(isValidHexColor('#fff')).toBe(true);
      expect(isValidHexColor('#AABBCC')).toBe(true);
      expect(isValidHexColor('red')).toBe(false);
      expect(isValidHexColor('#GGG')).toBe(false);
      expect(isValidHexColor('4A90D9')).toBe(false);
    });

    it('should lighten colors', () => {
      const lighter = lightenColor('#000000', 50);
      expect(lighter).not.toBe('#000000');
      expect(lighter.startsWith('#')).toBe(true);
    });

    it('should return white text for dark backgrounds', () => {
      expect(getContrastColor('#000000')).toBe('#FFFFFF');
    });

    it('should return black text for light backgrounds', () => {
      expect(getContrastColor('#FFFFFF')).toBe('#000000');
    });
  });

  describe('Widget Analytics', () => {
    it('should track widget events', () => {
      trackWidgetEvent('w1', 'impression');
      trackWidgetEvent('w1', 'click');
      const events = getWidgetEvents('w1');
      expect(events).toHaveLength(2);
    });

    it('should filter events by widget ID', () => {
      trackWidgetEvent('w1', 'impression');
      trackWidgetEvent('w2', 'click');
      expect(getWidgetEvents('w1')).toHaveLength(1);
      expect(getWidgetEvents('w2')).toHaveLength(1);
    });

    it('should return all events without filter', () => {
      trackWidgetEvent('w1', 'impression');
      trackWidgetEvent('w2', 'click');
      expect(getWidgetEvents()).toHaveLength(2);
    });

    it('should include timestamp', () => {
      trackWidgetEvent('w1', 'impression');
      const events = getWidgetEvents('w1');
      expect(new Date(events[0].timestamp).getTime()).not.toBeNaN();
    });

    it('should include metadata', () => {
      trackWidgetEvent('w1', 'click', { animalId: 'a1' });
      const events = getWidgetEvents('w1');
      expect(events[0].metadata).toEqual({ animalId: 'a1' });
    });

    it('should limit stored events to 1000', () => {
      for (let i = 0; i < 1100; i++) {
        trackWidgetEvent('w1', 'impression');
      }
      const events = getWidgetEvents();
      expect(events.length).toBeLessThanOrEqual(1000);
    });

    it('should clear analytics', () => {
      trackWidgetEvent('w1', 'impression');
      clearWidgetAnalytics();
      expect(getWidgetEvents()).toHaveLength(0);
    });
  });

  describe('Widget Stats', () => {
    it('should calculate stats from events', () => {
      trackWidgetEvent('w1', 'impression');
      trackWidgetEvent('w1', 'impression');
      trackWidgetEvent('w1', 'click');
      trackWidgetEvent('w1', 'application');

      const stats = getWidgetStats('w1');
      expect(stats.impressions).toBe(2);
      expect(stats.clicks).toBe(1);
      expect(stats.applications).toBe(1);
      expect(stats.ctr).toBe(0.5);
      expect(stats.conversionRate).toBe(1);
    });

    it('should return zeros for no events', () => {
      const stats = getWidgetStats('nonexistent');
      expect(stats.impressions).toBe(0);
      expect(stats.clicks).toBe(0);
      expect(stats.ctr).toBe(0);
    });
  });

  describe('Customization', () => {
    it('should merge with defaults', () => {
      const result = mergeCustomization({ primaryColor: '#FF0000' });
      expect(result.primaryColor).toBe('#FF0000');
      expect(result.backgroundColor).toBe(DEFAULT_CUSTOMIZATION.backgroundColor);
      expect(result.maxWidth).toBe(DEFAULT_CUSTOMIZATION.maxWidth);
    });

    it('should validate colors', () => {
      const errors = validateCustomization({ primaryColor: 'not-a-color' });
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('Primary color');
    });

    it('should validate border radius range', () => {
      expect(validateCustomization({ borderRadius: -1 }).length).toBeGreaterThan(0);
      expect(validateCustomization({ borderRadius: 51 }).length).toBeGreaterThan(0);
      expect(validateCustomization({ borderRadius: 10 })).toHaveLength(0);
    });

    it('should validate max width range', () => {
      expect(validateCustomization({ maxWidth: 100 }).length).toBeGreaterThan(0);
      expect(validateCustomization({ maxWidth: 3000 }).length).toBeGreaterThan(0);
      expect(validateCustomization({ maxWidth: 800 })).toHaveLength(0);
    });

    it('should validate items per page range', () => {
      expect(validateCustomization({ itemsPerPage: 0 }).length).toBeGreaterThan(0);
      expect(validateCustomization({ itemsPerPage: 100 }).length).toBeGreaterThan(0);
      expect(validateCustomization({ itemsPerPage: 12 })).toHaveLength(0);
    });

    it('should accept valid customization', () => {
      const errors = validateCustomization({
        primaryColor: '#4A90D9',
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        maxWidth: 800,
        itemsPerPage: 12,
      });
      expect(errors).toHaveLength(0);
    });
  });

  describe('Responsive Sizing', () => {
    it('should return 1 column for narrow containers', () => {
      expect(calculateResponsiveColumns(350, 'grid')).toBe(1);
    });

    it('should return 2 columns for medium containers', () => {
      expect(calculateResponsiveColumns(500, 'grid')).toBe(2);
    });

    it('should return 3 columns for wider containers', () => {
      expect(calculateResponsiveColumns(700, 'grid')).toBe(3);
    });

    it('should return 4 columns for large containers', () => {
      expect(calculateResponsiveColumns(1000, 'grid')).toBe(4);
    });

    it('should return 1 column for list mode', () => {
      expect(calculateResponsiveColumns(1000, 'list')).toBe(1);
    });

    it('should return 1 column for carousel mode', () => {
      expect(calculateResponsiveColumns(1000, 'carousel')).toBe(1);
    });
  });

  describe('Item Height', () => {
    it('should return taller height for grid with images', () => {
      expect(calculateItemHeight('grid', true)).toBe(320);
    });

    it('should return shorter height for grid without images', () => {
      expect(calculateItemHeight('grid', false)).toBe(120);
    });

    it('should return compact height for list with images', () => {
      expect(calculateItemHeight('list', true)).toBe(100);
    });

    it('should return minimal height for list without images', () => {
      expect(calculateItemHeight('list', false)).toBe(60);
    });
  });

  describe('Widget Types', () => {
    it('should define 4 widget types', () => {
      expect(Object.keys(WIDGET_TYPES)).toHaveLength(4);
    });

    it('should include pet_listing with grid support', () => {
      expect(WIDGET_TYPES.pet_listing.displayModes).toContain('grid');
      expect(WIDGET_TYPES.pet_listing.displayModes).toContain('carousel');
      expect(WIDGET_TYPES.pet_listing.displayModes).toContain('list');
    });

    it('should include search type', () => {
      expect(WIDGET_TYPES.search.supportedFilters).toContain('type');
      expect(WIDGET_TYPES.search.supportedFilters).toContain('breed');
    });

    it('should include shelter profile type', () => {
      expect(WIDGET_TYPES.shelter_profile.name).toBe('Shelter Profile');
    });

    it('should include adopt button type', () => {
      expect(WIDGET_TYPES.adopt_button.name).toBe('Adopt Me Button');
    });
  });

  describe('Default Customization', () => {
    it('should have reasonable defaults', () => {
      expect(DEFAULT_CUSTOMIZATION.primaryColor).toMatch(/^#/);
      expect(DEFAULT_CUSTOMIZATION.maxWidth).toBeGreaterThan(0);
      expect(DEFAULT_CUSTOMIZATION.itemsPerPage).toBeGreaterThan(0);
      expect(DEFAULT_CUSTOMIZATION.showImages).toBe(true);
    });
  });
});
