'use client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth-store';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function VerifyOtpPage() {
  const router = useRouter();
  const { toast } = useToast();
  const phoneNumber = useAuthStore((state) => state.phoneNumber);
  const setAuth = useAuthStore((state) => state.setAuth);

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect if no phone number is set
  useEffect(() => {
    if (!phoneNumber) {
      router.push('/login');
    }
  }, [phoneNumber, router]);

  // Timer effect
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(0, 1);
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    if (!phoneNumber) {
      setError('Phone number not found');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.verifyOtp({
        phoneNumber,
        otp: otpString,
      });

      setAuth({
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
        role: response.data.role,
        profileCompleted: response.data.profileCompleted,
      });

      toast({
        title: 'Success',
        description: 'OTP verified successfully',
      });

      // Redirect based on role
      if (response.data.role === 'MANAGER') {
        router.push('/dashboard/bookings');
      } else if (response.data.role === 'ADMIN') {
        router.push('/dashboard/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid OTP';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => router.push('/login')}
          className="mb-6 flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
        >
          <ChevronLeft className="h-5 w-5" />
          Back
        </button>

        <div className="rounded-2xl bg-white p-8 shadow-xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">Verify OTP</h1>
            <p className="text-gray-600">
              Enter the 6-digit code sent to <span className="font-semibold">{phoneNumber}</span>
            </p>
          </div>

          <form onSubmit={handleVerifyOtp} className="space-y-8">
            {/* OTP Input Fields */}
            <div className="space-y-4">
              <div className="flex justify-center gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="h-14 w-14 rounded-lg border-2 border-gray-300 text-center text-2xl font-bold transition-colors focus:border-blue-500 focus:outline-none"
                  />
                ))}
              </div>
              {error && <p className="text-center text-sm text-red-500">{error}</p>}
            </div>

            {/* Timer */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Code expires in{' '}
                <span
                  className={`font-semibold ${timeLeft < 60 ? 'text-red-500' : 'text-gray-900'}`}
                >
                  {formatTime(timeLeft)}
                </span>
              </p>
              {timeLeft < 60 && <p className="mt-1 text-xs text-red-500">Hurry up!</p>}
            </div>

            {/* Verify Button */}
            <Button
              type="submit"
              disabled={loading || otp.join('').length !== 6}
              className="w-full rounded-lg bg-blue-600 py-3 text-base font-semibold text-white hover:bg-blue-700"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </Button>
          </form>

          {/* Resend OTP */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <p className="text-center text-sm text-gray-600">
              Didn't receive the code?{' '}
              <button
                onClick={() => router.push('/login')}
                className="font-semibold text-blue-600 transition-colors hover:text-blue-700"
              >
                Request new code
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
