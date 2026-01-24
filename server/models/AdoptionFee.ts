import mongoose, { Schema, Document } from 'mongoose';

export interface AdoptionFeeDocument extends Document {
  animalId: string;
  shelterId: string;
  amount: number;
  currency: string;
  description: string;
  waived: boolean;
  waivedReason: string;
  paidAt: Date | null;
  paidBy: string;
  status: 'pending' | 'paid' | 'waived' | 'refunded';
  createdAt: Date;
}

const AdoptionFeeSchema = new Schema<AdoptionFeeDocument>({
  animalId: { type: String, required: true },
  shelterId: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  description: { type: String, default: '' },
  waived: { type: Boolean, default: false },
  waivedReason: { type: String, default: '' },
  paidAt: { type: Date, default: null },
  paidBy: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'paid', 'waived', 'refunded'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const AdoptionFee = mongoose.model<AdoptionFeeDocument>('adoptionFee', AdoptionFeeSchema);

export default AdoptionFee;
