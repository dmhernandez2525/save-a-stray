import mongoose, { Schema, Document, Model } from 'mongoose';

export interface MessageDocument extends Document {
  senderId: string;
  recipientId: string;
  shelterId: string;
  content: string;
  read: boolean;
  createdAt: Date;
}

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
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Message: Model<MessageDocument> = mongoose.model<MessageDocument>('message', MessageSchema);

export default Message;
