import mongoose, { Schema, Document, Model } from 'mongoose';
import { IApplication } from '../../shared/types';

export interface ApplicationDocument extends Document, Omit<IApplication, '_id'> {}

const ApplicationSchema = new Schema<ApplicationDocument>({
  animalId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  applicationData: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'withdrawn'],
    default: 'submitted',
  },
  isDraft: {
    type: Boolean,
    default: false,
  },
  currentStep: {
    type: Number,
    default: 0,
  },
  totalSteps: {
    type: Number,
    default: 1,
  },
  templateId: {
    type: String,
    default: '',
  },
  applicationFee: {
    type: Number,
    default: 0,
  },
  applicationFeeStatus: {
    type: String,
    enum: ['none', 'pending', 'paid', 'waived'],
    default: 'none',
  },
  reviewNotes: {
    type: String,
    default: '',
  },
  reviewedBy: {
    type: String,
    default: '',
  },
  reviewedAt: {
    type: Date,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

ApplicationSchema.index({ userId: 1, animalId: 1 });
ApplicationSchema.index({ animalId: 1, status: 1 });

const Application: Model<ApplicationDocument> = mongoose.model<ApplicationDocument>('application', ApplicationSchema);

export default Application;
