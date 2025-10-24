import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useGarageStore } from "./garage";
import type { Booking, Customer, Vehicle } from "@/types/booking";

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

export interface StoreService {
  id: string;
  name: string;
  duration: number;
  price: number;
}

interface BookingState {
  // Static data
  bays: Bay[];
  technicians: Technician[];
  services: StoreService[];

  // Dynamic data
  bookings: Booking[];

  // Actions
  setBays: (bays: Bay[]) => void;
  setTechnicians: (technicians: Technician[]) => void;
  setServices: (services: StoreService[]) => void;
  addBooking: (booking: Booking) => void;
  removeBooking: (bookingId: string) => void;
  getBookingsForBayAndDate: (
    bayId: string,
    date: string,
    technicianId?: string
  ) => Booking[];
  seedBookings: (args?: {
    days?: number;
    minPerDay?: number;
    maxPerDay?: number;
    bayCount?: number;
  }) => void;
  createBooking: (args: {
    customer: Customer;
    vehicle: Vehicle;
    services: Array<{
      serviceId: string;
      name: string;
      description: string;
      duration: number;
      price: number;
    }>;
    bayId: string;
    technicianId: string;
    startTimeHHMM: string; // HH:MM
    date: string; // YYYY-MM-DD
    notes?: string;
  }) => Booking;
  updateBookingServices: (
    bookingId: string,
    services: Array<{
      serviceId: string;
      name: string;
      description: string;
      duration: number;
      price: number;
    }>
  ) => void;
}

