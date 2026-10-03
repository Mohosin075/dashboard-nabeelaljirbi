'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/language-context';
import { toast } from '@/hooks/use-toast';
import { adminService } from '@/services/admin.service';
import { Building2, Stethoscope, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    patientCount: 0,
    doctorCount: 0,
    clinicCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await adminService.getStats();
      setStats(response.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load statistics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: t('totalPatients', 'Total Patients'),
      value: stats.patientCount,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: t('totalDoctors', 'Total Doctors'),
      value: stats.doctorCount,
      icon: Stethoscope,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: t('totalClinics', 'Total Clinics'),
      value: stats.clinicCount,
      icon: Building2,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">{t('loading', 'Loading...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-100 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          {t('adminDashboard', 'Admin Dashboard')}
        </h1>
        <p className="mt-1 text-sm text-gray-600 sm:text-base">
          {t('adminOverview', 'Overview of system statistics')}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className="border-gray-200 transition-all duration-200 hover:shadow-md hover:scale-[1.01]"
            >
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-xs sm:text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl sm:text-4xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`${stat.bgColor} rounded-xl p-3 sm:p-4 shadow-sm`}>
                    <Icon className={`h-6 w-6 sm:h-8 sm:w-8 ${stat.textColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg sm:text-xl font-bold text-gray-900">
          {t('quickActions', 'Quick Actions')}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card
            className="cursor-pointer border-gray-200 transition-all duration-200 hover:border-purple-300 hover:shadow-md"
            onClick={() => router.push('/dashboard/clinics')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <div className="rounded-lg bg-purple-50 p-2">
                  <Building2 className="h-5 w-5 text-purple-600" />
                </div>
                <span>{t('manageClinics', 'Manage Clinics')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                {t('manageClinicsDesc', 'View and verify registered clinics')}
              </p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer border-gray-200 transition-all duration-200 hover:border-green-300 hover:shadow-md"
            onClick={() => router.push('/dashboard/admin-doctors')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <div className="rounded-lg bg-green-50 p-2">
                  <Stethoscope className="h-5 w-5 text-green-600" />
                </div>
                <span>{t('manageDoctors', 'Manage Doctors')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                {t('manageDoctorsDesc', 'View all registered doctors')}
              </p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer border-gray-200 transition-all duration-200 hover:border-blue-300 hover:shadow-md"
            onClick={() => router.push('/dashboard/patients')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <div className="rounded-lg bg-blue-50 p-2">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <span>{t('managePatients', 'Manage Patients')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                {t('managePatientsDesc', 'View and manage patient accounts')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
