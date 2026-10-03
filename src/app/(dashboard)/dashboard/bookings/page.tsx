'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/contexts/language-context';
import { useToast } from '@/hooks/use-toast';
import { bookingService, type Booking, type Doctor } from '@/services/booking.service';
import { useAuthStore } from '@/stores/auth-store';
import { AlertTriangle, CheckCircle, Clock, Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

type StatusType =
  | 'PENDING'
  | 'INPROGRESS'
  | 'CONFIRMED'
  | 'ARRIVED'
  | 'COMPLETE'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NOT_UPDATED'
  | 'NOT_SHOW';

const statusConfig = {
  PENDING: {
    key: 'pending',
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800',
    icon: '⏱️',
  },
  INPROGRESS: {
    key: 'inProgress',
    label: 'In Progress',
    color: 'bg-blue-100 text-blue-800',
    icon: '▶️',
  },
  CONFIRMED: {
    key: 'confirmed',
    label: 'Confirmed',
    color: 'bg-green-100 text-green-800',
    icon: '✓',
  },
  COMPLETED: {
    key: 'completed',
    label: 'Completed',
    color: 'bg-teal-100 text-teal-800',
    icon: '✓',
  },
  COMPLETE: {
    key: 'completed',
    label: 'Completed',
    color: 'bg-teal-100 text-teal-800',
    icon: '✓',
  },
  ARRIVED: {
    key: 'arrived',
    label: 'Arrived',
    color: 'bg-indigo-100 text-indigo-800',
    icon: '🏃',
  },
  CANCELLED: {
    key: 'cancelled',
    label: 'Cancelled',
    color: 'bg-red-100 text-red-800',
    icon: '✕',
  },
  NOT_UPDATED: {
    key: 'notUpdated',
    label: 'Not Updated',
    color: 'bg-gray-100 text-gray-800',
    icon: '⚠️',
  },
  NOT_SHOW: {
    key: 'noShow',
    label: 'No Show',
    color: 'bg-orange-100 text-orange-800',
    icon: '🚫',
  },
};

export default function BookingsPage() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const router = useRouter();
  const role = useAuthStore((state) => state.role);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [clinicInfo, setClinicInfo] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<StatusType | 'ALL'>('ALL');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('ALL');
  const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(null);
  const [bookingToUpdate, setBookingToUpdate] = useState<Booking | null>(null);

  // Check if user has MANAGER or ADMIN role
  useEffect(() => {
    if (role && role !== 'MANAGER' && role !== 'ADMIN') {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to access this page',
        variant: 'destructive',
      });
      router.push('/dashboard');
    }
  }, [role, router, toast]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, doctorsRes, statsRes] = await Promise.all([
        bookingService.getBookingHistory({ page: 1, limit: 10 }),
        bookingService.getDoctors(),
        bookingService.getClinicStats(),
      ]);
      setBookings(bookingsRes.data.data);
      setDoctors(doctorsRes.data.data);
      setStats(statsRes.data);

      // Set clinic info from first doctor if available
      const firstDoctor = doctorsRes.data.data?.[0];
      if (firstDoctor) {
        setClinicInfo({
          name: firstDoctor.clinic,
          specialty: firstDoctor.specialty,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load bookings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingsByStatus = useCallback(
    async (status: StatusType | 'ALL') => {
      try {
        setLoading(true);
        const params: any = { page: 1, limit: 10 };
        if (status !== 'ALL') {
          params.status = status;
        }
        if (selectedDoctorId !== 'ALL') {
          params.doctorId = selectedDoctorId;
        }
        const response = await bookingService.getBookingHistory(params);
        setBookings(response.data.data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load bookings',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    },
    [selectedDoctorId, toast]
  );

  const handleStatusChange = async (newStatus: StatusType | 'ALL') => {
    setSelectedStatus(newStatus);
    await fetchBookingsByStatus(newStatus);
  };

  const handleDoctorFilter = async (doctorId: string) => {
    setSelectedDoctorId(doctorId);
    try {
      setLoading(true);
      const params: any = { page: 1, limit: 10 };
      if (selectedStatus !== 'ALL') {
        params.status = selectedStatus;
      }
      if (doctorId !== 'ALL') {
        params.doctorId = doctorId;
      }
      const response = await bookingService.getBookingHistory(params);
      setBookings(response.data.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to filter bookings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (targetStatus: string) => {
    if (!bookingToUpdate) return;

    try {
      setUpdatingBookingId(bookingToUpdate.id);
      await bookingService.updateAppointmentStatus(bookingToUpdate.id, targetStatus);

      const statusLabels: Record<string, string> = {
        CONFIRMED: 'Confirmed',
        CANCELLED: 'Cancelled',
        COMPLETE: 'Completed',
        COMPLETED: 'Completed',
        ARRIVED: 'Arrived',
        INPROGRESS: 'In Progress',
      };

      toast({
        title: 'Success',
        description: `Appointment status updated to ${statusLabels[targetStatus] || targetStatus}`,
      });

      setBookings((prev) =>
        prev.map((b) => (b.id === bookingToUpdate.id ? { ...b, status: targetStatus as any } : b))
      );

      // Refresh stats
      try {
        const statsRes = await bookingService.getClinicStats();
        if (statsRes?.data) {
          setStats(statsRes.data);
        }
      } catch (e) {
        // non-blocking
      }

      setBookingToUpdate(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to update appointment status',
        variant: 'destructive',
      });
    } finally {
      setUpdatingBookingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return 'N/A';
    return timeString.split('.')[0];
  };

  // Access denied check
  if (role && role !== 'MANAGER' && role !== 'ADMIN') {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-red-500" />
          <h2 className="mb-2 text-2xl font-bold text-gray-900">{t('accessDenied')}</h2>
          <p className="mb-4 text-gray-600">{t('noPermission')}</p>
        </div>
      </div>
    );
  }

  if (loading && bookings.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Loader className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-600" />
          <p className="text-gray-600">{t('loadingBookings')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 md:p-8">
      {/* Clinic Info Banner */}
      {clinicInfo && (
        <div className="flex items-center gap-4 rounded-xl border border-blue-100 bg-blue-50 p-6">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100">
            <svg
              className="h-6 w-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {clinicInfo.name || 'National Institute of Cancer Research & Hospital'}
            </h2>
            <p className="text-sm text-gray-600">
              {clinicInfo.specialty ? `(${clinicInfo.specialty})` : '(Cancer Specialist)'}
            </p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 transition-all hover:shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAppointment}</p>
                <p className="text-sm text-gray-600">{t('totalAppointments', 'Total Appointments')}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <svg
                  className="h-5 w-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 transition-all hover:shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.completedAppointment}</p>
                <p className="text-sm text-gray-600">{t('completed', 'Completed')}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 transition-all hover:shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingAppointment}</p>
                <p className="text-sm text-gray-600">{t('pending', 'Pending')}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                <svg
                  className="h-5 w-5 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 transition-all hover:shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.todayAppointment}</p>
                <p className="text-sm text-gray-600">{t('todayAppointments', "Today's Appointments")}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Management Section */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">
              {t('manageBookings', 'Booking Management')}
            </h3>
            <button
              onClick={() => fetchData()}
              className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition"
            >
              <span>{t('refresh', 'Refresh')}</span>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="border-b border-gray-200 px-4 sm:px-6 py-4 bg-gray-50/50">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {/* Search - Placeholder */}
            <div className="md:col-span-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('searchPlaceholder', 'Search...')}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <svg
                  className="absolute right-3 rtl:right-auto rtl:left-3 top-2.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Doctor Filter */}
            <div>
              <Select value={selectedDoctorId} onValueChange={handleDoctorFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t('allDoctorsOpt', 'All Doctors')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{t('allDoctorsOpt', 'All Doctors')}</SelectItem>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.doctorId} value={doctor.doctorId}>
                      {doctor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div>
              <Select
                value={selectedStatus}
                onValueChange={(value) => handleStatusChange(value as StatusType | 'ALL')}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('allStatusOpt', 'All Status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{t('allStatusOpt', 'All Status')}</SelectItem>
                  <SelectItem value="PENDING">{t('pending', 'Pending')}</SelectItem>
                  <SelectItem value="CONFIRMED">{t('confirmed', 'Confirmed')}</SelectItem>
                  <SelectItem value="ARRIVED">{t('arrived', 'Arrived')}</SelectItem>
                  <SelectItem value="COMPLETE">{t('completed', 'Completed')}</SelectItem>
                  <SelectItem value="CANCELLED">{t('cancelled', 'Cancelled')}</SelectItem>
                  <SelectItem value="NOT_UPDATED">{t('notUpdated', 'Not Updated')}</SelectItem>
                  <SelectItem value="NOT_SHOW">{t('noShow', 'No Show')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/75">
                <th className="px-4 py-3 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('no', 'NO')}</th>
                <th className="px-4 py-3 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('patient', 'Patient')}</th>
                <th className="px-4 py-3 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('doctor', 'Doctor')}</th>
                <th className="px-4 py-3 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {t('dateTime', 'Date / Time')}
                </th>
                <th className="px-4 py-3 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('queue', 'Queue')}</th>
                <th className="px-4 py-3 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('status', 'Status')}</th>
                <th className="px-4 py-3 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('actions', 'Action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <p className="text-gray-500">{t('noBookingsFound', 'No bookings found')}</p>
                  </td>
                </tr>
              ) : (
                bookings.map((booking, index) => {
                  const currentStatusCfg = statusConfig[booking.status as keyof typeof statusConfig];
                  const statusLabel = currentStatusCfg ? t(currentStatusCfg.key, currentStatusCfg.label) : booking.status;

                  return (
                    <tr key={booking.id} className="transition hover:bg-gray-50/80">
                      <td className="px-4 py-4 text-sm text-gray-900 text-start">{index + 1}</td>
                      <td className="px-4 py-4 text-start">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={booking.patient.user.profileImage} />
                            <AvatarFallback>
                              {(booking.patient.user.fullName || 'Patient')
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium text-gray-900">
                            {booking.patient.user.fullName || 'Unnamed Patient'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 text-start">
                        {booking.doctor.user.fullName || 'Unnamed Doctor'}
                      </td>
                      <td className="px-4 py-4 text-start">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">
                            {formatDate(booking.consultDate)}
                          </p>
                          <div className="mt-0.5 flex items-center gap-1 text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span className="text-xs">
                              {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-start">
                        <span className="inline-flex items-center rounded bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                          {t('queue', 'Queue')} #{booking.serialNumber}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-start">
                        <Badge
                          className={`${currentStatusCfg?.color || 'bg-gray-100 text-gray-800'}`}
                        >
                          {statusLabel}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-start">
                        {['CANCELLED', 'COMPLETE', 'COMPLETED', 'NOT_UPDATED', 'NOT_SHOW'].includes(booking.status) ? (
                          <span className="text-xs font-semibold text-gray-400">
                            {statusLabel}
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => setBookingToUpdate(booking)}
                            disabled={updatingBookingId === booking.id}
                            className="bg-blue-600 font-medium text-white hover:bg-blue-700"
                          >
                            {updatingBookingId === booking.id ? (
                              <>
                                <Loader className="ltr:mr-2 rtl:ml-2 h-4 w-4 animate-spin" />
                                {t('loading', 'Updating...')}
                              </>
                            ) : (
                              t('edit', 'Update Status')
                            )}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Update Status Dialog */}
      <Dialog open={!!bookingToUpdate} onOpenChange={(open) => !open && setBookingToUpdate(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-start">
            <DialogTitle className="text-xl font-bold text-gray-900 text-start">
              {t('edit', 'Update Status')}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 text-start">
              {t('queue', 'Queue')} #{bookingToUpdate?.serialNumber} -{' '}
              <span className="font-semibold text-gray-800">
                {bookingToUpdate?.patient?.user?.fullName || t('patient', 'Patient')}
              </span>
            </DialogDescription>
          </DialogHeader>

          {bookingToUpdate && (
            <div className="space-y-4 py-3">
              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 text-sm">
                <span className="font-medium text-gray-600">{t('status', 'Status')}:</span>
                <Badge
                  className={`${
                    statusConfig[bookingToUpdate.status as keyof typeof statusConfig]?.color ||
                    'bg-gray-100 text-gray-800'
                  }`}
                >
                  {statusConfig[bookingToUpdate.status as keyof typeof statusConfig]
                    ? t(
                        statusConfig[bookingToUpdate.status as keyof typeof statusConfig].key,
                        statusConfig[bookingToUpdate.status as keyof typeof statusConfig].label
                      )
                    : bookingToUpdate.status}
                </Badge>
              </div>

              {bookingToUpdate.status === 'PENDING' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => handleUpdateStatus('CANCELLED')}
                      disabled={updatingBookingId === bookingToUpdate.id}
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-medium"
                    >
                      {updatingBookingId === bookingToUpdate.id ? (
                        <Loader className="ltr:mr-2 rtl:ml-2 h-4 w-4 animate-spin" />
                      ) : null}
                      {t('cancelled', 'Cancel')}
                    </Button>
                    <Button
                      onClick={() => handleUpdateStatus('CONFIRMED')}
                      disabled={updatingBookingId === bookingToUpdate.id}
                      className="bg-emerald-600 text-white hover:bg-emerald-700 font-medium"
                    >
                      {updatingBookingId === bookingToUpdate.id ? (
                        <Loader className="ltr:mr-2 rtl:ml-2 h-4 w-4 animate-spin" />
                      ) : null}
                      {t('confirmed', 'Confirm')}
                    </Button>
                  </div>
                </div>
              )}

              {bookingToUpdate.status === 'CONFIRMED' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => handleUpdateStatus('CANCELLED')}
                      disabled={updatingBookingId === bookingToUpdate.id}
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-medium"
                    >
                      {updatingBookingId === bookingToUpdate.id ? (
                        <Loader className="ltr:mr-2 rtl:ml-2 h-4 w-4 animate-spin" />
                      ) : null}
                      {t('cancelled', 'Cancel')}
                    </Button>
                    <Button
                      onClick={() => handleUpdateStatus('ARRIVED')}
                      disabled={updatingBookingId === bookingToUpdate.id}
                      className="bg-indigo-600 text-white hover:bg-indigo-700 font-medium"
                    >
                      {updatingBookingId === bookingToUpdate.id ? (
                        <Loader className="ltr:mr-2 rtl:ml-2 h-4 w-4 animate-spin" />
                      ) : null}
                      {t('arrived', 'Arrived')}
                    </Button>
                  </div>
                </div>
              )}

              {(bookingToUpdate.status === 'ARRIVED' || bookingToUpdate.status === 'INPROGRESS' || (bookingToUpdate.status !== 'PENDING' && bookingToUpdate.status !== 'CONFIRMED')) && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => handleUpdateStatus('CANCELLED')}
                      disabled={updatingBookingId === bookingToUpdate.id}
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-medium"
                    >
                      {updatingBookingId === bookingToUpdate.id ? (
                        <Loader className="ltr:mr-2 rtl:ml-2 h-4 w-4 animate-spin" />
                      ) : null}
                      {t('cancelled', 'Cancel')}
                    </Button>
                    <Button
                      onClick={() => handleUpdateStatus('COMPLETE')}
                      disabled={updatingBookingId === bookingToUpdate.id}
                      className="bg-emerald-600 text-white hover:bg-emerald-700 font-medium"
                    >
                      {updatingBookingId === bookingToUpdate.id ? (
                        <Loader className="ltr:mr-2 rtl:ml-2 h-4 w-4 animate-spin" />
                      ) : null}
                      {t('completed', 'Complete')}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

