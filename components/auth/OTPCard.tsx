import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { CustomButton } from "@/components/ui/custom-button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface OTPCardProps {
  email: string;
  onSubmit: (tempToken: string) => void;
}

export const OTPCard: React.FC<OTPCardProps> = ({ email, onSubmit }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(0, 1);
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if a number is entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp: otp.join(""),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to verify OTP");
        setLoading(false);
        return;
      }

      setSuccess(data.message || "OTP verified successfully");
      onSubmit(data.data.tempToken);
    } catch (error) {
      setError(
        `An error occurred: ${
          error instanceof Error ? error.message : "Please try again."
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
      <h2 className="text-2xl font-bold mb-4">Enter OTP</h2>
      <p className="text-sm text-gray-600 mb-4">
        We've sent a 6-digit code to {email}
      </p>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <div className="flex gap-2">
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                className="h-12 w-12 text-center"
                required
              />
            ))}
          </div>
        </div>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {success && <p className="text-green-500 text-sm mb-4">{success}</p>}
        <CustomButton type="submit" disabled={loading}>
          {loading ? <LoadingSpinner /> : "Verify OTP"}
        </CustomButton>
      </form>
    </div>
  );
};
