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
    minAge?: number;
    maxAge?: number;
  };
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
    minAge: { type: Number },
    maxAge: { type: Number }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const SavedSearch: Model<SavedSearchDocument> = mongoose.model<SavedSearchDocument>('savedSearch', SavedSearchSchema);

export default SavedSearch;
