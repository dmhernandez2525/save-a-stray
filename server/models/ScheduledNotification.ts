import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ScheduledNotificationDocument extends Document {
  userId: string;
  shelterId: string;
  title: string;
  body: string;
  category: string;
  url: string;
  scheduledFor: Date;
  sentAt?: Date;
  status: 'pending' | 'sent' | 'cancelled' | 'failed';
  isBatch: boolean;
  batchTargetUserIds: string[];
  createdAt: Date;
}

const ScheduledNotificationSchema = new Schema<ScheduledNotificationDocument>({
  userId: {
    type: String,
    default: '',
    index: true,
  },
  shelterId: {
    type: String,
    default: '',
  },
  title: { type: String, required: true },
  body: { type: String, default: '' },
  category: { type: String, default: 'general' },
  url: { type: String, default: '' },
  scheduledFor: {
    type: Date,
    required: true,
    index: true,
  },
  sentAt: { type: Date },
  status: {
    type: String,
    enum: ['pending', 'sent', 'cancelled', 'failed'],
    default: 'pending',
  },
  isBatch: { type: Boolean, default: false },
  batchTargetUserIds: { type: [String], default: [] },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

ScheduledNotificationSchema.index({ status: 1, scheduledFor: 1 });

const ScheduledNotification: Model<ScheduledNotificationDocument> = mongoose.model<ScheduledNotificationDocument>(
  'scheduledNotification',
  ScheduledNotificationSchema
);

export default ScheduledNotification;
