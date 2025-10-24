"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useJobSheetStore, JobSheet as StoreJobSheet } from "@/store/jobSheet";
import { useBookingStore } from "@/store/booking";
import { format } from "date-fns";

// Removed old JobSheet interface - using StoreJobSheet from store

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

// Filter and sort state interface
interface FilterState {
  status: string | "all";
  bookingId: string | null;
  technicianId: string | null;
  diagnosisStatus: string | null;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

// interface FilterOptions {
//   statuses: Array<{ value: string; label: string }>;
//   serviceStatuses: Array<{ value: string; label: string }>;
//   technicians: Array<{ id: string; name: string }>;
//   // ...add others as needed
// }

// const formatTime = (time: string) => {
//   try {
//     const [hours, minutes] = time.split(":");
//     return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
//   } catch {
//     return time; // Return original if parsing fails
//   }
// };

// const formatDate = (dateString: string) => {
//   const date = new Date(dateString);
//   return date.toLocaleDateString("en-US", {
//     month: "long",
//     day: "numeric",
//     year: "numeric",
//   });
// };

export default function JobSheetPage() {
  const [jobSheets, setJobSheets] = useState<StoreJobSheet[]>([]);
  const [selectedJobSheet, setSelectedJobSheet] =
    useState<StoreJobSheet | null>(null);
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

  // Get jobsheets and bookings from stores separately
  const storeJobSheets = useJobSheetStore((state) => state.jobSheets);
  const bookings = useBookingStore((state) => state.bookings);
  const filterOptions = useJobSheetStore((state) => state.filterOptions);

  // Combine jobsheets with booking data using useMemo for stable reference
  const jobSheetsWithBookings = useMemo(() => {
    return storeJobSheets.map((jobSheet) => {
      const booking = bookings.find((b) => b._id === jobSheet.bookingId);
      return {
        ...jobSheet,
        booking,
      };
    });
  }, [storeJobSheets, bookings]);

  // Filter and sort state
  const [filters, setFilters] = useState<FilterState>({
    status: "all",
    bookingId: null,
    technicianId: null,
    diagnosisStatus: null,
    sortBy: "id",
    sortOrder: "desc",
  });
  const [showFilters, setShowFilters] = useState(false);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= paginationInfo.totalPages) {
      setCurrentPage(newPage);
    }
  };

  const fetchJobSheets = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // Use store data instead of API
    const all = jobSheetsWithBookings || [];

    // Apply filters
    const filtered = all.filter((js) => {
      const statusOk = filters.status === "all" || js.status === filters.status;

      const bookingIdOk =
        !filters.bookingId ||
        (js.booking?.bookingId
          ?.toLowerCase()
          .includes(filters.bookingId.toLowerCase()) ??
          false);

      const technicianOk =
        !filters.technicianId ||
        (js.booking?.services?.some(
          (s) => s.technicianId?._id === filters.technicianId
        ) ??
          false);

      const diagnosisOk =
        !filters.diagnosisStatus ||
        (() => {
          if (filters.diagnosisStatus === "standard") {
            return !js.requiresDiagnosis;
          }
          if (filters.diagnosisStatus === "awaiting-diagnosis") {
            return (
              js.requiresDiagnosis &&
              (!js.diagnosedServices || js.diagnosedServices.length === 0)
            );
          }
          if (filters.diagnosisStatus === "pending-approval") {
            return js.requiresDiagnosis && js.approvalStatus === "pending";
          }
          if (filters.diagnosisStatus === "approved") {
            return js.requiresDiagnosis && js.approvalStatus === "approved";
          }
          if (filters.diagnosisStatus === "rejected") {
            return js.requiresDiagnosis && js.approvalStatus === "rejected";
          }
          return true;
        })();

      return statusOk && bookingIdOk && technicianOk && diagnosisOk;
    });

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      const dir = filters.sortOrder === "asc" ? 1 : -1;
      if (filters.sortBy === "id") {
        return a.id.localeCompare(b.id) * dir;
      }
      if (filters.sortBy === "status") {
        return a.status.localeCompare(b.status) * dir;
      }
      // Default: sort by creation date (latest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Apply pagination
    const itemsPerPage = 10;
    const totalItems = sorted.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const start = (currentPage - 1) * itemsPerPage;
    const pageData = sorted.slice(start, start + itemsPerPage);

    setJobSheets(pageData);
    setPaginationInfo({
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage,
    });
    setIsLoading(false);
  }, [currentPage, filters, jobSheetsWithBookings]);

  useEffect(() => {
    fetchJobSheets();
  }, [fetchJobSheets]);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      setCurrentPage(1); // Reset to first page
      await fetchJobSheets();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleFilterChange = (key: keyof FilterState, value: string | null) => {
    console.log("handleFilterChange", key, value);
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

  const handleJobSheetClick = (jobSheet: StoreJobSheet) => {
    setSelectedJobSheet(jobSheet);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        {/* Header with filters */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
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
              className="flex items-center gap-2"
            >
              Refresh
            </Button>
          </div>

          <div className="flex items-center gap-4">
            {/* Sort controls */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleSortChange("id")}
                className={cn(
                  "flex items-center gap-2",
                  filters.sortBy === "id" && "bg-blue-100"
                )}
              >
                ID
                {filters.sortBy === "id" &&
                  (filters.sortOrder === "asc" ? (
                    <SortAsc className="w-4 h-4" />
                  ) : (
                    <SortDesc className="w-4 h-4" />
                  ))}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSortChange("status")}
                className={cn(
                  "flex items-center gap-2",
                  filters.sortBy === "status" && "bg-blue-100"
                )}
              >
                Status
                {filters.sortBy === "status" &&
                  (filters.sortOrder === "asc" ? (
                    <SortAsc className="w-4 h-4" />
                  ) : (
                    <SortDesc className="w-4 h-4" />
                  ))}
              </Button>
            </div>
          </div>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Booking ID filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Booking ID
                </label>
                <Input
                  type="text"
                  value={filters.bookingId || ""}
                  onChange={(e) =>
                    handleFilterChange("bookingId", e.target.value || null)
                  }
                  placeholder="Search booking ID..."
                />
              </div>

              {/* Technician filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Technician
                </label>
                <Select
                  value={filters.technicianId || "all"}
                  onValueChange={(value) =>
                    handleFilterChange(
                      "technicianId",
                      value === "all" ? null : value
                    )
                  }
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select technician" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">All Technicians</SelectItem>
                    {filterOptions.technicians.map((tech) => (
                      <SelectItem key={tech.id} value={tech.id}>
                        {tech.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => handleFilterChange("status", value)}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">All Statuses</SelectItem>
                    {filterOptions.statuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Job Sheets table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Sheet ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking ID
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
                  Technician
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tasks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {/* Progress bar as divider */}
              <tr>
                <td colSpan={6} className="p-0">
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
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-48"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-48"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </td>
                  </tr>
                  {row < 3 && (
                    <tr>
                      <td colSpan={6} className="p-0">
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
            className="flex items-center gap-2"
          >
            Refresh
          </Button>
        </div>

        <div className="flex items-center gap-4">
          {/* Sort controls */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleSortChange("id")}
              className={cn(
                "flex items-center gap-2",
                filters.sortBy === "id" && "bg-blue-100"
              )}
            >
              ID
              {filters.sortBy === "id" &&
                (filters.sortOrder === "asc" ? (
                  <SortAsc className="w-4 h-4" />
                ) : (
                  <SortDesc className="w-4 h-4" />
                ))}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSortChange("status")}
              className={cn(
                "flex items-center gap-2",
                filters.sortBy === "status" && "bg-blue-100"
              )}
            >
              Status
              {filters.sortBy === "status" &&
                (filters.sortOrder === "asc" ? (
                  <SortAsc className="w-4 h-4" />
                ) : (
                  <SortDesc className="w-4 h-4" />
                ))}
            </Button>
          </div>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Booking ID filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Booking ID
              </label>
              <Input
                type="text"
                value={filters.bookingId || ""}
                onChange={(e) =>
                  handleFilterChange("bookingId", e.target.value || null)
                }
                placeholder="Search booking ID..."
              />
            </div>

            {/* Technician filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Technician
              </label>
              <Select
                value={filters.technicianId || "all"}
                onValueChange={(value) =>
                  handleFilterChange(
                    "technicianId",
                    value === "all" ? null : value
                  )
                }
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select technician" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Technicians</SelectItem>
                  {filterOptions.technicians.map((tech) => (
                    <SelectItem key={tech.id} value={tech.id}>
                      {tech.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange("status", value)}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Statuses</SelectItem>
                  {filterOptions.statuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Additional filters row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Diagnosis filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Diagnosis Status
              </label>
              <Select
                value={filters.diagnosisStatus || "all"}
                onValueChange={(value) =>
                  handleFilterChange(
                    "diagnosisStatus",
                    value === "all" ? null : value
                  )
                }
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select diagnosis status" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="standard">Standard Jobs</SelectItem>
                  <SelectItem value="awaiting-diagnosis">
                    Awaiting Diagnosis
                  </SelectItem>
                  <SelectItem value="pending-approval">
                    Pending Approval
                  </SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Job Sheets table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                REF
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                BKN. ID
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
                Technician
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tasks
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Diagnosis
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {jobSheets.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
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
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-medium text-gray-900">
                        {filters.status !== "all" ||
                        filters.bookingId ||
                        filters.technicianId
                          ? "No job sheets match your filters"
                          : "No job sheets found"}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {filters.status !== "all" ||
                        filters.bookingId ||
                        filters.technicianId
                          ? "Try adjusting your filters or search criteria"
                          : "Job sheets will appear here when created"}
                      </p>
                    </div>
                    {filters.status !== "all" ||
                    filters.bookingId ||
                    filters.technicianId ? (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setFilters({
                            status: "all",
                            bookingId: null,
                            technicianId: null,
                            sortBy: "id",
                            sortOrder: "desc",
                          });
                        }}
                        className="mt-2"
                      >
                        Clear filters
                      </Button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ) : (
              jobSheets.map((jobSheet) => (
                <tr
                  key={jobSheet.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleJobSheetClick(jobSheet)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {jobSheet.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {jobSheet.booking?.bookingId || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {jobSheet.booking?.bookingDate
                      ? format(
                          new Date(jobSheet.booking.bookingDate),
                          "MMM dd, yyyy"
                        )
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {jobSheet.booking?.services &&
                    jobSheet.booking.services.length > 0
                      ? (() => {
                          const sorted = [...jobSheet.booking.services].sort(
                            (a, b) =>
                              new Date(a.startTime).getTime() -
                              new Date(b.startTime).getTime()
                          );
                          const first = sorted[0];
                          const last = sorted[sorted.length - 1];
                          const start = new Date(
                            first.startTime
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          });
                          const end = new Date(last.endTime).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          );
                          return `${start} - ${end}`;
                        })()
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {jobSheet.booking?.services &&
                    jobSheet.booking.services.length > 0
                      ? [
                          ...new Set(
                            jobSheet.booking.services.map((s) => s.bayId)
                          ),
                        ].join(", ")
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {jobSheet.booking?.services &&
                    jobSheet.booking.services.length > 0
                      ? (() => {
                          const technicians = jobSheet.booking.services
                            .map((s) => {
                              if (
                                typeof s.technicianId === "object" &&
                                s.technicianId
                              ) {
                                return `${s.technicianId.firstName} ${s.technicianId.lastName}`;
                              }
                              return s.technicianId || "Not assigned";
                            })
                            .filter(
                              (tech, index, arr) => arr.indexOf(tech) === index
                            );
                          return technicians.join(", ");
                        })()
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="space-y-1">
                      {jobSheet.booking?.services?.map((service) => (
                        <div
                          key={service._id}
                          className="text-xs px-2 py-1 rounded-full inline-block mr-1 bg-blue-100 text-blue-800 max-w-[120px] truncate"
                          title={service.name}
                        >
                          {service.name.length > 15
                            ? `${service.name.substring(0, 15)}...`
                            : service.name}
                        </div>
                      )) || "No services"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={cn(
                        "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                        jobSheet.status === "COMPLETED" &&
                          "bg-green-100 text-green-800",
                        jobSheet.status === "IN_PROGRESS" &&
                          "bg-amber-100 text-amber-800",
                        jobSheet.status === "PENDING" &&
                          "bg-blue-100 text-blue-800",
                        jobSheet.status === "CANCELLED" &&
                          "bg-red-100 text-red-800"
                      )}
                    >
                      {filterOptions.statuses.find(
                        (s) => s.value === jobSheet.status
                      )?.label || jobSheet.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {jobSheet.requiresDiagnosis ? (
                      <div className="flex flex-col gap-1">
                        {jobSheet.approvalStatus === "approved" ? (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            Approved
                          </span>
                        ) : jobSheet.approvalStatus === "rejected" ? (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                            Rejected
                          </span>
                        ) : jobSheet.diagnosedServices &&
                          jobSheet.diagnosedServices.length > 0 ? (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">
                            Pending Approval
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            Awaiting Diagnosis
                          </span>
                        )}
                        {jobSheet.diagnosedServices &&
                          jobSheet.diagnosedServices.length > 0 && (
                            <span className="text-xs text-gray-500">
                              {jobSheet.diagnosedServices.length} services
                            </span>
                          )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Standard</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Job Sheet Details Modal */}
      <Dialog
        open={!!selectedJobSheet}
        onOpenChange={() => setSelectedJobSheet(null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Job Sheet Details - {selectedJobSheet?.id}
            </DialogTitle>
          </DialogHeader>

          {selectedJobSheet && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Booking ID
                  </h3>
                  <p className="mt-1">
                    {selectedJobSheet.booking?.bookingId || "N/A"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Technician
                  </h3>
                  <p className="mt-1">
                    {selectedJobSheet.booking?.services &&
                    selectedJobSheet.booking.services.length > 0
                      ? (() => {
                          const technicians = selectedJobSheet.booking.services
                            .map((s) => {
                              if (
                                typeof s.technicianId === "object" &&
                                s.technicianId
                              ) {
                                return `${s.technicianId.firstName} ${s.technicianId.lastName}`;
                              }
                              return s.technicianId || "Not assigned";
                            })
                            .filter(
                              (tech, index, arr) => arr.indexOf(tech) === index
                            );
                          return technicians.join(", ");
                        })()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Date & Time
                  </h3>
                  <p className="mt-1">
                    {selectedJobSheet.booking?.bookingDate
                      ? format(
                          new Date(selectedJobSheet.booking.bookingDate),
                          "MMM dd, yyyy"
                        )
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Bay</h3>
                  <p className="mt-1">
                    {selectedJobSheet.booking?.services &&
                    selectedJobSheet.booking.services.length > 0
                      ? [
                          ...new Set(
                            selectedJobSheet.booking.services.map(
                              (s) => s.bayId
                            )
                          ),
                        ].join(", ")
                      : "N/A"}
                  </p>
                </div>
              </div>

              {/* Tasks */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Tasks
                </h3>
                <div className="space-y-2">
                  {selectedJobSheet.booking?.services?.map((service) => (
                    <div
                      key={service._id}
                      className="text-sm px-3 py-2 rounded-md bg-blue-50 text-blue-800"
                    >
                      <div className="flex items-center justify-between">
                        <span>{service.name}</span>
                        <span className="ml-2 text-xs font-semibold">
                          [{service.status}]
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Duration: {service.duration} min
                      </div>
                      <div className="text-xs text-gray-500">
                        Price: £{service.price}
                      </div>
                    </div>
                  )) || (
                    <p className="text-sm text-gray-400 italic">No services</p>
                  )}
                </div>
              </div>

              {/* Customer & Vehicle Info */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Customer & Vehicle
                </h3>
                <div className="bg-gray-50 px-3 py-2 rounded-md">
                  <div className="text-sm">
                    <strong>
                      {selectedJobSheet.booking?.customer?.name || "N/A"}
                    </strong>
                  </div>
                  <div className="text-xs text-gray-500">
                    {selectedJobSheet.booking?.customer?.email || "No email"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {selectedJobSheet.booking?.vehicle?.make || "Unknown"}{" "}
                    {selectedJobSheet.booking?.vehicle?.model || "Vehicle"} (
                    {selectedJobSheet.booking?.vehicle?.year || "N/A"})
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Status
                </h3>
                <span
                  className={cn(
                    "px-3 py-1 text-sm font-medium rounded-full",
                    selectedJobSheet.status === "COMPLETED" &&
                      "bg-green-100 text-green-800",
                    selectedJobSheet.status === "IN_PROGRESS" &&
                      "bg-amber-100 text-amber-800",
                    selectedJobSheet.status === "PENDING" &&
                      "bg-blue-100 text-blue-800",
                    selectedJobSheet.status === "CANCELLED" &&
                      "bg-red-100 text-red-800"
                  )}
                >
                  {filterOptions.statuses.find(
                    (s) => s.value === selectedJobSheet.status
                  )?.label || selectedJobSheet.status}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {(currentPage - 1) * paginationInfo.itemsPerPage + 1} to{" "}
          {Math.min(
            currentPage * paginationInfo.itemsPerPage,
            paginationInfo.totalItems
          )}{" "}
          of {paginationInfo.totalItems} job sheets
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
    </div>
  );
}
