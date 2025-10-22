import { useBookingStore } from "@/store/booking";
import { useJobSheetStore } from "@/store/jobSheet";
import { useEffect } from "react";

/**
 * Hook to provide booking data from the Zustand store
 * Seeds bookings for the next 7 days (1-5/day across 5 bays) once on mount
 * Also creates corresponding jobsheets for each booking
 */
export const useBookingDemo = () => {
  const bookingStore = useBookingStore();
  const jobSheetStore = useJobSheetStore();
  const { seedBookings, getBookingsForBayAndDate } = bookingStore;
  const { createFromBooking } = jobSheetStore;

  useEffect(() => {
    // Only seed if no bookings exist
    if (bookingStore.bookings.length === 0) {
      seedBookings({ days: 7, minPerDay: 1, maxPerDay: 5, bayCount: 5 });

      // Create jobsheets for all seeded bookings
      setTimeout(() => {
        bookingStore.bookings.forEach((booking) => {
          createFromBooking(booking._id);
        });
      }, 100); // Small delay to ensure bookings are created first
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    bays: bookingStore.bays,
    technicians: bookingStore.technicians,
    services: bookingStore.services,
    getBookingsForBayAndDate,
    bookings: bookingStore.bookings,
  };
};
