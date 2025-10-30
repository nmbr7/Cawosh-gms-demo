'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { FileDoc, CaretLeft, CaretRight } from 'phosphor-react';
import { formatDate } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import React from 'react';
import { useBillingStore } from '@/store/billing';
import type { Invoice } from '@/types/invoice';

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export default function BillingsPage() {
  const { invoices } = useBillingStore();
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [serviceTypes, setServiceTypes] = useState<string[]>([]);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  const fetchBillings = useCallback(async () => {
    try {
      setIsLoading(true);

      // Get all invoices from store
      const allInvoices = invoices;

      // Apply filters
      const filtered = allInvoices.filter((invoice) => {
        const matchesSearch =
          invoice.customer.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          invoice.invoiceNumber
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

        const matchesService =
          serviceFilter === 'all' ||
          invoice.services.some((service) => service.name === serviceFilter);

        const matchesDate =
          dateFilter === '' || invoice.issuedDate.includes(dateFilter);

        return matchesSearch && matchesService && matchesDate;
      });

      // Apply pagination
      const startIndex =
        (paginationInfo.currentPage - 1) * paginationInfo.itemsPerPage;
      const paginatedInvoices = filtered.slice(
        startIndex,
        startIndex + paginationInfo.itemsPerPage,
      );

      // Store filtered invoices for display
      setFilteredInvoices(paginatedInvoices);

      // Update pagination info
      setPaginationInfo((prev) => ({
        ...prev,
        totalItems: filtered.length,
        totalPages: Math.max(
          1,
          Math.ceil(filtered.length / paginationInfo.itemsPerPage),
        ),
      }));

      // Get service types for filter
      const uniqueServiceTypes = Array.from(
        new Set(
          allInvoices.flatMap((invoice) =>
            invoice.services.map((service) => service.name),
          ),
        ),
      );
      setServiceTypes(uniqueServiceTypes);
    } catch (error) {
      console.error('Error fetching billings:', error);
    } finally {
      setIsLoading(false);
    }
  }, [
    paginationInfo.currentPage,
    paginationInfo.itemsPerPage,
    searchTerm,
    serviceFilter,
    dateFilter,
    invoices,
  ]);

  useEffect(() => {
    fetchBillings();
  }, [fetchBillings]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= paginationInfo.totalPages) {
      setPaginationInfo((prev) => ({ ...prev, currentPage: newPage }));
    }
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    // TODO: Implement actual PDF generation
    console.log(`Downloading invoice ${invoice.invoiceNumber}`);
    alert('PDF download functionality will be implemented soon!');
  };

  if (isLoading) {
    return (
      <div className="p-3">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Billings & Invoices
          </h1>
        </div>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Input
              placeholder="Search by customer or invoice..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm bg-white"
            />
          </div>
          <div>
            <Select value={serviceFilter} onValueChange={setServiceFilter}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Filter by service" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Services</SelectItem>
                {serviceTypes.map((service) => (
                  <SelectItem key={service} value={service}>
                    {service}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="max-w-sm bg-white"
            />
          </div>
        </div>

        {/* Loading table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
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
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-8 bg-gray-200 rounded w-24"></div>
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

  return (
    <div className="p-3">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Billings & Invoices
        </h1>
        <div className="text-sm text-gray-600">
          Total: {invoices.length} invoices
        </div>
      </div>

      {/* Invoice Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">
            {invoices.length}
          </div>
          <div className="text-sm text-gray-600">Total Invoices</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">
            £
            {invoices.reduce((sum, inv) => sum + inv.totalAmount, 0).toFixed(2)}
          </div>
          <div className="text-sm text-gray-600">Total Value</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-amber-600">
            {invoices.filter((inv) => inv.status === 'DRAFT').length}
          </div>
          <div className="text-sm text-gray-600">Draft</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">
            {invoices.filter((inv) => inv.status === 'PAID').length}
          </div>
          <div className="text-sm text-gray-600">Paid</div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Input
            placeholder="Search by customer or invoice..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm bg-white"
          />
        </div>
        <div>
          <Select value={serviceFilter} onValueChange={setServiceFilter}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Filter by service" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All Services</SelectItem>
              {serviceTypes.map((service) => (
                <SelectItem key={service} value={service}>
                  {service}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="max-w-sm bg-white"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
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
                          {searchTerm || serviceFilter !== 'all' || dateFilter
                            ? 'No billings match your filters'
                            : 'No billings found'}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {searchTerm || serviceFilter !== 'all' || dateFilter
                            ? 'Try adjusting your filters or search criteria'
                            : 'Get started by creating a new billing'}
                        </p>
                      </div>
                      {searchTerm || serviceFilter !== 'all' || dateFilter ? (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSearchTerm('');
                            setServiceFilter('all');
                            setDateFilter('');
                          }}
                          className="mt-2"
                        >
                          Clear filters
                        </Button>
                      ) : (
                        <Button
                          onClick={() => {
                            /* TODO: Add create billing handler */
                          }}
                          className="mt-2"
                        >
                          Create Billing
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.customer.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex flex-col">
                        <span>
                          {invoice.services[0]?.name || 'Multiple Services'}
                        </span>
                        <span className="text-xs text-gray-500">
                          Duration:{' '}
                          {invoice.services.reduce(
                            (sum, s) => sum + s.duration,
                            0,
                          )}{' '}
                          min
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex flex-col">
                        <span>
                          {invoice.vehicle.make} {invoice.vehicle.model}
                        </span>
                        <span className="text-xs text-gray-500">
                          Reg: {invoice.vehicle.license}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(invoice.issuedDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      £{invoice.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          invoice.status === 'DRAFT'
                            ? 'bg-gray-100 text-gray-800'
                            : invoice.status === 'SENT'
                              ? 'bg-blue-100 text-blue-800'
                              : invoice.status === 'PAID'
                                ? 'bg-green-100 text-green-800'
                                : invoice.status === 'OVERDUE'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={() => handleDownloadInvoice(invoice)}
                      >
                        <FileDoc size={16} />
                        Download
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing{' '}
          <span className="font-medium">
            {(paginationInfo.currentPage - 1) * paginationInfo.itemsPerPage + 1}
          </span>{' '}
          -{' '}
          <span className="font-medium">
            {Math.min(
              paginationInfo.currentPage * paginationInfo.itemsPerPage,
              paginationInfo.totalItems,
            )}
          </span>{' '}
          of <span className="font-medium">{paginationInfo.totalItems}</span>{' '}
          results
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(paginationInfo.currentPage - 1)}
            disabled={paginationInfo.currentPage === 1}
          >
            <CaretLeft className="h-4 w-4" />
          </Button>

          {/* Page numbers */}
          <div className="flex gap-1">
            {Array.from(
              { length: paginationInfo.totalPages },
              (_, i) => i + 1,
            ).map((page) => (
              <Button
                key={page}
                variant={
                  page === paginationInfo.currentPage ? 'default' : 'outline'
                }
                size="sm"
                onClick={() => handlePageChange(page)}
                className={cn(
                  'w-8 h-8 p-0',
                  page === paginationInfo.currentPage &&
                    'bg-blue-500 text-white hover:bg-blue-600',
                )}
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(paginationInfo.currentPage + 1)}
            disabled={paginationInfo.currentPage === paginationInfo.totalPages}
          >
            <CaretRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
