import mongoose, { Schema, Document, Model } from 'mongoose';

export interface DashboardWidget {
  widgetId: string;
  visible: boolean;
  sortOrder: number;
}

export interface DashboardLayoutDocument extends Document {
  userId: string;
  shelterId: string;
  widgets: DashboardWidget[];
  updatedAt: Date;
}

const DashboardLayoutSchema = new Schema<DashboardLayoutDocument>({
  userId: {
    type: String,
    required: true,
  },
  shelterId: {
    type: String,
    required: true,
  },
  widgets: [{
    widgetId: { type: String, required: true },
    visible: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  }],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

DashboardLayoutSchema.index({ userId: 1, shelterId: 1 }, { unique: true });

const DashboardLayout: Model<DashboardLayoutDocument> = mongoose.model<DashboardLayoutDocument>(
  'dashboardLayout',
  DashboardLayoutSchema
);

export default DashboardLayout;
