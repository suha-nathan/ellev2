import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  type: z.string().optional(),
  assignedResource: z.string().optional(), // MongoDB ObjectId, left as string
  isComplete: z.boolean().optional().default(false),
  priority: z.enum(["high", "medium", "low"]).default("medium"),
  segmentId: z.string(),
});
