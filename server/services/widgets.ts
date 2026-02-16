import mongoose, { Schema, Document, Model } from 'mongoose';
import crypto from 'crypto';

// ── Widget Model ──────────────────────────────────────────────

export interface WidgetDocument extends Document {
  shelterId: string;
  name: string;
  widgetType: 'pet_listing' | 'shelter_profile' | 'adopt_button' | 'search';
  displayMode: 'grid' | 'carousel' | 'list';
  customization: {
    primaryColor: string;
    backgroundColor: string;
    textColor: string;
    borderRadius: number;
    maxWidth: number;
    showImages: boolean;
    showStatus: boolean;
    itemsPerPage: number;
  };
  filters: {
    status?: string;
    type?: string;
    breed?: string;
  };
  embedToken: string;
  enabled: boolean;
  version: number;
  impressionCount: number;
  clickCount: number;
  applicationCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const WidgetSchema = new Schema<WidgetDocument>({
  shelterId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  widgetType: {
    type: String,
    required: true,
    enum: ['pet_listing', 'shelter_profile', 'adopt_button', 'search'],
  },
  displayMode: { type: String, enum: ['grid', 'carousel', 'list'], default: 'grid' },
  customization: {
    primaryColor: { type: String, default: '#4A90D9' },
    backgroundColor: { type: String, default: '#FFFFFF' },
    textColor: { type: String, default: '#333333' },
    borderRadius: { type: Number, default: 8 },
    maxWidth: { type: Number, default: 800 },
    showImages: { type: Boolean, default: true },
    showStatus: { type: Boolean, default: true },
    itemsPerPage: { type: Number, default: 12 },
  },
  filters: {
    status: { type: String },
    type: { type: String },
    breed: { type: String },
  },
  embedToken: { type: String, required: true, unique: true },
  enabled: { type: Boolean, default: true },
  version: { type: Number, default: 1 },
  impressionCount: { type: Number, default: 0 },
  clickCount: { type: Number, default: 0 },
  applicationCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const WidgetModel: Model<WidgetDocument> =
  mongoose.models.widget || mongoose.model<WidgetDocument>('widget', WidgetSchema);

// ── Widget Analytics Model ────────────────────────────────────

export interface WidgetEventDocument extends Document {
  widgetId: string;
  eventType: 'impression' | 'click' | 'application' | 'search';
  metadata: string;
  referrer: string;
  userAgent: string;
  createdAt: Date;
}

const WidgetEventSchema = new Schema<WidgetEventDocument>({
  widgetId: { type: String, required: true, index: true },
  eventType: { type: String, required: true, enum: ['impression', 'click', 'application', 'search'] },
  metadata: { type: String, default: '{}' },
  referrer: { type: String, default: '' },
  userAgent: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

export const WidgetEventModel: Model<WidgetEventDocument> =
  mongoose.models.widgetEvent || mongoose.model<WidgetEventDocument>('widgetEvent', WidgetEventSchema);

// ── Widget Type Configs ───────────────────────────────────────

export const WIDGET_TYPES = {
  pet_listing: {
    name: 'Pet Listing',
    description: 'Display available pets in a grid, carousel, or list layout',
    displayModes: ['grid', 'carousel', 'list'],
    supportedFilters: ['status', 'type', 'breed'],
  },
  shelter_profile: {
    name: 'Shelter Profile',
    description: 'Show shelter information, available animal count, and contact details',
    displayModes: ['list'],
    supportedFilters: [],
  },
  adopt_button: {
    name: 'Adopt Me Button',
    description: 'Single animal adoption button for embedding on external sites',
    displayModes: ['list'],
    supportedFilters: [],
  },
  search: {
    name: 'Pet Search',
    description: 'Embeddable search interface for finding available pets',
    displayModes: ['grid', 'list'],
    supportedFilters: ['status', 'type', 'breed'],
  },
} as const;

// ── Embed Token Generation ────────────────────────────────────

export function generateEmbedToken(): string {
  return `sas_embed_${crypto.randomBytes(24).toString('hex')}`;
}

// ── Embed Code Generation ─────────────────────────────────────

export function generateEmbedCode(widget: {
  embedToken: string;
  widgetType: string;
  displayMode: string;
  customization: {
    maxWidth: number;
    primaryColor: string;
  };
}, baseUrl: string): { iframe: string; script: string } {
  const iframeSrc = `${baseUrl}/embed/${widget.embedToken}`;
  const iframe = `<iframe src="${iframeSrc}" width="100%" height="600" style="max-width:${widget.customization.maxWidth}px;border:none;" title="Save A Stray - ${widget.widgetType}"></iframe>`;

  const script = `<div id="sas-widget-${widget.embedToken.slice(-8)}"></div>\n<script src="${baseUrl}/sdk/widget.js" data-token="${widget.embedToken}" data-type="${widget.widgetType}" data-display="${widget.displayMode}" data-color="${widget.customization.primaryColor}"></script>`;

  return { iframe, script };
}

// ── Widget CSS Generation ─────────────────────────────────────

export function generateWidgetCss(customization: {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: number;
  maxWidth: number;
}): string {
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

// ── Analytics Aggregation ─────────────────────────────────────

export async function getWidgetAnalytics(widgetId: string, days: number = 30): Promise<{
  impressions: number;
  clicks: number;
  applications: number;
  ctr: number;
  conversionRate: number;
  dailyBreakdown: { date: string; impressions: number; clicks: number }[];
}> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const events = await WidgetEventModel.find({
    widgetId,
    createdAt: { $gte: since },
  }).lean();

  const impressions = events.filter(e => e.eventType === 'impression').length;
  const clicks = events.filter(e => e.eventType === 'click').length;
  const applications = events.filter(e => e.eventType === 'application').length;

  const dailyMap = new Map<string, { impressions: number; clicks: number }>();
  for (const event of events) {
    const date = event.createdAt.toISOString().split('T')[0];
    const entry = dailyMap.get(date) || { impressions: 0, clicks: 0 };
    if (event.eventType === 'impression') entry.impressions++;
    if (event.eventType === 'click') entry.clicks++;
    dailyMap.set(date, entry);
  }

  const dailyBreakdown = Array.from(dailyMap.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    impressions,
    clicks,
    applications,
    ctr: impressions > 0 ? Math.round((clicks / impressions) * 10000) / 10000 : 0,
    conversionRate: clicks > 0 ? Math.round((applications / clicks) * 10000) / 10000 : 0,
    dailyBreakdown,
  };
}
