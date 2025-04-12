// /lib/auth.ts
import type { User } from "@/types/user";

export const MOCK_ADMIN: User = {
  id: 1,
  name: "Admin User",
  email: "admin@cawosh.com",
  role: "admin",
};

export function validateCredentials(
  email: string,
  password: string
): User | null {
  if (email === MOCK_ADMIN.email && password === "admin") {
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
