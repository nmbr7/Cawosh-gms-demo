"use client";

import * as React from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface CalendarProps {
  className?: string;
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  disabled?: boolean | ((date: Date) => boolean);
  classNames?: Record<string, string>;
}

function Calendar({
  className,
  selected,
  onSelect,
  disabled = false,
  classNames,
  ...props
}: CalendarProps) {
  const [dateValue, setDateValue] = React.useState(
    selected ? format(selected, "yyyy-MM-dd") : ""
  );

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value ? new Date(e.target.value) : undefined;
    if (newDate && typeof disabled === "function" && disabled(newDate)) {
      return;
    }
    setDateValue(e.target.value);
    onSelect?.(newDate);
  };

  return (
    <div className={cn("p-3", className)}>
      <Input
        type="date"
        value={dateValue}
        onChange={handleDateChange}
        disabled={typeof disabled === "boolean" ? disabled : false}
        className={cn(
          "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
          classNames?.input
        )}
        min="2020-01-01"
        max="2025-12-31"
        {...props}
      />
    </div>
  );
}

export { Calendar };
