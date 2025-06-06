"use client";

import { useState, useEffect } from "react";
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

interface JobSheet {
  id: string;
  bookingId: string;
  technicianId: string;
  technician?: {
    id: string;
    name: string;
  };
  booking?: {
    date: string;
    startTime: string;
    endTime: string;
    bay: number;
  };
  checklist: Array<{
    task: string;
    status: string;
  }>;
  partsUsed: Array<{
    itemId: string;
    itemName: string;
    quantity: number;
  }>;
  status: string;
}

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
  sortBy: string;
  sortOrder: "asc" | "desc";
}

interface FilterOptions {
  technicians: Array<{
    id: string;
    name: string;
  }>;
  statuses: Array<{
    value: string;
    label: string;
  }>;
}

const formatTime = (time: string) => {
  try {
    const [hours, minutes] = time.split(":");
    return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
  } catch {
    return time; // Return original if parsing fails
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

export default function JobSheetPage() {
  const [jobSheets, setJobSheets] = useState<JobSheet[]>([]);
  const [selectedJobSheet, setSelectedJobSheet] = useState<JobSheet | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    technicians: [],
    statuses: [],
  });
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  // Filter and sort state
  const [filters, setFilters] = useState<FilterState>({
    status: "all",
    bookingId: null,
    technicianId: null,
    sortBy: "id",
    sortOrder: "desc",
  });
  const [showFilters, setShowFilters] = useState(false);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= paginationInfo.totalPages) {
      setCurrentPage(newPage);
    }
  };

  const fetchJobSheets = async () => {
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

      // Add status filter if not "all"
      if (filters.status !== "all") {
        params.append("status", filters.status);
      }

      // Add booking ID filter if exists
      if (filters.bookingId) {
        params.append("bookingId", filters.bookingId);
      }

      // Add technician ID filter if exists
      if (filters.technicianId) {
        params.append("technicianId", filters.technicianId);
      }

      const response = await fetch(`/api/job-sheet?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch job sheets");
      }
      const data = await response.json();

      setJobSheets(data.jobSheets);
      setPaginationInfo(data.pagination);
      setFilterOptions(data.filters);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

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

  useEffect(() => {
    fetchJobSheets();
  }, [fetchJobSheets]);

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

  const handleJobSheetClick = (jobSheet: JobSheet) => {
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
                    {jobSheet.bookingId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {jobSheet.booking
                      ? formatDate(jobSheet.booking.date)
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {jobSheet.booking
                      ? `${formatTime(
                          jobSheet.booking.startTime
                        )} - ${formatTime(jobSheet.booking.endTime)}`
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {jobSheet.booking ? `Bay ${jobSheet.booking.bay}` : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {jobSheet.technician?.name || "Unknown Technician"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="space-y-1">
                      {jobSheet.checklist.map((task, index) => (
                        <div
                          key={index}
                          className={cn(
                            "text-xs px-2 py-1 rounded-full inline-block mr-1",
                            task.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          )}
                        >
                          {task.task}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={cn(
                        "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                        jobSheet.status === "completed" &&
                          "bg-green-100 text-green-800",
                        jobSheet.status === "in_progress" &&
                          "bg-amber-100 text-amber-800",
                        jobSheet.status === "not_started" &&
                          "bg-blue-100 text-blue-800"
                      )}
                    >
                      {filterOptions.statuses.find(
                        (s) => s.value === jobSheet.status
                      )?.label || jobSheet.status}
                    </span>
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
                  <p className="mt-1">{selectedJobSheet.bookingId}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Technician
                  </h3>
                  <p className="mt-1">
                    {selectedJobSheet.technician?.name || "Unknown Technician"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Date & Time
                  </h3>
                  <p className="mt-1">
                    {selectedJobSheet.booking ? (
                      <>
                        {formatDate(selectedJobSheet.booking.date)}
                        <br />
                        {formatTime(selectedJobSheet.booking.startTime)} -{" "}
                        {formatTime(selectedJobSheet.booking.endTime)}
                      </>
                    ) : (
                      "N/A"
                    )}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Bay</h3>
                  <p className="mt-1">
                    {selectedJobSheet.booking
                      ? `Bay ${selectedJobSheet.booking.bay}`
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
                  {selectedJobSheet.checklist.map((task, index) => (
                    <div
                      key={index}
                      className={cn(
                        "text-sm px-3 py-2 rounded-md",
                        task.status === "completed"
                          ? "bg-green-50 text-green-800"
                          : "bg-gray-50 text-gray-800"
                      )}
                    >
                      {task.task}
                    </div>
                  ))}
                </div>
              </div>

              {/* Parts Used */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Parts Used
                </h3>
                {selectedJobSheet.partsUsed.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">NO PARTS USED</p>
                ) : (
                  <div className="space-y-2">
                    {selectedJobSheet.partsUsed.map((part, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-md"
                      >
                        <span className="text-sm">{part.itemName}</span>
                        <span className="text-sm text-gray-500">
                          Qty: {part.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Status
                </h3>
                <span
                  className={cn(
                    "px-3 py-1 text-sm font-medium rounded-full",
                    selectedJobSheet.status === "completed" &&
                      "bg-green-100 text-green-800",
                    selectedJobSheet.status === "in_progress" &&
                      "bg-amber-100 text-amber-800",
                    selectedJobSheet.status === "not_started" &&
                      "bg-blue-100 text-blue-800"
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
