import { useEffect } from "react";
import { useUserFormOptionsStore } from "@/store/forms/user-form-options";

export const useUserFormOptions = () => {
  const store = useUserFormOptionsStore();

  // Auto-fetch form options when the hook is not loading
  useEffect(() => {
    store.fetchFormOptions();
  }, [store]);

  return {
    formOptions: store.formOptions,
    isLoading: store.isLoading,
    error: store.error,
    refetch: store.refetch,
  };
};
