import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    type: { type: String },
    assignedResource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource",
    },
    isComplete: { type: Boolean, default: false },
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "medium",
    },
    segmentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Segment",
    },
  },
  { timestamps: true }
);

export const Task = mongoose.models.Task || mongoose.model("Task", TaskSchema);
