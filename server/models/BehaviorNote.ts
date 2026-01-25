import mongoose, { Schema, Document } from 'mongoose';

export interface BehaviorNoteDocument extends Document {
  animalId: string;
  shelterId: string;
  noteType: 'behavior' | 'training' | 'health' | 'general';
  content: string;
  author: string;
  severity: 'info' | 'warning' | 'critical';
  resolved: boolean;
  resolvedAt?: Date;
  createdAt: Date;
}

const BehaviorNoteSchema = new Schema<BehaviorNoteDocument>({
  animalId: { type: String, required: true },
  shelterId: { type: String, required: true },
  noteType: { type: String, enum: ['behavior', 'training', 'health', 'general'], default: 'general' },
  content: { type: String, required: true },
  author: { type: String, default: '' },
  severity: { type: String, enum: ['info', 'warning', 'critical'], default: 'info' },
  resolved: { type: Boolean, default: false },
  resolvedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

const BehaviorNote = mongoose.model<BehaviorNoteDocument>('behaviorNote', BehaviorNoteSchema);

export default BehaviorNote;
