import mongoose, { Schema, Document, Model } from 'mongoose';

export interface PushSubscriptionDocument extends Document {
  userId: string;
  endpoint: string;
  p256dhKey: string;
  authKey: string;
  deviceName: string;
  browserInfo: string;
  isActive: boolean;
  createdAt: Date;
  lastUsedAt: Date;
}

const PushSubscriptionSchema = new Schema<PushSubscriptionDocument>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  endpoint: {
    type: String,
    required: true,
    unique: true,
  },
  p256dhKey: { type: String, required: true },
  authKey: { type: String, required: true },
  deviceName: { type: String, default: '' },
  browserInfo: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastUsedAt: {
    type: Date,
    default: Date.now,
  },
});

const PushSubscription: Model<PushSubscriptionDocument> = mongoose.model<PushSubscriptionDocument>(
  'pushSubscription',
  PushSubscriptionSchema
);

export default PushSubscription;
