'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';
import { toast } from '@/hooks/use-toast';
import { adminService, AdminStats } from '@/services/admin.service';
import {
  Building2,
  Stethoscope,
  Users,
  CalendarCheck,
  BadgeCheck,
  DollarSign,
  MessageSquareWarning,
  Shield,
  Activity,
  CreditCard,
  Bell,
  Bot,
  FileText,
  Image as ImageIcon,
  CalendarClock,
  UserCog,
  RefreshCw,
  ArrowRight,
  Receipt,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function AdminDashboardPage() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<AdminStats>({
    patientCount: 0,
    doctorCount: 0,
    clinicCount: 0,
    pendingVerifications: 0,
    pendingSettlements: 0,
    openComplaints: 0,
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await adminService.getStats();
      if (response.data) {
        setStats(response.data);
      }
    } catch (error: any) {
      toast({
        title: t('error', 'Error'),
        description: error.response?.data?.message || 'Failed to load statistics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const primaryStats = [
    {
      title: t('totalPatients', 'Total Patients'),
      value: stats.patientCount,
      icon: Users,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      href: '/dashboard/patients',
    },
    {
      title: t('totalDoctors', 'Total Doctors'),
      value: stats.doctorCount,
      icon: Stethoscope,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      href: '/dashboard/admin-doctors',
    },
    {
      title: t('totalClinics', 'Total Clinics'),
      value: stats.clinicCount,
      icon: Building2,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      href: '/dashboard/clinics',
    },
    {
      title: t('totalBookings', 'Total Bookings'),
      value: stats.totalBookings || 0,
      icon: CalendarCheck,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      href: '/dashboard/bookings',
    },
  ];

  const actionAlerts = [
    {
      title: t('pendingVerificationsAlert', 'Blue Badge Verifications'),
      count: stats.pendingVerifications || 0,
      description: 'Doctors & clinics awaiting verification approval',
      icon: BadgeCheck,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      btnColor: 'bg-amber-600 hover:bg-amber-700',
      href: '/dashboard/verifications',
    },
    {
      title: t('pendingSettlementsAlert', 'Pending Settlements'),
      count: stats.pendingSettlements || 0,
      description: 'Financial payouts awaiting review & disbursement',
      icon: DollarSign,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      btnColor: 'bg-purple-600 hover:bg-purple-700',
      href: '/dashboard/settlements',
    },
    {
      title: t('openComplaintsAlert', 'Complaints & Disputes'),
      count: stats.openComplaints || 0,
      description: 'Customer & clinic tickets needing investigation',
      icon: MessageSquareWarning,
      color: 'text-rose-600 bg-rose-50 border-rose-200',
      btnColor: 'bg-rose-600 hover:bg-rose-700',
      href: '/dashboard/complaints',
    },
  ];

  const controlSections = [
    {
      category: 'Operations Hub',
      description: 'Entity oversight, appointments, verification and public banner',
      modules: [
        { title: 'Patients', desc: 'Directory, booking history, wallet & moderation', href: '/dashboard/patients', icon: Users },
        { title: 'Doctors', desc: 'Schedules, capacity, specialty & suspensions', href: '/dashboard/admin-doctors', icon: Stethoscope },
        { title: 'Clinics & Visibility', desc: 'Platform visibility toggle, licenses & hours', href: '/dashboard/clinics', icon: Building2 },
        { title: 'Bookings Control', desc: 'Platform appointments & manual override engine', href: '/dashboard/bookings', icon: CalendarCheck },
        { title: 'Blue Badge Verification', desc: 'Document verification & display gating', href: '/dashboard/verifications', icon: BadgeCheck },
        { title: 'Complaints & Disputes', desc: 'Ticketing, investigation & resolutions', href: '/dashboard/complaints', icon: MessageSquareWarning },
        { title: 'Main Banner', desc: 'Homepage carousel banners & active toggles', href: '/dashboard/banners', icon: ImageIcon },
      ],
    },
    {
      category: 'Financials & Settlements',
      description: 'Section 10 dedicated ledger, settlements, platform fees & prepaid cards',
      modules: [
        { title: 'Platform Financials', desc: 'Captured service fees, wallet liabilities & country fees', href: '/dashboard/platform-financials', icon: DollarSign },
        { title: 'Settlements', desc: 'Review, authorize & complete provider disbursements', href: '/dashboard/settlements', icon: Receipt },
        { title: 'Prepaid Cards', desc: 'Bulk card generation, denominations & export', href: '/dashboard/prepaid-cards', icon: CreditCard },
        { title: 'Financial Reports', desc: 'Reconciliation reports & transaction audit logs', href: '/dashboard/reports', icon: Activity },
      ],
    },
    {
      category: 'Platform Configuration & AI',
      description: 'Booking engine limits, notification wording, AI controls and compliance',
      modules: [
        { title: 'Booking Settings', desc: '14-day advance, 12h cutoff & reminder rules', href: '/dashboard/booking-settings', icon: CalendarClock },
        { title: 'Notification Templates', desc: 'Bilingual EN/AR independent templates & channel toggles', href: '/dashboard/notification-templates', icon: Bell },
        { title: 'AI Controls', desc: 'Rolling 24h message limit, usage monitoring & provider', href: '/dashboard/control-ai', icon: Bot },
        { title: 'OTP System', desc: 'WhatsApp & SMS delivery gateway monitoring', href: '/dashboard/otp-system', icon: MessageSquare },
        { title: 'Medical Specialties', desc: 'Platform medical specialty categories & services', href: '/dashboard/specialists', icon: UserCog },
        { title: 'Legal Agreements', desc: 'Role-based terms, versioning & re-acceptance', href: '/dashboard/legal-agreements', icon: FileText },
      ],
    },
    {
      category: 'Access Governance & Security',
      description: '5 Admin Tiers management and full audit trail of administrative actions',
      modules: [
        { title: 'Admin Staff & 5 Tiers', desc: 'Super Admin, Operations, Finance, Support, Read Only', href: '/dashboard/admin-staff', icon: Shield },
        { title: 'Administrative Audit Log', desc: 'Traceable chronological record of administrative mutations', href: '/dashboard/audit-logs', icon: Activity },
      ],
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-sm text-gray-500">{t('loading', 'Loading Control Center...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Shield className="h-7 w-7 text-blue-600" />
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              {t('adminDashboard', 'Salama Main Admin Control Center')}
            </h1>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {t(
              'adminOverviewSub',
              'Section 9 Central Command: Full governance over operations, financials, security, and platform settings.'
            )}
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={fetchStats} className="gap-2 self-start sm:self-auto">
          <RefreshCw className="h-4 w-4" />
          {t('refreshData', 'Refresh Metrics')}
        </Button>
      </div>

      {/* Vital Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {primaryStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.title} href={stat.href} className="group">
              <Card className="transition-all duration-200 hover:shadow-md hover:border-blue-300">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap truncate" title={stat.title}>
                        {stat.title}
                      </p>
                      <p className="mt-1.5 text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                    </div>
                    <div className={`rounded-xl p-3 ${stat.bgColor} ${stat.textColor} shrink-0 transition-transform group-hover:scale-110`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Action Required Alerts */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">
          Action Required & Approvals
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {actionAlerts.map((alert) => {
            const Icon = alert.icon;
            return (
              <Card key={alert.title} className={`border shadow-xs ${alert.color}`}>
                <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Icon className="h-5 w-5 shrink-0" />
                        <h3
                          className="font-semibold text-sm sm:text-base text-gray-900 whitespace-nowrap truncate"
                          title={alert.title}
                        >
                          {alert.title}
                        </h3>
                      </div>
                      <span className="text-2xl font-bold text-gray-900 shrink-0">
                        {alert.count}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-gray-600 truncate" title={alert.description}>
                      {alert.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-200/60 flex justify-end">
                    <Link href={alert.href}>
                      <Button size="sm" className={`text-white text-xs gap-1.5 ${alert.btnColor}`}>
                        Review Queue
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Control Center Core Modules */}
      <div className="space-y-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
          Control Center Modules (19 Subsystems)
        </h2>

        {controlSections.map((sec) => (
          <div key={sec.category} className="space-y-3">
            <div className="border-b pb-1">
              <h3 className="text-base font-semibold text-gray-900">{sec.category}</h3>
              <p className="text-xs text-gray-500">{sec.description}</p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sec.modules.map((mod) => {
                const Icon = mod.icon;
                return (
                  <Link key={mod.title} href={mod.href} className="group">
                    <Card className="h-full border transition-all duration-200 hover:border-blue-400 hover:shadow-sm">
                      <CardContent className="p-4 flex flex-col justify-between h-full">
                        <div>
                          <div className="flex items-center gap-2.5 mb-1.5">
                            <div className="p-2 rounded-lg bg-gray-50 text-blue-600 group-hover:bg-blue-50 transition-colors">
                              <Icon className="h-4 w-4" />
                            </div>
                            <h4 className="font-semibold text-sm text-gray-900 group-hover:text-blue-600 transition-colors">
                              {mod.title}
                            </h4>
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-2">{mod.desc}</p>
                        </div>

                        <div className="mt-3 flex items-center text-[11px] font-medium text-blue-600 group-hover:underline">
                          Open Module <ArrowRight className="h-3 w-3 ml-1 transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
