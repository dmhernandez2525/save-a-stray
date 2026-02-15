// Shared types for GraphQL schema - used by both backend and frontend

import { Types } from 'mongoose';

// User Types
export interface IUser {
  _id: Types.ObjectId | string;
  name: string;
  email: string;
  userRole: 'shelter' | 'endUser' | 'admin';
  paymentEmail?: string;
  password: string;
  date: Date;
  fbookId?: string;
  googleId?: string;
  shelterId?: Types.ObjectId | string;
  varId?: Types.ObjectId | string;
  favorites: (Types.ObjectId | string)[];
  emailVerified?: boolean;
  emailVerificationTokenHash?: string;
  emailVerificationExpiresAt?: Date;
  passwordResetTokenHash?: string;
  passwordResetExpiresAt?: Date;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  twoFactorTempSecret?: string;
  twoFactorBackupCodes?: string[];
  failedLoginAttempts?: number;
  lockoutUntil?: Date;
  lastLoginAt?: Date;
}

export interface IUserDocument extends IUser {
  _doc?: IUser;
}

export interface UserAuthPayload {
  _id: string;
  name: string;
  email: string;
  token: string;
  loggedIn: boolean;
  userRole: string;
  shelterId?: string;
  shelter?: IShelter | null;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
  requiresTwoFactor?: boolean;
  twoFactorSetupPending?: boolean;
}

// Animal Types
export type AnimalStatus = 'available' | 'pending' | 'adopted' | 'hold' | 'fostered' | 'transferred' | 'deceased';
export type AnimalSize = 'small' | 'medium' | 'large' | 'extra-large';
export type EnergyLevel = 'low' | 'moderate' | 'high';

export interface IMedicalRecord {
  _id?: Types.ObjectId | string;
  date: string;
  recordType: string;
  description: string;
  veterinarian?: string;
}

export interface IAnimal {
  _id: Types.ObjectId | string;
  name: string;
  type: string;
  breed: string;
  age: number;
  sex: string;
  color: string;
  description: string;
  image: string;
  images: string[];
  video: string;
  status: AnimalStatus;
  size?: AnimalSize;
  temperament?: string;
  energyLevel?: EnergyLevel;
  houseTrained?: boolean;
  goodWithKids?: boolean;
  goodWithDogs?: boolean;
  goodWithCats?: boolean;
  personalityTraits?: string[];
  specialNeeds?: string;
  microchipId?: string;
  intakeDate?: Date;
  intakeSource?: string;
  adoptionFee?: number;
  medicalRecords: IMedicalRecord[];
  applications: (Types.ObjectId | string)[];
}

export interface IAnimalDocument extends IAnimal {
  _doc?: IAnimal;
}

// Shelter Types
export interface IShelter {
  _id: Types.ObjectId | string;
  name: string;
  location: string;
  users: (Types.ObjectId | string)[];
  paymentEmail: string;
  phone?: string;
  email?: string;
  website?: string;
  hours?: string;
  description?: string;
  verified?: boolean;
  verifiedAt?: Date;
  animals: (Types.ObjectId | string)[];
}

export interface IShelterDocument extends IShelter {
  _doc?: IShelter;
}

// Application Types
export type ApplicationStatus = 'submitted' | 'under_review' | 'approved' | 'rejected';

export interface IApplication {
  _id: Types.ObjectId | string;
  animalId: string;
  userId: string;
  applicationData: string;
  status: ApplicationStatus;
  submittedAt: Date;
}

export interface IApplicationDocument extends IApplication {
  _doc?: IApplication;
}

// Success Story Types
export interface ISuccessStory {
  _id: Types.ObjectId | string;
  userId: string;
  animalName: string;
  animalType: string;
  title: string;
  story: string;
  image?: string;
  createdAt: Date;
}

export interface ISuccessStoryDocument extends ISuccessStory {
  _doc?: ISuccessStory;
}

// Authentication Types
export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  userRole: string;
  shelterId?: string;
  shelterName?: string;
  shelterLocation?: string;
  shelterPaymentEmail?: string;
}

export interface LoginInput {
  email: string;
  password: string;
  totpCode?: string;
  backupCode?: string;
}

export interface ValidationResult {
  message: string;
  isValid: boolean;
}

// GraphQL Resolver Context
export interface GraphQLContext {
  user?: IUser | null;
}

// Config Types
export interface Keys {
  MONGO_URI: string;
  secretOrKey: string;
  fbookKey: string;
  fbookClient: string;
  fbookCallbackURL?: string;
  googClient: string;
  googkey: string;
}
