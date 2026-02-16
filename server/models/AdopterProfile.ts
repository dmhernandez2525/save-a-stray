import mongoose, { Schema, Document, Model } from 'mongoose';

export interface AdopterProfileDocument extends Document {
  userId: string;
  housingType: string;
  hasYard: boolean;
  yardSize: string;
  activityLevel: string;
  hoursAwayPerDay: number;
  hasChildren: boolean;
  childrenAges: string;
  hasOtherPets: boolean;
  otherPetTypes: string[];
  experienceLevel: string;
  preferredSize: string[];
  preferredEnergyLevel: string[];
  preferredAge: string;
  preferredSpecies: string[];
  allergies: string;
  specialConsiderations: string;
  completedAt: Date;
  updatedAt: Date;
}

const AdopterProfileSchema = new Schema<AdopterProfileDocument>({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  housingType: {
    type: String,
    enum: ['apartment', 'condo', 'townhouse', 'house', 'farm', 'other'],
    default: 'house',
  },
  hasYard: { type: Boolean, default: false },
  yardSize: {
    type: String,
    enum: ['none', 'small', 'medium', 'large'],
    default: 'none',
  },
  activityLevel: {
    type: String,
    enum: ['sedentary', 'moderate', 'active', 'very_active'],
    default: 'moderate',
  },
  hoursAwayPerDay: { type: Number, default: 8 },
  hasChildren: { type: Boolean, default: false },
  childrenAges: { type: String, default: '' },
  hasOtherPets: { type: Boolean, default: false },
  otherPetTypes: { type: [String], default: [] },
  experienceLevel: {
    type: String,
    enum: ['first_time', 'some', 'experienced', 'professional'],
    default: 'some',
  },
  preferredSize: { type: [String], default: [] },
  preferredEnergyLevel: { type: [String], default: [] },
  preferredAge: {
    type: String,
    enum: ['puppy_kitten', 'young', 'adult', 'senior', 'any'],
    default: 'any',
  },
  preferredSpecies: { type: [String], default: [] },
  allergies: { type: String, default: '' },
  specialConsiderations: { type: String, default: '' },
  completedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const AdopterProfile: Model<AdopterProfileDocument> = mongoose.model<AdopterProfileDocument>(
  'adopterProfile',
  AdopterProfileSchema
);

export default AdopterProfile;
