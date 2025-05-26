import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Booking } from "@/app/models/booking";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface BookingDetailsModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BookingDetailsModal({
  booking,
  isOpen,
  onClose,
}: BookingDetailsModalProps) {
  if (!booking) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Booking Details - {booking.id}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
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
                    {booking.customer.notes}
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
                    {booking.car.make} {booking.car.model}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Year
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {booking.car.year}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Registration
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {booking.car.registrationNumber || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* Service Information */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-gray-900">
                Service Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Service
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {booking.serviceName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Bay
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    Bay {booking.bay}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Date
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {format(new Date(booking.date), "MMM dd, yyyy")}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Time
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {booking.startTime} - {booking.endTime}
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
                        booking.status === "ongoing" &&
                          "bg-amber-100 text-amber-800",
                        booking.status === "scheduled" &&
                          "bg-blue-100 text-blue-800",
                        booking.status === "blocked" &&
                          "bg-red-100 text-red-800",
                        booking.status === "break" &&
                          "bg-gray-100 text-gray-800"
                      )}
                    >
                      {booking.status}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
