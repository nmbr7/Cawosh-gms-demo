'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Filter, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';
import { useJobSheetStore, JobSheet as StoreJobSheet } from '@/store/jobSheet';
import { useBookingStore } from '@/store/booking';
import { format } from 'date-fns';
import { ApprovalDetailsModal } from '@/app/components/approvals/ApprovalDetailsModal';

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

// Filter and sort state interface
interface FilterState {
  status: string | 'all';
  technicianId: string | null;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export default function ApprovalsPage() {
  const [selectedJobSheet, setSelectedJobSheet] =
    useState<StoreJobSheet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [, setError] = useState<string | null>(null);
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
    status: 'all',
    technicianId: null,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [showFilters, setShowFilters] = useState(false);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= paginationInfo.totalPages) {
      setCurrentPage(newPage);
    }
  };

  const fetchApprovals = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // Filter for pending approvals that require diagnosis
    const pendingApprovals = jobSheetsWithBookings.filter(
      (js) =>
        js.requiresDiagnosis &&
        js.approvalStatus === 'pending' &&
        js.diagnosedServices &&
        js.diagnosedServices.length > 0,
    );

    // Apply filters
    const filtered = pendingApprovals.filter((js) => {
      const statusOk =
        filters.status === 'all' || js.approvalStatus === filters.status;

      const technicianOk =
        !filters.technicianId ||
        (js.diagnosedServices?.some(
          (s) => s.addedBy === filters.technicianId,
        ) ??
          false);

      return statusOk && technicianOk;
    });

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      const dir = filters.sortOrder === 'asc' ? 1 : -1;
      if (filters.sortBy === 'id') {
        return a.id.localeCompare(b.id) * dir;
      }
      if (filters.sortBy === 'approvalStatus') {
        return (
          (a.approvalStatus || '').localeCompare(b.approvalStatus || '') * dir
        );
      }
      if (filters.sortBy === 'createdAt') {
        return (
          new Date(a.createdAt).getTime() -
          new Date(b.createdAt).getTime() * dir
        );
      }
      // Default: sort by creation date (latest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Apply pagination
    const itemsPerPage = 10;
    const totalItems = sorted.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    // const start = (currentPage - 1) * itemsPerPage;
    // const pageData = sorted.slice(start, start + itemsPerPage);

    setPaginationInfo({
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage,
    });
    setIsLoading(false);
  }, [currentPage, filters, jobSheetsWithBookings]);

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      setCurrentPage(1); // Reset to first page
      await fetchApprovals();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleFilterChange = (key: keyof FilterState, value: string | null) => {
    console.log('handleFilterChange', key, value);
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  // const handleSort = (sortBy: string) => {
  //   setFilters((prev) => ({
  //     ...prev,
  //     sortBy,
  //     sortOrder:
  //       prev.sortBy === sortBy && prev.sortOrder === "asc" ? "desc" : "asc",
  //   }));
  // };

  const getStatusBadge = (status: string | undefined) => {
    const statusMap = {
      pending: {
        label: 'Pending Approval',
        className: 'bg-amber-100 text-amber-800',
      },
      approved: { label: 'Approved', className: 'bg-green-100 text-green-800' },
      rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800' },
    };

    const statusInfo =
      statusMap[status as keyof typeof statusMap] || statusMap.pending;

    return (
      <span
        className={cn(
          'px-2 py-1 text-xs font-medium rounded-full',
          statusInfo.className,
        )}
      >
        {statusInfo.label}
      </span>
    );
  };

  const getTotalPrice = (diagnosedServices: Array<{ price: number }>) => {
    const servicesSubtotal =
      diagnosedServices?.reduce((acc, service) => acc + service.price, 0) || 0;
    const serviceCharge = 15.0; // Fixed service charge
    const subtotal = servicesSubtotal + serviceCharge;
    const vat = subtotal * 0.2; // 20% VAT
    return subtotal + vat;
  };

  const getTechnicianName = (technicianId: string, jobSheet: StoreJobSheet) => {
    // First try to get from assigned technicians in the booking
    if (
      jobSheet.booking?.assignedTechnicians &&
      jobSheet.booking.assignedTechnicians.length > 0
    ) {
      const assignedTech = jobSheet.booking.assignedTechnicians.find(
        (tech) => tech.technicianId === technicianId,
      );
      if (assignedTech) {
        return assignedTech.technicianName;
      }
    }

    // Fallback to filter options
    const technician = filterOptions.technicians.find(
      (t) => t.id === technicianId,
    );
    return technician ? technician.name : 'Unknown Technician';
  };

  // Get pending approvals for display
  const pendingApprovals = jobSheetsWithBookings.filter(
    (js) =>
      js.requiresDiagnosis &&
      js.approvalStatus === 'pending' &&
      js.diagnosedServices &&
      js.diagnosedServices.length > 0,
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Approvals</h1>
          <p className="text-gray-600">
            Review and approve work orders that require diagnosis
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-900">Filters</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? 'Hide' : 'Show'} Filters
          </Button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Technician
              </label>
              <Select
                value={filters.technicianId || ''}
                onValueChange={(value) =>
                  handleFilterChange('technicianId', value || null)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Technicians" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Technicians</SelectItem>
                  {filterOptions.technicians.map((tech) => (
                    <SelectItem key={tech.id} value={tech.id}>
                      {tech.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <Select
                value={filters.sortBy}
                onValueChange={(value) => handleFilterChange('sortBy', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Date Created</SelectItem>
                  <SelectItem value="id">Job Sheet ID</SelectItem>
                  <SelectItem value="approvalStatus">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold text-amber-600">
            {pendingApprovals.length}
          </div>
          <div className="text-sm text-gray-600">Pending Approvals</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold text-green-600">
            {
              jobSheetsWithBookings.filter(
                (js) => js.approvalStatus === 'approved',
              ).length
            }
          </div>
          <div className="text-sm text-gray-600">Approved Today</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold text-blue-600">
            {jobSheetsWithBookings.filter((js) => js.requiresDiagnosis).length}
          </div>
          <div className="text-sm text-gray-600">Total Diagnosis Jobs</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Sheet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Services
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Technician
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Loading approvals...
                  </td>
                </tr>
              ) : pendingApprovals.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No pending approvals found
                  </td>
                </tr>
              ) : (
                pendingApprovals.map((jobSheet) => (
                  <tr key={jobSheet.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {jobSheet.id}
                      </div>
                      <div className="text-sm text-gray-500">
                        {format(new Date(jobSheet.createdAt), 'MMM dd, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {jobSheet.booking?.customer.name || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {jobSheet.booking?.customer.phone || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {jobSheet.booking?.vehicle.make}{' '}
                        {jobSheet.booking?.vehicle.model}
                      </div>
                      <div className="text-sm text-gray-500">
                        {jobSheet.booking?.vehicle.year} •{' '}
                        {jobSheet.booking?.vehicle.license}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {jobSheet.diagnosedServices?.length || 0} services
                      </div>
                      <div className="text-sm text-gray-500">
                        £
                        {getTotalPrice(
                          jobSheet.diagnosedServices || [],
                        ).toFixed(2)}{' '}
                        (inc. VAT)
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getTechnicianName(
                          jobSheet.diagnosedServices?.[0]?.addedBy || '',
                          jobSheet,
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {jobSheet.diagnosedServices?.[0]?.addedAt &&
                          format(
                            new Date(jobSheet.diagnosedServices[0].addedAt),
                            'MMM dd, HH:mm',
                          )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(jobSheet.approvalStatus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedJobSheet(jobSheet)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {paginationInfo.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {(currentPage - 1) * paginationInfo.itemsPerPage + 1} to{' '}
            {Math.min(
              currentPage * paginationInfo.itemsPerPage,
              paginationInfo.totalItems,
            )}{' '}
            of {paginationInfo.totalItems} results
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {paginationInfo.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === paginationInfo.totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Approval Details Modal */}
      {selectedJobSheet && (
        <ApprovalDetailsModal
          jobSheet={selectedJobSheet}
          isOpen={!!selectedJobSheet}
          onClose={() => setSelectedJobSheet(null)}
          onApprovalChange={() => {
            setSelectedJobSheet(null);
            fetchApprovals();
          }}
        />
      )}
    </div>
  );
}
