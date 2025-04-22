import { z } from "zod";

export const learningPlanSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  owner: z.string().min(1), // will be validated as a Mongo ObjectId
  objectives: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  category: z.object({
    name: z.string().min(1),
    icon: z.string().optional(),
  }),
  segments: z.array(z.string()).optional(),
  resources: z.array(z.string()).optional(),
  isPublic: z.boolean(),
  start: z.string().optional(), // ISO date strings
  end: z.string().optional(),
});
