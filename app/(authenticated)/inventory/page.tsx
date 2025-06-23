"use client";

import { useState, useEffect, useCallback } from "react";
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  X,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";
import { ItemDetailsModal } from "@/components/modals/item-details-modal";
import { ItemCreateModal } from "@/components/modals/item-create-modal";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  description: string;
  quantity: number;
  unit: string;
  reorderLevel: number;
  costPrice: number;
  sellingPrice: number;
  supplier: string;
  location: string;
  lastRestocked: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

interface FilterState {
  category: string;
  search: string | null;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    category: "all",
    search: null,
    sortBy: "name",
    sortOrder: "asc",
  });

  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  const fetchItems = useCallback(async () => {
    try {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 4000));
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });

      if (filters.category !== "all") {
        params.append("category", filters.category);
      }

      if (filters.search) {
        params.append("search", filters.search);
      }

      const response = await fetchWithAuth(
        `/api/inventory?${params.toString()}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch inventory");
      }
      const data = await response.json();
      setItems(data.items);
      setPaginationInfo(data.pagination);
      setCategories(data.filters.categories);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleFilterChange = (key: keyof FilterState, value: string | null) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= paginationInfo.totalPages) {
      setCurrentPage(newPage);
    }
  };

  const columns = [
    {
      header: "Item Name",
      accessorKey: "name" as keyof InventoryItem,
      width: "w-32",
    },
    {
      header: "SKU",
      accessorKey: "sku" as keyof InventoryItem,
      width: "w-24",
    },
    {
      header: "Category",
      accessorKey: "category" as keyof InventoryItem,
      width: "w-20",
    },
    {
      header: "Quantity",
      accessorKey: "quantity" as keyof InventoryItem,
      cell: (item: InventoryItem) => (
        <div>
          <div className="font-medium">{item.quantity}</div>
          <div className="text-xs text-gray-400">{item.unit}</div>
        </div>
      ),
      width: "w-16",
    },
    {
      header: "Price",
      accessorKey: "sellingPrice" as keyof InventoryItem,
      cell: (item: InventoryItem) => (
        <div>
          <div className="font-medium">${item.sellingPrice.toFixed(2)}</div>
          <div className="text-xs text-gray-400">
            Cost: ${item.costPrice.toFixed(2)}
          </div>
        </div>
      ),
      width: "w-20",
    },
    {
      header: "Status",
      accessorKey: "quantity" as keyof InventoryItem,
      cell: (item: InventoryItem) => {
        const isLow = item.quantity <= item.reorderLevel;
        return (
          <span
            className={cn(
              "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
              isLow ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
            )}
          >
            {isLow ? "Low Stock" : "In Stock"}
          </span>
        );
      },
      width: "w-16",
    },
  ];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search inventory..."
                className="w-[300px] pl-9"
                disabled
              />
            </div>
            <Button variant="outline" disabled>
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
          <Button disabled>
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>

        {/* Inventory table with shimmer effect */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {/* Progress bar as divider */}
              <tr>
                <td colSpan={6} className="p-0">
                  <div className="h-1 bg-blue-500 animate-pulse"></div>
                </td>
              </tr>
              {/* Shimmer rows */}
              {[1, 2, 3].map((row) => (
                <React.Fragment key={row}>
                  <tr className="animate-pulse">
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
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </td>
                  </tr>
                  {row < 3 && (
                    <tr>
                      <td colSpan={6} className="p-0">
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

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search inventory..."
              className="w-[300px] pl-9 pr-8"
              value={filters.search || ""}
              onChange={(e) =>
                handleFilterChange("search", e.target.value || null)
              }
            />
            {filters.search && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
                onClick={() => handleFilterChange("search", null)}
              >
                <X className="h-4 w-4 text-gray-500" />
              </Button>
            )}
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2",
              showFilters && "bg-blue-100"
            )}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      {showFilters && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <Select
                value={filters.category}
                onValueChange={(value) => handleFilterChange("category", value)}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        data={items}
        isLoading={isLoading}
        onRowClick={(item) => {
          setSelectedItem(item);
          setIsModalOpen(true);
        }}
        emptyMessage={
          filters.category !== "all" || filters.search
            ? "No items match your filters"
            : "No inventory items found"
        }
        emptySubMessage={
          filters.category !== "all" || filters.search
            ? "Try adjusting your filters or search criteria"
            : "Get started by adding a new inventory item"
        }
        emptyAction={
          filters.category !== "all" || filters.search
            ? {
                label: "Clear filters",
                onClick: () => {
                  setFilters({
                    category: "all",
                    search: null,
                    sortBy: "name",
                    sortOrder: "asc",
                  });
                },
              }
            : {
                label: "Add Item",
                onClick: () => setIsCreateModalOpen(true),
              }
        }
      />

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {(currentPage - 1) * paginationInfo.itemsPerPage + 1} to{" "}
          {Math.min(
            currentPage * paginationInfo.itemsPerPage,
            paginationInfo.totalItems
          )}{" "}
          of {paginationInfo.totalItems} items
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="flex gap-1">
            {Array.from(
              { length: paginationInfo.totalPages },
              (_, i) => i + 1
            ).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                onClick={() => handlePageChange(page)}
                className={cn(
                  "w-8 h-8 p-0",
                  currentPage === page &&
                    "bg-blue-500 text-white hover:bg-blue-600"
                )}
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === paginationInfo.totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Add modals at the end */}
      <ItemDetailsModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <ItemCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
