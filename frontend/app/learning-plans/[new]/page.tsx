"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { Toaster, toast } from "sonner";
import { learningPlanSchema } from "@/lib/validation/learningPlanSchema";
import { segmentSchema } from "@/lib/validation/segmentSchema";
import { taskSchema } from "@/lib/validation/taskSchema";

export default function NewLearningPlanPage() {
  const [segments, setSegments] = useState([
    { title: "", description: "", start: "", end: "", tasks: [""] },
  ]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    isPublic: false,
  });
  const [errors, setErrors] = useState<any>({});

  const updateForm = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateSegment = (index: number, key: string, value: string) => {
    const copy = [...segments];
    (copy[index] as any)[key] = value;
    setSegments(copy);
  };

  const updateTask = (segIndex: number, taskIndex: number, value: string) => {
    const copy = [...segments];
    copy[segIndex].tasks[taskIndex] = value;
    setSegments(copy);
  };

  const removeTask = (segIndex: number, taskIndex: number) => {
    const copy = [...segments];
    copy[segIndex].tasks.splice(taskIndex, 1);
    setSegments(copy);
  };

  const addSegment = () => {
    setSegments([
      ...segments,
      { title: "", description: "", start: "", end: "", tasks: [""] },
    ]);
  };

  const removeSegment = (segIndex: number) => {
    const copy = [...segments];
    copy.splice(segIndex, 1);
    setSegments(copy);
  };

  const addTask = (segIndex: number) => {
    const copy = [...segments];
    copy[segIndex].tasks.push("");
    setSegments(copy);
  };

  const handleSubmit = async () => {
    const segmentErrors: Record<number, any> = {};

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];

      seg.start = seg.start ? new Date(seg.start).toISOString() : "";
      seg.end = seg.end ? new Date(seg.end).toISOString() : "";

      const segValidation = segmentSchema
        .omit({ learningPlanId: true })
        .safeParse(seg);
      if (!segValidation.success) {
        segmentErrors[i] = segValidation.error.format();
      } else {
        for (let j = 0; j < seg.tasks.length; j++) {
          const taskValidation = taskSchema
            .omit({ segmentId: true })
            .safeParse({ title: seg.tasks[j] });
          if (!taskValidation.success) {
            segmentErrors[i] = segmentErrors[i] || {};
            segmentErrors[i].tasks = segmentErrors[i].tasks || {};
            segmentErrors[i].tasks[j] = taskValidation.error.format();
          }
        }
      }
    }
    const finalPlan = { ...form, category: { name: form.category }, segments };

    const planValidation = learningPlanSchema
      .omit({ owner: true })
      .safeParse(finalPlan);

    if (!planValidation.success || Object.keys(segmentErrors).length > 0) {
      const flatErrors = {
        ...(planValidation.success ? {} : planValidation.error.format()),
        segments: segmentErrors,
      };
      console.log(flatErrors);
      setErrors(flatErrors);
      return;
    }

    setErrors({});
    console.log("finalplan submitting");
    const res = await fetch("/api/learning-plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(finalPlan),
    });

    console.log(res);
    if (res.ok) {
      toast.success("Learning plan created!");
    } else {
      toast.error("Failed to create learning plan");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Create Learning Plan</h1>

      <div className="space-y-2">
        <Label>Title</Label>
        <Input
          value={form.title}
          onChange={(e) => updateForm("title", e.target.value)}
        />
        {errors.title && (
          <p className="text-sm text-red-600">{errors.title._errors?.[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={form.description}
          onChange={(e) => updateForm("description", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Category</Label>
        <Input
          value={form.category}
          onChange={(e) => updateForm("category", e.target.value)}
        />
        {errors.category?.name && (
          <p className="text-sm text-red-600">
            {errors.category.name._errors?.[0]}
          </p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          checked={form.isPublic}
          onCheckedChange={(checked) => updateForm("isPublic", !!checked)}
        />
        <Label>Make public</Label>
      </div>

      {/* Segments */}
      {segments.map((segment, segIndex) => (
        <Card key={segIndex} className="p-4 space-y-4 relative">
          <button
            onClick={() => removeSegment(segIndex)}
            className="absolute top-2 right-2 text-destructive"
            title="Remove segment"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <div className="space-y-2">
            <Label>Segment Title</Label>
            <Input
              value={segment.title}
              onChange={(e) => updateSegment(segIndex, "title", e.target.value)}
            />
            {errors?.segments?.[segIndex]?.title && (
              <p className="text-sm text-red-600">
                {errors.segments[segIndex].title._errors?.[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Start Date</Label>
            <Input
              type="datetime-local"
              value={segment.start}
              onChange={(e) => updateSegment(segIndex, "start", e.target.value)}
            />
            {errors?.segments?.[segIndex]?.start && (
              <p className="text-sm text-red-600">
                {errors.segments[segIndex].start._errors?.[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>End Date</Label>
            <Input
              type="datetime-local"
              value={segment.end}
              onChange={(e) => updateSegment(segIndex, "end", e.target.value)}
            />
            {errors?.segments?.[segIndex]?.end && (
              <p className="text-sm text-red-600">
                {errors.segments[segIndex].end._errors?.[0]}
              </p>
            )}
          </div>

          {/* Tasks */}
          <div className="space-y-2">
            <Label>Tasks</Label>
            {segment.tasks.map((task, taskIndex) => (
              <div key={taskIndex} className="flex items-center gap-2">
                <Input
                  value={task}
                  onChange={(e) =>
                    updateTask(segIndex, taskIndex, e.target.value)
                  }
                  placeholder={`Task ${taskIndex + 1}`}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={() => removeTask(segIndex, taskIndex)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                {errors?.segments?.[segIndex]?.tasks?.[taskIndex]?.title && (
                  <p className="text-sm text-red-600">
                    {
                      errors.segments[segIndex].tasks[taskIndex].title
                        ._errors?.[0]
                    }
                  </p>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => addTask(segIndex)}
            >
              + Add Task
            </Button>
          </div>
        </Card>
      ))}

      <Button variant="outline" type="button" onClick={addSegment}>
        + Add Segment
      </Button>

      <Button onClick={handleSubmit}>Submit</Button>
      <Toaster richColors />
    </div>
  );
}
