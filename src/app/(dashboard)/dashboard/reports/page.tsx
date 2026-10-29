'use client';
import { exportPages, downloadExcel } from '@/lib/export-pages';

import { useEffect, useState, useMemo } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useLanguage } from '@/contexts/language-context';
import {
  clinicService,
  type ReconciliationSummary,
  type DoctorBreakdown,
  type ClinicBreakdown,
  type ReconciliationReportItem,
} from '@/services/clinic.service';
import { bookingService, type Doctor } from '@/services/booking.service';
import { adminService, type Clinic } from '@/services/admin.service';
import { specialistService, type Specialist } from '@/services/specialist.service';
import { useToast } from '@/hooks/use-toast';
import {
  BarChart3,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Search,
  ShieldAlert,
  DollarSign,
  CheckCircle2,
  Users,
  Building2,
  MapPin,
  FileSpreadsheet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AnalyticsReportsPage() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const role = useAuthStore((state) => state.role);
  const isAdmin = role === 'ADMIN';
  const isClinicAdmin = role === 'CLINIC' || role === 'ADMIN';

  // Data states
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [summary, setSummary] = useState<ReconciliationSummary | null>(null);
  const [doctorBreakdown, setDoctorBreakdown] = useState<DoctorBreakdown[]>([]);
  const [clinicBreakdown, setClinicBreakdown] = useState<ClinicBreakdown[]>([]);
  const [reportItems, setReportItems] = useState<ReconciliationReportItem[]>([]);

  // Directory lists for 6 filters
  const [clinicsList, setClinicsList] = useState<Clinic[]>([]);
  const [doctorsList, setDoctorsList] = useState<Doctor[]>([]);
  const [specialtiesList, setSpecialtiesList] = useState<Specialist[]>([]);

  // Filter states (Date / Doctor / Clinic / Specialty / Location / Status)
  const [selectedClinicId, setSelectedClinicId] = useState<string>('ALL');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('ALL');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('ALL');
  const [selectedLocation, setSelectedLocation] = useState<string>('ALL');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });

  // Initial lookup data loader
  useEffect(() => {
    if (!isClinicAdmin) return;

    // Load doctors
    bookingService.getDoctors().then((res) => {
      setDoctorsList(res?.data?.data || []);
    }).catch(() => {});

    // Load specialties
    specialistService.getSpecialists(1, 100).then((res) => {
      setSpecialtiesList(res?.data || []);
    }).catch(() => {});

    // If Admin, load clinics list
    if (isAdmin) {
      adminService.getClinics({ limit: 100 }).then((res: any) => {
        setClinicsList(res?.data?.data || (Array.isArray(res?.data) ? res.data : []));
      }).catch(() => {});
    }
  }, [isClinicAdmin, isAdmin]);

  // Load report data when filters change
  useEffect(() => {
    if (isClinicAdmin) {
      loadReports(1);
    }
  }, [
    isClinicAdmin,
    selectedClinicId,
    selectedDoctorId,
    selectedSpecialty,
    selectedLocation,
    selectedPeriod,
    selectedStatus,
    startDate,
    endDate,
  ]);

  const loadReports = async (targetPage = page) => {
    try {
      setLoading(true);
      const params: any = {
        page: targetPage,
        limit: 15,
      };

      if (isAdmin && selectedClinicId !== 'ALL') params.clinicId = selectedClinicId;
      if (selectedDoctorId !== 'ALL') params.doctorId = selectedDoctorId;
      if (selectedSpecialty !== 'ALL') params.specialty = selectedSpecialty;
      if (selectedLocation !== 'ALL') params.location = selectedLocation;
      if (selectedPeriod !== 'ALL') params.period = selectedPeriod;
      if (selectedStatus !== 'ALL') params.status = selectedStatus;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (searchTerm.trim()) params.searchTerm = searchTerm.trim();

      const res = await clinicService.getReconciliationReports(params);
      if (res?.data) {
        setSummary(res.data.summary);
        setDoctorBreakdown(res.data.doctorBreakdown || []);
        setClinicBreakdown(res.data.clinicBreakdown || []);
        setReportItems(res.data.data || []);
      }
      if (res?.meta) {
        setMeta(res.meta);
        setPage(res.meta.page);
      }
    } catch (err: any) {
      toast({
        title: t('error', 'Error'),
        description: err?.response?.data?.message || t('failedToLoadReports', 'Failed to load reconciliation reports'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadReports(1);
  };

  // Client filtered items if quick searching
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return reportItems;
    const q = searchTerm.toLowerCase();
    return reportItems.filter((item) => {
      const patientName = item.patient?.user?.fullName?.toLowerCase() || '';
      const patientPhone = item.patient?.user?.phoneNumber?.toLowerCase() || '';
      const docName = item.doctor?.user?.fullName?.toLowerCase() || '';
      const clinicName = item.clinic?.clinicName?.toLowerCase() || '';
      const serial = `#${item.serialNumber}`;
      return (
        patientName.includes(q) ||
        patientPhone.includes(q) ||
        docName.includes(q) ||
        clinicName.includes(q) ||
        serial.includes(q)
      );
    });
  }, [reportItems, searchTerm]);

  // Unique clinic locations list for the location dropdown
  const availableLocations = useMemo(() => {
    const locSet = new Set<string>();
    clinicsList.forEach((c) => {
      if (c.city?.trim()) locSet.add(c.city.trim());
      if (c.address?.trim()) locSet.add(c.address.trim());
    });
    reportItems.forEach((r) => {
      if (r.clinic?.location?.trim()) locSet.add(r.clinic.location.trim());
    });
    return Array.from(locSet);
  }, [clinicsList, reportItems]);

  // Export to CSV Function (Libyan Dinar LYD)
  const handleExportCSV = async () => {
    const filters: any = {};
    if (isAdmin && selectedClinicId !== 'ALL') filters.clinicId = selectedClinicId;
    if (selectedDoctorId !== 'ALL') filters.doctorId = selectedDoctorId;
    if (selectedSpecialty !== 'ALL') filters.specialty = selectedSpecialty;
    if (selectedLocation !== 'ALL') filters.location = selectedLocation;
    if (selectedPeriod !== 'ALL') filters.period = selectedPeriod;
    if (selectedStatus !== 'ALL') filters.status = selectedStatus;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (searchTerm.trim()) filters.searchTerm = searchTerm.trim();
    try {
      setExporting(true);
      const records = await exportPages<ReconciliationReportItem>(async exportPage => {
        const response = await clinicService.getReconciliationReports({ ...filters, page: exportPage, limit: 500 });
        return { rows: response.data.data, total: response.meta.total };
      });
      await downloadExcel(records.map(item => ({
        'Booking ID': item.id, 'Booking Serial': item.serialNumber,
        Date: new Date(item.consultDate).toISOString().slice(0, 10),
        Clinic: item.clinic?.clinicName || '', Doctor: item.doctor?.user?.fullName || '',
        Patient: item.patient?.user?.fullName || '', Phone: item.patient?.user?.phoneNumber || '',
        Status: item.status, Model: item.collectionMode || 'MODE_A',
        'Consultation fee': item.consultFee || 0,
        'Patient service fee': item.serviceFeeAmount || 0,
        'Clinic platform fee': item.clinicServiceFee || 0,
        'Net clinic consultation income': Number(((item.consultFee || 0) - (item.clinicServiceFee || 0)).toFixed(2)),
        'Consultation payment channel': item.collectionMode === 'MODE_B' ? 'Platform' : 'Cash at clinic',
      })), `Salama_Reconciliation_${new Date().toISOString().slice(0, 10)}`);
    } catch (error: any) {
      toast({ title: t('error', 'Error'), description: error.message || 'Export failed', variant: 'destructive' });
    } finally { setExporting(false); }
  };
  if (!isClinicAdmin) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 shadow-sm">
          <ShieldAlert className="h-10 w-10" />
        </div>
        <h2 className="mt-6 text-2xl font-bold tracking-tight text-gray-900">
          {t('restrictedAccess', 'Clinic Admin / Platform Admin Access Required')}
        </h2>
        <p className="mt-2 max-w-md text-sm text-gray-600 leading-relaxed">
          {t(
            'staffRestrictedReportsMsg',
            'Financial reports and payment reconciliations are restricted to Clinic Admins and Platform Admins. Clinic Staff have access to day-to-day booking operations only.'
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              {isAdmin
                ? t('platformAnalyticsReports', 'Platform Analytics & Payment Reconciliation')
                : t('financialReports', 'Payment Reconciliation & Reports')}
            </h1>
            <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 text-xs font-semibold">
              {isAdmin ? t('superAdminTier', 'Platform Admin') : t('clinicAdminOnly', 'Clinic Admin')}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            {t(
              'reconciliationSubtitle',
              'Audit consultation revenues, doctor earnings, and Salama platform reconciliation in real time (LYD).'
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={() => loadReports(page)}
            variant="outline"
            size="sm"
            disabled={loading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{t('refresh', 'Refresh')}</span>
          </Button>

          <Button
            onClick={handleExportCSV}
            disabled={exporting || loading || reportItems.length === 0}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            <Download className="h-4 w-4" />
            <span>{exporting ? t('exporting', 'Exporting...') : t('exportExcel', 'Export Excel')}</span>
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards (Monetary figures in Libyan Dinar LYD) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Gross Consultation Fees */}
        <div className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              {t('grossConsultFees', 'Gross Consult Fees')}
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">
            {summary ? Number(summary.totalConsultFees).toLocaleString() : '0'}{' '}
            <span className="text-sm font-semibold text-blue-600">LYD</span>
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {t('completedConsultations', 'From completed appointments')}
          </p>
        </div>

        {/* Net Clinic Receivable */}
        <div className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              {isAdmin ? t('clinicPayables', 'Total Clinic Payables') : t('netClinicReceivable', 'Net Clinic Receivable')}
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-emerald-700">
            {summary ? Number(summary.netClinicReceivable).toLocaleString() : '0'}{' '}
            <span className="text-sm font-semibold text-emerald-600">LYD</span>
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {t('netReceivableDesc', 'Total consult fees payable to clinics')}
          </p>
        </div>

        {/* Salama Service Fee */}
        <div className="rounded-xl border border-purple-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              {t('salamaFeeRetained', 'Salama Platform Fees')}
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <BarChart3 className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-purple-700">
            {summary ? Number(summary.totalServiceFees).toLocaleString() : '0'}{' '}
            <span className="text-sm font-semibold text-purple-600">LYD</span>
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {t('capturedPlatformFee', 'Captured platform service fee revenue')}
          </p>
        </div>

        {/* Total Bookings Volume */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              {t('bookingVolume', 'Booking Volume')}
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 text-gray-600">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">
            {summary ? summary.totalBookings : 0}
          </p>
          <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
            <span className="text-emerald-600 font-medium">{summary?.totalCompleted || 0} completed</span>
            <span>•</span>
            <span className="text-amber-600 font-medium">{summary?.totalNoShow || 0} no-show</span>
            <span>•</span>
            <span className="text-rose-600 font-medium">{summary?.totalCancelled || 0} cancelled</span>
          </div>
        </div>
      </div>

      {/* Filter Bar (Date / Doctor / Clinic / Specialty / Location / Status) */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
              <Filter className="h-4 w-4 text-blue-600" />
              <span>{t('filterAnalyticsReports', 'Filter Analytics & Reconciliation')}</span>
            </div>
            <span className="text-xs text-gray-400">
              Filter by Date / Doctor / Clinic / Specialty / Location / Status
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {/* 1. Quick Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 rtl:left-auto rtl:right-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('searchPatientOrDoctor', 'Search patient, doctor, clinic...')}
                className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 rtl:pl-3 rtl:pr-9"
              />
            </div>

            {/* 2. Clinic Filter (Visible to Admin or when clinics available) */}
            {isAdmin ? (
              <div>
                <select
                  value={selectedClinicId}
                  onChange={(e) => setSelectedClinicId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 py-2 px-2.5 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value="ALL">🏥 {t('allClinics', 'All Clinics')}</option>
                  {clinicsList.map((clinic) => (
                    <option key={clinic.id} value={clinic.id}>
                      {clinic.clinicName || 'Clinic'}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            {/* 3. Doctor Selector */}
            <div>
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 px-2.5 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              >
                <option value="ALL">👨‍⚕️ {t('allDoctors', 'All Doctors')}</option>
                {doctorsList.map((doc) => (
                  <option key={doc.doctorId} value={doc.doctorId}>
                    {doc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Specialty Selector */}
            <div>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 px-2.5 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              >
                <option value="ALL">🩺 {t('allSpecialties', 'All Specialties')}</option>
                {specialtiesList.map((spec) => (
                  <option key={spec.id} value={spec.name}>
                    {spec.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 5. Location Selector */}
            <div>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 px-2.5 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              >
                <option value="ALL">📍 {t('allLocations', 'All Locations')}</option>
                {availableLocations.map((loc, idx) => (
                  <option key={idx} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* 6. Period Selector (Date filter) */}
            <div>
              <select
                value={selectedPeriod}
                onChange={(e) => {
                  setSelectedPeriod(e.target.value);
                  if (e.target.value !== 'custom') {
                    setStartDate('');
                    setEndDate('');
                  }
                }}
                className="w-full rounded-lg border border-gray-300 py-2 px-2.5 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              >
                <option value="ALL">📅 {t('allPeriods', 'All Periods')}</option>
                <option value="daily">{t('todayDaily', 'Today (Daily)')}</option>
                <option value="weekly">{t('thisWeek', 'This Week')}</option>
                <option value="monthly">{t('thisMonth', 'This Month')}</option>
                <option value="last_month">{t('lastMonth', 'Last Month')}</option>
                <option value="custom">{t('customDateRange', 'Custom Range')}</option>
              </select>
            </div>

            {/* 7. Status Selector */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 px-2.5 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              >
                <option value="ALL">🏷️ {t('allStatusOpt', 'All Status')}</option>
                <option value="COMPLETE">{t('completed', 'Completed')}</option>
                <option value="CONFIRMED">{t('confirmed', 'Confirmed')}</option>
                <option value="ARRIVED">{t('arrived', 'Arrived')}</option>
                <option value="INPROGRESS">{t('inProgress', 'In Progress')}</option>
                <option value="PENDING">{t('pending', 'Pending')}</option>
                <option value="CANCELLED">{t('cancelled', 'Cancelled')}</option>
                <option value="NOT_SHOW">{t('noShow', 'No Show')}</option>
              </select>
            </div>
          </div>

          {/* Action Buttons & Custom Date Range */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            {selectedPeriod === 'custom' ? (
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-700">
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-500">{t('startDate', 'From')}:</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="rounded-lg border border-gray-300 px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-500">{t('endDate', 'To')}:</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="rounded-lg border border-gray-300 px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            ) : <div />}

            <div className="flex items-center gap-2 ml-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedClinicId('ALL');
                  setSelectedDoctorId('ALL');
                  setSelectedSpecialty('ALL');
                  setSelectedLocation('ALL');
                  setSelectedPeriod('ALL');
                  setSelectedStatus('ALL');
                  setStartDate('');
                  setEndDate('');
                  setSearchTerm('');
                }}
                className="h-8 px-3 text-xs"
              >
                {t('reset', 'Reset')}
              </Button>
              <Button type="submit" size="sm" className="h-8 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs">
                {t('applyFilter', 'Filter')}
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Platform Level: Clinic Breakdown (visible when Admin views and multiple clinics exist) */}
      {isAdmin && clinicBreakdown.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-base font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-purple-600" />
            <span>{t('clinicReconciliationBreakdown', 'Clinic Performance & Payment Reconciliation Breakdown')}</span>
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {clinicBreakdown.map((clinic) => (
              <div
                key={clinic.clinicId}
                className="rounded-lg border border-gray-100 bg-purple-50/30 p-4 transition-all hover:bg-purple-50/60 hover:border-purple-200"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-900 truncate">{clinic.clinicName}</p>
                  {clinic.location && (
                    <span className="text-[11px] text-gray-500 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {clinic.location}
                    </span>
                  )}
                </div>
                <div className="mt-2.5 flex items-center justify-between text-xs text-gray-600">
                  <span>{t('bookings', 'Bookings')}:</span>
                  <span className="font-semibold text-gray-900">
                    {clinic.completedBookings} / {clinic.totalBookings}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-gray-600">
                  <span>{t('consultRevenue', 'Consult Fees')}:</span>
                  <span className="font-bold text-emerald-700">
                    {Number(clinic.totalConsultFee).toLocaleString()} LYD
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-gray-600">
                  <span>{t('salamaFee', 'Platform Fees')}:</span>
                  <span className="font-bold text-purple-700">
                    {Number(clinic.totalServiceFee).toLocaleString()} LYD
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Doctor Breakdown Section */}
      {doctorBreakdown.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-base font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-600" />
            <span>{t('doctorReconciliationBreakdown', 'Doctor Performance & Revenue Breakdown')}</span>
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {doctorBreakdown.map((doc) => (
              <div
                key={doc.doctorId}
                className="rounded-lg border border-gray-100 bg-gray-50/70 p-4 transition-all hover:bg-blue-50/40 hover:border-blue-200"
              >
                <p className="font-semibold text-gray-900 truncate">{doc.doctorName}</p>
                <div className="mt-2.5 flex items-center justify-between text-xs text-gray-600">
                  <span>{t('bookings', 'Bookings')}:</span>
                  <span className="font-semibold text-gray-900">
                    {doc.completedBookings} / {doc.totalBookings}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-gray-600">
                  <span>{t('generatedRevenue', 'Generated Fees')}:</span>
                  <span className="font-bold text-emerald-700">
                    {Number(doc.totalConsultFee).toLocaleString()} LYD
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Itemized Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 px-5 py-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-blue-600" />
            <span>{t('itemizedReconciliation', 'Itemized Booking Settlement Ledger')}</span>
          </h3>
          <span className="text-xs text-gray-500">
            {meta.total} {t('recordsFound', 'records found')}
          </span>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Calendar className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-3 text-sm font-medium">{t('noReconciliationRecords', 'No reconciliation records found')}</p>
            <p className="text-xs text-gray-400 mt-1">{t('adjustFilters', 'Try adjusting your search or date filters.')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 rtl:text-right">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">{t('serial', 'Serial')}</th>
                  <th className="px-5 py-3.5 font-semibold">{t('dateTime', 'Date & Time')}</th>
                  <th className="px-5 py-3.5 font-semibold">{t('clinic', 'Clinic')}</th>
                  <th className="px-5 py-3.5 font-semibold">{t('doctor', 'Doctor')}</th>
                  <th className="px-5 py-3.5 font-semibold">{t('patient', 'Patient')}</th>
                  <th className="px-5 py-3.5 font-semibold">{t('status', 'Status')}</th>
                  <th className="px-5 py-3.5 font-semibold">{t('consultFee', 'Consult Fee')}</th>
                  <th className="px-5 py-3.5 font-semibold">{t('patientServiceFee', 'Patient service fee')}</th>
                  <th className="px-5 py-3.5 font-semibold">{t('clinicPlatformFee', 'Clinic platform fee')}</th>
                  <th className="px-5 py-3.5 font-semibold">{t('netReceivable', 'Net Receivable')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredItems.map((item) => {
                  const netReceivable = (item.consultFee || 0) - (item.clinicServiceFee || 0);
                  const isCompleted = item.status === 'COMPLETE' || item.status === 'COMPLETED';

                  return (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-medium text-gray-900">
                        #{item.serialNumber}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-gray-900">
                          {new Date(item.consultDate).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                        <div className="text-xs text-gray-400">
                          {item.startTime} - {item.endTime}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-gray-900">{item.clinic?.clinicName || 'N/A'}</div>
                        {item.clinic?.location && (
                          <div className="text-xs text-gray-400 flex items-center gap-0.5">
                            <MapPin className="h-3 w-3" />
                            {item.clinic.location}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-gray-900">{item.doctor?.user?.fullName || 'N/A'}</div>
                        <div className="text-xs text-gray-400">{item.doctor?.speciality || 'General'}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-gray-900">{item.patient?.user?.fullName || 'N/A'}</div>
                        <div className="text-xs text-gray-400 font-mono">{item.patient?.user?.phoneNumber}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge
                          variant="secondary"
                          className={
                            isCompleted
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : item.status === 'CONFIRMED'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : item.status === 'CANCELLED' || item.status === 'REJECTED'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : item.status === 'NOT_SHOW'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-gray-100 text-gray-700'
                          }
                        >
                          {item.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-gray-900">
                        {item.consultFee || 0} LYD
                        <div className="text-xs text-gray-500">{item.collectionMode === 'MODE_B' ? t('platformCollected', 'Platform collected (B)') : t('cashAtClinic', 'Cash at clinic (A)')}</div>
                      </td>
                      <td className="px-5 py-3.5 font-medium">
                        {item.serviceFeeAmount || 0} LYD
                      </td>
                      <td className="px-5 py-3.5 text-purple-600 font-medium">
                        {item.clinicServiceFee || 0} LYD
                      </td>
                      <td className="px-5 py-3.5 font-bold text-emerald-700">
                        {netReceivable > 0 ? `${netReceivable} LYD` : '0 LYD'}
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
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between border-t border-gray-200 bg-gray-50 px-4 sm:px-5 py-3 text-xs text-gray-600">
            <div className="text-center sm:text-left rtl:sm:text-right">
              {t('showingPage', 'Page')} {meta.page} {t('of', 'of')} {meta.totalPages} ({meta.total} {t('total', 'total')})
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={meta.page <= 1 || loading}
                onClick={() => loadReports(meta.page - 1)}
                className="h-8 text-xs"
              >
                {t('previous', 'Previous')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={meta.page >= meta.totalPages || loading}
                onClick={() => loadReports(meta.page + 1)}
                className="h-8 text-xs"
              >
                {t('next', 'Next')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
