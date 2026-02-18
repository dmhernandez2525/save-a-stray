import mongoose, { Schema, Document, Model } from 'mongoose';

export interface TemplateField {
  label: string;
  fieldType: 'text' | 'textarea' | 'select' | 'checkbox' | 'number' | 'file' | 'date' | 'radio';
  required: boolean;
  options: string[];
  placeholder: string;
  helpText: string;
}

export interface ApplicationTemplateDocument extends Document {
  shelterId: string;
  name: string;
  animalType: string;
  fields: TemplateField[];
  active: boolean;
  createdAt: Date;
}

const TemplateFieldSchema = new Schema<TemplateField>({
  label: { type: String, required: true },
  fieldType: {
    type: String,
    required: true,
    enum: ['text', 'textarea', 'select', 'checkbox', 'number', 'file', 'date', 'radio']
  },
  required: { type: Boolean, default: false },
  options: [{ type: String }],
  placeholder: { type: String, default: '' },
  helpText: { type: String, default: '' },
}, { _id: false });

const ApplicationTemplateSchema = new Schema<ApplicationTemplateDocument>({
  shelterId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  animalType: {
    type: String,
    default: '',
  },
  fields: [TemplateFieldSchema],
  active: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ApplicationTemplate: Model<ApplicationTemplateDocument> = mongoose.model<ApplicationTemplateDocument>('applicationTemplate', ApplicationTemplateSchema);

export default ApplicationTemplate;
