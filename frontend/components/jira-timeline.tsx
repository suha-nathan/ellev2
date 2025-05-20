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

export type TimelineItem = {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  color?: string;
  status: "todo" | "in-progress" | "review" | "done";
  assignee?: string;
};

export type Swimlane = {
  id: string;
  title: string;
  items: TimelineItem[];
};

// Sample data
const sampleData: Swimlane[] = [
  {
    id: "epic-1",
    title: "User Authentication",
    items: [
      {
        id: "task-1",
        title: "Design login screen",
        start: new Date(2025, 3, 5),
        end: new Date(2025, 3, 10),
        status: "done",
        color: "#4ade80",
        assignee: "Alex",
      },
      {
        id: "task-2",
        title: "Implement OAuth flow",
        start: new Date(2025, 3, 8),
        end: new Date(2025, 3, 15),
        status: "in-progress",
        color: "#60a5fa",
        assignee: "Taylor",
      },
      {
        id: "task-3",
        title: "User profile management",
        start: new Date(2025, 3, 12),
        end: new Date(2025, 3, 22),
        status: "todo",
        color: "#f87171",
        assignee: "Jordan",
      },
    ],
  },
  {
    id: "epic-2",
    title: "Payment Processing",
    items: [
      {
        id: "task-4",
        title: "Payment gateway integration",
        start: new Date(2025, 3, 10),
        end: new Date(2025, 3, 20),
        status: "in-progress",
        color: "#60a5fa",
        assignee: "Morgan",
      },
      {
        id: "task-5",
        title: "Subscription management",
        start: new Date(2025, 3, 18),
        end: new Date(2025, 3, 28),
        status: "todo",
        color: "#f87171",
        assignee: "Casey",
      },
    ],
  },
  {
    id: "epic-3",
    title: "Data Analytics",
    items: [
      {
        id: "task-6",
        title: "Dashboard design",
        start: new Date(2025, 3, 5),
        end: new Date(2025, 3, 12),
        status: "review",
        color: "#fbbf24",
        assignee: "Riley",
      },
      {
        id: "task-7",
        title: "Data visualization components",
        start: new Date(2025, 3, 12),
        end: new Date(2025, 3, 25),
        status: "in-progress",
        color: "#60a5fa",
        assignee: "Quinn",
      },
    ],
  },
  {
    id: "epic-4",
    title: "Mobile App",
    items: [
      {
        id: "task-8",
        title: "UI/UX design",
        start: new Date(2025, 3, 15),
        end: new Date(2025, 3, 25),
        status: "todo",
        color: "#f87171",
        assignee: "Jamie",
      },
      {
        id: "task-9",
        title: "React Native implementation",
        start: new Date(2025, 3, 22),
        end: new Date(2025, 4, 10),
        status: "todo",
        color: "#f87171",
        assignee: "Drew",
      },
    ],
  },
];

export function JiraTimeline() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [period, setPeriod] = useState<TimelinePeriod>("weeks");
  const [swimlanes] = useState<Swimlane[]>(sampleData);

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
        swimlanes={swimlanes}
      />
    </div>
  );
}
