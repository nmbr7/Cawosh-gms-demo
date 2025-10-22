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
    const js: JobSheet = {
      id: `JB-${nextId.toString().padStart(4, "0")}`,
      bookingId,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };
    set((s) => ({ jobSheets: [...s.jobSheets, js] }));
    return js;
  },
  setStatus: (id, status) =>
    set((s) => ({
      jobSheets: s.jobSheets.map((j) => (j.id === id ? { ...j, status } : j)),
    })),
  getFilterOptions: () => get().filterOptions,
}));
