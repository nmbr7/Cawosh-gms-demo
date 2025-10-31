'use client';

import { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Filter,
  SortAsc,
  SortDesc,
  ChevronLeft,
  ChevronRight,
  UserPlus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import React from 'react';
import { useBookingStore } from '@/store/booking';
import { DataTable } from '@/components/ui/data-table';

interface CustomerRow {
  id: string;
  name: string;
  email: string;
  phone?: string;
  vehicles: string[];
  lastBookingDate?: string;
  lastBookingId?: string;
  lastBookingVehicle?: string;
  registrationDate?: string;
  totalBookings: number;
  _bookings?: any[]; // Make _bookings optional for type compatibility with DataTable
}

interface FilterState {
  customerName: string | null;
  email: string | null;
  phone: string | null;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export default function CustomersPage() {
  // State setup
  const [filters, setFilters] = useState<FilterState>({
    customerName: null,
    email: null,
    phone: null,
    sortBy: 'name',
    sortOrder: 'asc',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Booking Data
  const bookings = useBookingStore((state) => state.bookings);

  // Fix: Wait for bookings to actually be loaded, don't call !bookings as loading, but !Array.isArray(bookings)
  const isLoading = !Array.isArray(bookings);

  // Derive customer rows from bookings, grouping all vehicles by customer name (name considered unique).
  const allRows = useMemo<CustomerRow[]>(() => {
    if (!Array.isArray(bookings) || bookings.length === 0) return [];

    // Use name (in lower case, trimmed) as the unique key for customer
    const getCustomerKey = (booking: any) => {
      const customer = booking.customer || {};
      // Only use name as key
      return (customer.name || '').toLowerCase().trim();
    };

    // We'll keep all bookings grouped per customer
    const customerMap = new Map<string, CustomerRow & { _bookings: any[] }>();
    bookings.forEach((booking) => {
      if (!booking.customer || !booking.customer.name) return;
      const key = getCustomerKey(booking);
      if (!key) return; // no name/no identity

      // Prepare vehicle license if present
      const reg =
        booking.vehicle && booking.vehicle.license
          ? booking.vehicle.license
          : undefined;

      if (!customerMap.has(key)) {
        customerMap.set(key, {
          id: key, // use lower-case name as surrogate id
          name: booking.customer.name || '',
          email: booking.customer.email || '',
          phone: booking.customer.phone,
          vehicles: reg ? (reg ? [reg] : []) : [],
          totalBookings: 0,
          lastBookingDate: booking.bookingDate,
          lastBookingId: booking.bookingId,
          lastBookingVehicle: reg,
          registrationDate: booking.bookingDate,
          _bookings: [booking],
        });
      } else {
        // Already has customer, aggregate
        const row = customerMap.get(key)!;
        // Add new reg if not already present
        if (reg && !row.vehicles.includes(reg)) {
          row.vehicles.push(reg);
        }
        row._bookings.push(booking);
        // Pick the latest booking date/id and reg
        if (
          row.lastBookingDate == null ||
          (booking.bookingDate &&
            new Date(booking.bookingDate) > new Date(row.lastBookingDate))
        ) {
          row.lastBookingDate = booking.bookingDate;
          row.lastBookingId = booking.bookingId;
          row.lastBookingVehicle = reg;
        }
        // Registration date: take smallest (earliest) bookingDate or customer.createdAt seen so far
        const candidate = booking.bookingDate || row.registrationDate;
        if (
          candidate &&
          (!row.registrationDate ||
            new Date(candidate) < new Date(row.registrationDate))
        ) {
          row.registrationDate = candidate;
        }
      }
    });

    // Now add totalBookings and strip _bookings
    return Array.from(customerMap.values()).map((row) => {
      const { _bookings, ...rest } = row;
      return {
        ...rest,
        totalBookings: _bookings.length,
      };
    });
  }, [bookings]);

  const filteredRows = useMemo(() => {
    return allRows.filter((row) => {
      const nameOk =
        !filters.customerName ||
        row.name.toLowerCase().includes(filters.customerName.toLowerCase());
      const emailOk =
        !filters.email ||
        (row.email ?? '').toLowerCase().includes(filters.email.toLowerCase());
      const phoneOk =
        !filters.phone ||
        (row.phone ?? '').toLowerCase().includes(filters.phone.toLowerCase());
      return nameOk && emailOk && phoneOk;
    });
  }, [allRows, filters]);

  const sortedRows = useMemo(() => {
    const dir = filters.sortOrder === 'asc' ? 1 : -1;
    return [...filteredRows].sort((a, b) => {
      if (filters.sortBy === 'name') {
        return a.name.localeCompare(b.name) * dir;
      }
      if (filters.sortBy === 'email') {
        return (a.email || '').localeCompare(b.email || '') * dir;
      }
      if (filters.sortBy === 'lastBookingDate') {
        const an = a.lastBookingDate
          ? new Date(a.lastBookingDate).getTime()
          : 0;
        const bn = b.lastBookingDate
          ? new Date(b.lastBookingDate).getTime()
          : 0;
        return (bn - an) * dir;
      }
      if (filters.sortBy === 'registrationDate') {
        const an = a.registrationDate
          ? new Date(a.registrationDate).getTime()
          : 0;
        const bn = b.registrationDate
          ? new Date(b.registrationDate).getTime()
          : 0;
        return (an - bn) * dir;
      }
      if (filters.sortBy === 'totalBookings') {
        return (a.totalBookings - b.totalBookings) * dir;
      }
      return 0;
    });
  }, [filteredRows, filters.sortBy, filters.sortOrder]);

  const itemsPerPage = 10;
  const totalItems = sortedRows.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIdx = (currentPage - 1) * itemsPerPage;
  const pagedRows = sortedRows.slice(startIdx, startIdx + itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages]);

  // Table columns: Only include id or accessorKey. No "id" props where accessorKey is not present
  const columns = [
    {
      header: 'Customer',
      accessorKey: 'name' as keyof CustomerRow,
      cell: (row: CustomerRow) => (
        <div>
          <div className="font-medium">{row.name}</div>
          <div className="text-xs text-gray-400">{row.email || 'No email'}</div>
          {row.phone && (
            <div className="text-xs text-gray-400">{row.phone}</div>
          )}
        </div>
      ),
    },
    {
      header: 'Vehicles',
      accessorKey: 'vehicles' as keyof CustomerRow,
      cell: (row: CustomerRow) => {
        if (!row.vehicles.length)
          return <span className="text-gray-400">None</span>;
        const vehiclesToShow = row.vehicles.slice(0, 3);
        return (
          <div>
            {vehiclesToShow.join(', ')}
            {row.vehicles.length > 3 && (
              <span className="text-xs text-gray-400">
                {' '}
                +{row.vehicles.length - 3} more
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Last Booking',
      accessorKey: 'lastBookingDate' as keyof CustomerRow,
      cell: (row: CustomerRow) => {
        if (!row.lastBookingDate)
          return <span className="text-gray-400">None</span>;
        return (
          <div>
            <div className="font-medium">
              {format(new Date(row.lastBookingDate), 'MMM dd, yyyy')}
            </div>
            <div className="text-xs text-gray-400">
              Reg:&nbsp;
              {row.lastBookingVehicle ? (
                <span className="font-mono">{row.lastBookingVehicle}</span>
              ) : (
                <span className="text-gray-300">unknown</span>
              )}
            </div>
            <div className="text-xs text-gray-400">
              Booking ID:&nbsp;
              {row.lastBookingId ? (
                <span className="font-mono">{row.lastBookingId}</span>
              ) : (
                <span className="text-gray-300">N/A</span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      header: 'Total Bookings',
      accessorKey: 'totalBookings' as keyof CustomerRow,
      cell: (row: CustomerRow) => (
        <span className="font-medium">{row.totalBookings}</span>
      ),
    },
    {
      header: 'Registered On',
      accessorKey: 'registrationDate' as keyof CustomerRow,
      cell: (row: CustomerRow) =>
        row.registrationDate ? (
          <span>{format(new Date(row.registrationDate), 'MMM dd, yyyy')}</span>
        ) : (
          <span className="text-gray-400">Unknown</span>
        ),
    },
  ];

  // Event Handlers
  const handleFilterChange = (key: keyof FilterState, value: string | null) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };
  const handleSortChange = (field: string) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: field,
      sortOrder:
        prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  };
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 400);
  };

  // Error stub
  const error = null;

  // --- RENDER ---

  if (isLoading) {
    return (
      <div className="p-3">
        {/* Header with filters */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'flex items-center gap-2',
                showFilters && 'bg-blue-100',
              )}
            >
              <Filter className="w-4 h-4" />
              Filters
            </Button>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={cn(
                'flex items-center gap-2',
                isRefreshing && 'opacity-50 cursor-not-allowed',
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
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
          <div className="flex items-center gap-4">
            {/* Sort controls: now allowing registrationDate, totalBookings */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleSortChange('name')}
                className={cn(
                  'flex items-center gap-2',
                  filters.sortBy === 'name' && 'bg-blue-100',
                )}
              >
                Name
                {filters.sortBy === 'name' &&
                  (filters.sortOrder === 'asc' ? (
                    <SortAsc className="w-4 h-4" />
                  ) : (
                    <SortDesc className="w-4 h-4" />
                  ))}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSortChange('lastBookingDate')}
                className={cn(
                  'flex items-center gap-2',
                  filters.sortBy === 'lastBookingDate' && 'bg-blue-100',
                )}
              >
                Last Booking
                {filters.sortBy === 'lastBookingDate' &&
                  (filters.sortOrder === 'asc' ? (
                    <SortAsc className="w-4 h-4" />
                  ) : (
                    <SortDesc className="w-4 h-4" />
                  ))}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSortChange('totalBookings')}
                className={cn(
                  'flex items-center gap-2',
                  filters.sortBy === 'totalBookings' && 'bg-blue-100',
                )}
              >
                Total Bookings
                {filters.sortBy === 'totalBookings' &&
                  (filters.sortOrder === 'asc' ? (
                    <SortAsc className="w-4 h-4" />
                  ) : (
                    <SortDesc className="w-4 h-4" />
                  ))}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSortChange('registrationDate')}
                className={cn(
                  'flex items-center gap-2',
                  filters.sortBy === 'registrationDate' && 'bg-blue-100',
                )}
              >
                Registered On
                {filters.sortBy === 'registrationDate' &&
                  (filters.sortOrder === 'asc' ? (
                    <SortAsc className="w-4 h-4" />
                  ) : (
                    <SortDesc className="w-4 h-4" />
                  ))}
              </Button>
            </div>
            <Button
              className="bg-blue-500 text-white hover:bg-blue-600 flex items-center gap-2"
              onClick={() => {}}
              disabled
            >
              <UserPlus className="w-4 h-4" />
              Add Customer
            </Button>
          </div>
        </div>
        {/* Filter panel */}
        {showFilters && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name
                </label>
                <Input
                  type="text"
                  value={filters.customerName || ''}
                  onChange={(e) =>
                    handleFilterChange('customerName', e.target.value || null)
                  }
                  placeholder="Search customer..."
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  type="text"
                  value={filters.email || ''}
                  onChange={(e) =>
                    handleFilterChange('email', e.target.value || null)
                  }
                  placeholder="Search email..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <Input
                  type="text"
                  value={filters.phone || ''}
                  onChange={(e) =>
                    handleFilterChange('phone', e.target.value || null)
                  }
                  placeholder="Search phone..."
                />
              </div>
            </div>
          </div>
        )}
        {/* Shimmer Table - adapted for new columns */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicles
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Booking
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Bookings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registered On
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {[1, 2, 3].map((row) => (
                <React.Fragment key={row}>
                  <tr className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-28"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                        <div className="h-3 bg-gray-200 rounded w-14"></div>
                        <div className="h-3 bg-gray-100 rounded w-12"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-10"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </td>
                  </tr>
                  {row < 3 && (
                    <tr>
                      <td colSpan={5} className="p-0">
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
    <div className="p-3">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-2',
              showFilters && 'bg-blue-100',
            )}
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={cn(
              'flex items-center gap-2',
              isRefreshing && 'opacity-50 cursor-not-allowed',
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
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
        <div className="flex items-center gap-4">
          {/* Sort controls: now allowing registrationDate, totalBookings */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleSortChange('name')}
              className={cn(
                'flex items-center gap-2',
                filters.sortBy === 'name' && 'bg-blue-100',
              )}
            >
              Name
              {filters.sortBy === 'name' &&
                (filters.sortOrder === 'asc' ? (
                  <SortAsc className="w-4 h-4" />
                ) : (
                  <SortDesc className="w-4 h-4" />
                ))}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSortChange('lastBookingDate')}
              className={cn(
                'flex items-center gap-2',
                filters.sortBy === 'lastBookingDate' && 'bg-blue-100',
              )}
            >
              Last Booking
              {filters.sortBy === 'lastBookingDate' &&
                (filters.sortOrder === 'asc' ? (
                  <SortAsc className="w-4 h-4" />
                ) : (
                  <SortDesc className="w-4 h-4" />
                ))}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSortChange('totalBookings')}
              className={cn(
                'flex items-center gap-2',
                filters.sortBy === 'totalBookings' && 'bg-blue-100',
              )}
            >
              Total Bookings
              {filters.sortBy === 'totalBookings' &&
                (filters.sortOrder === 'asc' ? (
                  <SortAsc className="w-4 h-4" />
                ) : (
                  <SortDesc className="w-4 h-4" />
                ))}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSortChange('registrationDate')}
              className={cn(
                'flex items-center gap-2',
                filters.sortBy === 'registrationDate' && 'bg-blue-100',
              )}
            >
              Registered On
              {filters.sortBy === 'registrationDate' &&
                (filters.sortOrder === 'asc' ? (
                  <SortAsc className="w-4 h-4" />
                ) : (
                  <SortDesc className="w-4 h-4" />
                ))}
            </Button>
          </div>
          <Button
            className="bg-blue-500 text-white hover:bg-blue-600 flex items-center gap-2"
            onClick={() => {}}
            disabled
          >
            <UserPlus className="w-4 h-4" />
            Add Customer
          </Button>
        </div>
      </div>
      {/* Filter panel */}
      {showFilters && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name
              </label>
              <Input
                type="text"
                value={filters.customerName || ''}
                onChange={(e) =>
                  handleFilterChange('customerName', e.target.value || null)
                }
                placeholder="Search customer..."
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                type="text"
                value={filters.email || ''}
                onChange={(e) =>
                  handleFilterChange('email', e.target.value || null)
                }
                placeholder="Search email..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <Input
                type="text"
                value={filters.phone || ''}
                onChange={(e) =>
                  handleFilterChange('phone', e.target.value || null)
                }
                placeholder="Search phone..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Customers DataTable */}
      <DataTable
        columns={columns}
        data={pagedRows}
        isLoading={isLoading}
        onRowClick={undefined}
        emptyMessage={
          // If loading, don't show empty message
          isLoading
            ? ''
            : filters.customerName || filters.email || filters.phone
              ? 'No customers match your filters'
              : 'No customers found'
        }
        emptySubMessage={
          isLoading
            ? ''
            : filters.customerName || filters.email || filters.phone
              ? 'Try adjusting your filters or search criteria'
              : 'Get started by creating a new customer via booking'
        }
        emptyAction={
          isLoading
            ? undefined
            : filters.customerName || filters.email || filters.phone
              ? {
                  label: 'Clear filters',
                  onClick: () => {
                    setFilters({
                      customerName: null,
                      email: null,
                      phone: null,
                      sortBy: 'name',
                      sortOrder: 'asc',
                    });
                  },
                }
              : undefined
        }
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {totalItems === 0 ? 0 : startIdx + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{' '}
            customers
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    onClick={() => handlePageChange(page)}
                    className={cn(
                      'w-8 h-8 p-0',
                      currentPage === page &&
                        'bg-blue-500 text-white hover:bg-blue-600',
                    )}
                  >
                    {page}
                  </Button>
                ),
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
