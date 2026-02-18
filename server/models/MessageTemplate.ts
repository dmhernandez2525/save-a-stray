import mongoose, { Schema, Document, Model } from 'mongoose';

export interface MessageTemplateDocument extends Document {
  shelterId: string;
  name: string;
  category: string;
  subject: string;
  body: string;
  variables: string[];
  isActive: boolean;
  usageCount: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const MessageTemplateSchema = new Schema<MessageTemplateDocument>({
  shelterId: {
    type: String,
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    default: 'general',
  },
  subject: {
    type: String,
    default: '',
  },
  body: {
    type: String,
    required: true,
  },
  variables: {
    type: [String],
    default: [],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  usageCount: {
    type: Number,
    default: 0,
  },
  createdBy: {
    type: String,
    default: '',
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

MessageTemplateSchema.index({ shelterId: 1, category: 1 });

MessageTemplateSchema.pre('save', function () {
  this.updatedAt = new Date();
});

const MessageTemplate: Model<MessageTemplateDocument> = mongoose.model<MessageTemplateDocument>(
  'messageTemplate',
  MessageTemplateSchema
);

export default MessageTemplate;
