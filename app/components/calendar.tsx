"use client";

import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { useEffect, useRef, useState } from "react";

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
  const [displayMonth, setDisplayMonth] = useState(selectedDate);

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

  if (!isOpen) return null;

  return (
    <div
      ref={calendarRef}
      className="absolute top-full left-0 mt-2 bg-white rounded-lg p-4 shadow-xl z-50 min-w-[320px]"
    >
      <DayPicker
        mode="single"
        selected={selectedDate}
        onSelect={onSelect}
        showOutsideDays
        className="border rounded-lg p-3"
        captionLayout="dropdown"
        fromYear={2020}
        toYear={2025}
        month={displayMonth}
        onMonthChange={setDisplayMonth}
        classNames={{
          months: "flex flex-col",
          month: "space-y-4",
          caption: "flex justify-center pt-1 relative items-center",
          caption_dropdowns: "flex gap-1 [&>div]:hidden",
          dropdown:
            "px-2 py-1 rounded border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
          nav: "hidden",
          nav_button: "hidden",
          nav_button_previous: "hidden",
          nav_button_next: "hidden",
          caption_label: "hidden",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell: "text-gray-500 rounded-md w-9 font-normal text-[0.8rem]",
          row: "flex w-full mt-2",
          cell: "text-center text-sm p-0 relative first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-blue-500 [&:has([aria-selected])]:text-white [&:has([aria-selected])]:rounded-full",
          day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-full",
          day_selected:
            "bg-blue-500 rounded-full hover:bg-blue-600  focus:bg-blue-500 focus:!text-white z-10",
          day_today: "bg-gray-100 text-blue-500 font-semibold",
          day_outside: "text-gray-300 opacity-40 cursor-not-allowed",
          day_disabled: "text-gray-300 opacity-40 cursor-not-allowed",
          day_range_middle:
            "aria-selected:bg-gray-100 aria-selected:text-gray-700",
          day_hidden: "invisible",
        }}
        modifiers={{
          outside: (day) => {
            return day.getMonth() !== displayMonth.getMonth();
          },
          today: (day) => {
            const today = new Date();
            return (
              day.getDate() === today.getDate() &&
              day.getMonth() === today.getMonth() &&
              day.getFullYear() === today.getFullYear()
            );
          },
        }}
        modifiersStyles={{
          outside: { color: "#9CA3AF", opacity: 0.4, cursor: "not-allowed" },
          today: { border: "2px solid #3B82F6" },
        }}
      />
    </div>
  );
}
