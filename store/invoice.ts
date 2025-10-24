import { create } from "zustand";
import type {
  Invoice,
  InvoiceStatus,
  InvoiceFilters,
  InvoiceSummary,
} from "@/types/invoice";
import type { JobSheet } from "./jobSheet";

interface InvoiceState {
  invoices: Invoice[];
  filters: InvoiceFilters;
  summary: InvoiceSummary;

  // Actions
  createInvoiceFromJobSheet: (jobSheet: JobSheet) => Invoice;
  updateInvoiceStatus: (invoiceId: string, status: InvoiceStatus) => void;
  generateInvoiceNumber: () => string;
  setFilters: (filters: Partial<InvoiceFilters>) => void;
  getFilteredInvoices: () => Invoice[];
  getInvoiceSummary: () => InvoiceSummary;
  markAsPaid: (invoiceId: string, paymentMethod: string) => void;
}

export const useInvoiceStore = create<InvoiceState>((set, get) => ({
  invoices: [],
  filters: {
    page: 1,
    limit: 10,
  },
  summary: {
    totalInvoices: 0,
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
    overdueAmount: 0,
  },

  generateInvoiceNumber: () => {
    const { invoices } = get();
    const nextNumber = invoices.length + 1;
    return `INV-${nextNumber.toString().padStart(4, "0")}`;
  },

  createInvoiceFromJobSheet: (jobSheet) => {
    const { generateInvoiceNumber } = get();

    // Get booking data from job sheet
    const booking = jobSheet.booking;
    if (!booking) {
      throw new Error("Booking data not found for job sheet");
    }

    // Get services from diagnosed services or original booking services
    const services =
      jobSheet.diagnosedServices ||
      booking.services.map((s) => ({
        id: s.serviceId._id,
        name: s.name,
        description: s.description || s.name,
        duration: s.duration,
        price: s.price,
      }));

    // Calculate totals
    const subtotal = services.reduce((sum, service) => sum + service.price, 0);
    const serviceCharge = 15.0; // Fixed service charge
    const vatRate = 0.2; // 20% VAT
    const vat = (subtotal + serviceCharge) * vatRate;
    const totalAmount = subtotal + serviceCharge + vat;

    const invoice: Invoice = {
      id: crypto.randomUUID(),
      invoiceNumber: generateInvoiceNumber(),
      jobSheetId: jobSheet.id,
      bookingId: jobSheet.bookingId,
      customer: {
        name: booking.customer.name,
        email: booking.customer.email,
        phone: booking.customer.phone,
      },
      vehicle: {
        make: booking.vehicle.make,
        model: booking.vehicle.model,
        year: booking.vehicle.year,
        license: booking.vehicle.license,
      },
      services,
      subtotal,
      serviceCharge,
      vat,
      totalAmount,
      status: "DRAFT",
      issuedDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      createdBy: "technician", // TODO: Get from auth context
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      invoices: [...state.invoices, invoice],
    }));

    return invoice;
  },

  updateInvoiceStatus: (invoiceId, status) => {
    set((state) => ({
      invoices: state.invoices.map((invoice) =>
        invoice.id === invoiceId ? { ...invoice, status } : invoice
      ),
    }));
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  getFilteredInvoices: () => {
    const { invoices, filters } = get();

    return invoices.filter((invoice) => {
      if (filters.status && invoice.status !== filters.status) return false;
      if (
        filters.customerName &&
        !invoice.customer.name
          .toLowerCase()
          .includes(filters.customerName.toLowerCase())
      )
        return false;
      if (
        filters.dateFrom &&
        new Date(invoice.issuedDate) < new Date(filters.dateFrom)
      )
        return false;
      if (
        filters.dateTo &&
        new Date(invoice.issuedDate) > new Date(filters.dateTo)
      )
        return false;

      return true;
    });
  },

  getInvoiceSummary: () => {
    const { invoices } = get();

    const summary: InvoiceSummary = {
      totalInvoices: invoices.length,
      totalAmount: invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
      paidAmount: invoices
        .filter((inv) => inv.status === "PAID")
        .reduce((sum, inv) => sum + inv.totalAmount, 0),
      pendingAmount: invoices
        .filter((inv) => inv.status === "DRAFT" || inv.status === "SENT")
        .reduce((sum, inv) => sum + inv.totalAmount, 0),
      overdueAmount: invoices
        .filter((inv) => inv.status === "OVERDUE")
        .reduce((sum, inv) => sum + inv.totalAmount, 0),
    };

    set((state) => ({ summary }));
    return summary;
  },

  markAsPaid: (invoiceId, paymentMethod) => {
    set((state) => ({
      invoices: state.invoices.map((invoice) =>
        invoice.id === invoiceId
          ? {
              ...invoice,
              status: "PAID" as InvoiceStatus,
              paidDate: new Date().toISOString(),
              paymentMethod,
            }
          : invoice
      ),
    }));
  },
}));
