// store/inventory.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { InventoryItem, StockMovement, StockStatus } from "../types/inventory";
import mockInventory from "../app/data/mock-inventory.json";

function computeStatus(qty: number, rl: number): StockStatus {
  if (qty <= 0) return "OUT";
  if (qty <= rl) return "LOW";
  return "IN_STOCK";
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

interface FilterOptions {
  categories: string[];
  suppliers: string[];
  locations: string[];
  statuses: StockStatus[];
}

interface InventoryFilters {
  q: string;
  status?: StockStatus | "ALL";
  category?: string;
  supplier?: string;
  location?: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  page: number;
  limit: number;
}

type InventoryState = {
  // Raw data
  allItems: InventoryItem[];
  movements: Record<string, StockMovement[]>;

  alerts: {
    lowCount: number;
    outCount: number;
    lowItems: InventoryItem[];
    outItems: InventoryItem[];
  };

  // Computed data (like API response)
  items: InventoryItem[];
  pagination: PaginationInfo;
  filterOptions: FilterOptions;

  // Filters
  filters: InventoryFilters;

  // Actions
  setFilters: (f: Partial<InventoryFilters>) => void;
  addItem: (
    i: Omit<InventoryItem, "status" | "createdAt" | "updatedAt">
  ) => void;
  updateItem: (i: InventoryItem) => void;
  adjustStock: (args: {
    itemId: string;
    mode: "INCREASE" | "DECREASE" | "SET";
    quantity: number;
    reason: string;
    reference?: string;
    performedBy: string;
    // NEW traceability
    jobSheetId?: string;
    bookingId?: string;
    serviceId?: string;
    notes?: string;
  }) => void;

  // Computed getters
  getFilteredAndPaginatedData: () => {
    items: InventoryItem[];
    pagination: PaginationInfo;
    filterOptions: FilterOptions;
  };
  // NEW selectors for movements
  getRecentMovementsByItem: (itemId: string, limit?: number) => StockMovement[];
  getMovementsByItem: (
    itemId: string,
    filters?: {
      type?: "INCREASE" | "DECREASE" | "SET" | "ALL";
      q?: string;
      from?: string;
      to?: string;
      referenceType?: "JOB_SHEET" | "BOOKING" | "MANUAL" | "SYSTEM" | "ALL";
      page?: number;
      limit?: number;
    }
  ) => {
    data: StockMovement[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export const useInventory = create<InventoryState>()(
  persist(
    (set, get) => ({
      // Initialize raw data
      allItems: mockInventory.map((item) => ({
        ...item,
        unit: item.unit as "pair" | "bottle" | "pc" | "box" | "litre" | "kg",
        status: computeStatus(item.quantity, item.reorderLevel),
      })),

      // Initialize alerts
      alerts: {
        lowCount: 0,
        outCount: 0,
        lowItems: [],
        outItems: [],
      },
      movements: {},

      // Initialize computed data
      items: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
      },
      filterOptions: {
        categories: [],
        suppliers: [],
        locations: [],
        statuses: ["IN_STOCK", "LOW", "OUT"],
      },

      // Initialize filters
      filters: {
        q: "",
        status: "ALL",
        category: undefined,
        supplier: undefined,
        location: undefined,
        sortBy: "name",
        sortOrder: "asc",
        page: 1,
        limit: 10,
      },

      // Computed getter that acts like an API
      getFilteredAndPaginatedData: () => {
        const state = get();
        const { allItems, filters } = state;

        // Apply filters
        const filtered = allItems.filter((item) => {
          // Search filter
          if (
            filters.q &&
            !item.name.toLowerCase().includes(filters.q.toLowerCase()) &&
            !item.sku.toLowerCase().includes(filters.q.toLowerCase())
          ) {
            return false;
          }

          // Category filter
          if (filters.category && item.category !== filters.category) {
            return false;
          }

          // Status filter
          if (
            filters.status &&
            filters.status !== "ALL" &&
            item.status !== filters.status
          ) {
            return false;
          }

          // Supplier filter
          if (filters.supplier && item.supplier !== filters.supplier) {
            return false;
          }

          // Location filter
          if (filters.location && item.location !== filters.location) {
            return false;
          }

          return true;
        });

        // Apply sorting
        filtered.sort((a, b) => {
          const aValue = a[filters.sortBy as keyof InventoryItem];
          const bValue = b[filters.sortBy as keyof InventoryItem];

          if (typeof aValue === "string" && typeof bValue === "string") {
            return filters.sortOrder === "asc"
              ? aValue.localeCompare(bValue)
              : bValue.localeCompare(aValue);
          }

          if (typeof aValue === "number" && typeof bValue === "number") {
            return filters.sortOrder === "asc"
              ? aValue - bValue
              : bValue - aValue;
          }

          return 0;
        });

        // Apply pagination
        const totalItems = filtered.length;
        const totalPages = Math.ceil(totalItems / filters.limit);
        const startIndex = (filters.page - 1) * filters.limit;
        const endIndex = startIndex + filters.limit;
        const paginatedItems = filtered.slice(startIndex, endIndex);

        // Get filter options from all items
        const filterOptions: FilterOptions = {
          categories: [
            ...new Set(allItems.map((item) => item.category)),
          ].sort(),
          suppliers: [
            ...new Set(
              allItems
                .map((item) => item.supplier)
                .filter((s): s is string => Boolean(s))
            ),
          ].sort(),
          locations: [
            ...new Set(
              allItems
                .map((item) => item.location)
                .filter((l): l is string => Boolean(l))
            ),
          ].sort(),
          statuses: ["IN_STOCK", "LOW", "OUT"],
        };

        const pagination: PaginationInfo = {
          currentPage: filters.page,
          totalPages: Math.max(1, totalPages),
          totalItems,
          itemsPerPage: filters.limit,
        };

        return {
          items: paginatedItems,
          pagination,
          filterOptions,
        };
      },

      // Actions
      setFilters: (newFilters) => {
        set((state) => {
          const updatedFilters = { ...state.filters, ...newFilters };

          // Reset to page 1 when filters change (except page changes)
          if (Object.keys(newFilters).some((key) => key !== "page")) {
            updatedFilters.page = 1;
          }

          // Recompute using updatedFilters (avoid stale state.filters)
          const allItems = state.allItems;
          const filters = updatedFilters;

          const filtered = allItems.filter((item) => {
            if (
              filters.q &&
              !item.name.toLowerCase().includes(filters.q.toLowerCase()) &&
              !item.sku.toLowerCase().includes(filters.q.toLowerCase())
            )
              return false;
            if (filters.category && item.category !== filters.category)
              return false;
            if (
              filters.status &&
              filters.status !== "ALL" &&
              item.status !== filters.status
            )
              return false;
            if (filters.supplier && item.supplier !== filters.supplier)
              return false;
            if (filters.location && item.location !== filters.location)
              return false;
            return true;
          });

          filtered.sort((a, b) => {
            const aValue = a[filters.sortBy as keyof InventoryItem];
            const bValue = b[filters.sortBy as keyof InventoryItem];
            if (typeof aValue === "string" && typeof bValue === "string") {
              return filters.sortOrder === "asc"
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
            }
            if (typeof aValue === "number" && typeof bValue === "number") {
              return filters.sortOrder === "asc"
                ? aValue - bValue
                : bValue - aValue;
            }
            return 0;
          });

          const totalItems = filtered.length;
          const totalPages = Math.max(1, Math.ceil(totalItems / filters.limit));
          const startIndex = (filters.page - 1) * filters.limit;
          const endIndex = startIndex + filters.limit;
          const paginatedItems = filtered.slice(startIndex, endIndex);

          return {
            filters: updatedFilters,
            items: paginatedItems,
            pagination: {
              currentPage: filters.page,
              totalPages,
              totalItems,
              itemsPerPage: filters.limit,
            },
            filterOptions: {
              categories: [...new Set(allItems.map((i) => i.category))].sort(),
              suppliers: [
                ...new Set(
                  allItems
                    .map((i) => i.supplier)
                    .filter((s): s is string => Boolean(s))
                ),
              ].sort(),
              locations: [
                ...new Set(
                  allItems
                    .map((i) => i.location)
                    .filter((l): l is string => Boolean(l))
                ),
              ].sort(),
              statuses: ["IN_STOCK", "LOW", "OUT"],
            },
          };
        });
      },

      addItem: (newItem) => {
        set((state) => {
          const item: InventoryItem = {
            ...newItem,
            id: crypto.randomUUID(),
            status: computeStatus(newItem.quantity, newItem.reorderLevel),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          const updatedAllItems = [item, ...state.allItems];
          const alerts = computeAlerts(updatedAllItems);
          const { items, pagination, filterOptions } =
            state.getFilteredAndPaginatedData();

          return {
            allItems: updatedAllItems,
            alerts,
            items,
            pagination,
            filterOptions,
          };
        });
      },

      updateItem: (updatedItem) => {
        set((state) => {
          const updatedAllItems = state.allItems.map((item) =>
            item.id === updatedItem.id
              ? {
                  ...updatedItem,
                  status: computeStatus(
                    updatedItem.quantity,
                    updatedItem.reorderLevel
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : item
          );

          const alerts = computeAlerts(updatedAllItems);
          const { items, pagination, filterOptions } =
            state.getFilteredAndPaginatedData();

          return {
            allItems: updatedAllItems,
            alerts,
            items,
            pagination,
            filterOptions,
          };
        });
      },

      adjustStock: ({
        itemId,
        mode,
        quantity,
        reason,
        reference,
        performedBy,
        jobSheetId,
        bookingId,
        serviceId,
        notes,
      }) => {
        set((state) => {
          const updatedAllItems = state.allItems.map((item) => {
            if (item.id !== itemId) return item;

            let newQty = item.quantity;
            if (mode === "INCREASE") newQty += quantity;
            else if (mode === "DECREASE") newQty -= quantity;
            else newQty = quantity;

            if (newQty < 0) newQty = 0;

            return {
              ...item,
              quantity: newQty,
              status: computeStatus(newQty, item.reorderLevel),
              updatedAt: new Date().toISOString(),
            };
          });

          const move: StockMovement = {
            id: crypto.randomUUID(),
            itemId,
            type: mode,
            quantity,
            reason,
            reference,
            performedBy,
            createdAt: new Date().toISOString(),
            resultingQuantity:
              updatedAllItems.find((it) => it.id === itemId)?.quantity || 0,
            referenceType: jobSheetId
              ? "JOB_SHEET"
              : bookingId
              ? "BOOKING"
              : "MANUAL",
            jobSheetId,
            bookingId,
            serviceId,
            notes,
          };

          const ms = state.movements[itemId] ?? [];
          const newMs = [move, ...ms];

          const alerts = computeAlerts(updatedAllItems);
          const { items, pagination, filterOptions } =
            state.getFilteredAndPaginatedData();

          return {
            allItems: updatedAllItems,
            movements: { ...state.movements, [itemId]: newMs },
            alerts,
            items,
            pagination,
            filterOptions,
          };
        });
      },
      // NEW selectors
      getRecentMovementsByItem: (itemId, limit = 5) => {
        const state = get();
        const list = state.movements[itemId] ?? [];
        return list.slice(0, limit);
      },
      getMovementsByItem: (itemId, filters = {}) => {
        const state = get();
        const {
          type = "ALL",
          q,
          from,
          to,
          referenceType = "ALL",
          page = 1,
          limit = 20,
        } = filters;

        let list = [...(state.movements[itemId] ?? [])];
        if (type !== "ALL") list = list.filter((m) => m.type === type);
        if (referenceType !== "ALL")
          list = list.filter((m) => m.referenceType === referenceType);
        if (q) {
          const s = q.toLowerCase();
          list = list.filter(
            (m) =>
              (m.reason && m.reason.toLowerCase().includes(s)) ||
              (m.notes && m.notes.toLowerCase().includes(s))
          );
        }
        if (from)
          list = list.filter((m) => new Date(m.createdAt) >= new Date(from));
        if (to)
          list = list.filter((m) => new Date(m.createdAt) <= new Date(to));

        const total = list.length;
        const start = (page - 1) * limit;
        const end = start + limit;
        const data = list.slice(start, end);
        return {
          data,
          total,
          page,
          limit,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        };
      },
    }),
    {
      name: "inventory-storage",
      partialize: (state) => ({
        allItems: state.allItems,
        movements: state.movements,
      }),
    }
  )
);

function computeAlerts(items: InventoryItem[]) {
  const lowCount = items.filter((item) => item.status === "LOW").length;
  const outCount = items.filter((item) => item.status === "OUT").length;
  const lowItems = items.filter((item) => item.status === "LOW");
  const outItems = items.filter((item) => item.status === "OUT");
  return { lowCount, outCount, lowItems, outItems };
}
// Initialize the store with computed data after persistence loads
const initializeStore = () => {
  // Use setTimeout to ensure persistence has loaded
  setTimeout(() => {
    const state = useInventory.getState();

    // Only initialize if items array is empty (indicating first load or persistence hasn't loaded)
    if (state.items.length === 0 && state.allItems.length > 0) {
      const { items, pagination, filterOptions } =
        state.getFilteredAndPaginatedData();
      const alerts = computeAlerts(state.allItems);

      useInventory.setState({
        items,
        pagination,
        filterOptions,
        alerts,
      });
    }
  }, 0);
};

// Initialize on first load
initializeStore();
