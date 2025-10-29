import { create } from 'zustand';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

interface UserFormOptions {
  positions: string[];
  departments: string[];
  roles: string[];
  permissions: string[];
}

interface UserFormOptionsState {
  formOptions: UserFormOptions;
  isLoading: boolean;
  error: string | null;
  hasLoaded: boolean;

  fetchFormOptions: () => Promise<void>;
  refetch: () => Promise<void>;
  reset: () => void;
}

const FALLBACK_OPTIONS: UserFormOptions = {
  positions: ['Service Technician', 'Manager', 'Admin'],
  departments: ['Service', 'Operations', 'IT'],
  roles: ['User', 'Admin', 'Super Admin'],
  permissions: ['Read', 'Write', 'Delete'],
};

export const useUserFormOptionsStore = create<UserFormOptionsState>(
  (set, get) => ({
    formOptions: FALLBACK_OPTIONS,
    isLoading: false,
    error: null,
    hasLoaded: false,

    fetchFormOptions: async () => {
      const { hasLoaded } = get();
      if (hasLoaded) return;

      set({ isLoading: true, error: null });

      try {
        const response = await fetchWithAuth('/api/form-options');
        console.log('response', response);
        if (response.ok) {
          const data = await response.json();
          console.log('data', data);
          set({ formOptions: data.data, isLoading: false, hasLoaded: true });
        } else {
          throw new Error('Failed to fetch user form options');
        }
      } catch (err) {
        set({
          error:
            err instanceof Error
              ? err.message
              : 'Failed to fetch user form options',
          isLoading: false,
          hasLoaded: true,
        });
      }
    },

    refetch: async () => {
      set({ hasLoaded: false });
      await get().fetchFormOptions();
    },

    reset: () => {
      set({
        formOptions: FALLBACK_OPTIONS,
        isLoading: false,
        error: null,
        hasLoaded: false,
      });
    },
  }),
);
