'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EmailCard } from '@/components/auth/EmailCard';
import { OTPCard } from '@/components/auth/OTPCard';
import { NewPasswordCard } from '@/components/auth/NewPasswordCard';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'otp' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [tempToken, setTempToken] = useState('');

  const handleEmailSubmit = (email: string) => {
    setEmail(email);
    setStep('otp');
  };

  const handleOTPSubmit = (token: string) => {
    setTempToken(token);
    setStep('password');
  };

  const handlePasswordSubmit = () => {
    router.push('/login?message=Password reset successful');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {step === 'email' && <EmailCard onSubmit={handleEmailSubmit} />}
      {step === 'otp' && <OTPCard email={email} onSubmit={handleOTPSubmit} />}
      {step === 'password' && (
        <NewPasswordCard
          tempToken={tempToken}
          onSubmit={handlePasswordSubmit}
        />
      )}
    </div>
  );
}
