import mongoose, { Schema, Document } from 'mongoose';

export interface WeightRecordDocument extends Document {
  animalId: string;
  shelterId: string;
  weight: number;
  unit: 'lbs' | 'kg';
  recordedBy: string;
  notes: string;
  recordedAt: Date;
}

const WeightRecordSchema = new Schema<WeightRecordDocument>({
  animalId: { type: String, required: true },
  shelterId: { type: String, required: true },
  weight: { type: Number, required: true },
  unit: { type: String, enum: ['lbs', 'kg'], default: 'lbs' },
  recordedBy: { type: String, default: '' },
  notes: { type: String, default: '' },
  recordedAt: { type: Date, default: Date.now }
});

const WeightRecord = mongoose.model<WeightRecordDocument>('weightRecord', WeightRecordSchema);

export default WeightRecord;
