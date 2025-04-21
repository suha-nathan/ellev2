import mongoose from "mongoose";

const LearningPlanSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    objectives: [{ type: String }],
    tags: [{ type: String }],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    segments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Segment" }],
    resources: [{ type: mongoose.Schema.Types.ObjectId, ref: "Resource" }],
    isPublic: { type: Boolean, default: false },
    start: { type: Date },
    end: { type: Date },
  },
  { timestamps: true }
);

export const LearningPlan =
  mongoose.models.LearningPlan ||
  mongoose.model("LearningPlan", LearningPlanSchema);
