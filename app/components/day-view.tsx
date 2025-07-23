"use client";

import { cn } from "@/lib/utils";
import { Booking } from "@/app/models/booking";

interface DayViewProps {
  selectedDate: Date;
  selectedBay: number | "all";
  bookings: Booking[];
  timeSlots: string[];
}

export function DayView({
  selectedDate,
  selectedBay,
  bookings,
  timeSlots,
}: DayViewProps) {
  // Get bookings for a specific day
  const getBookingsForDay = (date: Date) => {
    const dayStr = date.toISOString().split("T")[0];
    return bookings.filter((booking) => {
      const bookingDateStr = booking.bookingDate.split("T")[0];
      if (selectedBay === "all") return bookingDateStr === dayStr;
      return (
        bookingDateStr === dayStr &&
        booking.services.some(
          (service) => service.bayId === selectedBay.toString()
        )
      );
    });
  };

  return (
    <div className="bg-white rounded-lg shadow h-[600px] overflow-hidden">
      <div className="grid grid-cols-[80px_1fr] h-full">
        {/* Time column */}
        <div className="border-r">
          {timeSlots.map((time) => (
            <div
              key={time}
              className="h-[60px] text-sm text-gray-500 pr-2 text-right"
            >
              {time}
            </div>
          ))}
        </div>

        {/* Schedule grid */}
        <div className="relative grid grid-cols-1">
          {/* Time slot backgrounds */}
          {timeSlots.map((time) => (
            <div key={time} className="h-[60px] border-b border-gray-200" />
          ))}

          {/* Bookings */}
          {getBookingsForDay(selectedDate).map((booking) => (
            <div
              key={booking._id}
              className={cn(
                "absolute w-full px-2",
                booking.status === "completed"
                  ? "bg-green-100 text-green-700"
                  : booking.status === "in-progress"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-blue-100 text-blue-700"
              )}
              style={{
                top: "0px",
                height: "60px",
              }}
            >
              <div className="p-2 flex flex-col h-full">
                <div className="text-sm font-medium pb-2">
                  <div className="flex space-x-2 items-center">
                    <div className="text-sm font-medium">{booking._id}</div>
                    <div className="text-xs text-gray-600">
                      BAY {booking.services.map((s) => s.bayId).join(", ")}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {booking.services.map((service) => service.name).join(", ")}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
