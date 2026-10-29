'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/language-context';
import { useToast } from '@/hooks/use-toast';
import { bookingService, type Doctor } from '@/services/booking.service';
import { clinicService } from '@/services/clinic.service';
import {
  Clock,
  Calendar,
  AlertTriangle,
  RefreshCw,
  Stethoscope,
  ChevronRight,
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

export default function ClinicSchedulesPage() {
  const { t } = useLanguage();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [doctorDetails, setDoctorDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Absence Caseload Modal
  const [absenceModalOpen, setAbsenceModalOpen] = useState(false);
  const [absenceDate, setAbsenceDate] = useState<string>('');
  const [absenceReason, setAbsenceReason] = useState<string>('');
  const [caseloadData, setCaseloadData] = useState<any>(null);
  const [checkingCaseload, setCheckingCaseload] = useState(false);
  const [executingAbsence, setExecutingAbsence] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await bookingService.getDoctors();
      const docs = res?.data?.data || [];
      setDoctors(docs);
      const firstDoc = docs[0];
      if (firstDoc?.doctorId) {
        setSelectedDoctorId(firstDoc.doctorId);
        loadDoctorSchedule(firstDoc.doctorId);
      }
    } catch (err: any) {
      toast({
        title: t('error', 'Error'),
        description: err?.response?.data?.message || t('failedToLoadDoctors', 'Failed to load doctors'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadDoctorSchedule = async (doctorId: string) => {
    try {
      setLoadingDetails(true);
      const res = await clinicService.getDoctorAppointments(doctorId, { status: 'CONFIRMED' });
      setDoctorDetails(res?.doctor || null);
    } catch (err: any) {
      // ignore
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSelectDoctor = (doctorId: string) => {
    setSelectedDoctorId(doctorId);
    loadDoctorSchedule(doctorId);
  };

  // Doctor Absence Flow
  const handleCheckAbsenceCaseload = async () => {
    if (!selectedDoctorId || !absenceDate) {
      toast({
        title: t('validationError', 'Validation Error'),
        description: t('selectDate', 'Please select a date.'),
        variant: 'destructive',
      });
      return;
    }

    try {
      setCheckingCaseload(true);
      const res = await clinicService.getDoctorAbsenceCaseload(selectedDoctorId, absenceDate);
      setCaseloadData(res?.data || null);
    } catch (err: any) {
      toast({
        title: t('error', 'Error'),
        description: err?.response?.data?.message || t('failedCaseload', 'Failed to retrieve caseload preview'),
        variant: 'destructive',
      });
    } finally {
      setCheckingCaseload(false);
    }
  };

  const handleExecuteAbsence = async () => {
    if (!selectedDoctorId || !absenceDate) return;
    try {
      setExecutingAbsence(true);
      const result = await clinicService.executeDoctorAbsence({
        doctorId: selectedDoctorId,
        date: absenceDate,
        reason: absenceReason || 'Emergency doctor leave',
      });
      const failed = result.data?.processedBookings?.filter((booking: any) => !booking.success) || [];
      if (failed.length) {
        setCaseloadData(null);
        throw new Error(`${failed.length} bookings could not be processed. Other bookings were processed. Preview the remaining bookings before retrying.`);
      }
      toast({
        title: t('success', 'Success'),
        description: t('absenceExecuted', 'Doctor absence processed. Pending holds were released; eligible consultation fees for confirmed Mode B bookings were refunded. Captured service fees remain non-refundable.'),
      });
      setAbsenceModalOpen(false);
      setCaseloadData(null);
      setAbsenceReason('');
      if (selectedDoctorId) {
        loadDoctorSchedule(selectedDoctorId);
      }
    } catch (err: any) {
      toast({
        title: t('error', 'Error'),
        description: err?.response?.data?.message || err.message || t('failedAbsenceExecute', 'Failed to execute doctor absence'),
        variant: 'destructive',
      });
    } finally {
      setExecutingAbsence(false);
    }
  };

  const selectedDoctorObj = doctors.find((d) => d.doctorId === selectedDoctorId);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              {t('doctorSchedules', 'Doctor Schedules & Working Hours')}
            </h1>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            {t(
              'schedulesSubtitle',
              'View weekly clinic availability, slot capacities, and manage emergency doctor absences.'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => {
              setAbsenceDate(new Date().toISOString().slice(0, 10));
              setCaseloadData(null);
              setAbsenceModalOpen(true);
            }}
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 border-amber-200 text-amber-700 hover:bg-amber-50"
          >
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span>{t('manageDoctorAbsence', 'Emergency Doctor Leave')}</span>
          </Button>

          <Button
            onClick={fetchDoctors}
            variant="outline"
            size="sm"
            disabled={loading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{t('refresh', 'Refresh')}</span>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
        </div>
      ) : doctors.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-12 text-center text-gray-500">
          <Stethoscope className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-3 text-base font-semibold text-gray-900">
            {t('noDoctorsLinked', 'No Doctors Linked')}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {t('linkDoctorsFirst', 'Add or approve doctor join requests in the Doctors section.')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Doctor List column */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 px-1">
              {t('clinicDoctors', 'Clinic Doctors')} ({doctors.length})
            </h3>
            <div className="space-y-2">
              {doctors.map((doc) => {
                const isSelected = doc.doctorId === selectedDoctorId;
                return (
                  <button
                    key={doc.doctorId}
                    onClick={() => handleSelectDoctor(doc.doctorId)}
                    className={`w-full text-left rtl:text-right rounded-xl p-4 transition-all flex items-center justify-between border ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/60 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className={`font-semibold text-sm truncate ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}>
                        {doc.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{doc.specialty || 'General Practitioner'}</p>
                      <p className="text-xs text-gray-400 mt-1">Fee: {doc.fee || 0} SAR</p>
                    </div>
                    <ChevronRight className={`h-4 w-4 shrink-0 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Schedule Detail Column */}
          <div className="lg:col-span-2">
            {loadingDetails ? (
              <div className="flex h-64 items-center justify-center rounded-xl border border-gray-200 bg-white">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
              </div>
            ) : !selectedDoctorObj ? null : (
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{selectedDoctorObj.name}</h2>
                    <p className="text-xs text-gray-500">{selectedDoctorObj.specialty || 'Specialist'}</p>
                  </div>
                  <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 text-xs">
                    {selectedDoctorObj.upcomingConsult || 0} Upcoming Consults
                  </Badge>
                </div>

                {/* Working Days & Slots */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span>{t('weeklyWorkingSchedule', 'Weekly Working Hours & Time Slots')}</span>
                  </h3>

                  {doctorDetails?.schedule && doctorDetails.schedule.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {doctorDetails.schedule.map((dayItem: any, idx: number) => (
                        <div key={idx} className="rounded-lg border border-gray-100 bg-gray-50/70 p-3.5">
                          <p className="font-semibold text-xs uppercase tracking-wider text-blue-700">
                            {dayItem.day}
                          </p>
                          <div className="mt-2 space-y-1.5">
                            {dayItem.slots && dayItem.slots.length > 0 ? (
                              dayItem.slots.map((s: any, sIdx: number) => (
                                <div
                                  key={sIdx}
                                  className="flex items-center justify-between text-xs bg-white p-2 rounded border border-gray-200"
                                >
                                  <span className="font-mono text-gray-900">
                                    {s.startTime} - {s.endTime}
                                  </span>
                                  <span className="text-gray-500">Capacity: {s.capacity || 1}</span>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-gray-400 italic">No slots scheduled</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg bg-gray-50 p-6 text-center text-gray-500">
                      <Calendar className="mx-auto h-8 w-8 text-gray-300" />
                      <p className="text-xs mt-2">
                        {t('standardDefaultSlots', 'Standard doctor schedule active (configured via doctor profile).')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Emergency Doctor Absence Modal */}
      <Dialog open={absenceModalOpen} onOpenChange={setAbsenceModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <span>{t('doctorAbsenceManagement', 'Doctor Absence & Caseload Reallocation')}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              {t(
                'absenceDescription',
                'Review the affected caseload. Pending holds are released; eligible consultation fees for confirmed Mode B bookings are refunded. Captured service fees remain non-refundable.'
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-3 space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-gray-700">{t('doctor', 'Doctor')}</label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  {doctors.map((d) => (
                    <option key={d.doctorId} value={d.doctorId}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">{t('absenceDate', 'Absence Date')}</label>
                <input
                  type="date"
                  value={absenceDate}
                  onChange={(e) => setAbsenceDate(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700">{t('reason', 'Reason for Absence')}</label>
              <input
                type="text"
                value={absenceReason}
                onChange={(e) => setAbsenceReason(e.target.value)}
                placeholder="e.g. Medical emergency or sudden leave"
                className="mt-1 w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCheckAbsenceCaseload}
              disabled={checkingCaseload || !selectedDoctorId || !absenceDate}
              className="w-full text-xs"
            >
              {checkingCaseload ? t('checkingCaseload', 'Checking Caseload...') : t('previewAffectedAppointments', 'Preview Affected Bookings')}
            </Button>

            {/* Caseload Preview */}
            {caseloadData && (
              <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-4 space-y-2 text-xs">
                <p className="font-bold text-amber-900">
                  {t('impactSummary', 'Impact Summary for')} {absenceDate}:
                </p>
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="bg-white p-2 rounded border border-amber-100">
                    <p className="text-lg font-bold text-gray-900">{caseloadData.totalAffected || 0}</p>
                    <p className="text-gray-500">Total Affected</p>
                  </div>
                  <div className="bg-white p-2 rounded border border-amber-100">
                    <p className="text-lg font-bold text-blue-600">{caseloadData.summary?.pendingCount || 0}</p>
                    <p className="text-gray-500">Pending requests</p>
                  </div>
                  <div className="bg-white p-2 rounded border border-amber-100">
                    <p className="text-lg font-bold text-red-600">{caseloadData.summary?.confirmedCount || 0}</p>
                    <p className="text-gray-500">{t('activeBookingsToCancel', 'Confirmed / arrived / in-progress to cancel')}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <Button variant="outline" size="sm" onClick={() => setAbsenceModalOpen(false)}>
                {t('cancel', 'Cancel')}
              </Button>
              <Button
                size="sm"
                onClick={handleExecuteAbsence}
                disabled={executingAbsence || !caseloadData}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                {executingAbsence ? t('processing', 'Processing...') : t('executeCaseloadAbsence', 'Confirm & Execute Absence')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
