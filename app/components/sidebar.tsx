import { Calendar, Users, Settings, BookOpen } from 'lucide-react';
import React from 'react';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const navigation: NavigationItem[] = [
  { name: 'Schedule', href: '/dashboard/schedule', icon: Calendar },
  { name: 'Bookings', href: '/dashboard/bookings', icon: BookOpen },
  { name: 'Customers', href: '/dashboard/customers', icon: Users },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]; 