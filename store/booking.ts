import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useGarageStore } from './garage';
import type {
  Booking,
  Customer,
  Vehicle,
  HistoryEntry,
  InventoryUsageEntry,
} from '@/types/booking';

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
    technicianId?: string,
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
    }>,
  ) => void;
  updateBooking: (bookingId: string, updates: Partial<Booking>) => void;
  addBookingHistory: (
    bookingId: string,
    entry: Omit<HistoryEntry, '_id'>,
  ) => void;
  addInventoryUsage: (bookingId: string, usage: InventoryUsageEntry) => void;
}

// Static data
const staticBays: Bay[] = [
  { id: 'bay-1', name: 'Bay 1' },
  { id: 'bay-2', name: 'Bay 2' },
  { id: 'bay-3', name: 'Bay 3' },
  { id: 'bay-4', name: 'Bay 4' },
  { id: 'bay-5', name: 'Bay 5' },
];

const staticTechnicians: Technician[] = [
  {
    id: 'tech-1',
    firstName: 'John',
    lastName: 'Smith',
    role: 'Senior Mechanic',
  },
  { id: 'tech-2', firstName: 'Sarah', lastName: 'Johnson', role: 'Mechanic' },
  {
    id: 'tech-3',
    firstName: 'Mike',
    lastName: 'Davis',
    role: 'Junior Mechanic',
  },
  { id: 'tech-4', firstName: 'Lisa', lastName: 'Wilson', role: 'Specialist' },
];

