import mongoose from "mongoose";
import { connectAggregatorDB } from "@/lib/mongooseAggregator";

const ResourceSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    tags: [String],
    source: String,
    contentType: String,
    url: String,
    provider: String,
    difficulty: String,
    instructors: [String],
    createdAt: Date,
    updatedAt: Date,
  },
  { timestamps: true }
);

ResourceSchema.index({ title: "text", description: "text" });

export async function getResourceModel() {
  const conn = await connectAggregatorDB();
  return conn.models.Resource || conn.model("Resource", ResourceSchema);
}
