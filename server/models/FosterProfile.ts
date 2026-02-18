import mongoose, { Schema, Document, Model } from 'mongoose';

export interface HousingDetail {
  type: 'house' | 'apartment' | 'condo' | 'townhouse' | 'farm' | 'other';
  ownershipStatus: 'own' | 'rent';
  hasYard: boolean;
  yardFenced: boolean;
  squareFootage: number;
  landlordApproval: boolean;
  landlordContact: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verificationNotes: string;
  documentUrls: string[];
}

export interface PetExperience {
  animalType: string;
  years: number;
  description: string;
  isFosterExperience: boolean;
}

export interface Reference {
  name: string;
  email: string;
  phone: string;
  relationship: string;
  requestSentAt?: Date;
  responseReceivedAt?: Date;
  status: 'pending' | 'sent' | 'received' | 'declined';
  rating?: number;
  comments: string;
}

export interface OrientationItem {
  module: string;
  completedAt?: Date;
  required: boolean;
}

export interface BlackoutDate {
  start: Date;
  end: Date;
  reason: string;
}

export interface FosterPreferences {
  preferredSizes: string[];
  preferredAgeRange: string;
  acceptsMedicalNeeds: boolean;
  acceptsBehavioralNeeds: boolean;
  maxDuration: number;
  preferredDuration: number;
  emergencyAvailable: boolean;
}

export interface FosterProfileDocument extends Document {
  userId: string;
  shelterId: string;
  bio: string;
  photoUrl: string;
  maxAnimals: number;
  acceptedAnimalTypes: string[];
  specialSkills: string[];
  housing: HousingDetail;
  experience: PetExperience[];
  references: Reference[];
  orientation: OrientationItem[];
  agreementSignedAt?: Date;
  agreementUrl: string;
  status: 'pending_approval' | 'active' | 'on_hold' | 'inactive';
  statusReason: string;
  backgroundCheckStatus: 'not_started' | 'pending' | 'passed' | 'failed';
  backgroundCheckDate?: Date;
  totalAnimalsHelped: number;
  currentAnimalCount: number;
  availableFrom?: Date;
  availableUntil?: Date;
  blackoutDates: BlackoutDate[];
  preferences: FosterPreferences;
  createdAt: Date;
  updatedAt: Date;
}

const HousingDetailSchema = new Schema({
  type: {
    type: String,
    enum: ['house', 'apartment', 'condo', 'townhouse', 'farm', 'other'],
    default: 'house',
  },
  ownershipStatus: {
    type: String,
    enum: ['own', 'rent'],
    default: 'own',
  },
  hasYard: { type: Boolean, default: false },
  yardFenced: { type: Boolean, default: false },
  squareFootage: { type: Number, default: 0 },
  landlordApproval: { type: Boolean, default: false },
  landlordContact: { type: String, default: '' },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  },
  verificationNotes: { type: String, default: '' },
  documentUrls: { type: [String], default: [] },
}, { _id: false });

const PetExperienceSchema = new Schema({
  animalType: { type: String, required: true },
  years: { type: Number, default: 0 },
  description: { type: String, default: '' },
  isFosterExperience: { type: Boolean, default: false },
}, { _id: true });

const ReferenceSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: '' },
  relationship: { type: String, default: '' },
  requestSentAt: { type: Date },
  responseReceivedAt: { type: Date },
  status: {
    type: String,
    enum: ['pending', 'sent', 'received', 'declined'],
    default: 'pending',
  },
  rating: { type: Number, min: 1, max: 5 },
  comments: { type: String, default: '' },
}, { _id: true });

const OrientationItemSchema = new Schema({
  module: { type: String, required: true },
  completedAt: { type: Date },
  required: { type: Boolean, default: true },
}, { _id: true });

const BlackoutDateSchema = new Schema({
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  reason: { type: String, default: '' },
}, { _id: true });

const FosterPreferencesSchema = new Schema({
  preferredSizes: { type: [String], default: [] },
  preferredAgeRange: { type: String, default: 'any' },
  acceptsMedicalNeeds: { type: Boolean, default: false },
  acceptsBehavioralNeeds: { type: Boolean, default: false },
  maxDuration: { type: Number, default: 90 },
  preferredDuration: { type: Number, default: 14 },
  emergencyAvailable: { type: Boolean, default: false },
}, { _id: false });

const FosterProfileSchema = new Schema<FosterProfileDocument>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  shelterId: {
    type: String,
    required: true,
    index: true,
  },
  bio: { type: String, default: '' },
  photoUrl: { type: String, default: '' },
  maxAnimals: { type: Number, default: 1, min: 1 },
  acceptedAnimalTypes: { type: [String], default: [] },
  specialSkills: { type: [String], default: [] },
  housing: {
    type: HousingDetailSchema,
    default: () => ({}),
  },
  experience: {
    type: [PetExperienceSchema],
    default: [],
  },
  references: {
    type: [ReferenceSchema],
    default: [],
  },
  orientation: {
    type: [OrientationItemSchema],
    default: [],
  },
  agreementSignedAt: { type: Date },
  agreementUrl: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending_approval', 'active', 'on_hold', 'inactive'],
    default: 'pending_approval',
  },
  statusReason: { type: String, default: '' },
  backgroundCheckStatus: {
    type: String,
    enum: ['not_started', 'pending', 'passed', 'failed'],
    default: 'not_started',
  },
  backgroundCheckDate: { type: Date },
  totalAnimalsHelped: { type: Number, default: 0 },
  currentAnimalCount: { type: Number, default: 0 },
  availableFrom: { type: Date },
  availableUntil: { type: Date },
  blackoutDates: {
    type: [BlackoutDateSchema],
    default: [],
  },
  preferences: {
    type: FosterPreferencesSchema,
    default: () => ({}),
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

FosterProfileSchema.index({ shelterId: 1, status: 1 });
FosterProfileSchema.index({ userId: 1, shelterId: 1 }, { unique: true });

FosterProfileSchema.pre('save', function () {
  this.updatedAt = new Date();
});

const FosterProfile: Model<FosterProfileDocument> = mongoose.model<FosterProfileDocument>(
  'fosterProfile',
  FosterProfileSchema
);

export default FosterProfile;
