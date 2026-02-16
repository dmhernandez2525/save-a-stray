import mongoose, { Schema, Document, Model } from 'mongoose';

// ── Webhook Model ──────────────────────────────────────────────

export interface WebhookDocument extends Document {
  shelterId: string;
  url: string;
  events: string[];
  secret: string;
  enabled: boolean;
  failureCount: number;
  lastDeliveredAt?: Date;
  lastFailedAt?: Date;
  createdAt: Date;
}

const WebhookSchema = new Schema<WebhookDocument>({
  shelterId: { type: String, required: true, index: true },
  url: { type: String, required: true },
  events: { type: [String], default: ['animal.created'] },
  secret: { type: String, required: true },
  enabled: { type: Boolean, default: true },
  failureCount: { type: Number, default: 0 },
  lastDeliveredAt: { type: Date },
  lastFailedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

export const WebhookModel: Model<WebhookDocument> =
  mongoose.models.webhook || mongoose.model<WebhookDocument>('webhook', WebhookSchema);

// ── Integration Config Model ──────────────────────────────────

export interface IntegrationConfigDocument extends Document {
  shelterId: string;
  platform: 'petfinder' | 'adoptapet' | 'facebook' | 'instagram' | 'google_calendar';
  enabled: boolean;
  credentials: string;
  lastSyncAt?: Date;
  lastSyncStatus: 'success' | 'failed' | 'pending' | 'never';
  syncIntervalMinutes: number;
  errorCount: number;
  lastError?: string;
  createdAt: Date;
}

const IntegrationConfigSchema = new Schema<IntegrationConfigDocument>({
  shelterId: { type: String, required: true, index: true },
  platform: {
    type: String,
    required: true,
    enum: ['petfinder', 'adoptapet', 'facebook', 'instagram', 'google_calendar'],
  },
  enabled: { type: Boolean, default: false },
  credentials: { type: String, default: '' },
  lastSyncAt: { type: Date },
  lastSyncStatus: { type: String, enum: ['success', 'failed', 'pending', 'never'], default: 'never' },
  syncIntervalMinutes: { type: Number, default: 5 },
  errorCount: { type: Number, default: 0 },
  lastError: { type: String },
  createdAt: { type: Date, default: Date.now },
});

IntegrationConfigSchema.index({ shelterId: 1, platform: 1 }, { unique: true });

export const IntegrationConfigModel: Model<IntegrationConfigDocument> =
  mongoose.models.integrationConfig || mongoose.model<IntegrationConfigDocument>('integrationConfig', IntegrationConfigSchema);

// ── Webhook Delivery Log ──────────────────────────────────────

export interface WebhookDeliveryDocument extends Document {
  webhookId: string;
  event: string;
  payload: string;
  statusCode: number;
  success: boolean;
  responseTime: number;
  attempt: number;
  deliveredAt: Date;
}

const WebhookDeliverySchema = new Schema<WebhookDeliveryDocument>({
  webhookId: { type: String, required: true, index: true },
  event: { type: String, required: true },
  payload: { type: String, default: '' },
  statusCode: { type: Number, default: 0 },
  success: { type: Boolean, default: false },
  responseTime: { type: Number, default: 0 },
  attempt: { type: Number, default: 1 },
  deliveredAt: { type: Date, default: Date.now },
});

export const WebhookDeliveryModel: Model<WebhookDeliveryDocument> =
  mongoose.models.webhookDelivery || mongoose.model<WebhookDeliveryDocument>('webhookDelivery', WebhookDeliverySchema);

// ── Integration Service Functions ──────────────────────────────

export const WEBHOOK_EVENTS = [
  'animal.created',
  'animal.updated',
  'animal.adopted',
  'application.submitted',
  'application.approved',
  'application.rejected',
  'shelter.updated',
  'event.created',
  'donation.received',
] as const;

export type WebhookEvent = typeof WEBHOOK_EVENTS[number];

export const PLATFORM_CONFIGS = {
  petfinder: {
    name: 'Petfinder',
    description: 'Sync available animals to Petfinder listings',
    requiredFields: ['api_key', 'api_secret'],
    syncCapabilities: ['animals'],
  },
  adoptapet: {
    name: 'Adopt-a-Pet',
    description: 'Publish available animals to Adopt-a-Pet',
    requiredFields: ['shelter_id', 'ftp_password'],
    syncCapabilities: ['animals'],
  },
  facebook: {
    name: 'Facebook',
    description: 'Auto-post new animals to Facebook page',
    requiredFields: ['page_id', 'access_token'],
    syncCapabilities: ['posts'],
  },
  instagram: {
    name: 'Instagram',
    description: 'Share new animal photos to Instagram',
    requiredFields: ['account_id', 'access_token'],
    syncCapabilities: ['posts'],
  },
  google_calendar: {
    name: 'Google Calendar',
    description: 'Sync shelter events to Google Calendar',
    requiredFields: ['calendar_id', 'service_account_key'],
    syncCapabilities: ['events'],
  },
} as const;

/**
 * Map animal data to Petfinder format.
 */
export function mapToPetfinder(animal: {
  name: string;
  type: string;
  breed?: string;
  age: number;
  sex: string;
  description: string;
  status: string;
  image?: string;
}): Record<string, unknown> {
  const ageCategory = animal.age < 1 ? 'Baby' : animal.age < 3 ? 'Young' : animal.age < 8 ? 'Adult' : 'Senior';
  return {
    type: animal.type === 'dog' ? 'Dog' : animal.type === 'cat' ? 'Cat' : 'Other',
    breed: { primary: animal.breed || 'Mixed' },
    age: ageCategory,
    gender: animal.sex === 'male' ? 'Male' : 'Female',
    name: animal.name,
    description: animal.description,
    status: animal.status === 'available' ? 'adoptable' : 'not adoptable',
    photos: animal.image ? [{ full: animal.image }] : [],
  };
}

/**
 * Map animal data to Adopt-a-Pet CSV format.
 */
export function mapToAdoptAPet(animal: {
  name: string;
  type: string;
  breed?: string;
  age: number;
  sex: string;
  description: string;
  image?: string;
}): string {
  const fields = [
    animal.name,
    animal.type,
    animal.breed || 'Mixed',
    String(animal.age),
    animal.sex,
    animal.description.replace(/,/g, ';').replace(/\n/g, ' '),
    animal.image || '',
  ];
  return fields.join(',');
}

/**
 * Generate a social media post for a new animal.
 */
export function generateSocialPost(animal: {
  name: string;
  type: string;
  breed?: string;
  age: number;
}): { text: string; hashtags: string[] } {
  const ageStr = animal.age < 1 ? 'baby' : `${animal.age} year old`;
  const breedStr = animal.breed ? ` ${animal.breed}` : '';
  const text = `Meet ${animal.name}! This adorable ${ageStr}${breedStr} ${animal.type} is looking for a forever home. Visit our shelter to learn more!`;
  const hashtags = ['#AdoptDontShop', '#SaveAStray', `#${animal.type}sOfInstagram`, '#PetAdoption', '#RescuePet'];
  return { text, hashtags };
}

/**
 * Calculate exponential backoff delay for retry.
 */
export function calculateRetryDelay(attempt: number, baseDelayMs: number = 1000, maxDelayMs: number = 60000): number {
  const delay = Math.min(baseDelayMs * Math.pow(2, attempt - 1), maxDelayMs);
  // Add jitter (10% random variance)
  const jitter = delay * 0.1 * Math.random();
  return Math.round(delay + jitter);
}
