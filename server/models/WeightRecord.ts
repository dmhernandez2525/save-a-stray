import mongoose, { Document, Schema } from "mongoose";

export interface IWeightRecord extends Document {
  animalId: string;
  shelterId: string;
  weight: number;
  unit: "lbs" | "kg";
  recordedAt: Date;
  recordedBy: string;
  notes: string;
  createdAt: Date;
}

const WeightRecordSchema = new Schema<IWeightRecord>({
  animalId: {
    type: String,
    required: true,
  },
  shelterId: {
    type: String,
    required: true,
  },
  weight: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    enum: ["lbs", "kg"],
    default: "lbs",
  },
  recordedAt: {
    type: Date,
    default: Date.now,
  },
  recordedBy: {
    type: String,
    default: "",
  },
  notes: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IWeightRecord>("weightRecord", WeightRecordSchema);
