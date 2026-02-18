import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ShareEventDocument extends Document {
  entityType: 'animal' | 'shelter' | 'event' | 'success_story';
  entityId: string;
  shelterId: string;
  userId: string;
  platform: 'facebook' | 'twitter' | 'instagram' | 'pinterest' | 'email' | 'qr_code' | 'copy_link' | 'embed';
  referralCode: string;
  clickCount: number;
  applicationCount: number;
  createdAt: Date;
}

const ShareEventSchema = new Schema<ShareEventDocument>({
  entityType: {
    type: String,
    enum: ['animal', 'shelter', 'event', 'success_story'],
    required: true,
  },
  entityId: {
    type: String,
    required: true,
    index: true,
  },
  shelterId: {
    type: String,
    default: '',
    index: true,
  },
  userId: {
    type: String,
    default: '',
  },
  platform: {
    type: String,
    enum: ['facebook', 'twitter', 'instagram', 'pinterest', 'email', 'qr_code', 'copy_link', 'embed'],
    required: true,
  },
  referralCode: {
    type: String,
    default: '',
    index: true,
  },
  clickCount: {
    type: Number,
    default: 0,
  },
  applicationCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

ShareEventSchema.index({ entityType: 1, entityId: 1, platform: 1 });
ShareEventSchema.index({ shelterId: 1, createdAt: -1 });

const ShareEvent: Model<ShareEventDocument> = mongoose.model<ShareEventDocument>(
  'shareEvent',
  ShareEventSchema
);

export default ShareEvent;
