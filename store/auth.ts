import { create } from "zustand";
import { persist } from "zustand/middleware";

type User = {
  id: number;
  email: string;
  name: string;
};

type AuthState = {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => {
        set({ user: null });
        // Clear any stored data
        localStorage.removeItem("auth-storage");
        // Force a hard navigation to login to prevent back button issues
        window.location.href = "/login";
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
