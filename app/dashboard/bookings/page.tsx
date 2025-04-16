"use client";

import { useState, useEffect } from "react";
import { Booking, BookingStatus } from "@/app/models/booking";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Filter, SortAsc, SortDesc } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

// Loading spinner component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="relative">
      <div className="w-12 h-12 rounded-full border-4 border-gray-200"></div>
      <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin absolute top-0 left-0"></div>
    </div>
  </div>
);

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

// Filter and sort state interface
interface FilterState {
  status: BookingStatus | "all";
  customerName: string | null;
  description: string | null;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export default function BookingsPage() {
  const [selectedBay, setSelectedBay] = useState<number | "all">("all");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  // Filter and sort state
  const [filters, setFilters] = useState<FilterState>({
    status: "all",
    customerName: null,
    description: null,
    sortBy: 'date',
    sortOrder: 'desc'
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Build query parameters
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: '10',
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder
        });

        // Add bay filter if selected
        if (selectedBay !== "all") {
          params.append('bay', selectedBay.toString());
        }

        // Add status filter if not "all"
        if (filters.status !== "all") {
          params.append('status', filters.status);
        }

        // Add customer name filter if exists
        if (filters.customerName) {
          params.append('customerName', filters.customerName);
        }

        // Add description filter if exists
        if (filters.description) {
          params.append('description', filters.description);
        }

        console.log("API Request:", Object.fromEntries(params));

        const response = await fetch(`/api/bookings?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch bookings');
        }
        const data = await response.json();
        console.log("API Response:", data);

        setBookings(data.bookings);
        setPaginationInfo(data.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [currentPage, selectedBay, filters]);

  const handleFilterChange = (key: keyof FilterState, value: string | null) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSortChange = (field: string) => {
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= paginationInfo.totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        {/* Header with filters */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            {/* Bay selection */}
            <Select
              value={selectedBay.toString()}
              onValueChange={(value) => setSelectedBay(value === "all" ? "all" : parseInt(value))}
              disabled
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select bay" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Bays</SelectItem>
                <SelectItem value="1">Bay 1</SelectItem>
                <SelectItem value="2">Bay 2</SelectItem>
                <SelectItem value="3">Bay 3</SelectItem>
              </SelectContent>
            </Select>

            {/* Filter button */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-2",
                showFilters && "bg-blue-100"
              )}
              disabled
            >
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>

          {/* Sort controls */}
          <div className="flex gap-2">
            <Button variant="outline" disabled>
              Date
            </Button>
            <Button variant="outline" disabled>
              Customer
            </Button>
            <Button variant="outline" disabled>
              Service
            </Button>
          </div>
        </div>

        {/* Loading spinner */}
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header with filters */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          {/* Bay selection */}
          <Select
            value={selectedBay.toString()}
            onValueChange={(value) => setSelectedBay(value === "all" ? "all" : parseInt(value))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select bay" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Bays</SelectItem>
              <SelectItem value="1">Bay 1</SelectItem>
              <SelectItem value="2">Bay 2</SelectItem>
              <SelectItem value="3">Bay 3</SelectItem>
            </SelectContent>
          </Select>

          {/* Filter button */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2",
              showFilters && "bg-blue-100"
            )}
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>

        {/* Sort controls */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleSortChange('date')}
            className={cn(
              "flex items-center gap-2",
              filters.sortBy === 'date' && "bg-blue-100"
            )}
          >
            Date
            {filters.sortBy === 'date' && (
              filters.sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSortChange('customerName')}
            className={cn(
              "flex items-center gap-2",
              filters.sortBy === 'customerName' && "bg-blue-100"
            )}
          >
            Customer
            {filters.sortBy === 'customerName' && (
              filters.sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSortChange('description')}
            className={cn(
              "flex items-center gap-2",
              filters.sortBy === 'description' && "bg-blue-100"
            )}
          >
            Service
            {filters.sortBy === 'description' && (
              filters.sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange('status', value as BookingStatus | "all")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Customer name filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name
              </label>
              <Input
                type="text"
                value={filters.customerName || ''}
                onChange={(e) => handleFilterChange('customerName', e.target.value || null)}
                placeholder="Search customer..."
              />
            </div>

            {/* Description filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Description
              </label>
              <Input
                type="text"
                value={filters.description || ''}
                onChange={(e) => handleFilterChange('description', e.target.value || null)}
                placeholder="Search service..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Bookings table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Booking ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Service
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bay
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {booking.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {booking.customerName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {booking.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(booking.date), 'MMM dd, yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {booking.startTime} - {booking.endTime}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Bay {booking.bay}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={cn(
                    "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                    booking.status === 'completed' && "bg-green-100 text-green-800",
                    booking.status === 'ongoing' && "bg-amber-100 text-amber-800",
                    booking.status === 'upcoming' && "bg-blue-100 text-blue-800"
                  )}>
                    {booking.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {((currentPage - 1) * paginationInfo.itemsPerPage) + 1} to{' '}
          {Math.min(currentPage * paginationInfo.itemsPerPage, paginationInfo.totalItems)} of{' '}
          {paginationInfo.totalItems} bookings
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === paginationInfo.totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
