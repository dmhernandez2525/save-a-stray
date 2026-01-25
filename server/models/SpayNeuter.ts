import mongoose, { Schema, Document } from 'mongoose';

export interface SpayNeuterDocument extends Document {
  animalId: string;
  shelterId: string;
  procedureType: 'spay' | 'neuter';
  status: 'scheduled' | 'completed' | 'cancelled';
  scheduledDate: Date | null;
  completedDate: Date | null;
  veterinarian: string;
  clinic: string;
  notes: string;
  createdAt: Date;
}

const SpayNeuterSchema = new Schema<SpayNeuterDocument>({
  animalId: { type: String, required: true },
  shelterId: { type: String, required: true },
  procedureType: { type: String, enum: ['spay', 'neuter'], required: true },
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' },
  scheduledDate: { type: Date, default: null },
  completedDate: { type: Date, default: null },
  veterinarian: { type: String, default: '' },
  clinic: { type: String, default: '' },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const SpayNeuter = mongoose.model<SpayNeuterDocument>('spayNeuter', SpayNeuterSchema);

export default SpayNeuter;
