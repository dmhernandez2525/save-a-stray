import mongoose, { Schema, Document, Model } from 'mongoose';

export interface MessageAttachment {
  url: string;
  filename: string;
  mimeType: string;
  size: number;
}

export interface MessageDocument extends Document {
  senderId: string;
  recipientId: string;
  shelterId: string;
  threadId: string;
  animalId: string;
  content: string;
  read: boolean;
  readAt?: Date;
  delivered: boolean;
  deliveredAt?: Date;
  attachments: MessageAttachment[];
  templateId: string;
  archived: boolean;
  createdAt: Date;
}

const MessageAttachmentSchema = new Schema({
  url: { type: String, required: true },
  filename: { type: String, default: '' },
  mimeType: { type: String, default: '' },
  size: { type: Number, default: 0 },
}, { _id: false });

const MessageSchema = new Schema<MessageDocument>({
  senderId: {
    type: String,
    required: true
  },
  recipientId: {
    type: String,
    required: true
  },
  shelterId: {
    type: String,
    required: true
  },
  threadId: {
    type: String,
    default: '',
    index: true,
  },
  animalId: {
    type: String,
    default: '',
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: { type: Date },
  delivered: {
    type: Boolean,
    default: false,
  },
  deliveredAt: { type: Date },
  attachments: {
    type: [MessageAttachmentSchema],
    default: [],
  },
  templateId: {
    type: String,
    default: '',
  },
  archived: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

MessageSchema.index({ senderId: 1, createdAt: -1 });
MessageSchema.index({ recipientId: 1, createdAt: -1 });
MessageSchema.index({ shelterId: 1, createdAt: -1 });
MessageSchema.index({ threadId: 1, createdAt: 1 });
MessageSchema.index({ content: 'text' });

const Message: Model<MessageDocument> = mongoose.model<MessageDocument>('message', MessageSchema);

export default Message;
