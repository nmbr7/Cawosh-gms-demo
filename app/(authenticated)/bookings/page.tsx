"use client";

import { useState, useEffect } from "react";
import { Booking, BookingStatus } from "@/app/models/booking";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import React from "react";
import { BookingDetailsModal } from "@/app/components/booking-details-modal";
import { BookingCreateModal } from "@/app/components/BookingCreateModal";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { useGarageStore } from "@/store/garage";
import { DataTable } from "@/components/ui/data-table";

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
  serviceId: string | null;
  serviceStatus: string | null;
  minPrice: string | null;
  maxPrice: string | null;
  startDate: string | null;
  endDate: string | null;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export default function BookingsPage() {
  const [selectedBay, setSelectedBay] = useState<number | "all">("all");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Filter and sort state
  const [filters, setFilters] = useState<FilterState>({
    status: "all",
    customerName: null,
    serviceId: null,
    serviceStatus: null,
    minPrice: null,
    maxPrice: null,
    startDate: null,
    endDate: null,
    sortBy: "date",
    sortOrder: "desc",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Get garage from store
  const garage = useGarageStore((state) => state.garage);

  // Define table columns
  const columns = [
    {
      header: "Booking ID",
      accessorKey: "bookingId" as keyof Booking,
      cell: (booking: Booking) => (
        <span className="font-medium text-gray-900">
          {booking.bookingId || booking._id || "N/A"}
        </span>
      ),
    },
    {
      header: "Customer",
      accessorKey: "customer" as keyof Booking,
      cell: (booking: Booking) => (
        <div>
          <div className="font-medium">{booking.customer.name}</div>
          <div className="text-xs text-gray-400">{booking.customer.email}</div>
        </div>
      ),
    },
    {
      header: "Service & Vehicle",
      accessorKey: "services" as keyof Booking,
      cell: (booking: Booking) => (
        <div>
          <div className="font-medium">
            {booking.services?.[0]?.name || "Unknown Service"}
          </div>
          <div className="mt-1 text-xs text-gray-400">
            {booking.vehicle.make} {booking.vehicle.model} (
            {booking.vehicle.year})
          </div>
        </div>
      ),
    },
    {
      header: "Date",
      accessorKey: "bookingDate" as keyof Booking,
      cell: (booking: Booking) => {
        try {
          const date = new Date(booking.bookingDate);
          if (isNaN(date.getTime())) {
            return <span className="text-red-500">Invalid Date</span>;
          }
          return format(date, "MMM dd, yyyy");
        } catch {
          return <span className="text-red-500">Invalid Date</span>;
        }
      },
    },
    {
      header: "Time",
      accessorKey: "services" as keyof Booking,
      cell: (booking: Booking) => {
        try {
          return booking.getFormattedTime();
        } catch {
          // Fallback if getFormattedTime is not available
          const primaryService = booking.services?.[0];
          if (primaryService?.startTime && primaryService?.endTime) {
            const startTime = new Date(
              primaryService.startTime
            ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            const endTime = new Date(primaryService.endTime).toLocaleTimeString(
              [],
              { hour: "2-digit", minute: "2-digit" }
            );
            return `${startTime} - ${endTime}`;
          }
          return "N/A";
        }
      },
    },
    {
      header: "Bay",
      accessorKey: "assignedBay" as keyof Booking,
    },
    {
      header: "Status",
      accessorKey: "status" as keyof Booking,
      cell: (booking: Booking) => {
        try {
          return (
            <span
              className={cn(
                "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                booking.getStatusColor()
              )}
            >
              {booking.status}
            </span>
          );
        } catch {
          // Fallback if getStatusColor is not available
          const getStatusColor = (status: string) => {
            switch (status) {
              case "pending":
                return "bg-yellow-100 text-yellow-800";
              case "confirmed":
                return "bg-blue-100 text-blue-800";
              case "in-progress":
                return "bg-orange-100 text-orange-800";
              case "completed":
                return "bg-green-100 text-green-800";
              case "cancelled":
                return "bg-red-100 text-red-800";
              default:
                return "bg-gray-100 text-gray-800";
            }
          };

          return (
            <span
              className={cn(
                "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                getStatusColor(booking.status)
              )}
            >
              {booking.status}
            </span>
          );
        }
      },
    },
  ];

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if garage is available
      if (!garage?.id) {
        setError("Garage information not available");
        return;
      }

      // Build query parameters
      const params = new URLSearchParams({
        garageId: garage.id,
        page: currentPage.toString(),
        limit: "10",
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });

      // Add bay filter if selected
      if (selectedBay !== "all") {
        params.append("bay", selectedBay.toString());
      }

      // Add status filter if not "all"
      if (filters.status !== "all") {
        params.append("status", filters.status);
      }

      // Add service status filter if exists
      if (filters.serviceStatus) {
        params.append("serviceStatus", filters.serviceStatus);
      }

      // Add price range filters if exist
      if (filters.minPrice) {
        params.append("minPrice", filters.minPrice);
      }
      if (filters.maxPrice) {
        params.append("maxPrice", filters.maxPrice);
      }

      // Add date range filters if exist
      if (filters.startDate) {
        params.append("startDate", filters.startDate);
      }
      if (filters.endDate) {
        params.append("endDate", filters.endDate);
      }

      // console.log("API Request:", Object.fromEntries(params));

      const response = await fetchWithAuth(
        `/api/bookings?${params.toString()}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch bookings");
      }
      const data = await response.json();
      // console.log("API Response:", data);

      setBookings(data.bookings);
      setPaginationInfo(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [currentPage, selectedBay, filters]);

  const handleFilterChange = (key: keyof FilterState, value: string | null) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSortChange = (field: string) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: field,
      sortOrder:
        prev.sortBy === field && prev.sortOrder === "asc" ? "desc" : "asc",
    }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= paginationInfo.totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      setCurrentPage(1); // Reset to first page

      // Check if garage is available
      if (!garage?.id) {
        setError("Garage information not available");
        return;
      }

      // Build query parameters
      const params = new URLSearchParams({
        garageId: garage.id,
        page: "1",
        limit: "10",
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });

      // Add bay filter if selected
      if (selectedBay !== "all") {
        params.append("bay", selectedBay.toString());
      }

      // Add status filter if not "all"
      if (filters.status !== "all") {
        params.append("status", filters.status);
      }

      // Add service status filter if exists
      if (filters.serviceStatus) {
        params.append("serviceStatus", filters.serviceStatus);
      }

      // Add price range filters if exist
      if (filters.minPrice) {
        params.append("minPrice", filters.minPrice);
      }
      if (filters.maxPrice) {
        params.append("maxPrice", filters.maxPrice);
      }

      // Add date range filters if exist
      if (filters.startDate) {
        params.append("startDate", filters.startDate);
      }
      if (filters.endDate) {
        params.append("endDate", filters.endDate);
      }

      const response = await fetchWithAuth(
        `/api/bookings?${params.toString()}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch bookings");
      }
      const data = await response.json();

      setBookings(data.bookings);
      setPaginationInfo(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsRefreshing(false);
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
              onValueChange={(value) =>
                setSelectedBay(value === "all" ? "all" : parseInt(value))
              }
            >
              <SelectTrigger className="w-[180px] bg-white">
                <SelectValue placeholder="Select bay" />
              </SelectTrigger>
              <SelectContent className="bg-white">
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

            {/* Refresh button */}
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={cn(
                "flex items-center gap-2",
                isRefreshing && "opacity-50 cursor-not-allowed"
              )}
            >
              {isRefreshing ? (
                <svg
                  className="w-4 h-4 animate-spin"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              )}
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </Button>
          </div>

          <div className="flex items-center gap-4">
            {/* Sort controls */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleSortChange("date")}
                className={cn(
                  "flex items-center gap-2",
                  filters.sortBy === "date" && "bg-blue-100"
                )}
              >
                Date
                {filters.sortBy === "date" &&
                  (filters.sortOrder === "asc" ? (
                    <SortAsc className="w-4 h-4" />
                  ) : (
                    <SortDesc className="w-4 h-4" />
                  ))}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSortChange("customerName")}
                className={cn(
                  "flex items-center gap-2",
                  filters.sortBy === "customerName" && "bg-blue-100"
                )}
              >
                Customer
                {filters.sortBy === "customerName" &&
                  (filters.sortOrder === "asc" ? (
                    <SortAsc className="w-4 h-4" />
                  ) : (
                    <SortDesc className="w-4 h-4" />
                  ))}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSortChange("serviceId")}
                className={cn(
                  "flex items-center gap-2",
                  filters.sortBy === "serviceId" && "bg-blue-100"
                )}
              >
                Service
                {filters.sortBy === "serviceId" &&
                  (filters.sortOrder === "asc" ? (
                    <SortAsc className="w-4 h-4" />
                  ) : (
                    <SortDesc className="w-4 h-4" />
                  ))}
              </Button>
            </div>

            {/* Create Booking button */}
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              Create Booking
            </Button>
          </div>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Customer name filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name
                </label>
                <Input
                  type="text"
                  value={filters.customerName || ""}
                  onChange={(e) =>
                    handleFilterChange("customerName", e.target.value || null)
                  }
                  placeholder="Search customer..."
                />
              </div>

              {/* Service filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service
                </label>
                <Input
                  type="text"
                  value={filters.serviceId || ""}
                  onChange={(e) =>
                    handleFilterChange("serviceId", e.target.value || null)
                  }
                  placeholder="Search service..."
                />
              </div>

              {/* Status filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <Select
                  value={filters.status}
                  onValueChange={(value) =>
                    handleFilterChange("status", value as BookingStatus | "all")
                  }
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Bookings table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
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
            <tbody className="bg-white">
              {/* Progress bar as divider */}
              <tr>
                <td colSpan={7} className="p-0">
                  <div className="h-1 bg-blue-500 animate-pulse"></div>
                </td>
              </tr>
              {/* Shimmer rows */}
              {[1, 2, 3].map((row) => (
                <React.Fragment key={row}>
                  <tr className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-48"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </td>
                  </tr>
                  {row < 3 && (
                    <tr>
                      <td colSpan={7} className="p-0">
                        <div className="h-px bg-gray-200"></div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
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
            onValueChange={(value) =>
              setSelectedBay(value === "all" ? "all" : parseInt(value))
            }
          >
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Select bay" />
            </SelectTrigger>
            <SelectContent className="bg-white">
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

          {/* Refresh button */}
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={cn(
              "flex items-center gap-2",
              isRefreshing && "opacity-50 cursor-not-allowed"
            )}
          >
            {isRefreshing ? (
              <svg
                className="w-4 h-4 animate-spin"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            )}
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        <div className="flex items-center gap-4">
          {/* Sort controls */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleSortChange("date")}
              className={cn(
                "flex items-center gap-2",
                filters.sortBy === "date" && "bg-blue-100"
              )}
            >
              Date
              {filters.sortBy === "date" &&
                (filters.sortOrder === "asc" ? (
                  <SortAsc className="w-4 h-4" />
                ) : (
                  <SortDesc className="w-4 h-4" />
                ))}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSortChange("customerName")}
              className={cn(
                "flex items-center gap-2",
                filters.sortBy === "customerName" && "bg-blue-100"
              )}
            >
              Customer
              {filters.sortBy === "customerName" &&
                (filters.sortOrder === "asc" ? (
                  <SortAsc className="w-4 h-4" />
                ) : (
                  <SortDesc className="w-4 h-4" />
                ))}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSortChange("serviceId")}
              className={cn(
                "flex items-center gap-2",
                filters.sortBy === "serviceId" && "bg-blue-100"
              )}
            >
              Service
              {filters.sortBy === "serviceId" &&
                (filters.sortOrder === "asc" ? (
                  <SortAsc className="w-4 h-4" />
                ) : (
                  <SortDesc className="w-4 h-4" />
                ))}
            </Button>
          </div>

          {/* Create Booking button */}
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-500 text-white hover:bg-blue-600"
          >
            Create Booking
          </Button>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Customer name filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name
              </label>
              <Input
                type="text"
                value={filters.customerName || ""}
                onChange={(e) =>
                  handleFilterChange("customerName", e.target.value || null)
                }
                placeholder="Search customer..."
              />
            </div>

            {/* Service filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service
              </label>
              <Input
                type="text"
                value={filters.serviceId || ""}
                onChange={(e) =>
                  handleFilterChange("serviceId", e.target.value || null)
                }
                placeholder="Search service..."
              />
            </div>

            {/* Status filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  handleFilterChange("status", value as BookingStatus | "all")
                }
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Bookings table */}
      <DataTable
        columns={columns}
        data={bookings}
        isLoading={isLoading}
        onRowClick={(booking) => {
          setSelectedBookingId(booking._id || null);
          setIsModalOpen(true);
        }}
        emptyMessage={
          filters.status !== "all" || filters.customerName || filters.serviceId
            ? "No bookings match your filters"
            : "No bookings found"
        }
        emptySubMessage={
          filters.status !== "all" || filters.customerName || filters.serviceId
            ? "Try adjusting your filters or search criteria"
            : "Get started by creating a new booking"
        }
        emptyAction={
          filters.status !== "all" || filters.customerName || filters.serviceId
            ? {
                label: "Clear filters",
                onClick: () => {
                  setFilters({
                    status: "all",
                    customerName: null,
                    serviceId: null,
                    serviceStatus: null,
                    minPrice: null,
                    maxPrice: null,
                    startDate: null,
                    endDate: null,
                    sortBy: "date",
                    sortOrder: "desc",
                  });
                },
              }
            : {
                label: "Create Booking",
                onClick: () => setIsCreateModalOpen(true),
              }
        }
      />

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {(currentPage - 1) * paginationInfo.itemsPerPage + 1} to{" "}
          {Math.min(
            currentPage * paginationInfo.itemsPerPage,
            paginationInfo.totalItems
          )}{" "}
          of {paginationInfo.totalItems} bookings
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {/* Page numbers */}
          <div className="flex gap-1">
            {Array.from(
              { length: paginationInfo.totalPages },
              (_, i) => i + 1
            ).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                onClick={() => handlePageChange(page)}
                className={cn(
                  "w-8 h-8 p-0",
                  currentPage === page &&
                    "bg-blue-500 text-white hover:bg-blue-600"
                )}
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === paginationInfo.totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Booking Details Modal */}
      <BookingDetailsModal
        bookingId={selectedBookingId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Create Booking Modal */}
      <BookingCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onBookingCreated={fetchBookings}
      />
    </div>
  );
}
