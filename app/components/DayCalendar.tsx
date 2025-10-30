import { cn } from '@/lib/utils';
import React, { useEffect, useRef, useState } from 'react';
import type { Booking } from '@/types/booking';
import { BookingDetailsModal } from './booking-details-modal';

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
    null,
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
    const time = `${hour.toString().padStart(2, '0')}:00`;
    const date = selectedDate ?? new Date();
    openCreateModal(date, time);
  };

  return (
    <div
      ref={containerRef}
      className="overflow-y-auto h-[80vh] border border-gray-300 relative rounded bg-white"
    >
      <div className="flex min-h-[1440px] relative">
        {/* Time Column */}
        <div className="w-[60px] border-r border-gray-200 flex flex-col">
          {Array.from({ length: 24 }, (_, i) => (
            <div
              key={i}
              className="h-[60px] px-1 text-xs text-gray-800 box-border text-right border-b border-gray-200"
            >
              {i.toString().padStart(2, '0')}:00
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
          {(() => {
            // Precompute for efficiency: map bookings to startMin/endMin/bayId
            const bookingsWithTimes = bookings
              .filter((b) => b.services && b.services.length > 0)
              .map((b) => {
                const mins = b.services.map((s) =>
                  getMinutesFromMidnight(s.startTime),
                );
                return {
                  ...b,
                  startMin: Math.min(...mins),
                  endMin: Math.min(...mins) + b.totalDuration,
                  bayId: b.services[0]?.bayId ?? undefined,
                };
              })
              .sort((a, b) => a.startMin - b.startMin);

            // Build a map for quick lookup of index by _id
            const bookingIndexMap = new Map<string, number>();
            bookingsWithTimes.forEach((b, idx) =>
              bookingIndexMap.set(b._id, idx),
            );

            return bookings.map((booking) => {
              if (!booking.services || booking.services.length === 0)
                return null;

              const mins = booking.services.map((s) =>
                getMinutesFromMidnight(s.startTime),
              );
              const startMin = Math.min(...mins);

              const selfIdx = bookingIndexMap.get(booking._id);
              if (selfIdx === undefined) return null;

              // Calculate overlap count only for bookings before current one
              let overlapCount = 0;
              const curr = bookingsWithTimes[selfIdx];
              for (let i = 0; i < selfIdx; ++i) {
                const prev = bookingsWithTimes[i];
                if (
                  prev.endMin > curr.startMin && // overlaps start
                  prev.startMin < curr.endMin && // overlaps end
                  prev.bayId !== curr.bayId // only count different bay
                ) {
                  overlapCount++;
                }
              }
              const overlapShiftPx = 10;
              const leftShift = 10 + overlapCount * overlapShiftPx;

              return (
                <div
                  key={booking._id}
                  className={cn(
                    'absolute right-[10px] rounded text-xs z-10 shadow group',
                    'cursor-pointer flex flex-col justify-center pl-2 pr-2 overflow-hidden',
                    'border bg-blue-50 text-blue-900 border-blue-100',
                    'transition-all duration-150',
                    'hover:border-[1.5px] hover:border-violet-400',
                    'focus:outline-none focus:ring-1 focus:ring-violet-400',
                    'hover:z-50',
                    'text-left', // left-aligned text at rest and on hover
                  )}
                  style={{
                    left: `${leftShift}px`,
                    top: `${startMin}px`,
                    width: '97%',
                    height: `${booking.totalDuration}px`,
                    backgroundColor: (() => {
                      const bayId = booking.services[0]?.bayId;
                      const bayColors: Record<string, string> = {
                        '1': '#bcdff6',
                        '2': '#bfe8dd',
                        '3': '#fcf3c2',
                        '4': '#f9c5d1',
                        '5': '#d2c6ed',
                        '6': '#c5efff',
                        '7': '#ffe3c1',
                        '8': '#e7d6f5',
                        '9': '#d7f8d7',
                      };
                      if (bayId) {
                        const baySuffix = Object.keys(bayColors).find((k) =>
                          bayId.endsWith(k),
                        );
                        if (baySuffix) return bayColors[baySuffix];
                      }
                      return '#e0e7ef';
                    })(),
                    // Lock lineHeight and gap for consistency to prevent 'jump' on hover
                    lineHeight: '1.1rem',
                  }}
                  onClick={(e) => onBookingClick(booking._id, e)}
                >
                  <style jsx>{`
                    .group:hover {
                      height: calc(
                        ${booking.totalDuration}px + 12px
                      ) !important;
                    }
                    .group,
                    .group * {
                      line-height: 1.1rem !important;
                    }
                    .group .booking-header,
                    .group .booking-service-row {
                      gap: 0.25rem !important;
                      margin: 0 !important;
                      padding: 0 !important;
                    }
                    .group .booking-service-row {
                      margin-bottom: 0 !important;
                    }
                  `}</style>
                  {booking.totalDuration >= MIN_VERTICAL_HEIGHT ? (
                    // Tall enough: stack vertically, text left
                    <>
                      <div
                        className="booking-header text-gray-600 text-xs truncate flex items-center justify-between w-full text-left"
                        style={{
                          lineHeight: '1.1rem',
                          textAlign: 'left',
                        }}
                      >
                        <span className="text-left">
                          {`[${booking.vehicle.license ?? 'No Reg'}] ${booking.vehicle.make} ${booking.vehicle.model} (${booking.vehicle.year}) - ${(booking.customer?.name).toUpperCase() ?? 'UNKNOWN CUSTOMER'}`}
                        </span>
                        <span className="ml-2 text-blue-500 flex-shrink-0">
                          {(() => {
                            const bayId = booking.services[0]?.bayId;
                            const match = bayId && bayId.match(/(\d+)$/);
                            return match ? `Bay ${match[1]}` : '';
                          })()}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 overflow-hidden text-xs text-left">
                        {booking.services.map((service) => (
                          <div
                            key={service._id}
                            className="booking-service-row truncate text-left flex items-center"
                            style={{
                              lineHeight: '1.1rem',
                              textAlign: 'left',
                            }}
                          >
                            <span className="font-medium truncate text-left">
                              {service.name}
                            </span>
                            <span className="text-gray-600 ml-2">{`${service.technicianId.firstName} ${service.technicianId.lastName}`}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    // Too short: inline info, text left
                    <div
                      className="booking-header text-gray-600 text-xs truncate flex gap-1 items-center justify-between w-full text-left"
                      style={{
                        lineHeight: '1.1rem',
                        textAlign: 'left',
                      }}
                    >
                      <span className="flex gap-1 items-center truncate text-left">
                        {`${(booking.customer?.name).toUpperCase() ?? 'Unknown Customer'} ${booking.vehicle.make} ${booking.vehicle.model} (${booking.vehicle.year})`}
                        {booking.services.map((service) => (
                          <span
                            key={service._id}
                            className="font-medium truncate text-blue-700 text-left"
                          >
                            {service.name}
                          </span>
                        ))}
                      </span>
                      <span className="ml-2 text-blue-500 flex-shrink-0 text-left">
                        {(() => {
                          const bayId = booking.services[0]?.bayId;
                          const match = bayId && bayId.match(/(\d+)$/);
                          return match ? `Bay ${match[1]}` : '';
                        })()}
                      </span>
                    </div>
                  )}
                </div>
              );
            });
          })()}
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
