import mongoose, { Schema, Document, Model } from 'mongoose';
import { IUser } from '../../shared/types';

export interface UserDocument extends Document, Omit<IUser, '_id'> {}

const UserSchema = new Schema<UserDocument>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 64,
    minlength: 2,
    index: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true,
  },
  userRole: {
    type: String,
    required: true,
  },
  paymentEmail: {
    type: String,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    maxlength: 128,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  fbookId: {
    type: String,
  },
  googleId: {
    type: String,
  },
  shelterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'shelter',
  },
  varId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  favorites: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'animal',
    },
  ],
  emailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationTokenHash: {
    type: String,
  },
  emailVerificationExpiresAt: {
    type: Date,
  },
  passwordResetTokenHash: {
    type: String,
  },
  passwordResetExpiresAt: {
    type: Date,
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false,
  },
  twoFactorSecret: {
    type: String,
  },
  twoFactorTempSecret: {
    type: String,
  },
  twoFactorBackupCodes: [
    {
      type: String,
    },
  ],
  failedLoginAttempts: {
    type: Number,
    default: 0,
  },
  lockoutUntil: {
    type: Date,
  },
  lastLoginAt: {
    type: Date,
  },
  bio: {
    type: String,
    default: '',
  },
  phone: {
    type: String,
    default: '',
  },
  avatar: {
    type: String,
    default: '',
  },
  profileVisibility: {
    type: String,
    enum: ['public', 'shelters_only', 'private'],
    default: 'shelters_only',
  },
  showFavorites: {
    type: Boolean,
    default: false,
  },
  showAdoptionHistory: {
    type: Boolean,
    default: false,
  },
});

UserSchema.index({ emailVerificationTokenHash: 1 });
UserSchema.index({ passwordResetTokenHash: 1 });
UserSchema.index({ googleId: 1 }, { sparse: true });
UserSchema.index({ fbookId: 1 }, { sparse: true });

const User: Model<UserDocument> = mongoose.model<UserDocument>('user', UserSchema);

export default User;
