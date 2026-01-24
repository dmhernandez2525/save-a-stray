import mongoose, { Schema, Document } from 'mongoose';

export interface AnnouncementDocument extends Document {
  shelterId: string;
  title: string;
  content: string;
  category: 'general' | 'event' | 'urgent' | 'adoption';
  author: string;
  pinned: boolean;
  active: boolean;
  createdAt: Date;
}

const AnnouncementSchema = new Schema<AnnouncementDocument>({
  shelterId: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, enum: ['general', 'event', 'urgent', 'adoption'], default: 'general' },
  author: { type: String, default: '' },
  pinned: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const Announcement = mongoose.model<AnnouncementDocument>('announcement', AnnouncementSchema);

export default Announcement;
