"use client";

import { useRef } from "react";
import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  eachMonthOfInterval,
  eachWeekOfInterval,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  isSameWeek,
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Calculate the number of time units to display based on period
  const getTimeUnits = () => {
    switch (period) {
      case "days":
        return eachDayOfInterval({
          start: startDate,
          end: addDays(startDate, 7), // Show 8 days
        });
      case "weeks":
        return eachWeekOfInterval({
          start: startOfWeek(startDate),
          end: addWeeks(startOfWeek(startDate), 5), // Show 6 weeks
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

  // console.log("timeUnits: ", timeUnits);

  return (
    <div className="overflow-x-auto" ref={scrollContainerRef}>
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
                gridTemplateColumns: `repeat(${timeUnits.length}, 1fr)`,
              }}
            >
              {timeUnits.map((unit) => {
                const isCurrentDay = isSameDay(unit, today);
                const isCurrentWeek = isSameWeek(unit, today);
                const isCurrentMonth = isSameMonth(unit, today);

                return (
                  <div
                    key={unit.toString()}
                    className={cn(
                      "text-center py-3 border-r text-sm font-medium",
                      isCurrentDay && period === "days" && "bg-blue-50",
                      isCurrentWeek && period === "weeks" && "bg-blue-50",
                      isCurrentMonth && period === "months" && "bg-blue-50"
                    )}
                  >
                    {period === "days" && format(unit, "EEE d LLL")}
                    {period === "weeks" &&
                      `${format(unit, "MMM d")} - ${format(
                        addDays(unit, 6),
                        "MMM d"
                      )}`}
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
                period={period}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
