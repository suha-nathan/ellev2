import Task from "@/lib/models/task";
import { seedSegments } from "./segments";

export const seedTasks = async () => {
  const { learningPlans, segments } = await seedSegments();
  const allTasks = [];

  for (const segment of segments) {
    const taskCount = Math.floor(Math.random() * 4) + 1; // 1 to 4 tasks per segment

    const tasks = await Task.insertMany(
      Array.from({ length: taskCount }).map((_, i) => ({
        title: `${segment.title} - Task ${i + 1}`,
        description: `Task ${i + 1} for ${segment.title}`,
        type: "reading",
        isComplete: false,
        priority: ["high", "medium", "low"][Math.floor(Math.random() * 3)],
        segmentId: segment._id,
      }))
    );

    allTasks.push(...tasks);
  }

  return {
    learningPlans,
    segments,
    tasks: allTasks,
  };
};
