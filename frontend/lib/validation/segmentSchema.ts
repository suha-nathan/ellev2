import { z } from "zod";

export const segmentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  start: z.string().datetime("Start must be a valid ISO date string"),
  end: z.string().datetime("End must be a valid ISO date string").optional(),
  learningPlanId: z.string(),
  tasks: z.array(z.string()).optional(),
});
