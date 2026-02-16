import mongoose, { Schema, Document, Model } from 'mongoose';

export interface EmailPreferenceDocument extends Document {
  userId: string;
  applicationUpdates: boolean;
  statusChanges: boolean;
  newListings: boolean;
  eventReminders: boolean;
  marketingEmails: boolean;
  digestFrequency: 'immediate' | 'daily' | 'weekly' | 'none';
  unsubscribedAll: boolean;
  unsubscribeToken: string;
  matchingPreferences: boolean;
  fosterUpdates: boolean;
  shelterNews: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EmailPreferenceSchema = new Schema<EmailPreferenceDocument>({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  applicationUpdates: { type: Boolean, default: true },
  statusChanges: { type: Boolean, default: true },
  newListings: { type: Boolean, default: false },
  eventReminders: { type: Boolean, default: true },
  marketingEmails: { type: Boolean, default: false },
  digestFrequency: {
    type: String,
    enum: ['immediate', 'daily', 'weekly', 'none'],
    default: 'immediate',
  },
  unsubscribedAll: { type: Boolean, default: false },
  unsubscribeToken: { type: String, default: '' },
  matchingPreferences: { type: Boolean, default: true },
  fosterUpdates: { type: Boolean, default: true },
  shelterNews: { type: Boolean, default: false },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

EmailPreferenceSchema.pre('save', function () {
  this.updatedAt = new Date();
});

const EmailPreference: Model<EmailPreferenceDocument> = mongoose.model<EmailPreferenceDocument>(
  'emailPreference',
  EmailPreferenceSchema
);

export default EmailPreference;
