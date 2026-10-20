'use client';

import { useLanguage } from '@/contexts/language-context';
import { useToast } from '@/hooks/use-toast';
import { bookingService } from '@/services/booking.service';
import { useAuthStore } from '@/stores/auth-store';
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  Clock,
  Inbox,
  RefreshCw,
  Sparkles,
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
  const { t, isRTL } = useLanguage();
  const role = useAuthStore((state) => state.role);
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (role === 'ADMIN') {
      router.replace('/dashboard/admin');
      return;
    }
    fetchStats();
  }, [role, router]);

  const fetchStats = async () => {
    try {
      setIsRefreshing(true);
      const response = await bookingService.getClinicStats();
      setStats(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load clinic stats',
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

  // 1. Primary Operational KPI Cards (Top 4)
  const primaryKpiCards = [
    {
      label: t('totalAppointments', 'Total Appointments'),
      value: stats?.totalAppointment || 0,
      icon: CalendarCheck,
      iconBg: 'bg-blue-50 text-blue-600 ring-1 ring-blue-100/80',
      gradientBar: 'from-blue-600 to-indigo-600',
      description: 'All-time patient bookings',
      href: '/dashboard/bookings?status=ALL',
    },
    {
      label: t('todayAppointments', "Today's Appointments"),
      value: stats?.todayAppointment || 0,
      icon: Clock,
      iconBg: 'bg-purple-50 text-purple-600 ring-1 ring-purple-100/80',
      gradientBar: 'from-purple-600 to-fuchsia-600',
      description: 'Scheduled for consultation today',
      href: '/dashboard/appointments',
    },
    {
      label: t('activeDoctors', 'Active Doctors'),
      value: stats?.doctorCount || 0,
      icon: Stethoscope,
      iconBg: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100/80',
      gradientBar: 'from-emerald-600 to-teal-600',
      description: 'Clinic medical team roster',
      href: '/dashboard/doctors',
    },
    {
      label: t('pendingAppointments', 'Pending Requests'),
      value: stats?.pendingAppointment || 0,
      icon: AlertCircle,
      iconBg: 'bg-amber-50 text-amber-600 ring-1 ring-amber-100/80',
      gradientBar: 'from-amber-500 to-orange-500',
      description: (stats?.pendingAppointment || 0) > 0 ? 'Requires immediate review' : 'No pending requests',
      badge: (stats?.pendingAppointment || 0) > 0 ? 'Action' : undefined,
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
      description: 'Confirmed & ready for visit',
      href: '/dashboard/bookings?status=CONFIRMED',
    },
    {
      label: t('completedAppointments', 'Completed'),
      value: stats?.completedAppointment || 0,
      icon: BadgeCheck,
      iconBg: 'bg-teal-50 text-teal-600 ring-1 ring-teal-100/80',
      gradientBar: 'from-teal-600 to-emerald-600',
      description: 'Consultations finished',
      href: '/dashboard/bookings?status=COMPLETE',
    },
    {
      label: t('cancelledAppointments', 'Cancelled'),
      value: stats?.cancelledAppointment || 0,
      icon: XCircle,
      iconBg: 'bg-rose-50 text-rose-600 ring-1 ring-rose-100/80',
      gradientBar: 'from-rose-500 to-red-600',
      description: 'Cancelled by patient or clinic',
      href: '/dashboard/bookings?status=CANCELLED',
    },
    {
      label: t('noShowAppointments', 'No Show'),
      value: stats?.noShowAppointment || 0,
      icon: UserX,
      iconBg: 'bg-orange-50 text-orange-600 ring-1 ring-orange-100/80',
      gradientBar: 'from-orange-500 to-amber-600',
      description: 'Patients who missed schedule',
      href: '/dashboard/bookings?status=NOT_SHOW',
    },
  ];

  // 3. Quick Action Navigation Cards
  const quickActions = [
    {
      title: t('bookingRequests', 'Booking Requests'),
      desc: 'Review and confirm incoming patient booking requests',
      href: '/dashboard/booking-requests',
      icon: Inbox,
      iconBg: 'bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white',
      badge: stats?.pendingAppointment ? `${stats.pendingAppointment} new` : undefined,
    },
    {
      title: t('appointments', 'Appointments Queue'),
      desc: 'Live queue monitoring and patient consultation status',
      href: '/dashboard/appointments',
      icon: CalendarCheck,
      iconBg: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
    },
    {
      title: t('schedules', 'Doctor Schedules'),
      desc: 'Set working shifts, consultation hours and slot capacity',
      href: '/dashboard/schedules',
      icon: CalendarClock,
      iconBg: 'bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white',
    },
    {
      title: t('doctors', 'Doctor Roster'),
      desc: 'Manage medical specialists, credentials and departments',
      href: '/dashboard/doctors',
      icon: Stethoscope,
      iconBg: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white',
    },
  ];

  return (
    <div className="space-y-7 pb-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
              {t('dashboard', 'Dashboard')}
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <Sparkles className="h-3 w-3 text-blue-500" />
              Live Clinic View
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            {t('welcomeBack', 'Welcome back!')} {t('clinicOverview', "Here's your clinic real-time activity and appointment overview.")}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchStats}
          disabled={isRefreshing}
          className="self-start sm:self-auto text-xs gap-1.5 border-gray-200 bg-white hover:bg-gray-50 text-gray-700 shadow-2xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* SECTION 1: Primary Operational KPIs (4 Cards Grid) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
            {t('operationalKpis', 'Operational Overview')}
          </h2>
          <span className="text-[11px] text-gray-400">4 Core Metrics</span>
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
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 truncate whitespace-nowrap" title={card.label}>
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

                    <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110 ${card.iconBg}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="mt-3.5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <span className="truncate pr-1">{card.description}</span>
                    <span className="text-[11px] font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 flex items-center gap-0.5">
                      Open <ArrowRight className={`h-3 w-3 ${isRTL ? 'rotate-180' : ''}`} />
                    </span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: Appointment Status Lifecycle (4 Cards Grid) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
            {t('appointmentStatuses', 'Appointment Status Lifecycle')}
          </h2>
          <span className="text-[11px] text-gray-400">By Consultation State</span>
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
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 truncate whitespace-nowrap" title={card.label}>
                        {card.label}
                      </p>
                      <div className="mt-2.5">
                        <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
                          {card.value.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110 ${card.iconBg}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="mt-3.5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <span className="truncate pr-1">{card.description}</span>
                    <span className="text-[11px] font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 flex items-center gap-0.5">
                      Filter <ArrowRight className={`h-3 w-3 ${isRTL ? 'rotate-180' : ''}`} />
                    </span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: Quick Action Launchpad (4 Cards Grid) */}
      <div className="space-y-3 pt-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
          {t('quickActions', 'Quick Action Launchpad')}
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                href={action.href}
                className="group relative flex flex-col justify-between rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors duration-200 ${action.iconBg}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    {action.badge && (
                      <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700 border border-amber-200">
                        {action.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-sm text-gray-900 group-hover:text-blue-600 transition-colors flex items-center justify-between">
                    <span>{action.title}</span>
                    <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100" />
                  </h3>
                  <p className="mt-1 text-xs text-gray-500 leading-relaxed line-clamp-2">
                    {action.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center text-[11px] font-semibold text-blue-600">
                  <span>Open Section</span>
                  <ArrowRight className={`h-3 w-3 ml-1 transition-transform group-hover:translate-x-1 ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
