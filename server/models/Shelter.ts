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

const Shelter: Model<ShelterDocument> = mongoose.model<ShelterDocument>('shelter', ShelterSchema);

export default Shelter;
