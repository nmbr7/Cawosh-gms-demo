import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Check, X, User, Car, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useJobSheetStore } from "@/store/jobSheet";
import { useBookingStore } from "@/store/booking";
import { toast } from "sonner";
import type { JobSheet } from "@/store/jobSheet";

interface ApprovalDetailsModalProps {
  jobSheet: JobSheet;
  isOpen: boolean;
  onClose: () => void;
  onApprovalChange: () => void;
}

export function ApprovalDetailsModal({
  jobSheet,
  isOpen,
  onClose,
  onApprovalChange,
}: ApprovalDetailsModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const jobSheetStore = useJobSheetStore();
  const bookingStore = useBookingStore();

  const booking = jobSheet.booking;
  const diagnosedServices = jobSheet.diagnosedServices || [];

  const totalPrice = diagnosedServices.reduce(
    (acc, service) => acc + service.price,
    0
  );
  const totalDuration = diagnosedServices.reduce(
    (acc, service) => acc + service.duration,
    0
  );

  const handleApprove = async () => {
    try {
      setIsLoading(true);

      // Update job sheet approval status
      jobSheetStore.setApprovalStatus(jobSheet.id, "approved", "current-user");

      // Update the original booking with the diagnosed services
      if (booking) {
        const servicesToUpdate = diagnosedServices.map((service) => ({
          serviceId: service.id,
          name: service.name,
          description: service.description,
          duration: service.duration,
          price: service.price,
        }));

        bookingStore.updateBookingServices(booking._id, servicesToUpdate);
      }

      toast.success("Work order approved successfully!");
      onApprovalChange();
      onClose();
    } catch (error) {
      console.error("Error approving work order:", error);
      toast.error("Failed to approve work order");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      setIsLoading(true);

      // Update job sheet approval status
      jobSheetStore.setApprovalStatus(jobSheet.id, "rejected", "current-user");

      toast.success("Work order rejected");
      onApprovalChange();
      onClose();
    } catch (error) {
      console.error("Error rejecting work order:", error);
      toast.error("Failed to reject work order");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string | undefined) => {
    const statusMap = {
      pending: {
        label: "Pending Approval",
        className: "bg-amber-100 text-amber-800",
      },
      approved: { label: "Approved", className: "bg-green-100 text-green-800" },
      rejected: { label: "Rejected", className: "bg-red-100 text-red-800" },
    };

    const statusInfo =
      statusMap[status as keyof typeof statusMap] || statusMap.pending;

    return (
      <Badge
        className={cn("px-2 py-1 text-xs font-medium", statusInfo.className)}
      >
        {statusInfo.label}
      </Badge>
    );
  };

  const getTechnicianName = (technicianId: string) => {
    // This would normally come from a technicians store or API
    const technicianMap: Record<string, string> = {
      "tech-1": "John Smith",
      "tech-2": "Sarah Johnson",
      "tech-3": "Mike Davis",
      "tech-4": "Lisa Wilson",
    };
    return technicianMap[technicianId] || "Unknown Technician";
  };

  if (!booking) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Work Order Approval - {jobSheet.id}
          </DialogTitle>
          <DialogDescription>
            Review diagnosed services and approve or reject this work order
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Status and Actions Header */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-4">
              {getStatusBadge(jobSheet.approvalStatus)}
              <div className="text-sm text-gray-600">
                Diagnosed by{" "}
                {getTechnicianName(diagnosedServices[0]?.addedBy || "")} on{" "}
                {diagnosedServices[0]?.addedAt &&
                  format(
                    new Date(diagnosedServices[0].addedAt),
                    "MMM dd, yyyy 'at' HH:mm"
                  )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRejectForm(!showRejectForm)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4 mr-1" />
                Reject
              </Button>
              <Button
                size="sm"
                onClick={handleApprove}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-1" />
                Approve
              </Button>
            </div>
          </div>

          {/* Reject Form */}
          {showRejectForm && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <Label
                htmlFor="reject-reason"
                className="text-red-800 font-medium"
              >
                Reason for Rejection
              </Label>
              <textarea
                id="reject-reason"
                value={rejectReason}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setRejectReason(e.target.value)
                }
                placeholder="Please provide a reason for rejecting this work order..."
                className="mt-2 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                rows={3}
              />
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  onClick={handleReject}
                  disabled={isLoading || !rejectReason.trim()}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Confirm Rejection
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowRejectForm(false);
                    setRejectReason("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Customer and Vehicle Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </h3>
              <div className="space-y-2">
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Name
                  </Label>
                  <p className="text-sm text-gray-900">
                    {booking.customer.name}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Email
                  </Label>
                  <p className="text-sm text-gray-900">
                    {booking.customer.email}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Phone
                  </Label>
                  <p className="text-sm text-gray-900">
                    {booking.customer.phone}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Car className="h-5 w-5" />
                Vehicle Information
              </h3>
              <div className="space-y-2">
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Make & Model
                  </Label>
                  <p className="text-sm text-gray-900">
                    {booking.vehicle.make} {booking.vehicle.model}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Year
                  </Label>
                  <p className="text-sm text-gray-900">
                    {booking.vehicle.year}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    License Plate
                  </Label>
                  <p className="text-sm text-gray-900">
                    {booking.vehicle.license}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Original Issue Description */}
          {booking.diagnosisNotes && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
                Original Issue Description
              </h3>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  {booking.diagnosisNotes}
                </p>
              </div>
            </div>
          )}

          {/* Diagnosed Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Diagnosed Services</h3>
            <div className="space-y-3">
              {diagnosedServices.map((service) => (
                <div
                  key={service.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">
                      {service.name}
                    </h4>
                    <Badge
                      variant="outline"
                      className="text-green-600 border-green-200"
                    >
                      £{service.price.toFixed(2)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {service.description}
                  </p>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Duration: {service.duration} minutes</span>
                    <span>
                      Added:{" "}
                      {format(new Date(service.addedAt), "MMM dd, HH:mm")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Price Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Services ({diagnosedServices.length})</span>
                <span>£{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Estimated Duration</span>
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

          {/* Approval Notes */}
          <div className="space-y-2">
            <Label htmlFor="approval-notes">Approval Notes (Optional)</Label>
            <textarea
              id="approval-notes"
              value={approvalNotes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setApprovalNotes(e.target.value)
              }
              placeholder="Add any notes for the technician or customer..."
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              rows={3}
            />
          </div>

          {/* Future API Integration Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">
              Future Customer Approval
            </h4>
            <p className="text-sm text-blue-800 mb-3">
              In the future, approved work orders will be automatically sent to
              customers via SMS/email for approval through the mobile app.
            </p>
            <Button
              variant="outline"
              size="sm"
              disabled
              className="text-blue-600 border-blue-300"
            >
              Send to Customer for Approval (Coming Soon)
            </Button>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
