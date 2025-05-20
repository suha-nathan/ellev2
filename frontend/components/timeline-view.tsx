"use client";

import { useRef } from "react";
import {
  addDays,
  addMonths,
  addWeeks,
  differenceInCalendarDays,
  differenceInCalendarMonths,
  differenceInCalendarWeeks,
  eachDayOfInterval,
  eachMonthOfInterval,
  eachWeekOfInterval,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";

import { TimelineSwimlane } from "./timeline-swimlane";
import type { Swimlane, TimelinePeriod } from "./jira-timeline";
import { cn } from "@/lib/utils";

interface TimelineViewProps {
  period: TimelinePeriod;
  startDate: Date;
  swimlanes: Swimlane[];
}

export function TimelineView({
  period,
  startDate,
  swimlanes,
}: TimelineViewProps) {
  // const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Calculate the number of time units to display based on period
  const getTimeUnits = () => {
    switch (period) {
      case "days":
        return eachDayOfInterval({
          start: startDate,
          end: addDays(startDate, 13), // Show 14 days
        });
      case "weeks":
        return eachWeekOfInterval({
          start: startOfWeek(startDate),
          end: addWeeks(startOfWeek(startDate), 7), // Show 8 weeks
        });
      case "months":
        return eachMonthOfInterval({
          start: startOfMonth(startDate),
          end: addMonths(startOfMonth(startDate), 2), // Show 3 months
        });
    }
  };

  const timeUnits = getTimeUnits();
  const today = new Date();

  // Calculate position and width for timeline items
  const getItemStyle = (start: Date, end: Date) => {
    let startPosition = 0;
    let width = 0;
    let visibleLength = 1;

    switch (period) {
      case "days": {
        startPosition = Math.max(0, differenceInCalendarDays(start, startDate));
        width = Math.max(1, differenceInCalendarDays(end, start) + 1);
        visibleLength = 14; // Matches 14-day view
        break;
      }
      case "weeks": {
        startPosition = Math.max(
          0,
          differenceInCalendarWeeks(start, startDate)
        );
        width = Math.max(1, differenceInCalendarWeeks(end, start) + 1);
        visibleLength = 8; // Matches 8-week view
        break;
      }
      case "months": {
        startPosition = Math.max(
          0,
          differenceInCalendarMonths(start, startDate)
        );
        width = Math.max(1, differenceInCalendarMonths(end, start) + 1);
        visibleLength = 3; // Matches 3-month view
        break;
      }
    }

    // Clamp width so items that overflow the visible window don't break layout
    const maxWidth = visibleLength - startPosition;
    const clampedWidth = Math.max(0, Math.min(width, maxWidth));

    return {
      left: `${(startPosition / visibleLength) * 100}%`,
      width: `${(clampedWidth / visibleLength) * 100}%`,
    };
  };

  return (
    // <div className="overflow-x-auto" ref={scrollContainerRef}>
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Timeline header */}
        <div className="flex border-b sticky top-0 bg-white z-10">
          <div className="w-48 min-w-48 border-r bg-gray-50 p-3 font-medium">
            Epics / Tasks
          </div>
          <div
            className="flex-1 grid"
            style={{
              gridTemplateColumns: `repeat(${timeUnits.length}, minmax(60px, 1fr))`,
            }}
          >
            {timeUnits.map((unit) => {
              const isCurrentDay = isSameDay(unit, today);
              const isCurrentMonth = isSameMonth(unit, today);

              return (
                <div
                  key={unit.toString()}
                  className={cn(
                    "text-center py-3 border-r text-sm font-medium",
                    isCurrentDay && period === "days" && "bg-blue-50",
                    isCurrentMonth && period === "months" && "bg-blue-50"
                  )}
                >
                  {period === "days" && format(unit, "EEE d LLL")}
                  {period === "weeks" && format(unit, "MMM d")}
                  {period === "months" && format(unit, "MMM yyyy")}
                </div>
              );
            })}
          </div>
        </div>

        {/* Swimlanes */}
        <div>
          {swimlanes.map((swimlane) => (
            <TimelineSwimlane
              key={swimlane.id}
              swimlane={swimlane}
              timeUnits={timeUnits}
              getItemStyle={getItemStyle}
              period={period}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
