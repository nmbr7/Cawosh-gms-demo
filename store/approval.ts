import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Approval {
  id: string;
  jobSheetId: string;
  bookingId: string;
  customerName: string;
  vehicleInfo: string;
  services: Array<{
    id: string;
    name: string;
    description: string;
    duration: number;
    price: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
  rejectionReason?: string;
}

interface ApprovalState {
  // Data
  approvals: Approval[];
  filters: {
    status: 'all' | 'pending' | 'approved' | 'rejected';
    customerName: string;
    dateFrom: string;
    dateTo: string;
  };

  // Actions
  addApproval: (approval: Omit<Approval, 'id' | 'submittedAt'>) => Approval;
  updateApprovalStatus: (
    approvalId: string,
    status: 'approved' | 'rejected',
    reviewedBy: string,
    notes?: string,
    rejectionReason?: string,
  ) => void;
  removeApproval: (approvalId: string) => void;
  getApprovalByJobSheet: (jobSheetId: string) => Approval | undefined;
  getApprovalByBooking: (bookingId: string) => Approval | undefined;

  // Filtering
  setFilters: (filters: Partial<ApprovalState['filters']>) => void;
  getFilteredApprovals: () => Approval[];
  getPendingApprovals: () => Approval[];
  getApprovedApprovals: () => Approval[];
  getRejectedApprovals: () => Approval[];

  // Statistics
  getApprovalStats: () => {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    totalValue: number;
    approvedValue: number;
  };

  // Utility
  clearAllApprovals: () => void;
  exportApprovals: (format: 'json' | 'csv') => string;
}

export const useApprovalStore = create<ApprovalState>()(
  persist(
    (set, get) => ({
      // Initial state
      approvals: [],
      filters: {
        status: 'all',
        customerName: '',
        dateFrom: '',
        dateTo: '',
      },

      // CRUD operations
      addApproval: (approvalData) => {
        const newApproval: Approval = {
          id: crypto.randomUUID(),
          submittedAt: new Date().toISOString(),
          ...approvalData,
        };

        set((state) => ({
          approvals: [...state.approvals, newApproval],
        }));

        return newApproval;
      },

      updateApprovalStatus: (
        approvalId,
        status,
        reviewedBy,
        notes,
        rejectionReason,
      ) => {
        set((state) => ({
          approvals: state.approvals.map((approval) =>
            approval.id === approvalId
              ? {
                  ...approval,
                  status,
                  reviewedAt: new Date().toISOString(),
                  reviewedBy,
                  notes,
                  rejectionReason:
                    status === 'rejected' ? rejectionReason : undefined,
                }
              : approval,
          ),
        }));
      },

      removeApproval: (approvalId) => {
        set((state) => ({
          approvals: state.approvals.filter(
            (approval) => approval.id !== approvalId,
          ),
        }));
      },

      getApprovalByJobSheet: (jobSheetId) => {
        return get().approvals.find(
          (approval) => approval.jobSheetId === jobSheetId,
        );
      },

      getApprovalByBooking: (bookingId) => {
        return get().approvals.find(
          (approval) => approval.bookingId === bookingId,
        );
      },

      // Filtering
      setFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        }));
      },

      getFilteredApprovals: () => {
        const { approvals, filters } = get();

        return approvals.filter((approval) => {
          if (filters.status !== 'all' && approval.status !== filters.status) {
            return false;
          }
          if (
            filters.customerName &&
            !approval.customerName
              .toLowerCase()
              .includes(filters.customerName.toLowerCase())
          ) {
            return false;
          }
          if (
            filters.dateFrom &&
            new Date(approval.submittedAt) < new Date(filters.dateFrom)
          ) {
            return false;
          }
          if (
            filters.dateTo &&
            new Date(approval.submittedAt) > new Date(filters.dateTo)
          ) {
            return false;
          }
          return true;
        });
      },

      getPendingApprovals: () => {
        return get().approvals.filter(
          (approval) => approval.status === 'pending',
        );
      },

      getApprovedApprovals: () => {
        return get().approvals.filter(
          (approval) => approval.status === 'approved',
        );
      },

      getRejectedApprovals: () => {
        return get().approvals.filter(
          (approval) => approval.status === 'rejected',
        );
      },

      // Statistics
      getApprovalStats: () => {
        const { approvals } = get();

        const stats = {
          total: approvals.length,
          pending: approvals.filter((a) => a.status === 'pending').length,
          approved: approvals.filter((a) => a.status === 'approved').length,
          rejected: approvals.filter((a) => a.status === 'rejected').length,
          totalValue: approvals.reduce((sum, a) => sum + a.totalAmount, 0),
          approvedValue: approvals
            .filter((a) => a.status === 'approved')
            .reduce((sum, a) => sum + a.totalAmount, 0),
        };

        return stats;
      },

      // Utility functions
      clearAllApprovals: () => {
        set({ approvals: [] });
      },

      exportApprovals: (format) => {
        const { approvals } = get();

        if (format === 'json') {
          return JSON.stringify(approvals, null, 2);
        }

        // CSV format
        const headers = [
          'ID',
          'Job Sheet ID',
          'Customer Name',
          'Vehicle Info',
          'Total Amount',
          'Status',
          'Submitted At',
          'Reviewed At',
          'Notes',
        ];

        const rows = approvals.map((approval) => [
          approval.id,
          approval.jobSheetId,
          approval.customerName,
          approval.vehicleInfo,
          approval.totalAmount.toString(),
          approval.status,
          approval.submittedAt,
          approval.reviewedAt || '',
          approval.notes || '',
        ]);

        const csvContent = [headers, ...rows]
          .map((row) => row.map((field) => `"${field}"`).join(','))
          .join('\n');

        return csvContent;
      },
    }),
    {
      name: 'approval-storage',
      partialize: (state) => ({
        approvals: state.approvals,
        filters: state.filters,
      }),
    },
  ),
);
