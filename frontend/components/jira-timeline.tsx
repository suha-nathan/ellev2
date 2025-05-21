"use client";

import { useState } from "react";
import {
  addDays,
  addMonths,
  addWeeks,
  format,
  startOfMonth,
  startOfWeek,
} from "date-fns";

import { TimelineHeader } from "./timeline-header";
import { TimelineView } from "./timeline-view";

export type TimelinePeriod = "days" | "weeks" | "months";

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

export function JiraTimeline({ segments }: { segments: Segment[] }) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [period, setPeriod] = useState<TimelinePeriod>("weeks");
  // const [lanes] = useState<Segment[]>(segments);

  const getStartDate = () => {
    switch (period) {
      case "days":
        return currentDate;
      case "weeks":
        return startOfWeek(currentDate);
      case "months":
        return startOfMonth(currentDate);
    }
  };

  const handleNext = () => {
    switch (period) {
      case "days":
        setCurrentDate(addDays(currentDate, 3));
        break;
      case "weeks":
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      case "months":
        setCurrentDate(addMonths(currentDate, 1));
        break;
    }
  };

  const handlePrevious = () => {
    switch (period) {
      case "days":
        setCurrentDate(addDays(currentDate, -3));
        break;
      case "weeks":
        setCurrentDate(addWeeks(currentDate, -1));
        break;
      case "months":
        setCurrentDate(addMonths(currentDate, -1));
        break;
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getHeaderTitle = () => {
    switch (period) {
      case "days":
        const dayEnd = addDays(currentDate, 13);
        return `${format(currentDate, "MMM d")} - ${format(
          dayEnd,
          "MMM d, yyyy"
        )}`;
      case "weeks":
        const weekEnd = addWeeks(currentDate, 7);
        return `${format(currentDate, "MMM d")} - ${format(
          weekEnd,
          "MMM d, yyyy"
        )}`;
      case "months":
        const monthEnd = addMonths(currentDate, 2);
        return `${format(currentDate, "MMM yyyy")} - ${format(
          monthEnd,
          "MMM yyyy"
        )}`;
    }
  };

  return (
    <div className="border rounded-lg shadow-sm bg-white overflow-hidden">
      <TimelineHeader
        title={getHeaderTitle()}
        period={period}
        onPeriodChange={setPeriod}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onToday={handleToday}
      />
      <TimelineView
        period={period}
        startDate={getStartDate()}
        lanes={segments}
      />
    </div>
  );
}
