import mongoose, { Schema, Document, Model } from 'mongoose';
import { ISuccessStory } from '../../shared/types';

export interface SuccessStoryDocument extends Document, Omit<ISuccessStory, '_id'> {}

const SuccessStorySchema = new Schema<SuccessStoryDocument>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  animalName: {
    type: String,
    required: true
  },
  animalType: {
    type: String,
    required: true
  },
  animalId: {
    type: String,
    default: '',
  },
  shelterId: {
    type: String,
    default: '',
    index: true,
  },
  title: {
    type: String,
    required: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  story: {
    type: String,
    required: true,
    maxlength: [5000, 'Story cannot exceed 5000 characters']
  },
  image: {
    type: String,
    default: ''
  },
  images: {
    type: [String],
    default: [],
  },
  imageCaptions: {
    type: [String],
    default: [],
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'featured'],
    default: 'pending',
  },
  moderatedBy: {
    type: String,
    default: '',
  },
  moderatedAt: {
    type: Date,
  },
  rejectionReason: {
    type: String,
    default: '',
  },
  adoptionDate: {
    type: Date,
  },
  reactions: {
    type: {
      heart: { type: Number, default: 0 },
      celebrate: { type: Number, default: 0 },
      inspiring: { type: Number, default: 0 },
    },
    default: { heart: 0, celebrate: 0, inspiring: 0 },
  },
  viewCount: {
    type: Number,
    default: 0,
  },
  shareCount: {
    type: Number,
    default: 0,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  featuredAt: {
    type: Date,
  },
  slug: {
    type: String,
    default: '',
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

SuccessStorySchema.index({ status: 1, createdAt: -1 });
SuccessStorySchema.index({ isFeatured: 1, featuredAt: -1 });
SuccessStorySchema.index({ title: 'text', story: 'text', animalName: 'text' });

const SuccessStory: Model<SuccessStoryDocument> = mongoose.model<SuccessStoryDocument>('successStory', SuccessStorySchema);

export default SuccessStory;
