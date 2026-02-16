import mongoose, { Schema, Document, Model } from 'mongoose';

export interface SavedSearchDocument extends Document {
  userId: string;
  name: string;
  filters: {
    type?: string;
    breed?: string;
    sex?: string;
    color?: string;
    status?: string;
    size?: string;
    energyLevel?: string;
    goodWithKids?: boolean;
    goodWithDogs?: boolean;
    goodWithCats?: boolean;
    houseTrained?: boolean;
    minAge?: number;
    maxAge?: number;
  };
  alertsEnabled: boolean;
  createdAt: Date;
}

const SavedSearchSchema = new Schema<SavedSearchDocument>({
  userId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  filters: {
    type: { type: String },
    breed: { type: String },
    sex: { type: String },
    color: { type: String },
    status: { type: String },
    size: { type: String },
    energyLevel: { type: String },
    goodWithKids: { type: Boolean },
    goodWithDogs: { type: Boolean },
    goodWithCats: { type: Boolean },
    houseTrained: { type: Boolean },
    minAge: { type: Number },
    maxAge: { type: Number }
  },
  alertsEnabled: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const SavedSearch: Model<SavedSearchDocument> = mongoose.model<SavedSearchDocument>('savedSearch', SavedSearchSchema);

export default SavedSearch;
