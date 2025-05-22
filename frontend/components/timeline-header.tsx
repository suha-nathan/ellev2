import { ChevronLeft, ChevronRight } from "lucide-react";

import type { TimelinePeriod } from "./timeline";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TimelineHeaderProps {
  title: string;
  period: TimelinePeriod;
  onPeriodChange: (period: TimelinePeriod) => void;
  onNext: () => void;
  onPrevious: () => void;
  onToday: () => void;
}

export function TimelineHeader({
  title,
  period,
  onPeriodChange,
  onNext,
  onPrevious,
  onToday,
}: TimelineHeaderProps) {
  return (
    <div className="p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={onPrevious}>
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous</span>
        </Button>
        <Button variant="outline" size="icon" onClick={onNext}>
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next</span>
        </Button>
        <Button variant="outline" size="sm" onClick={onToday}>
          Today
        </Button>
        <h2 className="text-lg font-medium ml-2">{title}</h2>
      </div>
      <Tabs
        value={period}
        onValueChange={(value) => onPeriodChange(value as TimelinePeriod)}
      >
        <TabsList>
          <TabsTrigger value="days">Days</TabsTrigger>
          <TabsTrigger value="weeks">Weeks</TabsTrigger>
          <TabsTrigger value="months">Months</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
