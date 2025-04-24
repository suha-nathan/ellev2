import { Types } from "mongoose";
import { LearningPlan } from "@/lib/models/learningPlan";
import Segment from "@/lib/models/segment";

export const seedSegments = async () => {
  const learningPlans = await LearningPlan.insertMany([
    {
      title: "Plan One",
      description: "Test Plan 1",
      owner: new Types.ObjectId(),
      objectives: ["Goal A"],
      tags: ["test", "plan1"],
      category: { name: "Category A" },
      resources: [],
      isPublic: true,
      start: new Date(),
      end: new Date(),
    },
    {
      title: "Plan Two",
      description: "Test Plan 2",
      owner: new Types.ObjectId(),
      objectives: ["Goal B"],
      tags: ["test", "plan2"],
      category: { name: "Category B" },
      resources: [],
      isPublic: true,
      start: new Date(),
      end: new Date(),
    },
    {
      title: "Plan Three",
      description: "Test Plan 3",
      owner: new Types.ObjectId(),
      objectives: ["Goal C"],
      tags: ["test", "plan3"],
      category: { name: "Category C" },
      resources: [],
      isPublic: true,
      start: new Date(),
      end: new Date(),
    },
  ]);

  const allSegments = [];

  for (const plan of learningPlans) {
    const segmentCount = Math.floor(Math.random() * 3) + 2; // 2 to 4 segments per learning Plan
    const segments = await Segment.insertMany(
      Array.from({ length: segmentCount }).map((_, i) => ({
        title: `${plan.title} - Segment ${i + 1}`,
        description: `Segment ${i + 1} for ${plan.title}`,
        start: new Date(),
        end: new Date(),
        learningPlanId: plan._id,
      }))
    );

    allSegments.push(...segments);
  }

  return {
    learningPlans,
    segments: allSegments,
  };
};
