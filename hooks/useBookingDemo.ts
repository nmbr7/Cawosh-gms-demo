import { vhcRepo } from '@/lib/vhc/mockRepo';
import { useBookingStore } from '@/store/booking';
import { useJobSheetStore } from '@/store/jobSheet';
import { useEffect } from 'react';
import { useRef } from 'react';

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

  // Only run the seed logic *once* per app load using a ref
  // seededRef is just a plain React ref initialized to false each time this hook is run (i.e. on every mount),
  // so it's always false after a page reload or refresh. React refs do not persist across page reloads.
  // If you want to persist the fact that seeding was done (even across reloads),
  // you must store that flag somewhere with persistence (localStorage, Zustand store, etc), not just a ref.
  useEffect(() => {
    // Check persisted state instead of just a ref
    const seeded = window.localStorage.getItem('bookingsSeeded') === 'true';
    console.log('Seeded value from localStorage on mount:', seeded);
    if (!seeded) {
      seedBookings({ days: 15, minPerDay: 2, maxPerDay: 10, bayCount: 5 });
      window.localStorage.setItem('bookingsSeeded', 'true');
      console.log('Seeding bookings, setting bookingsSeeded in localStorage.');
      // Create jobsheets after bookings are seeded and available.
      // Try using a polling loop with a max retry count to avoid infinite loops,
      // and ensure we always use the latest bookings from the store.
      let tries = 0;
      const maxTries = 5;
      function tryCreateJobsheets() {
        // Always fetch the latest state from the store, not from closure
        const { bookings } = useBookingStore.getState();
        if (bookings.length === 0 && tries < maxTries) {
          tries++;
          setTimeout(tryCreateJobsheets, 100);
        } else if (bookings.length > 0) {
          for (const booking of bookings) {
            jobSheetStore.createFromBooking(booking._id);
          }
        } else {
          console.warn(
            'No bookings found for job sheet creation after polling.',
          );
        }
      }
      tryCreateJobsheets();
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
