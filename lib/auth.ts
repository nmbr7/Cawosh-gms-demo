// /lib/auth.ts
import type { User } from '@/types/user';

export const MOCK_ADMIN: User = {
  _id: { $oid: '1' },
  employeeId: 'ADM001',
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@cawosh.com',
  phone: '',
  role: 'admin',
  position: 'System Administrator',
  status: 'active',
  permissions: ['all'],
  accessLevel: 1,
  department: 'IT',
  joiningDate: { $date: new Date().toISOString() },
  employmentType: 'full-time',
  workingHours: {
    start: '09:00',
    end: '17:00',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  },
  skills: [],
  certifications: [],
  systemAccess: {
    canManageUsers: true,
    canManageSettings: true,
    canViewReports: true,
    canManageBilling: true,
  },
  lastLogin: { $date: new Date().toISOString() },
  createdAt: { $date: new Date().toISOString() },
  updatedAt: { $date: new Date().toISOString() },
  __v: 0,
  userId: { $oid: '1' },
};

export function validateCredentials(
  email: string,
  password: string,
): User | null {
  if (email === MOCK_ADMIN.email && password === 'admin') {
    return MOCK_ADMIN;
  }
  return null;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function checkEmailExists(email: string): boolean {
  return email === MOCK_ADMIN.email;
}
