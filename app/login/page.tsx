// app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { CustomButton } from "@/components/ui/custom-button";
import { PasswordInput } from "@/components/ui/password-input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useGarageStore } from "@/store/garage";

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
        setIsLoading(false);
        return;
      }

      // // Set the user in the auth store with the complete user data
      // setUser({
      //   _id: data.data.user._id,
      //   employeeId: data.data.user.employeeId,
      //   firstName: data.data.user.firstName,
      //   lastName: data.data.user.lastName,
      //   email: data.data.user.email,
      //   phone: data.data.user.phone,
      //   role: data.data.user.role,
      //   position: data.data.user.position,
      //   status: data.data.user.status,
      //   permissions: data.data.permissions,
      //   accessLevel: data.data.user.accessLevel,
      //   department: data.data.user.department,
      //   joiningDate: data.data.user.joiningDate,
      //   employmentType: data.data.user.employmentType,
      //   workingHours: data.data.user.workingHours,
      //   skills: data.data.user.skills,
      //   certifications: data.data.user.certifications,
      //   systemAccess: data.data.systemAccess,
      //   lastLogin: data.data.user.lastLogin,
      //   createdAt: data.data.user.createdAt,
      //   updatedAt: data.data.user.updatedAt,
      //   __v: data.data.user.__v,
      //   userId: data.data.user.userId
      // });

      // Wait for the cookie to be set and auth store to be updated
      await new Promise(resolve => setTimeout(resolve, 100));

      // Navigate to dashboard
      router.push("/dashboard");
      setIsLoading(false);
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm"
      >
        <h1 className="text-2xl font-bold mb-4">Login</h1>

        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium">Password</label>
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <div className="mb-4 text-right">
          <Link
            href="/forgot-password"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Forgot Password?
          </Link>
        </div>

        <CustomButton type="submit" disabled={isLoading}>
          {isLoading ? <LoadingSpinner /> : "Login"}
        </CustomButton>
      </form>
    </div>
  );
}
