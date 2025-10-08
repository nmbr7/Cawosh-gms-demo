import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, ChevronLeft, ChevronRight, Eye, Wrench } from "lucide-react";
import { toast } from "sonner";
import { ServiceModal } from "./ServiceModal";
import ServiceListSkeleton from "./ServiceListSkeleton";
import type { Service } from "@/app/models/service";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

interface ServiceListProps {
  services: Service[];
  onServiceUpdate: (
    service: Omit<Service, "serviceId"> & { serviceId: string }
  ) => void;
  onServiceDelete: (serviceId: string) => void;
  onServiceAdd: (service: Omit<Service, "serviceId">) => void;
  loading?: boolean;
  garageId: string;
}

export function ServiceList({
  services,
  onServiceUpdate,
  onServiceAdd,
  loading = false,
  garageId,
}: ServiceListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [newService, setNewService] = useState<Omit<Service, "serviceId">>({
    name: "",
    description: "",
    currency: "GBP",
    currencySymbol: "£",
    duration: 60,
    defaultPrice: 0,
    customPrice: 0,
    category: "maintenance",
    isActive: true,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit" | "add">("view");
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Calculate pagination
  const totalPages = Math.ceil(services.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentServices = services.slice(startIndex, endIndex);

  const handleAddService = async () => {
    if (!newService.name || !newService.description) {
      toast.error("Please fill in all required fields");
      return;
    }
    const response = await fetchWithAuth(`/api/garages/${garageId}/services`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newService),
    });

    if (response.ok) {
      const data = await response.json();
      onServiceAdd(data);
      setNewService({
        name: "",
        description: "",
        duration: 60,
        currency: "GBP",
        currencySymbol: "£",
        defaultPrice: 0,
        customPrice: 0,
        category: "maintenance",
        isActive: true,
      });
      setIsAdding(false);
      toast.success("Service added successfully");
    } else {
      toast.error("Failed to add service");
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <CardTitle className="text-2xl">Service List</CardTitle>
              <CardDescription>Manage your available services</CardDescription>
            </div>
          </div>
        </CardHeader>
        <hr />
        <CardContent>
          {loading ? (
            <ServiceListSkeleton />
          ) : (
            <>
              {isAdding && (
                <div className="mb-6 p-4 border rounded-lg space-y-4">
                  <h3 className="font-medium">Add New Service</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Service Name</Label>
                      <Input
                        value={newService.name}
                        onChange={(e) =>
                          setNewService({ ...newService, name: e.target.value })
                        }
                        placeholder="Enter service name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Input
                        value={newService.category}
                        onChange={(e) =>
                          setNewService({
                            ...newService,
                            category: e.target.value,
                          })
                        }
                        placeholder="Enter category"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Duration (minutes)</Label>
                      <Input
                        type="number"
                        value={newService.duration}
                        onChange={(e) =>
                          setNewService({
                            ...newService,
                            duration: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Price</Label>
                      <Input
                        type="number"
                        value={newService.customPrice}
                        onChange={(e) =>
                          setNewService({
                            ...newService,
                            customPrice: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Description</Label>
                      <Input
                        value={newService.description}
                        onChange={(e) =>
                          setNewService({
                            ...newService,
                            description: e.target.value,
                          })
                        }
                        placeholder="Enter service description"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsAdding(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddService}>Save Service</Button>
                  </div>
                </div>
              )}

              {services.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-gray-100 p-3 mb-4">
                    <Wrench className="h-6 w-6 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Services Found
                  </h3>
                  <p className="text-gray-500 max-w-sm">
                    There are no services available for this garage. Please
                    contact your administrator to add services.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentServices.map((service) => (
                      <TableRow key={service.serviceId}>
                        <TableCell>{service.name}</TableCell>
                        <TableCell>
                          <span className="px-3 py-1 rounded-lg text-xs  bg-gray-100 text-gray-800">
                            {service.category || "Uncategorized"}
                          </span>
                        </TableCell>
                        <TableCell>{service.duration || 60} min</TableCell>
                        <TableCell>
                          <div className="flex items-baseline gap-1">
                            <span className="text-xs font-medium">
                              {service.currencySymbol || "£"}
                            </span>
                            <span className="text-md ">
                              {service.customPrice || service.defaultPrice || 0}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold
                              ${
                                service.isActive
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-200 text-gray-500"
                              }
                            `}
                          >
                            {service.isActive ? "Active" : "Disabled"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setModalMode("view");
                                setSelectedService(service);
                                setModalOpen(true);
                              }}
                              aria-label="View Service"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setModalMode("edit");
                                setSelectedService(service);
                                setModalOpen(true);
                              }}
                              aria-label="Edit Service"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </>
          )}
        </CardContent>
      </Card>
      {/* Pagination Widget Below Card */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-500">
          Showing {startIndex + 1} to {Math.min(endIndex, services.length)} of{" "}
          {services.length} services
        </div>
        <div className="flex items-center space-x-1">
          <button
            className={`w-8 h-8 flex items-center justify-center rounded-lg border bg-white text-gray-500 disabled:opacity-50`}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            aria-label="Previous page"
            type="button"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`w-8 h-8 flex items-center justify-center rounded-lg border text-sm font-medium transition-colors
                ${
                  currentPage === page
                    ? "bg-blue-600 text-white"
                    : "bg-white text-black hover:bg-blue-50"
                }
              `}
              onClick={() => setCurrentPage(page)}
              type="button"
            >
              {page}
            </button>
          ))}
          <button
            className={`w-8 h-8 flex items-center justify-center rounded-lg border bg-white text-gray-500 disabled:opacity-50`}
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            aria-label="Next page"
            type="button"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      {/* Service Modal */}
      <ServiceModal
        open={modalOpen}
        mode={modalMode}
        service={selectedService}
        onClose={() => setModalOpen(false)}
        onSave={(data, id) => {
          if (modalMode === "add") onServiceAdd(data);
          else if (modalMode === "edit" && id)
            onServiceUpdate({ ...data, serviceId: id });
        }}
      />
    </>
  );
}
