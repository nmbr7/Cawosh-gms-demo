"use client";

import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
} from "date-fns";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import type { Booking } from "@/types/booking";
import { useScheduleStore } from "../(authenticated)/schedule/scheduleStore";
import dayjs from "dayjs";
import { BookingDetailsModal } from "./booking-details-modal";

interface MonthViewProps {
  onDayClick: (date: Date) => void;
  bookings?: Booking[];
}

export function MonthView({ onDayClick, bookings }: MonthViewProps): React.ReactElement {
  const { selectedDate, selectedBay } = useScheduleStore();

  
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const firstDayOffset = monthStart.getDay();
  const offsetDays = Array(firstDayOffset).fill(null);
  const totalDays = offsetDays.length + daysInMonth.length;
  const endOffsetDays = (7 - (totalDays % 7)) % 7;
  const allDays: (Date | null)[] = [...offsetDays, ...daysInMonth, ...Array(endOffsetDays).fill(null)];

  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7));
  }

  const getBookingsForDay = (day: Date | null): Booking[] => {
    if (!day || !bookings) return [];
    const dayStr = dayjs(day).format("YYYY-MM-DD");

    return bookings.filter(
      (booking) =>{
        const dateObj = new Date(booking.bookingDate);
        return (dayjs(dateObj).format("YYYY-MM-DD") === dayStr && selectedBay);
      }
    );
  };

  const onBookingClick = (id:string) => {
    setSelectedBookingId(id);
    setIsModalOpen(true);
  }

  return (
    <div className="bg-white rounded-lg shadow h-full overflow-hidden">
      <div className="grid grid-cols-7 gap-px bg-gray-200 h-full">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="bg-white p-2 text-center text-sm font-medium text-gray-500"
          >
            {day}
          </div>
        ))}

        {weeks.map((week, weekIndex) => (
          <React.Fragment key={weekIndex}>
            {week.map((day, dayIndex) => {
              const dayBookings = getBookingsForDay(day);
              const isCurrentMonth = day ? isSameMonth(day, selectedDate) : false;
              const isCurrentDay = day ? isToday(day) : false;
              const isSelectedDay = day ? isSameDay(day, selectedDate) : false;

              return (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  onClick={() => day && onDayClick(day)}
                  className={cn(
                    "bg-white p-2 min-h-[100px]",
                    !isCurrentMonth && "text-gray-400",
                    isCurrentDay ? "border-blue-500" : "border-gray-200",
                    isSelectedDay && "bg-blue-50",
                    day && "cursor-pointer hover:bg-gray-50"
                  )}
                >
                  {day && (
                    <>
                      <div className="text-sm font-medium mb-1">{format(day, "d")}</div>
                      <div className="space-y-1">
                        {dayBookings.slice(0, 2).map((booking) => (
                          <div
                            key={booking._id}
                            className={cn(
                              "text-xs p-1 mb-1 rounded truncate hover:bg-blue-200 hover:scale-105 transition-all",
                              booking.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : booking.status === "in_progress"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-blue-100 text-blue-700"
                            )}
                            title={`${booking.services.map((s) => s.name).join(", ")} - ${booking.services[0]?.startTime} to ${booking.services[0]?.endTime}`}
                            onClick={()=>onBookingClick(booking._id)}
                          >
                            {`${(booking.customer?.name).toUpperCase() ?? "Unknown Customer"}`}
                          </div>
                        ))}
                        {dayBookings.length > 2 && (
                          <div className="text-xs text-gray-500 mt-1">
                            +{dayBookings.length - 2} more bookings
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
      {/* Booking Details Modal */}
      <BookingDetailsModal
        bookingId={selectedBookingId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
