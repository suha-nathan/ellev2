// import { ChevronDown, ChevronRight, User } from "lucide-react";
import { User } from "lucide-react";
// import { useState } from "react";
import {
  differenceInCalendarDays,
  differenceInCalendarWeeks,
  differenceInCalendarMonths,
} from "date-fns";

import type { TimelinePeriod } from "./jira-timeline";
// import { cn } from "@/lib/utils";
// import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  // const [expanded, setExpanded] = useState(true);

  // const getStatusBadgeColor = (status: string) => {
  //   switch (status) {
  //     case "todo":
  //       return "bg-gray-200 text-gray-800";
  //     case "in-progress":
  //       return "bg-blue-200 text-blue-800";
  //     case "review":
  //       return "bg-yellow-200 text-yellow-800";
  //     case "done":
  //       return "bg-green-200 text-green-800";
  //     default:
  //       return "bg-gray-200 text-gray-800";
  //   }
  // };

  //function calculates the grid position within the calendar given item start and end date
  const getItemStyle = (start: Date, end: Date) => {
    const itemStart = new Date(start);
    const itemEnd = new Date(end);
    const viewStart = timeUnits[0];
    const viewEnd = timeUnits[timeUnits.length - 1];

    // item is completely out of bounds of the calendar
    if (itemEnd < viewStart || itemStart > viewEnd) {
      return { display: "none" };
    }

    const getDifference = () => {
      switch (period) {
        case "days":
          return differenceInCalendarDays;
        case "weeks":
          return differenceInCalendarWeeks;
        case "months":
          return differenceInCalendarMonths;
        default:
          throw new Error(`Unsupported period: ${period}`);
      }
    };

    const diffFn = getDifference();

    //left is either out of bounds (1) or is at a date greater than the start of the calendar and within bounds
    const left = Math.max(1, diffFn(itemStart, viewStart) + 1);

    //right is either out of bounds (14+1 for days, 8+1 for weeks, etc) or at a date less than the end of the calendar and within bounds
    const right = Math.min(
      timeUnits.length + 1,
      diffFn(itemEnd, viewStart) + 2
    );

    return {
      display: "grid",
      gridColumn: `${left} / ${right}`,
    };
  };

  const style =
    lane.start && lane.end ? getItemStyle(lane.start, lane.end) : "";

  return (
    <div className="border-b">
      {/* Swimlane items */}

      <div>
        <div className="flex relative border-b last:border-b-0">
          <div className="w-48 min-w-48 p-3 border-r flex items-center gap-2">
            <div className="text-sm truncate flex-1">{lane.title}</div>
            {/* <Badge
                  variant="outline"
                  className={cn("text-xs", getStatusBadgeColor(lane.status))}
                >
                  {item.status}
                </Badge> */}
          </div>
          <div
            className="flex-1 grid relative"
            style={{
              gridTemplateColumns: `repeat(${timeUnits.length}, 1fr)`,
            }}
          >
            {/* Grid lines */}
            {/* {timeUnits.map((unit, index) => (
                    <div key={index} className="border-r h-full"></div>
                  ))} */}

            {/* Timeline item */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="top-1 bottom-1 rounded-md flex items-center px-2 text-white text-xs font-medium cursor-pointer hover:opacity-90"
                    style={{
                      ...style,
                      // backgroundColor: lane.color || "#60a5fa",
                      backgroundColor: "#60a5fa",
                    }}
                  >
                    <div className="truncate">{lane.title}</div>
                    {/* {item.assignee && (
                            <div className="ml-auto flex items-center bg-white bg-opacity-20 rounded-full p-0.5">
                              <User className="h-3 w-3" />
                            </div>
                          )} */}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    <div className="font-medium">{lane.title}</div>
                    <div className="text-xs">
                      {lane.start?.toLocaleDateString()} -{" "}
                      {lane.end?.toLocaleDateString()}
                    </div>
                    <div className="text-xs flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {/* {item.assignee} */}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  );
}
