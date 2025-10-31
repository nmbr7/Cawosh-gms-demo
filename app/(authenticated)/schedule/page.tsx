'use client';

import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Calendar } from '@/app/components/calendar';
import { MonthView } from '@/app/components/month-view';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useScheduleStore, viewType } from './scheduleStore';
import { useBookingStore } from '@/store/booking';
import { WeekCalendar } from '@/app/components/WeekCalendar';
import { BookingCreateModal } from '@/app/components/BookingCreateModal';
import { Booking as StoreBooking } from '@/types/booking';
import { DayCalendar } from '@/app/components/DayCalendar';

export default function SchedulePage() {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const [bookings, setBookings] = useState<StoreBooking[]>([]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newBookingDate, setNewBookingDate] = useState<Date | undefined>(
    undefined,
  );
  const [newBookingTime, setNewBookingTime] = useState<string | undefined>(
    undefined,
  );

  const {
    selectedDate,
    setSelectedDate,
    selectedBay,
    setSelectedBay,
    viewMode,
    setViewMode,
    isLoading,
  } = useScheduleStore(); // indended store for schedule with api integration

  //dummy store
  const storeBookings = useBookingStore((state) => state.bookings);

  const onEmptyBlockClick = (date: Date, time: string) => {
    setIsCreateModalOpen(true);
    // Strip 'Z' from the date string if present (to remove UTC designator)
    // TODO: fix this
    const dateStr =
      date instanceof Date ? date.toISOString().replace(/Z$/, '') : date;

    setNewBookingDate(new Date(dateStr));
    setNewBookingTime(time);
  };

  const filteredBookings = useCallback(() => {
    if (!storeBookings) return [];

    let start: Date;
    let end: Date;

    switch (viewMode) {
      case viewType.Month:
        start = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          1,
        );
        end = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth() + 1,
          0,
        );
        break;
      case viewType.Week:
        start = new Date(selectedDate);
        start.setDate(start.getDate() - start.getDay());
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        break;
      case viewType.Day:
      default:
        start = new Date(selectedDate);
        start.setHours(0, 0, 0, 0);
        end = new Date(selectedDate);
        end.setHours(23, 59, 59, 999);
        break;
    }

    const filtered = storeBookings.filter((booking) => {
      const bookingDate = new Date(booking.services[0].startTime);
      bookingDate.setHours(12, 0, 0, 0);
      const dateInRange = bookingDate >= start && bookingDate <= end;
      const bayOk =
        selectedBay === 'all' ||
        booking.services?.some((s) => s.bayId?.endsWith(String(selectedBay)));

      return dateInRange && bayOk;
    });
    setBookings(filtered);
  }, [storeBookings, selectedDate, viewMode, selectedBay]);

  useEffect(() => {
    filteredBookings();
  }, [filteredBookings, , setSelectedBay, storeBookings]);

  // const timeSlots = Array.from({ length: 10 }, (_, i) => `${i + 8}:00`);
  const getWeekDates = (date: Date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };

  const weekDates = getWeekDates(selectedDate);
  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setViewMode(viewType.Day);
  };

  return (
    <div className="p-3">
      {/* HEADER */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() =>
                setSelectedDate(
                  new Date(selectedDate.setDate(selectedDate.getDate() - 1)),
                )
              }
            >
              <ChevronLeft />
            </button>
            <div className="relative">
              <button
                onClick={() => setIsCalendarOpen(true)}
                className="text-2xl font-semibold"
              >
                {formatDate(selectedDate)}
              </button>
              <Calendar
                selectedDate={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                isOpen={isCalendarOpen}
                onClose={() => setIsCalendarOpen(false)}
              />
            </div>
            <button
              onClick={() =>
                setSelectedDate(
                  new Date(selectedDate.setDate(selectedDate.getDate() + 1)),
                )
              }
            >
              <ChevronRight />
            </button>
          </div>

          <div className="flex gap-4">
            <Select
              value={selectedBay.toString()}
              onValueChange={(val) =>
                setSelectedBay(val === 'all' ? 'all' : parseInt(val))
              }
            >
              <SelectTrigger className="w-[180px] bg-white">
                <SelectValue placeholder="Select bay" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Bays</SelectItem>
                {[1, 2, 3, 4, 5].map((bay) => (
                  <SelectItem key={bay} value={bay.toString()}>
                    Bay {bay}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={viewMode}
              onValueChange={(val) => setViewMode(val as viewType)}
            >
              <SelectTrigger className="w-[180px] bg-white">
                <SelectValue placeholder="Select view" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={viewType.Day}>Day View</SelectItem>
                <SelectItem value={viewType.Week}>Week View</SelectItem>
                <SelectItem value={viewType.Month}>Month View</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      {/* CALENDAR VIEW */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-[600px]">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-4 border-gray-200"></div>
              <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin absolute top-0 left-0"></div>
            </div>
          </div>
        ) : viewMode === viewType.Month ? (
          <MonthView onDayClick={handleDayClick} bookings={bookings} />
        ) : viewMode === viewType.Day ? (
          <DayCalendar
            selectedDate={selectedDate}
            bookings={bookings}
            openCreateModal={onEmptyBlockClick}
          />
        ) : (
          <WeekCalendar
            bookings={bookings}
            weekStartDate={weekDates[0]}
            openCreateModal={onEmptyBlockClick}
          />
        )}
      </div>
      {/* Create Booking Modal */}
      <BookingCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onBookingCreated={filteredBookings}
        selectedDate={newBookingDate}
        clickedTime={newBookingTime}
        bay={selectedBay}
      />
    </div>
  );
}
