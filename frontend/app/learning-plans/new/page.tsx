"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { PlusIcon, X } from "lucide-react";
import { Toaster, toast } from "sonner";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/daterange-picker";
import { Timeline } from "@/components/timeline";
import { SegmentManager } from "@/components/segment-manager";
import { learningPlanSchema } from "@/lib/validation/learningPlanSchema";
import { ResourceSelector, Resource } from "@/components/resource-selector";

type Task = {
  title: string;
  description?: string;
  type?: string;
  priority: "high" | "medium" | "low";
};

interface Segment {
  title: string;
  description?: string | undefined;
  start?: Date;
  end?: Date;
  tasks?: Task[];
}

export default function CreateLearningPlan() {
  const [segments, setSegments] = useState<Segment[]>([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    tags: [] as string[],
    tagInput: "",
    isPublic: false,

    start: undefined as Date | undefined,
    end: undefined as Date | undefined,
  });
  const [errors, setErrors] = useState<any>({});
  const [range, setRange] = useState<DateRange | undefined>({
    from: form.start,
    to: form.end,
  });

  const [selectedResources, setSelectedResources] = useState<Resource[]>([]);

  const router = useRouter();

  const handleTagAdd = () => {
    if (form.tagInput.trim() && !form.tags.includes(form.tagInput.trim())) {
      setForm({
        ...form,
        tags: [...form.tags, form.tagInput.trim()],
        tagInput: "",
      });
    }
  };

  const handleTagRemove = (tag: string) => {
    setForm({ ...form, tags: form.tags.filter((t) => t !== tag) });
  };

  const updateForm = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    // console.log("FORM: ", form);
    // console.log("SEGMENTS: ", segments);
    const finalPlan = {
      ...form,
      category: { name: form.category },
      resources: selectedResources.map((r) => r._id),
      segments,
    };

    const planValidation = learningPlanSchema
      .omit({ owner: true })
      .safeParse(finalPlan);

    if (!planValidation.success) {
      setErrors(planValidation.error.format());
      return;
    }

    setErrors({});
    const res = await fetch("/api/learning-plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(finalPlan),
    });

    if (res.ok) {
      const data = await res.json();
      toast.success("Learning plan created!");
      router.push(`/learning-plans/view/${data.planId}`);
    } else {
      toast.error("Failed to create learning plan");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Create Learning Plan</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={form.title}
              onChange={(e) => updateForm("title", e.target.value)}
            />
            {errors.title && (
              <p className="text-sm text-red-600">
                {errors.title._errors?.[0]}
              </p>
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
            <Select
              defaultValue=""
              onValueChange={(e) => updateForm("category", e)}
            >
              <SelectTrigger className="border rounded px-2 py-1">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Category</SelectLabel>
                  <SelectItem value="frontend">Frontend</SelectItem>
                  <SelectItem value="backend">Backend</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="career">Career</SelectItem>
                  <SelectItem value="pineapple">Pineapple</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2 flex-wrap">
              {form.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {tag}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleTagRemove(tag)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={form.tagInput}
                onChange={(e) => setForm({ ...form, tagInput: e.target.value })}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), handleTagAdd())
                }
              />
              <Button type="button" onClick={handleTagAdd} variant="outline">
                <PlusIcon className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <DateRangePicker range={range} setRange={setRange} numMonths={2} />
          </div>

          <div className="flex items-center gap-4">
            <Label>Public</Label>
            <Switch
              checked={form.isPublic}
              onCheckedChange={(checked) => updateForm("isPublic", !!checked)}
            />
            <span className="text-sm text-muted-foreground">
              {form.isPublic ? "Visible to others" : "Private to you"}
            </span>
          </div>
        </div>

        <div>
          <Label>Attach Resources</Label>
          <ResourceSelector
            selected={selectedResources}
            onSelect={setSelectedResources}
          />
        </div>
      </div>

      <Timeline segments={segments} />
      <SegmentManager segments={segments} setSegments={setSegments} />

      <Button onClick={handleSubmit}>Submit</Button>
      <Toaster richColors />
    </div>
  );
}
