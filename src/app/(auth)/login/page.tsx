'use client';

import { FlagIcon } from '@/components/flag-icon';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { SUPPORTED_COUNTRIES, type Country } from '@/lib/countries';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth-store';
import { ChevronDown, MessageCircle, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const setPhoneNumber = useAuthStore((state) => state.setPhoneNumber);

  const [selectedCountry, setSelectedCountry] = useState<Country>(
    SUPPORTED_COUNTRIES[0] || { code: 'LY', name: 'Libya', dialCode: '+218', flag: '🇱🇾' }
  );
  const [phoneNumber, setPhoneNumberLocal] = useState('');
  const [otpSender, setOtpSender] = useState<'whatsapp' | 'sms'>('whatsapp');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setPhoneNumberLocal(value);
    setError('');
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneNumber || phoneNumber.length < 8) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = `${selectedCountry.dialCode}${phoneNumber}`;

      await authService.sendOtp({
        phoneNumber: formattedPhone,
        otpSender,
      });

      setPhoneNumber(formattedPhone);
      toast({
        title: 'Success',
        description: `OTP sent via ${otpSender === 'whatsapp' ? 'WhatsApp' : 'SMS'}`,
      });

      router.push('/verify-otp');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send OTP';
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        {/* Logo Section */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500">
            <Image src="/Frame 1597884571.svg" alt="Salama Logo" width={64} height={64} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Salama</h1>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSendOtp} className="space-y-6">
          <div>
            <h2 className="mb-2 text-3xl font-bold text-gray-900">Sign In</h2>
          </div>

          {/* Phone Number Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Phone number</label>
            <div className="relative flex gap-2">
              {/* Country Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex h-11 items-center gap-2 px-3"
                  >
                    <FlagIcon countryCode={selectedCountry.code} className="h-6 w-8" />
                    <span className="text-sm font-medium">{selectedCountry.dialCode}</span>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {SUPPORTED_COUNTRIES.map((country) => (
                    <DropdownMenuItem
                      key={country.code}
                      onClick={() => setSelectedCountry(country)}
                      className="flex cursor-pointer items-center gap-3 py-3"
                    >
                      <FlagIcon countryCode={country.code} className="h-6 w-8" />
                      <div className="flex flex-1 items-center justify-between">
                        <span className="font-medium">{country.name}</span>
                        <span className="text-sm text-gray-500">{country.dialCode}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Phone Number Input */}
              <Input
                type="tel"
                placeholder="Enter phone number"
                value={phoneNumber}
                onChange={handlePhoneChange}
                className="flex-1 text-base"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          {/* OTP Method Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Choose how to receive your code
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setOtpSender('whatsapp')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 font-medium transition-all ${
                  otpSender === 'whatsapp'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                }`}
              >
                <MessageCircle className="h-5 w-5" />
                WhatsApp
              </button>
              <button
                type="button"
                onClick={() => setOtpSender('sms')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 font-medium transition-all ${
                  otpSender === 'sms'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                }`}
              >
                <MessageSquare className="h-5 w-5" />
                SMS code
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading || !phoneNumber}
            className="w-full rounded-lg bg-blue-600 py-3 text-base font-semibold text-white hover:bg-blue-700"
          >
            {loading ? 'Sending...' : 'Continue'}
          </Button>
        </form>

        {/* Footer Info */}
        <p className="mt-6 text-center text-xs text-gray-500">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
