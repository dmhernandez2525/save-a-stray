import mongoose, { Schema, Document, Model } from 'mongoose';

export interface StaffInvitationDocument extends Document {
  shelterId: string;
  email: string;
  role: 'owner' | 'admin' | 'staff' | 'volunteer' | 'readonly';
  invitedBy: string;
  token: string;
  status: 'pending' | 'accepted' | 'expired';
  expiresAt: Date;
  createdAt: Date;
}

const StaffInvitationSchema = new Schema<StaffInvitationDocument>({
  shelterId: {
    type: String,
    required: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['owner', 'admin', 'staff', 'volunteer', 'readonly'],
    default: 'staff',
  },
  invitedBy: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'expired'],
    default: 'pending',
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

StaffInvitationSchema.index({ token: 1 });
StaffInvitationSchema.index({ shelterId: 1, email: 1 });

const StaffInvitation: Model<StaffInvitationDocument> = mongoose.model<StaffInvitationDocument>(
  'staffInvitation',
  StaffInvitationSchema
);

export default StaffInvitation;
