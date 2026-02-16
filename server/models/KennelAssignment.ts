import mongoose, { Schema, Document, Model } from 'mongoose';

export interface KennelAssignmentDocument extends Document {
  shelterId: string;
  kennelId: string;
  kennelName: string;
  animalId: string;
  assignedAt: Date;
  releasedAt?: Date;
  status: 'occupied' | 'vacant' | 'maintenance';
  notes: string;
}

const KennelAssignmentSchema = new Schema<KennelAssignmentDocument>({
  shelterId: {
    type: String,
    required: true,
    index: true,
  },
  kennelId: {
    type: String,
    required: true,
  },
  kennelName: {
    type: String,
    default: '',
  },
  animalId: {
    type: String,
    default: '',
  },
  assignedAt: {
    type: Date,
    default: Date.now,
  },
  releasedAt: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['occupied', 'vacant', 'maintenance'],
    default: 'vacant',
  },
  notes: {
    type: String,
    default: '',
  },
});

KennelAssignmentSchema.index({ shelterId: 1, kennelId: 1 });

const KennelAssignment: Model<KennelAssignmentDocument> = mongoose.model<KennelAssignmentDocument>(
  'kennelAssignment',
  KennelAssignmentSchema
);

export default KennelAssignment;
