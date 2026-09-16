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
import { bookingService, Doctor } from '@/services/booking.service';
import {
  Briefcase,
  Building2,
  DollarSign,
  Eye,
  GraduationCap,
  MapPin,
  Stethoscope,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    fetchDoctors();
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

  const openDoctorDetails = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsDetailsOpen(true);
  };

  const selectedQualifications: DoctorQualification[] = selectedDoctor
    ? parseDoctorQualifications(selectedDoctor.biography)
    : [];

  if (loading) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER */}
      <div className="border-b pb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Clinic Doctors
          </h1>
          <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
            {doctors.length} Doctors
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Manage and view all registered doctors and their academic qualifications under your clinic.
        </p>
      </div>

      {/* GRID */}
      {doctors.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
          <Stethoscope className="h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">No doctors found</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm">
            There are currently no doctors associated with this clinic.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doctor) => {
            const qualifications = parseDoctorQualifications(doctor.biography);
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
                        <span className="truncate">{doctor.specialty || 'General'}</span>
                      </div>

                      <div className="flex items-center gap-1.5 rounded-lg bg-gray-50 p-2 text-gray-700 border">
                        <Briefcase className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                        <span className="truncate">{doctor.experience ? `${doctor.experience} yrs exp` : 'Exp N/A'}</span>
                      </div>
                    </div>

                    {/* QUALIFICATIONS BADGE */}
                    <div className="mt-3 rounded-lg bg-purple-50/70 p-2.5 border border-purple-100">
                      <div className="flex items-center justify-between text-xs text-purple-900 font-medium">
                        <span className="flex items-center gap-1.5">
                          <GraduationCap className="h-4 w-4 text-purple-600" />
                          Qualifications
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
                          No qualifications listed
                        </p>
                      )}
                    </div>

                    {/* CLINIC */}
                    <div className="mt-3 flex items-center gap-2 rounded-lg bg-gray-50 p-2.5 text-xs text-gray-700">
                      <Building2 className="h-4 w-4 text-indigo-500 shrink-0" />
                      <span className="truncate font-medium">{doctor.clinic || 'Independent Doctor'}</span>
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
                      View Profile
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
                      {selectedDoctor.name || 'Unnamed Doctor'}
                    </h2>
                    <p className="text-indigo-100 text-sm">{selectedDoctor.specialty || 'Medical Specialist'}</p>
                    <p className="text-indigo-200 text-xs mt-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {[selectedDoctor.city, selectedDoctor.country].filter(Boolean).join(', ') || 'No location'}
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
                      Academic & Professional Qualifications
                    </h3>
                  </div>

                  <div className="mt-3 space-y-2.5">
                    {selectedQualifications.length === 0 ? (
                      <p className="text-xs text-gray-500 italic p-3 bg-gray-50 rounded-lg text-center">
                        No qualifications recorded.
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
                    <h3 className="text-sm font-bold text-gray-900 pb-1 border-b">About</h3>
                    <p className="mt-2 text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg">
                      {selectedDoctor.about}
                    </p>
                  </div>
                )}

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-500 font-medium">Experience</span>
                    <p className="font-bold text-gray-900 mt-0.5">{selectedDoctor.experience ? `${selectedDoctor.experience} Years` : '—'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-500 font-medium">Consultation Fee</span>
                    <p className="font-bold text-emerald-700 mt-0.5">{selectedDoctor.fee} LYD</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
