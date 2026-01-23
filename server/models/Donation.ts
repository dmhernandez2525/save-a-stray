import mongoose, { Schema, Document, Model } from 'mongoose';

export interface DonationDocument extends Document {
  shelterId: string;
  userId?: string;
  donorName: string;
  amount: number;
  message: string;
  createdAt: Date;
}

const DonationSchema = new Schema<DonationDocument>({
  shelterId: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    default: ''
  },
  donorName: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  message: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Donation: Model<DonationDocument> = mongoose.model<DonationDocument>('donation', DonationSchema);

export default Donation;
