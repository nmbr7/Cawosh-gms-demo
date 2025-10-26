"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { useUIStore } from "@/store/ui";
import Sidebar from "@/components/Sidebar";
import { cn } from "@/lib/utils";
import Header from "@/components/Header";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [, setIsLoading] = useState(true);
  const user = useAuthStore((state) => state.user);
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (!user) {
      console.log("No user found, redirecting to login");
      router.replace("/login");
    } else {
      setIsLoading(false);
    }
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [user, router]);

  // Prevent any rendering until we know the auth state
  // if (isLoading || !user) {
  //   return null;
  // }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {!isMobile && (
        <div
          className={cn(
            "fixed top-0 left-0 h-full z-50 transition-all duration-300 ease-in-out",
            sidebarOpen ? "w-64" : "w-20"
          )}
        >
          <Sidebar />
        </div>
      )}
      <main
        className={cn(
          "flex-1 transition-all duration-300 ease-in-out min-h-screen flex flex-col",
          sidebarOpen ? "ml-64" : "ml-20",
          isMobile ? "ml-0" : ""
        )}
      >
        <Header />
        <div className="flex-1 overflow-x-auto overflow-y-auto p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
