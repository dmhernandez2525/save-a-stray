import mongoose, { Schema, Document, Model } from 'mongoose';

export interface InternalNoteDocument extends Document {
  shelterId: string;
  entityType: 'animal' | 'application' | 'shelter' | 'general';
  entityId: string;
  content: string;
  author: string;
  createdAt: Date;
}

const InternalNoteSchema = new Schema<InternalNoteDocument>({
  shelterId: {
    type: String,
    required: true,
    index: true,
  },
  entityType: {
    type: String,
    enum: ['animal', 'application', 'shelter', 'general'],
    default: 'general',
  },
  entityId: {
    type: String,
    default: '',
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

InternalNoteSchema.index({ shelterId: 1, entityType: 1, entityId: 1 });

const InternalNote: Model<InternalNoteDocument> = mongoose.model<InternalNoteDocument>(
  'internalNote',
  InternalNoteSchema
);

export default InternalNote;
