import mongoose, { Schema, Document, Model } from 'mongoose';

interface CriterionScore {
  criterion: string;
  score: number;
  comment: string;
}

export interface ApplicationReviewDocument extends Document {
  applicationId: string;
  reviewerId: string;
  scores: CriterionScore[];
  overallScore: number;
  recommendation: 'approve' | 'reject' | 'needs_info' | 'undecided';
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const CriterionScoreSchema = new Schema({
  criterion: { type: String, required: true },
  score: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '' },
}, { _id: false });

const ApplicationReviewSchema = new Schema<ApplicationReviewDocument>({
  applicationId: {
    type: String,
    required: true,
    index: true,
  },
  reviewerId: {
    type: String,
    required: true,
  },
  scores: {
    type: [CriterionScoreSchema],
    default: [],
  },
  overallScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  recommendation: {
    type: String,
    enum: ['approve', 'reject', 'needs_info', 'undecided'],
    default: 'undecided',
  },
  notes: {
    type: String,
    default: '',
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

ApplicationReviewSchema.index({ applicationId: 1, reviewerId: 1 }, { unique: true });

const ApplicationReview: Model<ApplicationReviewDocument> = mongoose.model<ApplicationReviewDocument>(
  'applicationReview',
  ApplicationReviewSchema
);

export default ApplicationReview;
