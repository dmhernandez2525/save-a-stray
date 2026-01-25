import mongoose, { Schema, Document } from 'mongoose';

export interface VaccinationDocument extends Document {
  animalId: string;
  shelterId: string;
  vaccineName: string;
  batchNumber: string;
  administeredBy: string;
  administeredDate: Date;
  expirationDate: Date;
  status: 'current' | 'expired' | 'due';
  notes: string;
  createdAt: Date;
}

const VaccinationSchema = new Schema<VaccinationDocument>({
  animalId: { type: String, required: true },
  shelterId: { type: String, required: true },
  vaccineName: { type: String, required: true },
  batchNumber: { type: String, default: '' },
  administeredBy: { type: String, default: '' },
  administeredDate: { type: Date, default: Date.now },
  expirationDate: { type: Date, default: null },
  status: { type: String, enum: ['current', 'expired', 'due'], default: 'current' },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const Vaccination = mongoose.model<VaccinationDocument>('vaccination', VaccinationSchema);

export default Vaccination;
