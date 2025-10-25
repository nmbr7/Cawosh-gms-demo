import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useBookingStore } from "./booking";
import type { Booking } from "@/types/booking";

export type JobSheetStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "PAUSED"
  | "HALTED"
  | "COMPLETED"
  | "CANCELLED";

export interface TimeLog {
  id: string;
  action: "START" | "PAUSE" | "RESUME" | "HALT" | "COMPLETE";
  timestamp: string;
  technicianId: string;
  notes?: string;
}

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
  // Work tracking fields
  startedAt?: string;
  pausedAt?: string;
  completedAt?: string;
  timeLogs: TimeLog[];
  totalWorkDuration: number; // in minutes
  haltReason?: string;
  inventoryDeducted: boolean;
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
  // Work tracking actions
  startJob: (jobSheetId: string, technicianId: string) => void;
  pauseJob: (jobSheetId: string, technicianId: string, notes?: string) => void;
  resumeJob: (jobSheetId: string, technicianId: string) => void;
  haltJob: (jobSheetId: string, technicianId: string, reason: string) => void;
  completeJob: (jobSheetId: string, technicianId: string) => void;
  calculateWorkDuration: (timeLogs: TimeLog[]) => number;
};

export const useJobSheetStore = create<JobSheetState>()(
  persist(
    (set, get) => ({
      jobSheets: [], // Start with empty jobsheets
      filterOptions: {
        statuses: [
          { value: "PENDING", label: "Pending" },
          { value: "IN_PROGRESS", label: "In Progress" },
          { value: "PAUSED", label: "Paused" },
          { value: "HALTED", label: "Halted" },
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
          timeLogs: [],
          totalWorkDuration: 0,
          inventoryDeducted: false,
        };
        set((s) => ({ jobSheets: [...s.jobSheets, js] }));
        return js;
      },
      setStatus: (id, status) =>
        set((s) => ({
          jobSheets: s.jobSheets.map((j) =>
            j.id === id ? { ...j, status } : j
          ),
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
      // Work tracking actions
      startJob: (jobSheetId, technicianId) => {
        const timeLog: TimeLog = {
          id: crypto.randomUUID(),
          action: "START",
          timestamp: new Date().toISOString(),
          technicianId,
        };

        set((s) => ({
          jobSheets: s.jobSheets.map((j) =>
            j.id === jobSheetId
              ? {
                  ...j,
                  status: "IN_PROGRESS" as const,
                  startedAt: timeLog.timestamp,
                  timeLogs: [...j.timeLogs, timeLog],
                }
              : j
          ),
        }));
      },
      pauseJob: (jobSheetId, technicianId, notes) => {
        const timeLog: TimeLog = {
          id: crypto.randomUUID(),
          action: "PAUSE",
          timestamp: new Date().toISOString(),
          technicianId,
          notes,
        };

        set((s) => ({
          jobSheets: s.jobSheets.map((j) =>
            j.id === jobSheetId
              ? {
                  ...j,
                  status: "PAUSED" as const,
                  pausedAt: timeLog.timestamp,
                  timeLogs: [...j.timeLogs, timeLog],
                }
              : j
          ),
        }));
      },
      resumeJob: (jobSheetId, technicianId) => {
        const timeLog: TimeLog = {
          id: crypto.randomUUID(),
          action: "RESUME",
          timestamp: new Date().toISOString(),
          technicianId,
        };

        set((s) => ({
          jobSheets: s.jobSheets.map((j) =>
            j.id === jobSheetId
              ? {
                  ...j,
                  status: "IN_PROGRESS" as const,
                  timeLogs: [...j.timeLogs, timeLog],
                }
              : j
          ),
        }));
      },
      haltJob: (jobSheetId, technicianId, reason) => {
        const timeLog: TimeLog = {
          id: crypto.randomUUID(),
          action: "HALT",
          timestamp: new Date().toISOString(),
          technicianId,
          notes: reason,
        };

        set((s) => ({
          jobSheets: s.jobSheets.map((j) =>
            j.id === jobSheetId
              ? {
                  ...j,
                  status: "HALTED" as const,
                  haltReason: reason,
                  timeLogs: [...j.timeLogs, timeLog],
                }
              : j
          ),
        }));
      },
      completeJob: (jobSheetId, technicianId) => {
        const timeLog: TimeLog = {
          id: crypto.randomUUID(),
          action: "COMPLETE",
          timestamp: new Date().toISOString(),
          technicianId,
        };

        set((s) => ({
          jobSheets: s.jobSheets.map((j) =>
            j.id === jobSheetId
              ? {
                  ...j,
                  status: "COMPLETED" as const,
                  completedAt: timeLog.timestamp,
                  timeLogs: [...j.timeLogs, timeLog],
                }
              : j
          ),
        }));
      },
      calculateWorkDuration: (timeLogs) => {
        let totalMinutes = 0;
        let lastStart: Date | null = null;

        timeLogs.forEach((log) => {
          if (log.action === "START" || log.action === "RESUME") {
            lastStart = new Date(log.timestamp);
          } else if (
            (log.action === "PAUSE" ||
              log.action === "HALT" ||
              log.action === "COMPLETE") &&
            lastStart
          ) {
            const duration =
              (new Date(log.timestamp).getTime() - lastStart.getTime()) /
              (1000 * 60);
            totalMinutes += duration;
            lastStart = null;
          }
        });

        return Math.round(totalMinutes);
      },
    }),
    {
      name: "jobsheet-storage",
      // Only persist jobSheets, not filterOptions or other computed values
      partialize: (state) => ({ jobSheets: state.jobSheets }),
    }
  )
);
