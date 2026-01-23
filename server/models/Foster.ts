import mongoose, { Schema, Document, Model } from 'mongoose';

export interface FosterDocument extends Document {
  shelterId: string;
  animalId: string;
  userId: string;
  fosterName: string;
  fosterEmail: string;
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'completed' | 'cancelled';
  notes: string;
  createdAt: Date;
}

const FosterSchema = new Schema<FosterDocument>({
  shelterId: {
    type: String,
    required: true
  },
  animalId: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    default: ''
  },
  fosterName: {
    type: String,
    required: true
  },
  fosterEmail: {
    type: String,
    default: ''
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  notes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Foster: Model<FosterDocument> = mongoose.model<FosterDocument>('foster', FosterSchema);

export default Foster;
