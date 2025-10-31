import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Invoice,
  InvoiceStatus,
  InvoiceFilters,
  InvoiceSummary,
} from '@/types/invoice';

interface BillingState {
  // Invoice data
  invoices: Invoice[];
  filters: InvoiceFilters;
  summary: InvoiceSummary;

  // Actions
  createInvoice: (
    invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'issuedDate' | 'dueDate'>,
  ) => Invoice;
  updateInvoiceStatus: (invoiceId: string, status: InvoiceStatus) => void;
  updateInvoice: (invoiceId: string, updates: Partial<Invoice>) => void;
  deleteInvoice: (invoiceId: string) => void;
  getInvoiceById: (invoiceId: string) => Invoice | undefined;
  getInvoicesByJobSheet: (jobSheetId: string) => Invoice[];
  getInvoicesByBooking: (bookingId: string) => Invoice[];

  // Filtering and search
  setFilters: (filters: InvoiceFilters) => void;
  getFilteredInvoices: () => Invoice[];
  searchInvoices: (query: string) => Invoice[];

  // Summary and analytics
  getInvoiceSummary: () => InvoiceSummary;
  getRevenueByPeriod: (startDate: string, endDate: string) => number;
  getInvoicesByStatus: (status: InvoiceStatus) => Invoice[];

  // Utility functions
  generateInvoiceNumber: () => string;
  calculateDueDate: (issuedDate: string, days?: number) => string;
  isInvoiceOverdue: (invoice: Invoice) => boolean;
}

