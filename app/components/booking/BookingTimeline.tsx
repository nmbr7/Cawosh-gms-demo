import React from "react";
import { BookedSlotCard } from "./BookedSlotCard";
import type { Booking } from "@/store/booking";

interface BookingTimelineProps {
  bayId: string;
  technicianId?: string;
  date: Date;
  existingBookings: Booking[];
  businessHours: Array<{
    day: string;
    open: string;
    close: string;
    isClosed: boolean;
  }>;
}

// Generate 30-minute time slots from business hours
const generateTimeSlots = (
  businessHours: Array<{
    day: string;
    open: string;
    close: string;
    isClosed: boolean;
  }>,
  date: Date
): string[] => {
  const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
  const dayHours = businessHours.find(
    (h) => h.day.toLowerCase() === dayName.toLowerCase()
  );

  // Fallback to 10 AM - 5 PM if no business hours found
  const startHour =
    dayHours && !dayHours.isClosed ? parseInt(dayHours.open.split(":")[0]) : 10; // Default to 10 AM
  const endHour =
    dayHours && !dayHours.isClosed
      ? parseInt(dayHours.close.split(":")[0])
      : 17; // Default to 5 PM

  const slots: string[] = [];
  for (let hour = startHour; hour < endHour; hour++) {
    slots.push(`${hour.toString().padStart(2, "0")}:00`);
    slots.push(`${hour.toString().padStart(2, "0")}:30`);
  }

  return slots;
};

// Find booking at a specific time
const findBookingAtTime = (
  bookings: Booking[],
  time: string
): Booking | null => {
  const timeStr = time.padStart(5, "0"); // Ensure format like "09:00"

  return (
    bookings.find((booking) => {
      const bookingStart = new Date(booking.startTime);
      const bookingTime = bookingStart.toTimeString().slice(0, 5);
      return bookingTime === timeStr;
    }) || null
  );
};

export const BookingTimeline: React.FC<BookingTimelineProps> = ({
  bayId,
  date,
  existingBookings,
  businessHours,
}) => {
  const timeSlots = generateTimeSlots(businessHours, date);

  if (!bayId) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p className="text-sm">Please select a bay to view schedule</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="text-xs text-gray-600 mb-2">
        {bayId} -{" "}
        {date.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        })}
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        {timeSlots.map((time) => {
          const booking = findBookingAtTime(existingBookings, time);

          return (
            <div key={time} className="flex items-start gap-2 mb-1">
              <span className="w-10 text-xs text-gray-600 pt-1 flex-shrink-0">
                {time}
              </span>
              <div className="flex-1 h-10 border rounded min-w-0">
                {booking ? (
                  <BookedSlotCard booking={booking} />
                ) : (
                  <div className="h-full bg-gray-50" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
