import React from "react";
import type { Booking } from "@/store/booking";

interface BookedSlotCardProps {
  booking: Booking;
}

export const BookedSlotCard: React.FC<BookedSlotCardProps> = ({ booking }) => {
  return (
    <div className="h-full bg-blue-100 border-blue-300 border px-2 py-1 rounded">
      <div className="text-xs font-medium text-blue-900 truncate">
        {booking.customer.name}
      </div>
      <div className="text-xs text-blue-700 truncate">
        {booking.services.map((s) => s.name).join(", ")}
      </div>
    </div>
  );
};
