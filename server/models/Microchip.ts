import mongoose, { Schema, Document } from 'mongoose';

export interface MicrochipDocument extends Document {
  animalId: string;
  shelterId: string;
  chipNumber: string;
  chipBrand: string;
  registeredDate: Date;
  registeredBy: string;
  status: 'registered' | 'unregistered' | 'transferred';
  ownerName: string;
  ownerPhone: string;
  createdAt: Date;
}

const MicrochipSchema = new Schema<MicrochipDocument>({
  animalId: { type: String, required: true },
  shelterId: { type: String, required: true },
  chipNumber: { type: String, required: true },
  chipBrand: { type: String, default: '' },
  registeredDate: { type: Date, default: null },
  registeredBy: { type: String, default: '' },
  status: { type: String, enum: ['registered', 'unregistered', 'transferred'], default: 'unregistered' },
  ownerName: { type: String, default: '' },
  ownerPhone: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const Microchip = mongoose.model<MicrochipDocument>('microchip', MicrochipSchema);

export default Microchip;
