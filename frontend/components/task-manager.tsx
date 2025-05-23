"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Trash2, Pencil } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { taskSchema } from "@/lib/validation/taskSchema";

type Task = {
  title: string;
  description?: string;
  type?: string;
  priority: "high" | "medium" | "low";
};

interface TaskManagerProps {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
}

export function TaskManager({ tasks, setTasks }: TaskManagerProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task>({
    title: "",
    description: "",
    type: "",
    priority: "medium",
  });
  const [errors, setErrors] = useState<any>({});

  const handleEdit = (index: number) => {
    setSelectedIndex(index);
    setSelectedTask(tasks[index]);
    setErrors({});
  };

  const handleDelete = (index: number) => {
    const copy = [...tasks];
    copy.splice(index, 1);
    setTasks(copy);
    if (selectedIndex === index) {
      setSelectedIndex(null);
      setSelectedTask({
        title: "",
        description: "",
        type: "",
        priority: "medium",
      });
      setErrors({});
    }
  };

  const handleSave = () => {
    const validation = taskSchema
      .omit({ segmentId: true })
      .safeParse(selectedTask);

    if (!validation.success) {
      setErrors(validation.error.format());
      return;
    }

    const updatedTasks = [...tasks];
    if (selectedIndex !== null) {
      updatedTasks[selectedIndex] = selectedTask;
    } else {
      updatedTasks.push(selectedTask);
    }

    setTasks(updatedTasks);
    setSelectedIndex(null);
    setSelectedTask({
      title: "",
      description: "",
      type: "",
      priority: "medium",
    });
    setErrors({});
  };

  const handleChange = (key: keyof Task, value: any) => {
    setSelectedTask((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Tasks</h3>

      {/* Task List */}
      <div className="space-y-2">
        {tasks.map((task, index) => (
          <div
            key={index}
            className="flex items-center justify-between border rounded px-3 py-2"
          >
            <div>
              <p className="font-semibold text-sm">
                {task.title || "Untitled"}
              </p>
              <p className="text-xs text-muted-foreground">{task.type}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEdit(index)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(index)}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Task Form */}
      <div className="space-y-4">
        <h4 className="text-md font-medium">
          {selectedIndex !== null ? "Edit Task" : "New Task"}
        </h4>

        <div className="space-y-2">
          <Label>Title</Label>
          <Input
            value={selectedTask.title}
            onChange={(e) => handleChange("title", e.target.value)}
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
            value={selectedTask.description}
            onChange={(e) => handleChange("description", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Type</Label>
          <Select
            defaultValue={selectedTask.type || ""}
            onValueChange={(val) => handleChange("type", val)}
          >
            <SelectTrigger className={errors.type ? "border-destructive" : ""}>
              <SelectValue placeholder="Select a type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Reading">Reading</SelectItem>
              <SelectItem value="Project">Project</SelectItem>
              <SelectItem value="Assignment">Assignment</SelectItem>
              <SelectItem value="Video">Video</SelectItem>
              <SelectItem value="Note">Note</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Priority</Label>
          <ToggleGroup
            type="single"
            value={selectedTask.priority}
            onValueChange={(val) => handleChange("priority", val || "medium")}
            className="gap-2"
          >
            <ToggleGroupItem value="high" aria-label="High priority">
              High
            </ToggleGroupItem>
            <ToggleGroupItem value="medium" aria-label="Medium priority">
              Medium
            </ToggleGroupItem>
            <ToggleGroupItem value="low" aria-label="Low priority">
              Low
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <Button onClick={handleSave}>
          {selectedIndex !== null ? "Update Task" : "Add Task"}
        </Button>
      </div>
    </div>
  );
}
