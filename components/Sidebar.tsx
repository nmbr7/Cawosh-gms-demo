"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Calendar,
  FileText,
  Receipt,
  HeadphonesIcon,
  UsersIcon,
} from "lucide-react";
import { useUIStore } from "@/store/ui";
import { useAuthStore } from "@/store/auth";

const links = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Calendar", href: "/schedule", icon: Calendar },
  { name: "Bookings", href: "/bookings", icon: FileText },
  { name: "Job Sheet", href: "/job-sheet", icon: FileText },
  { name: "Billings", href: "/billings", icon: Receipt },
  { name: "Customer Support", href: "/customer-support", icon: HeadphonesIcon },
  { name: "Staff Management", href: "/users", icon: UsersIcon },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    // Clear the auth store and handle all logout logic
    logout();
  };

  return (
    <aside
      className={cn(
        "h-screen bg-white shadow-md transition-all duration-300 ease-in-out flex flex-col justify-between",
        sidebarOpen ? "w-64" : "w-20"
      )}
    >
      {/* Top: Logo + Nav */}
      <div>
        <div className="p-4 text-xl font-semibold border-b">
          {sidebarOpen ? "Cawosh Admin" : "C"}
        </div>

        <nav className="flex flex-col gap-3 p-3">
          {links.map(({ name, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-md text-base font-medium",
                pathname === href
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <Icon className="w-6 h-6 flex-shrink-0" />
              {sidebarOpen && <span>{name}</span>}
            </Link>
          ))}
        </nav>
      </div>

      {/* Bottom: Logout + Toggle */}
      <div className="p-2 border-t flex flex-col gap-2">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 w-full px-2 py-1"
        >
          <LogOut className="w-4 h-4" />
          {sidebarOpen && <span>Logout</span>}
        </button>

        <button
          onClick={toggleSidebar}
          className="p-2 rounded hover:bg-gray-100 transition self-end"
        >
          {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>
    </aside>
  );
}
