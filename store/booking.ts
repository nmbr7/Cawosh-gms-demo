import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Bay {
  id: string;
  name: string;
}

export interface Technician {
  id: string;
  firstName: string;
  lastName: string;
  role?: string;
}

export interface Booking {
  id: string;
  customer: {
    name: string;
  };
  services: Array<{
    name: string;
  }>;
  startTime: string;
  endTime: string;
  bayId: string;
  technicianId: string;
  date: string;
}

export interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
}

interface BookingState {
  // Static data
  bays: Bay[];
  technicians: Technician[];
  services: Service[];

  // Dynamic data
  bookings: Booking[];

  // Actions
  setBays: (bays: Bay[]) => void;
  setTechnicians: (technicians: Technician[]) => void;
  setServices: (services: Service[]) => void;
  addBooking: (booking: Booking) => void;
  removeBooking: (bookingId: string) => void;
  getBookingsForBayAndDate: (
    bayId: string,
    date: string,
    technicianId?: string
  ) => Booking[];
  generateDummyBookings: () => void;
}

// Static data
const staticBays: Bay[] = [
  { id: "bay-1", name: "Bay 1" },
  { id: "bay-2", name: "Bay 2" },
  { id: "bay-3", name: "Bay 3" },
  { id: "bay-4", name: "Bay 4" },
];

const staticTechnicians: Technician[] = [
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

const staticServices = [
  { id: "service-1", name: "Oil Change", duration: 30, price: 20.0 },
  { id: "service-2", name: "Tire Rotation", duration: 30, price: 12.0 },
  { id: "service-3", name: "Brake Inspection", duration: 30, price: 28.0 },
  { id: "service-4", name: "Engine Diagnostic", duration: 30, price: 40.0 },
  { id: "service-5", name: "Transmission Service", duration: 30, price: 60.0 },
  { id: "service-6", name: "AC Service", duration: 30, price: 32.0 },
  { id: "service-7", name: "Battery Check", duration: 30, price: 16.0 },
  { id: "service-8", name: "Wheel Alignment", duration: 30, price: 48.0 },
  {
    id: "service-9",
    name: "Spark Plug Replacement",
    duration: 30,
    price: 36.0,
  },
  {
    id: "service-10",
    name: "Air Filter Replacement",
    duration: 30,
    price: 24.0,
  },
];

// Generate dummy bookings for demonstration
const generateDummyBookings = (): Booking[] => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dateStr = tomorrow.toISOString().split("T")[0]; // YYYY-MM-DD format

  return [
    {
      id: "booking-1",
      customer: { name: "Alice Johnson" },
      services: [{ name: "Oil Change" }],
      startTime: `${dateStr}T10:00:00`,
      endTime: `${dateStr}T10:30:00`,
      bayId: "bay-1",
      technicianId: "tech-1",
      date: dateStr,
    },
    {
      id: "booking-2",
      customer: { name: "Bob Smith" },
      services: [{ name: "Tire Rotation" }],
      startTime: `${dateStr}T11:00:00`,
      endTime: `${dateStr}T11:30:00`,
      bayId: "bay-1",
      technicianId: "tech-2",
      date: dateStr,
    },
    {
      id: "booking-3",
      customer: { name: "Carol Davis" },
      services: [{ name: "Brake Inspection" }],
      startTime: `${dateStr}T12:00:00`,
      endTime: `${dateStr}T12:30:00`,
      bayId: "bay-2",
      technicianId: "tech-1",
      date: dateStr,
    },
    {
      id: "booking-4",
      customer: { name: "David Wilson" },
      services: [{ name: "Engine Diagnostic" }],
      startTime: `${dateStr}T13:00:00`,
      endTime: `${dateStr}T13:30:00`,
      bayId: "bay-1",
      technicianId: "tech-3",
      date: dateStr,
    },
    {
      id: "booking-5",
      customer: { name: "Emma Brown" },
      services: [{ name: "AC Service" }],
      startTime: `${dateStr}T14:00:00`,
      endTime: `${dateStr}T14:30:00`,
      bayId: "bay-3",
      technicianId: "tech-4",
      date: dateStr,
    },
    {
      id: "booking-6",
      customer: { name: "Frank Miller" },
      services: [{ name: "Transmission Service" }],
      startTime: `${dateStr}T15:00:00`,
      endTime: `${dateStr}T15:30:00`,
      bayId: "bay-2",
      technicianId: "tech-4",
      date: dateStr,
    },
    {
      id: "booking-7",
      customer: { name: "Grace Lee" },
      services: [{ name: "Battery Check" }],
      startTime: `${dateStr}T16:00:00`,
      endTime: `${dateStr}T16:30:00`,
      bayId: "bay-1",
      technicianId: "tech-1",
      date: dateStr,
    },
    {
      id: "booking-8",
      customer: { name: "Henry Taylor" },
      services: [{ name: "Wheel Alignment" }],
      startTime: `${dateStr}T17:00:00`,
      endTime: `${dateStr}T17:30:00`,
      bayId: "bay-3",
      technicianId: "tech-3",
      date: dateStr,
    },
  ];
};

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      // Initial state - always use static data
      bays: staticBays,
      technicians: staticTechnicians,
      services: staticServices,
      bookings: generateDummyBookings(),

      // Actions
      setBays: (bays) => set({ bays }),
      setTechnicians: (technicians) => set({ technicians }),
      setServices: (services) => set({ services }),

      addBooking: (booking) =>
        set((state) => ({
          bookings: [...state.bookings, booking],
        })),

      removeBooking: (bookingId) =>
        set((state) => ({
          bookings: state.bookings.filter(
            (booking) => booking.id !== bookingId
          ),
        })),

      getBookingsForBayAndDate: (bayId, date) => {
        const { bookings } = get();
        return bookings.filter((booking) => {
          const matchesBay = booking.bayId === bayId;
          const matchesDate = booking.date === date;
          // Show all bookings for the bay regardless of technician
          // A busy bay is busy for all technicians
          return matchesBay && matchesDate;
        });
      },

      generateDummyBookings: () => set({ bookings: generateDummyBookings() }),
    }),
    {
      name: "booking-storage",
      // Only persist bookings, not static data
      partialize: (state) => ({ bookings: state.bookings }),
    }
  )
);
