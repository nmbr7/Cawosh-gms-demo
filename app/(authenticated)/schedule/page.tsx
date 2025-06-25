"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Calendar } from "@/app/components/calendar";
import { MonthView } from "@/app/components/month-view";
import { Booking, BookingData } from "@/app/models/booking";
import { format } from "date-fns";
import { DayView } from "@/app/components/day-view";
import { WeekView } from "@/app/components/week-view";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedBay, setSelectedBay] = useState<"all" | number>("all");
  const [viewMode, setViewMode] = useState<"Day" | "Week" | "Month">("Month");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch bookings when date or bay changes
  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      try {
        // For month view, we need all bookings for the month
        const monthStart = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          1
        );
        const monthEnd = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth() + 1,
          0
        );

        const startDateStr = format(monthStart, "yyyy-MM-dd");
        const endDateStr = format(monthEnd, "yyyy-MM-dd");

        // Build query parameters
        const paramsObj: Record<string, string> = {
          startDate: startDateStr,
          endDate: endDateStr,
          all: "true",
        };
        if (selectedBay !== "all") {
          paramsObj.bay = selectedBay.toString();
        }
        const params = new URLSearchParams(paramsObj);

        const response = await fetchWithAuth(
          `/api/bookings?${params.toString()}`
        );
        const data = await response.json();

        const bookingInstances = data.bookings.map(
          (bookingData: BookingData) => new Booking(bookingData)
        );
        setBookings(bookingInstances);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [selectedDate, selectedBay]);

  useEffect(() => {
    // If 'All Bays' is selected and viewMode is not 'Month', switch to Bay 1
    if (selectedBay === "all" && viewMode !== "Month") {
      setSelectedBay(1);
    }
  }, [viewMode, selectedBay]);

  // Generate time slots from 8 AM to 5 PM
  const timeSlots = Array.from({ length: 10 }, (_, i) => {
    const hour = i + 8;
    return `${hour.toString().padStart(2, "0")}:00`;
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
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const weekDates = getWeekDates(selectedDate);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setIsCalendarOpen(false);
    }
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setViewMode("Day");
  };

  const handlePreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  return (
    <div className="p-6">
      {/* Header with navigation and view controls */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={handlePreviousDay}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="relative">
              <button
                onClick={() => setIsCalendarOpen(true)}
                className="flex items-center gap-2 hover:bg-gray-100 px-4 py-2 rounded-lg"
              >
                <h2 className="text-2xl font-semibold">
                  {formatDate(selectedDate)}
                </h2>
              </button>

              <Calendar
                selectedDate={selectedDate}
                onSelect={handleDateSelect}
                isOpen={isCalendarOpen}
                onClose={() => setIsCalendarOpen(false)}
              />
            </div>
            <button
              onClick={handleNextDay}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-4">
            {/* Bay selection */}
            <Select
              value={selectedBay.toString()}
              onValueChange={(value) =>
                value === "all"
                  ? setSelectedBay("all")
                  : setSelectedBay(parseInt(value))
              }
            >
              <SelectTrigger className="w-[180px] bg-white">
                <SelectValue placeholder="Select bay" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {viewMode === "Month" && (
                  <SelectItem value="all" className="hover:bg-gray-100">
                    All Bays
                  </SelectItem>
                )}
                <SelectItem value="1" className="hover:bg-gray-100">
                  Bay 1
                </SelectItem>
                <SelectItem value="2" className="hover:bg-gray-100">
                  Bay 2
                </SelectItem>
                <SelectItem value="3" className="hover:bg-gray-100">
                  Bay 3
                </SelectItem>
              </SelectContent>
            </Select>

            {/* View mode selection */}
            <Select
              value={viewMode}
              onValueChange={(value) =>
                setViewMode(value as "Day" | "Week" | "Month")
              }
            >
              <SelectTrigger className="w-[180px] bg-white">
                <SelectValue placeholder="Select view" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="Day" className="hover:bg-gray-100">
                  Day View
                </SelectItem>
                <SelectItem value="Week" className="hover:bg-gray-100">
                  Week View
                </SelectItem>
                <SelectItem value="Month" className="hover:bg-gray-100">
                  Month View
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-[600px]">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-4 border-gray-200"></div>
              <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin absolute top-0 left-0"></div>
            </div>
          </div>
        ) : viewMode === "Month" ? (
          <MonthView
            selectedDate={selectedDate}
            selectedBay={selectedBay}
            bookings={bookings}
            onDayClick={handleDayClick}
          />
        ) : viewMode === "Day" ? (
          <DayView
            selectedDate={selectedDate}
            selectedBay={selectedBay}
            bookings={bookings}
            timeSlots={timeSlots}
          />
        ) : (
          <WeekView
            selectedDate={selectedDate}
            selectedBay={selectedBay}
            bookings={bookings}
            timeSlots={timeSlots}
            weekDates={weekDates}
          />
        )}
      </div>
    </div>
  );
}
