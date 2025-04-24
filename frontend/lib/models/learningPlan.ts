import mongoose from "mongoose";
import Segment from "./segment";

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

// Cascade delete segments on plan deletion
LearningPlanSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    const segments = await Segment.find({ learningPlanId: doc._id });
    for (const segment of segments) {
      await Segment.findOneAndDelete({ _id: segment._id });
    }
  }
});

export const LearningPlan =
  mongoose.models.LearningPlan ||
  mongoose.model("LearningPlan", LearningPlanSchema);
