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
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  isActive: boolean;
}

interface ServiceListProps {
  services: Service[];
  onServiceUpdate: (service: Service) => void;
  onServiceDelete: (serviceId: string) => void;
  onServiceAdd: (service: Omit<Service, "id">) => void;
}

export type { Service };

export function ServiceList({
  services,
  onServiceUpdate,
  onServiceDelete,
  onServiceAdd,
}: ServiceListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newService, setNewService] = useState<Omit<Service, "id">>({
    name: "",
    description: "",
    duration: 60,
    price: 0,
    category: "maintenance",
    isActive: true,
  });

  const handleAddService = () => {
    if (!newService.name || !newService.description) {
      toast.error("Please fill in all required fields");
      return;
    }
    onServiceAdd(newService);
    setNewService({
      name: "",
      description: "",
      duration: 60,
      price: 0,
      category: "maintenance",
      isActive: true,
    });
    setIsAdding(false);
    toast.success("Service added successfully");
  };

  const handleUpdateService = (service: Service) => {
    onServiceUpdate(service);
    setEditingId(null);
    toast.success("Service updated successfully");
  };

  const handleDeleteService = (serviceId: string) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      onServiceDelete(serviceId);
      toast.success("Service deleted successfully");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <CardTitle>Service List</CardTitle>
            <CardDescription>Manage your available services</CardDescription>
          </div>
          <Button onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Service
          </Button>
        </div>
      </CardHeader>
      <CardContent>
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
                    setNewService({ ...newService, category: e.target.value })
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
                  value={newService.price}
                  onChange={(e) =>
                    setNewService({
                      ...newService,
                      price: parseFloat(e.target.value) || 0,
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
              <Button variant="outline" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddService}>Save Service</Button>
            </div>
          </div>
        )}

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
            {services.map((service) => (
              <TableRow key={service.id}>
                <TableCell>
                  {editingId === service.id ? (
                    <Input
                      value={service.name}
                      onChange={(e) =>
                        handleUpdateService({
                          ...service,
                          name: e.target.value,
                        })
                      }
                    />
                  ) : (
                    service.name
                  )}
                </TableCell>
                <TableCell>{service.category}</TableCell>
                <TableCell>{service.duration} min</TableCell>
                <TableCell>${service.price}</TableCell>
                <TableCell>
                  <Switch
                    checked={service.isActive}
                    onCheckedChange={(checked) =>
                      handleUpdateService({
                        ...service,
                        isActive: checked,
                      })
                    }
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingId(service.id)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteService(service.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
