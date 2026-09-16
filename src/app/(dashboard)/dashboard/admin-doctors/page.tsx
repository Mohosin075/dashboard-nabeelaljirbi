'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import {
  DoctorQualification,
  parseDoctorQualifications,
} from '@/lib/qualifications';
import { AdminDoctor, adminService } from '@/services/admin.service';
import {
  Briefcase,
  Building2,
  Calendar,
  Copy,
  DollarSign,
  Eye,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Search,
  Stethoscope,
  User,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<AdminDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<AdminDoctor | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, [page, activeSearch]);

  const handleSearch = () => {
    setPage(1);
    setActiveSearch(search);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await adminService.getDoctors({
        page,
        limit: 10,
        search: activeSearch,
        searchTerm: activeSearch,
      });

      let data = response.data.data || [];
      if (activeSearch) {
        const lowerSearch = activeSearch.toLowerCase();
        data = data.filter(
          (d) =>
            (d.fullName?.toLowerCase().includes(lowerSearch) ?? false) ||
            (d.email?.toLowerCase().includes(lowerSearch) ?? false) ||
            (d.speciality?.toLowerCase().includes(lowerSearch) ?? false) ||
            (d.phoneNumber?.includes(lowerSearch) ?? false)
        );
      }

      setDoctors(data);
      setTotalPages(Math.ceil((response.data.meta?.total || 0) / 10));
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load doctors',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const openDoctorDetails = (doctor: AdminDoctor) => {
    setSelectedDoctor(doctor);
    setIsDetailsOpen(true);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: `${label} copied to clipboard`,
    });
  };

  const selectedQualifications: DoctorQualification[] = selectedDoctor
    ? parseDoctorQualifications(selectedDoctor.biography)
    : [];

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 px-4 sm:px-6 lg:px-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Doctor Management
          </h1>
          <p className="mt-1 text-gray-600">
            Total {doctors.length} doctors registered
          </p>
        </div>
        <div className="relative flex items-center gap-2">
          <div className="relative">
            <Search
              className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground cursor-pointer"
              onClick={handleSearch}
            />
            <Input
              placeholder="Search doctors..."
              className="pl-8 pr-8 w-[250px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {search && (
              <X
                className="absolute right-2.5 top-2.5 h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600"
                onClick={() => {
                  setSearch('');
                  setActiveSearch('');
                }}
              />
            )}
          </div>
          <Button
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            Search
          </Button>
        </div>
      </div>

      {/* Doctors Grid */}
      {doctors.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
          <Stethoscope className="h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">No doctors found</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm">
            {activeSearch
              ? `No doctors matched your search "${activeSearch}". Try another search term.`
              : 'There are currently no registered doctors in the system.'}
          </p>
          {activeSearch && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearch('');
                setActiveSearch('');
              }}
            >
              Clear Search
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doctor) => {
            const qualifications = parseDoctorQualifications(doctor.biography);
            return (
              <Card
                key={doctor.id}
                className="transition-shadow hover:shadow-xl hover:scale-[1.01] duration-300 flex flex-col justify-between"
              >
                <CardContent className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Header: Avatar & Name */}
                    <div className="flex items-start gap-3.5">
                      <Avatar className="h-14 w-14 ring-2 ring-blue-500/30 shrink-0">
                        <AvatarImage src={doctor.profileImage} alt={doctor.fullName} className="object-cover" />
                        <AvatarFallback className="bg-green-100 text-green-700 font-bold text-base">
                          {(doctor.fullName || 'Dr')
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .substring(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1.5">
                          <h3 className="text-base font-bold text-gray-900 truncate">
                            {doctor.fullName || 'Unnamed Doctor'}
                          </h3>
                          <Badge variant="outline" className="text-[10px] font-semibold uppercase px-1.5 py-0 shrink-0 border-gray-300">
                            {doctor.gender || '—'}
                          </Badge>
                        </div>
                        <div className="mt-1 flex items-center text-xs text-gray-500 gap-1 truncate">
                          <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                          <span className="truncate">{[doctor.city, doctor.country].filter(Boolean).join(', ') || 'No location'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Speciality & Experience Chips */}
                    <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="inline-flex items-center gap-1 rounded-md bg-green-50 px-2.5 py-1 font-semibold text-green-700 border border-green-200">
                        <Stethoscope className="h-3.5 w-3.5 text-green-600 shrink-0" />
                        <span className="truncate max-w-[130px]">{doctor.speciality || 'General'}</span>
                      </span>

                      <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-1 font-medium text-blue-700 border border-blue-200">
                        <Briefcase className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                        <span>{doctor.experience ? `${doctor.experience} yrs` : '0 yrs'}</span>
                      </span>

                      <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2.5 py-1 font-medium text-purple-700 border border-purple-200">
                        <Building2 className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                        <span className="truncate max-w-[120px]">{doctor.clinicName || 'Independent'}</span>
                      </span>
                    </div>

                    {/* Qualifications Box */}
                    <div className="mt-3 rounded-lg bg-blue-50/70 p-2.5 border border-blue-100/80 text-xs">
                      <div className="flex items-center justify-between text-blue-900 font-semibold">
                        <span className="flex items-center gap-1.5">
                          <GraduationCap className="h-4 w-4 text-blue-600 shrink-0" />
                          Academic Qualifications:
                        </span>
                        <span className="rounded bg-blue-200/80 px-1.5 py-0.5 text-[10px] font-bold text-blue-800">
                          {qualifications.length}
                        </span>
                      </div>
                      {qualifications.length > 0 ? (
                        <p className="mt-1 text-blue-800 font-medium truncate">
                          {qualifications[0]?.degree}
                          {qualifications[0]?.institute
                            ? ` • ${qualifications[0]?.institute}`
                            : ''}
                          {qualifications.length > 1 &&
                            ` (+${qualifications.length - 1} more)`}
                        </p>
                      ) : (
                        <p className="mt-1 text-gray-400 italic text-[11px]">No qualifications added</p>
                      )}
                    </div>

                    {/* Contact & Meta Info */}
                    <div className="mt-3 space-y-1.5 text-xs text-gray-600 border-t pt-2.5">
                      {doctor.phoneNumber && (
                        <div className="flex items-center gap-2 truncate">
                          <Phone className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                          <span className="truncate font-mono font-medium text-gray-800">{doctor.phoneNumber}</span>
                        </div>
                      )}

                      {doctor.email && doctor.email !== '—' && doctor.email.trim() !== '' && (
                        <div className="flex items-center gap-2 truncate">
                          <Mail className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                          <span className="truncate text-gray-700">{doctor.email}</span>
                        </div>
                      )}

                      {/* License & DOB Row */}
                      <div className="flex items-center justify-between gap-2 text-xs bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-200/70">
                        <div className="flex items-center gap-1 truncate">
                          <span className="text-gray-400 text-[11px]">License:</span>
                          <span className="font-mono font-semibold text-gray-800 truncate">
                            {doctor.licenseNumber || 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 text-gray-500 text-[11px]">
                          <span className="text-gray-400">DOB:</span>
                          <span>{doctor.dateOfBirth ? new Date(doctor.dateOfBirth).toLocaleDateString() : '—'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer: Fee on Left, Action Button on Right */}
                  <div className="mt-4 border-t pt-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                        <DollarSign className="h-3.5 w-3.5 text-amber-600 mr-0.5" />
                        {doctor.consultFee ? `${doctor.consultFee} LYD` : 'Free'}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => openDoctorDetails(doctor)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg px-3.5 shadow-sm flex items-center gap-1.5"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center items-center gap-2">
          <Button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            variant="outline"
            size="sm"
          >
            Previous
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              onClick={() => setPage(p)}
              variant={page === p ? 'default' : 'outline'}
              size="sm"
              className={page === p ? 'bg-blue-600 text-white' : ''}
            >
              {p}
            </Button>
          ))}
          <Button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            variant="outline"
            size="sm"
          >
            Next
          </Button>
        </div>
      )}

      {/* Doctor Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-xl">
          {selectedDoctor && (
            <div className="space-y-6">
              {/* Doctor Header */}
              <div className="flex items-start gap-4 pb-4 border-b pr-8">
                <Avatar className="h-20 w-20 ring-2 ring-blue-500 shrink-0">
                  <AvatarImage src={selectedDoctor.profileImage} alt={selectedDoctor.fullName} />
                  <AvatarFallback className="bg-green-100 text-green-600 font-bold text-xl">
                    {(selectedDoctor.fullName || 'Doctor')
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .substring(0, 2)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedDoctor.fullName || 'Unnamed Doctor'}
                    </h2>
                    {selectedDoctor.gender && (
                      <Badge variant="outline" className="capitalize text-xs font-semibold px-2 py-0.5 border-gray-300">
                        {selectedDoctor.gender}
                      </Badge>
                    )}
                  </div>

                  <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                    <Stethoscope className="h-4 w-4 text-green-600 shrink-0" />
                    <span className="font-medium text-gray-800">
                      {selectedDoctor.speciality || 'General Specialist'}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      {[selectedDoctor.city, selectedDoctor.country].filter(Boolean).join(', ') || 'No location'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 1. Academic & Professional Qualifications (Biography) */}
              <div>
                <div className="flex items-center gap-2 pb-2 border-b">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                  <h3 className="text-base font-semibold text-gray-900">
                    Academic & Professional Qualifications
                  </h3>
                  <span className="ml-auto text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {selectedQualifications.length} Qualifications
                  </span>
                </div>

                <div className="mt-3 space-y-2.5">
                  {selectedQualifications.length === 0 ? (
                    <div className="rounded-lg bg-gray-50 p-4 text-center text-sm text-gray-500">
                      No academic qualifications added yet.
                    </div>
                  ) : (
                    selectedQualifications.map((qual, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50/40 p-3.5"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-blue-600 text-white font-bold text-xs">
                          {qual.year ? qual.year.slice(-2) : idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-gray-900 text-sm">
                              {qual.degree || 'Degree / Qualification'}
                            </span>
                            {qual.year && (
                              <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                                Passing Year: {qual.year}
                              </span>
                            )}
                          </div>
                          {qual.institute && (
                            <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                              <Building2 className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                              <span>{qual.institute}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 2. About Doctor */}
              {selectedDoctor.about && (
                <div>
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <Stethoscope className="h-5 w-5 text-green-600" />
                    <h3 className="text-base font-semibold text-gray-900">About Doctor</h3>
                  </div>
                  <div className="mt-2 rounded-lg bg-gray-50 p-3.5 text-sm text-gray-700 leading-relaxed">
                    {selectedDoctor.about}
                  </div>
                </div>
              )}

              {/* 3. Professional Credentials */}
              <div>
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Briefcase className="h-5 w-5 text-green-600" />
                  <h3 className="text-base font-semibold text-gray-900">
                    Professional Credentials & Clinic
                  </h3>
                </div>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  {/* Medical License */}
                  <div className="rounded-lg border p-3 bg-gray-50">
                    <div className="text-xs text-gray-500 font-medium">Medical License Number</div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="font-mono font-bold text-gray-900">
                        {selectedDoctor.licenseNumber || 'N/A'}
                      </span>
                      {selectedDoctor.licenseNumber && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-gray-400 hover:text-gray-700"
                          onClick={() =>
                            copyToClipboard(selectedDoctor.licenseNumber, 'License Number')
                          }
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="rounded-lg border p-3 bg-gray-50">
                    <div className="text-xs text-gray-500 font-medium">Experience</div>
                    <div className="mt-1 font-bold text-gray-900">
                      {selectedDoctor.experience ? `${selectedDoctor.experience} Years` : '—'}
                    </div>
                  </div>

                  {/* Consultation Fee */}
                  <div className="rounded-lg border p-3 bg-gray-50">
                    <div className="text-xs text-gray-500 font-medium">Consultation Fee</div>
                    <div className="mt-1 font-bold text-yellow-700">
                      {selectedDoctor.consultFee ? `${selectedDoctor.consultFee} LYD` : '—'}
                    </div>
                  </div>

                  {/* Associated Clinic */}
                  <div className="rounded-lg border p-3 bg-gray-50">
                    <div className="text-xs text-gray-500 font-medium">Associated Clinic</div>
                    <div className="mt-1 font-bold text-purple-700 truncate">
                      {selectedDoctor.clinicName || 'Independent'}
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Personal & Contact Information */}
              <div>
                <div className="flex items-center gap-2 pb-2 border-b">
                  <User className="h-5 w-5 text-blue-600" />
                  <h3 className="text-base font-semibold text-gray-900">
                    Personal & Contact Information
                  </h3>
                </div>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  {/* Phone */}
                  <div className="rounded-lg border p-3 bg-white">
                    <div className="text-xs text-gray-500 font-medium flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5 text-blue-600" /> Phone Number
                    </div>
                    <div className="mt-1 font-bold text-gray-900">{selectedDoctor.phoneNumber || '—'}</div>
                  </div>

                  {/* Email */}
                  <div className="rounded-lg border p-3 bg-white">
                    <div className="text-xs text-gray-500 font-medium flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5 text-blue-600" /> Email Address
                    </div>
                    <div className="mt-1 font-bold text-gray-900 truncate">{selectedDoctor.email || '—'}</div>
                  </div>

                  {/* Date of Birth */}
                  <div className="rounded-lg border p-3 bg-white">
                    <div className="text-xs text-gray-500 font-medium flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-blue-600" /> Date of Birth
                    </div>
                    <div className="mt-1 font-bold text-gray-900">
                      {selectedDoctor.dateOfBirth
                        ? new Date(selectedDoctor.dateOfBirth).toLocaleDateString()
                        : '—'}
                    </div>
                  </div>

                  {/* Address */}
                  <div className="rounded-lg border p-3 bg-white">
                    <div className="text-xs text-gray-500 font-medium flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-blue-600" /> Address
                    </div>
                    <div className="mt-1 font-bold text-gray-900 truncate">
                      {[selectedDoctor.address, selectedDoctor.city, selectedDoctor.country]
                        .filter(Boolean)
                        .join(', ') || '—'}
                    </div>
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
