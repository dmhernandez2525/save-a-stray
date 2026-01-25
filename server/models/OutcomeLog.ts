import mongoose, { Document, Schema } from "mongoose";

export interface IOutcomeLog extends Document {
  animalId: string;
  shelterId: string;
  outcomeDate: Date;
  outcomeType: "adoption" | "transfer" | "return_to_owner" | "euthanasia" | "died" | "escaped" | "release" | "other";
  destination: string;
  condition: "healthy" | "injured" | "sick" | "unknown";
  outcomeNotes: string;
  processedBy: string;
  createdAt: Date;
}

const OutcomeLogSchema = new Schema<IOutcomeLog>({
  animalId: {
    type: String,
    required: true,
  },
  shelterId: {
    type: String,
    required: true,
  },
  outcomeDate: {
    type: Date,
    default: Date.now,
  },
  outcomeType: {
    type: String,
    enum: ["adoption", "transfer", "return_to_owner", "euthanasia", "died", "escaped", "release", "other"],
    required: true,
  },
  destination: {
    type: String,
    default: "",
  },
  condition: {
    type: String,
    enum: ["healthy", "injured", "sick", "unknown"],
    default: "healthy",
  },
  outcomeNotes: {
    type: String,
    default: "",
  },
  processedBy: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IOutcomeLog>("outcomeLog", OutcomeLogSchema);
