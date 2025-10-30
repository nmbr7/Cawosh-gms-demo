import { Booking } from '@/app/models/booking';
import { Garage } from '@/app/models/garage';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { create } from 'zustand';

export enum viewType {
  Day = 'Day',
  Week = 'Week',
  Month = 'Month',
}

export type scheduleStore = {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  startDate: string;
  setStartDate: (day: string) => void;
  endDate: string;
  setEndDate: (day: string) => void;
  selectedBay: number | 'all';
  setSelectedBay: (bay: number | 'all') => void;
  viewMode: viewType;
  setViewMode: (viewType: viewType) => void;
  bookings: Booking[];
  setBookings: (bookings: Booking[]) => void;
  isCalendarOpen: boolean;
  setIsCalendarOpen: (isOpen: boolean) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  fetchBookings: (
    garage: Garage,
    startDate: string,
    endDate: string,
  ) => Promise<void>;
};

export const useScheduleStore = create<scheduleStore>((set) => ({
  selectedDate: new Date(),
  setSelectedDate: (date: Date) => set({ selectedDate: date }),
  startDate: '',
  setStartDate: (day: string) => set({ startDate: day }),
  endDate: '',
  setEndDate: (day: string) => set({ endDate: day }),
  selectedBay: 'all',
  setSelectedBay: (bay: number | 'all') => set({ selectedBay: bay }),
  viewMode: viewType.Week,
  setViewMode: (view: viewType) => set({ viewMode: view }),
  bookings: [],
  setBookings: (bookings: Booking[]) => set({ bookings }),
  isCalendarOpen: false,
  setIsCalendarOpen: (isOpen: boolean) => set({ isCalendarOpen: isOpen }),
  isLoading: false,
  setIsLoading: (isLoading: boolean) => set({ isLoading }),
  fetchBookings: async (garage: Garage, startDate: string, endDate: string) => {
    set({ isLoading: true });
    try {
      const paramsObj: Record<string, string> = {
        garageId: garage.id,
        startDate: startDate,
        endDate: endDate,
        all: 'true',
      };
      const params = new URLSearchParams(paramsObj);

      const response = await fetchWithAuth(
        `/api/bookings?${params.toString()}`,
      );
      const data = await response.json();
      const newBookings: Booking[] = data.bookings ?? [];

      set({ bookings: newBookings });
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
