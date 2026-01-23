import mongoose, { Schema, Document, Model } from 'mongoose';

export interface EventDocument extends Document {
  shelterId: string;
  title: string;
  description: string;
  date: Date;
  endDate?: Date;
  location: string;
  eventType: 'adoption_day' | 'fundraiser' | 'volunteer' | 'education' | 'other';
}

const EventSchema = new Schema<EventDocument>({
  shelterId: {
    type: String,
    required: true
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
    required: true
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
  }
});

const Event: Model<EventDocument> = mongoose.model<EventDocument>('event', EventSchema);

export default Event;
