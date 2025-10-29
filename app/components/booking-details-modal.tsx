import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Booking } from "@/types/booking";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { BookingDetailsShimmer } from "./BookingDetailsShimmer";
import { useBookingStore } from "@/store/booking";

interface BookingDetailsModalProps {
  bookingId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

// Helper function to safely format dates
const safeFormatDate = (
  dateString: string | undefined,
  formatString: string
): string => {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";
    return format(date, formatString);
  } catch {
    return "Invalid date";
  }
};

// Helper function to safely get technician name
const getTechnicianName = (technicianId: unknown): string => {
  if (!technicianId) return "Not assigned";

  if (typeof technicianId === "string") {
    return technicianId;
  }

  if (typeof technicianId === "object" && technicianId !== null) {
    const tech = technicianId as Record<string, unknown>;

    if (tech.firstName && tech.lastName) {
      return `${tech.firstName} ${tech.lastName}`;
    }
    if (tech.name) {
      return String(tech.name);
    }
    if (tech._id) {
      return String(tech._id);
    }
  }

  return "Not assigned";
};

export function BookingDetailsModal({
  bookingId,
  isOpen,
  onClose,
}: BookingDetailsModalProps) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get bookings from store
  const bookings = useBookingStore((state) => state.bookings);

  // Fetch booking details when modal opens
  useEffect(() => {
    if (isOpen && bookingId) {
      fetchBookingDetails();
    } else {
      // Reset state when modal closes
      setBooking(null);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, bookingId, bookings]);

  const fetchBookingDetails = async () => {
    if (!bookingId) return;

    setLoading(true);
    setError(null);

    try {
      // Find booking in store
      const foundBooking = bookings.find((b) => b._id === bookingId);

      if (foundBooking) {
        setBooking(foundBooking);
      } else {
        throw new Error("Booking not found");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch booking details";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {loading
              ? "Loading..."
              : `Booking Details - ${
                  booking?.bookingId || booking?._id || bookingId
                }`}
          </DialogTitle>
          <DialogDescription>
            View detailed information about this booking
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          {loading ? (
            <BookingDetailsShimmer />
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                  onClick={fetchBookingDetails}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : booking ? (
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-gray-900">
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Name
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {booking.customer.name}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Email
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {booking.customer.email}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Phone
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {booking.customer.phone}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Notes
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {booking.notes || "No notes"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* Vehicle Information */}
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-gray-900">
                  Vehicle Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Make & Model
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {booking.vehicle.make} {booking.vehicle.model}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Year
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {booking.vehicle.year}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      License Plate
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {booking.vehicle.license || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      VIN
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {booking.vehicle.vin || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* Services Information */}
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-gray-900">
                  Services ({booking.services.length})
                </h3>
                <div className="space-y-4">
                  {booking.services.map((service, index) => (
                    <div
                      key={service._id || index}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-sm font-medium text-gray-900">
                          {service.name}
                        </h4>
                        <span
                          className={cn(
                            "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                            service.status === "completed" &&
                              "bg-green-100 text-green-800",
                            service.status === "in_progress" &&
                              "bg-amber-100 text-amber-800",
                            service.status === "pending" &&
                              "bg-yellow-100 text-yellow-800",
                            service.status === "cancelled" &&
                              "bg-red-100 text-red-800"
                          )}
                        >
                          {service.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <label className="block text-xs font-medium text-gray-500">
                            Service
                          </label>
                          <p className="mt-1 text-gray-900">
                            {service.serviceId?.name}
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500">
                            Category
                          </label>
                          <p className="mt-1 text-gray-900">
                            {service.serviceId?.category}
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500">
                            Description
                          </label>
                          <p className="mt-1 text-gray-900">
                            {service.description ||
                              service.serviceId?.description ||
                              "No description"}
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500">
                            Duration
                          </label>
                          <p className="mt-1 text-gray-900">
                            {service.duration} minutes
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500">
                            Price
                          </label>
                          <p className="mt-1 text-gray-900">
                            {service.currencySymbol}
                            {service.price}
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500">
                            Time
                          </label>
                          <p className="mt-1 text-gray-900">
                            {safeFormatDate(
                              service.startTime,
                              "MMM dd, yyyy HH:mm"
                            )}{" "}
                            -{" "}
                            {safeFormatDate(
                              service.endTime,
                              "MMM dd, yyyy HH:mm"
                            )}
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500">
                            Bay
                          </label>
                          <p className="mt-1 text-gray-900">
                            {(() => {
                              // Try to find bay name from garage bays
                              if (
                                booking.garage_id &&
                                typeof booking.garage_id === "object" &&
                                "bays" in booking.garage_id
                              ) {
                                const garage = booking.garage_id as {
                                  bays?: Array<{ _id: string; name: string }>;
                                };
                                const bay = garage.bays?.find(
                                  (b) => b._id === service.bayId
                                );
                                return bay ? bay.name : service.bayId;
                              }
                              return service.bayId;
                            })()}
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500">
                            Technician
                          </label>
                          <p className="mt-1 text-gray-900">
                            {getTechnicianName(service.technicianId)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* Booking Information */}
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-gray-900">
                  Booking Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Booking Date
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {safeFormatDate(booking.bookingDate, "MMM dd, yyyy")}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Total Duration
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {booking.totalDuration} minutes
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Total Price
                    </label>
                    <p className="mt-1 text-sm text-gray-900 font-medium">
                      {booking.services[0]?.currencySymbol}
                      {booking.totalPrice}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Status
                    </label>
                    <p className="mt-1">
                      <span
                        className={cn(
                          "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                          booking.status === "completed" &&
                            "bg-green-100 text-green-800",
                          booking.status === "in_progress" &&
                            "bg-amber-100 text-amber-800",
                          booking.status === "confirmed" &&
                            "bg-blue-100 text-blue-800",
                          booking.status === "pending" &&
                            "bg-yellow-100 text-yellow-800",
                          booking.status === "cancelled" &&
                            "bg-red-100 text-red-800"
                        )}
                      >
                        {booking.status}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Inventory Used */}
              {booking.inventoryUsage && booking.inventoryUsage.length > 0 && (
                <>
                  <div className="border-t border-gray-100" />
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-gray-900">
                      Inventory Used
                    </h3>
                    <div className="space-y-2">
                      {booking.inventoryUsage.map((u) => (
                        <div
                          key={u.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-md text-sm"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {u.itemName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(u.createdAt).toLocaleString()}{" "}
                              {u.jobSheetId && `• Job ${u.jobSheetId}`}
                            </div>
                          </div>
                          <div className="text-right text-gray-900 font-medium min-w-[120px]">
                            {u.quantity} {u.unit || ""}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* History */}
              {booking.history && booking.history.length > 0 && (
                <>
                  <div className="border-t border-gray-100" />
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-gray-900">
                      History
                    </h3>
                    <div className="space-y-2">
                      {booking.history.map((entry, index) => (
                        <div
                          key={entry._id || index}
                          className="flex items-start space-x-3 p-3 bg-gray-50 rounded-md"
                        >
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span
                                className={cn(
                                  "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                                  entry.status === "completed" &&
                                    "bg-green-100 text-green-800",
                                  entry.status === "in-progress" &&
                                    "bg-amber-100 text-amber-800",
                                  entry.status === "confirmed" &&
                                    "bg-blue-100 text-blue-800",
                                  entry.status === "pending" &&
                                    "bg-yellow-100 text-yellow-800",
                                  entry.status === "cancelled" &&
                                    "bg-red-100 text-red-800"
                                )}
                              >
                                {entry.status}
                              </span>
                              <span className="text-xs text-gray-500">
                                {safeFormatDate(
                                  entry.changedAt,
                                  "MMM dd, yyyy HH:mm"
                                )}
                              </span>
                            </div>
                            <div className="mt-2 flex items-center space-x-2">
                              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium text-blue-600">
                                  {entry.changedBy?.firstName?.charAt(0) || "U"}
                                  {entry.changedBy?.lastName?.charAt(0) || "N"}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {entry.changedBy?.firstName || "Unknown"}{" "}
                                  {entry.changedBy?.lastName || "User"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {entry.changedBy?.email || "No email"}
                                </p>
                              </div>
                            </div>
                            {entry.notes && (
                              <p className="text-xs text-gray-600 mt-2 pl-8">
                                <span className="font-medium">Notes:</span>{" "}
                                {entry.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
