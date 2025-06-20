"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface FormOptions {
  positions: string[];
  departments: string[];
}

interface FormOptionsContextType {
  formOptions: FormOptions;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const FormOptionsContext = createContext<FormOptionsContextType | undefined>(
  undefined
);

// Fallback options in case API fails
const FALLBACK_OPTIONS: FormOptions = {
  positions: [
    "Service Technician",
    "Manager",
    "Admin",
    "Operations Manager",
    "Service Manager",
  ],
  departments: ["Service", "Operations", "IT", "Maintenance", "Management"],
};

export function FormOptionsProvider({ children }: { children: ReactNode }) {
  const [formOptions, setFormOptions] = useState<FormOptions>(FALLBACK_OPTIONS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const fetchFormOptions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/form-options");
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setFormOptions({
            positions: data.data.positions || FALLBACK_OPTIONS.positions,
            departments: data.data.departments || FALLBACK_OPTIONS.departments,
          });
        }
      } else {
        throw new Error("Failed to fetch form options");
      }
    } catch (err) {
      console.error("Error fetching form options:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch form options"
      );
      // Keep fallback options if API fails
    } finally {
      setIsLoading(false);
      setHasLoaded(true);
    }
  };

  // Fetch options once when the provider mounts
  useEffect(() => {
    if (!hasLoaded) {
      fetchFormOptions();
    }
  }, [hasLoaded]);

  const refetch = async () => {
    setHasLoaded(false);
    await fetchFormOptions();
  };

  return (
    <FormOptionsContext.Provider
      value={{ formOptions, isLoading, error, refetch }}
    >
      {children}
    </FormOptionsContext.Provider>
  );
}

export function useFormOptions() {
  const context = useContext(FormOptionsContext);
  if (context === undefined) {
    throw new Error("useFormOptions must be used within a FormOptionsProvider");
  }
  return context;
}
