import mongoose, { Schema, Document, Model } from 'mongoose';

export type ShelterRole = 'owner' | 'admin' | 'staff' | 'volunteer' | 'readonly';

export interface ShelterStaffRoleDocument extends Document {
  shelterId: string;
  userId: string;
  role: ShelterRole;
  assignedAnimals: string[];
  assignedBy: string;
  createdAt: Date;
}

const ShelterStaffRoleSchema = new Schema<ShelterStaffRoleDocument>({
  shelterId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['owner', 'admin', 'staff', 'volunteer', 'readonly'],
    default: 'staff',
  },
  assignedAnimals: [{
    type: String,
  }],
  assignedBy: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

ShelterStaffRoleSchema.index({ shelterId: 1, userId: 1 }, { unique: true });
ShelterStaffRoleSchema.index({ shelterId: 1, role: 1 });

const ShelterStaffRole: Model<ShelterStaffRoleDocument> = mongoose.model<ShelterStaffRoleDocument>(
  'shelterStaffRole',
  ShelterStaffRoleSchema
);

export default ShelterStaffRole;
