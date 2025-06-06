"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { CustomButton } from "@/components/ui/custom-button";
import { validateEmail } from "@/lib/auth";
import { PasswordInput } from "@/components/ui/password-input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState<string[]>(
    Array(6).fill("")
  );
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [step, setStep] = useState<"email" | "code" | "password">("email");
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, verificationCode.length);
  }, [verificationCode]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (!email) {
      setError("Please enter your email address");
      setIsLoading(false);
      return;
    }

    const isValidEmail = validateEmail(email);
    if (!isValidEmail) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    try {
      // Check if email exists
      const checkEmailResponse = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const checkEmailData = await checkEmailResponse.json();

      if (!checkEmailResponse.ok) {
        setError(checkEmailData.error);
        setIsLoading(false);
        return;
      }

      // Send OTP
      const sendOtpResponse = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const sendOtpData = await sendOtpResponse.json();

      if (!sendOtpResponse.ok) {
        setError(sendOtpData.error);
        setIsLoading(false);
        return;
      }

      setStep("code");
      setSuccess(sendOtpData.message);
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(0, 1);
    }

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Move to next input if a number is entered
    if (value && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleContinue = async () => {
    const code = verificationCode.join("");
    if (code.length !== 5) {
      setError("Please enter the complete verification code");
      return;
    }
    await validateVerificationCode(code);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const validateVerificationCode = async (code: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
        setIsLoading(false);
        return;
      }

      setStep("password");
      setError("");
      setSuccess("");
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (!newPassword || !confirmPassword) {
      setError("Please enter and confirm your new password");
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
        setIsLoading(false);
        return;
      }

      setSuccess(data.message);
      // Clear any existing token before redirecting to login
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={
          step === "email"
            ? handleEmailSubmit
            : step === "password"
            ? handlePasswordSubmit
            : undefined
        }
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm"
      >
        {step !== "password" && (
          <h1 className="text-2xl font-bold mb-2">Reset Password</h1>
        )}

        {step === "email" ? (
          <>
            <p className="text-sm text-gray-600 mb-4">
              Enter your registered email address to receive a verification code
              for resetting your password
            </p>
            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="h-12"
                required
              />
            </div>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            {success && (
              <p className="text-green-500 text-sm mb-4">{success}</p>
            )}

            <CustomButton type="submit" className="mb-4" disabled={isLoading}>
              {isLoading ? <LoadingSpinner /> : "Send Verification Code"}
            </CustomButton>
          </>
        ) : step === "code" ? (
          <>
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">
                A code has been sent to your email. Enter the verification code
                sent to your registered email to proceed with password reset.
              </p>
              <label className="block mb-1 text-sm font-medium">
                Verification Code
              </label>
              <div className="flex gap-3">
                {verificationCode.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="h-14 w-14 text-center text-2xl"
                    required
                    disabled={isLoading}
                  />
                ))}
              </div>
            </div>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <CustomButton
              type="button"
              onClick={handleContinue}
              disabled={isLoading || verificationCode.some((digit) => !digit)}
              className="w-full"
            >
              {isLoading ? <LoadingSpinner /> : "Continue"}
            </CustomButton>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-2">Set new password</h1>
            <p className="text-sm text-gray-600 mb-4">
              Your new password must be at least 8 characters long. Make sure
              it&apos;s strong and not used elsewhere
            </p>
            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium">
                New Password
              </label>
              <PasswordInput
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter your new password"
                required
                disabled={isLoading}
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium">
                Confirm Password
              </label>
              <PasswordInput
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                required
                disabled={isLoading}
              />
            </div>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            {success && (
              <p className="text-green-500 text-sm mb-4">{success}</p>
            )}

            <CustomButton type="submit" disabled={isLoading}>
              {isLoading ? <LoadingSpinner /> : "Reset Password"}
            </CustomButton>
          </>
        )}

        <div className="text-center mt-8">
          <Link
            href="/login"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
}
