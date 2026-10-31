export type UserRole = 'ADMIN' | 'CLINIC' | 'MANAGER' | 'DOCTOR' | 'PATIENT';
export type AdminTier = 'SUPER_ADMIN' | 'OPERATIONS' | 'FINANCE' | 'SUPPORT' | 'READ_ONLY';

export interface RouteRule {
  path: string;
  name: string;
  nameAr: string;
  allowedRoles: UserRole[];
  allowedTiers?: AdminTier[];
  description?: string;
}

export const ROUTE_PERMISSIONS: RouteRule[] = [
  { path: '/dashboard/doctor-overview', name: 'Doctor Dashboard', nameAr: 'لوحة الطبيب', allowedRoles: ['DOCTOR'] },
  { path: '/dashboard/booking-management', name: 'Booking Management', nameAr: 'إدارة الحجوزات', allowedRoles: ['ADMIN', 'CLINIC', 'MANAGER', 'DOCTOR'], allowedTiers: ['SUPER_ADMIN', 'OPERATIONS', 'FINANCE', 'SUPPORT', 'READ_ONLY'] },
  { path: '/dashboard/profile-changes', name: 'Profile Changes', nameAr: 'طلبات تعديل الملف', allowedRoles: ['ADMIN', 'CLINIC', 'DOCTOR'], allowedTiers: ['SUPER_ADMIN', 'OPERATIONS', 'READ_ONLY'] },
  { path: '/dashboard/account-controls', name: 'Account Controls', nameAr: 'إدارة الحسابات', allowedRoles: ['ADMIN'], allowedTiers: ['SUPER_ADMIN', 'OPERATIONS'] },
  { path: '/dashboard/receptionists', name: 'Receptionists', nameAr: 'موظفو الاستقبال', allowedRoles: ['ADMIN', 'CLINIC'], allowedTiers: ['SUPER_ADMIN', 'OPERATIONS'] },
  { path: '/dashboard/payout-profile', name: 'Bank Details & Withdrawals', nameAr: 'بيانات البنك والسحب', allowedRoles: ['CLINIC', 'DOCTOR'] },
  { path: '/dashboard/ledger-reports', name: 'Wallet Ledger & Reports', nameAr: 'سجل المحفظة والتقارير', allowedRoles: ['ADMIN', 'CLINIC', 'DOCTOR'], allowedTiers: ['SUPER_ADMIN', 'FINANCE', 'READ_ONLY'] },
  { path: '/dashboard/country-finance', name: 'Country Finance', nameAr: 'الرسوم والمالية حسب الدولة', allowedRoles: ['ADMIN'], allowedTiers: ['SUPER_ADMIN', 'FINANCE', 'READ_ONLY'] },
  // 1. Strictly Super Admin Only
  {
    path: '/dashboard/admin-staff',
    name: 'Admin Team & 5 Tiers Control',
    nameAr: 'فريق الإدارة والمستويات',
    allowedRoles: ['ADMIN'],
    allowedTiers: ['SUPER_ADMIN'],
    description: 'Manage admin accounts, tier assignments, and permission scopes.',
  },

  // 2. Audit Logs
  {
    path: '/dashboard/audit-logs',
    name: 'Administrative Audit Log',
    nameAr: 'سجل تدقيق العمليات',
    allowedRoles: ['ADMIN'],
    allowedTiers: ['SUPER_ADMIN', 'OPERATIONS', 'FINANCE', 'SUPPORT', 'READ_ONLY'],
  },

  // 3. Operations & Super Admin & Read Only modules
  {
    path: '/dashboard/booking-settings',
    name: 'Platform Booking Settings',
    nameAr: 'إعدادات الحجوزات العامة',
    allowedRoles: ['ADMIN'],
    allowedTiers: ['SUPER_ADMIN', 'OPERATIONS', 'READ_ONLY'],
  },
  {
    path: '/dashboard/legal-agreements',
    name: 'Legal Agreements & Policies',
    nameAr: 'الاتفاقيات القانونية والسياسات',
    allowedRoles: ['ADMIN'],
    allowedTiers: ['SUPER_ADMIN', 'OPERATIONS', 'READ_ONLY'],
  },
  {
    path: '/dashboard/banners',
    name: 'Mobile App Banners',
    nameAr: 'إعلانات وبانرات التطبيق',
    allowedRoles: ['ADMIN'],
    allowedTiers: ['SUPER_ADMIN', 'OPERATIONS', 'READ_ONLY'],
  },
  {
    path: '/dashboard/specialists',
    name: 'Medical Specialties',
    nameAr: 'التخصصات الطبية',
    allowedRoles: ['ADMIN'],
    allowedTiers: ['SUPER_ADMIN', 'OPERATIONS', 'READ_ONLY'],
  },
  {
    path: '/dashboard/insurance',
    name: 'Insurance Providers',
    nameAr: 'شركات التأمين',
    allowedRoles: ['ADMIN'],
    allowedTiers: ['SUPER_ADMIN', 'OPERATIONS', 'READ_ONLY'],
  },
  {
    path: '/dashboard/control-ai',
    name: 'AI Chat Assistant Settings',
    nameAr: 'إعدادات مساعد الذكاء الاصطناعي',
    allowedRoles: ['ADMIN'],
    allowedTiers: ['SUPER_ADMIN', 'OPERATIONS', 'READ_ONLY'],
  },
  {
    path: '/dashboard/notification-templates',
    name: 'Automated Notification Templates',
    nameAr: 'قوالب الإشعارات التلقائية',
    allowedRoles: ['ADMIN'],
    allowedTiers: ['SUPER_ADMIN', 'OPERATIONS', 'READ_ONLY'],
  },

  // 4. Support Modules
  {
    path: '/dashboard/otp-system',
    name: 'OTP System Channels',
    nameAr: 'قنوات رمز التحقق OTP',
    allowedRoles: ['ADMIN'],
    allowedTiers: ['SUPER_ADMIN', 'SUPPORT', 'READ_ONLY'],
  },

  // 5. Shared Operations / Support / Read Only
  {
    path: '/dashboard/complaints',
    name: 'Complaints & Dispute Resolution',
    nameAr: 'الشكاوى وفض النزاعات',
    allowedRoles: ['ADMIN'],
    allowedTiers: ['SUPER_ADMIN', 'OPERATIONS', 'SUPPORT', 'READ_ONLY'],
  },
  {
    path: '/dashboard/verifications',
    name: 'Blue Badge Verifications',
    nameAr: 'توثيق الشارة الزرقاء',
    allowedRoles: ['ADMIN'],
    allowedTiers: ['SUPER_ADMIN', 'OPERATIONS', 'SUPPORT', 'READ_ONLY'],
  },
  {
    path: '/dashboard/admin-doctors',
    name: 'Doctor Accounts & Verification',
    nameAr: 'أطباء المنصة',
    allowedRoles: ['ADMIN'],
    allowedTiers: ['SUPER_ADMIN', 'OPERATIONS', 'SUPPORT', 'READ_ONLY'],
  },
  {
    path: '/dashboard/patients',
    name: 'Patient Directory & Security',
    nameAr: 'المرضى والمستخدمين',
    allowedRoles: ['ADMIN'],
    allowedTiers: ['SUPER_ADMIN', 'OPERATIONS', 'SUPPORT', 'READ_ONLY'],
  },
  {
    path: '/dashboard/clinics',
    name: 'Clinic Directory & Operations',
    nameAr: 'العيادات والمراكز الطبية',
    allowedRoles: ['ADMIN'],
    allowedTiers: ['SUPER_ADMIN', 'OPERATIONS', 'FINANCE', 'SUPPORT', 'READ_ONLY'],
  },

  // 6. Finance & Wallet Modules
  {
    path: '/dashboard/platform-financials',
    name: 'Platform Financials & Wallets',
    nameAr: 'المالية ومحافظ المنصة',
    allowedRoles: ['ADMIN'],
    allowedTiers: ['SUPER_ADMIN', 'FINANCE', 'READ_ONLY'],
  },
  {
    path: '/dashboard/prepaid-cards',
    name: 'Prepaid Top-Up Cards',
    nameAr: 'بطاقات الشحن المسبق',
    allowedRoles: ['ADMIN'],
    allowedTiers: ['SUPER_ADMIN', 'FINANCE', 'READ_ONLY'],
  },
  {
    path: '/dashboard/settlements',
    name: 'Settlements & Payout Requests',
    nameAr: 'التسويات والمستحقات',
    allowedRoles: ['ADMIN', 'CLINIC'],
    allowedTiers: ['SUPER_ADMIN', 'FINANCE', 'READ_ONLY'],
  },
  {
    path: '/dashboard/clinic-subscriptions',
    name: 'Clinic Subscription Plans',
    nameAr: 'اشتراكات العيادات',
    allowedRoles: ['ADMIN', 'CLINIC'],
    allowedTiers: ['SUPER_ADMIN', 'FINANCE', 'READ_ONLY'],
  },
  {
    path: '/dashboard/patient-subscriptions',
    name: 'Patient Subscription Plans',
    nameAr: 'اشتراكات المرضى',
    allowedRoles: ['ADMIN'],
    allowedTiers: ['SUPER_ADMIN', 'FINANCE', 'READ_ONLY'],
  },
  {
    path: '/dashboard/financials',
    name: 'Clinic / Platform Financial Ledger',
    nameAr: 'السجل المالي',
    allowedRoles: ['CLINIC', 'ADMIN'],
    allowedTiers: ['SUPER_ADMIN', 'FINANCE', 'READ_ONLY'],
  },
  {
    path: '/dashboard/reports',
    name: 'Operational & Financial Reports',
    nameAr: 'التقارير والإحصائيات',
    allowedRoles: ['CLINIC', 'ADMIN'],
    allowedTiers: ['SUPER_ADMIN', 'OPERATIONS', 'FINANCE', 'READ_ONLY'],
  },

  // 7. Bookings Management
  {
    path: '/dashboard/bookings',
    name: 'Platform Appointments & Bookings',
    nameAr: 'سجل الحجوزات',
    allowedRoles: ['ADMIN', 'CLINIC', 'MANAGER'],
    allowedTiers: ['SUPER_ADMIN', 'OPERATIONS', 'SUPPORT', 'READ_ONLY'],
  },

  // 8. Clinic Staff Operations (Clinic & Manager only)
  {
    path: '/dashboard/booking-requests',
    name: 'Booking Requests',
    nameAr: 'طلبات الحجز الواردة',
    allowedRoles: ['CLINIC', 'MANAGER'],
  },
  {
    path: '/dashboard/appointments',
    name: 'Clinic Appointments Queue',
    nameAr: 'مواعيد العيادة',
    allowedRoles: ['CLINIC', 'MANAGER'],
  },
  {
    path: '/dashboard/doctors',
    name: 'Clinic Doctor Roster',
    nameAr: 'أطباء العيادة',
    allowedRoles: ['CLINIC', 'MANAGER'],
  },
  {
    path: '/dashboard/schedules',
    name: 'Doctor Schedules & Working Hours',
    nameAr: 'جداول المواعيد والدوام',
    allowedRoles: ['CLINIC', 'MANAGER'],
  },
  {
    path: '/dashboard/notifications',
    name: 'Clinic Notifications',
    nameAr: 'إشعارات العيادة',
    allowedRoles: ['CLINIC', 'MANAGER'],
  },

  // 9. Dashboards
  {
    path: '/dashboard/admin',
    name: 'Admin Command Center',
    nameAr: 'لوحة التحكم المركزية',
    allowedRoles: ['ADMIN'],
    allowedTiers: ['SUPER_ADMIN', 'OPERATIONS', 'FINANCE', 'SUPPORT', 'READ_ONLY'],
  },
  {
    path: '/dashboard',
    name: 'Dashboard Overview',
    nameAr: 'الرئيسية',
    allowedRoles: ['ADMIN', 'CLINIC', 'MANAGER'],
  },
];

