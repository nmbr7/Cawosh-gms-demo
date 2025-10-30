
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import type { Booking } from "@/types/booking";
import { BookingDetailsModal } from "./booking-details-modal";
import { cn } from "@/lib/utils";

type Props = {
  bookings: Booking[];
  weekStartDate: Date;
  openCreateModal?: (date: Date, time: string) => void;
};

const hours = Array.from({ length: 24 }, (_, i) => i);
const MINUTES_IN_DAY = 24 * 60;
const MIN_HEIGHT_FOR_SERVICES = 30; // Only show services if >= 30px tall

const getMinutesFromTime = (time: string) => {
  const date = new Date(time);
  return date.getHours() * 60 + date.getMinutes();
};

export const WeekCalendar: React.FC<Props> = ({
  bookings,
  weekStartDate,
  openCreateModal,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 480; // Scroll to 8 AM
    }
  }, []);

  const daysOfWeek = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) =>
        dayjs(weekStartDate).add(i, "day").format("YYYY-MM-DD")
      ),
    [weekStartDate]
  );

  // Group bookings by day
  const bookingsByDay = useMemo(() => {
    const map = new Map<string, Booking[]>();
    daysOfWeek.forEach((d) => map.set(d, []));
    bookings.forEach((booking) => {
      const serviceDays = booking.services.map((s) =>
        dayjs(s.startTime).format("YYYY-MM-DD")
      );
      const uniqueDays = Array.from(new Set(serviceDays));
      uniqueDays.forEach((d) => {
        if (map.has(d)) {
          map.get(d)!.push(booking);
        }
      });
    });
    return map;
  }, [bookings, daysOfWeek]);

  const onBookingClick = (event: React.MouseEvent, booking: Booking) => {
    event.stopPropagation();
    setSelectedBookingId(booking._id);
    setIsModalOpen(true);
  };

  const onEmptySlotClick = (
    event: React.MouseEvent<HTMLDivElement>,
    day: string
  ) => {
    event.stopPropagation();
    const rect = (event.currentTarget as HTMLDivElement).getBoundingClientRect();
    const y = event.clientY - rect.top;
    const hour = Math.floor(y / 60);
    const time = `${hour.toString().padStart(2, "0")}:00`;
    const selectedDate = new Date(day);
    openCreateModal?.(selectedDate, time);
  };

  return (
    <div
      ref={containerRef}
      className="h-[80vh] overflow-y-auto border border-gray-300 relative font-sans bg-white"
    >
      <div
        className="grid grid-cols-[60px_repeat(7,1fr)] relative"
        style={{ minHeight: `${MINUTES_IN_DAY}px` }}
      >
        {/* Header Row */}
        <div className="bg-gray-100 border-b border-gray-300 h-[40px] sticky top-0 z-20" />
        {daysOfWeek.map((day, idx) => (
          <div
            key={idx}
            className="bg-gray-100 border-l border-gray-300 text-center text-sm font-medium h-[40px] flex items-center justify-center sticky top-0 z-20"
          >
            {dayjs(day).format("ddd, MMM D")}
          </div>
        ))}

        {/* Time Grid */}
        {hours.map((hour) => (
          <React.Fragment key={hour}>
            <div className="h-[60px] border-t border-gray-200 text-xs px-1 text-gray-600">
              {`${hour.toString().padStart(2, "0")}:00`}
            </div>
            {daysOfWeek.map((_, idx) => (
              <div
                key={`${hour}-${idx}`}
                className="relative h-[60px] border-l border-t border-gray-200 cursor-pointer hover:bg-gray-50"
              />
            ))}
          </React.Fragment>
        ))}

        {/* Booking Columns */}
        {daysOfWeek.map((day, dayIndex) => (
          <div
            key={`day-column-${dayIndex}`}
            className="absolute top-[40px] left-[60px] w-[calc((100%-60px)/7)] h-[1440px]"
            style={{ transform: `translateX(${dayIndex * 100}%)` }}
            onClick={(e) => onEmptySlotClick(e, day)}
          >
            {(bookingsByDay.get(day) ?? []).map((booking) => {
              const dayServices = booking.services.filter(
                (s) => dayjs(s.startTime).format("YYYY-MM-DD") === day
              );
              if (dayServices.length === 0) return null;

              const startMin = Math.min(
                ...dayServices.map((s) => getMinutesFromTime(s.startTime))
              );

              // Prefer totalDuration if available
              const height =
                booking.totalDuration ??
                Math.max(
                  ...dayServices.map((s) => getMinutesFromTime(s.endTime))
                ) - startMin;

              return (
                <div
                  key={booking._id + day}
                  className={cn(
                    "absolute left-1 right-1 bg-blue-100 text-blue-700 border border-blue-200 rounded text-xs z-10",
                    "cursor-pointer overflow-hidden px-2 hover:bg-blue-200 transition-all flex flex-col justify-center"
                  )}
                  style={{
                    top: `${startMin}px`,
                    height: `${height}px`,
                  }}
                  onClick={(e) => onBookingClick(e, booking)}
                >
                  {/* Always show customer and vehicle info */}
                  <div className="truncate text-xs font-medium">
                    {`${booking.customer?.name ?? "Unknown"} - ${booking.vehicle.make} ${booking.vehicle.model} (${booking.vehicle.year})`}
                  </div>

                  {/* Only show services if block height >= 30px */}
                  {height >= MIN_HEIGHT_FOR_SERVICES && (
                    <div className=" flex flex-col gap-[1px] overflow-hidden text-xs">
                      {dayServices.map((service) => (
                        <div
                          key={service._id}
                          className="flex justify-between truncate"
                        >
                          <span className="truncate font-medium">
                            {service.name}
                          </span>
                          <span className="text-gray-700 ml-1">
                            {`${service.technicianId.firstName} ${service.technicianId.lastName}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
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
};
