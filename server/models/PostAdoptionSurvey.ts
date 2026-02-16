import mongoose, { Schema, Document, Model } from 'mongoose';

export interface PostAdoptionSurveyDocument extends Document {
  adoptionRecordId: string;
  adopterId: string;
  animalId: string;
  overallSatisfaction: number;
  animalAdjustment: number;
  shelterExperience: number;
  wouldRecommend: boolean;
  challenges: string;
  positives: string;
  additionalComments: string;
  submittedAt: Date;
}

const PostAdoptionSurveySchema = new Schema<PostAdoptionSurveyDocument>({
  adoptionRecordId: {
    type: String,
    required: true,
    index: true,
  },
  adopterId: {
    type: String,
    required: true,
  },
  animalId: {
    type: String,
    required: true,
  },
  overallSatisfaction: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  animalAdjustment: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  shelterExperience: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  wouldRecommend: {
    type: Boolean,
    default: true,
  },
  challenges: {
    type: String,
    default: '',
  },
  positives: {
    type: String,
    default: '',
  },
  additionalComments: {
    type: String,
    default: '',
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

const PostAdoptionSurvey: Model<PostAdoptionSurveyDocument> = mongoose.model<PostAdoptionSurveyDocument>(
  'postAdoptionSurvey',
  PostAdoptionSurveySchema
);

export default PostAdoptionSurvey;