export interface AccessCheckResult {
  hasAccess: boolean;
  reason?: string;
  rule?: RouteRule;
  requiredRoles?: UserRole[];
  requiredTiers?: AdminTier[];
}

export function checkRouteAccess(
  pathname: string,
  userRole: string | null | undefined,
  adminTier: string | null | undefined
): AccessCheckResult {
  if (!userRole) {
    return { hasAccess: false, reason: 'Authentication required' };
  }

  // Find most specific matching rule (sorted by path length descending)
  const matchedRule = ROUTE_PERMISSIONS.slice()
    .sort((a, b) => b.path.length - a.path.length)
    .find((rule) => pathname === rule.path || pathname.startsWith(rule.path + '/'));

  if (!matchedRule) {
    const isDashboardRole = ['ADMIN', 'CLINIC', 'MANAGER'].includes(userRole);
    return { hasAccess: isDashboardRole };
  }

  // 1. Check Role Match
  if (!matchedRule.allowedRoles.includes(userRole as UserRole)) {
    return {
      hasAccess: false,
      reason: `Access restricted. This section is only accessible to [${matchedRule.allowedRoles.join(', ')}] role(s).`,
      rule: matchedRule,
      requiredRoles: matchedRule.allowedRoles,
    };
  }

  // 2. If user is ADMIN, check Admin Tier
  if (userRole === 'ADMIN' && matchedRule.allowedTiers && matchedRule.allowedTiers.length > 0) {
    const effectiveTier = (adminTier || 'SUPER_ADMIN') as AdminTier;
    // SUPER_ADMIN has global clearance
    if (effectiveTier !== 'SUPER_ADMIN' && !matchedRule.allowedTiers.includes(effectiveTier)) {
      return {
        hasAccess: false,
        reason: `Access restricted. Your tier (${effectiveTier}) does not have scope for this module. Required tier(s): [${matchedRule.allowedTiers.join(', ')}].`,
        rule: matchedRule,
        requiredTiers: matchedRule.allowedTiers,
      };
    }
  }

  return { hasAccess: true, rule: matchedRule };
}
