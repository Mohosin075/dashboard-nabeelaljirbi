'use client';

import { FlagIcon } from '@/components/flag-icon';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/language-context';
import { useToast } from '@/hooks/use-toast';
import { SUPPORTED_COUNTRIES, type Country } from '@/lib/countries';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth-store';
import {
  ChevronDown,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  MessageCircle,
  MessageSquare,
  Smartphone,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

type LoginMethod = 'OTP' | 'EMAIL';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t, tr } = useLanguage();

  const setPhoneNumber = useAuthStore((state) => state.setPhoneNumber);
  const setAuth = useAuthStore((state) => state.setAuth);

  const [loginMethod, setLoginMethod] = useState<LoginMethod>('OTP');

  // OTP Login States
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    SUPPORTED_COUNTRIES[0] || { code: 'LY', name: 'Libya', dialCode: '+218', flag: '🇱🇾' }
  );
  const [phoneNumber, setPhoneNumberLocal] = useState('');
  const [otpSender, setOtpSender] = useState<'whatsapp' | 'sms'>('whatsapp');

  // Email & Password Login States
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Common States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Forgot Password Modal States
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotEmailOrPhone, setForgotEmailOrPhone] = useState('');
  const [resetTokenInput, setResetTokenInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setPhoneNumberLocal(value);
    setError('');
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneNumber || phoneNumber.length < 8) {
      setError(tr('Please enter a valid phone number'));
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
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to send OTP';
      setError(tr(errorMessage));
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userEmail || !userPassword) {
      setError('Please enter email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await authService.adminLogin({
        email: userEmail,
        password: userPassword,
      });

      if (res?.data) {
        setAuth({
          accessToken: res.data.accessToken,
          refreshToken: res.data.refreshToken,
          role: res.data.role,
          profileCompleted: true,
        });
        if (userEmail) {
          setPhoneNumber(userEmail);
        }

        toast({
          title: 'Success',
          description: `Logged in successfully as ${res.data.role || 'User'}`,
        });

        if (res.data.role === 'ADMIN') {
          window.location.href = '/dashboard/admin';
        } else {
          window.location.href = '/dashboard';
        }
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errorMessages?.[0]?.message ||
        err?.message ||
        'Invalid credentials';
      setError(msg);
      toast({
        title: 'Login Failed',
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmailOrPhone.trim()) return;

    try {
      setForgotLoading(true);
      const res = await authService.forgotPassword({ emailOrPhone: forgotEmailOrPhone.trim() });
      toast({
        title: 'Reset Code Sent',
        description: res.message || 'Please check your email for reset code.',
      });
      setResetTokenInput('');
      setForgotStep(2);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.response?.data?.message || 'Failed to send reset code',
        variant: 'destructive',
      });
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTokenInput || !newPasswordInput) return;

    try {
      setForgotLoading(true);
      const res = await authService.resetPassword({
        token: resetTokenInput.trim(),
        newPassword: newPasswordInput.trim(),
      });
      toast({
        title: 'Success',
        description: res.message || 'Password reset successfully. You can now log in.',
      });
      setIsForgotOpen(false);
      setForgotStep(1);
      setUserPassword(newPasswordInput);
    } catch (err: any) {
      toast({
        title: 'Reset Failed',
        description: err?.response?.data?.message || 'Invalid code or request failed',
        variant: 'destructive',
      });
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-100 px-4 py-8">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-gray-100">
        {/* Logo Section */}
        <div className="mb-6 text-center">
          <div className="mb-3 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500 shadow-md">
            <Image src="/Frame 1597884571.svg" alt="Salama Logo" width={64} height={64} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Salama</h1>
          <p className="text-xs text-gray-500 mt-1">Healthcare Platform Portal</p>
        </div>

        {/* Login Method Toggle Tabs */}
        <div className="mb-6 flex rounded-xl bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => {
              setLoginMethod('OTP');
              setError('');
            }}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs sm:text-sm font-semibold transition-all ${
              loginMethod === 'OTP'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Smartphone className="h-4 w-4" />
            <span>{t('otpLogin', 'OTP Login')}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setLoginMethod('EMAIL');
              setError('');
            }}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs sm:text-sm font-semibold transition-all ${
              loginMethod === 'EMAIL'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Mail className="h-4 w-4" />
            <span>{t('emailPasswordLogin', 'Email & Password')}</span>
          </button>
        </div>

        {/* METHOD 1: OTP LOGIN */}
        {loginMethod === 'OTP' ? (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <h2 className="mb-1 text-2xl font-bold text-gray-900">{t('signIn')}</h2>
              <p className="text-xs text-gray-500">Phone OTP Authentication</p>
            </div>

            {/* Phone Number Input */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                {t('phoneNumber')}
              </label>
              <div className="relative flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex h-11 items-center gap-2 px-3 border-gray-300"
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
                        className="flex cursor-pointer items-center gap-3 py-2.5"
                      >
                        <FlagIcon countryCode={country.code} className="h-6 w-8" />
                        <div className="flex flex-1 items-center justify-between">
                          <span className="font-medium">
                            {t(country.name.toLowerCase(), country.name)}
                          </span>
                          <span className="text-sm text-gray-500">{country.dialCode}</span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Input
                  type="tel"
                  placeholder={t('enterPhoneNumber')}
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  className="flex-1 text-base h-11 border-gray-300"
                />
              </div>
              {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
            </div>

            {/* OTP Method Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                {t('chooseOtpMethod')}
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setOtpSender('whatsapp')}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl border-2 px-4 py-2.5 text-xs sm:text-sm font-medium transition-all ${
                    otpSender === 'whatsapp'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <MessageCircle className="h-4 w-4" />
                  {t('whatsapp')}
                </button>
                <button
                  type="button"
                  onClick={() => setOtpSender('sms')}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl border-2 px-4 py-2.5 text-xs sm:text-sm font-medium transition-all ${
                    otpSender === 'sms'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <MessageSquare className="h-4 w-4" />
                  {t('smsCode')}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !phoneNumber}
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 shadow-sm"
            >
              {loading ? t('sending') : t('continue')}
            </Button>
          </form>
        ) : (
          /* METHOD 2: EMAIL & PASSWORD LOGIN */
          <form onSubmit={handleEmailPasswordLogin} className="space-y-5">
            <div>
              <h2 className="mb-1 text-2xl font-bold text-gray-900">{t('signIn')}</h2>
              <p className="text-xs text-gray-500">Email & Password Authentication</p>
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type="email"
                  required
                  placeholder="user@salama.com"
                  value={userEmail}
                  onChange={(e) => {
                    setUserEmail(e.target.value);
                    setError('');
                  }}
                  className="pl-10 h-11 text-sm border-gray-300"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotOpen(true)}
                  className="text-xs font-semibold text-indigo-600 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={userPassword}
                  onChange={(e) => {
                    setUserPassword(e.target.value);
                    setError('');
                  }}
                  className="pl-10 pr-10 h-11 text-sm border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

            <Button
              type="submit"
              disabled={loading || !userEmail || !userPassword}
              className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 shadow-sm"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </Button>
          </form>
        )}

        {/* Footer Info */}
        <p className="mt-6 text-center text-xs text-gray-500">{t('agreeTerms')}</p>
      </div>

      {/* FORGOT PASSWORD DIALOG */}
      <Dialog open={isForgotOpen} onOpenChange={setIsForgotOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl p-6">
          <DialogHeader className="text-start">
            <div className="flex items-center gap-3 mb-1">
              <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
                <KeyRound className="h-6 w-6" />
              </div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                Reset Password
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-gray-500">
              {forgotStep === 1
                ? 'Enter your registered email address or phone number to receive a reset code.'
                : 'Enter the reset code sent to your email along with your new password.'}
            </DialogDescription>
          </DialogHeader>

          {forgotStep === 1 ? (
            <form onSubmit={handleRequestPasswordReset} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Email or Phone Number
                </label>
                <Input
                  type="text"
                  required
                  placeholder="user@salama.com or +218..."
                  value={forgotEmailOrPhone}
                  onChange={(e) => setForgotEmailOrPhone(e.target.value)}
                  className="h-11 text-sm border-gray-300"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsForgotOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={forgotLoading || !forgotEmailOrPhone}
                  className="bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-semibold"
                >
                  {forgotLoading ? 'Sending...' : 'Send Reset Code'}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Reset Token / Code
                </label>
                <Input
                  type="text"
                  required
                  placeholder="123456"
                  value={resetTokenInput}
                  onChange={(e) => setResetTokenInput(e.target.value)}
                  className="h-11 text-sm border-gray-300"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                  New Password
                </label>
                <Input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  className="h-11 text-sm border-gray-300"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setForgotStep(1)}
                  className="text-xs font-medium text-gray-500 hover:text-gray-700"
                >
                  ← Back
                </button>
                <Button
                  type="submit"
                  disabled={forgotLoading || !resetTokenInput || !newPasswordInput}
                  className="bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-semibold"
                >
                  {forgotLoading ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
