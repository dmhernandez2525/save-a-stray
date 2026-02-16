import mongoose, { Schema, Document, Model } from 'mongoose';

export interface MessageThreadDocument extends Document {
  shelterId: string;
  participants: string[];
  animalId: string;
  subject: string;
  lastMessageAt: Date;
  lastMessagePreview: string;
  unreadCount: Map<string, number>;
  status: 'active' | 'archived' | 'closed';
  assignedTo: string;
  routingCategory: string;
  createdAt: Date;
}

const MessageThreadSchema = new Schema<MessageThreadDocument>({
  shelterId: {
    type: String,
    required: true,
    index: true,
  },
  participants: {
    type: [String],
    required: true,
  },
  animalId: {
    type: String,
    default: '',
  },
  subject: {
    type: String,
    default: '',
  },
  lastMessageAt: {
    type: Date,
    default: Date.now,
  },
  lastMessagePreview: {
    type: String,
    default: '',
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: new Map(),
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'closed'],
    default: 'active',
  },
  assignedTo: {
    type: String,
    default: '',
  },
  routingCategory: {
    type: String,
    default: 'general',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

MessageThreadSchema.index({ participants: 1 });
MessageThreadSchema.index({ shelterId: 1, status: 1, lastMessageAt: -1 });

const MessageThread: Model<MessageThreadDocument> = mongoose.model<MessageThreadDocument>(
  'messageThread',
  MessageThreadSchema
);

export default MessageThread;
