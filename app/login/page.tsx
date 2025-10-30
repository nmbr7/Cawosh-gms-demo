// app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
// import { useAuthStore } from "@/store/auth";
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { CustomButton } from '@/components/ui/custom-button';
import { PasswordInput } from '@/components/ui/password-input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
// import { useGarageStore } from "@/store/garage";
import Image from 'next/image';

export default function SignInPage() {
  const router = useRouter();
  // const setUser = useAuthStore((state) => state.setUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, tenantId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Sign in failed');
        setIsLoading(false);
        return;
      }

      // // Optionally set auth store user here

      // Wait for any auth state to update, if needed
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Navigate to dashboard
      router.push('/dashboard');
      setIsLoading(false);
    } catch (error) {
      console.error('Sign in error:', error);
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md">
        <form
          onSubmit={handleSignIn}
          className="bg-white py-10 px-8 rounded-xl shadow-lg w-full"
        >
          <div className="flex flex-col items-center mb-8">
            <Image
              src="/images/CawoshLogoBlack.png"
              alt="Cawosh Logo"
              width={200}
              height={48}
              className="mt-5 mb-10"
              priority
            />
            <h1 className="text-3xl mb-2">Sign In</h1>
          </div>

          <div className="flex flex-col gap-5">
            {/* Tenant ID Field */}
            <div className="flex flex-col">
              <label
                htmlFor="tenantId"
                className="block mb-1 text-[15px] font-medium leading-5"
              >
                Org/Tenant ID
              </label>
              <Input
                id="tenantId"
                name="tenantId"
                type="text"
                autoComplete="organization"
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                className="h-12 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 transition placeholder:text-gray-400"
                required
                placeholder="Enter your org or tenant ID"
              />
            </div>

            {/* Email Field */}
            <div className="flex flex-col">
              <label
                htmlFor="email"
                className="block mb-1 text-[15px] font-medium leading-5"
              >
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 transition placeholder:text-gray-400"
                required
                placeholder="Enter your email address"
              />
            </div>

            {/* Password Field */}
            <div className="flex flex-col">
              <label
                htmlFor="password"
                className="block mb-1 text-[15px] font-medium leading-5"
              >
                Password
              </label>
              <PasswordInput
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 transition placeholder:text-gray-400"
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <div className="flex items-center justify-end mt-1">
                <Link
                  href="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-800 transition font-medium"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center mt-3 mb-0">
              {error}
            </p>
          )}

          <CustomButton
            type="submit"
            disabled={isLoading}
            className="w-full h-12 text-base font-semibold mt-8 bg-neutral-900 hover:bg-neutral-800 text-white rounded-md transition"
          >
            {isLoading ? <LoadingSpinner /> : 'Sign In'}
          </CustomButton>
        </form>
      </div>
    </div>
  );
}
