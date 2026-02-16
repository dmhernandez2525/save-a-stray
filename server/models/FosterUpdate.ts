import mongoose, { Schema, Document, Model } from 'mongoose';

export interface FosterUpdateDocument extends Document {
  placementId: string;
  fosterProfileId: string;
  userId: string;
  shelterId: string;
  animalId: string;
  type: 'daily_status' | 'medical' | 'milestone' | 'photo' | 'expense' | 'supply_request';
  date: Date;
  feeding: string;
  behavior: string;
  healthObservations: string;
  medications: string[];
  vetVisitDate?: Date;
  vetNotes: string;
  symptoms: string[];
  milestone: string;
  milestoneNotes: string;
  photoUrls: string[];
  videoUrls: string[];
  caption: string;
  visibleToAdopters: boolean;
  expenseAmount: number;
  expenseCategory: string;
  receiptUrl: string;
  expenseStatus: 'pending' | 'approved' | 'rejected' | 'reimbursed';
  supplyItems: string[];
  supplyNotes: string;
  supplyStatus: 'pending' | 'approved' | 'fulfilled' | 'denied';
  notes: string;
  createdAt: Date;
}

const FosterUpdateSchema = new Schema<FosterUpdateDocument>({
  placementId: {
    type: String,
    required: true,
    index: true,
  },
  fosterProfileId: {
    type: String,
    required: true,
    index: true,
  },
  userId: {
    type: String,
    required: true,
  },
  shelterId: {
    type: String,
    required: true,
    index: true,
  },
  animalId: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['daily_status', 'medical', 'milestone', 'photo', 'expense', 'supply_request'],
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  feeding: { type: String, default: '' },
  behavior: { type: String, default: '' },
  healthObservations: { type: String, default: '' },
  medications: { type: [String], default: [] },
  vetVisitDate: { type: Date },
  vetNotes: { type: String, default: '' },
  symptoms: { type: [String], default: [] },
  milestone: { type: String, default: '' },
  milestoneNotes: { type: String, default: '' },
  photoUrls: { type: [String], default: [] },
  videoUrls: { type: [String], default: [] },
  caption: { type: String, default: '' },
  visibleToAdopters: { type: Boolean, default: false },
  expenseAmount: { type: Number, default: 0 },
  expenseCategory: { type: String, default: '' },
  receiptUrl: { type: String, default: '' },
  expenseStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'reimbursed'],
    default: 'pending',
  },
  supplyItems: { type: [String], default: [] },
  supplyNotes: { type: String, default: '' },
  supplyStatus: {
    type: String,
    enum: ['pending', 'approved', 'fulfilled', 'denied'],
    default: 'pending',
  },
  notes: { type: String, default: '' },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

FosterUpdateSchema.index({ placementId: 1, type: 1, date: -1 });
FosterUpdateSchema.index({ shelterId: 1, type: 1, date: -1 });

const FosterUpdate: Model<FosterUpdateDocument> = mongoose.model<FosterUpdateDocument>(
  'fosterUpdate',
  FosterUpdateSchema
);

export default FosterUpdate;
