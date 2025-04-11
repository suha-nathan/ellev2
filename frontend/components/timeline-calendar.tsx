import { useState } from "react"
import { addDays, addMonths, addWeeks, format, startOfDay, startOfMonth, startOfWeek } from "date-fns"

import { TimelineHeader } from "./timeline-header"
import { TimelineView } from "./timeline-view"

export type TimelinePeriod = "day" | "week" | "month"

export type Event = {
  id: string
  title: string
  description?: string
  start: Date
  end: Date
  color?: string
}

// Sample events data
const sampleEvents: Event[] = [
  {
    id: "1",
    title: "Team Meeting",
    description: "Weekly sync with the team",
    start: new Date(2025, 3, 10, 10, 0),
    end: new Date(2025, 3, 10, 11, 30),
    color: "#4f46e5",
  },
  {
    id: "2",
    title: "Product Launch",
    description: "New feature release",
    start: new Date(2025, 3, 12, 9, 0),
    end: new Date(2025, 3, 12, 17, 0),
    color: "#10b981",
  },
  {
    id: "3",
    title: "Client Call",
    description: "Quarterly review with client",
    start: new Date(2025, 3, 15, 14, 0),
    end: new Date(2025, 3, 15, 15, 0),
    color: "#f59e0b",
  },
  {
    id: "4",
    title: "Design Workshop",
    description: "UX/UI design session",
    start: new Date(2025, 3, 20, 13, 0),
    end: new Date(2025, 3, 21, 16, 0),
    color: "#ef4444",
  },
]

export function TimelineCalendar() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [period, setPeriod] = useState<TimelinePeriod>("week")
  const [events] = useState<Event[]>(sampleEvents)

  const getStartDate = () => {
    switch (period) {
      case "day":
        return startOfDay(currentDate)
      case "week":
        return startOfWeek(currentDate)
      case "month":
        return startOfMonth(currentDate)
    }
  }

  const handleNext = () => {
    switch (period) {
      case "day":
        setCurrentDate(addDays(currentDate, 1))
        break
      case "week":
        setCurrentDate(addWeeks(currentDate, 1))
        break
      case "month":
        setCurrentDate(addMonths(currentDate, 1))
        break
    }
  }

  const handlePrevious = () => {
    switch (period) {
      case "day":
        setCurrentDate(addDays(currentDate, -1))
        break
      case "week":
        setCurrentDate(addWeeks(currentDate, -1))
        break
      case "month":
        setCurrentDate(addMonths(currentDate, -1))
        break
    }
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const getHeaderTitle = () => {
    switch (period) {
      case "day":
        return format(currentDate, "EEEE, MMMM d, yyyy")
      case "week":
        const weekStart = startOfWeek(currentDate)
        const weekEnd = addDays(weekStart, 6)
        return `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`
      case "month":
        return format(currentDate, "MMMM yyyy")
    }
  }

  return (
    <div className="border rounded-lg shadow-sm bg-white">
      <TimelineHeader
        title={getHeaderTitle()}
        period={period}
        onPeriodChange={setPeriod}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onToday={handleToday}
      />
      <TimelineView period={period} startDate={getStartDate()} events={events} />
    </div>
  )
}
