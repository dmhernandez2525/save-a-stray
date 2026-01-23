import mongoose, { Schema, Document, Model } from 'mongoose';
import { IAnimal } from '../../shared/types';

export interface AnimalDocument extends Document, Omit<IAnimal, '_id'> {}

const AnimalSchema = new Schema<AnimalDocument>({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  breed: {
    type: String,
    default: ''
  },
  age: {
    type: Number,
    required: true
  },
  sex: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  images: {
    type: [String],
    default: []
  },
  video: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'pending', 'adopted'],
    default: 'available'
  },
  medicalRecords: [{
    date: { type: String, required: true },
    recordType: { type: String, required: true },
    description: { type: String, required: true },
    veterinarian: { type: String, default: '' }
  }],
  applications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'application'
  }]
});

const Animal: Model<AnimalDocument> = mongoose.model<AnimalDocument>('animal', AnimalSchema);

export default Animal;
