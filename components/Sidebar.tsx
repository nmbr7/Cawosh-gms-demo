"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { SignOut } from "phosphor-react";

import {
  SquaresFour,
  CalendarBlank,
  Note,
  Files,
  Wallet,
  Headphones,
  UserList,
  Gear,
  Package,
} from "phosphor-react";

import { useUIStore } from "@/store/ui";
import { useAuthStore } from "@/store/auth";

export const links = [
  { name: "Dashboard", href: "/dashboard", icon: SquaresFour },
  { name: "Calendar", href: "/schedule", icon: CalendarBlank },
  { name: "Bookings", href: "/bookings", icon: Note },
  { name: "Job Sheet", href: "/job-sheet", icon: Files },
  { name: "Billings", href: "/billings", icon: Wallet },
  { name: "Stock Management", href: "/inventory", icon: Package },
  {
    name: "Customer Support",
    href: "/customer-support",
    icon: Headphones,
  },
  { name: "Staff Management", href: "/users", icon: UserList },
  { name: "Settings", href: "/settings", icon: Gear },
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
        <div className="p-4 text-xl font-semibold border-b flex items-center justify-center">
          {sidebarOpen ? (
            "Cawosh Admin"
          ) : (
            // <Image
            //   src="/images/cawosh-logo-with-tm.jpg"
            //   alt="Cawosh Logo"
            //   width={200}
            //   height={50}
            //   className="object-contain"
            // />
            <Image
              src="/images/cawosh-logo.jpg"
              alt="Cawosh Logo"
              width={100}
              height={100}
              className="object-contain"
            />
          )}
        </div>

        <nav className="flex flex-col gap-1 p-3">
          {links.map(({ name, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-md text-base font-medium",
                pathname === href
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              )}
              onClick={() => {
                if (href === "/settings" && sidebarOpen) {
                  toggleSidebar();
                }
              }}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm">{name}</span>}
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
          <SignOut size={20} />
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
