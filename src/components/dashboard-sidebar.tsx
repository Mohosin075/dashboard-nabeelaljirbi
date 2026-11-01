'use client';

import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { useLanguage } from '@/contexts/language-context';
import {
  BadgeCheck,
  BarChart3,
  Bell,
  Bot,
  Building2,
  CalendarCheck,
  CalendarClock,
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
  Wallet,
  Activity,
  DollarSign,
  Receipt,
  MessageSquareWarning,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { checkRouteAccess } from '@/lib/route-permissions';

export default function DashboardSidebar() {
  const pathname = usePathname();
  const logout = useAuthStore((state) => state.logout);
  const role = useAuthStore((state) => state.role);
  const adminTier = useAuthStore((state) => state.adminTier) || 'SUPER_ADMIN';
  const isMobileMenuOpen = useUIStore((state) => state.isMobileMenuOpen);
  const setMobileMenuOpen = useUIStore((state) => state.setMobileMenuOpen);
  const { t, isRTL } = useLanguage();

  const allMenuItems = [
    // -------------------------------------------------------------------------
    // 1. OVERVIEW & COMMAND CENTER (Top Priority for all roles)
    // -------------------------------------------------------------------------
    {
      key: 'dashboard',
      label: t('dashboard', 'Dashboard'),
      href: role === 'ADMIN' ? '/dashboard/admin' : '/dashboard',
      icon: LayoutDashboard,
      section: t('overview', 'Overview'),
      roles: ['ADMIN', 'CLINIC', 'MANAGER'],
    },
    {
      key: 'doctorOverview',
      label: t('doctorDashboard', 'Doctor Dashboard'),
      href: '/dashboard/doctor-overview',
      icon: LayoutDashboard,
      section: t('overview', 'Overview'),
      roles: ['DOCTOR'],
    },

    // -------------------------------------------------------------------------
    // 2. CORE OPERATIONS & PATIENT FLOW
    // -------------------------------------------------------------------------
    {
      key: 'bookingManagement',
      label: t('bookingManagement', 'Booking Management'),
      href: '/dashboard/booking-management',
      icon: CalendarCheck,
      section: t('operations', 'Operations'),
    },
    {
      key: 'clinics',
      label: t('clinics', 'Clinics'),
      href: '/dashboard/clinics',
      icon: Building2,
      section: t('operations', 'Operations'),
      roles: ['ADMIN'],
    },
    {
      key: 'clinicDoctors',
      label: t('doctors', 'Doctors'),
      href: '/dashboard/doctors',
      icon: Stethoscope,
      section: t('operations', 'Operations'),
      roles: ['CLINIC', 'MANAGER'],
    },
    {
      key: 'adminDoctors',
      label: t('doctors', 'Doctors'),
      href: '/dashboard/admin-doctors',
      icon: Stethoscope,
      section: t('operations', 'Operations'),
      roles: ['ADMIN'],
    },
    {
      key: 'schedules',
      label: t('schedules', 'Schedules'),
      href: '/dashboard/schedules',
      icon: CalendarClock,
      section: t('operations', 'Operations'),
      roles: ['CLINIC', 'MANAGER'],
    },
    {
      key: 'patients',
      label: t('patients', 'Patients'),
      href: '/dashboard/patients',
      icon: Users,
      section: t('operations', 'Operations'),
      roles: ['ADMIN'],
    },
    {
      key: 'receptionists',
      label: t('receptionists', 'Receptionists'),
      href: '/dashboard/receptionists',
      icon: Users,
      section: t('operations', 'Operations'),
      roles: ['ADMIN', 'CLINIC'],
    },

    // -------------------------------------------------------------------------
    // 3. FINANCE, WALLETS & SETTLEMENTS
    // -------------------------------------------------------------------------
    {
      key: 'clinicFinancials',
      label: t('financials', 'Financials'),
      href: '/dashboard/financials',
      icon: Wallet,
      section: t('financeAndPayouts', 'Finance & Settlements'),
      roles: ['CLINIC'], // Clinic-specific financial dashboard
    },
    {
      key: 'platformFinancials',
      label: t('platformFinancials', 'Financials & Wallet'),
      href: '/dashboard/platform-financials',
      icon: DollarSign,
      section: t('financeAndPayouts', 'Finance & Settlements'),
      roles: ['ADMIN'],
    },
    {
      key: 'countryFinance',
      label: t('countryFinance', 'Country Finance'),
      href: '/dashboard/country-finance',
      icon: DollarSign,
      section: t('financeAndPayouts', 'Finance & Settlements'),
      roles: ['ADMIN'],
    },
    {
      key: 'settlements',
      label: t('settlements', 'Settlements'),
      href: '/dashboard/settlements',
      icon: Receipt,
      section: t('financeAndPayouts', 'Finance & Settlements'),
      roles: ['ADMIN', 'CLINIC'],
    },
    {
      key: 'payoutProfile',
      label: t('payoutProfile', 'Bank Details & Withdrawals'),
      href: '/dashboard/payout-profile',
      icon: Wallet,
      section: t('financeAndPayouts', 'Finance & Settlements'),
      roles: ['CLINIC', 'DOCTOR'],
    },
    {
      key: 'prepaidCards',
      label: t('prepaidCards', 'Prepaid Cards'),
      href: '/dashboard/prepaid-cards',
      icon: CreditCard,
      section: t('financeAndPayouts', 'Finance & Settlements'),
      roles: ['ADMIN'],
    },
    {
      key: 'ledgerReports',
      label: t('ledgerReports', 'Wallet Ledger & Reports'),
      href: '/dashboard/ledger-reports',
      icon: FileText,
      section: t('financeAndPayouts', 'Finance & Settlements'),
      roles: ['ADMIN', 'CLINIC', 'DOCTOR'],
    },
    {
      key: 'reports',
      label: t('reports', 'Reports'),
      href: '/dashboard/reports',
      icon: BarChart3,
      section: t('financeAndPayouts', 'Finance & Settlements'),
      roles: ['CLINIC', 'ADMIN'],
    },

    // -------------------------------------------------------------------------
    // 4. TRUST, QUALITY & CUSTOMER SUPPORT
    // -------------------------------------------------------------------------
    {
      key: 'complaints',
      label: t('complaints', 'Complaints'),
      href: '/dashboard/complaints',
      icon: MessageSquareWarning,
      section: t('supportAndTrust', 'Support & Trust'),
      roles: ['ADMIN'],
    },
    {
      key: 'verifications',
      label: t('verifications', 'Blue Badge'),
      href: '/dashboard/verifications',
      icon: BadgeCheck,
      section: t('supportAndTrust', 'Support & Trust'),
      roles: ['ADMIN'],
    },
    {
      key: 'specialists',
      label: t('specialists', 'Specialists'),
      href: '/dashboard/specialists',
      icon: UserCog,
      section: t('supportAndTrust', 'Support & Trust'),
      roles: ['ADMIN'],
    },
    {
      key: 'insurance',
      label: t('insurance', 'Insurance'),
      href: '/dashboard/insurance',
      icon: Shield,
      section: t('supportAndTrust', 'Support & Trust'),
      roles: ['ADMIN'],
    },
    {
      key: 'otpSystem',
      label: t('otpSystem', 'OTP System'),
      href: '/dashboard/otp-system',
      icon: MessageSquare,
      section: t('supportAndTrust', 'Support & Trust'),
      roles: ['ADMIN'],
    },

    // -------------------------------------------------------------------------
    // 5. GOVERNANCE, SETTINGS & PLATFORM ADMINISTRATION
    // -------------------------------------------------------------------------
    {
      key: 'accountControls',
      label: t('accountControls', 'Account Controls'),
      href: '/dashboard/account-controls',
      icon: Shield,
      section: t('systemAndSettings', 'Governance & Settings'),
      roles: ['ADMIN'],
    },
    {
      key: 'profileChanges',
      label: t('profileChanges', 'Profile Changes'),
      href: '/dashboard/profile-changes',
      icon: UserCog,
      section: t('systemAndSettings', 'Governance & Settings'),
      roles: ['ADMIN', 'CLINIC', 'DOCTOR'],
    },
    {
      key: 'bookingSettings',
      label: t('bookingSettings', 'Booking Settings'),
      href: '/dashboard/booking-settings',
      icon: CalendarClock,
      section: t('systemAndSettings', 'Governance & Settings'),
      roles: ['ADMIN'],
    },
    {
      key: 'notifications',
      label: t('notifications', 'Notifications'),
      href: '/dashboard/notifications',
      icon: Bell,
      section: t('systemAndSettings', 'Governance & Settings'),
      roles: ['CLINIC', 'MANAGER'],
    },
    {
      key: 'notificationTemplates',
      label: t('notificationTemplates', 'Notification Templates'),
      href: '/dashboard/notification-templates',
      icon: Bell,
      section: t('systemAndSettings', 'Governance & Settings'),
      roles: ['ADMIN'],
    },
    {
      key: 'controlAi',
      label: t('controlAi', 'Control AI'),
      href: '/dashboard/control-ai',
      icon: Bot,
      section: t('systemAndSettings', 'Governance & Settings'),
      roles: ['ADMIN'],
    },
    {
      key: 'banners',
      label: t('banners', 'Banners'),
      href: '/dashboard/banners',
      icon: ImageIcon,
      section: t('systemAndSettings', 'Governance & Settings'),
      roles: ['ADMIN'],
    },
    {
      key: 'legalAgreements',
      label: t('legalAgreements', 'Legal Agreements'),
      href: '/dashboard/legal-agreements',
      icon: FileText,
      section: t('systemAndSettings', 'Governance & Settings'),
      roles: ['ADMIN'],
    },
    {
      key: 'adminStaff',
      label: t('adminStaff', 'Admin Team (5 Tiers)'),
      href: '/dashboard/admin-staff',
      icon: Shield,
      section: t('systemAndSettings', 'Governance & Settings'),
      roles: ['ADMIN'],
    },
    {
      key: 'auditLogs',
      label: t('auditLogs', 'Audit Log'),
      href: '/dashboard/audit-logs',
      icon: Activity,
      section: t('systemAndSettings', 'Governance & Settings'),
      roles: ['ADMIN'],
    },
  ];

  // Filter menu items strictly based on role scope & centralized route permissions
  const menuItems = allMenuItems.filter((item) => {
    // If item has explicit role restriction, check that first
    if (item.roles && !item.roles.includes(role as any)) {
      return false;
    }
    const access = checkRouteAccess(item.href, role, adminTier);
    return access.hasAccess;
  });

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

  const showSectionHeaders = menuItems.length > 7;

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
              <div className="text-xs text-blue-100 flex items-center gap-1.5 flex-wrap">
                <span className="truncate">
                  {role === 'ADMIN'
                    ? t('platformAdmin', 'Admin Panel')
                    : role === 'CLINIC'
                    ? t('clinicAdmin', 'Clinic Admin')
                    : role === 'DOCTOR'
                    ? t('doctor', 'Doctor')
                    : t('clinicStaff', 'Clinic Staff')}
                </span>
                {role === 'ADMIN' && (
                  <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/80 text-white uppercase tracking-wider">
                    {adminTier.replace('_', ' ')}
                  </span>
                )}
              </div>
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
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const isFirstInSection =
              showSectionHeaders &&
              item.section &&
              (index === 0 || menuItems[index - 1]?.section !== item.section);

            return (
              <div key={item.href} className="space-y-1">
                {isFirstInSection && (
                  <p
                    className={`px-3.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-blue-200/70 ${
                      index === 0 ? 'pt-1' : 'pt-3.5'
                    }`}
                  >
                    {item.section}
                  </p>
                )}
                <Link
                  href={item.href}
                  onClick={closeMobileMenu}
                  className={`flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all ${
                    active
                      ? 'bg-white font-semibold text-blue-700 shadow-sm'
                      : 'text-blue-100 hover:bg-blue-500/50 hover:text-white'
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-blue-700' : 'text-blue-200'}`} />
                  <span className="truncate">{item.label}</span>
                </Link>
              </div>
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
