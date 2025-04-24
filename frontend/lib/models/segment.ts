import mongoose from "mongoose";
import Task from "@/lib/models/task";

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
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
  },
  { timestamps: true }
);

SegmentSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Task.deleteMany({ segmentId: doc._id });
  }
});

export default mongoose.models.Segment ||
  mongoose.model("Segment", SegmentSchema);
