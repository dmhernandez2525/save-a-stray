import mongoose, { Schema, Document } from 'mongoose';

export interface WaitlistDocument extends Document {
  animalId: string;
  shelterId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  position: number;
  status: 'waiting' | 'notified' | 'expired' | 'adopted';
  notes: string;
  createdAt: Date;
}

const WaitlistSchema = new Schema<WaitlistDocument>({
  animalId: { type: String, required: true },
  shelterId: { type: String, required: true },
  userId: { type: String, default: '' },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  userPhone: { type: String, default: '' },
  position: { type: Number, required: true },
  status: { type: String, enum: ['waiting', 'notified', 'expired', 'adopted'], default: 'waiting' },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const Waitlist = mongoose.model<WaitlistDocument>('waitlist', WaitlistSchema);

export default Waitlist;
