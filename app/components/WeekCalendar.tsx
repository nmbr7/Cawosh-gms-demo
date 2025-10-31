'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import dayjs from 'dayjs';
import type { Booking } from '@/types/booking';
import { BookingDetailsModal } from './booking-details-modal';
import { cn } from '@/lib/utils';

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
    null,
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
        dayjs(weekStartDate).add(i, 'day').format('YYYY-MM-DD'),
      ),
    [weekStartDate],
  );

  // Group bookings by day
  const bookingsByDay = useMemo(() => {
    const map = new Map<string, Booking[]>();
    daysOfWeek.forEach((d) => map.set(d, []));
    bookings.forEach((booking) => {
      const serviceDays = booking.services.map((s) =>
        dayjs(s.startTime).format('YYYY-MM-DD'),
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
    day: string,
  ) => {
    event.stopPropagation();
    const rect = (
      event.currentTarget as HTMLDivElement
    ).getBoundingClientRect();
    const y = event.clientY - rect.top;
    const hour = Math.floor(y / 60);
    const time = `${hour.toString().padStart(2, '0')}:00`;
    const selectedDate = new Date(day);
    openCreateModal?.(selectedDate, time);
  };

  return (
    <div
      ref={containerRef}
      className="h-[80vh] overflow-y-auto border border-gray-300 relative bg-white"
    >
      <div
        className="grid grid-cols-[60px_repeat(7,1fr)] relative text-right"
        style={{ minHeight: `${MINUTES_IN_DAY}px` }}
      >
        {/* Header Row */}
        <div className="bg-gray-100 border-b border-gray-300 h-[40px] sticky top-0 z-30" />
        {daysOfWeek.map((day, idx) => (
          <div
            key={idx}
            className="bg-gray-100 border-l border-gray-300 text-center text-sm font-medium h-[40px] flex items-center justify-center sticky top-0 z-20"
          >
            {dayjs(day).format('ddd, MMM D')}
          </div>
        ))}

        {/* Time Grid */}
        {hours.map((hour) => (
          <React.Fragment key={hour}>
            <div className="h-[60px] border-t border-gray-200 text-xs px-1 text-gray-600">
              {`${hour.toString().padStart(2, '0')}:00`}
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
        {daysOfWeek.map((day, dayIndex) => {
          // Prepare booking data for the day
          const bookingsWithTimes = (bookingsByDay.get(day) ?? [])
            .filter((b) => b.services && b.services.length > 0)
            .map((b) => {
              const dayServices = b.services.filter(
                (s) => dayjs(s.startTime).format('YYYY-MM-DD') === day,
              );
              if (dayServices.length === 0) return null;
              const mins = dayServices.map((s) =>
                getMinutesFromTime(s.startTime),
              );
              return {
                ...b,
                startMin: Math.min(...mins),
                endMin: Math.min(...mins) + (b.totalDuration ?? 0),
                bayId: dayServices[0]?.bayId ?? undefined,
                _dayServices: dayServices,
              };
            })
            .filter(Boolean)
            .sort((a, b) => a!.startMin - b!.startMin) as Array<
            Booking & {
              startMin: number;
              endMin: number;
              bayId?: string;
              _dayServices: NonNullable<Booking['services']>;
            }
          >;

          const bookingIndexMap = new Map<string, number>();
          bookingsWithTimes.forEach((b, idx) =>
            bookingIndexMap.set(b._id, idx),
          );

          // === NOW-LINE, INDICATOR FOR CURRENT TIME FOR THIS DAY ONLY ===
          const now = new Date();
          let nowLine = null;
          const dayDate = dayjs(day);
          if (
            now.getFullYear() === dayDate.year() &&
            now.getMonth() === dayDate.month() &&
            now.getDate() === dayDate.date()
          ) {
            const minutesFromMidnight = now.getHours() * 60 + now.getMinutes();

            // We want the red line to fit exactly inside this column, not overlap based on padding, calculation, etc.
            // Width needs to use a real pixel calc, honoring border + width, take into account parent is absolute within left:60px; then transformX for column placement
            // The parent <div> for the "day" is:
            // className="absolute top-[40px] left-[60px] w-[calc((100%-60px)/7)] h-[1440px]"
            // so the "container" is already for 1 column, at left:60px + start, width: (100%-60px)/7;

            // So the correct style for the red line is left: 0px, width: 100% (relative to the column absolute parent)
            // Place the red line and the vertical dash as children of the *day column* container (not outside) so they align

            nowLine = (
              <>
                <div
                  className={`absolute pointer-events-none current-time-indicator-${dayIndex}`}
                  style={{
                    zIndex: 30,
                    top: `${minutesFromMidnight}px`,
                    left: 0,
                    width: '100%',
                    height: '2px',
                    background: '#ef4444',
                    boxShadow: '0px 1px 6px 0px rgba(239, 68, 68, 0.13)',
                    borderRadius: 2,
                    transition: 'z-index 0.15s',
                  }}
                />
                {/* The vertical dash at the left of the column */}
                <div
                  className="absolute"
                  style={{
                    zIndex: 30,
                    top: `${minutesFromMidnight - 5}px`,
                    left: 0,
                    width: '2px',
                    height: '12px',
                    borderLeft: '2px dashed rgb(152, 42, 42)',
                    background:
                      'linear-gradient(180deg,#ef4444 0%,#fca5a5 100%)',
                    borderRadius: '2px',
                    pointerEvents: 'none',
                  }}
                />
              </>
            );
          }

          return (
            <div
              key={`day-column-${dayIndex}`}
              className="absolute top-[40px] left-[60px] w-[calc((100%-60px)/7)] h-[1440px]"
              style={{ transform: `translateX(${dayIndex * 100}%)` }}
              onClick={(e) => onEmptySlotClick(e, day)}
            >
              {nowLine}
              {bookingsWithTimes.map((booking) => {
                const dayServices = booking._dayServices;
                if (!dayServices || dayServices.length === 0) return null;

                const mins = dayServices.map((s) =>
                  getMinutesFromTime(s.startTime),
                );
                const startMin = Math.min(...mins);

                const selfIdx = bookingIndexMap.get(booking._id);
                if (selfIdx === undefined) return null;

                // Calculate overlap count only for bookings before current one
                let overlapCount = 0;
                const curr = bookingsWithTimes[selfIdx];
                for (let j = 0; j < selfIdx; ++j) {
                  const prev = bookingsWithTimes[j];
                  if (
                    prev.endMin > curr.startMin &&
                    prev.startMin < curr.endMin &&
                    prev.bayId !== curr.bayId
                  ) {
                    overlapCount++;
                  }
                }
                const overlapShiftPx = 10;
                const leftShift = 5 + overlapCount * overlapShiftPx;

                // Always use explicit difference for height
                const blockEnd =
                  booking.totalDuration !== undefined
                    ? startMin + booking.totalDuration
                    : Math.max(
                        ...dayServices.map((s) =>
                          getMinutesFromTime(s.endTime),
                        ),
                      );
                const height = blockEnd - startMin;

                return (
                  <div
                    key={booking._id + day}
                    className={cn(
                      'absolute right-[10px] rounded text-xs shadow',
                      'cursor-pointer flex flex-col justify-center items-center pl-2 pr-2 overflow-hidden',
                      'border bg-blue-50 text-blue-900 border-blue-100',
                      'transition-all duration-150',
                      'hover:border-[1.5px] hover:border-violet-400',
                      'focus:outline-none focus:ring-1 focus:ring-violet-400',
                      'text-left',
                      'group',
                      'hover:z-60',
                    )}
                    style={{
                      top: `${startMin}px`,
                      height: `${height}px`,
                      left: `${leftShift}px`,
                      width: '85%',
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
                      transition: 'height 0.18s',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onBookingClick(e, booking);
                    }}
                  >
                    <style jsx>{`
                      .group:hover {
                        width: 120% !important;
                        right: 0px !important;
                        height: ${height + 14}px !important;
                      }
                    `}</style>
                    {/* Always show customer and vehicle info */}
                    <div className="truncate text-xs font-medium text-left w-full">
                      {`[${booking.vehicle.license ?? 'No Reg'}] ${booking.vehicle.make} ${booking.vehicle.model} - ${booking.customer?.name ?? 'Unknown Customer'}`}
                    </div>

                    {/* Only show services if block height >= 30px */}
                    {height >= MIN_HEIGHT_FOR_SERVICES && (
                      <div className="flex flex-col gap-[1px] overflow-hidden text-xs text-left w-full">
                        {(
                          dayServices as Array<{
                            _id: string;
                            name: string;
                            technicianId: {
                              firstName: string;
                              lastName: string;
                            };
                          }>
                        ).map((service) => (
                          <div
                            key={service._id}
                            className="truncate font-medium text-left"
                          >
                            {service.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <BookingDetailsModal
        bookingId={selectedBookingId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
