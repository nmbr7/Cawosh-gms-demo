import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";
import type { Booking } from "@/types/booking";
import { BookingDetailsModal } from "./booking-details-modal";

type Props = {
  selectedDate?: Date;
  bookings: Booking[];
  openCreateModal: (date: Date, time: string) => void;
};

const MINUTES_IN_DAY = 24 * 60;
const MIN_VERTICAL_HEIGHT = 30; // Minimum height to show stacked layout

export const DayCalendar: React.FC<Props> = ({
  selectedDate,
  bookings,
  openCreateModal,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const onBookingClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedBookingId(id);
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 8 * 60; // Scroll to 08:00
    }
  }, []);

  const getMinutesFromMidnight = (timeStr: string) => {
    const date = new Date(timeStr);
    return date.getHours() * 60 + date.getMinutes();
  };

  const onBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const hour = Math.floor(y / 60);
    const time = `${hour.toString().padStart(2, "0")}:00`;
    const date = selectedDate ?? new Date();
    openCreateModal(date, time);
  };

  return (
    <div
      ref={containerRef}
      className="overflow-y-auto h-[80vh] border border-gray-300 relative font-sans rounded bg-white"
    >
      <div className="flex min-h-[1440px] relative">
        {/* Time Column */}
        <div className="w-[60px] border-r border-gray-200 flex flex-col">
          {Array.from({ length: 24 }, (_, i) => (
            <div
              key={i}
              className="h-[60px] px-1 text-xs text-gray-800 box-border text-right border-b border-gray-200"
            >
              {i.toString().padStart(2, "0")}:00
            </div>
          ))}
        </div>

        {/* Booking Column */}
        <div
          className="relative flex-1 bg-white"
          style={{ height: `${MINUTES_IN_DAY}px` }}
          onClick={onBackgroundClick}
        >
          {/* Hour background lines */}
          <div className="absolute inset-0 z-0">
            {Array.from({ length: 24 }, (_, i) => (
              <div key={i} className="h-[60px] border-b border-gray-200" />
            ))}
          </div>

          {/* Booking blocks */}
          {bookings.map((booking) => {
            if (!booking.services || booking.services.length === 0) return null;

            const startTimes = booking.services.map((s) =>
              getMinutesFromMidnight(s.startTime)
            );
            const startMin = Math.min(...startTimes);

            return (
              <div
                key={booking._id}
                className={cn(
                  "absolute left-[10px] right-[10px] rounded text-xs z-10",
                  "bg-blue-100 text-blue-700 border border-blue-200 cursor-pointer hover:bg-blue-200 overflow-hidden flex flex-col justify-center pl-2"
                )}
                style={{
                  top: `${startMin}px`,
                  height: `${booking.totalDuration}px`,
                }}
                onClick={(e) => onBookingClick(booking._id, e)}
              >
                {booking.totalDuration >= MIN_VERTICAL_HEIGHT ? (
                  // Tall enough: stack vertically
                  <>
                    <div
                      className="text-gray-600 text-xs truncate"
                      style={{ lineHeight: "1rem" }}
                    >
                      {`${(booking.customer?.name).toUpperCase() ?? "Unknown Customer"} ${booking.vehicle.make} ${booking.vehicle.model} (${booking.vehicle.year})`}
                    </div>
                    <div className="flex flex-col gap-[1px] overflow-hidden text-xs">
                      {booking.services.map((service) => (
                        <div
                          key={service._id}
                          className="truncate"
                          style={{ lineHeight: "1rem" }}
                        >
                          <span className="font-medium truncate">
                            {service.name}
                          </span>
                          <span className="text-gray-600 ml-2">{`${service.technicianId.firstName} ${service.technicianId.lastName}`}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  // Too short: inline with customer info
                  <div className="text-gray-600 text-xs truncate flex gap-1 items-center">
                    <span className="truncate">{`${(booking.customer?.name).toUpperCase() ?? "Unknown Customer"} ${booking.vehicle.make} ${booking.vehicle.model} (${booking.vehicle.year})`}</span>
                    {booking.services.map((service) => (
                      <span key={service._id} className="font-medium truncate text-blue-700">
                        {service.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
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
