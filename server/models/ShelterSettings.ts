import mongoose, { Schema, Document, Model } from 'mongoose';

interface DaySchedule {
  day: string;
  open: string;
  close: string;
  closed: boolean;
}

interface HolidayClosure {
  date: Date;
  reason: string;
}

interface NotificationPreferences {
  newApplication: boolean;
  statusChange: boolean;
  capacityAlert: boolean;
  newMessage: boolean;
  volunteerSignup: boolean;
  donationReceived: boolean;
}

interface IntegrationConfig {
  enabled: boolean;
  apiKey: string;
}

interface AdoptionRequirements {
  minAdopterAge: number;
  homeVisitRequired: boolean;
  referencesRequired: number;
  fenceRequired: boolean;
  landlordApproval: boolean;
}

export interface ShelterSettingsDocument extends Document {
  shelterId: string;
  logo: string;
  primaryColor: string;
  timezone: string;
  weeklySchedule: DaySchedule[];
  holidayClosures: HolidayClosure[];
  adoptionPolicy: string;
  adoptionRequirements: AdoptionRequirements;
  notificationPreferences: NotificationPreferences;
  integrations: Record<string, IntegrationConfig>;
  customCertificateTemplate: string;
  verificationDocuments: string[];
  updatedAt: Date;
}

const DayScheduleSchema = new Schema({
  day: { type: String, required: true },
  open: { type: String, default: '09:00' },
  close: { type: String, default: '17:00' },
  closed: { type: Boolean, default: false },
}, { _id: false });

const HolidayClosureSchema = new Schema({
  date: { type: Date, required: true },
  reason: { type: String, default: '' },
}, { _id: false });

const ShelterSettingsSchema = new Schema<ShelterSettingsDocument>({
  shelterId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  logo: {
    type: String,
    default: '',
  },
  primaryColor: {
    type: String,
    default: '#4F46E5',
  },
  timezone: {
    type: String,
    default: 'America/New_York',
  },
  weeklySchedule: {
    type: [DayScheduleSchema],
    default: [
      { day: 'Monday', open: '09:00', close: '17:00', closed: false },
      { day: 'Tuesday', open: '09:00', close: '17:00', closed: false },
      { day: 'Wednesday', open: '09:00', close: '17:00', closed: false },
      { day: 'Thursday', open: '09:00', close: '17:00', closed: false },
      { day: 'Friday', open: '09:00', close: '17:00', closed: false },
      { day: 'Saturday', open: '10:00', close: '16:00', closed: false },
      { day: 'Sunday', open: '10:00', close: '16:00', closed: true },
    ],
  },
  holidayClosures: {
    type: [HolidayClosureSchema],
    default: [],
  },
  adoptionPolicy: {
    type: String,
    default: '',
  },
  adoptionRequirements: {
    minAdopterAge: { type: Number, default: 18 },
    homeVisitRequired: { type: Boolean, default: false },
    referencesRequired: { type: Number, default: 0 },
    fenceRequired: { type: Boolean, default: false },
    landlordApproval: { type: Boolean, default: false },
  },
  notificationPreferences: {
    newApplication: { type: Boolean, default: true },
    statusChange: { type: Boolean, default: true },
    capacityAlert: { type: Boolean, default: true },
    newMessage: { type: Boolean, default: true },
    volunteerSignup: { type: Boolean, default: true },
    donationReceived: { type: Boolean, default: true },
  },
  integrations: {
    type: Map,
    of: new Schema({ enabled: Boolean, apiKey: String }, { _id: false }),
    default: {},
  },
  customCertificateTemplate: {
    type: String,
    default: '',
  },
  verificationDocuments: {
    type: [String],
    default: [],
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const ShelterSettings: Model<ShelterSettingsDocument> = mongoose.model<ShelterSettingsDocument>(
  'shelterSettings',
  ShelterSettingsSchema
);

export default ShelterSettings;
