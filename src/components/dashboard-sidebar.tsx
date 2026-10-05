'use client';

import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { useLanguage } from '@/contexts/language-context';
import {
  Bot,
  Building2,
  Calendar,
  CreditCard,
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Shield,
  Stethoscope,
  UserCog,
  Users,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardSidebar() {
  const pathname = usePathname();
  const logout = useAuthStore((state) => state.logout);
  const role = useAuthStore((state) => state.role);
  const isMobileMenuOpen = useUIStore((state) => state.isMobileMenuOpen);
  const setMobileMenuOpen = useUIStore((state) => state.setMobileMenuOpen);
  const { t, isRTL } = useLanguage();

  const allMenuItems = [
    {
      key: 'dashboard',
      label: t('dashboard', 'Dashboard'),
      href: role === 'ADMIN' ? '/dashboard/admin' : '/dashboard',
      icon: LayoutDashboard,
      roles: ['MANAGER', 'ADMIN'],
    },
    // Manager Menu Items (Clinic Dashboard)
    {
      key: 'bookings',
      label: t('bookings', 'Bookings'),
      href: '/dashboard/bookings',
      icon: Calendar,
      roles: ['MANAGER'],
    },
    {
      key: 'allDoctors',
      label: t('allDoctors', 'All Doctors'),
      href: '/dashboard/doctors',
      icon: Stethoscope,
      roles: ['MANAGER'],
    },
    // Admin Menu Items (Main Control Panel)
    {
      key: 'clinics',
      label: t('clinics', 'Clinics'),
      href: '/dashboard/clinics',
      icon: Building2,
      roles: ['ADMIN'],
    },
    {
      key: 'doctors',
      label: t('doctors', 'Doctors'),
      href: '/dashboard/admin-doctors',
      icon: Stethoscope,
      roles: ['ADMIN'],
    },
    {
      key: 'patients',
      label: t('patients', 'Patients'),
      href: '/dashboard/patients',
      icon: Users,
      roles: ['ADMIN'],
    },
    {
      key: 'banners',
      label: t('banners', 'Banners'),
      href: '/dashboard/banners',
      icon: ImageIcon,
      roles: ['ADMIN'],
    },
    {
      key: 'specialists',
      label: t('specialists', 'Specialists'),
      href: '/dashboard/specialists',
      icon: UserCog,
      roles: ['ADMIN'],
    },
    {
      key: 'insurance',
      label: t('insurance', 'Insurance'),
      href: '/dashboard/insurance',
      icon: Shield,
      roles: ['ADMIN'],
    },
    {
      key: 'prepaidCards',
      label: t('prepaidCards', 'Prepaid Cards'),
      href: '/dashboard/prepaid-cards',
      icon: CreditCard,
      roles: ['ADMIN'],
    },
    {
      key: 'controlAi',
      label: t('controlAi', 'Control AI'),
      href: '/dashboard/control-ai',
      icon: Bot,
      roles: ['ADMIN'],
    },
    {
      key: 'otpSystem',
      label: t('otpSystem', 'OTP System'),
      href: '/dashboard/otp-system',
      icon: MessageSquare,
      roles: ['ADMIN'],
    },
    {
      key: 'legalAgreements',
      label: t('legalAgreements', 'Legal Agreements'),
      href: '/dashboard/legal-agreements',
      icon: FileText,
      roles: ['ADMIN'],
    },
  ];

  // Filter menu items based on user role
  const menuItems = allMenuItems.filter((item) => !role || item.roles.includes(role));

  const isActive = (href: string) => {
    if (href === '/dashboard' || href === '/dashboard/admin') {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(href + '/');
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Drawer classes based on RTL / LTR
  const drawerPositionClass = isRTL
    ? `right-0 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`
    : `left-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`;

  return (
    <>
      {/* Sidebar Drawer */}
      <aside
        className={`fixed inset-y-0 z-50 flex w-64 flex-col bg-gradient-to-b from-blue-600 to-blue-700 text-white shadow-xl transition-transform duration-300 ease-in-out md:static md:z-20 md:translate-x-0 ${drawerPositionClass}`}
      >
        {/* Logo & Header */}
        <div className="flex items-center justify-between border-b border-blue-500/60 p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
              <Image src="/Frame 1597884571.svg" alt="Salama Logo" width={36} height={36} />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-bold tracking-tight text-white truncate">Salama</h1>
              <p className="text-xs text-blue-100 truncate">
                {role === 'ADMIN' ? t('platformAdmin', 'Admin Panel') : t('clinicManager', 'Clinic Manager')}
              </p>
            </div>
          </div>

          {/* Close button for Mobile view */}
          <button
            onClick={closeMobileMenu}
            className="rounded-lg p-1.5 text-blue-100 hover:bg-blue-500 hover:text-white md:hidden"
            aria-label={t('closeMenu', 'Close Menu')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileMenu}
                className={`flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all ${active
                    ? 'bg-white font-semibold text-blue-700 shadow-sm'
                    : 'text-blue-100 hover:bg-blue-500/50 hover:text-white'
                  }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-blue-700' : 'text-blue-200'}`} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="border-t border-blue-500/60 p-3 sm:p-4">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start gap-2.5 text-blue-100 hover:bg-blue-500 hover:text-white text-sm"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>{t('logout', 'Logout')}</span>
          </Button>
        </div>
      </aside>

      {/* Mobile Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div
          onClick={closeMobileMenu}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm transition-opacity md:hidden"
          aria-hidden="true"
        />
      )}
    </>
  );
}
