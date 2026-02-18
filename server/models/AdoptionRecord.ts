import mongoose, { Schema, Document, Model } from 'mongoose';

export interface FollowUp {
  type: string;
  scheduledDate: Date;
  completedDate?: Date;
  status: 'pending' | 'completed' | 'skipped';
  notes: string;
}

export interface AdoptionRecordDocument extends Document {
  animalId: string;
  adopterId: string;
  shelterId: string;
  applicationId: string;
  adoptionDate: Date;
  feeAmount: number;
  feeStatus: 'pending' | 'paid' | 'waived' | 'installment';
  paymentIntentId: string;
  contractUrl: string;
  contractSignedAt?: Date;
  certificateUrl: string;
  followUps: FollowUp[];
  returnDate?: Date;
  returnReason?: string;
  notes: string;
  createdAt: Date;
}

const FollowUpSchema = new Schema({
  type: { type: String, required: true },
  scheduledDate: { type: Date, required: true },
  completedDate: { type: Date },
  status: {
    type: String,
    enum: ['pending', 'completed', 'skipped'],
    default: 'pending',
  },
  notes: { type: String, default: '' },
}, { _id: true });

const AdoptionRecordSchema = new Schema<AdoptionRecordDocument>({
  animalId: {
    type: String,
    required: true,
    index: true,
  },
  adopterId: {
    type: String,
    required: true,
    index: true,
  },
  shelterId: {
    type: String,
    required: true,
    index: true,
  },
  applicationId: {
    type: String,
    default: '',
  },
  adoptionDate: {
    type: Date,
    default: Date.now,
  },
  feeAmount: {
    type: Number,
    default: 0,
  },
  feeStatus: {
    type: String,
    enum: ['pending', 'paid', 'waived', 'installment'],
    default: 'pending',
  },
  paymentIntentId: {
    type: String,
    default: '',
  },
  contractUrl: {
    type: String,
    default: '',
  },
  contractSignedAt: {
    type: Date,
  },
  certificateUrl: {
    type: String,
    default: '',
  },
  followUps: {
    type: [FollowUpSchema],
    default: [],
  },
  returnDate: { type: Date },
  returnReason: { type: String, default: '' },
  notes: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

AdoptionRecordSchema.index({ shelterId: 1, adoptionDate: -1 });

const AdoptionRecord: Model<AdoptionRecordDocument> = mongoose.model<AdoptionRecordDocument>(
  'adoptionRecord',
  AdoptionRecordSchema
);

export default AdoptionRecord;
