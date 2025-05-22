"use client";

import { useState } from "react";
import {
  differenceInCalendarDays,
  differenceInCalendarWeeks,
  differenceInCalendarMonths,
} from "date-fns";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import type { TimelinePeriod } from "./timeline";

type Task = {
  title: string;
  description?: string;
  type?: string;
  priority: "high" | "medium" | "low";
};

interface Segment {
  title: string;
  description?: string;
  start?: Date;
  end?: Date;
  tasks?: Task[];
}

interface TimelineSwimlaneProps {
  lane: Segment;
  timeUnits: Date[];
  period: TimelinePeriod;
}

export function TimelineSwimlane({
  lane,
  timeUnits,
  period,
}: TimelineSwimlaneProps) {
  const [expanded, setExpanded] = useState(false);

  const getPriorityColorClasses = (priority: string | undefined) => {
    switch (priority) {
      case "high":
        return "bg-red-200 text-red-800";
      case "medium":
        return "bg-orange-200 text-orange-800";
      case "low":
        return "bg-green-200 text-green-800";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  const getGridStyle = (start: Date, end: Date) => {
    const itemStart = new Date(start);
    const itemEnd = new Date(end);
    const viewStart = timeUnits[0];
    const viewEnd = timeUnits[timeUnits.length - 1];

    if (itemEnd < viewStart || itemStart > viewEnd) {
      return { display: "none" };
    }

    const getDiffFn = () => {
      switch (period) {
        case "days":
          return differenceInCalendarDays;
        case "weeks":
          return differenceInCalendarWeeks;
        case "months":
          return differenceInCalendarMonths;
        default:
          throw new Error("Unsupported period");
      }
    };

    const diffFn = getDiffFn();
    const left = Math.max(1, diffFn(itemStart, viewStart) + 1);
    const right = Math.min(
      timeUnits.length + 1,
      diffFn(itemEnd, viewStart) + 2
    );

    return {
      display: "grid",
      gridColumn: `${left} / ${right}`,
    };
  };

  return (
    <div className="border-b">
      {/* Swimlane header */}
      <div
        className="flex items-center bg-gray-50 p-3 cursor-pointer hover:bg-gray-100"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-48 min-w-48 flex items-center gap-2 font-medium">
          {expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          {lane.title}
        </div>
        <div
          className="flex-1 grid"
          style={{ gridTemplateColumns: `repeat(${timeUnits.length}, 1fr)` }}
        >
          {/* Timeline bar for the segment */}
          {lane.start && lane.end && (
            <div
              className="relative top-1 bottom-1 rounded-md px-2 text-white text-xs font-medium bg-primary"
              style={{
                ...getGridStyle(lane.start, lane.end),
              }}
            >
              {lane.title}
            </div>
          )}
        </div>
      </div>

      {/* Tasks inside the segment */}
      {expanded && lane.tasks && lane.tasks.length > 0 && (
        <div>
          {lane.tasks.map((task, idx) => {
            const taskStart = lane.start ?? new Date();
            const taskEnd = lane.end ?? new Date();
            return (
              <div key={idx} className="flex relative border-b last:border-b-0">
                <div className="w-48 min-w-48 px-3 py-2 text-sm text-muted-foreground">
                  • {task.title}
                </div>
                <div
                  className="flex-1 grid relative"
                  style={{
                    gridTemplateColumns: `repeat(${timeUnits.length}, 1fr)`,
                  }}
                >
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            "absolute top-1 bottom-1 rounded bg-muted px-2 text-xs text-muted-foreground",
                            getPriorityColorClasses(task.priority)
                          )}
                          style={{
                            ...getGridStyle(taskStart, taskEnd),
                          }}
                        >
                          {task.title}
                          {task.priority && (
                            <Badge
                              variant="secondary"
                              className="ml-2 capitalize"
                            >
                              {task.priority}
                            </Badge>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-xs space-y-1">
                          <div className="font-medium">{task.title}</div>
                          <div>{task.type}</div>
                          <div className="capitalize">{task.priority}</div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
