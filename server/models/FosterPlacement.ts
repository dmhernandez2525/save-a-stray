import mongoose, { Schema, Document, Model } from 'mongoose';

export interface CompatibilityAssessment {
  criterion: string;
  score: number;
  notes: string;
}

export interface FosterPlacementDocument extends Document {
  shelterId: string;
  fosterProfileId: string;
  userId: string;
  animalId: string;
  status: 'requested' | 'accepted' | 'active' | 'completed' | 'cancelled';
  isEmergency: boolean;
  priority: number;
  requestedBy: string;
  requestedAt: Date;
  acceptedAt?: Date;
  startDate?: Date;
  endDate?: Date;
  expectedDuration: number;
  matchScore: number;
  matchFactors: Map<string, number>;
  compatibilityAssessment: CompatibilityAssessment[];
  notes: string;
  returnReason: string;
  createdAt: Date;
}

const CompatibilityAssessmentSchema = new Schema({
  criterion: { type: String, required: true },
  score: { type: Number, required: true, min: 1, max: 5 },
  notes: { type: String, default: '' },
}, { _id: true });

const FosterPlacementSchema = new Schema<FosterPlacementDocument>({
  shelterId: {
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
    index: true,
  },
  animalId: {
    type: String,
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['requested', 'accepted', 'active', 'completed', 'cancelled'],
    default: 'requested',
  },
  isEmergency: { type: Boolean, default: false },
  priority: { type: Number, default: 0 },
  requestedBy: { type: String, default: '' },
  requestedAt: { type: Date, default: Date.now },
  acceptedAt: { type: Date },
  startDate: { type: Date },
  endDate: { type: Date },
  expectedDuration: { type: Number, default: 14 },
  matchScore: { type: Number, default: 0, min: 0, max: 100 },
  matchFactors: {
    type: Map,
    of: Number,
    default: new Map(),
  },
  compatibilityAssessment: {
    type: [CompatibilityAssessmentSchema],
    default: [],
  },
  notes: { type: String, default: '' },
  returnReason: { type: String, default: '' },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

FosterPlacementSchema.index({ shelterId: 1, status: 1 });
FosterPlacementSchema.index({ fosterProfileId: 1, status: 1 });
FosterPlacementSchema.index({ animalId: 1, status: 1 });

const FosterPlacement: Model<FosterPlacementDocument> = mongoose.model<FosterPlacementDocument>(
  'fosterPlacement',
  FosterPlacementSchema
);

export default FosterPlacement;
