"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { useUIStore } from "@/store/ui";
import Sidebar from "@/components/Sidebar";
import { cn } from "@/lib/utils";
import Header from "@/components/Header";
import { FormOptionsProvider } from "@/app/contexts/FormOptionsContext";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const user = useAuthStore((state) => state.user);
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      console.log("No user found, redirecting to login");
      router.replace("/login");
    } else {
      setIsLoading(false);
    }
  }, [user, router]);

  // Prevent any rendering until we know the auth state
  if (isLoading || !user) {
    return null;
  }

  return (
    <FormOptionsProvider>
      <div className="flex min-h-screen bg-gray-100">
        <div
          className={cn(
            "fixed top-0 left-0 h-full z-50 transition-all duration-300 ease-in-out",
            sidebarOpen ? "w-64" : "w-20"
          )}
        >
          <Sidebar />
        </div>
        <main
          className={cn(
            "flex-1 transition-all duration-300 ease-in-out",
            sidebarOpen ? "ml-64" : "ml-20"
          )}
        >
          <Header />
          <div className="p-6">{children}</div>
        </main>
      </div>
    </FormOptionsProvider>
  );
}
