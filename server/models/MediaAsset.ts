import mongoose, { Schema, Document, Model } from 'mongoose';

export interface MediaAssetDocument extends Document {
  animalId: string;
  shelterId: string;
  publicId: string;
  url: string;
  thumbnailUrl: string;
  mediumUrl: string;
  width: number;
  height: number;
  mimeType: string;
  sizeBytes: number;
  uploadedBy: string;
  sortOrder: number;
  viewCount: number;
  createdAt: Date;
}

const MediaAssetSchema = new Schema<MediaAssetDocument>({
  animalId: {
    type: String,
    required: true,
    index: true,
  },
  shelterId: {
    type: String,
    required: true,
  },
  publicId: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  thumbnailUrl: {
    type: String,
    default: '',
  },
  mediumUrl: {
    type: String,
    default: '',
  },
  width: {
    type: Number,
    default: 0,
  },
  height: {
    type: Number,
    default: 0,
  },
  mimeType: {
    type: String,
    default: 'image/jpeg',
  },
  sizeBytes: {
    type: Number,
    default: 0,
  },
  uploadedBy: {
    type: String,
    default: '',
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
  viewCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

MediaAssetSchema.index({ animalId: 1, sortOrder: 1 });

const MediaAsset: Model<MediaAssetDocument> = mongoose.model<MediaAssetDocument>(
  'mediaAsset',
  MediaAssetSchema
);

export default MediaAsset;
