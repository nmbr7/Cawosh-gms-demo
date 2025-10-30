'use client';

import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
} from 'date-fns';
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import type { Booking } from '@/types/booking';
import { useScheduleStore } from '../(authenticated)/schedule/scheduleStore';
import dayjs from 'dayjs';
import { BookingDetailsModal } from './booking-details-modal';

interface MonthViewProps {
  onDayClick: (date: Date) => void;
  bookings?: Booking[];
}

// Utility for bay color logic (same as week/day view)
const getBayColor = (bayId?: string) => {
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
    const baySuffix = Object.keys(bayColors).find((k) => bayId.endsWith(k));
    if (baySuffix) return bayColors[baySuffix];
  }
  return '#e0e7ef';
};

export function MonthView({
  onDayClick,
  bookings,
}: MonthViewProps): React.ReactElement {
  const { selectedDate, selectedBay } = useScheduleStore();

  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const firstDayOffset = monthStart.getDay();
  const offsetDays = Array(firstDayOffset).fill(null);
  const totalDays = offsetDays.length + daysInMonth.length;
  const endOffsetDays = (7 - (totalDays % 7)) % 7;
  const allDays: (Date | null)[] = [
    ...offsetDays,
    ...daysInMonth,
    ...Array(endOffsetDays).fill(null),
  ];

  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7));
  }

  const getBookingsForDay = (day: Date | null): Booking[] => {
    if (!day || !bookings) return [];
    const dayStr = dayjs(day).format('YYYY-MM-DD');

    return bookings.filter((booking) => {
      const dateObj = new Date(booking.bookingDate);
      return (
        dayjs(dateObj).format('YYYY-MM-DD') === dayStr && selectedBay // You can remove this check if you want all bays
      );
    });
  };

  const onBookingClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedBookingId(id);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white rounded-lg shadow h-full overflow-hidden">
      <div className="grid grid-cols-7 gap-px bg-gray-200 h-full">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
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
              const isCurrentMonth = day
                ? isSameMonth(day, selectedDate)
                : false;
              const isCurrentDay = day ? isToday(day) : false;
              const isSelectedDay = day ? isSameDay(day, selectedDate) : false;

              return (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  onClick={() => day && onDayClick(day)}
                  className={cn(
                    'bg-white p-2 min-h-[100px] relative',
                    !isCurrentMonth && 'text-gray-400',
                    isCurrentDay ? 'border-blue-500' : 'border-gray-200',
                    isSelectedDay && 'bg-blue-50',
                    day && 'cursor-pointer hover:bg-gray-50',
                  )}
                  style={{ overflow: 'hidden' }}
                >
                  {day && (
                    <>
                      <div className="text-sm font-medium mb-1">
                        {format(day, 'd')}
                      </div>
                      <div className="space-y-1 relative z-10">
                        {dayBookings.slice(0, 2).map((booking) => {
                          const bayId = booking.services?.[0]?.bayId;
                          const cardColor = getBayColor(bayId);

                          // Compose a single line of text for the card
                          const mainService = booking.services?.[0];
                          const singleLine = [
                            `[${booking.vehicle.license ?? 'No Reg'}]`,
                            booking.vehicle.make,
                            booking.vehicle.model,
                            `(${booking.vehicle.year})`,
                            '-',
                            booking.customer?.name
                              ? booking.customer?.name.toUpperCase()
                              : 'UNKNOWN CUSTOMER',
                            mainService ? `· ${mainService.name}` : '',
                            mainService &&
                            mainService.startTime &&
                            mainService.endTime
                              ? `(${mainService.startTime} - ${mainService.endTime})`
                              : '',
                            bayId
                              ? `• Bay ${bayId.replace(/^.*(\d+)$/, '$1')}`
                              : '',
                          ]
                            .filter(Boolean)
                            .join(' ');

                          return (
                            <div
                              key={booking._id}
                              className={cn(
                                'rounded shadow group cursor-pointer transition-all overflow-hidden border focus:outline-none focus:ring-1 focus:ring-violet-400 hover:z-50',
                                'px-2 py-[6px] flex items-center text-xs text-left',
                                'bg-blue-50 text-blue-900 border-blue-100',
                                'mb-1',
                                'month-booking-card', // custom class for hover border
                              )}
                              style={{
                                backgroundColor: cardColor,
                                borderColor: cardColor,
                                lineHeight: '1.1rem',
                                minHeight: 30,
                              }}
                              title={singleLine}
                              onClick={(e) => onBookingClick(e, booking._id)}
                            >
                              <span className="truncate w-full">
                                {singleLine}
                              </span>
                              <style jsx>{`
                                .month-booking-card:hover {
                                  border-color: rgb(
                                    166,
                                    120,
                                    245
                                  ) !important; /* violet-500 */
                                  border-width: 1px !important;
                                }
                              `}</style>
                            </div>
                          );
                        })}
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
