"use client";

import { useState } from "react";
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
// import { ItemDetailsModal } from "@/components/modals/item-details-modal";
// import { ItemCreateModal } from "@/components/modals/item-create-modal";
import { useInventory } from "@/store/inventory";
import type { InventoryItem } from "@/types/inventory";

export default function InventoryPage() {
  // const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  // const [isModalOpen, setIsModalOpen] = useState(false);
  // const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [showFilters, setShowFilters] = useState(false);

  const { items, pagination, filters, setFilters, filterOptions } =
    useInventory();

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
      accessorKey: "price" as keyof InventoryItem,
      cell: (item: InventoryItem) => (
        <div>
          <div className="font-medium">${item.price.toFixed(2)}</div>
          <div className="text-xs text-gray-400">
            Cost: ${item.cost.toFixed(2)}
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

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setFilters({ page: newPage });
    }
  };

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
              value={filters.q || ""}
              onChange={(e) => setFilters({ q: e.target.value || undefined })}
            />
            {filters.q && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
                onClick={() => setFilters({ q: undefined })}
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
                onValueChange={(value) => setFilters({ category: value })}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Categories</SelectItem>
                  {filterOptions.categories.map((category) => (
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
        // isLoading={isLoading} // This state is no longer managed by Zustand
        onRowClick={(item) => {
          console.log(item);
          // setSelectedItem(item);
          // setIsModalOpen(true);
        }}
        emptyMessage={
          filters.category !== "all" || filters.q
            ? "No items match your filters"
            : "No inventory items found"
        }
        emptySubMessage={
          filters.category !== "all" || filters.q
            ? "Try adjusting your filters or search criteria"
            : "Get started by adding a new inventory item"
        }
        emptyAction={
          filters.category !== "all" || filters.q
            ? {
                label: "Clear filters",
                onClick: () => {
                  setFilters({
                    category: "all",
                    q: undefined,
                    sortBy: "name",
                    sortOrder: "asc",
                  });
                },
              }
            : {
                label: "Add Item",
                // onClick: () => setIsCreateModalOpen(true),
                onClick: () => {
                  console.log("Add Item");
                },
              }
        }
      />

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}{" "}
          to{" "}
          {Math.min(
            pagination.currentPage * pagination.itemsPerPage,
            pagination.totalItems
          )}{" "}
          of {pagination.totalItems} items
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="flex gap-1">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
              (page) => (
                <Button
                  key={page}
                  variant={
                    pagination.currentPage === page ? "default" : "outline"
                  }
                  onClick={() => setFilters({ page: page })}
                  className={cn(
                    "w-8 h-8 p-0",
                    pagination.currentPage === page &&
                      "bg-blue-500 text-white hover:bg-blue-600"
                  )}
                >
                  {page}
                </Button>
              )
            )}
          </div>

          <Button
            variant="outline"
            onClick={() => setFilters({ page: pagination.currentPage + 1 })}
            disabled={pagination.currentPage === pagination.totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Add modals at the end */}
      {/* <ItemDetailsModal
        item={selectedItem as InventoryItem}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <ItemCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      /> */}
    </div>
  );
}
