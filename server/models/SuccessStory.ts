import mongoose, { Schema, Document, Model } from 'mongoose';
import { ISuccessStory } from '../../shared/types';

export interface SuccessStoryDocument extends Document, Omit<ISuccessStory, '_id'> {}

const SuccessStorySchema = new Schema<SuccessStoryDocument>({
  userId: {
    type: String,
    required: true
  },
  animalName: {
    type: String,
    required: true
  },
  animalType: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  story: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const SuccessStory: Model<SuccessStoryDocument> = mongoose.model<SuccessStoryDocument>('successStory', SuccessStorySchema);

export default SuccessStory;