const staticServices = [
  {
    id: 'service-undiagnosed',
    name: 'Undiagnosed - Requires Diagnosis',
    duration: 60,
    price: 0.0,
  },
  // Original services
  { id: 'service-1', name: 'Oil Change', duration: 30, price: 20.0 },
  { id: 'service-2', name: 'Tire Rotation', duration: 30, price: 12.0 },
  { id: 'service-3', name: 'Brake Inspection', duration: 30, price: 28.0 },
  { id: 'service-4', name: 'Engine Diagnostic', duration: 30, price: 40.0 },
  { id: 'service-5', name: 'Transmission Service', duration: 30, price: 60.0 },
  { id: 'service-6', name: 'AC Service', duration: 30, price: 32.0 },
  { id: 'service-7', name: 'Battery Check', duration: 30, price: 16.0 },
  { id: 'service-8', name: 'Wheel Alignment', duration: 30, price: 48.0 },
  {
    id: 'service-9',
    name: 'Spark Plug Replacement',
    duration: 30,
    price: 36.0,
  },
  {
    id: 'service-10',
    name: 'Air Filter Replacement',
    duration: 30,
    price: 24.0,
  },
  // Fluids & Filters
  {
    id: 'service-11',
    name: 'Oil Change (Full Synthetic 5W-30)',
    duration: 30,
    price: 45.0,
  },
  {
    id: 'service-12',
    name: 'Oil Change (Conventional 10W-30)',
    duration: 30,
    price: 35.0,
  },
  {
    id: 'service-13',
    name: 'Oil Filter Replacement',
    duration: 15,
    price: 12.0,
  },
  {
    id: 'service-14',
    name: 'Cabin Air Filter Replacement',
    duration: 15,
    price: 20.0,
  },
  { id: 'service-15', name: 'Coolant Flush', duration: 45, price: 55.0 },
  {
    id: 'service-16',
    name: 'Transmission Fluid Change',
    duration: 60,
    price: 85.0,
  },
  { id: 'service-17', name: 'Brake Fluid Flush', duration: 30, price: 45.0 },
  // Parts Replacement
  {
    id: 'service-18',
    name: 'Front Brake Pads Replacement',
    duration: 60,
    price: 120.0,
  },
  {
    id: 'service-19',
    name: 'Rear Brake Pads Replacement',
    duration: 60,
    price: 110.0,
  },
  {
    id: 'service-20',
    name: 'Front Brake Rotors Replacement',
    duration: 90,
    price: 180.0,
  },
  { id: 'service-21', name: 'Battery Replacement', duration: 20, price: 95.0 },
  {
    id: 'service-22',
    name: 'Spark Plugs Replacement (4-cylinder)',
    duration: 45,
    price: 80.0,
  },
  {
    id: 'service-23',
    name: 'Spark Plugs Replacement (6-cylinder)',
    duration: 60,
    price: 110.0,
  },
  {
    id: 'service-24',
    name: 'Wiper Blades Replacement',
    duration: 10,
    price: 25.0,
  },
  {
    id: 'service-25',
    name: 'Headlight Bulb Replacement',
    duration: 15,
    price: 30.0,
  },
  {
    id: 'service-26',
    name: 'Serpentine Belt Replacement',
    duration: 45,
    price: 75.0,
  },
  // Cleaning & Maintenance
  { id: 'service-27', name: 'Engine Bay Cleaning', duration: 30, price: 40.0 },
  {
    id: 'service-28',
    name: 'Throttle Body Cleaning',
    duration: 45,
    price: 60.0,
  },
  {
    id: 'service-29',
    name: 'Fuel Injection System Cleaning',
    duration: 60,
    price: 85.0,
  },
  { id: 'service-30', name: 'AC System Cleaning', duration: 45, price: 65.0 },
  // Inspection & Diagnostic
  {
    id: 'service-31',
    name: 'Engine Diagnostic Scan',
    duration: 30,
    price: 40.0,
  },
  {
    id: 'service-32',
    name: 'Brake System Inspection',
    duration: 30,
    price: 28.0,
  },
  {
    id: 'service-33',
    name: 'Suspension Inspection',
    duration: 30,
    price: 35.0,
  },
  {
    id: 'service-34',
    name: 'Electrical System Diagnostic',
    duration: 45,
    price: 55.0,
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

      addBooking: (booking) => {
        console.log('New booking', booking);
        set((state) => ({
          bookings: [...state.bookings, booking],
        }));
      },

      removeBooking: (bookingId) =>
        set((state) => ({
          bookings: state.bookings.filter(
            (booking) => booking._id !== bookingId,
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
            (service) => service.bayId === bayId,
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
        // today.setDate(today.getDate() - 7);

        const garage = useGarageStore.getState().garage;
        const getHoursForDate = (d: Date) => {
          const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
          const bh = garage?.businessHours?.find(
            (h) => h.day.toLowerCase() === dayName.toLowerCase(),
          );
          if (bh && !bh.isClosed) {
            return { open: bh.open, close: bh.close };
          }
          return { open: '10:00', close: '17:00' };
        };

        const makeSlots = (open: string, close: string) => {
          const [openH] = open.split(':').map((n) => parseInt(n));
          const [closeH, closeM] = close.split(':').map((n) => parseInt(n));
          const slots: string[] = [];
          for (let h = openH; h < closeH || (h === closeH && 0 < closeM); h++) {
            slots.push(`${h.toString().padStart(2, '0')}:00`);
            slots.push(`${h.toString().padStart(2, '0')}:30`);
          }
          return slots;
        };

        const newBookings: Booking[] = [];
        for (let d = 0; d < days; d++) {
          const day = new Date(today);
          day.setDate(today.getDate() + d);
          const dateStr = day.toISOString().split('T')[0];
          const { open, close } = getHoursForDate(day);
          const slots = makeSlots(open, close);

          const countForDay = Math.max(
            minPerDay,
            Math.min(
              maxPerDay,
              Math.floor(Math.random() * (maxPerDay - minPerDay + 1)) +
                minPerDay,
            ),
          );

          const usedByBay: Record<string, Set<string>> = Object.fromEntries(
            bays.map((b) => [b.id, new Set<string>()]),
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
              // Randomize customer and vehicle fields for demo data
              customer: (() => {
                // Demo data pools
                const customerNames = [
                  'Ahmed Raza',
                  'Fatima Noor',
                  'James Lee',
                  'Maria Petrova',
                  'Wei Zhang',
                  'Olivia Johnson',
                  'Arjun Patel',
                ];
                const customerPhones = [
                  '+97150' + Math.floor(1000000 + Math.random() * 8999999),
                  '+97152' + Math.floor(1000000 + Math.random() * 8999999),
                  '+97155' + Math.floor(1000000 + Math.random() * 8999999),
                  '+97156' + Math.floor(1000000 + Math.random() * 8999999),
                ];
                const nameIdx = Math.floor(
                  Math.random() * customerNames.length,
                );
                const emailBase = customerNames[nameIdx]
                  .replace(/\s+/g, '.')
                  .toLowerCase();
                return {
                  name: customerNames[nameIdx],
                  phone:
                    customerPhones[
                      Math.floor(Math.random() * customerPhones.length)
                    ],
                  email: `${emailBase}@example.com`,
                };
              })(),
              vehicle: (() => {
                const makesModels = [
                  { make: 'Toyota', models: ['Camry', 'Corolla', 'Hilux'] },
                  { make: 'Nissan', models: ['Altima', 'Patrol', 'Sunny'] },
                  { make: 'Ford', models: ['F-150', 'Explorer', 'Focus'] },
                  { make: 'Honda', models: ['Civic', 'Accord', 'CR-V'] },
                  { make: 'Hyundai', models: ['Sonata', 'Elantra', 'Tucson'] },
                ];
                const years = [2019, 2020, 2021, 2022, 2023];
                const randomCar =
                  makesModels[Math.floor(Math.random() * makesModels.length)];
                const randomModel =
                  randomCar.models[
                    Math.floor(Math.random() * randomCar.models.length)
                  ];
                const randomYear =
                  years[Math.floor(Math.random() * years.length)];
                // UAE license plates: 1-7 chars, letters and/or numbers. We'll mock: ABC1234, D56789, Z4321, etc.
                const randomLicense =
                  String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
                  Math.floor(1000 + Math.random() * 89999).toString();
                // Random VIN-like string
                const randomVin = Array(17)
                  .fill(0)
                  .map(() =>
                    'ABCDEFGHJKLMNPRSTUVWXYZ0123456789'.charAt(
                      Math.floor(Math.random() * 33),
                    ),
                  )
                  .join('');
                return {
                  make: randomCar.make,
                  model: randomModel,
                  year: randomYear,
                  license: randomLicense,
                  vin: randomVin,
                };
              })(),
              services: [
                {
                  serviceId: {
                    _id: svc?.id || 'service-1',
                    name: svc?.name || 'Service',
                    description: 'Service description',
                    category: 'Maintenance',
                  },
                  name: svc?.name || 'Service',
                  description: 'Service description',
                  duration: svc?.duration || 30,
                  price: svc?.price || 20.0,
                  currency: 'GBP',
                  currencySymbol: '£',
                  status: 'pending',
                  technicianId: {
                    _id: tech?.id || 'tech-1',
                    firstName: tech?.firstName || 'John',
                    lastName: tech?.lastName || 'Smith',
                    email: 'tech@garage.com',
                    phone: '1234567890',
                    role: 'technician',
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
              status: 'pending',
              notes: 'Walk-in booking',
              history: [
                {
                  status: 'pending',
                  changedBy: {
                    _id: 'admin',
                    firstName: 'Admin',
                    lastName: 'User',
                    email: 'admin@local.garage.com',
                  },
                  changedAt: new Date().toISOString(),
                  notes: 'Booking created',
                  _id: crypto.randomUUID(),
                },
              ],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              bookingId: `LOC-${Math.floor(Math.random() * 10000)
                .toString()
                .padStart(4, '0')}`,
              garage_id: {
                _id: 'garage-1',
                name: 'Cawosh Garage',
                address: {
                  street: '123 Main Street',
                  city: 'Dubai',
                  state: 'Dubai',
                  zipCode: '00000',
                  country: 'UAE',
                },
                bays: [
                  { _id: 'bay-1', name: 'Bay 1' },
                  { _id: 'bay-2', name: 'Bay 2' },
                  { _id: 'bay-3', name: 'Bay 3' },
                  { _id: 'bay-4', name: 'Bay 4' },
                  { _id: 'bay-5', name: 'Bay 5' },
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
        notes = '',
      }) => {
        const currentState = get();
        const totalDuration = services.reduce(
          (acc, s) => acc + (s.duration || 30),
          0,
        );
        const totalPrice = services.reduce((acc, s) => acc + (s.price || 0), 0);
        const startTime = `${date}T${startTimeHHMM}:00.000Z`;
        const endDate = new Date(startTime);
        endDate.setMinutes(endDate.getMinutes() + totalDuration);

        // Check if this is an undiagnosed booking
        const isUndiagnosed = services.some(
          (s) => s.serviceId === 'service-undiagnosed',
        );

        // Extract technician assignments
        const technician = currentState.technicians.find(
          (t) => t.id === technicianId,
        );
        const assignedTechnicians = technician
          ? [
              {
                technicianId: technicianId,
                technicianName: `${technician.firstName} ${technician.lastName}`,
                assignedAt: new Date().toISOString(),
                role: 'primary' as const,
              },
            ]
          : [];

        const booking: Booking = {
          _id: crypto.randomUUID(),
          customer,
          vehicle,
          services: services.map((s, index) => {
            const serviceStartTime = new Date(startTime);
            serviceStartTime.setMinutes(
              serviceStartTime.getMinutes() + index * 30,
            );
            const serviceEndTime = new Date(serviceStartTime);
            serviceEndTime.setMinutes(
              serviceEndTime.getMinutes() + (s.duration || 30),
            );

            return {
              serviceId: {
                _id: s.serviceId,
                name: s.name,
                description: s.description,
                category: 'Maintenance',
              },
              name: s.name,
              description: s.description,
              duration: s.duration,
              price: s.price,
              currency: 'GBP',
              currencySymbol: '£',
              status: isUndiagnosed
                ? ('awaiting_diagnosis' as const)
                : ('pending' as const),
              technicianId: {
                _id: technicianId,
                firstName:
                  currentState.technicians.find((t) => t.id === technicianId)
                    ?.firstName || 'Unknown',
                lastName:
                  currentState.technicians.find((t) => t.id === technicianId)
                    ?.lastName || 'Technician',
                email: 'tech@garage.com',
                phone: '1234567890',
                role: 'technician',
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
          status: 'pending',
          notes,
          history: [
            {
              status: 'pending',
              changedBy: {
                _id: 'admin',
                firstName: 'Admin',
                lastName: 'User',
                email: 'admin@local.garage.com',
              },
              changedAt: new Date().toISOString(),
              notes: 'Booking created',
              _id: crypto.randomUUID(),
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          bookingId: `LOC-${Math.floor(Math.random() * 10000)
            .toString()
            .padStart(4, '0')}`,
          garage_id: {
            _id: 'garage-1',
            name: 'Cawosh Garage',
            address: {
              street: '123 Main Street',
              city: 'Dubai',
              state: 'Dubai',
              zipCode: '00000',
              country: 'UAE',
            },
            bays: [
              { _id: 'bay-1', name: 'Bay 1' },
              { _id: 'bay-2', name: 'Bay 2' },
              { _id: 'bay-3', name: 'Bay 3' },
              { _id: 'bay-4', name: 'Bay 4' },
              { _id: 'bay-5', name: 'Bay 5' },
            ],
          },
          __v: 0,
          requiresDiagnosis: isUndiagnosed,
          diagnosisNotes: isUndiagnosed ? notes : undefined,
          assignedTechnicians,
        };
        console.log('Creating Booking', booking);
        set((state) => ({ bookings: [...state.bookings, booking] }));
        return booking;
      },
      updateBookingServices: (bookingId, services) => {
        set((state) => ({
          bookings: state.bookings.map((booking) => {
            if (booking._id === bookingId) {
              const totalDuration = services.reduce(
                (acc, s) => acc + s.duration,
                0,
              );
              const totalPrice = services.reduce((acc, s) => acc + s.price, 0);

              return {
                ...booking,
                services: services.map((s, index) => {
                  const serviceStartTime = new Date(booking.bookingDate);
                  serviceStartTime.setMinutes(
                    serviceStartTime.getMinutes() + index * 30,
                  );
                  const serviceEndTime = new Date(serviceStartTime);
                  serviceEndTime.setMinutes(
                    serviceEndTime.getMinutes() + s.duration,
                  );

                  return {
                    serviceId: {
                      _id: s.serviceId,
                      name: s.name,
                      description: s.description,
                      category: 'Maintenance',
                    },
                    name: s.name,
                    description: s.description,
                    duration: s.duration,
                    price: s.price,
                    currency: 'GBP',
                    currencySymbol: '£',
                    status: 'pending' as const,
                    technicianId: booking.services[0]?.technicianId || {
                      _id: 'tech-1',
                      firstName: 'Tech',
                      lastName: 'Name',
                      email: 'tech@garage.com',
                      phone: '1234567890',
                      role: 'technician',
                    },
                    bayId: booking.services[0]?.bayId || 'bay-1',
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
      updateBooking: (bookingId, updates) => {
        set((state) => ({
          bookings: state.bookings.map((booking) =>
            booking._id === bookingId
              ? { ...booking, ...updates, updatedAt: new Date().toISOString() }
              : booking,
          ),
        }));
      },
      addBookingHistory: (bookingId, entry) => {
        set((state) => ({
          bookings: state.bookings.map((b) =>
            b._id === bookingId
              ? {
                  ...b,
                  history: [
                    ...(b.history || []),
                    { ...entry, _id: crypto.randomUUID() },
                  ],
                  updatedAt: new Date().toISOString(),
                }
              : b,
          ),
        }));
      },
      addInventoryUsage: (bookingId, usage) => {
        set((state) => ({
          bookings: state.bookings.map((b) =>
            b._id === bookingId
              ? {
                  ...b,
                  inventoryUsage: [
                    ...(b.inventoryUsage || []),
                    { ...usage, id: usage.id || crypto.randomUUID() },
                  ],
                  updatedAt: new Date().toISOString(),
                }
              : b,
          ),
        }));
      },
    }),
    {
      name: 'booking-storage',
      // Only persist bookings, not static data
      partialize: (state) => ({ bookings: state.bookings }),
    },
  ),
);
