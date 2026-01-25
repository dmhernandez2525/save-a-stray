import mongoose, { Schema, Document } from 'mongoose';

export interface AdoptionFeeDocument extends Document {
  animalId?: string;
  animalType?: string;
  shelterId: string;
  amount?: number;
  baseFee?: number;
  seniorDiscount?: number;
  specialNeedsDiscount?: number;
  currency: string;
  description: string;
  waived: boolean;
  waivedReason: string;
  paidAt: Date | null;
  paidBy: string;
  status: 'pending' | 'paid' | 'waived' | 'refunded';
  active: boolean;
  createdAt: Date;
}

const AdoptionFeeSchema = new Schema<AdoptionFeeDocument>({
  animalId: { type: String },
  animalType: { type: String },
  shelterId: { type: String, required: true },
  amount: { type: Number },
  baseFee: { type: Number },
  seniorDiscount: { type: Number, default: 0 },
  specialNeedsDiscount: { type: Number, default: 0 },
  currency: { type: String, default: 'USD' },
  description: { type: String, default: '' },
  waived: { type: Boolean, default: false },
  waivedReason: { type: String, default: '' },
  paidAt: { type: Date, default: null },
  paidBy: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'paid', 'waived', 'refunded'], default: 'pending' },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const AdoptionFee = mongoose.model<AdoptionFeeDocument>('adoptionFee', AdoptionFeeSchema);

export default AdoptionFee;
