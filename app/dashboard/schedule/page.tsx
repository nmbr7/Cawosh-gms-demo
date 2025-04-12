"use client";

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Calendar } from '@/app/components/calendar';
import { MonthView } from '@/app/components/month-view';
import { Booking } from '@/app/models/booking';
import { bayBreaks } from '@/app/config/bay-breaks';
import { format } from 'date-fns';

function CalendarCaption(props: { 
  displayMonth: Date; 
  onMonthChange: (date: Date) => void;
}) {
  const { displayMonth, onMonthChange } = props;
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Get a range of years (e.g., current year ± 10 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

  const handleMonthChange = (monthIndex: number) => {
    const newDate = new Date(displayMonth);
    newDate.setMonth(monthIndex);
    onMonthChange(newDate);
  };

  const handleYearChange = (year: number) => {
    const newDate = new Date(displayMonth);
    newDate.setFullYear(year);
    onMonthChange(newDate);
  };

  return (
    <div className="flex justify-center items-center gap-2">
      <select
        value={displayMonth.getMonth()}
        onChange={(e) => handleMonthChange(parseInt(e.target.value))}
        className="px-2 py-1 rounded border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {months.map((month, index) => (
          <option key={month} value={index}>
            {month}
          </option>
        ))}
      </select>
      <select
        value={displayMonth.getFullYear()}
        onChange={(e) => handleYearChange(parseInt(e.target.value))}
        className="px-2 py-1 rounded border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedBay, setSelectedBay] = useState(2);
  const [viewMode, setViewMode] = useState<'Day' | 'Week' | 'Month'>('Week');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch bookings when date or bay changes
  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching bookings for:', {
          month: selectedDate.getMonth(),
          year: selectedDate.getFullYear(),
          bay: selectedBay
        });
        
        const response = await fetch(
          `/api/bookings?month=${selectedDate.getMonth()}&year=${selectedDate.getFullYear()}&bay=${selectedBay}`
        );
        const data = await response.json();
        console.log('Received bookings:', data);
        
        // Convert the API response into Booking class instances
        const bookingInstances = data.map((bookingData: any) => new Booking(bookingData));
        setBookings(bookingInstances);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [selectedDate, selectedBay]);

  // Generate time slots from 8 AM to 5 PM
  const timeSlots = Array.from({ length: 10 }, (_, i) => {
    const hour = i + 8;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  // Get week dates
  const getWeekDates = (date: Date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay()); // Start from Sunday
    
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      return day;
    });
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const formatDayDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      day: 'numeric',
    }).format(date);
  };

  const weekDates = getWeekDates(selectedDate);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setIsCalendarOpen(false);
    }
  };

  // Get break time for the selected bay
  const getBayBreak = (bay: number) => {
    return bayBreaks.find(breakTime => breakTime.bay === bay);
  };

  // Convert break time to booking
  const createBreakBooking = (date: string, bay: number) => {
    const bayBreak = getBayBreak(bay);
    if (!bayBreak) return null;

    return new Booking({
      id: `BREAK-${bay}`,
      customerName: 'Break Time',
      date,
      startTime: bayBreak.startTime,
      endTime: bayBreak.endTime,
      description: bayBreak.description,
      bay,
      status: 'break'
    });
  };

  return (
    <div className="p-6">
      {/* Header with navigation and view controls */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="relative">
            <button 
              onClick={() => setIsCalendarOpen(true)}
              className="flex items-center gap-2 hover:bg-gray-100 px-4 py-2 rounded-lg"
            >
              <h2 className="text-2xl font-semibold">{formatDate(selectedDate)}</h2>
            </button>

            <Calendar
              selectedDate={selectedDate}
              onSelect={handleDateSelect}
              isOpen={isCalendarOpen}
              onClose={() => setIsCalendarOpen(false)}
            />
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-4">
          {/* Bay selection */}
          <div className="flex gap-2">
            {[1, 2, 3].map((bay) => (
              <button
                key={bay}
                onClick={() => setSelectedBay(bay)}
                className={cn(
                  "px-4 py-2 rounded-full",
                  selectedBay === bay 
                    ? "bg-blue-100 text-blue-700" 
                    : "hover:bg-gray-100"
                )}
              >
                Bay-{bay}
              </button>
            ))}
          </div>

          {/* View mode selection */}
          <div className="flex gap-2 bg-gray-100 rounded-full p-1">
            {['Day', 'Week', 'Month'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode as any)}
                className={cn(
                  "px-4 py-1 rounded-full",
                  viewMode === mode 
                    ? "bg-white shadow-sm" 
                    : "hover:bg-gray-200"
                )}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-[600px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : viewMode === 'Month' ? (
          <MonthView
            selectedDate={selectedDate}
            selectedBay={selectedBay}
            bookings={bookings.filter(booking => !booking.isBreak())}
          />
        ) : (
          <div className="flex flex-col h-full">
            {/* Calendar grid */}
            <div className="bg-white rounded-lg shadow h-[600px] overflow-hidden">
              {viewMode === 'Week' ? (
                <>
                  {/* Week header */}
                  <div className="grid grid-cols-[80px_1fr] border-b">
                    <div className="border-r" /> {/* Empty cell for time column */}
                    <div className="grid grid-cols-7">
                      {weekDates.map((date) => (
                        <div key={date.toISOString()} className="text-center py-2 border-r last:border-r-0">
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
                        <div key={time} className="h-[60px] text-sm text-gray-500 pr-2 text-right">
                          {time}
                        </div>
                      ))}
                    </div>

                    {/* Days columns */}
                    <div className="grid grid-cols-7">
                      {weekDates.map((date) => (
                        <div key={date.toISOString()} className="relative border-r last:border-r-0">
                          {/* Time slot backgrounds */}
                          {timeSlots.map((time) => (
                            <div key={time} className="h-[60px] border-b border-gray-100" />
                          ))}

                          {/* Bookings for this day */}
                          {bookings
                            .filter(booking => {
                              const bookingDate = booking.date;
                              const currentDate = date.toISOString().slice(0, 10);
                              return bookingDate === currentDate && booking.bay === selectedBay && !booking.isBreak();
                            })
                            .map((booking) => (
                              <div
                                key={booking.id}
                                className={cn(
                                  "absolute w-full px-2",
                                  booking.getStatusColor()
                                )}
                                style={{
                                  top: `${booking.getTopPosition()}px`,
                                  height: `${booking.getHeight()}px`,
                                }}
                              >
                                <div className="p-2 flex flex-col h-full">
                                  <div className="text-sm font-medium flex-1">{booking.id}</div>
                                  <div className="text-sm text-gray-600">{booking.description}</div>
                                </div>
                              </div>
                            ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                // Day view
                <div className="grid grid-cols-[80px_1fr] h-[600px] overflow-hidden">
                  {/* Time column */}
                  <div className="border-r">
                    {timeSlots.map((time) => (
                      <div key={time} className="h-[60px] text-sm text-gray-500 pr-2 text-right">
                        {time}
                      </div>
                    ))}
                  </div>

                  {/* Schedule grid */}
                  <div className="relative grid grid-cols-1">
                    {/* Time slot backgrounds */}
                    {timeSlots.map((time) => (
                      <div key={time} className="h-[60px] border-b border-gray-100" />
                    ))}

                    {/* Bookings */}
                    {bookings
                      .filter(booking => booking.bay === selectedBay && !booking.isBreak())
                      .map((booking) => (
                        <div
                          key={booking.id}
                          className={cn(
                            "absolute w-full px-2",
                            booking.getStatusColor()
                          )}
                          style={{
                            top: `${booking.getTopPosition()}px`,
                            height: `${booking.getHeight()}px`,
                          }}
                        >
                          <div className="p-2 flex flex-col h-full">
                            <div className="text-sm font-medium flex-1">{booking.id}</div>
                            <div className="text-sm text-gray-600">{booking.description}</div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 