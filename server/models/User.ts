import mongoose, { Schema, Document, Model } from 'mongoose';
import { IUser, IUserDocument } from '../../shared/types';

export interface UserDocument extends Document, Omit<IUser, '_id'> {}

const UserSchema = new Schema<UserDocument>({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  userRole: {
    type: String,
    required: true
  },
  paymentEmail: {
    type: String
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    maxlength: 32
  },
  date: {
    type: Date,
    default: Date.now
  },
  fbookId: {
    type: String,
  },
  shelterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'shelter'
  },
  varId: {
    type: mongoose.Schema.Types.ObjectId
  }
});

const User: Model<UserDocument> = mongoose.model<UserDocument>('user', UserSchema);

export default User;
