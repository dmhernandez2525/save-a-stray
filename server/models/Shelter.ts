import mongoose, { Schema, Document, Model } from 'mongoose';
import { IShelter } from '../../shared/types';

export interface ShelterDocument extends Document, Omit<IShelter, '_id'> {}

const ShelterSchema = new Schema<ShelterDocument>({
  name: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
    },
  },
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  }],
  paymentEmail: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  website: {
    type: String,
    default: ''
  },
  hours: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  maxCapacity: {
    type: Number,
    default: 0,
  },
  animalIdPrefix: {
    type: String,
    default: '',
  },
  nextAnimalIdSequence: {
    type: Number,
    default: 1,
  },
  verified: {
    type: Boolean,
    default: false
  },
  verifiedAt: {
    type: Date
  },
  animals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'animal'
  }]
});

ShelterSchema.index({ coordinates: '2dsphere' });

const Shelter: Model<ShelterDocument> = mongoose.model<ShelterDocument>('shelter', ShelterSchema);

export default Shelter;
