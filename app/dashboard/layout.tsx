"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import Sidebar from "@/components/Sidebar";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/ui";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) return null; // Prevent flash

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main
        className={cn(
          "transition-all p-6 flex-1",
          sidebarOpen ? "ml-64" : "ml-16"
        )}
      >
        {children}
      </main>
    </div>
  );
}
