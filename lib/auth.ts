import type { User } from "@/types/user";

// 1. Mock admin user
export const MOCK_ADMIN: User = {
  id: 1,
  name: "Admin User",
  email: "admin@cawosh.com",
  role: "admin",
};

// 2. Validate login credentials
export function validateCredentials(
  email: string,
  password: string
): User | null {
  if (email === MOCK_ADMIN.email && password === "admin") {
    return MOCK_ADMIN;
  }
  return null;
}
