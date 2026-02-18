import mongoose, { Document, Model, Schema } from 'mongoose';

export interface AuthSessionDocument extends Document {
  userId: mongoose.Types.ObjectId;
  refreshTokenHash: string;
  deviceFingerprint: string;
  userAgent?: string;
  ipAddress?: string;
  createdAt: Date;
  lastUsedAt: Date;
  expiresAt: Date;
  revokedAt?: Date;
  revokedReason?: string;
}

const AuthSessionSchema = new Schema<AuthSessionDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
    index: true,
  },
  refreshTokenHash: {
    type: String,
    required: true,
    index: true,
  },
  deviceFingerprint: {
    type: String,
    required: true,
    index: true,
  },
  userAgent: {
    type: String,
  },
  ipAddress: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastUsedAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true,
  },
  revokedAt: {
    type: Date,
  },
  revokedReason: {
    type: String,
  },
});

AuthSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
AuthSessionSchema.index({ userId: 1, createdAt: -1 });

const AuthSession: Model<AuthSessionDocument> = mongoose.model<AuthSessionDocument>(
  'authSession',
  AuthSessionSchema
);

export default AuthSession;
