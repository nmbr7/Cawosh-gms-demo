"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Play,
  Pause,
  Square,
  CheckCircle,
  Clock,
  AlertTriangle,
  User,
  Car,
  Calendar,
  DollarSign,
  Wrench,
  CheckSquare,
  Square as EmptySquare,
} from "lucide-react";
import { useJobSheetStore } from "@/store/jobSheet";
import { useInvoiceStore } from "@/store/invoice";
import { useInventory } from "@/store/inventory";
import {
  getInventoryRequirementsForServices,
  checkInventoryAvailability,
} from "@/utils/serviceInventoryMap";
import { format } from "date-fns";
import { toast } from "sonner";

interface WorkTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobSheetId: string;
  onWorkCompleted?: () => void;
}

interface ServiceChecklistItem {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  completed: boolean;
  notes: string;
}

export const WorkTrackingModal: React.FC<WorkTrackingModalProps> = ({
  isOpen,
  onClose,
  jobSheetId,
  onWorkCompleted,
}) => {
  const {
    jobSheets,
    startJob,
    pauseJob,
    resumeJob,
    haltJob,
    completeJob,
    calculateWorkDuration,
  } = useJobSheetStore();
  const { createInvoiceFromJobSheet } = useInvoiceStore();
  const { allItems, adjustStock } = useInventory();

  const [pauseReason, setPauseReason] = useState("");
  const [haltReason, setHaltReason] = useState("");
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [showHaltDialog, setShowHaltDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [serviceChecklist, setServiceChecklist] = useState<
    ServiceChecklistItem[]
  >([]);
  const [inventoryWarnings, setInventoryWarnings] = useState<string[]>([]);

  const jobSheet = jobSheets.find((js) => js.id === jobSheetId);
  const booking = jobSheet?.booking;

  // Initialize service checklist when job sheet changes
  useEffect(() => {
    if (jobSheet && booking) {
      const services =
        jobSheet.diagnosedServices ||
        booking.services.map((s) => ({
          id: s.serviceId._id,
          name: s.name,
          description: s.description || s.name,
          duration: s.duration,
          price: s.price,
        }));

      setServiceChecklist(
        services.map((service) => ({
          id: service.id,
          name: service.name,
          description: service.description,
          duration: service.duration,
          price: service.price,
          completed: false,
          notes: "",
        }))
      );
    }
  }, [jobSheet, booking]);

  // Check inventory availability
  useEffect(() => {
    if (jobSheet && booking && !jobSheet.inventoryDeducted) {
      const services =
        jobSheet.diagnosedServices ||
        booking.services.map((s) => ({
          id: s.serviceId._id,
          name: s.name,
          description: s.description || s.name,
          duration: s.duration,
          price: s.price,
        }));

      const requiredItems = getInventoryRequirementsForServices(
        services.map((s) => s.id)
      );
      const availableInventory = allItems.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        name: item.name,
      }));

      const { available, missingItems } = checkInventoryAvailability(
        requiredItems,
        availableInventory
      );

      if (!available) {
        setInventoryWarnings(
          missingItems.map(
            (item) =>
              `${item.itemName}: ${item.quantity} ${item.unit} (Required but not available)`
          )
        );
      } else {
        setInventoryWarnings([]);
      }
    }
  }, [jobSheet, booking, allItems]);

  if (!jobSheet || !booking) {
    return null;
  }

  const totalWorkDuration = calculateWorkDuration(jobSheet.timeLogs);
  const estimatedDuration = serviceChecklist.reduce(
    (sum, service) => sum + service.duration,
    0
  );
  const completedServices = serviceChecklist.filter((s) => s.completed).length;
  const allServicesCompleted = completedServices === serviceChecklist.length;

  const handleStartWork = () => {
    try {
      if (!jobSheet) {
        toast.error("Job sheet not found!");
        return;
      }

      // Deduct inventory if not already deducted
      if (!jobSheet.inventoryDeducted) {
        const services =
          jobSheet.diagnosedServices ||
          booking.services.map((s) => ({
            id: s.serviceId._id,
            name: s.name,
            description: s.description || s.name,
            duration: s.duration,
            price: s.price,
          }));

        const requiredItems = getInventoryRequirementsForServices(
          services.map((s) => s.id)
        );

        // Deduct inventory for each required item
        requiredItems.forEach((item) => {
          const inventoryItem = allItems.find((i) => i.id === item.itemId);
          if (inventoryItem) {
            adjustStock({
              itemId: item.itemId,
              mode: "DECREASE",
              quantity: item.quantity,
              reason: `Job ${jobSheet.id} - ${item.itemName}`,
              reference: jobSheet.id,
              performedBy: "technician", // TODO: Get from auth context
            });
          }
        });
      }

      startJob(jobSheetId, "technician"); // TODO: Get actual technician ID
      toast.success("Work started successfully!");
    } catch (error) {
      console.error("Error starting work:", error);
      toast.error("Failed to start work. Please try again.");
    }
  };

  const handlePauseWork = () => {
    if (!pauseReason.trim()) {
      toast.error("Please provide a reason for pausing work.");
      return;
    }

    pauseJob(jobSheetId, "technician", pauseReason);
    setPauseReason("");
    setShowPauseDialog(false);
    toast.success("Work paused successfully!");
  };

  const handleResumeWork = () => {
    resumeJob(jobSheetId, "technician");
    toast.success("Work resumed successfully!");
  };

  const handleHaltWork = () => {
    if (!haltReason.trim()) {
      toast.error("Please provide a reason for halting work.");
      return;
    }

    haltJob(jobSheetId, "technician", haltReason);
    setHaltReason("");
    setShowHaltDialog(false);
    toast.success("Work halted successfully!");
  };

  const handleCompleteWork = async () => {
    if (!allServicesCompleted) {
      toast.error("Please complete all services before finishing the job.");
      return;
    }

    try {
      completeJob(jobSheetId, "technician");

      // Create invoice
      const invoice = createInvoiceFromJobSheet(jobSheet);
      toast.success(
        `Work completed! Invoice ${invoice.invoiceNumber} created.`
      );

      onWorkCompleted?.();
      onClose();
    } catch (error) {
      console.error("Error completing work:", error);
      toast.error("Failed to complete work. Please try again.");
    }
  };

  const toggleServiceCompleted = (serviceId: string) => {
    setServiceChecklist((prev) =>
      prev.map((service) =>
        service.id === serviceId
          ? { ...service, completed: !service.completed }
          : service
      )
    );
  };

  const updateServiceNotes = (serviceId: string, notes: string) => {
    setServiceChecklist((prev) =>
      prev.map((service) =>
        service.id === serviceId ? { ...service, notes } : service
      )
    );
  };

  const getStatusBadge = () => {
    switch (jobSheet.status) {
      case "PENDING":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            Not Started
          </Badge>
        );
      case "IN_PROGRESS":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700">
            In Progress
          </Badge>
        );
      case "PAUSED":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
            Paused
          </Badge>
        );
      case "HALTED":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700">
            Halted
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700">
            Completed
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Work Tracking - {jobSheet.id}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getStatusBadge()}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Elapsed: {formatDuration(totalWorkDuration)}</span>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {jobSheet.startedAt && (
                    <span>
                      Started:{" "}
                      {format(
                        new Date(jobSheet.startedAt),
                        "MMM dd, yyyy 'at' HH:mm"
                      )}
                    </span>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">{booking.customer.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-green-500" />
                    <span>
                      {booking.vehicle.make} {booking.vehicle.model} (
                      {booking.vehicle.year})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-500" />
                    <span>{booking.vehicle.license}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    <span>
                      Est. Duration: {formatDuration(estimatedDuration)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-blue-500" />
                    <span>
                      Services: {completedServices}/{serviceChecklist.length}{" "}
                      completed
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Warnings */}
          {inventoryWarnings.length > 0 && (
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-800">
                  <AlertTriangle className="w-5 h-5" />
                  Inventory Warnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {inventoryWarnings.map((warning, index) => (
                    <li key={index} className="text-sm text-amber-700">
                      • {warning}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Service Checklist */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5" />
                Service Checklist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {serviceChecklist.map((service) => (
                  <div key={service.id} className="border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleServiceCompleted(service.id)}
                        className="mt-1"
                      >
                        {service.completed ? (
                          <CheckSquare className="w-5 h-5 text-green-600" />
                        ) : (
                          <EmptySquare className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{service.name}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>{formatDuration(service.duration)}</span>
                            <span>£{service.price.toFixed(2)}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {service.description}
                        </p>
                        <div className="mt-2">
                          <Label
                            htmlFor={`notes-${service.id}`}
                            className="text-xs"
                          >
                            Notes:
                          </Label>
                          <textarea
                            id={`notes-${service.id}`}
                            value={service.notes}
                            onChange={(e) =>
                              updateServiceNotes(service.id, e.target.value)
                            }
                            placeholder="Add notes about this service..."
                            className="mt-1 text-sm w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 justify-center">
            {jobSheet.status === "PENDING" && (
              <Button
                onClick={handleStartWork}
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={inventoryWarnings.length > 0}
              >
                <Play className="w-4 h-4 mr-2" />
                Start Work
              </Button>
            )}

            {jobSheet.status === "IN_PROGRESS" && (
              <>
                <Button
                  onClick={() => setShowPauseDialog(true)}
                  variant="outline"
                  className="border-yellow-500 text-yellow-700 hover:bg-yellow-50"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Pause Work
                </Button>
                <Button
                  onClick={() => setShowHaltDialog(true)}
                  variant="outline"
                  className="border-red-500 text-red-700 hover:bg-red-50"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Halt Work
                </Button>
                <Button
                  onClick={() => setShowCompleteDialog(true)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={!allServicesCompleted}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete Work
                </Button>
              </>
            )}

            {jobSheet.status === "PAUSED" && (
              <>
                <Button
                  onClick={handleResumeWork}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Resume Work
                </Button>
                <Button
                  onClick={() => setShowHaltDialog(true)}
                  variant="outline"
                  className="border-red-500 text-red-700 hover:bg-red-50"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Halt Work
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Pause Dialog */}
        <Dialog open={showPauseDialog} onOpenChange={setShowPauseDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Pause Work</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="pause-reason">Reason for pausing:</Label>
                <textarea
                  id="pause-reason"
                  value={pauseReason}
                  onChange={(e) => setPauseReason(e.target.value)}
                  placeholder="Enter reason for pausing work..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowPauseDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handlePauseWork}>Pause Work</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Halt Dialog */}
        <Dialog open={showHaltDialog} onOpenChange={setShowHaltDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Halt Work</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="halt-reason">Reason for halting:</Label>
                <Select value={haltReason} onValueChange={setHaltReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="parts-unavailable">
                      Parts unavailable
                    </SelectItem>
                    <SelectItem value="customer-requested">
                      Customer requested stop
                    </SelectItem>
                    <SelectItem value="equipment-failure">
                      Equipment failure
                    </SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowHaltDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleHaltWork}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Halt Work
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Complete Dialog */}
        <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Complete Work</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Ready to complete!</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  All services have been completed. An invoice will be generated
                  automatically.
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCompleteDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCompleteWork}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Complete Work
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};
