import mongoose, { Schema, Document, Model } from 'mongoose';

export interface TerminalReaderDocument extends Document {
  shelterId: string;
  stripeReaderId: string;
  label: string;
  deviceType: string;
  serialNumber: string;
  location: string;
  status: 'online' | 'offline';
  registeredAt: Date;
}

const TerminalReaderSchema = new Schema<TerminalReaderDocument>({
  shelterId: {
    type: String,
    required: true
  },
  stripeReaderId: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  deviceType: {
    type: String,
    default: 'simulated'
  },
  serialNumber: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['online', 'offline'],
    default: 'offline'
  },
  registeredAt: {
    type: Date,
    default: Date.now
  }
});

const TerminalReader: Model<TerminalReaderDocument> = mongoose.model<TerminalReaderDocument>('terminalReader', TerminalReaderSchema);

export default TerminalReader;
