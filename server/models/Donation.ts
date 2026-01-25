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
    min: [1, 'Donation amount must be at least $1'],
    max: [1000000, 'Donation amount exceeds maximum']
  },
  message: {
    type: String,
    default: '',
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Donation: Model<DonationDocument> = mongoose.model<DonationDocument>('donation', DonationSchema);

export default Donation;
