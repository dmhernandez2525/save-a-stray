import mongoose, { Schema, Document, Model } from 'mongoose';

export interface StatusHistoryDocument extends Document {
  animalId: string;
  fromStatus: string;
  toStatus: string;
  changedBy: string;
  reason: string;
  createdAt: Date;
}

const StatusHistorySchema = new Schema<StatusHistoryDocument>({
  animalId: {
    type: String,
    required: true,
    index: true,
  },
  fromStatus: {
    type: String,
    required: true,
  },
  toStatus: {
    type: String,
    required: true,
  },
  changedBy: {
    type: String,
    default: '',
  },
  reason: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

StatusHistorySchema.index({ animalId: 1, createdAt: -1 });

const StatusHistory: Model<StatusHistoryDocument> = mongoose.model<StatusHistoryDocument>(
  'statusHistory',
  StatusHistorySchema
);

export default StatusHistory;
