import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Booking } from "@/app/models/booking";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface BookingDetailsModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BookingDetailsModal({ booking, isOpen, onClose }: BookingDetailsModalProps) {
  if (!booking) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex flex-col gap-2">
            <span className="text-xl font-semibold">Booking Details</span>
            <span className={cn(
              "w-fit px-3 py-1 text-sm font-medium rounded-full",
              booking.status === 'completed' && "bg-green-100 text-green-800",
              booking.status === 'ongoing' && "bg-amber-100 text-amber-800",
              booking.status === 'scheduled' && "bg-blue-100 text-blue-800",
              booking.status === 'blocked' && "bg-red-100 text-red-800",
              booking.status === 'break' && "bg-gray-100 text-gray-800"
            )}>
              {booking.status}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-gray-900">Customer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Name</label>
                  <p className="mt-1 text-sm text-gray-900">{booking.customerName}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* Service Information */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-gray-900">Service Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Service</label>
                  <p className="mt-1 text-sm text-gray-900">{booking.description}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Bay</label>
                  <p className="mt-1 text-sm text-gray-900">Bay {booking.bay}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Date</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {format(new Date(booking.date), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Time</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {booking.startTime} - {booking.endTime}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* Vehicle Information */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-gray-900">Vehicle Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Make & Model</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {booking.car.make} {booking.car.model} ({booking.car.year})
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Registration</label>
                  <p className="mt-1 text-sm text-gray-900">{booking.car.registrationNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Type</label>
                  <p className="mt-1 text-sm text-gray-900 capitalize">{booking.car.vehicleType}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Color</label>
                  <p className="mt-1 text-sm text-gray-900">{booking.car.color}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* Technical Details */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-gray-900">Technical Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Engine</label>
                  <p className="mt-1 text-sm text-gray-900">{booking.car.engineSize}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Transmission</label>
                  <p className="mt-1 text-sm text-gray-900 capitalize">{booking.car.transmission}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Fuel Type</label>
                  <p className="mt-1 text-sm text-gray-900 capitalize">{booking.car.fuelType}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Mileage</label>
                  <p className="mt-1 text-sm text-gray-900">{booking.car.mileage?.toLocaleString()} km</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 mt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 