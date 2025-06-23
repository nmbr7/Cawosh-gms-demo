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
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Filter and sort state
  const [filters, setFilters] = useState<FilterState>({
    status: "all",
    customerName: null,
    serviceId: null,
    sortBy: "date",
    sortOrder: "desc",
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

        // Add customer name filter if exists
        if (filters.customerName) {
          params.append("customerName", filters.customerName);
        }

        // Add service ID filter if exists
        if (filters.serviceId) {
          params.append("serviceId", filters.serviceId);
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

      // Build query parameters
      const params = new URLSearchParams({
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

      // Add customer name filter if exists
      if (filters.customerName) {
        params.append("customerName", filters.customerName);
      }

      // Add service ID filter if exists
      if (filters.serviceId) {
        params.append("serviceId", filters.serviceId);
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
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
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
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
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
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="p-4 bg-gray-50 rounded-full">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-medium text-gray-900">
                        {filters.status !== "all" ||
                        filters.customerName ||
                        filters.serviceId
                          ? "No bookings match your filters"
                          : "No bookings found"}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {filters.status !== "all" ||
                        filters.customerName ||
                        filters.serviceId
                          ? "Try adjusting your filters or search criteria"
                          : "Get started by creating a new booking"}
                      </p>
                    </div>
                    {filters.status !== "all" ||
                    filters.customerName ||
                    filters.serviceId ? (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setFilters({
                            status: "all",
                            customerName: null,
                            serviceId: null,
                            sortBy: "date",
                            sortOrder: "desc",
                          });
                        }}
                        className="mt-2"
                      >
                        Clear filters
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          /* TODO: Add create booking handler */
                        }}
                        className="mt-2"
                      >
                        Create Booking
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr
                  key={booking.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setSelectedBooking(booking);
                    setIsModalOpen(true);
                  }}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {booking.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="font-medium">{booking.customer.name}</div>
                    <div className="text-xs text-gray-400">
                      {booking.customer.email}
                      {/* <br />
                      {booking.customer.phone} */}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="font-medium">{booking.serviceName}</div>
                    <div className="mt-1 text-xs text-gray-400">
                      {booking.car.make} {booking.car.model} ({booking.car.year}
                      )
                      {/* <br />
                      {booking.car.registration} */}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(booking.date), "MMM dd, yyyy")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {booking.startTime} - {booking.endTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Bay {booking.bay}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={cn(
                        "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                        booking.status === "completed" &&
                          "bg-green-100 text-green-800",
                        booking.status === "ongoing" &&
                          "bg-amber-100 text-amber-800",
                        booking.status === "scheduled" &&
                          "bg-blue-100 text-blue-800",
                        booking.status === "blocked" &&
                          "bg-red-100 text-red-800",
                        booking.status === "break" &&
                          "bg-gray-100 text-gray-800"
                      )}
                    >
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
        booking={selectedBooking}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Create Booking Modal */}
      <BookingCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
