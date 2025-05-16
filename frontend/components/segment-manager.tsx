"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DateRangePicker } from "@/components/daterange-picker";
import { TaskManager } from "@/components/task-manager";

import { Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { segmentSchema } from "@/lib/validation/segmentSchema";

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

interface SegmentManagerProps {
  segments: Segment[];
  setSegments: (segments: Segment[]) => void;
}

export function SegmentManager({ segments, setSegments }: SegmentManagerProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<Segment>({
    title: "",
    description: "",
    start: undefined,
    end: undefined,
    tasks: [],
  });
  const [range, setRange] = useState<DateRange | undefined>({
    from: selectedSegment.start,
    to: selectedSegment.end,
  });
  const [errors, setErrors] = useState<any>({});

  const handleSave = () => {
    const segmentToValidate = {
      ...selectedSegment,
      start: range?.from,
      end: range?.to,
    };
    const parsed = segmentSchema
      .omit({ learningPlanId: true })
      .safeParse(segmentToValidate);

    if (!parsed.success) {
      setErrors(parsed.error.format());
      return;
    }

    const updated = {
      ...parsed.data,
      tasks: selectedSegment.tasks || [],
    };

    const copy = [...segments];
    if (selectedIndex !== null) {
      copy[selectedIndex] = updated;
    } else {
      copy.push(updated);
    }
    setSegments(copy);
    setSelectedIndex(null);
    setSelectedSegment({
      title: "",
      description: "",
      start: undefined,
      end: undefined,
      tasks: [],
    });
    setRange({ from: undefined, to: undefined });
    setErrors({});
  };

  const handleEdit = (index: number) => {
    setSelectedIndex(index);
    setSelectedSegment(segments[index]);
    setRange({ from: segments[index].start, to: segments[index].end });
    setErrors({});
  };

  const handleDelete = (index: number) => {
    const copy = [...segments];
    copy.splice(index, 1);
    setSegments(copy);
    if (selectedIndex === index) {
      setSelectedIndex(null);
      setSelectedSegment({
        title: "",
        description: "",
        start: undefined,
        end: undefined,
        tasks: [],
      });
      setRange({ from: undefined, to: undefined });
      setErrors({});
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Left column: segment list */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Segments</h3>
        <div
          className={cn(
            "space-y-2 w-auto h-auto rounded",
            segments.length > 0 && "border"
          )}
        >
          {segments.map((segment, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center justify-between px-3 py-2",
                i != segments.length - 1 && "border-b"
              )}
            >
              <div>
                <p className="font-semibold text-sm">
                  {segment.title || "Untitled"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {segment.start
                    ? format(new Date(segment.start), "MMM d")
                    : "Start"}{" "}
                  →{" "}
                  {segment.end ? format(new Date(segment.end), "MMM d") : "End"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(i)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(i)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        {/* <Button variant="outline" onClick={() => handleAdd()}>
          + Add Segment
        </Button> */}
      </div>

      {/* Right column: segment form */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">
          {selectedIndex !== null ? "Edit Segment" : "New Segment"}
        </h3>
        <div className="space-y-2">
          <Label>Title</Label>
          <Input
            value={selectedSegment.title}
            onChange={(e) =>
              setSelectedSegment((prev) => ({ ...prev, title: e.target.value }))
            }
            className={errors.title ? "border-destructive" : ""}
          />
          {errors.title && (
            <p className="text-sm text-destructive">
              {errors.title._errors?.[0]}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            value={selectedSegment.description}
            onChange={(e) =>
              setSelectedSegment({
                ...selectedSegment,
                description: e.target.value,
              })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Date</Label>
          <DateRangePicker range={range} setRange={setRange} numMonths={1} />
          {errors.start && (
            <p className="text-sm text-destructive">
              {errors.start._errors?.[0]}
            </p>
          )}
          {errors.end && (
            <p className="text-sm text-destructive">
              {errors.end._errors?.[0]}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <Label>Tasks</Label>
          <TaskManager
            tasks={selectedSegment.tasks || []}
            setTasks={(updatedTasks) =>
              setSelectedSegment((prev) => ({ ...prev, tasks: updatedTasks }))
            }
          />
        </div>

        <Button onClick={handleSave}>Save Segment</Button>
      </div>
    </div>
  );
}
