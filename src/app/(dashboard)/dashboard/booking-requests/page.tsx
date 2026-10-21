'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useLanguage } from '@/contexts/language-context';
import { useToast } from '@/hooks/use-toast';
import { bookingService, type Booking, type Doctor } from '@/services/booking.service';
import {
  Inbox,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  RefreshCw,
  Calendar,
  Phone,
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

export default function BookingRequestsPage() {
  const { t, language } = useLanguage();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<Booking[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('ALL');
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Rejection Dialog
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedBookingForReject, setSelectedBookingForReject] = useState<Booking | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {
        status: 'PENDING',
        page: 1,
        limit: 50,
      };
      if (selectedDoctorId !== 'ALL') {
        params.doctorId = selectedDoctorId;
      }

      const [bookingRes, docRes] = await Promise.all([
        bookingService.getBookingHistory(params),
        bookingService.getDoctors(),
      ]);

      setRequests(bookingRes?.data?.data || []);
      setDoctors(docRes?.data?.data || []);
    } catch (err: any) {
      toast({
        title: t('error', 'Error'),
        description: err?.response?.data?.message || t('failedToLoadRequests', 'Failed to load booking requests'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [selectedDoctorId, toast, t]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleAccept = async (bookingId: string) => {
    try {
      setUpdatingId(bookingId);
      await bookingService.updateAppointmentStatus(bookingId, 'CONFIRMED');
      toast({
        title: t('success', 'Success'),
        description: t('bookingConfirmed', 'Booking confirmed successfully.'),
      });
      fetchRequests();
    } catch (err: any) {
      toast({
        title: t('error', 'Error'),
        description: err?.response?.data?.message || t('failedToUpdateStatus', 'Failed to confirm booking'),
        variant: 'destructive',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleOpenReject = (booking: Booking) => {
    setSelectedBookingForReject(booking);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedBookingForReject) return;
    try {
      setUpdatingId(selectedBookingForReject.id);
      await bookingService.updateAppointmentStatus(
        selectedBookingForReject.id,
        'REJECTED',
        rejectReason || 'Clinic was unable to accommodate this slot'
      );
      toast({
        title: t('success', 'Success'),
        description: t('bookingRejected', 'Booking request rejected.'),
      });
      setRejectModalOpen(false);
      setSelectedBookingForReject(null);
      fetchRequests();
    } catch (err: any) {
      toast({
        title: t('error', 'Error'),
        description: err?.response?.data?.message || t('failedToUpdateStatus', 'Failed to reject booking'),
        variant: 'destructive',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  // Client filtering
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      if (selectedDate) {
        const reqDate = new Date(req.consultDate).toISOString().slice(0, 10);
        if (reqDate !== selectedDate) return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const patientName = req.patient?.user?.fullName?.toLowerCase() || '';
      const patientPhone = req.patient?.user?.phoneNumber?.toLowerCase() || '';
      const doctorName = req.doctor?.user?.fullName?.toLowerCase() || '';
      const serial = `#${req.serialNumber}`;
      return patientName.includes(q) || patientPhone.includes(q) || doctorName.includes(q) || serial.includes(q);
    });
  }, [requests, searchQuery, selectedDate]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              {t('bookingRequests', 'Booking Requests')}
            </h1>
            <Badge className="bg-amber-100 text-amber-800 border-amber-200">
              {filteredRequests.length} {t('pending', 'Pending')}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            {t(
              'bookingRequestsSubtitle',
              'Incoming patient booking requests requiring clinic approval or scheduling review.'
            )}
          </p>
        </div>

        <Button
          onClick={fetchRequests}
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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

          {/* Date Filter */}
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

      {/* Content */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-12 text-center text-gray-500">
          <Inbox className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-3 text-base font-semibold text-gray-900">
            {t('noPendingRequests', 'No Pending Requests')}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {t('allCaughtUp', 'All booking requests have been reviewed.')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filteredRequests.map((req) => (
            <div
              key={req.id}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-blue-200"
            >
              <div className="flex items-start justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-blue-600">
                    #{req.serialNumber}
                  </span>
                  <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 text-xs">
                    {t('pending', 'Pending Approval')}
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Calendar className="h-3.5 w-3.5 text-gray-400" />
                  <span>
                    {new Date(req.consultDate).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                {/* Patient Info */}
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {t('patient', 'Patient')}
                  </span>
                  <p className="font-semibold text-gray-900 text-sm">
                    {req.patient?.user?.fullName || 'N/A'}
                  </p>
                  <p className="text-xs text-gray-500 font-mono flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    <span>{req.patient?.user?.phoneNumber}</span>
                  </p>
                </div>

                {/* Doctor & Slot */}
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {t('doctor', 'Doctor')}
                  </span>
                  <p className="font-semibold text-gray-900 text-sm">
                    {req.doctor?.user?.fullName || 'N/A'}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>
                      {req.startTime} - {req.endTime}
                    </span>
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenReject(req)}
                  disabled={updatingId === req.id}
                  className="text-xs text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                >
                  <XCircle className="h-3.5 w-3.5 mr-1" />
                  <span>{t('reject', 'Reject')}</span>
                </Button>

                <Button
                  size="sm"
                  onClick={() => handleAccept(req.id)}
                  disabled={updatingId === req.id}
                  className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                  <span>{updatingId === req.id ? t('confirming', 'Confirming...') : t('confirm', 'Confirm Booking')}</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">
              {t('rejectBookingRequest', 'Reject Booking Request')}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              {t('rejectNotice', 'Specify a reason for rejecting this booking request. The patient will be notified.')}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-3 space-y-3">
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder={t('rejectionReasonPlaceholder', 'e.g. Doctor unavailable during requested time')}
              rows={3}
              className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRejectModalOpen(false)}
              >
                {t('cancel', 'Cancel')}
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmReject}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {t('confirmReject', 'Confirm Rejection')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
