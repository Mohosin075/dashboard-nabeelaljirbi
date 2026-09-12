'use client';

import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth-store';
import {
    Bot,
    Building2,
    Calendar,
    CreditCard,
    Image as ImageIcon,
    LayoutDashboard,
    LogOut,
    Menu,
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
import { useState } from 'react';

export default function DashboardSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const logout = useAuthStore((state) => state.logout);
  const role = useAuthStore((state) => state.role);

  const allMenuItems = [
    {
      label: 'Dashboard',
      href: role === 'ADMIN' ? '/dashboard/admin' : '/dashboard',
      icon: LayoutDashboard,
      roles: ['MANAGER', 'ADMIN'],
    },
    // Manager Menu Items
    {
      label: 'Bookings',
      href: '/dashboard/bookings',
      icon: Calendar,
      roles: ['MANAGER'],
    },
    {
      label: 'All Doctors',
      href: '/dashboard/doctors',
      icon: Stethoscope,
      roles: ['MANAGER'],
    },
    // Admin Menu Items
    {
      label: 'Clinics',
      href: '/dashboard/clinics',
      icon: Building2,
      roles: ['ADMIN'],
    },
    {
      label: 'Doctors',
      href: '/dashboard/admin-doctors',
      icon: Stethoscope,
      roles: ['ADMIN'],
    },
    {
      label: 'Patients',
      href: '/dashboard/patients',
      icon: Users,
      roles: ['ADMIN'],
    },
    {
      label: 'Banners',
      href: '/dashboard/banners',
      icon: ImageIcon,
      roles: ['ADMIN'],
    },
    {
      label: 'Specialists',
      href: '/dashboard/specialists',
      icon: UserCog,
      roles: ['ADMIN'],
    },
    {
      label: 'Insurance',
      href: '/dashboard/insurance',
      icon: Shield,
      roles: ['ADMIN'],
    },
    // {
    //   label: 'Patient Subscriptions',
    //   href: '/dashboard/patient-subscriptions',
    //   icon: CreditCard,
    //   roles: ['ADMIN'],
    // },
    // {
    //   label: 'Clinic Subscriptions',
    //   href: '/dashboard/clinic-subscriptions',
    //   icon: CreditCard,
    //   roles: ['ADMIN'],
    // },
    {
      label: 'Prepaid Cards',
      href: '/dashboard/prepaid-cards',
      icon: CreditCard,
      roles: ['ADMIN'],
    },
    {
      label: 'Control AI',
      href: '/dashboard/control-ai',
      icon: Bot,
      roles: ['ADMIN'],
    },
    {
      label: 'OTP System',
      href: '/dashboard/otp-system',
      icon: MessageSquare,
      roles: ['ADMIN'],
    },
  ];

  // Filter menu items based on user role
  const menuItems = allMenuItems.filter((item) => !role || item.roles.includes(role));

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-4 z-50 rounded-lg bg-white p-2 shadow-md md:hidden"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-blue-600 to-blue-700 text-white transition-transform duration-300 ease-in-out md:relative md:translate-x-0`}
      >
        {/* Logo */}
        <div className="border-b border-blue-500 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
              <Image src="/Frame 1597884571.svg" alt="Salama Logo" width={40} height={40} />
            </div>
            <div>
              <h1 className="text-lg font-bold">Salama</h1>
              <p className="text-xs text-blue-100">Clinic Manager</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-all ${
                    isActive(item.href)
                      ? 'bg-white font-semibold text-blue-600'
                      : 'text-blue-100 hover:bg-blue-600'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="border-t border-blue-500 p-4">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-blue-100 hover:bg-blue-600 hover:text-white"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
        />
      )}
    </>
  );
}
