'use client';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import {
  DoctorQualification,
  parseDoctorQualifications,
} from '@/lib/qualifications';
import { bookingService, Doctor, DoctorJoinRequest } from '@/services/booking.service';
import {
  Briefcase,
  Building2,
  Check,
  Clock,
  DollarSign,
  Eye,
  GraduationCap,
  MapPin,
  Stethoscope,
  UserPlus,
  X,
} from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { useEffect, useState } from 'react';

export default function DoctorsPage() {
  const { t } = useLanguage();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [joinRequests, setJoinRequests] = useState<DoctorJoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isRequestsOpen, setIsRequestsOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchDoctors();
    fetchJoinRequests();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await bookingService.getDoctors();
      setDoctors(res.data.data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to load doctors',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchJoinRequests = async () => {
    try {
      const res = await bookingService.getJoinRequests();
      setJoinRequests(res.data || []);
    } catch {
      // ignore
    }
  };

  const handleRespondRequest = async (requestId: string, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      setActionLoadingId(requestId);
      await bookingService.respondJoinRequest(requestId, status);
      toast({
        title: 'Success',
        description: `Join request ${status.toLowerCase()} successfully`,
      });
      fetchJoinRequests();
      fetchDoctors();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Action failed',
        variant: 'destructive',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const pendingRequests = joinRequests.filter((r) => r.status === 'PENDING');

  const openDoctorDetails = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsDetailsOpen(true);
  };

  const selectedQualifications: DoctorQualification[] = selectedDoctor
    ? parseDoctorQualifications(selectedDoctor.qualifications || selectedDoctor.biography)
    : [];

  if (loading) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              {t('clinicDoctors', 'Clinic Doctors')}
            </h1>
            <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
              {doctors.length} {t('doctors', 'Doctors')}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {t('clinicDoctorsDesc', 'Manage and view all registered doctors and their academic qualifications under your clinic.')}
          </p>
        </div>

        <Button
          onClick={() => setIsRequestsOpen(true)}
          className="relative rounded-xl bg-indigo-600 px-4 py-2 hover:bg-indigo-700 text-white font-semibold text-sm flex items-center gap-2 shadow-sm shrink-0"
        >
          <UserPlus className="h-4 w-4" />
          {t('joinRequests', 'Join Requests')}
          {pendingRequests.length > 0 && (
            <span className="ml-1 rounded-full bg-amber-400 px-2 py-0.5 text-xs font-bold text-gray-900 animate-pulse">
              {pendingRequests.length}
            </span>
          )}
        </Button>
      </div>

      {/* GRID */}
      {doctors.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
          <Stethoscope className="h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">{t('noDoctorsFound', 'No doctors found')}</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm">
            There are currently no doctors associated with this clinic.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doctor) => {
            const qualifications = parseDoctorQualifications(doctor.qualifications || doctor.biography);
            return (
              <Card
                key={doctor.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-white transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                {/* TOP STRIP */}
                <div className="h-2 w-full bg-gradient-to-r from-indigo-500 to-purple-500" />

                <CardContent className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* PROFILE */}
                    <div className="flex items-center gap-4">
                      <Avatar className="h-14 w-14 ring-2 ring-indigo-500/20 shadow-sm">
                        <AvatarImage src={doctor.profileImage} />
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold">
                          {(doctor.name || 'Doctor')
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-gray-900 truncate">
                          {doctor.name || 'Unnamed Doctor'}
                        </h3>

                        <div className="mt-1 flex items-center gap-1 text-xs text-gray-500 truncate">
                          <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                          <span className="truncate">{[doctor.city, doctor.country].filter(Boolean).join(', ') || 'No location'}</span>
                        </div>
                      </div>
                    </div>

                    {/* META */}
                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1.5 rounded-lg bg-indigo-50 p-2 text-indigo-700 font-medium">
                        <Stethoscope className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{doctor.specialty || t('general')}</span>
                      </div>

                      <div className="flex items-center gap-1.5 rounded-lg bg-gray-50 p-2 text-gray-700 border">
                        <Briefcase className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                        <span className="truncate">{doctor.experience ? `${doctor.experience} ${t('yearsExperience')}` : '—'}</span>
                      </div>
                    </div>

                    {/* QUALIFICATIONS BADGE */}
                    <div className="mt-3 rounded-lg bg-purple-50/70 p-2.5 border border-purple-100">
                      <div className="flex items-center justify-between text-xs text-purple-900 font-medium">
                        <span className="flex items-center gap-1.5">
                          <GraduationCap className="h-4 w-4 text-purple-600" />
                          {t('qualifications')}
                        </span>
                        <span className="rounded bg-purple-200/80 px-1.5 py-0.2 text-[10px] font-bold text-purple-800">
                          {qualifications.length}
                        </span>
                      </div>
                      {qualifications.length > 0 ? (
                        <p className="mt-1 text-xs text-purple-700 truncate">
                          {qualifications[0]?.degree}
                          {qualifications[0]?.institute ? ` • ${qualifications[0]?.institute}` : ''}
                        </p>
                      ) : (
                        <p className="mt-1 text-[11px] text-gray-400 italic">
                          {t('noQualificationsRecorded')}
                        </p>
                      )}
                    </div>

                    {/* CLINIC */}
                    <div className="mt-3 flex items-center gap-2 rounded-lg bg-gray-50 p-2.5 text-xs text-gray-700">
                      <Building2 className="h-4 w-4 text-indigo-500 shrink-0" />
                      <span className="truncate font-medium">{doctor.clinic || t('independentDoctor')}</span>
                    </div>
                  </div>

                  {/* FOOTER */}
                  <div className="mt-4 flex items-center justify-between border-t pt-3">
                    <div className="flex items-center gap-1 text-base font-bold text-emerald-600">
                      <DollarSign className="h-4 w-4" />
                      {doctor.fee} LYD
                    </div>

                    <Button
                      size="sm"
                      onClick={() => openDoctorDetails(doctor)}
                      className="rounded-lg bg-indigo-600 px-4 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      {t('viewProfile')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Doctor Profile Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto p-0 rounded-2xl">
          {selectedDoctor && (
            <div>
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 text-white">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 ring-2 ring-white/40">
                    <AvatarImage src={selectedDoctor.profileImage} />
                    <AvatarFallback className="bg-white text-indigo-600 font-bold text-xl">
                      {(selectedDoctor.name || 'Dr')
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {selectedDoctor.name || t('unnamedDoctor')}
                    </h2>
                    <p className="text-indigo-100 text-sm">{selectedDoctor.specialty || t('medicalSpecialist')}</p>
                    <p className="text-indigo-200 text-xs mt-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {[selectedDoctor.city, selectedDoctor.country].filter(Boolean).join(', ') || t('noLocation')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-5">
                {/* Qualifications */}
                <div>
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <GraduationCap className="h-5 w-5 text-indigo-600" />
                    <h3 className="text-sm font-bold text-gray-900">
                      {t('academicQualifications')}
                    </h3>
                  </div>

                  <div className="mt-3 space-y-2.5">
                    {selectedQualifications.length === 0 ? (
                      <p className="text-xs text-gray-500 italic p-3 bg-gray-50 rounded-lg text-center">
                        {t('noQualificationsRecorded')}
                      </p>
                    ) : (
                      selectedQualifications.map((qual, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 rounded-lg border border-indigo-100 bg-indigo-50/30 p-3"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-indigo-600 text-white font-bold text-xs">
                            {qual.year ? qual.year.slice(-2) : idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-gray-900 text-xs">{qual.degree}</span>
                              {qual.year && (
                                <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded">
                                  {qual.year}
                                </span>
                              )}
                            </div>
                            {qual.institute && (
                              <p className="text-xs text-gray-600 mt-0.5">{qual.institute}</p>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* About */}
                {selectedDoctor.about && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 pb-1 border-b">{t('about')}</h3>
                    <p className="mt-2 text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg">
                      {selectedDoctor.about}
                    </p>
                  </div>
                )}

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-500 font-medium">{t('experience')}</span>
                    <p className="font-bold text-gray-900 mt-0.5">{selectedDoctor.experience ? `${selectedDoctor.experience} ${t('years')}` : '—'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-500 font-medium">{t('consultationFee')}</span>
                    <p className="font-bold text-emerald-700 mt-0.5">{selectedDoctor.fee} LYD</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* JOIN REQUESTS DIALOG */}
      <Dialog open={isRequestsOpen} onOpenChange={setIsRequestsOpen}>
        <DialogContent className="max-w-2xl overflow-hidden rounded-2xl p-0">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white/20 p-2.5 backdrop-blur-md">
                <UserPlus className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{t('doctorJoinRequests', 'Doctor Join Requests')}</h2>
                <p className="text-xs text-indigo-100 mt-0.5">
                  {t('doctorJoinRequestsDesc', 'Review and approve doctors requesting to join your clinic.')}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
            {joinRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center text-gray-500">
                <Clock className="h-10 w-10 text-gray-300 mb-2" />
                <p className="font-semibold text-gray-700">{t('noJoinRequests', 'No join requests found')}</p>
                <p className="text-xs text-gray-400 mt-0.5">When doctors request to join your clinic, they will appear here.</p>
              </div>
            ) : (
              joinRequests.map((req) => {
                const isPending = req.status === 'PENDING';
                const qualifications = parseDoctorQualifications(req.doctor?.qualifications);
                return (
                  <div
                    key={req.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border bg-white p-4 shadow-sm transition-all hover:border-indigo-200"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <Avatar className="h-12 w-12 shrink-0 ring-2 ring-indigo-100">
                        <AvatarImage src={req.doctor?.user?.profileImage} />
                        <AvatarFallback className="bg-indigo-600 font-bold text-white">
                          {(req.doctor?.user?.fullName || 'D')
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-900 truncate">{req.doctor?.user?.fullName || 'Doctor'}</h4>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              req.status === 'ACCEPTED'
                                ? 'bg-emerald-100 text-emerald-700'
                                : req.status === 'REJECTED'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {req.status}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1 font-medium text-indigo-600">
                            <Stethoscope className="h-3.5 w-3.5" />
                            {req.doctor?.speciality || 'General'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-3.5 w-3.5" />
                            {req.doctor?.experience ? `${req.doctor.experience} yrs exp` : '—'}
                          </span>
                        </div>

                        {qualifications.length > 0 && (
                          <div className="mt-1.5 flex items-center gap-1 text-[11px] text-purple-700 font-medium">
                            <GraduationCap className="h-3.5 w-3.5 text-purple-600" />
                            <span>{qualifications[0]?.degree} {qualifications[0]?.institute ? `(${qualifications[0].institute})` : ''}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {isPending && (
                      <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0">
                        <Button
                          size="sm"
                          disabled={actionLoadingId === req.id}
                          onClick={() => handleRespondRequest(req.id, 'ACCEPTED')}
                          className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1"
                        >
                          <Check className="h-3.5 w-3.5" />
                          {t('accept', 'Accept')}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={actionLoadingId === req.id}
                          onClick={() => handleRespondRequest(req.id, 'REJECTED')}
                          className="rounded-lg border-red-200 text-red-600 hover:bg-red-50 font-semibold text-xs flex items-center gap-1"
                        >
                          <X className="h-3.5 w-3.5" />
                          {t('reject', 'Reject')}
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
