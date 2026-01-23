import mongoose, { Schema, Document, Model } from 'mongoose';

export interface TemplateField {
  label: string;
  fieldType: 'text' | 'textarea' | 'select' | 'checkbox' | 'number';
  required: boolean;
  options: string[];
}

export interface ApplicationTemplateDocument extends Document {
  shelterId: string;
  name: string;
  fields: TemplateField[];
  createdAt: Date;
}

const TemplateFieldSchema = new Schema<TemplateField>({
  label: { type: String, required: true },
  fieldType: {
    type: String,
    required: true,
    enum: ['text', 'textarea', 'select', 'checkbox', 'number']
  },
  required: { type: Boolean, default: false },
  options: [{ type: String }]
}, { _id: false });

const ApplicationTemplateSchema = new Schema<ApplicationTemplateDocument>({
  shelterId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  fields: [TemplateFieldSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ApplicationTemplate: Model<ApplicationTemplateDocument> = mongoose.model<ApplicationTemplateDocument>('applicationTemplate', ApplicationTemplateSchema);

export default ApplicationTemplate;
