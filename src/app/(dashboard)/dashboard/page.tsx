'use client';

import { useToast } from '@/hooks/use-toast';
import { bookingService } from '@/services/booking.service';
import { AlertCircle, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
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
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Appointments',
      value: stats?.totalAppointment || 0,
      icon: Calendar,
      color: 'bg-blue-50 text-blue-600',
      borderColor: 'border-blue-200',
    },
    {
      label: "Today's Appointments",
      value: stats?.todayAppointment || 0,
      icon: Clock,
      color: 'bg-purple-50 text-purple-600',
      borderColor: 'border-purple-200',
    },
    {
      label: 'Pending',
      value: stats?.pendingAppointment || 0,
      icon: AlertCircle,
      color: 'bg-yellow-50 text-yellow-600',
      borderColor: 'border-yellow-200',
    },
    {
      label: 'Confirmed',
      value: stats?.confirmedAppointment || 0,
      icon: CheckCircle,
      color: 'bg-green-50 text-green-600',
      borderColor: 'border-green-200',
    },
    {
      label: 'Completed',
      value: stats?.completedAppointment || 0,
      icon: CheckCircle,
      color: 'bg-teal-50 text-teal-600',
      borderColor: 'border-teal-200',
    },
    {
      label: 'Cancelled',
      value: stats?.cancelledAppointment || 0,
      icon: XCircle,
      color: 'bg-red-50 text-red-600',
      borderColor: 'border-red-200',
    },
  ];

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome back! Here's your clinic overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className={`${card.color} border ${card.borderColor} rounded-xl p-6 transition-transform hover:scale-105`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="mb-1 text-sm font-medium text-gray-600">{card.label}</p>
                  <p className="text-4xl font-bold text-gray-900">{card.value}</p>
                </div>
                <Icon className="h-8 w-8 opacity-50" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="mb-4 text-xl font-bold text-gray-900">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <a
            href="/dashboard/bookings"
            className="rounded-xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-lg"
          >
            <h3 className="mb-2 font-semibold text-gray-900">Manage Bookings</h3>
            <p className="text-sm text-gray-600">View and manage all patient appointments</p>
          </a>
          <a
            href="/dashboard/doctors"
            className="rounded-xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-lg"
          >
            <h3 className="mb-2 font-semibold text-gray-900">View Doctors</h3>
            <p className="text-sm text-gray-600">Check doctor profiles and schedules</p>
          </a>
        </div>
      </div>
    </div>
  );
}
