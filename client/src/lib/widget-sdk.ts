// ── Save A Stray Widget SDK ──────────────────────────────────
// Embeddable widget system for external sites

export interface WidgetConfig {
  token: string;
  type: 'pet_listing' | 'shelter_profile' | 'adopt_button' | 'search';
  displayMode: 'grid' | 'carousel' | 'list';
  container: string | HTMLElement;
  baseUrl?: string;
  primaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  borderRadius?: number;
  maxWidth?: number;
  showImages?: boolean;
  showStatus?: boolean;
  itemsPerPage?: number;
  onLoad?: () => void;
  onClick?: (animalId: string) => void;
  onError?: (error: string) => void;
}

export interface WidgetCustomization {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: number;
  maxWidth: number;
  showImages: boolean;
  showStatus: boolean;
  itemsPerPage: number;
}

export const DEFAULT_CUSTOMIZATION: WidgetCustomization = {
  primaryColor: '#4A90D9',
  backgroundColor: '#FFFFFF',
  textColor: '#333333',
  borderRadius: 8,
  maxWidth: 800,
  showImages: true,
  showStatus: true,
  itemsPerPage: 12,
};

// ── Widget Type Definitions ───────────────────────────────────

export const WIDGET_TYPES = {
  pet_listing: {
    name: 'Pet Listing',
    description: 'Display available pets in a grid, carousel, or list layout',
    displayModes: ['grid', 'carousel', 'list'] as const,
    supportedFilters: ['status', 'type', 'breed'] as const,
  },
  shelter_profile: {
    name: 'Shelter Profile',
    description: 'Show shelter information, available animal count, and contact details',
    displayModes: ['list'] as const,
    supportedFilters: [] as const,
  },
  adopt_button: {
    name: 'Adopt Me Button',
    description: 'Single animal adoption button for embedding on external sites',
    displayModes: ['list'] as const,
    supportedFilters: [] as const,
  },
  search: {
    name: 'Pet Search',
    description: 'Embeddable search interface for finding available pets',
    displayModes: ['grid', 'list'] as const,
    supportedFilters: ['status', 'type', 'breed'] as const,
  },
} as const;

// ── Embed Code Generation ─────────────────────────────────────

export function generateIframeCode(token: string, baseUrl: string, maxWidth: number = 800): string {
  const src = `${baseUrl}/embed/${token}`;
  return `<iframe src="${src}" width="100%" height="600" style="max-width:${maxWidth}px;border:none;" title="Save A Stray Widget"></iframe>`;
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function generateScriptCode(token: string, baseUrl: string, options: {
  type: string;
  displayMode: string;
  primaryColor: string;
}): string {
  const containerId = `sas-widget-${escapeAttr(token.slice(-8))}`;
  return `<div id="${containerId}"></div>\n<script src="${escapeAttr(baseUrl)}/sdk/widget.js" data-token="${escapeAttr(token)}" data-type="${escapeAttr(options.type)}" data-display="${escapeAttr(options.displayMode)}" data-color="${escapeAttr(options.primaryColor)}"></script>`;
}

// ── CSS Generation ────────────────────────────────────────────

export function generateWidgetCss(customization: WidgetCustomization): string {
  return `.sas-widget {
  max-width: ${customization.maxWidth}px;
  background-color: ${customization.backgroundColor};
  color: ${customization.textColor};
  border-radius: ${customization.borderRadius}px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
.sas-widget a { color: ${customization.primaryColor}; }
.sas-widget .sas-btn { background-color: ${customization.primaryColor}; color: #fff; border-radius: ${customization.borderRadius}px; }`;
}

// ── Color Validation ──────────────────────────────────────────

export function isValidHexColor(color: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color);
}

function normalizeHex(hex: string): string {
  const raw = hex.replace('#', '');
  if (raw.length === 3) {
    return `#${raw[0]}${raw[0]}${raw[1]}${raw[1]}${raw[2]}${raw[2]}`;
  }
  return `#${raw}`;
}

