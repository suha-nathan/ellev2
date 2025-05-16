import { z } from "zod";

export const segmentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  start: z.date({ required_error: "Start date is required" }),
  end: z.date().optional(),
  learningPlanId: z.string(),
});
