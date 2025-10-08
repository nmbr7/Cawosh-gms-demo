import { useBookingStore } from "@/store/booking";
import { useEffect } from "react";

// Static data - always available
const staticBays = [
  { id: "bay-1", name: "Bay 1" },
  { id: "bay-2", name: "Bay 2" },
  { id: "bay-3", name: "Bay 3" },
  { id: "bay-4", name: "Bay 4" },
];

const staticTechnicians = [
  {
    id: "tech-1",
    firstName: "John",
    lastName: "Smith",
    role: "Senior Mechanic",
  },
  { id: "tech-2", firstName: "Sarah", lastName: "Johnson", role: "Mechanic" },
  {
    id: "tech-3",
    firstName: "Mike",
    lastName: "Davis",
    role: "Junior Mechanic",
  },
  { id: "tech-4", firstName: "Lisa", lastName: "Wilson", role: "Specialist" },
];

/**
 * Hook to demonstrate booking functionality with static data
 * Returns only static data - no API calls, no store dependencies
 */
export const useBookingDemo = () => {
  const store = useBookingStore();
  const { generateDummyBookings, getBookingsForBayAndDate } = store;

  useEffect(() => {
    // Generate dummy bookings when the hook is used
    generateDummyBookings();
  }, [generateDummyBookings]);

  // Return only static data for dropdowns, use store for bookings
  return {
    bays: staticBays,
    technicians: staticTechnicians,
    services: store.services,
    getBookingsForBayAndDate,
    bookings: store.bookings,
  };
};
