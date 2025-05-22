"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Timeline } from "@/components/timeline";

type Task = {
  _id: string;
  title: string;
  description?: string;
  type?: string;
  priority?: "high" | "medium" | "low";
};

type Segment = {
  _id: string;
  title: string;
  description?: string;
  start?: string;
  end?: string;
  tasks?: Task[];
};

type LearningPlan = {
  _id: string;
  title: string;
  description?: string;
  isPublic: boolean;
  start?: string;
  end?: string;
  tags?: string[];
  category: { name: string; icon?: string };
  segments: Segment[];
};

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to load");
    return res.json();
  });

export default function LearningPlanPage() {
  const { planId } = useParams();
  const {
    data: plan,
    error,
    isLoading,
  } = useSWR<LearningPlan>(
    planId ? `/api/learning-plans/${planId}` : null,
    fetcher
  );

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-10 space-y-6">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="p-4 space-y-2">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-3/4" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="max-w-xl mx-auto py-10 text-destructive">
        Plan not found or access denied.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-8">
      <h1 className="text-3xl font-bold">{plan.title}</h1>
      <p className="text-muted-foreground">{plan.description}</p>

      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span>Category: {plan.category.name}</span>
        {plan.start && plan.end && (
          <span>
            • {format(new Date(plan.start), "LLL dd, y")} →{" "}
            {format(new Date(plan.end), "LLL dd, y")}
          </span>
        )}
        {!plan.isPublic && <Badge variant="outline">Private</Badge>}
      </div>

      <div className="flex flex-wrap gap-2">
        {plan.tags?.map((tag) => (
          <Badge key={tag}>{tag}</Badge>
        ))}
      </div>

      {/* Timeline */}
      <Timeline
        segments={plan.segments.map((segment) => ({
          ...segment,
          start: new Date(segment.start!),
          end: segment.end ? new Date(segment.end) : new Date(segment.start!),
          tasks: (segment.tasks || []).map((task) => ({
            ...task,
            priority: task.priority ?? "medium",
          })),
        }))}
      />
    </div>
  );
}
