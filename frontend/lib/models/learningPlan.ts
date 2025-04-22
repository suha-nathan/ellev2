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
      name: { type: String, required: true },
      icon: { type: String },
    },
    segments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Segment" }],
    resources: [{ type: mongoose.Schema.Types.ObjectId, ref: "Resource" }],
    isPublic: { type: Boolean, default: false },
    start: { type: Date },
    end: { type: Date },
  },
  { timestamps: true }
);

LearningPlanSchema.index(
  {
    title: "text",
    description: "text",
    objectives: "text",
    tags: "text",
  },
  {
    weights: {
      title: 5,
      "category.name": 4,
      tags: 3,
      objectives: 2,
      description: 1,
    },
    name: "TextSearchIndex",
  }
);

export const LearningPlan =
  mongoose.models.LearningPlan ||
  mongoose.model("LearningPlan", LearningPlanSchema);
