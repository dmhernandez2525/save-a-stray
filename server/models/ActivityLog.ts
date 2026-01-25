import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ActivityLogDocument extends Document {
  shelterId: string;
  action: string;
  entityType: 'animal' | 'application' | 'user' | 'shelter' | 'event' | 'donation';
  entityId: string;
  description: string;
  createdAt: Date;
}

const ActivityLogSchema = new Schema<ActivityLogDocument>({
  shelterId: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true
  },
  entityType: {
    type: String,
    required: true,
    enum: ['animal', 'application', 'user', 'shelter', 'event', 'donation']
  },
  entityId: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ActivityLog: Model<ActivityLogDocument> = mongoose.model<ActivityLogDocument>('activityLog', ActivityLogSchema);

export default ActivityLog;
