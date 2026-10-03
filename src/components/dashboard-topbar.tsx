'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { useLanguage } from '@/contexts/language-context';
import { Bell, Check, Globe, LogOut, Menu, Settings, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardTopbar() {
  const router = useRouter();
  const phoneNumber = useAuthStore((state) => state.phoneNumber);
  const role = useAuthStore((state) => state.role);
  const logout = useAuthStore((state) => state.logout);
  const toggleMobileMenu = useUIStore((state) => state.toggleMobileMenu);
  const { language, setLanguage, t, isRTL } = useLanguage();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('goodMorning', 'Good Morning');
    if (hour < 18) return t('goodAfternoon', 'Good Afternoon');
    return t('goodEvening', 'Good Evening');
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const roleLabel =
    role === 'ADMIN'
      ? t('platformAdmin', 'Platform Administrator')
      : t('clinicManager', 'Clinic Manager');

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-4 sm:px-6">
      {/* Left / Start Side */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMobileMenu}
          className="text-gray-600 md:hidden hover:bg-slate-100"
          aria-label={t('openMenu', 'Open Menu')}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div>
          <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 line-clamp-1">
            {getGreeting()} 👋
          </h2>
          <span className="hidden sm:inline-block text-xs font-medium text-slate-500">
            {roleLabel}
          </span>
        </div>
      </div>

      {/* Right / End Side */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Language Switcher Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 px-2.5 sm:px-3 text-xs sm:text-sm font-medium border-slate-200 hover:bg-slate-50 text-slate-700"
            >
              <Globe className="h-4 w-4 text-blue-600" />
              <span className="font-semibold">
                {language === 'ar' ? 'العربية' : 'English'}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isRTL ? 'start' : 'end'} className="w-36">
            <DropdownMenuItem
              onClick={() => setLanguage('en')}
              className="flex items-center justify-between text-xs cursor-pointer font-medium"
            >
              <span className="flex items-center gap-2">
                <span className="text-base leading-none">🇺🇸</span>
                English
              </span>
              {language === 'en' && <Check className="h-4 w-4 text-blue-600" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setLanguage('ar')}
              className="flex items-center justify-between text-xs cursor-pointer font-medium"
            >
              <span className="flex items-center gap-2">
                <span className="text-base leading-none">🇸🇦</span>
                العربية
              </span>
              {language === 'ar' && <Check className="h-4 w-4 text-blue-600" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications Button */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 text-gray-600 hover:bg-slate-100"
          aria-label={t('notifications', 'Notifications')}
        >
          <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500"></span>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs sm:text-sm font-semibold text-white">
                {role === 'ADMIN' ? 'A' : 'M'}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isRTL ? 'start' : 'end'} className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{roleLabel}</span>
                <span className="text-xs text-gray-500 font-mono">{phoneNumber || '—'}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <User className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
              <span>{t('profile', 'Profile')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
              <span>{t('settings', 'Settings')}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-red-600" onClick={handleLogout}>
              <LogOut className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
              <span>{t('logout', 'Logout')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
