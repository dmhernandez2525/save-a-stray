import mongoose, { Schema, Document, Model } from 'mongoose';

export interface MatchRecordDocument extends Document {
  userId: string;
  animalId: string;
  score: number;
  factors: Record<string, number>;
  outcome: 'suggested' | 'viewed' | 'applied' | 'adopted' | 'dismissed';
  createdAt: Date;
}

const MatchRecordSchema = new Schema<MatchRecordDocument>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  animalId: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  factors: {
    type: Map,
    of: Number,
    default: {},
  },
  outcome: {
    type: String,
    enum: ['suggested', 'viewed', 'applied', 'adopted', 'dismissed'],
    default: 'suggested',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

MatchRecordSchema.index({ userId: 1, animalId: 1 });
MatchRecordSchema.index({ userId: 1, score: -1 });

const MatchRecord: Model<MatchRecordDocument> = mongoose.model<MatchRecordDocument>(
  'matchRecord',
  MatchRecordSchema
);

export default MatchRecord;
