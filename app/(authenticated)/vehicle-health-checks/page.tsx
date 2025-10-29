'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/modal';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { notify } from '@/lib/notify';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

type VHCListItem = {
  id: string;
  vehicleId: string;
  status: string;
  powertrain: string;
  scores?: { total: number };
  updatedAt: string;
  createdAt: string;
  createdBy: string;
  assignedTo?: string;
};

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

// Filter and sort state interface
interface FilterState {
  status: string;
  vehicleId: string | null;
  powertrain: string;
  createdBy: string | null;
  assignedTo: string | null;
  startDate: string | null;
  endDate: string | null;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export default function VehicleHealthChecksPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reg, setReg] = useState('');
  const [clientName, setClientName] = useState('');
  const [powertrain, setPowertrain] = useState('ice');
  const [data, setData] = useState<VHCListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  // Filter and sort state
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    vehicleId: null,
    powertrain: 'all',
    createdBy: null,
    assignedTo: null,
    startDate: null,
    endDate: null,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [showFilters, setShowFilters] = useState(false);

  const columns = useMemo(
    () => [
      {
        header: 'VHC ID',
        accessorKey: 'id' as const,
        width: 'w-48',
      },
      {
        header: 'Vehicle',
        accessorKey: 'vehicleId' as const,
      },
      {
        header: 'Status',
        accessorKey: 'status' as const,
        cell: (row: VHCListItem) => (
          <span
            className={cn(
              'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
              row.status === 'completed'
                ? 'bg-green-100 text-green-800'
                : row.status === 'in_progress'
                  ? 'bg-yellow-100 text-yellow-800'
                  : row.status === 'draft'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-red-100 text-red-800',
            )}
          >
            {row.status}
          </span>
        ),
      },
      {
        header: 'Powertrain',
        accessorKey: 'powertrain' as const,
      },
      {
        header: 'Score',
        accessorKey: 'scores' as const,
        cell: (row: VHCListItem) =>
          row.scores?.total !== undefined
            ? `${Math.round(row.scores.total * 100)}%`
            : '—',
      },
      {
        header: 'Created By',
        accessorKey: 'createdBy' as const,
      },
      {
        header: 'Created',
        accessorKey: 'createdAt' as const,
        cell: (row: VHCListItem) =>
          new Date(row.createdAt).toLocaleDateString(),
        width: 'w-32',
      },
      {
        header: 'Updated',
        accessorKey: 'updatedAt' as const,
        cell: (row: VHCListItem) =>
          new Date(row.updatedAt).toLocaleDateString(),
        width: 'w-32',
      },
    ],
    [],
  );

  const fetchList = useCallback(async () => {
    setIsLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });

      // Add filters if they exist
      if (filters.status !== 'all') {
        params.append('status', filters.status);
      }
      if (filters.vehicleId) {
        params.append('vehicleId', filters.vehicleId);
      }
      if (filters.powertrain !== 'all') {
        params.append('powertrain', filters.powertrain);
      }
      if (filters.createdBy) {
        params.append('createdBy', filters.createdBy);
      }
      if (filters.assignedTo) {
        params.append('assignedTo', filters.assignedTo);
      }
      if (filters.startDate) {
        params.append('startDate', filters.startDate);
      }
      if (filters.endDate) {
        params.append('endDate', filters.endDate);
      }

      const res = await fetchWithAuth(
        `/api/vhc/responses?${params.toString()}`,
        { method: 'GET' },
      );
      const json = await res.json();
      setData(json.data || []);
      setPaginationInfo(
        json.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 10,
        },
      );
    } catch {
      notify('Failed to load vehicle health checks', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const onCreate = async () => {
    setIsModalOpen(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      vehicleId: null,
      powertrain: 'all',
      createdBy: null,
      assignedTo: null,
      startDate: null,
      endDate: null,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    setCurrentPage(1);
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Vehicle Health Checks</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <button
            onClick={onCreate}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            New Test
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="void">Void</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle ID
              </label>
              <Input
                placeholder="Search vehicle..."
                value={filters.vehicleId || ''}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    vehicleId: e.target.value || null,
                  }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Powertrain
              </label>
              <Select
                value={filters.powertrain}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, powertrain: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Powertrains</SelectItem>
                  <SelectItem value="ice">ICE</SelectItem>
                  <SelectItem value="ev">EV</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Created By
              </label>
              <Input
                placeholder="Search creator..."
                value={filters.createdBy || ''}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    createdBy: e.target.value || null,
                  }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <Input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    startDate: e.target.value || null,
                  }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <Input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    endDate: e.target.value || null,
                  }))
                }
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
            <div className="text-sm text-gray-500">
              {paginationInfo.totalItems} total items
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        <DataTable<VHCListItem>
          columns={columns}
          data={data}
          isLoading={isLoading}
          emptyMessage="No health checks found"
          emptySubMessage="Start by creating a new vehicle health check"
          emptyAction={{ label: 'New Test', onClick: onCreate }}
        />
      </div>

      {/* Pagination */}
      {paginationInfo.totalPages > 1 && (
        <div className="flex items-center justify-between  ">
          <div className="flex items-center text-sm text-gray-700">
            <span>
              Showing{' '}
              {(paginationInfo.currentPage - 1) * paginationInfo.itemsPerPage +
                1}{' '}
              to{' '}
              {Math.min(
                paginationInfo.currentPage * paginationInfo.itemsPerPage,
                paginationInfo.totalItems,
              )}{' '}
              of {paginationInfo.totalItems} health checks
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(paginationInfo.currentPage - 1)}
              disabled={paginationInfo.currentPage <= 1}
              className="w-8 h-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button variant="default" size="sm" className="w-8 h-8 p-0">
              {paginationInfo.currentPage}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(paginationInfo.currentPage + 1)}
              disabled={paginationInfo.currentPage >= paginationInfo.totalPages}
              className="w-8 h-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-6 md:p-8 space-y-6">
          <h2 className="text-lg font-semibold">Start Vehicle Health Check</h2>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Registration Number
            </label>
            <input
              value={reg}
              onChange={(e) => setReg(e.target.value)}
              placeholder="e.g. RE24 FGH"
              className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Client (optional)
            </label>
            <input
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Customer name"
              className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Fuel / Powertrain
            </label>
            <select
              value={powertrain}
              onChange={(e) => setPowertrain(e.target.value)}
              className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="ice">ICE (Petrol/Diesel)</option>
              <option value="ev">EV</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm rounded-md border bg-white hover:bg-gray-50"
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                if (!reg.trim()) {
                  return alert('Registration is required');
                }
                try {
                  const tRes = await fetchWithAuth(
                    '/api/vhc/templates/active',
                    { method: 'GET' },
                  );
                  const template = await tRes.json();
                  const cRes = await fetchWithAuth('/api/vhc/responses', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      templateId: template.id,
                      powertrain,
                      vehicleId: reg.trim(),
                      createdBy: clientName || 'technician',
                    }),
                  });
                  if (!cRes.ok) {
                    const err = await cRes.json();
                    throw new Error(
                      err?.error || 'Failed to create health check',
                    );
                  }
                  const created = await cRes.json();
                  setIsModalOpen(false);
                  setReg('');
                  setClientName('');
                  setPowertrain('ice');
                  router.push(`/vhc-fullscreen/${created.id}`);
                } catch (e) {
                  alert(e instanceof Error ? e.message : 'Failed to create');
                }
              }}
              className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              type="button"
            >
              Start Check
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
