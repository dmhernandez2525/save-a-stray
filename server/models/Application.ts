import mongoose, { Schema, Document, Model } from 'mongoose';
import { IApplication } from '../../shared/types';

export interface ApplicationDocument extends Document, Omit<IApplication, '_id'> {}

const ApplicationSchema = new Schema<ApplicationDocument>({
  animalId: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  applicationData: {
    type: String,
    required: true
  }
});

const Application: Model<ApplicationDocument> = mongoose.model<ApplicationDocument>('application', ApplicationSchema);

export default Application;
