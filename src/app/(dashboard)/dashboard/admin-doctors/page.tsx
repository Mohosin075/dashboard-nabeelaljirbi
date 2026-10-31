'use client';
import { canAdminAction } from '@/lib/admin-permissions';
import { RowsPerPage } from '@/components/rows-per-page';
import { exportPages, downloadExcel } from '@/lib/export-pages';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { DoctorQualification, parseDoctorQualifications } from '@/lib/qualifications';
import { AdminDoctor, adminService } from '@/services/admin.service';
import {
  AlertTriangle,
  Ban,
  Briefcase,
  Building2,
  Calendar,
  Check,
  Copy,
  DollarSign,
  Eye,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Search,
  Stethoscope,
  User,
  X,
} from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { useAuthStore } from '@/stores/auth-store';
import { useEffect, useState } from 'react';

export default function AdminDoctorsPage() {
  const { t } = useLanguage();
  const adminTier = useAuthStore((state) => state.adminTier) || 'SUPER_ADMIN';
  const isReadOnly = !canAdminAction(adminTier, 'operations');
  const [doctors, setDoctors] = useState<AdminDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [exporting, setExporting] = useState(false);
  const exportDoctors = async () => {
    setExporting(true);
    const capturedSearch = activeSearch;
    try {
      const rows = await exportPages(async (page) => {
        const result = await adminService.getDoctors({
          page,
          limit: 500,
          searchTerm: capturedSearch,
        });
        return { rows: result.data.data, total: result.data.meta.total };
      });
      await downloadExcel(
        rows.map((d) => ({
          ID: d.id,
          Name: d.fullName,
          Phone: d.phoneNumber,
          Email: d.email,
          Specialty: d.speciality,
          Country: d.country,
          City: d.city,
        })),
        'salama-doctors'
      );
    } catch (error: any) {
      toast({
        title: 'Export failed',
        description: error.message || 'Unable to export doctors',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<AdminDoctor | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [suspendDoctorTarget, setSuspendDoctorTarget] = useState<AdminDoctor | null>(null);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [suspending, setSuspending] = useState(false);
  const [selectedDoctorForVerify, setSelectedDoctorForVerify] = useState<AdminDoctor | null>(null);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, [page, activeSearch, pageSize]);

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
        limit: pageSize,
        search: activeSearch,
        searchTerm: activeSearch,
      });

      let data = response.data.data || [];
      setDoctors(data);
      setTotalPages(Math.ceil((response.data.meta?.total || 0) / pageSize));
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

  const handleToggleSuspend = async () => {
    if (!suspendDoctorTarget || isReadOnly) return;
    const isCurrentlySuspended =
      suspendDoctorTarget.status === 'SUSPENDED' || suspendDoctorTarget.banned === true;
    try {
      setSuspending(true);
      const res = await adminService.suspendDoctor(
        suspendDoctorTarget.doctorId || suspendDoctorTarget.id,
        !isCurrentlySuspended
      );
      toast({
        title: 'Success',
        description:
          res.message ||
          (isCurrentlySuspended
            ? 'Doctor activated successfully'
            : 'Doctor suspended successfully'),
      });
      fetchDoctors();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update doctor suspension status',
        variant: 'destructive',
      });
    } finally {
      setSuspending(false);
      setShowSuspendDialog(false);
      setSuspendDoctorTarget(null);
    }
  };

  const handleVerifyClick = (doctor: AdminDoctor) => {
    if (isReadOnly) return;
    setSelectedDoctorForVerify(doctor);
    setShowVerifyDialog(true);
  };

  const handleVerifyDoctor = async () => {
    if (!selectedDoctorForVerify || isReadOnly) return;
    try {
      setVerifying(true);
      await adminService.verifyDoctor(
        selectedDoctorForVerify.doctorId || selectedDoctorForVerify.id,
        !selectedDoctorForVerify.adminVerified
      );
      toast({
        title: 'Success',
        description: `Doctor ${selectedDoctorForVerify.adminVerified ? 'unverified' : 'verified'} successfully`,
      });
      fetchDoctors();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update doctor verification status',
        variant: 'destructive',
      });
    } finally {
      setVerifying(false);
      setShowVerifyDialog(false);
      setSelectedDoctorForVerify(null);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: `${label} copied to clipboard`,
    });
  };

  const selectedQualifications: DoctorQualification[] = selectedDoctor
    ? parseDoctorQualifications(
        selectedDoctor.qualifications ||
          (selectedDoctor.biography?.trim().startsWith('[') ? selectedDoctor.biography : null)
      )
    : [];

  const selectedBioText =
    selectedDoctor?.biography && !selectedDoctor.biography.trim().startsWith('[')
      ? selectedDoctor.biography.trim()
      : null;

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Button variant="outline" disabled={loading || exporting} onClick={exportDoctors}>
        {exporting ? 'Exporting…' : 'Export filtered doctors to Excel'}
      </Button>
      <div className="flex flex-col gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {t('doctorManagement', 'Doctor Management')}
          </h1>
          <p className="mt-1 text-sm text-gray-600 sm:text-base">
            {doctors.length} {t('doctorsRegistered', 'doctors registered')}
          </p>
        </div>
        <div className="relative flex flex-wrap items-center gap-2 sm:flex-nowrap">
          <div className="relative flex-1 sm:flex-initial">
            <Search
              className="absolute left-2.5 top-2.5 h-4 w-4 cursor-pointer text-muted-foreground rtl:left-auto rtl:right-2.5"
              onClick={handleSearch}
            />
            <Input
              placeholder={t('searchDoctors', 'Search doctors...')}
              className="w-full pl-8 pr-8 sm:w-[250px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {search && (
              <X
                className="absolute right-2.5 top-2.5 h-4 w-4 cursor-pointer text-gray-400 hover:text-gray-600 rtl:left-2.5 rtl:right-auto"
                onClick={() => {
                  setSearch('');
                  setActiveSearch('');
                }}
              />
            )}
          </div>
          <Button
            onClick={handleSearch}
            className="bg-blue-600 text-white hover:bg-blue-700"
            size="sm"
          >
            {t('search', 'Search')}
          </Button>
        </div>
      </div>

      {/* Doctors Grid */}
      {doctors.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
          <Stethoscope className="mb-3 h-12 w-12 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">{t('noDoctorsFound')}</h3>
          <p className="mt-1 max-w-sm text-sm text-gray-500">
            {activeSearch ? t('noDoctorsSearchMatch') : t('noDoctorsRegistered')}
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
              {t('clearSearch')}
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doctor) => {
            const qualifications = parseDoctorQualifications(
              doctor.qualifications ||
                (doctor.biography?.trim().startsWith('[') ? doctor.biography : null)
            );
            return (
              <Card
                key={doctor.id}
                className="flex flex-col justify-between transition-shadow duration-300 hover:scale-[1.01] hover:shadow-xl"
              >
                <CardContent className="flex flex-1 flex-col justify-between p-6">
                  <div>
                    {/* Header: Avatar & Name */}
                    <div className="flex items-start gap-3.5">
                      <Avatar className="h-14 w-14 shrink-0 ring-2 ring-blue-500/30">
                        <AvatarImage
                          src={doctor.profileImage}
                          alt={doctor.fullName}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-green-100 text-base font-bold text-green-700">
                          {(doctor.fullName || 'Dr')
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .substring(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1.5">
                          <h3 className="truncate text-base font-bold text-gray-900">
                            {doctor.fullName || t('unnamedDoctor')}
                          </h3>
                          <div className="flex shrink-0 items-center gap-1.5">
                            {doctor.status === 'SUSPENDED' || doctor.banned ? (
                              <Badge className="border-red-200 bg-red-100 px-1.5 py-0 text-[10px] font-semibold text-red-700 hover:bg-red-100">
                                {t('suspended', 'Suspended')}
                              </Badge>
                            ) : (
                              <Badge className="border-emerald-200 bg-emerald-100 px-1.5 py-0 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-100">
                                {t('active', 'Active')}
                              </Badge>
                            )}
                            {doctor.adminVerified ? (
                              <Badge className="border-blue-200 bg-blue-100 px-1.5 py-0 text-[10px] font-semibold text-blue-700 hover:bg-blue-100">
                                {t('verified', 'Verified')}
                              </Badge>
                            ) : (
                              <Badge className="border-amber-200 bg-amber-100 px-1.5 py-0 text-[10px] font-semibold text-amber-700 hover:bg-amber-100">
                                {t('unverified', 'Unverified')}
                              </Badge>
                            )}
                            <Badge
                              variant="outline"
                              className="shrink-0 border-gray-300 px-1.5 py-0 text-[10px] font-semibold uppercase"
                            >
                              {doctor.gender
                                ? doctor.gender.toLowerCase() === 'male'
                                  ? t('male')
                                  : doctor.gender.toLowerCase() === 'female'
                                    ? t('female')
                                    : doctor.gender
                                : '—'}
                            </Badge>
                          </div>
                        </div>
                        <div className="mt-1 flex items-center gap-1 truncate text-xs text-gray-500">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                          <span className="truncate">
                            {[doctor.city, doctor.country].filter(Boolean).join(', ') ||
                              t('noLocation')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Speciality & Experience Chips */}
                    <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="inline-flex items-center gap-1 rounded-md border border-green-200 bg-green-50 px-2.5 py-1 font-semibold text-green-700">
                        <Stethoscope className="h-3.5 w-3.5 shrink-0 text-green-600" />
                        <span className="max-w-[130px] truncate">
                          {doctor.speciality || t('general')}
                        </span>
                      </span>

                      <span className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 font-medium text-blue-700">
                        <Briefcase className="h-3.5 w-3.5 shrink-0 text-blue-600" />
                        <span>
                          {doctor.experience
                            ? `${doctor.experience} ${t('yearsExperience')}`
                            : `0 ${t('yearsExperience')}`}
                        </span>
                      </span>

                      <span className="inline-flex items-center gap-1 rounded-md border border-purple-200 bg-purple-50 px-2.5 py-1 font-medium text-purple-700">
                        <Building2 className="h-3.5 w-3.5 shrink-0 text-purple-600" />
                        <span className="max-w-[120px] truncate">
                          {doctor.clinicName || t('independent')}
                        </span>
                      </span>
                    </div>

                    {/* Qualifications Box */}
                    <div className="mt-3 rounded-lg border border-blue-100/80 bg-blue-50/70 p-2.5 text-xs">
                      <div className="flex items-center justify-between font-semibold text-blue-900">
                        <span className="flex items-center gap-1.5">
                          <GraduationCap className="h-4 w-4 shrink-0 text-blue-600" />
                          <span>{t('academicQualifications')}:</span>
                        </span>
                        <span className="rounded bg-blue-200/80 px-1.5 py-0.5 text-[10px] font-bold text-blue-800">
                          {qualifications.length}
                        </span>
                      </div>
                      {qualifications.length > 0 ? (
                        <p className="mt-1 truncate font-medium text-blue-800">
                          {qualifications[0]?.degree}
                          {qualifications[0]?.institute ? ` • ${qualifications[0]?.institute}` : ''}
                          {qualifications.length > 1 &&
                            ` (+${qualifications.length - 1} ${t('more')})`}
                        </p>
                      ) : (
                        <p className="mt-1 text-[11px] italic text-gray-400">
                          {t('noQualificationsRecorded')}
                        </p>
                      )}
                    </div>

                    {/* Contact & Meta Info */}
                    <div className="mt-3 space-y-1.5 border-t pt-2.5 text-xs text-gray-600">
                      {doctor.phoneNumber && (
                        <div className="flex items-center gap-2 truncate">
                          <Phone className="h-3.5 w-3.5 shrink-0 text-blue-600" />
                          <span className="truncate font-mono font-medium text-gray-800" dir="ltr">
                            {doctor.phoneNumber}
                          </span>
                        </div>
                      )}

                      {doctor.email && doctor.email !== '—' && doctor.email.trim() !== '' && (
                        <div className="flex items-center gap-2 truncate">
                          <Mail className="h-3.5 w-3.5 shrink-0 text-blue-600" />
                          <span className="truncate text-gray-700">{doctor.email}</span>
                        </div>
                      )}

                      {/* License & DOB Row */}
                      <div className="flex items-center justify-between gap-2 rounded-lg border border-gray-200/70 bg-gray-50 px-2.5 py-1.5 text-xs">
                        <div className="flex items-center gap-1 truncate">
                          <span className="text-[11px] text-gray-400">{t('license')}:</span>
                          <span className="truncate font-mono font-semibold text-gray-800">
                            {doctor.licenseNumber || 'N/A'}
                          </span>
                        </div>
                        <div className="flex shrink-0 items-center gap-1 text-[11px] text-gray-500">
                          <span className="text-gray-400">{t('dob')}:</span>
                          <span>
                            {doctor.dateOfBirth
                              ? new Date(doctor.dateOfBirth).toLocaleDateString()
                              : '—'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer: Fee on Left, Action Buttons on Right */}
                  <div className="mt-4 flex items-center justify-between gap-2 border-t pt-3">
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                        <DollarSign className="h-3.5 w-3.5 text-amber-600 ltr:mr-0.5 rtl:ml-0.5" />
                        {doctor.consultFee ? `${doctor.consultFee} LYD` : t('free')}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant={doctor.adminVerified ? 'ghost' : 'default'}
                        disabled={isReadOnly}
                        onClick={() => handleVerifyClick(doctor)}
                        className={`flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold disabled:opacity-50 ${
                          doctor.adminVerified
                            ? 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                      >
                        {doctor.adminVerified
                          ? t('unverified', 'Unverify')
                          : t('verifyDoctor', 'Verify')}
                      </Button>

                      {doctor.status === 'SUSPENDED' || doctor.banned ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isReadOnly}
                          onClick={() => {
                            setSuspendDoctorTarget(doctor);
                            setShowSuspendDialog(true);
                          }}
                          className="flex h-8 items-center gap-1 rounded-lg border-emerald-300 px-2.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>{t('activate', 'Activate')}</span>
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isReadOnly}
                          onClick={() => {
                            setSuspendDoctorTarget(doctor);
                            setShowSuspendDialog(true);
                          }}
                          className="flex h-8 items-center gap-1 rounded-lg border-red-300 px-2.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                        >
                          <Ban className="h-3.5 w-3.5" />
                          <span>{t('suspend', 'Suspend')}</span>
                        </Button>
                      )}

                      <Button
                        size="sm"
                        onClick={() => openDoctorDetails(doctor)}
                        className="flex h-8 items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>{t('viewDetails')}</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <RowsPerPage
        value={pageSize}
        onChange={(value) => {
          setPageSize(value);
          setPage(1);
        }}
      />
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <Button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            variant="outline"
            size="sm"
          >
            {t('previous')}
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
            {t('next')}
          </Button>
        </div>
      )}

      {/* Doctor Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-xl p-6">
          {selectedDoctor && (
            <div className="space-y-6">
              {/* Doctor Header */}
              <div className="flex items-start gap-4 border-b pb-4 pr-8">
                <Avatar className="h-20 w-20 shrink-0 ring-2 ring-blue-500">
                  <AvatarImage src={selectedDoctor.profileImage} alt={selectedDoctor.fullName} />
                  <AvatarFallback className="bg-green-100 text-xl font-bold text-green-600">
                    {(selectedDoctor.fullName || 'Doctor')
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .substring(0, 2)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedDoctor.fullName || t('unnamedDoctor')}
                    </h2>
                    {selectedDoctor.adminVerified ? (
                      <Badge className="border-blue-200 bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                        {t('verified', 'Verified')}
                      </Badge>
                    ) : (
                      <Badge className="border-amber-200 bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                        {t('unverified', 'Unverified')}
                      </Badge>
                    )}
                    {selectedDoctor.gender && (
                      <Badge
                        variant="outline"
                        className="border-gray-300 px-2 py-0.5 text-xs font-semibold capitalize"
                      >
                        {selectedDoctor.gender.toLowerCase() === 'male'
                          ? t('male')
                          : selectedDoctor.gender.toLowerCase() === 'female'
                            ? t('female')
                            : selectedDoctor.gender}
                      </Badge>
                    )}
                  </div>

                  <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                    <Stethoscope className="h-4 w-4 shrink-0 text-green-600" />
                    <span className="font-medium text-gray-800">
                      {selectedDoctor.speciality || t('general')}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      {[selectedDoctor.city, selectedDoctor.country].filter(Boolean).join(', ') ||
                        t('noLocation')}
                    </span>
                  </div>
                </div>
              </div>

              {/* 1. Academic & Professional Qualifications (Biography) */}
              <div>
                <div className="flex items-center gap-2 border-b pb-2">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                  <h3 className="text-base font-semibold text-gray-900">
                    {t('academicQualifications')}
                  </h3>
                  <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600 ltr:ml-auto rtl:mr-auto">
                    {selectedQualifications.length} {t('qualifications')}
                  </span>
                </div>

                <div className="mt-3 space-y-2.5">
                  {selectedQualifications.length === 0 ? (
                    <div className="rounded-lg bg-gray-50 p-4 text-center text-sm text-gray-500">
                      {t('noQualificationsRecorded')}
                    </div>
                  ) : (
                    selectedQualifications.map((qual, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50/40 p-3.5"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-blue-600 text-xs font-bold text-white">
                          {qual.year ? qual.year.slice(-2) : idx + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold text-gray-900">
                              {qual.degree || t('degreeQualification')}
                            </span>
                            {qual.year && (
                              <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                                {t('passingYear')}: {qual.year}
                              </span>
                            )}
                          </div>
                          {qual.institute && (
                            <p className="mt-1 flex items-center gap-1 text-xs text-gray-600">
                              <Building2 className="h-3.5 w-3.5 shrink-0 text-blue-500" />
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
                  <div className="flex items-center gap-2 border-b pb-2">
                    <Stethoscope className="h-5 w-5 text-green-600" />
                    <h3 className="text-base font-semibold text-gray-900">{t('aboutDoctor')}</h3>
                  </div>
                  <div className="mt-2 rounded-lg bg-gray-50 p-3.5 text-sm leading-relaxed text-gray-700">
                    {selectedDoctor.about}
                  </div>
                </div>
              )}

              {/* Biography */}
              {selectedBioText && (
                <div>
                  <div className="flex items-center gap-2 border-b pb-2">
                    <FileText className="h-5 w-5 text-indigo-600" />
                    <h3 className="text-base font-semibold text-gray-900">
                      {t('biography', 'Biography')}
                    </h3>
                  </div>
                  <div className="mt-2 whitespace-pre-line rounded-lg bg-gray-50 p-3.5 text-sm leading-relaxed text-gray-700">
                    {selectedBioText}
                  </div>
                </div>
              )}

              {/* 3. Professional Credentials */}
              <div>
                <div className="flex items-center gap-2 border-b pb-2">
                  <Briefcase className="h-5 w-5 text-green-600" />
                  <h3 className="text-base font-semibold text-gray-900">
                    {t('professionalCredentials')}
                  </h3>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                  {/* Medical License */}
                  <div className="rounded-lg border bg-gray-50 p-3">
                    <div className="text-xs font-medium text-gray-500">
                      {t('medicalLicenseNumber')}
                    </div>
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
                  <div className="rounded-lg border bg-gray-50 p-3">
                    <div className="text-xs font-medium text-gray-500">{t('experience')}</div>
                    <div className="mt-1 font-bold text-gray-900">
                      {selectedDoctor.experience
                        ? `${selectedDoctor.experience} ${t('years')}`
                        : '—'}
                    </div>
                  </div>

                  {/* Consultation Fee */}
                  <div className="rounded-lg border bg-gray-50 p-3">
                    <div className="text-xs font-medium text-gray-500">{t('consultationFee')}</div>
                    <div className="mt-1 font-bold text-yellow-700">
                      {selectedDoctor.consultFee ? `${selectedDoctor.consultFee} LYD` : '—'}
                    </div>
                  </div>

                  {/* Associated Clinic */}
                  <div className="rounded-lg border bg-gray-50 p-3">
                    <div className="text-xs font-medium text-gray-500">{t('associatedClinic')}</div>
                    <div className="mt-1 truncate font-bold text-purple-700">
                      {selectedDoctor.clinicName || t('independent')}
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Personal & Contact Information */}
              <div>
                <div className="flex items-center gap-2 border-b pb-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <h3 className="text-base font-semibold text-gray-900">
                    {t('personalContactInfo')}
                  </h3>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                  {/* Phone */}
                  <div className="rounded-lg border bg-white p-3">
                    <div className="flex items-center gap-1 text-xs font-medium text-gray-500">
                      <Phone className="h-3.5 w-3.5 text-blue-600" /> {t('phoneNumber')}
                    </div>
                    <div className="mt-1 font-bold text-gray-900" dir="ltr">
                      {selectedDoctor.phoneNumber || '—'}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="rounded-lg border bg-white p-3">
                    <div className="flex items-center gap-1 text-xs font-medium text-gray-500">
                      <Mail className="h-3.5 w-3.5 text-blue-600" /> {t('emailAddress')}
                    </div>
                    <div className="mt-1 truncate font-bold text-gray-900">
                      {selectedDoctor.email || '—'}
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div className="rounded-lg border bg-white p-3">
                    <div className="flex items-center gap-1 text-xs font-medium text-gray-500">
                      <Calendar className="h-3.5 w-3.5 text-blue-600" /> {t('dateOfBirth')}
                    </div>
                    <div className="mt-1 font-bold text-gray-900">
                      {selectedDoctor.dateOfBirth
                        ? new Date(selectedDoctor.dateOfBirth).toLocaleDateString()
                        : '—'}
                    </div>
                  </div>

                  {/* Address */}
                  <div className="rounded-lg border bg-white p-3">
                    <div className="flex items-center gap-1 text-xs font-medium text-gray-500">
                      <MapPin className="h-3.5 w-3.5 text-blue-600" /> {t('address')}
                    </div>
                    <div className="mt-1 truncate font-bold text-gray-900">
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

      {/* Doctor Suspension Alert Dialog */}
      <AlertDialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              {suspendDoctorTarget?.status === 'SUSPENDED' || suspendDoctorTarget?.banned ? (
                <div className="rounded-full bg-emerald-100 p-2 text-emerald-700">
                  <Check className="h-5 w-5" />
                </div>
              ) : (
                <div className="rounded-full bg-red-100 p-2 text-red-700">
                  <AlertTriangle className="h-5 w-5" />
                </div>
              )}
              <AlertDialogTitle className="text-lg font-bold">
                {suspendDoctorTarget?.status === 'SUSPENDED' || suspendDoctorTarget?.banned
                  ? t('activateDoctor', 'Activate Doctor')
                  : t('suspendDoctor', 'Suspend Doctor')}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pt-2 text-sm leading-relaxed text-gray-600">
              {suspendDoctorTarget?.status === 'SUSPENDED' || suspendDoctorTarget?.banned ? (
                t(
                  'activateDoctorConfirmText',
                  'Are you sure you want to reactivate this doctor account?'
                )
              ) : (
                <div className="space-y-3">
                  <p>
                    {t(
                      'suspendDoctorConfirmText',
                      `Are you sure you want to suspend Dr. ${suspendDoctorTarget?.fullName || ''}?`
                    )}
                  </p>
                  <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                    <div>
                      <p className="mb-0.5 font-bold text-amber-800">
                        {t('suspendWarningTitle', 'Automatic Cancellation & Refund Policy')}
                      </p>
                      <p className="leading-normal">
                        {t(
                          'suspendWarningDesc',
                          'Suspending this doctor cancels upcoming appointments. Pending holds are released; eligible consultation fees for confirmed Mode B bookings are refunded. Service fees captured at confirmation are non-refundable.'
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel disabled={suspending}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleSuspend}
              disabled={suspending}
              className={
                suspendDoctorTarget?.status === 'SUSPENDED' || suspendDoctorTarget?.banned
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }
            >
              {suspending
                ? t('loading')
                : suspendDoctorTarget?.status === 'SUSPENDED' || suspendDoctorTarget?.banned
                  ? t('activate', 'Activate')
                  : t('suspend', 'Suspend')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Verify Doctor Dialog */}
      <AlertDialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedDoctorForVerify?.adminVerified
                ? t('unverify')
                : t('verifyDoctor', 'Verify Doctor')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedDoctorForVerify?.adminVerified
                ? t('confirmUnverifyDoctor', 'Are you sure you want to unverify')
                : t('confirmVerifyDoctor', 'Are you sure you want to verify')}{' '}
              <strong>{selectedDoctorForVerify?.fullName}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={verifying}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleVerifyDoctor}
              disabled={verifying}
              className={
                selectedDoctorForVerify?.adminVerified
                  ? 'bg-amber-600 text-white hover:bg-amber-700'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }
            >
              {verifying ? t('processing', 'Processing...') : t('confirm', 'Confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
