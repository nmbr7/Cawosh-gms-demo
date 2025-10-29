export interface Invoice {
  id: string;
  invoiceNumber: string; // INV-XXXX format
  jobSheetId: string;
  bookingId: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  vehicle: {
    make: string;
    model: string;
    year: number;
    license: string;
  };
  services: Array<{
    id: string;
    name: string;
    description: string;
    duration: number;
    price: number;
  }>;
  subtotal: number;
  serviceCharge: number;
  vat: number; // 20%
  totalAmount: number;
  status: "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED";
  issuedDate: string;
  dueDate: string;
  paidDate?: string;
  paymentMethod?: string;
  notes?: string;
  createdBy: string; // technician or advisor ID
  createdAt: string;
}

export type InvoiceStatus = "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED";

export interface InvoiceFilters {
  status?: InvoiceStatus | "ALL";
  customerName?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface InvoiceSummary {
  totalInvoices: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
}
