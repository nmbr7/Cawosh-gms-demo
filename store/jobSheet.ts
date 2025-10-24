import { create } from "zustand";
import { useBookingStore } from "./booking";
import type { Booking } from "@/types/booking";

export type JobSheetStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export interface JobSheet {
  id: string;
  bookingId: string;
  status: JobSheetStatus;
  createdAt: string;
  // Linked booking data for display
  booking?: Booking;
  requiresDiagnosis?: boolean;
  diagnosedServices?: Array<{
    id: string;
    name: string;
    description: string;
    duration: number;
    price: number;
    addedBy: string; // technician ID
    addedAt: string;
  }>;
  approvalStatus?: "pending" | "approved" | "rejected";
  approvedBy?: string; // advisor user ID
  approvedAt?: string; // timestamp
  customerApprovalMethod?: "manual" | "api"; // for future API integration
}

export interface FilterOptions {
  statuses: Array<{ value: string; label: string }>;
  serviceStatuses: Array<{ value: string; label: string }>;
  technicians: Array<{ id: string; name: string }>;
}

type JobSheetState = {
  jobSheets: JobSheet[];
  filterOptions: FilterOptions;
  createFromBooking: (bookingId: string) => JobSheet;
  setStatus: (id: string, status: JobSheetStatus) => void;
  getFilterOptions: () => FilterOptions;
  addDiagnosedServices: (
    jobSheetId: string,
    services: Array<{
      id: string;
      name: string;
      description: string;
      duration: number;
      price: number;
      addedBy: string;
    }>
  ) => void;
  setApprovalStatus: (
    jobSheetId: string,
    status: "pending" | "approved" | "rejected",
    approvedBy?: string
  ) => void;
};

export const useJobSheetStore = create<JobSheetState>((set, get) => ({
  jobSheets: [], // Start with empty jobsheets
  filterOptions: {
    statuses: [
      { value: "PENDING", label: "Pending" },
      { value: "IN_PROGRESS", label: "In Progress" },
      { value: "COMPLETED", label: "Completed" },
      { value: "CANCELLED", label: "Cancelled" },
    ],
    serviceStatuses: [
      { value: "pending", label: "Pending" },
      { value: "in-progress", label: "In Progress" },
      { value: "completed", label: "Completed" },
    ],
    technicians: [
      { id: "tech-1", name: "John Smith" },
      { id: "tech-2", name: "Sarah Johnson" },
      { id: "tech-3", name: "Mike Davis" },
      { id: "tech-4", name: "Lisa Wilson" },
    ],
  },
  createFromBooking: (bookingId) => {
    const { jobSheets } = get();
    const nextId = jobSheets.length + 1;

    // Get booking to check if it requires diagnosis
    const bookingStore = useBookingStore.getState();
    const booking = bookingStore.bookings.find((b) => b._id === bookingId);

    const js: JobSheet = {
      id: `JB-${nextId.toString().padStart(4, "0")}`,
      bookingId,
      status: "PENDING",
      createdAt: new Date().toISOString(),
      requiresDiagnosis: booking?.requiresDiagnosis || false,
    };
    set((s) => ({ jobSheets: [...s.jobSheets, js] }));
    return js;
  },
  setStatus: (id, status) =>
    set((s) => ({
      jobSheets: s.jobSheets.map((j) => (j.id === id ? { ...j, status } : j)),
    })),
  addDiagnosedServices: (jobSheetId, services) =>
    set((s) => ({
      jobSheets: s.jobSheets.map((j) =>
        j.id === jobSheetId
          ? {
              ...j,
              diagnosedServices: services.map((service) => ({
                ...service,
                addedAt: new Date().toISOString(),
              })),
              approvalStatus: "pending" as const,
            }
          : j
      ),
    })),
  setApprovalStatus: (jobSheetId, status, approvedBy) =>
    set((s) => ({
      jobSheets: s.jobSheets.map((j) =>
        j.id === jobSheetId
          ? {
              ...j,
              approvalStatus: status,
              approvedBy,
              approvedAt: new Date().toISOString(),
            }
          : j
      ),
    })),
  getFilterOptions: () => get().filterOptions,
}));
