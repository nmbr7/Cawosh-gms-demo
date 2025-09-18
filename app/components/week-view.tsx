"use client";

import { cn } from "@/lib/utils";
import { Booking } from "@/app/models/booking";
import { format } from "date-fns";

interface WeekViewProps {
  selectedDate: Date;
  selectedBay: number | "all";
  bookings: Booking[];
  timeSlots: string[];
  weekDates: Date[];
}

export function WeekView({
  selectedBay,
  bookings,
  timeSlots,
  weekDates,
}: WeekViewProps) {
  // Get bookings for a specific day
  const getBookingsForDay = (date: Date) => {
    const dayStr = format(date, "yyyy-MM-dd");
    const bookingsForDay = bookings.filter((booking) => {
      // Check if any service in this booking falls on the selected day
      const hasServiceOnDay = booking.services.some((service) => {
        const serviceDateStr = service.startTime.split("T")[0];
        return serviceDateStr === dayStr;
      });

      if (!hasServiceOnDay) return false;

      // If bay is specified, check if any service is in that bay
      if (selectedBay !== "all") {
        return booking.services.some(
          (service) => service.bayId === `bay${selectedBay}`
        );
      }

      return true;
    });

    console.log("bookingsForDay", bookingsForDay);
    return bookingsForDay;
  };

  const formatDayDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Calendar grid */}
      <div className="bg-white rounded-lg shadow h-[600px] overflow-hidden">
        {/* Week header */}
        <div className="grid grid-cols-[80px_1fr] border-b">
          <div className="border-r" />
          <div className="grid grid-cols-7">
            {weekDates.map((date) => (
              <div
                key={date.toISOString()}
                className="text-center py-2 border-r last:border-r-0"
              >
                <div className="text-sm font-medium">{formatDayDate(date)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Week grid */}
        <div className="grid grid-cols-[80px_1fr] h-[calc(600px-41px)] overflow-y-auto">
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

          {/* Days columns */}
          <div className="grid grid-cols-7">
            {weekDates.map((date) => (
              <div
                key={date.toISOString()}
                className="relative border-r last:border-r-0"
              >
                {/* Time slot backgrounds */}
                {timeSlots.map((time) => (
                  <div
                    key={time}
                    className="h-[60px] border-b border-gray-100"
                  />
                ))}

                {/* Bookings for this day */}
                {getBookingsForDay(date).map((booking) => (
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
                      <div className="text-sm font-medium flex-1">
                        {booking._id}
                      </div>
                      <div className="text-sm text-gray-600">
                        {booking.services
                          .map((service) => service.name)
                          .join(", ")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
