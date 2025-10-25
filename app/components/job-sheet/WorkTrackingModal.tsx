"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useJobSheetStore } from "@/store/jobSheet";
import { useBookingStore } from "@/store/booking";
import { useInventory } from "@/store/inventory";
import { useBillingStore } from "@/store/billing";
import {
  getInventoryRequirementsForServices,
  checkInventoryAvailability,
} from "@/utils/serviceInventoryMap";
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

interface WorkTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobSheetId: string;
  // onWorkCompleted?: () => void;
}

interface ServiceChecklistItem {
  serviceId: string;
  serviceName: string;
  completed: boolean;
  notes: string;
}

export const WorkTrackingModal: React.FC<WorkTrackingModalProps> = ({
  isOpen,
  onClose,
  jobSheetId,
  // onWorkCompleted,
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
  const { bookings, updateBooking } = useBookingStore();
  const { allItems, adjustStock } = useInventory();
  const { createInvoice } = useBillingStore();

  const jobSheet = jobSheets.find((js) => js.id === jobSheetId);
  const booking = bookings.find((b) => b._id === jobSheet?.bookingId);

  // State for pause/halt reasons
  const [pauseReason, setPauseReason] = useState("");
  const [haltReason, setHaltReason] = useState("");
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [showHaltDialog, setShowHaltDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);

  // Service checklist state
  const [serviceChecklist, setServiceChecklist] = useState<
    ServiceChecklistItem[]
  >([]);
  const [inventoryWarnings, setInventoryWarnings] = useState<string[]>([]);

  // Initialize service checklist when modal opens
  useEffect(() => {
    if (isOpen && jobSheet && booking) {
      const services = jobSheet.diagnosedServices || booking.services;
      const checklist = services.map((service) => ({
        serviceId: "id" in service ? service.id : service.serviceId._id,
        serviceName: service.name,
        completed: false,
        notes: "",
      }));
      setServiceChecklist(checklist);

      // Check inventory availability
      const serviceIds = services.map((s) =>
        "id" in s ? s.id : s.serviceId._id
      );
      const requiredItems = getInventoryRequirementsForServices(serviceIds);
      const availability = checkInventoryAvailability(requiredItems, allItems);

      if (!availability.available) {
        const warnings = availability.missingItems.map(
          (item) =>
            `Insufficient stock: ${item.itemName} (need ${
              item.quantity
            }, have ${
              allItems.find((i) => i.id === item.itemId)?.quantity || 0
            })`
        );
        setInventoryWarnings(warnings);
      } else {
        setInventoryWarnings([]);
      }
    }
  }, [isOpen, jobSheet, booking, allItems]);

  // Calculate total work duration
  const totalWorkDuration = jobSheet
    ? calculateWorkDuration(jobSheet.timeLogs)
    : 0;

  // Action handlers
  const handleStartWork = () => {
    if (jobSheet && !jobSheet.inventoryDeducted) {
      // Deduct inventory
      const serviceIds = (
        jobSheet.diagnosedServices ||
        booking?.services ||
        []
      ).map((s) => ("id" in s ? s.id : s.serviceId._id));
      const requiredItems = getInventoryRequirementsForServices(serviceIds);

      requiredItems.forEach((item) => {
        adjustStock({
          itemId: item.itemId,
          mode: "DECREASE",
          quantity: item.quantity,
          reason: "Job started",
          reference: jobSheet.id,
          performedBy: "system",
        });
      });
    }

    startJob(jobSheetId, "Starting work on job");
  };

  const handlePauseWork = () => {
    if (pauseReason.trim()) {
      pauseJob(jobSheetId, pauseReason);
      setPauseReason("");
      setShowPauseDialog(false);
    }
  };

  const handleResumeWork = () => {
    resumeJob(jobSheetId, "Resuming work");
    onClose(); // Close the modal after resuming
  };

  const handleHaltWork = () => {
    if (haltReason.trim()) {
      haltJob(jobSheetId, haltReason, "system");
      setHaltReason("");
      setShowHaltDialog(false);
    }
  };

  const handleCompleteWork = () => {
    const allServicesCompleted = serviceChecklist.every(
      (item) => item.completed
    );
    if (allServicesCompleted) {
      // Complete the job
      completeJob(jobSheetId, "All services completed");

      // Update booking status to completed
      if (booking) {
        updateBooking(booking._id, { status: "completed" });
      }

      // Generate invoice
      if (jobSheet && booking) {
        try {
          // Get services from diagnosed services or original booking services
          const services =
            jobSheet.diagnosedServices ||
            booking.services.map((s) => ({
              id: s.serviceId._id,
              name: s.name,
              description: s.description || s.name,
              duration: s.duration,
              price: s.price,
            }));

          // Calculate totals
          const subtotal = services.reduce(
            (sum, service) => sum + service.price,
            0
          );
          const serviceCharge = 15.0; // Fixed service charge
          const vatRate = 0.2; // 20% VAT
          const vat = (subtotal + serviceCharge) * vatRate;
          const totalAmount = subtotal + serviceCharge + vat;

          const invoice = createInvoice({
            jobSheetId: jobSheet.id,
            bookingId: booking._id,
            customer: {
              name: booking.customer.name,
              email: booking.customer.email,
              phone: booking.customer.phone,
            },
            vehicle: {
              make: booking.vehicle.make,
              model: booking.vehicle.model,
              year: booking.vehicle.year,
              license: booking.vehicle.license,
            },
            services,
            subtotal,
            serviceCharge,
            vat: vat,
            totalAmount,
            status: "DRAFT",
            notes: `Invoice for job ${jobSheet.id}`,
            createdBy: "system",
            createdAt: new Date().toISOString(),
          });

          console.log("Invoice generated:", invoice.invoiceNumber);
        } catch (error) {
          console.error("Failed to generate invoice:", error);
        }
      }

      setShowCompleteDialog(false);
      onClose();
    } else {
      alert("Please complete all services before finishing the job.");
    }
  };

  const toggleServiceCompleted = (serviceId: string) => {
    setServiceChecklist((prev) =>
      prev.map((item) =>
        item.serviceId === serviceId
          ? { ...item, completed: !item.completed }
          : item
      )
    );
  };

  const updateServiceNotes = (serviceId: string, notes: string) => {
    setServiceChecklist((prev) =>
      prev.map((item) =>
        item.serviceId === serviceId ? { ...item, notes } : item
      )
    );
  };

  const getStatusBadge = () => {
    if (!jobSheet) return null;

    const statusConfig = {
      PENDING: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
      IN_PROGRESS: {
        label: "In Progress",
        className: "bg-blue-100 text-blue-800",
      },
      PAUSED: { label: "Paused", className: "bg-orange-100 text-orange-800" },
      HALTED: { label: "Halted", className: "bg-red-100 text-red-800" },
      COMPLETED: {
        label: "Completed",
        className: "bg-green-100 text-green-800",
      },
      CANCELLED: { label: "Cancelled", className: "bg-gray-100 text-gray-800" },
    };

    const config = statusConfig[jobSheet.status] || statusConfig.PENDING;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  console.log(
    "WorkTrackingModal render - isOpen:",
    isOpen,
    "jobSheetId:",
    jobSheetId,
    "jobSheet:",
    jobSheet
  );

  if (!jobSheet || !booking) {
    return null;
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              Work Tracking - {jobSheet?.id}
            </DialogTitle>
          </DialogHeader>

          <div className="p-6 space-y-6">
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
                        Started: {new Date(jobSheet.startedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">
                        {booking.customer.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-gray-500" />
                      <span>
                        {booking.vehicle.make} {booking.vehicle.model} (
                        {booking.vehicle.license})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>
                        {new Date(booking.bookingDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span>Total: £{booking.totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Services: {serviceChecklist.length}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inventory Warnings */}
            {inventoryWarnings.length > 0 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-orange-800">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-medium">Inventory Warnings</span>
                  </div>
                  <ul className="mt-2 space-y-1">
                    {inventoryWarnings.map((warning, index) => (
                      <li key={index} className="text-sm text-orange-700">
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
                <h3 className="text-lg font-semibold">Service Checklist</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {serviceChecklist.map((item) => (
                    <div
                      key={item.serviceId}
                      className="flex items-start gap-3 p-3 border rounded-lg"
                    >
                      <button
                        onClick={() => toggleServiceCompleted(item.serviceId)}
                        className="mt-1"
                      >
                        {item.completed ? (
                          <CheckSquare className="w-5 h-5 text-green-600" />
                        ) : (
                          <EmptySquare className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-medium ${
                              item.completed ? "line-through text-gray-500" : ""
                            }`}
                          >
                            {item.serviceName}
                          </span>
                          {item.completed && (
                            <Badge className="bg-green-100 text-green-800">
                              Completed
                            </Badge>
                          )}
                        </div>
                        <textarea
                          placeholder="Add notes..."
                          value={item.notes}
                          onChange={(e) =>
                            updateServiceNotes(item.serviceId, e.target.value)
                          }
                          className="mt-2 w-full p-2 border rounded text-sm resize-none"
                          rows={2}
                        />
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
                  className="bg-green-600 hover:bg-green-700"
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
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    Pause Work
                  </Button>
                  <Button
                    onClick={() => setShowHaltDialog(true)}
                    variant="destructive"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Halt Work
                  </Button>
                  <Button
                    onClick={() => setShowCompleteDialog(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complete Job
                  </Button>
                </>
              )}

              {jobSheet.status === "PAUSED" && (
                <>
                  <Button
                    onClick={handleResumeWork}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Resume Work
                  </Button>
                  <Button
                    onClick={() => setShowHaltDialog(true)}
                    variant="destructive"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Halt Work
                  </Button>
                </>
              )}

              {jobSheet.status === "HALTED" && (
                <>
                  <Button
                    onClick={handleResumeWork}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Resume Work
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pause Work Dialog */}
      <Dialog open={showPauseDialog} onOpenChange={setShowPauseDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Pause Work</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="pause-reason">Reason for pausing:</Label>
              <Select value={pauseReason} onValueChange={setPauseReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="break">Break</SelectItem>
                  <SelectItem value="waiting-parts">
                    Waiting for parts
                  </SelectItem>
                  <SelectItem value="customer-consultation">
                    Customer consultation needed
                  </SelectItem>
                  <SelectItem value="technical-issue">
                    Technical issue
                  </SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowPauseDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handlePauseWork} disabled={!pauseReason}>
                Pause Work
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Halt Work Dialog */}
      <Dialog open={showHaltDialog} onOpenChange={setShowHaltDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Halt Work</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="halt-reason">Reason for halting:</Label>
              <Select value={haltReason} onValueChange={setHaltReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer-cancelled">
                    Customer cancelled
                  </SelectItem>
                  <SelectItem value="vehicle-issue">Vehicle issue</SelectItem>
                  <SelectItem value="safety-concern">Safety concern</SelectItem>
                  <SelectItem value="parts-unavailable">
                    Parts unavailable
                  </SelectItem>
                  <SelectItem value="technical-problem">
                    Technical problem
                  </SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowHaltDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleHaltWork}
                disabled={!haltReason}
                variant="destructive"
              >
                Halt Work
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Complete Work Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Job</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              Make sure all services are completed before finishing the job.
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowCompleteDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCompleteWork}
                className="bg-green-600 hover:bg-green-700"
              >
                Complete Job
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
