import mongoose, { Schema, Document } from 'mongoose';

export interface IntakeLogDocument extends Document {
  animalId: string;
  shelterId: string;
  intakeDate: Date;
  intakeType: 'stray' | 'surrender' | 'transfer' | 'return' | 'born_in_care';
  source: string;
  condition: 'healthy' | 'injured' | 'sick' | 'unknown';
  intakeNotes: string;
  receivedBy: string;
  createdAt: Date;
}

const IntakeLogSchema = new Schema<IntakeLogDocument>({
  animalId: { type: String, required: true },
  shelterId: { type: String, required: true },
  intakeDate: { type: Date, default: Date.now },
  intakeType: { type: String, enum: ['stray', 'surrender', 'transfer', 'return', 'born_in_care'], required: true },
  source: { type: String, default: '' },
  condition: { type: String, enum: ['healthy', 'injured', 'sick', 'unknown'], default: 'unknown' },
  intakeNotes: { type: String, default: '' },
  receivedBy: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const IntakeLog = mongoose.model<IntakeLogDocument>('intakeLog', IntakeLogSchema);

export default IntakeLog;
