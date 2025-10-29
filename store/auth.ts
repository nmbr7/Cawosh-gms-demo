import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/user';

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
      logout: async () => {
        try {
          // Call the logout API endpoint to clear the HTTP-only cookie
          await fetch('/api/auth/logout', {
            method: 'POST',
          });

          // Clear the store state
          set({ user: null });
          // Clear persisted data from localStorage
          localStorage.removeItem('auth-storage');
          // Force a hard navigation to login to prevent back button issues
          window.location.href = '/login';
        } catch (error) {
          console.error('Logout error:', error);
          // Even if the API call fails, we should still clear local state
          set({ user: null });
          localStorage.removeItem('auth-storage');
          window.location.href = '/login';
        }
      },
    }),
    {
      name: 'auth-storage',
    },
  ),
);
