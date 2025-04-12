"use client";

import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { Booking, BookingStatus } from '@/app/models/booking';

interface MonthViewProps {
  selectedDate: Date;
  selectedBay: number;
  bookings: Booking[];
}

export function MonthView({ selectedDate, selectedBay, bookings }: MonthViewProps) {
  // Get all days in the current month
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get the first day of the month to calculate offset
  const firstDayOfMonth = monthStart.getDay();
  const offsetDays = Array(firstDayOfMonth).fill(null);

  // Combine offset days with actual days
  const allDays = [...offsetDays, ...daysInMonth];

  // Group days into weeks
  const weeks = [];
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7));
  }

  // Get bookings for a specific day
  const getBookingsForDay = (day: Date | null) => {
    if (!day) return [];
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.date);
      return isSameDay(bookingDate, day);
    });
  };

  return (
    <div className="w-full">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {allDays.map((day, index) => {
          const dayBookings = getBookingsForDay(day);
          const isCurrentMonth = day ? isSameMonth(day, selectedDate) : false;
          const isCurrentDay = day ? isToday(day) : false;
          const isSelectedDay = day ? isSameDay(day, selectedDate) : false;

          return (
            <div
              key={index}
              className={`
                min-h-[100px] p-2 border rounded-lg
                ${!isCurrentMonth ? 'bg-gray-50' : ''}
                ${isCurrentDay ? 'border-blue-500' : 'border-gray-200'}
                ${isSelectedDay ? 'bg-blue-50' : ''}
              `}
            >
              {day && (
                <>
                  <div className="text-sm font-medium mb-1">
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayBookings.map(booking => (
                      <div
                        key={booking.id}
                        className={booking.getStatusColor()}
                        title={`${booking.description} - ${booking.startTime} to ${booking.endTime}`}
                      >
                        <div className="text-xs p-1 rounded">
                          {booking.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
} 