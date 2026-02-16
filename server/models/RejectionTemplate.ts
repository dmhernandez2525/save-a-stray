import mongoose, { Schema, Document, Model } from 'mongoose';

export interface RejectionTemplateDocument extends Document {
  shelterId: string;
  name: string;
  subject: string;
  body: string;
  createdAt: Date;
}

const RejectionTemplateSchema = new Schema<RejectionTemplateDocument>({
  shelterId: {
    type: String,
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    default: 'Application Update',
  },
  body: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const RejectionTemplate: Model<RejectionTemplateDocument> = mongoose.model<RejectionTemplateDocument>(
  'rejectionTemplate',
  RejectionTemplateSchema
);

export default RejectionTemplate;
