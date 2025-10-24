import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Trash2,
  Wrench,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useJobSheetStore } from "@/store/jobSheet";
import { useBookingStore } from "@/store/booking";
import { toast } from "sonner";
import type { JobSheet } from "@/store/jobSheet";

interface DiagnosedService {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
}

interface DiagnosisPanelProps {
  jobSheet: JobSheet;
  onDiagnosisComplete: () => void;
}

export function DiagnosisPanel({
  jobSheet,
  onDiagnosisComplete,
}: DiagnosisPanelProps) {
  const [diagnosedServices, setDiagnosedServices] = useState<
    DiagnosedService[]
  >([]);
  const [diagnosisNotes, setDiagnosisNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddService, setShowAddService] = useState(false);
  const [newService, setNewService] = useState({
    name: "",
    description: "",
    duration: 30,
    price: 0,
  });

  const jobSheetStore = useJobSheetStore();
  const bookingStore = useBookingStore();
  const booking = jobSheet.booking;

  // Get available services from booking store
  const availableServices = useBookingStore((state) => state.services);

  const addService = () => {
    if (!newService.name.trim() || newService.price <= 0) {
      toast.error("Please provide service name and valid price");
      return;
    }

    const service: DiagnosedService = {
      id: `service-${Date.now()}`,
      name: newService.name,
      description: newService.description,
      duration: newService.duration,
      price: newService.price,
    };

    setDiagnosedServices([...diagnosedServices, service]);
    setNewService({ name: "", description: "", duration: 30, price: 0 });
    setShowAddService(false);
    toast.success("Service added to diagnosis");
  };

  const removeService = (serviceId: string) => {
    setDiagnosedServices(diagnosedServices.filter((s) => s.id !== serviceId));
  };

  const submitDiagnosis = async () => {
    if (diagnosedServices.length === 0) {
      toast.error("Please add at least one service");
      return;
    }

    if (!diagnosisNotes.trim()) {
      toast.error("Please provide diagnosis notes");
      return;
    }

    try {
      setIsSubmitting(true);

      // Add diagnosed services to job sheet
      jobSheetStore.addDiagnosedServices(
        jobSheet.id,
        diagnosedServices.map((service) => ({
          ...service,
          addedBy: "current-technician", // This would come from auth context
        }))
      );

      toast.success("Diagnosis submitted for approval");
      onDiagnosisComplete();
    } catch (error) {
      console.error("Error submitting diagnosis:", error);
      toast.error("Failed to submit diagnosis");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPrice = diagnosedServices.reduce(
    (acc, service) => acc + service.price,
    0
  );
  const totalDuration = diagnosedServices.reduce(
    (acc, service) => acc + service.duration,
    0
  );

  const getStatusInfo = () => {
    if (jobSheet.approvalStatus === "approved") {
      return {
        icon: CheckCircle,
        text: "Work Order Approved",
        className: "text-green-600 bg-green-50 border-green-200",
      };
    }
    if (jobSheet.approvalStatus === "rejected") {
      return {
        icon: AlertCircle,
        text: "Work Order Rejected",
        className: "text-red-600 bg-red-50 border-red-200",
      };
    }
    if (diagnosedServices.length > 0) {
      return {
        icon: Clock,
        text: "Pending Approval",
        className: "text-amber-600 bg-amber-50 border-amber-200",
      };
    }
    return {
      icon: Wrench,
      text: "Diagnosis Required",
      className: "text-blue-600 bg-blue-50 border-blue-200",
    };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StatusIcon className="h-5 w-5" />
          Diagnosis Panel
        </CardTitle>
        <div
          className={cn(
            "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border",
            statusInfo.className
          )}
        >
          <StatusIcon className="h-4 w-4" />
          {statusInfo.text}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Customer and Vehicle Info */}
        {booking && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Customer</h4>
              <p className="text-sm text-gray-600">{booking.customer.name}</p>
              <p className="text-sm text-gray-600">{booking.customer.phone}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Vehicle</h4>
              <p className="text-sm text-gray-600">
                {booking.vehicle.make} {booking.vehicle.model} (
                {booking.vehicle.year})
              </p>
              <p className="text-sm text-gray-600">
                License: {booking.vehicle.license}
              </p>
            </div>
          </div>
        )}

        {/* Original Issue */}
        {booking?.diagnosisNotes && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">
              Original Issue Description
            </h4>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">{booking.diagnosisNotes}</p>
            </div>
          </div>
        )}

        {/* Diagnosed Services */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Diagnosed Services</h4>
            {jobSheet.approvalStatus !== "approved" &&
              jobSheet.approvalStatus !== "rejected" && (
                <Dialog open={showAddService} onOpenChange={setShowAddService}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Service
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Diagnosed Service</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="service-name">Service Name</Label>
                        <Input
                          id="service-name"
                          value={newService.name}
                          onChange={(e) =>
                            setNewService({
                              ...newService,
                              name: e.target.value,
                            })
                          }
                          placeholder="e.g., Brake Pad Replacement"
                        />
                      </div>
                      <div>
                        <Label htmlFor="service-description">Description</Label>
                        <textarea
                          id="service-description"
                          value={newService.description}
                          onChange={(
                            e: React.ChangeEvent<HTMLTextAreaElement>
                          ) =>
                            setNewService({
                              ...newService,
                              description: e.target.value,
                            })
                          }
                          placeholder="Detailed description of the service needed..."
                          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="service-duration">
                            Duration (minutes)
                          </Label>
                          <Input
                            id="service-duration"
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
                        <div>
                          <Label htmlFor="service-price">Price (£)</Label>
                          <Input
                            id="service-price"
                            type="number"
                            step="0.01"
                            value={newService.price}
                            onChange={(e) =>
                              setNewService({
                                ...newService,
                                price: parseFloat(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={addService} className="flex-1">
                          Add Service
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowAddService(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
          </div>

          {diagnosedServices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Wrench className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No services diagnosed yet</p>
              <p className="text-sm">Add services based on your diagnosis</p>
            </div>
          ) : (
            <div className="space-y-3">
              {diagnosedServices.map((service) => (
                <div
                  key={service.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h5 className="font-medium text-gray-900">
                        {service.name}
                      </h5>
                      <p className="text-sm text-gray-600">
                        {service.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-green-600 border-green-200"
                      >
                        £{service.price.toFixed(2)}
                      </Badge>
                      {jobSheet.approvalStatus !== "approved" &&
                        jobSheet.approvalStatus !== "rejected" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeService(service.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Duration: {service.duration} minutes</span>
                    <span>Added: {new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Diagnosis Notes */}
        {jobSheet.approvalStatus !== "approved" &&
          jobSheet.approvalStatus !== "rejected" && (
            <div>
              <Label htmlFor="diagnosis-notes">Diagnosis Notes</Label>
              <textarea
                id="diagnosis-notes"
                value={diagnosisNotes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setDiagnosisNotes(e.target.value)
                }
                placeholder="Describe your findings and recommended services..."
                className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                rows={4}
              />
            </div>
          )}

        {/* Price Summary */}
        {diagnosedServices.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Price Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Services ({diagnosedServices.length})</span>
                <span>£{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total Duration</span>
                <span>{totalDuration} minutes</span>
              </div>
              <div className="border-t border-gray-300 pt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>£{totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        {jobSheet.approvalStatus !== "approved" &&
          jobSheet.approvalStatus !== "rejected" && (
            <div className="flex justify-end">
              <Button
                onClick={submitDiagnosis}
                disabled={
                  isSubmitting ||
                  diagnosedServices.length === 0 ||
                  !diagnosisNotes.trim()
                }
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting
                  ? "Submitting..."
                  : "Submit Diagnosis for Approval"}
              </Button>
            </div>
          )}

        {/* Approval Status Messages */}
        {jobSheet.approvalStatus === "approved" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Work Order Approved</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              You can now proceed with the approved services.
            </p>
          </div>
        )}

        {jobSheet.approvalStatus === "rejected" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Work Order Rejected</span>
            </div>
            <p className="text-sm text-red-700 mt-1">
              Please review the feedback and update your diagnosis.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
