"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Filter, SortAsc, SortDesc } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/app/components/calendar";
import { MonthView } from "@/app/components/month-view";
import { Booking } from "@/app/models/booking";
import { format } from "date-fns";
import { DayView } from "@/app/components/day-view";
import { WeekView } from "@/app/components/week-view";

// Filter and sort state interface
interface FilterState {
  status: string | null;
  customerName: string | null;
  description: string | null;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedBay, setSelectedBay] = useState(2);
  const [viewMode, setViewMode] = useState<"Day" | "Week" | "Month">("Week");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter and sort state
  const [filters, setFilters] = useState<FilterState>({
    status: null,
    customerName: null,
    description: null,
    sortBy: 'date',
    sortOrder: 'asc'
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch bookings when filters, date, or bay changes
  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      try {
        // For month view, we need all bookings for the month
        const monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        const monthEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
        
        const startDateStr = format(monthStart, 'yyyy-MM-dd');
        const endDateStr = format(monthEnd, 'yyyy-MM-dd');
        
        // Build query parameters
        const params = new URLSearchParams({
          bay: selectedBay.toString(),
          startDate: startDateStr,
          endDate: endDateStr,
          limit: '100',
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder
        });

        // Add optional filters if they exist
        if (filters.status) params.append('status', filters.status);
        if (filters.customerName) params.append('customerName', filters.customerName);
        if (filters.description) params.append('description', filters.description);

        console.log("API Request:", Object.fromEntries(params));

        const response = await fetch(`/api/bookings?${params.toString()}`);
        const data = await response.json();
        console.log("API Response:", data);

        const bookingInstances = data.bookings.map((bookingData: any) => new Booking(bookingData));
        setBookings(bookingInstances);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [selectedDate, selectedBay, filters]);

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
      year: "numeric"
    }).format(date);
  };

  const formatDayDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      day: "numeric",
    }).format(date);
  };

  const weekDates = getWeekDates(selectedDate);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setIsCalendarOpen(false);
    }
  };

  // Get bookings for a specific day
  const getBookingsForDay = (date: Date) => {
    const dayStr = format(date, 'yyyy-MM-dd');
    console.log("Checking bookings for day:", dayStr);
    console.log("Available bookings:", bookings.map(b => ({
      id: b.id,
      date: b.date,
      bay: b.bay,
      rawDate: new Date(b.date).toISOString()
    })));
    
    const dayBookings = bookings.filter(booking => {
      // Parse the booking date string directly
      const bookingDateStr = booking.date; // This is already in yyyy-MM-dd format
      const matches = bookingDateStr === dayStr && booking.bay === selectedBay;
      console.log("Booking check:", {
        bookingId: booking.id,
        bookingDate: booking.date,
        dayStr,
        bay: booking.bay,
        selectedBay,
        matches
      });
      return matches;
    });
    
    console.log("Found bookings for day:", dayBookings);
    return dayBookings;
  };

  const handleFilterChange = (key: keyof FilterState, value: string | null) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSortChange = (field: string) => {
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
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
            {(["Day", "Week", "Month"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  "px-4 py-1 rounded-full",
                  viewMode === mode ? "bg-white shadow-sm" : "hover:bg-gray-200"
                )}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Filter and Sort Controls */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "p-2 rounded-full",
                showFilters ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
              )}
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value || null)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Customer Name Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name
              </label>
              <input
                type="text"
                value={filters.customerName || ''}
                onChange={(e) => handleFilterChange('customerName', e.target.value || null)}
                placeholder="Search customer..."
                className="w-full p-2 border rounded-md"
              />
            </div>

            {/* Description Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Description
              </label>
              <input
                type="text"
                value={filters.description || ''}
                onChange={(e) => handleFilterChange('description', e.target.value || null)}
                placeholder="Search service..."
                className="w-full p-2 border rounded-md"
              />
            </div>
          </div>

          {/* Sort Controls */}
          <div className="mt-4 flex gap-4">
            <button
              onClick={() => handleSortChange('date')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full",
                filters.sortBy === 'date' ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
              )}
            >
              Date
              {filters.sortBy === 'date' && (
                filters.sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => handleSortChange('customerName')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full",
                filters.sortBy === 'customerName' ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
              )}
            >
              Customer
              {filters.sortBy === 'customerName' && (
                filters.sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => handleSortChange('description')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full",
                filters.sortBy === 'description' ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
              )}
            >
              Service
              {filters.sortBy === 'description' && (
                filters.sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      )}

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
