"use client";

import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";

interface CalendarProps {
  selectedDate: Date;
  onSelect: (date: Date | undefined) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Calendar({
  selectedDate,
  onSelect,
  isOpen,
  onClose,
}: CalendarProps) {
  const calendarRef = useRef<HTMLDivElement>(null);
  const [dateValue, setDateValue] = useState(
    format(selectedDate, "yyyy-MM-dd")
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value ? new Date(e.target.value) : undefined;
    setDateValue(e.target.value);
    onSelect(newDate);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={calendarRef}
      className="absolute top-full left-0 mt-2 bg-white rounded-lg p-4 shadow-xl z-50"
    >
      <input
        type="date"
        value={dateValue}
        onChange={handleDateChange}
        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        min="2020-01-01"
        max="2025-12-31"
      />
    </div>
  );
}
