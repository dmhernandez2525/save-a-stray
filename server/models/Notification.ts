import mongoose, { Schema, Document, Model } from 'mongoose';

export interface NotificationDocument extends Document {
  userId: string;
  message: string;
  type: string;
  read: boolean;
  link?: string;
  createdAt: Date;
}

const NotificationSchema = new Schema<NotificationDocument>({
  userId: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, required: true, enum: ['application_update', 'new_application', 'favorite_available', 'system'] },
  read: { type: Boolean, default: false },
  link: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const Notification: Model<NotificationDocument> = mongoose.model<NotificationDocument>('notification', NotificationSchema);

export default Notification;
