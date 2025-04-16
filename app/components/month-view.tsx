"use client";

import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { Booking, BookingStatus } from '@/app/models/booking';
import React from 'react';
import { cn } from '@/lib/utils';

interface MonthViewProps {
  selectedDate: Date;
  selectedBay: number;
  bookings: Booking[];
}

export function MonthView({ selectedDate, selectedBay, bookings }: MonthViewProps): React.ReactElement {
  // Get all days in the current month
  const monthStart: Date = startOfMonth(selectedDate);
  const monthEnd: Date = endOfMonth(selectedDate);
  const daysInMonth: Date[] = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get the first day of the month to calculate offset
  const firstDayOfMonth: number = monthStart.getDay();
  const offsetDays: (null)[] = Array(firstDayOfMonth).fill(null);

  // Calculate days needed to complete the last row
  const totalDays = offsetDays.length + daysInMonth.length;
  const remainingDays = 7 - (totalDays % 7);
  const endOffsetDays: (null)[] = remainingDays === 7 ? [] : Array(remainingDays).fill(null);

  // Combine offset days with actual days and end offset days
  const allDays: (Date | null)[] = [...offsetDays, ...daysInMonth, ...endOffsetDays];

  // Group days into weeks
  const weeks: (Date | null)[][] = [];
  for (let i: number = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7));
  }

  // Get bookings for a specific day
  const getBookingsForDay = (day: Date | null): Booking[] => {
    if (!day) return [];
    const dayStr = format(day, 'yyyy-MM-dd');
    
    
    const dayBookings = bookings.filter((booking: Booking) => {
      const matches = booking.date === dayStr && booking.bay === selectedBay;

      return matches;
    });
    
    return dayBookings;
  };

  return (
    <div className="bg-white rounded-lg shadow h-[600px] overflow-hidden">
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {/* Weekday headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day: string) => (
          <div
            key={day}
            className="bg-white p-2 text-center text-sm font-medium text-gray-500"
          >
            {day}
          </div>
        ))}

        {/* Calendar weeks */}
        {weeks.map((week: (Date | null)[], weekIndex: number) => (
          <React.Fragment key={weekIndex}>
            {week.map((day: Date | null, dayIndex: number) => {
              const dayBookings: Booking[] = getBookingsForDay(day);
              const isCurrentMonth: boolean = day ? isSameMonth(day, selectedDate) : false;
              const isCurrentDay: boolean = day ? isToday(day) : false;
              const isSelectedDay: boolean = day ? isSameDay(day, selectedDate) : false;

              return (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={cn(
                    "bg-white p-2 min-h-[100px]",
                    !isCurrentMonth && "text-gray-400",
                    isCurrentDay ? 'border-blue-500' : 'border-gray-200',
                    isSelectedDay ? 'bg-blue-50' : '',
                    weekIndex === weeks.length - 1 && "border-b border-gray-200"
                  )}
                >
                  {day && (
                    <>
                      <div className="text-sm font-medium mb-1">
                        {format(day, 'd')}
                      </div>
                      <div className="space-y-1">
                        {dayBookings.map((booking: Booking) => (
                          <div
                            key={booking.id}
                            className={cn(
                              "text-xs p-1 mb-1 rounded truncate",
                              booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                              booking.status === 'ongoing' ? 'bg-amber-100 text-amber-700' :
                              'bg-blue-100 text-blue-700'
                            )}
                            title={`${booking.description} - ${booking.startTime} to ${booking.endTime}`}
                          >
                            {booking.description}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
} 