export const useBillingStore = create<BillingState>()(
  persist(
    (set, get) => ({
      // Initial state
      invoices: [],
      filters: {
        status: 'ALL' as const,
        customerName: '',
        dateFrom: '',
        dateTo: '',
      },
      summary: {
        totalInvoices: 0,
        totalAmount: 0,
        paidAmount: 0,
        pendingAmount: 0,
        overdueAmount: 0,
      },

      // Invoice CRUD operations
      createInvoice: (invoiceData) => {
        const { generateInvoiceNumber, calculateDueDate } = get();
        const issuedDate = new Date().toISOString().split('T')[0];

        const newInvoice: Invoice = {
          ...invoiceData,
          id: crypto.randomUUID(),
          invoiceNumber: generateInvoiceNumber(),
          issuedDate,
          dueDate: calculateDueDate(issuedDate),
        };

        set((state) => ({
          invoices: [...state.invoices, newInvoice],
          summary: get().getInvoiceSummary(),
        }));

        // Call backend API to send SMS notification when a job is completed, sending only the jobSheetId as invoice number.
        // Fix: pass the correct jobSheetId from invoiceData or newInvoice
        // try {
        //   fetch('/api/send-sms', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({
        //       invoiceNumber: newInvoice.invoiceNumber,
        //     }),
        //   })
        //     .then(response => {
        //       if (!response.ok) {
        //         console.error('Failed to send SMS notification');
        //       }
        //     })
        //     .catch((error) => {
        //       console.error('Error calling SMS API', error);
        //     });
        // } catch (error) {
        //   console.error('SMS API call failed', error);
        // }

        return newInvoice;
      },

      updateInvoiceStatus: (invoiceId, status) => {
        set((state) => ({
          invoices: state.invoices.map((invoice) =>
            invoice.id === invoiceId
              ? {
                ...invoice,
                status,
                paidDate:
                  status === 'PAID'
                    ? new Date().toISOString().split('T')[0]
                    : undefined,
              }
              : invoice,
          ),
          summary: get().getInvoiceSummary(),
        }));
      },

      updateInvoice: (invoiceId, updates) => {
        set((state) => ({
          invoices: state.invoices.map((invoice) =>
            invoice.id === invoiceId ? { ...invoice, ...updates } : invoice,
          ),
          summary: get().getInvoiceSummary(),
        }));
      },

      deleteInvoice: (invoiceId) => {
        set((state) => ({
          invoices: state.invoices.filter(
            (invoice) => invoice.id !== invoiceId,
          ),
          summary: get().getInvoiceSummary(),
        }));
      },

      getInvoiceById: (invoiceId) => {
        return get().invoices.find((invoice) => invoice.id === invoiceId);
      },

      getInvoicesByJobSheet: (jobSheetId) => {
        return get().invoices.filter(
          (invoice) => invoice.jobSheetId === jobSheetId,
        );
      },

      getInvoicesByBooking: (bookingId) => {
        return get().invoices.filter(
          (invoice) => invoice.bookingId === bookingId,
        );
      },

      // Filtering and search
      setFilters: (filters) => {
        set((state) => ({
          filters: { ...state.filters, ...filters },
        }));
      },

      getFilteredInvoices: () => {
        const { invoices, filters } = get();

        return invoices.filter((invoice) => {
          if (
            filters.status &&
            filters.status !== 'ALL' &&
            invoice.status !== filters.status
          ) {
            return false;
          }
          if (
            filters.customerName &&
            !invoice.customer.name
              .toLowerCase()
              .includes(filters.customerName.toLowerCase())
          ) {
            return false;
          }
          if (
            filters.dateFrom &&
            new Date(invoice.issuedDate) < new Date(filters.dateFrom)
          ) {
            return false;
          }
          if (
            filters.dateTo &&
            new Date(invoice.issuedDate) > new Date(filters.dateTo)
          ) {
            return false;
          }
          return true;
        });
      },

      searchInvoices: (query) => {
        const { invoices } = get();
        const lowercaseQuery = query.toLowerCase();

        return invoices.filter(
          (invoice) =>
            invoice.invoiceNumber.toLowerCase().includes(lowercaseQuery) ||
            invoice.customer.name.toLowerCase().includes(lowercaseQuery) ||
            invoice.vehicle.make.toLowerCase().includes(lowercaseQuery) ||
            invoice.vehicle.model.toLowerCase().includes(lowercaseQuery) ||
            invoice.vehicle.license.toLowerCase().includes(lowercaseQuery),
        );
      },

      // Summary and analytics
      getInvoiceSummary: () => {
        const { invoices } = get();

        const summary: InvoiceSummary = {
          totalInvoices: invoices.length,
          totalAmount: invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
          paidAmount: invoices
            .filter((inv) => inv.status === 'PAID')
            .reduce((sum, inv) => sum + inv.totalAmount, 0),
          pendingAmount: invoices
            .filter((inv) => inv.status === 'DRAFT' || inv.status === 'SENT')
            .reduce((sum, inv) => sum + inv.totalAmount, 0),
          overdueAmount: invoices
            .filter((inv) => get().isInvoiceOverdue(inv))
            .reduce((sum, inv) => sum + inv.totalAmount, 0),
        };

        return summary;
      },

      getRevenueByPeriod: (startDate, endDate) => {
        const { invoices } = get();
        const start = new Date(startDate);
        const end = new Date(endDate);

        return invoices
          .filter((invoice) => {
            const invoiceDate = new Date(invoice.issuedDate);
            return (
              invoiceDate >= start &&
              invoiceDate <= end &&
              invoice.status === 'PAID'
            );
          })
          .reduce((sum, invoice) => sum + invoice.totalAmount, 0);
      },

      getInvoicesByStatus: (status) => {
        return get().invoices.filter((invoice) => invoice.status === status);
      },

      // Utility functions
      generateInvoiceNumber: () => {
        const prefix = 'INV';
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        return `${prefix}-${year}${month}${day}-${randomNum}`;
      },

      calculateDueDate: (issuedDate, days = 30) => {
        const date = new Date(issuedDate);
        date.setDate(date.getDate() + days);
        return date.toISOString().split('T')[0];
      },

      isInvoiceOverdue: (invoice) => {
        if (invoice.status === 'PAID' || invoice.status === 'CANCELLED') {
          return false;
        }
        const today = new Date();
        const dueDate = new Date(invoice.dueDate);
        return today > dueDate;
      },
    }),
    {
      name: 'billing-storage',
      partialize: (state) => ({
        invoices: state.invoices,
        filters: state.filters,
      }),
    },
  ),
);
