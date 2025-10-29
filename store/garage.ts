import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Garage } from '@/app/models/garage';

type GarageState = {
  garage: Garage | null;
  setGarage: (garage: Garage | null) => void;
  clearGarage: () => void;
};

export const useGarageStore = create<GarageState>()(
  persist(
    (set) => ({
      garage: null,
      setGarage: (garage) => set({ garage }),
      clearGarage: () => set({ garage: null }),
    }),
    {
      name: 'garage-storage',
    },
  ),
);
