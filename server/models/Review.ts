import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ReviewDocument extends Document {
  userId: string;
  shelterId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

const ReviewSchema = new Schema<ReviewDocument>({
  userId: { type: String, required: true },
  shelterId: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const Review: Model<ReviewDocument> = mongoose.model<ReviewDocument>('review', ReviewSchema);

export default Review;
