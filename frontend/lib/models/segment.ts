import mongoose from "mongoose";
import { Task } from "@/lib/models/task";

const SegmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    start: { type: Date, required: true },
    end: { type: Date },
    learningPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "LearningPlan",
    },
  },
  { timestamps: true }
);

SegmentSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Task.deleteMany({ segmentId: doc._id });
  }
});

export const Segment =
  mongoose.models.Segment || mongoose.model("Segment", SegmentSchema);
