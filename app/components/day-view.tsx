"use client";

import { cn } from '@/lib/utils';
import { type Booking } from './month-view';

interface DayViewProps {
  selectedDate: Date;
  selectedBay: number;
  bookings: Booking[];
}

const getBookingStatusColor = (status: 'upcoming' | 'ongoing' | 'completed' | 'blocked') => {
  switch (status) {
    case 'upcoming':
      return 'bg-purple-100 text-purple-800';
    case 'ongoing':
      return 'bg-yellow-100 text-yellow-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'blocked':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export function DayView({ selectedDate, selectedBay, bookings }: DayViewProps) {
  // Generate time slots from 8 AM to 5 PM
  const timeSlots = Array.from({ length: 10 }, (_, i) => {
    const hour = i + 8;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Time slots */}
      <div className="flex">
        <div className="w-20 flex-shrink-0">
          {timeSlots.map((time) => (
            <div
              key={time}
              className="h-16 border-b border-gray-200 flex items-center justify-center text-sm text-gray-500"
            >
              {time}
            </div>
          ))}
        </div>

        {/* Bookings */}
        <div className="flex-1 relative">
          {timeSlots.map((time) => (
            <div
              key={time}
              className="h-16 border-b border-gray-200"
            />
          ))}

          {bookings
            .filter(booking => booking.bay === selectedBay)
            .map((booking) => {
              const startHour = parseInt(booking.startTime.split(':')[0]);
              const endHour = parseInt(booking.endTime.split(':')[0]);
              const duration = endHour - startHour;
              const topPosition = (startHour - 8) * 60;
              const height = duration * 60;

              return (
                <div
                  key={booking.id}
                  className={cn(
                    "absolute w-full px-2",
                    getBookingStatusColor(booking.status)
                  )}
                  style={{
                    top: `${topPosition}px`,
                    height: `${height}px`,
                  }}
                >
                  {booking.status !== 'blocked' && (
                    <div className="p-2 flex flex-col h-full">
                      <div className="text-sm font-medium flex-1">{booking.id}</div>
                      <div className="text-sm text-gray-600">{booking.description}</div>
                    </div>
                  )}
                  {booking.status === 'blocked' && (
                    <div className="p-2">
                      <div className="text-sm font-medium text-gray-500">{booking.description}</div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
} 