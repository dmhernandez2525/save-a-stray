import { NextFunction, Request, Response } from 'express';
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ApiKeyDocument extends Document {
  key: string;
  name: string;
  ownerId: string;
  tier: 'free' | 'basic' | 'premium';
  rateLimit: number;
  enabled: boolean;
  usageCount: number;
  lastUsedAt: Date;
  createdAt: Date;
  expiresAt?: Date;
  scopes: string[];
}

const ApiKeySchema = new Schema<ApiKeyDocument>({
  key: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  ownerId: { type: String, required: true, index: true },
  tier: { type: String, enum: ['free', 'basic', 'premium'], default: 'free' },
  rateLimit: { type: Number, default: 100 },
  enabled: { type: Boolean, default: true },
  usageCount: { type: Number, default: 0 },
  lastUsedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
  scopes: { type: [String], default: ['read:animals', 'read:shelters'] },
});

export const ApiKeyModel: Model<ApiKeyDocument> = mongoose.models.apiKey || mongoose.model<ApiKeyDocument>('apiKey', ApiKeySchema);

const TIER_LIMITS: Record<string, number> = {
  free: 100,
  basic: 1000,
  premium: 10000,
};

interface RateWindow {
  count: number;
  resetAt: number;
}

const rateWindows = new Map<string, RateWindow>();

export function getRateLimitForTier(tier: string): number {
  return TIER_LIMITS[tier] ?? 100;
}

export const apiKeyAuthMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const apiKey = req.headers['x-api-key'] as string | undefined;

  if (!apiKey) {
    res.status(401).json({ error: 'API key required. Include X-API-Key header.' });
    return;
  }

  try {
    const keyDoc = await ApiKeyModel.findOne({ key: apiKey }).lean();

    if (!keyDoc) {
      res.status(401).json({ error: 'Invalid API key.' });
      return;
    }

    if (!keyDoc.enabled) {
      res.status(403).json({ error: 'API key is disabled.' });
      return;
    }

    if (keyDoc.expiresAt && new Date(keyDoc.expiresAt) < new Date()) {
      res.status(403).json({ error: 'API key has expired.' });
      return;
    }

    // Rate limiting per key per hour
    const now = Date.now();
    const hourMs = 60 * 60 * 1000;
    const windowKey = keyDoc.key;
    const limit = keyDoc.rateLimit || getRateLimitForTier(keyDoc.tier);

    let window = rateWindows.get(windowKey);
    if (!window || window.resetAt <= now) {
      window = { count: 0, resetAt: now + hourMs };
      rateWindows.set(windowKey, window);
    }

    window.count++;

    res.setHeader('X-RateLimit-Limit', String(limit));
    res.setHeader('X-RateLimit-Remaining', String(Math.max(0, limit - window.count)));
    res.setHeader('X-RateLimit-Reset', String(Math.ceil(window.resetAt / 1000)));

    if (window.count > limit) {
      res.status(429).json({
        error: 'Rate limit exceeded.',
        limit,
        resetAt: new Date(window.resetAt).toISOString(),
      });
      return;
    }

    // Update usage stats (fire and forget)
    ApiKeyModel.updateOne({ _id: keyDoc._id }, { $inc: { usageCount: 1 }, lastUsedAt: new Date() }).exec();

    // Attach key info to request for scope checking
    (req as unknown as Record<string, unknown>).apiKeyDoc = keyDoc;

    next();
  } catch {
    res.status(500).json({ error: 'Internal server error during authentication.' });
  }
};

export function hasScope(req: Request, scope: string): boolean {
  const keyDoc = (req as unknown as Record<string, unknown>).apiKeyDoc as ApiKeyDocument | undefined;
  if (!keyDoc) return false;
  return keyDoc.scopes.includes(scope) || keyDoc.scopes.includes('*');
}
