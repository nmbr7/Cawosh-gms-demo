'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Handshake,
  HeadphonesIcon,
  LayoutDashboard,
  LogOut,
  Receipt,
  Settings,
  UsersIcon,
  Wrench,
  Award,
  Package,
  CheckCircle,
} from 'lucide-react';
import { useUIStore } from '@/store/ui';
import { useAuthStore } from '@/store/auth';
import React from 'react';

// Navigation links for sidebar
export const links = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Calendar', href: '/schedule', icon: Calendar },
  { name: 'Bookings', href: '/bookings', icon: Handshake },
  { name: 'Job Sheet', href: '/job-sheet', icon: ClipboardList },
  { name: 'Stock Management', href: '/inventory', icon: Package },
  { name: 'Approvals', href: '/approvals', icon: CheckCircle },
  { name: 'Billings', href: '/billings', icon: Receipt },
  { name: 'Customer Support', href: '/customer-support', icon: HeadphonesIcon },
  { name: 'Workshop', href: '/workshop', icon: Wrench },
  { name: 'MOT', href: '/mot', icon: Award },
  { name: 'Staff Management', href: '/users', icon: UsersIcon },
  { name: 'Settings', href: '/settings', icon: Settings },
];

function SidebarLink({
  name,
  href,
  Icon,
  active,
  expanded,
}: {
  name: string;
  href: string;
  Icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  expanded: boolean;
}) {
  const linkContent = (
    <Link
      key={href}
      href={href}
      className={cn(
        'flex items-center gap-4 px-4 py-3 rounded-md text-base font-medium transition-colors focus:outline-none focus:ring-2 ring-blue-200',
        active
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-700 hover:bg-gray-100',
      )}
      tabIndex={0}
      aria-current={active ? 'page' : undefined}
    >
      <Icon className="w-6 h-6 flex-shrink-0" />
      {expanded && <span>{name}</span>}
    </Link>
  );

  // Show tooltip only when sidebar is collapsed
  if (!expanded) {
    return (
      <div className="relative group">
        {linkContent}
        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-black text-white text-sm rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          {name}
        </div>
      </div>
    );
  }

  return linkContent;
}

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const logout = useAuthStore((state) => state.logout);

  // NEW: State to help delay the label/links expanding
  const [expandText, setExpandText] = React.useState(sidebarOpen);

  // Delay for expansion in ms (syncs with tailwind transition duration-300)
  const TRANSITION_DELAY = 260;

  React.useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;

    if (sidebarOpen) {
      // Delay revealing the expanded text/icons until after transition
      timeout = setTimeout(() => setExpandText(true), TRANSITION_DELAY);
    } else {
      // Immediately hide text on collapse
      setExpandText(false);
      // No timeout needed on collapse
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [sidebarOpen]);

  // Improved: Accessibility, aria-label, keyboard cues
  const handleLogout = React.useCallback(() => {
    logout();
  }, [logout]);

  return (
    <aside
      className={cn(
        'h-screen bg-white shadow-md flex flex-col justify-between transition-all duration-300 ease-in-out',
        sidebarOpen ? 'w-64' : 'w-20',
      )}
      aria-label="Sidebar navigation"
    >
      {/* Top: Logo + Nav */}
      <div>
        <div
          className={cn(
            'p-4 text-xl font-semibold border-b h-18 flex items-center transition-all bg-white border-gray-200',
            sidebarOpen ? 'justify-start' : 'justify-center',
          )}
        >
          {expandText ? (
            <div className="w-full flex justify-center items-center">
              <Image
                src="/images/CawoshLogoBlack.png"
                alt="Fullscreen view"
                width={140}
                height={100}
                className="max-w-full max-h-[80vh] object-contain"
              />
            </div>
          ) : (
            <Image
              src="/images/cawosh-logo.jpg"
              alt="Fullscreen view"
              width={110}
              height={100}
              className="max-w-full max-h-[80vh] object-contain"
            />
          )}
        </div>

        <nav className="flex flex-col gap-2 p-3" aria-label="Main navigation">
          {links.map(({ name, href, icon }) => (
            <SidebarLink
              key={href}
              name={name}
              href={href}
              Icon={icon}
              active={pathname === href}
              expanded={expandText}
            />
          ))}
        </nav>
      </div>

      {/* Bottom: Logout + Collapse Toggle */}
      <div className="p-2 border-t flex flex-row items-center gap-2">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 w-full px-2 py-2 rounded transition-colors focus:outline-none focus:ring-2 ring-red-200"
          aria-label="Logout"
        >
          <LogOut className="w-4 h-4" />
          {expandText && <span>Logout</span>}
        </button>
        <button
          onClick={toggleSidebar}
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          className="p-2 rounded hover:bg-gray-100 transition focus:outline-none focus:ring-2 ring-blue-200"
          style={{ minWidth: 36, minHeight: 36 }}
        >
          {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>
    </aside>
  );
}
