'use client';

import { useLanguage } from '@/contexts/language-context';
import { useToast } from '@/hooks/use-toast';
import { bookingService } from '@/services/booking.service';
import { phaseOne } from '@/services/phase-one.service';
import { useAuthStore } from '@/stores/auth-store';
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Globe,
  Mail,
  Phone,
  RefreshCw,
  ShieldCheck,
  Stethoscope,
  UserX,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Stats {
  totalAppointment: number;
  todayAppointment: number;
  pendingAppointment: number;
  completedAppointment: number;
  noShowAppointment?: number;
  confirmedAppointment: number;
  cancelledAppointment: number;
  doctorCount?: number;
}

export default function DashboardPage() {
  const { toast } = useToast();
  const { t, isRTL, language } = useLanguage();
  const role = useAuthStore((state) => state.role);
  const phoneNumber = useAuthStore((state) => state.phoneNumber);
  const router = useRouter();

  const [stats, setStats] = useState<Stats | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (role === 'ADMIN') {
      router.replace('/dashboard/admin');
      return;
    }
    if (role === 'DOCTOR') {
      router.replace('/dashboard/doctor-overview');
      return;
    }
    fetchDashboardData();
  }, [role, router]);

  const fetchDashboardData = async () => {
    try {
      setIsRefreshing(true);
      const [statsRes, profileRes] = await Promise.allSettled([
        bookingService.getClinicStats(),
        phaseOne.get('profile-access'),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value?.data) {
        setStats(statsRes.value.data);
      }
      if (profileRes.status === 'fulfilled' && profileRes.value) {
        setProfile(profileRes.value);
      }
    } catch (error) {
      toast({
        title: t('error', 'Error'),
        description: t('failedToLoadStats', 'Failed to load clinic overview'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center">
        <div className="text-center space-y-3">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-3 border-blue-200 border-t-blue-600"></div>
          <p className="text-sm font-medium text-gray-500">{t('loading', 'Loading clinic overview...')}</p>
        </div>
      </div>
    );
  }

  // Profile Information
  const clinicName =
    profile?.values?.clinicName ||
    (role === 'CLINIC' ? 'Salama Health Clinic' : 'Medical Center');
  const userFullName =
    profile?.values?.fullName ||
    (role === 'CLINIC' ? 'Clinic Administrator' : 'Clinic Staff');
  const userPhone = profile?.values?.phoneNumber || phoneNumber || '—';
  const userEmail = profile?.values?.email || '—';
  const timezone = profile?.values?.timezone || 'Africa/Tripoli';
  const roleName =
    role === 'CLINIC' ? t('clinicAdmin', 'Clinic Admin') : t('clinicStaff', 'Clinic Staff');

  // Format today's date
  const todayFormatted = new Date().toLocaleDateString(language === 'ar' ? 'ar-LY' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // 1. Primary Operational KPI Cards (Top 4)
  const primaryKpiCards = [
    {
      label: t('totalAppointments', 'Total Appointments'),
      value: stats?.totalAppointment || 0,
      icon: CalendarCheck,
      iconBg: 'bg-blue-50 text-blue-600 ring-1 ring-blue-100/80',
      gradientBar: 'from-blue-600 to-indigo-600',
      description: t('allTimeBookings', 'All-time patient bookings'),
      href: '/dashboard/booking-management?status=ALL',
    },
    {
      label: t('todayAppointments', "Today's Appointments"),
      value: stats?.todayAppointment || 0,
      icon: Clock,
      iconBg: 'bg-purple-50 text-purple-600 ring-1 ring-purple-100/80',
      gradientBar: 'from-purple-600 to-fuchsia-600',
      description: t('scheduledToday', 'Scheduled for consultation today'),
      href: '/dashboard/appointments',
    },
    {
      label: t('activeDoctors', 'Active Doctors'),
      value: stats?.doctorCount || 0,
      icon: Stethoscope,
      iconBg: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100/80',
      gradientBar: 'from-emerald-600 to-teal-600',
      description: t('clinicMedicalTeam', 'Clinic medical team roster'),
      href: '/dashboard/doctors',
    },
    {
      label: t('pendingAppointments', 'Pending Requests'),
      value: stats?.pendingAppointment || 0,
      icon: AlertCircle,
      iconBg: 'bg-amber-50 text-amber-600 ring-1 ring-amber-100/80',
      gradientBar: 'from-amber-500 to-orange-500',
      description:
        (stats?.pendingAppointment || 0) > 0
          ? t('requiresImmediateReview', 'Requires immediate review')
          : t('noPendingRequests', 'No pending requests'),
      badge: (stats?.pendingAppointment || 0) > 0 ? t('actionRequired', 'Action') : undefined,
      href: '/dashboard/booking-requests',
    },
  ];

  // 2. Status Lifecycle Cards (Bottom 4)
  const statusLifecycleCards = [
    {
      label: t('confirmedAppointments', 'Confirmed'),
      value: stats?.confirmedAppointment || 0,
      icon: CheckCircle2,
      iconBg: 'bg-sky-50 text-sky-600 ring-1 ring-sky-100/80',
      gradientBar: 'from-sky-500 to-blue-500',
      description: t('confirmedReady', 'Confirmed & ready for visit'),
      href: '/dashboard/booking-management?status=CONFIRMED',
    },
    {
      label: t('completedAppointments', 'Completed'),
      value: stats?.completedAppointment || 0,
      icon: BadgeCheck,
      iconBg: 'bg-teal-50 text-teal-600 ring-1 ring-teal-100/80',
      gradientBar: 'from-teal-600 to-emerald-600',
      description: t('consultationsFinished', 'Consultations finished'),
      href: '/dashboard/booking-management?status=COMPLETE',
    },
    {
      label: t('cancelledAppointments', 'Cancelled'),
      value: stats?.cancelledAppointment || 0,
      icon: XCircle,
      iconBg: 'bg-rose-50 text-rose-600 ring-1 ring-rose-100/80',
      gradientBar: 'from-rose-500 to-red-600',
      description: t('cancelledByPatientOrClinic', 'Cancelled by patient or clinic'),
      href: '/dashboard/booking-management?status=CANCELLED',
    },
    {
      label: t('noShowAppointments', 'No Show'),
      value: stats?.noShowAppointment || 0,
      icon: UserX,
      iconBg: 'bg-orange-50 text-orange-600 ring-1 ring-orange-100/80',
      gradientBar: 'from-orange-500 to-amber-600',
      description: t('patientsMissedSchedule', 'Patients who missed schedule'),
      href: '/dashboard/booking-management?status=NOT_SHOW',
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* 1. Logged-in Clinic Account & Session Banner */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs">
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-6 py-5 text-white">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md text-white border border-white/20 shadow-inner">
                <Building2 className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white truncate">
                    {clinicName}
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-100 border border-emerald-300/30">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
                    {t('liveSession', 'Active Session')}
                  </span>
                </div>
                <p className="mt-0.5 text-xs sm:text-sm text-blue-100">
                  {t('welcomeBack', 'Welcome back!')} {t('loggedInAs', 'Logged in as')}{' '}
                  <span className="font-semibold text-white">{userFullName}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchDashboardData}
                disabled={isRefreshing}
                className="gap-1.5 border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white shadow-xs backdrop-blur-xs text-xs"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? t('refreshing', 'Refreshing...') : t('refresh', 'Refresh')}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Account Details Ribbon */}
        <div className="grid grid-cols-2 gap-3 border-t border-gray-100 bg-gray-50/70 px-6 py-3 text-xs sm:grid-cols-4">
          {/* Role */}
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-semibold text-gray-400 block">
                {t('role', 'Role')}
              </span>
              <span className="font-bold text-gray-800">{roleName}</span>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-emerald-600 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-semibold text-gray-400 block">
                {t('phoneNumber', 'Phone Number')}
              </span>
              <span className="font-mono font-medium text-gray-800">{userPhone}</span>
            </div>
          </div>

          {/* Email / Manager */}
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-purple-600 shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-semibold text-gray-400 block">
                {t('email', 'Email')}
              </span>
              <span className="font-medium text-gray-800 truncate block" title={userEmail}>
                {userEmail}
              </span>
            </div>
          </div>

          {/* Timezone / Today */}
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-amber-600 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-semibold text-gray-400 block">
                {t('timezone', 'Timezone')}
              </span>
              <span className="font-medium text-gray-800">{timezone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SECTION 1: Primary Operational KPIs (4 Cards Grid) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-600">
              {t('operationalOverview', 'Operational Overview')}
            </h2>
          </div>
          <span className="text-[11px] font-medium text-gray-400">{todayFormatted}</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {primaryKpiCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.label} href={card.href} className="group block focus:outline-hidden">
                <Card className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md">
                  {/* Top Gradient Accent Bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradientBar}`} />

                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p
                        className="text-xs font-semibold uppercase tracking-wider text-gray-500 truncate whitespace-nowrap"
                        title={card.label}
                      >
                        {card.label}
                      </p>
                      <div className="mt-2.5 flex items-baseline gap-2">
                        <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
                          {card.value.toLocaleString()}
                        </span>
                        {card.badge && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 animate-pulse">
                            {card.badge}
                          </span>
                        )}
                      </div>
                    </div>

                    <div
                      className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110 ${card.iconBg}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="mt-3.5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <span className="truncate pr-1">{card.description}</span>
                    <span className="text-[11px] font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 flex items-center gap-0.5">
                      {t('open', 'Open')} <ArrowRight className={`h-3 w-3 ${isRTL ? 'rotate-180' : ''}`} />
                    </span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 3. SECTION 2: Appointment Status Lifecycle (4 Cards Grid) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-600">
              {t('appointmentLifecycle', 'Appointment Lifecycle')}
            </h2>
          </div>
          <span className="text-[11px] text-gray-400">{t('byConsultationState', 'By Consultation State')}</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statusLifecycleCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.label} href={card.href} className="group block focus:outline-hidden">
                <Card className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md">
                  {/* Top Gradient Accent Bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradientBar}`} />

                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p
                        className="text-xs font-semibold uppercase tracking-wider text-gray-500 truncate whitespace-nowrap"
                        title={card.label}
                      >
                        {card.label}
                      </p>
                      <div className="mt-2.5">
                        <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
                          {card.value.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110 ${card.iconBg}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="mt-3.5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <span className="truncate pr-1">{card.description}</span>
                    <span className="text-[11px] font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 flex items-center gap-0.5">
                      {t('filter', 'Filter')} <ArrowRight className={`h-3 w-3 ${isRTL ? 'rotate-180' : ''}`} />
                    </span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
