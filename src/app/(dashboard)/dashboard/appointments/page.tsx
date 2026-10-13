'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useLanguage } from '@/contexts/language-context';
import { useToast } from '@/hooks/use-toast';
import { bookingService, type Booking, type Doctor } from '@/services/booking.service';
import {
  CalendarDays,
  CheckCircle2,
  RefreshCw,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function AppointmentsPage() {
  const { t, language } = useLanguage();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Booking[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });

  // Reason Modal
  const [reasonModalOpen, setReasonModalOpen] = useState(false);
  const [selectedBookingForReason, setSelectedBookingForReason] = useState<Booking | null>(null);
  const [reasonActionStatus, setReasonActionStatus] = useState<string>('');
  const [reasonText, setReasonText] = useState('');

  const fetchAppointments = useCallback(async (targetPage = page) => {
    try {
      setLoading(true);
      const params: any = {
        page: targetPage,
        limit: 15,
      };
      if (selectedStatus !== 'ALL') {
        params.status = selectedStatus;
      }
      if (selectedDoctorId !== 'ALL') {
        params.doctorId = selectedDoctorId;
      }

      const [res, docRes] = await Promise.all([
        bookingService.getBookingHistory(params),
        bookingService.getDoctors(),
      ]);

      setAppointments(res?.data?.data || []);
      setDoctors(docRes?.data?.data || []);
      if (res?.data?.meta) {
        setMeta({
          page: res.data.meta.page || targetPage,
          limit: res.data.meta.limit || 15,
          total: res.data.meta.total || 0,
          totalPages: Math.max(1, Math.ceil((res.data.meta.total || 0) / (res.data.meta.limit || 15))),
        });
      }
    } catch (err: any) {
      toast({
        title: t('error', 'Error'),
        description: err?.response?.data?.message || t('failedToLoadAppointments', 'Failed to load appointments'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [selectedDoctorId, selectedStatus, page, toast, t]);

  useEffect(() => {
    fetchAppointments(1);
  }, [selectedDoctorId, selectedStatus]);

  const handleUpdateStatus = async (bookingId: string, status: string, reason?: string) => {
    try {
      setUpdatingId(bookingId);
      await bookingService.updateAppointmentStatus(bookingId, status, reason);
      toast({
        title: t('success', 'Success'),
        description: t('statusUpdated', `Appointment status updated to ${status}.`),
      });
      fetchAppointments(page);
    } catch (err: any) {
      toast({
        title: t('error', 'Error'),
        description: err?.response?.data?.message || t('failedToUpdateStatus', 'Failed to update status'),
        variant: 'destructive',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const openReasonModal = (booking: Booking, status: string) => {
    setSelectedBookingForReason(booking);
    setReasonActionStatus(status);
    setReasonText('');
    setReasonModalOpen(true);
  };

  const handleConfirmReason = async () => {
    if (!selectedBookingForReason) return;
    await handleUpdateStatus(selectedBookingForReason.id, reasonActionStatus, reasonText);
    setReasonModalOpen(false);
    setSelectedBookingForReason(null);
  };

  // Client filtering
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      if (selectedDate) {
        const aptDate = new Date(apt.consultDate).toISOString().slice(0, 10);
        if (aptDate !== selectedDate) return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const patientName = apt.patient?.user?.fullName?.toLowerCase() || '';
      const patientPhone = apt.patient?.user?.phoneNumber?.toLowerCase() || '';
      const doctorName = apt.doctor?.user?.fullName?.toLowerCase() || '';
      const serial = `#${apt.serialNumber}`;
      return patientName.includes(q) || patientPhone.includes(q) || doctorName.includes(q) || serial.includes(q);
    });
  }, [appointments, searchQuery, selectedDate]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              {t('appointments', 'Appointments Management')}
            </h1>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            {t(
              'appointmentsSubtitle',
              'Day-to-day clinic queue management, patient arrivals, and completed consultations.'
            )}
          </p>
        </div>

        <Button
          onClick={() => fetchAppointments(page)}
          variant="outline"
          size="sm"
          disabled={loading}
          className="flex items-center gap-1.5"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{t('refresh', 'Refresh')}</span>
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 rtl:left-auto rtl:right-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPatientOrDoctor', 'Search patient, phone, doctor...')}
              className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 rtl:pl-4 rtl:pr-9"
            />
          </div>

          {/* Doctor Selector */}
          <div>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            >
              <option value="ALL">{t('allDoctors', 'All Doctors')}</option>
              {doctors.map((doc) => (
                <option key={doc.doctorId} value={doc.doctorId}>
                  {doc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Selector */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            >
              <option value="ALL">{t('allStatusOpt', 'All Statuses')}</option>
              <option value="CONFIRMED">{t('confirmed', 'Confirmed')}</option>
              <option value="ARRIVED">{t('arrived', 'Arrived')}</option>
              <option value="INPROGRESS">{t('inProgress', 'In Progress')}</option>
              <option value="COMPLETE">{t('completed', 'Completed')}</option>
              <option value="NOT_SHOW">{t('noShow', 'No Show')}</option>
              <option value="CANCELLED">{t('cancelled', 'Cancelled')}</option>
            </select>
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            />
            {selectedDate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDate('')}
                className="text-xs text-gray-500"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <CalendarDays className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-3 text-base font-semibold text-gray-900">
              {t('noAppointmentsFound', 'No Appointments Found')}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {t('adjustFilters', 'Try adjusting your search or date filters.')}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 rtl:text-right">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">{t('serial', 'Serial')}</th>
                  <th className="px-5 py-3.5 font-semibold">{t('dateTime', 'Date & Time')}</th>
                  <th className="px-5 py-3.5 font-semibold">{t('patient', 'Patient')}</th>
                  <th className="px-5 py-3.5 font-semibold">{t('doctor', 'Doctor')}</th>
                  <th className="px-5 py-3.5 font-semibold">{t('status', 'Status')}</th>
                  <th className="px-5 py-3.5 font-semibold text-right rtl:text-left">{t('actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAppointments.map((apt) => {
                  const isCompleted = apt.status === 'COMPLETE' || apt.status === 'COMPLETED';
                  const isCancelled = apt.status === 'CANCELLED' || apt.status === 'REJECTED';
                  const isNoShow = apt.status === 'NOT_SHOW';

                  return (
                    <tr key={apt.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-medium text-gray-900">
                        #{apt.serialNumber}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-gray-900">
                          {new Date(apt.consultDate).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                        <div className="text-xs text-gray-400">
                          {apt.startTime} - {apt.endTime}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-gray-900">{apt.patient?.user?.fullName || 'N/A'}</div>
                        <div className="text-xs text-gray-400 font-mono">{apt.patient?.user?.phoneNumber}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-gray-900">{apt.doctor?.user?.fullName || 'N/A'}</div>
                        <div className="text-xs text-gray-400">{apt.doctor?.speciality || 'General'}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge
                          variant="secondary"
                          className={
                            isCompleted
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : apt.status === 'CONFIRMED'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : apt.status === 'ARRIVED'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : apt.status === 'INPROGRESS'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : isCancelled
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : isNoShow
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-gray-100 text-gray-700'
                          }
                        >
                          {apt.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-right rtl:text-left">
                        <div className="flex items-center justify-end gap-1.5">
                          {apt.status === 'CONFIRMED' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateStatus(apt.id, 'ARRIVED')}
                              disabled={updatingId === apt.id}
                              className="h-8 text-xs text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                            >
                              {t('markArrived', 'Arrived')}
                            </Button>
                          )}

                          {(apt.status === 'ARRIVED' || apt.status === 'INPROGRESS') && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateStatus(apt.id, 'COMPLETE')}
                              disabled={updatingId === apt.id}
                              className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                              {t('complete', 'Complete')}
                            </Button>
                          )}

                          {!isCompleted && !isCancelled && !isNoShow && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openReasonModal(apt, 'NOT_SHOW')}
                                disabled={updatingId === apt.id}
                                className="h-8 text-xs text-amber-600 border-amber-200 hover:bg-amber-50"
                              >
                                {t('noShow', 'No Show')}
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openReasonModal(apt, 'CANCELLED')}
                                disabled={updatingId === apt.id}
                                className="h-8 text-xs text-red-600 hover:bg-red-50"
                              >
                                {t('cancel', 'Cancel')}
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-5 py-3 text-xs text-gray-600">
            <div>
              {t('showingPage', 'Page')} {meta.page} {t('of', 'of')} {meta.totalPages} ({meta.total} {t('total', 'total')})
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={meta.page <= 1 || loading}
                onClick={() => {
                  setPage(meta.page - 1);
                  fetchAppointments(meta.page - 1);
                }}
                className="h-8 text-xs"
              >
                {t('previous', 'Previous')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={meta.page >= meta.totalPages || loading}
                onClick={() => {
                  setPage(meta.page + 1);
                  fetchAppointments(meta.page + 1);
                }}
                className="h-8 text-xs"
              >
                {t('next', 'Next')}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Reason Dialog */}
      <Dialog open={reasonModalOpen} onOpenChange={setReasonModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">
              {reasonActionStatus === 'NOT_SHOW' ? t('markNoShow', 'Mark Patient as No Show') : t('cancelAppointment', 'Cancel Appointment')}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              {reasonActionStatus === 'NOT_SHOW'
                ? t('noShowNotice', 'Patient did not attend appointment. Record notes for clinic documentation.')
                : t('cancelNotice', 'Provide reason for cancellation. Patient will receive refund per clinic policy.')}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-3 space-y-3">
            <textarea
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
              placeholder={t('reasonPlaceholder', 'Reason / notes...')}
              rows={3}
              className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setReasonModalOpen(false)}>
                {t('cancel', 'Cancel')}
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmReason}
                className={reasonActionStatus === 'NOT_SHOW' ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}
              >
                {t('confirm', 'Confirm')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
