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
    default: [],
    validate: {
      validator: function(v: string[]) {
        return v.length <= 10;
      },
      message: 'Maximum of 10 images allowed'
    }
  },
  video: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'pending', 'adopted', 'hold', 'fostered', 'transferred', 'deceased'],
    default: 'available'
  },
  size: {
    type: String,
    enum: ['small', 'medium', 'large', 'extra-large'],
  },
  temperament: {
    type: String,
    default: ''
  },
  energyLevel: {
    type: String,
    enum: ['low', 'moderate', 'high'],
  },
  houseTrained: {
    type: Boolean,
  },
  goodWithKids: {
    type: Boolean,
  },
  goodWithDogs: {
    type: Boolean,
  },
  goodWithCats: {
    type: Boolean,
  },
  personalityTraits: {
    type: [String],
    default: [],
  },
  specialNeeds: {
    type: String,
    default: ''
  },
  microchipId: {
    type: String,
    default: ''
  },
  intakeDate: {
    type: Date,
  },
  intakeSource: {
    type: String,
    default: ''
  },
  adoptionFee: {
    type: Number,
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

AnimalSchema.index({ type: 1, status: 1 });
AnimalSchema.index({ breed: 1 });
AnimalSchema.index({ intakeDate: 1 });

const Animal: Model<AnimalDocument> = mongoose.model<AnimalDocument>('animal', AnimalSchema);

export default Animal;
