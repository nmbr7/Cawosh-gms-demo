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

// Improved navigation links for sidebar, with unique icons and grouping example

export type SidebarLink = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  section?: string;
};

// Reordered based on typical operational/booking priority in garage apps

// Better organized links: grouped by logical "section", de-duplicated icons, consistent ordering, added section comments for maintainability.

export const links: SidebarLink[] = [
  // --- GENERAL ---
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    section: 'General',
  },
  {
    name: 'Calendar',
    href: '/schedule',
    icon: Calendar,
    section: 'General',
  },

  // --- BOOKINGS & CUSTOMERS ---
  {
    name: 'Bookings',
    href: '/bookings',
    icon: Handshake,
    section: 'Bookings',
  },
  {
    name: 'Customers',
    href: '/customers',
    icon: UsersIcon,
    section: 'Bookings',
  },

  // --- OPERATIONS: Jobs, Checks, Workshop, Stock ---
  {
    name: 'Job Sheet',
    href: '/job-sheet',
    icon: ClipboardList,
    section: 'Operations',
  },
  {
    name: 'Vehicle Health Score',
    href: '/vehicle-health-checks',
    icon: CheckCircle,
    section: 'Operations',
  },
  {
    name: 'Workshop',
    href: '/workshop',
    icon: Wrench,
    section: 'Workshop',
  },
  {
    name: 'MOT',
    href: '/mot',
    icon: Award,
    section: 'Workshop',
  },
  {
    name: 'Stock Management',
    href: '/inventory',
    icon: Package,
    section: 'Operations',
  },

  // --- FINANCE & APPROVALS ---
  {
    name: 'Approvals',
    href: '/approvals',
    icon: CheckCircle,
    section: 'Finance',
  },
  {
    name: 'Billings',
    href: '/billings',
    icon: Receipt,
    section: 'Finance',
  },

  // --- MANAGEMENT ---
  {
    name: 'Staff Management',
    href: '/users',
    icon: UsersIcon,
    section: 'Management',
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    section: 'Management',
  },

  // --- SUPPORT ---
  {
    name: 'Customer Support',
    href: '/customer-support',
    icon: HeadphonesIcon,
    section: 'Support',
  },
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
        sidebarOpen ? 'w-64' : 'w-16',
      )}
      aria-label="Sidebar navigation"
    >
      {/* Top: Logo + Nav */}
      <div>
        <div
          className={cn(
            'p-0 text-xl font-semibold border-b h-18 flex items-center transition-all bg-white border-gray-200',
            'justify-center',
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

        <nav className="flex flex-col gap-1 p-1" aria-label="Main navigation">
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
      <div className="p-1 border-t flex flex-row items-center">
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
          className="p-1 mr-2 rounded hover:bg-gray-100 transition focus:outline-none focus:ring-2 ring-blue-200"
        >
          {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>
    </aside>
  );
}