export function lightenColor(hex: string, percent: number): string {
  const normalized = normalizeHex(hex);
  const num = parseInt(normalized.replace('#', ''), 16);
  const r = Math.min(255, Math.floor(((num >> 16) & 255) + (255 - ((num >> 16) & 255)) * (percent / 100)));
  const g = Math.min(255, Math.floor(((num >> 8) & 255) + (255 - ((num >> 8) & 255)) * (percent / 100)));
  const b = Math.min(255, Math.floor((num & 255) + (255 - (num & 255)) * (percent / 100)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export function getContrastColor(hex: string): string {
  const normalized = normalizeHex(hex);
  const num = parseInt(normalized.replace('#', ''), 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

// ── Widget Analytics ──────────────────────────────────────────

const ANALYTICS_KEY = 'sas_widget_analytics';

interface WidgetAnalyticsEntry {
  widgetId: string;
  eventType: 'impression' | 'click' | 'application' | 'search';
  timestamp: string;
  metadata?: Record<string, string>;
}

export function trackWidgetEvent(widgetId: string, eventType: WidgetAnalyticsEntry['eventType'], metadata?: Record<string, string>): void {
  try {
    const data = localStorage.getItem(ANALYTICS_KEY);
    const entries: WidgetAnalyticsEntry[] = data ? JSON.parse(data) : [];
    entries.push({ widgetId, eventType, timestamp: new Date().toISOString(), metadata });
    if (entries.length > 1000) entries.splice(0, entries.length - 1000);
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(entries));
  } catch {
    // Silent fail if localStorage unavailable
  }
}

export function getWidgetEvents(widgetId?: string): WidgetAnalyticsEntry[] {
  try {
    const data = localStorage.getItem(ANALYTICS_KEY);
    const entries: WidgetAnalyticsEntry[] = data ? JSON.parse(data) : [];
    return widgetId ? entries.filter(e => e.widgetId === widgetId) : entries;
  } catch {
    return [];
  }
}

export function getWidgetStats(widgetId: string): {
  impressions: number;
  clicks: number;
  applications: number;
  ctr: number;
  conversionRate: number;
} {
  const events = getWidgetEvents(widgetId);
  const impressions = events.filter(e => e.eventType === 'impression').length;
  const clicks = events.filter(e => e.eventType === 'click').length;
  const applications = events.filter(e => e.eventType === 'application').length;

  return {
    impressions,
    clicks,
    applications,
    ctr: impressions > 0 ? Math.round((clicks / impressions) * 10000) / 10000 : 0,
    conversionRate: clicks > 0 ? Math.round((applications / clicks) * 10000) / 10000 : 0,
  };
}

export function clearWidgetAnalytics(): void {
  localStorage.removeItem(ANALYTICS_KEY);
}

// ── Widget Builder Preview ────────────────────────────────────

export function mergeCustomization(overrides: Partial<WidgetCustomization>): WidgetCustomization {
  return { ...DEFAULT_CUSTOMIZATION, ...overrides };
}

export function validateCustomization(config: Partial<WidgetCustomization>): string[] {
  const errors: string[] = [];

  if (config.primaryColor && !isValidHexColor(config.primaryColor)) {
    errors.push('Primary color must be a valid hex color (e.g., #4A90D9)');
  }
  if (config.backgroundColor && !isValidHexColor(config.backgroundColor)) {
    errors.push('Background color must be a valid hex color');
  }
  if (config.textColor && !isValidHexColor(config.textColor)) {
    errors.push('Text color must be a valid hex color');
  }
  if (config.borderRadius !== undefined && (config.borderRadius < 0 || config.borderRadius > 50)) {
    errors.push('Border radius must be between 0 and 50');
  }
  if (config.maxWidth !== undefined && (config.maxWidth < 200 || config.maxWidth > 2000)) {
    errors.push('Max width must be between 200 and 2000');
  }
  if (config.itemsPerPage !== undefined && (config.itemsPerPage < 1 || config.itemsPerPage > 50)) {
    errors.push('Items per page must be between 1 and 50');
  }

  return errors;
}

// ── Responsive Size Calculation ───────────────────────────────

export function calculateResponsiveColumns(containerWidth: number, displayMode: string): number {
  if (displayMode === 'list' || displayMode === 'carousel') return 1;
  if (containerWidth < 400) return 1;
  if (containerWidth < 600) return 2;
  if (containerWidth < 900) return 3;
  return 4;
}

export function calculateItemHeight(displayMode: string, showImages: boolean): number {
  if (displayMode === 'list') return showImages ? 100 : 60;
  return showImages ? 320 : 120;
}
