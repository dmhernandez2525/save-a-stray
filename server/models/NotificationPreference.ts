import mongoose, { Schema, Document, Model } from 'mongoose';

export interface QuietHours {
  enabled: boolean;
  startHour: number;
  endHour: number;
  timezone: string;
}

export interface NotificationPreferenceDocument extends Document {
  userId: string;
  applications: boolean;
  messages: boolean;
  favorites: boolean;
  events: boolean;
  shelterAnnouncements: boolean;
  animalStatusChanges: boolean;
  fosterUpdates: boolean;
  quietHours: QuietHours;
  createdAt: Date;
  updatedAt: Date;
}

const QuietHoursSchema = new Schema({
  enabled: { type: Boolean, default: false },
  startHour: { type: Number, default: 22, min: 0, max: 23 },
  endHour: { type: Number, default: 7, min: 0, max: 23 },
  timezone: { type: String, default: 'America/New_York' },
}, { _id: false });

const NotificationPreferenceSchema = new Schema<NotificationPreferenceDocument>({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  applications: { type: Boolean, default: true },
  messages: { type: Boolean, default: true },
  favorites: { type: Boolean, default: true },
  events: { type: Boolean, default: true },
  shelterAnnouncements: { type: Boolean, default: true },
  animalStatusChanges: { type: Boolean, default: true },
  fosterUpdates: { type: Boolean, default: true },
  quietHours: {
    type: QuietHoursSchema,
    default: () => ({}),
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

NotificationPreferenceSchema.pre('save', function () {
  this.updatedAt = new Date();
});

const NotificationPreference: Model<NotificationPreferenceDocument> = mongoose.model<NotificationPreferenceDocument>(
  'notificationPreference',
  NotificationPreferenceSchema
);

export default NotificationPreference;
