import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

export function DateRangePicker({
  value,
  onChange,
  numMonths,
}: {
  value: { start: Date | undefined; end: Date | undefined };
  onChange: (dates: { start: Date | undefined; end: Date | undefined }) => void;
  numMonths: number;
}) {
  const [range, setRange] = useState<DateRange | undefined>(
    value.start && value.end
      ? {
          from: new Date(value.start),
          to: new Date(value.end),
        }
      : undefined
  );

  const handleChange = (newRange: DateRange | undefined) => {
    setRange(newRange);
    onChange({
      start: newRange?.from ? newRange.from : undefined,
      end: newRange?.to ? newRange.to : undefined,
    });
  };

  return (
    <div className="grid gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !range && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {range?.from ? (
              range.to ? (
                <>
                  {format(range.from, "LLL dd, y")} –{" "}
                  {format(range.to, "LLL dd, y")}
                </>
              ) : (
                format(range.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={range}
            onSelect={handleChange}
            numberOfMonths={numMonths}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
