import mongoose, { Schema, Document, Model } from 'mongoose';

export interface EventRegistration {
  userId: string;
  name: string;
  email: string;
  registeredAt: Date;
  status: 'registered' | 'waitlisted' | 'cancelled' | 'attended';
}

export interface EventReminder {
  type: '1_week' | '1_day' | '1_hour';
  scheduledFor: Date;
  sent: boolean;
}

export interface EventDocument extends Document {
  shelterId: string;
  title: string;
  description: string;
  date: Date;
  endDate?: Date;
  location: string;
  eventType: 'adoption_day' | 'fundraiser' | 'volunteer' | 'education' | 'other';
  capacity: number;
  registrations: EventRegistration[];
  waitlist: EventRegistration[];
  isVirtual: boolean;
  virtualLink: string;
  virtualPlatform: string;
  featuredAnimalIds: string[];
  photos: string[];
  tags: string[];
  isRecurring: boolean;
  recurringPattern: string;
  recurringEndDate?: Date;
  parentEventId: string;
  reminders: EventReminder[];
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  registrationCount: number;
  attendanceCount: number;
  applicationsGenerated: number;
  slug: string;
  createdAt: Date;
}

const EventRegistrationSchema = new Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  registeredAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['registered', 'waitlisted', 'cancelled', 'attended'],
    default: 'registered',
  },
}, { _id: true });

const EventReminderSchema = new Schema({
  type: {
    type: String,
    enum: ['1_week', '1_day', '1_hour'],
    required: true,
  },
  scheduledFor: { type: Date, required: true },
  sent: { type: Boolean, default: false },
}, { _id: false });

const EventSchema = new Schema<EventDocument>({
  shelterId: {
    type: String,
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  date: {
    type: Date,
    required: true,
    index: true,
  },
  endDate: {
    type: Date
  },
  location: {
    type: String,
    default: ''
  },
  eventType: {
    type: String,
    required: true,
    enum: ['adoption_day', 'fundraiser', 'volunteer', 'education', 'other'],
    default: 'other'
  },
  capacity: {
    type: Number,
    default: 0,
  },
  registrations: {
    type: [EventRegistrationSchema],
    default: [],
  },
  waitlist: {
    type: [EventRegistrationSchema],
    default: [],
  },
  isVirtual: {
    type: Boolean,
    default: false,
  },
  virtualLink: {
    type: String,
    default: '',
  },
  virtualPlatform: {
    type: String,
    default: '',
  },
  featuredAnimalIds: {
    type: [String],
    default: [],
  },
  photos: {
    type: [String],
    default: [],
  },
  tags: {
    type: [String],
    default: [],
  },
  isRecurring: {
    type: Boolean,
    default: false,
  },
  recurringPattern: {
    type: String,
    default: '',
  },
  recurringEndDate: {
    type: Date,
  },
  parentEventId: {
    type: String,
    default: '',
  },
  reminders: {
    type: [EventReminderSchema],
    default: [],
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'draft',
  },
  registrationCount: {
    type: Number,
    default: 0,
  },
  attendanceCount: {
    type: Number,
    default: 0,
  },
  applicationsGenerated: {
    type: Number,
    default: 0,
  },
  slug: {
    type: String,
    default: '',
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

EventSchema.index({ status: 1, date: 1 });
EventSchema.index({ eventType: 1 });

const Event: Model<EventDocument> = mongoose.model<EventDocument>('event', EventSchema);

export default Event;
