import mongoose, { Schema, Document, Model } from 'mongoose';

export interface VolunteerDocument extends Document {
  shelterId: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  skills: string[];
  availability: string;
  status: 'active' | 'inactive' | 'pending';
  startDate: Date;
  totalHours: number;
  notes: string;
  createdAt: Date;
}

const VolunteerSchema = new Schema<VolunteerDocument>({
  shelterId: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    default: ''
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  skills: {
    type: [String],
    default: []
  },
  availability: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'pending'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  totalHours: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Volunteer: Model<VolunteerDocument> = mongoose.model<VolunteerDocument>('volunteer', VolunteerSchema);

export default Volunteer;