// Static data
const staticBays: Bay[] = [
  { id: "bay-1", name: "Bay 1" },
  { id: "bay-2", name: "Bay 2" },
  { id: "bay-3", name: "Bay 3" },
  { id: "bay-4", name: "Bay 4" },
  { id: "bay-5", name: "Bay 5" },
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
  {
    id: "service-undiagnosed",
    name: "Undiagnosed - Requires Diagnosis",
    duration: 60,
    price: 0.0,
  },
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

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      // Initial state - always use static data
      bays: staticBays,
      technicians: staticTechnicians,
      services: staticServices,
      bookings: [], // Start with empty bookings

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
            (booking) => booking._id !== bookingId
          ),
        })),

      getBookingsForBayAndDate: (bayId, date) => {
        const { bookings } = get();
        return bookings.filter((booking) => {
          // Safety check for services array
          if (!booking.services || !Array.isArray(booking.services)) {
            return false;
          }

          const matchesBay = booking.services.some(
            (service) => service.bayId === bayId
          );
          // Check bookingDate for date matching
          const matchesDate =
            booking.bookingDate && booking.bookingDate.startsWith(date);
          // Show all bookings for the bay regardless of technician
          // A busy bay is busy for all technicians
          return matchesBay && matchesDate;
        });
      },

      seedBookings: (args) => {
        const {
          days = 7,
          minPerDay = 1,
          maxPerDay = 5,
          bayCount = 5,
        } = args || {};

        const state = get();
        const bays = state.bays.slice(0, bayCount);
        const today = new Date();

        const garage = useGarageStore.getState().garage;
        const getHoursForDate = (d: Date) => {
          const dayName = d.toLocaleDateString("en-US", { weekday: "long" });
          const bh = garage?.businessHours?.find(
            (h) => h.day.toLowerCase() === dayName.toLowerCase()
          );
          if (bh && !bh.isClosed) {
            return { open: bh.open, close: bh.close };
          }
          return { open: "10:00", close: "17:00" };
        };

        const makeSlots = (open: string, close: string) => {
          const [openH] = open.split(":").map((n) => parseInt(n));
          const [closeH, closeM] = close.split(":").map((n) => parseInt(n));
          const slots: string[] = [];
          for (let h = openH; h < closeH || (h === closeH && 0 < closeM); h++) {
            slots.push(`${h.toString().padStart(2, "0")}:00`);
            slots.push(`${h.toString().padStart(2, "0")}:30`);
          }
          return slots;
        };

        const newBookings: Booking[] = [];
        for (let d = 0; d < days; d++) {
          const day = new Date(today);
          day.setDate(today.getDate() + d);
          const dateStr = day.toISOString().split("T")[0];
          const { open, close } = getHoursForDate(day);
          const slots = makeSlots(open, close);

          const countForDay = Math.max(
            minPerDay,
            Math.min(
              maxPerDay,
              Math.floor(Math.random() * (maxPerDay - minPerDay + 1)) +
                minPerDay
            )
          );

          const usedByBay: Record<string, Set<string>> = Object.fromEntries(
            bays.map((b) => [b.id, new Set<string>()])
          );

          for (let i = 0; i < countForDay; i++) {
            const bay = bays[i % bays.length];
            // pick a free slot for this bay
            const available = slots.filter((t) => !usedByBay[bay.id].has(t));
            if (available.length === 0) continue;
            const time =
              available[Math.floor(Math.random() * available.length)];
            usedByBay[bay.id].add(time);

            // pick a technician
            const tech =
              state.technicians[
                Math.floor(Math.random() * state.technicians.length)
              ];

            // pick a service
            const svc =
              state.services[Math.floor(Math.random() * state.services.length)];

            const startTime = `${dateStr}T${time}:00`;
            const endDate = new Date(startTime);
            endDate.setMinutes(endDate.getMinutes() + (svc?.duration || 30));
            const endTime = endDate.toISOString().slice(0, 19);

            newBookings.push({
              _id: crypto.randomUUID(),
              customer: {
                name: "Walk-in Customer",
                phone: "+971501234567",
                email: "walkin@example.com",
              },
              vehicle: {
                make: "Toyota",
                model: "Camry",
                year: 2022,
                license: "UAE12345",
                vin: "1HGCM82633A004352",
              },
              services: [
                {
                  serviceId: {
                    _id: svc?.id || "service-1",
                    name: svc?.name || "Service",
                    description: "Service description",
                    category: "Maintenance",
                  },
                  name: svc?.name || "Service",
                  description: "Service description",
                  duration: svc?.duration || 30,
                  price: svc?.price || 20.0,
                  currency: "GBP",
                  currencySymbol: "£",
                  status: "pending",
                  technicianId: {
                    _id: tech?.id || "tech-1",
                    firstName: tech?.firstName || "John",
                    lastName: tech?.lastName || "Smith",
                    email: "tech@garage.com",
                    phone: "1234567890",
                    role: "technician",
                  },
                  bayId: bay.id,
                  startTime,
                  endTime,
                  _id: crypto.randomUUID(),
                  pauses: [],
                },
              ],
              bookingDate: `${dateStr}T00:00:00.000Z`,
              totalDuration: svc?.duration || 30,
              totalPrice: svc?.price || 20.0,
              status: "pending",
              notes: "Walk-in booking",
              history: [
                {
                  status: "pending",
                  changedBy: {
                    _id: "admin",
                    firstName: "Admin",
                    lastName: "User",
                    email: "admin@local.garage.com",
                  },
                  changedAt: new Date().toISOString(),
                  notes: "Booking created",
                  _id: crypto.randomUUID(),
                },
              ],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              bookingId: `LOC-${Math.floor(Math.random() * 10000)
                .toString()
                .padStart(4, "0")}`,
              garage_id: {
                _id: "garage-1",
                name: "Cawosh Garage",
                address: {
                  street: "123 Main Street",
                  city: "Dubai",
                  state: "Dubai",
                  zipCode: "00000",
                  country: "UAE",
                },
                bays: [
                  { _id: "bay-1", name: "Bay 1" },
                  { _id: "bay-2", name: "Bay 2" },
                  { _id: "bay-3", name: "Bay 3" },
                  { _id: "bay-4", name: "Bay 4" },
                  { _id: "bay-5", name: "Bay 5" },
                ],
              },
              __v: 0,
            });
          }
        }

        // Replace existing bookings with seeded ones (avoid duplicates)
        set({ bookings: newBookings });
      },

      createBooking: ({
        customer,
        vehicle,
        services,
        bayId,
        technicianId,
        startTimeHHMM,
        date,
        notes = "",
      }) => {
        const currentState = get();
        const totalDuration = services.reduce(
          (acc, s) => acc + (s.duration || 30),
          0
        );
        const totalPrice = services.reduce((acc, s) => acc + (s.price || 0), 0);
        const startTime = `${date}T${startTimeHHMM}:00.000Z`;
        const endDate = new Date(startTime);
        endDate.setMinutes(endDate.getMinutes() + totalDuration);

        // Check if this is an undiagnosed booking
        const isUndiagnosed = services.some(
          (s) => s.serviceId === "service-undiagnosed"
        );

        const booking: Booking = {
          _id: crypto.randomUUID(),
          customer,
          vehicle,
          services: services.map((s, index) => {
            const serviceStartTime = new Date(startTime);
            serviceStartTime.setMinutes(
              serviceStartTime.getMinutes() + index * 30
            );
            const serviceEndTime = new Date(serviceStartTime);
            serviceEndTime.setMinutes(
              serviceEndTime.getMinutes() + (s.duration || 30)
            );

            return {
              serviceId: {
                _id: s.serviceId,
                name: s.name,
                description: s.description,
                category: "Maintenance",
              },
              name: s.name,
              description: s.description,
              duration: s.duration,
              price: s.price,
              currency: "GBP",
              currencySymbol: "£",
              status: isUndiagnosed
                ? ("awaiting_diagnosis" as const)
                : ("pending" as const),
              technicianId: {
                _id: technicianId,
                firstName:
                  currentState.technicians.find((t) => t.id === technicianId)
                    ?.firstName || "Unknown",
                lastName:
                  currentState.technicians.find((t) => t.id === technicianId)
                    ?.lastName || "Technician",
                email: "tech@garage.com",
                phone: "1234567890",
                role: "technician",
              },
              bayId,
              startTime: serviceStartTime.toISOString(),
              endTime: serviceEndTime.toISOString(),
              _id: crypto.randomUUID(),
              pauses: [],
            };
          }),
          bookingDate: new Date(`${date}T00:00:00.000Z`).toISOString(),
          totalDuration,
          totalPrice,
          status: "pending",
          notes,
          history: [
            {
              status: "pending",
              changedBy: {
                _id: "admin",
                firstName: "Admin",
                lastName: "User",
                email: "admin@local.garage.com",
              },
              changedAt: new Date().toISOString(),
              notes: "Booking created",
              _id: crypto.randomUUID(),
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          bookingId: `LOC-${Math.floor(Math.random() * 10000)
            .toString()
            .padStart(4, "0")}`,
          garage_id: {
            _id: "garage-1",
            name: "Cawosh Garage",
            address: {
              street: "123 Main Street",
              city: "Dubai",
              state: "Dubai",
              zipCode: "00000",
              country: "UAE",
            },
            bays: [
              { _id: "bay-1", name: "Bay 1" },
              { _id: "bay-2", name: "Bay 2" },
              { _id: "bay-3", name: "Bay 3" },
              { _id: "bay-4", name: "Bay 4" },
              { _id: "bay-5", name: "Bay 5" },
            ],
          },
          __v: 0,
          requiresDiagnosis: isUndiagnosed,
          diagnosisNotes: isUndiagnosed ? notes : undefined,
        };
        set((state) => ({ bookings: [...state.bookings, booking] }));
        return booking;
      },
      updateBookingServices: (bookingId, services) => {
        set((state) => ({
          bookings: state.bookings.map((booking) => {
            if (booking._id === bookingId) {
              const totalDuration = services.reduce(
                (acc, s) => acc + s.duration,
                0
              );
              const totalPrice = services.reduce((acc, s) => acc + s.price, 0);

              return {
                ...booking,
                services: services.map((s, index) => {
                  const serviceStartTime = new Date(booking.bookingDate);
                  serviceStartTime.setMinutes(
                    serviceStartTime.getMinutes() + index * 30
                  );
                  const serviceEndTime = new Date(serviceStartTime);
                  serviceEndTime.setMinutes(
                    serviceEndTime.getMinutes() + s.duration
                  );

                  return {
                    serviceId: {
                      _id: s.serviceId,
                      name: s.name,
                      description: s.description,
                      category: "Maintenance",
                    },
                    name: s.name,
                    description: s.description,
                    duration: s.duration,
                    price: s.price,
                    currency: "GBP",
                    currencySymbol: "£",
                    status: "pending" as const,
                    technicianId: booking.services[0]?.technicianId || {
                      _id: "tech-1",
                      firstName: "Tech",
                      lastName: "Name",
                      email: "tech@garage.com",
                      phone: "1234567890",
                      role: "technician",
                    },
                    bayId: booking.services[0]?.bayId || "bay-1",
                    startTime: serviceStartTime.toISOString(),
                    endTime: serviceEndTime.toISOString(),
                    _id: crypto.randomUUID(),
                    pauses: [],
                  };
                }),
                totalDuration,
                totalPrice,
                updatedAt: new Date().toISOString(),
                requiresDiagnosis: false, // Clear diagnosis flag after services are added
              };
            }
            return booking;
          }),
        }));
      },
    }),
    {
      name: "booking-storage",
      // Only persist bookings, not static data
      partialize: (state) => ({ bookings: state.bookings }),
    }
  )
);
