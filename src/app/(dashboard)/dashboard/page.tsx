'use client';

import { useLanguage } from '@/contexts/language-context';
import { useToast } from '@/hooks/use-toast';
import { bookingService } from '@/services/booking.service';
import { AlertCircle, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Stats {
  totalAppointment: number;
  todayAppointment: number;
  pendingAppointment: number;
  completedAppointment: number;
  confirmedAppointment: number;
  cancelledAppointment: number;
}

export default function DashboardPage() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
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
    }
  };

  if (loading) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-4 text-gray-600">{t('loading', 'Loading...')}</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: t('totalAppointments', 'Total Appointments'),
      value: stats?.totalAppointment || 0,
      icon: Calendar,
      color: 'bg-blue-50 text-blue-600',
      borderColor: 'border-blue-200',
    },
    {
      label: t('todayAppointments', "Today's Appointments"),
      value: stats?.todayAppointment || 0,
      icon: Clock,
      color: 'bg-purple-50 text-purple-600',
      borderColor: 'border-purple-200',
    },
    {
      label: t('pending', 'Pending'),
      value: stats?.pendingAppointment || 0,
      icon: AlertCircle,
      color: 'bg-yellow-50 text-yellow-600',
      borderColor: 'border-yellow-200',
    },
    {
      label: t('confirmed', 'Confirmed'),
      value: stats?.confirmedAppointment || 0,
      icon: CheckCircle,
      color: 'bg-green-50 text-green-600',
      borderColor: 'border-green-200',
    },
    {
      label: t('completed', 'Completed'),
      value: stats?.completedAppointment || 0,
      icon: CheckCircle,
      color: 'bg-teal-50 text-teal-600',
      borderColor: 'border-teal-200',
    },
    {
      label: t('cancelled', 'Cancelled'),
      value: stats?.cancelledAppointment || 0,
      icon: XCircle,
      color: 'bg-red-50 text-red-600',
      borderColor: 'border-red-200',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-100 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          {t('dashboard', 'Dashboard')}
        </h1>
        <p className="mt-1 text-sm text-gray-600 sm:text-base">
          {t('welcomeBack', 'Welcome back!')} {t('clinicOverview', "Here's your clinic overview.")}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className={`${card.color} border ${card.borderColor} rounded-xl p-5 sm:p-6 transition-all duration-200 hover:shadow-md hover:scale-[1.01]`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="mb-1 text-xs sm:text-sm font-medium text-gray-600">{card.label}</p>
                  <p className="text-3xl sm:text-4xl font-bold text-gray-900">{card.value}</p>
                </div>
                <div className="rounded-lg bg-white/70 p-2.5 shadow-sm">
                  <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg sm:text-xl font-bold text-gray-900">
          {t('quickActions', 'Quick Actions')}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            href="/dashboard/bookings"
            className="group rounded-xl border border-gray-200 bg-white p-5 sm:p-6 transition-all hover:border-blue-300 hover:shadow-md"
          >
            <h3 className="mb-1 font-semibold text-gray-900 group-hover:text-blue-600">
              {t('manageBookings', 'Manage Bookings')}
            </h3>
            <p className="text-sm text-gray-600">
              {t('manageBookingsDesc', 'View and manage all patient appointments')}
            </p>
          </Link>
          <Link
            href="/dashboard/doctors"
            className="group rounded-xl border border-gray-200 bg-white p-5 sm:p-6 transition-all hover:border-blue-300 hover:shadow-md"
          >
            <h3 className="mb-1 font-semibold text-gray-900 group-hover:text-blue-600">
              {t('viewDoctors', 'View Doctors')}
            </h3>
            <p className="text-sm text-gray-600">
              {t('viewDoctorsDesc', 'Check doctor profiles and schedules')}
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
