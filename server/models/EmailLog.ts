import mongoose, { Schema, Document, Model } from 'mongoose';

export interface EmailLogDocument extends Document {
  userId: string;
  shelterId: string;
  templateName: string;
  subject: string;
  recipientEmail: string;
  category: string;
  status: 'queued' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';
  sentAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  bouncedAt?: Date;
  errorMessage: string;
  metadata: Map<string, string>;
  createdAt: Date;
}

const EmailLogSchema = new Schema<EmailLogDocument>({
  userId: {
    type: String,
    default: '',
    index: true,
  },
  shelterId: {
    type: String,
    default: '',
    index: true,
  },
  templateName: { type: String, default: '' },
  subject: { type: String, default: '' },
  recipientEmail: { type: String, required: true },
  category: {
    type: String,
    default: 'transactional',
  },
  status: {
    type: String,
    enum: ['queued', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'],
    default: 'queued',
  },
  sentAt: { type: Date },
  openedAt: { type: Date },
  clickedAt: { type: Date },
  bouncedAt: { type: Date },
  errorMessage: { type: String, default: '' },
  metadata: {
    type: Map,
    of: String,
    default: new Map(),
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

EmailLogSchema.index({ shelterId: 1, category: 1, createdAt: -1 });
EmailLogSchema.index({ status: 1 });

const EmailLog: Model<EmailLogDocument> = mongoose.model<EmailLogDocument>(
  'emailLog',
  EmailLogSchema
);

export default EmailLog;
