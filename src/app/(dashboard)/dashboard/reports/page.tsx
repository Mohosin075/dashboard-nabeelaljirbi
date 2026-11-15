'use client';
import { formatClinicTime } from '@/lib/clinic-time';
import { exportPages, downloadExcel } from '@/lib/export-pages';

import { useEffect, useState, useMemo } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useLanguage } from '@/contexts/language-context';
import { bookingStatuses, bookingStatusLabel } from '@/lib/booking-status';
import {
  clinicService,
  type DoctorBreakdown,
  type ClinicBreakdown,
  type ReconciliationReportItem,
} from '@/services/clinic.service';
import { bookingService, type Doctor } from '@/services/booking.service';
import { adminService, type Clinic } from '@/services/admin.service';
import { specialistService, type Specialist } from '@/services/specialist.service';
import { useToast } from '@/hooks/use-toast';
import {
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Search,
  ShieldAlert,
  Users,
  Building2,
  MapPin,
  FileSpreadsheet,
  TrendingUp,
  Clock,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Receipt,
  CheckCircle2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const currencyForCountry = (country?: string) => ({ LIBYA:'LYD', TUNISIA:'TND', EGYPT:'EGP', ALGERIA:'DZD' }[country || ''] || 'Unspecified');

const formatCountryLabel = (country?: string, currency?: string) => {
  const curr = currency || 'Unspecified';
  if (!country || country === 'HISTORICAL_UNSPECIFIED' || country === 'Unspecified') {
    return { name: 'HISTORICAL_UNSPECIFIED', flag: '🇱🇾', currency: curr };
  }
  const clean = country.toUpperCase();
  if (clean === 'LIBYA') return { name: 'Libya', flag: '🇱🇾', currency: 'LYD' };
  if (clean === 'TUNISIA') return { name: 'Tunisia', flag: '🇹🇳', currency: 'TND' };
  if (clean === 'EGYPT') return { name: 'Egypt', flag: '🇪🇬', currency: 'EGP' };
  if (clean === 'ALGERIA') return { name: 'Algeria', flag: '🇩🇿', currency: 'DZD' };
  return { name: country, flag: '🌐', currency: curr };
};

export default function AnalyticsReportsPage() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const role = useAuthStore((state) => state.role);
  const isAdmin = role === 'ADMIN';
  const isClinicAdmin = role === 'CLINIC' || role === 'ADMIN';

  // Data states
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [doctorBreakdown, setDoctorBreakdown] = useState<DoctorBreakdown[]>([]);
  const [clinicBreakdown, setClinicBreakdown] = useState<ClinicBreakdown[]>([]);
  const [reportItems, setReportItems] = useState<ReconciliationReportItem[]>([]);
  const [breakdownView, setBreakdownView] = useState<'BOTH' | 'CLINICS' | 'DOCTORS'>('BOTH');
  const [summaryData, setSummaryData] = useState<any>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('ALL');
  const [sortField, setSortField] = useState<'date' | 'consultFee' | 'serial' | 'status'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

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
    selectedCurrency,
    startDate,
    endDate,
  ]);

  const loadReports = async (targetPage = page) => {
    try {
      setLoading(true);
      const params: any = {
        page: targetPage,
        limit: 15,
        statusView: 'simple',
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
      if (selectedCurrency !== 'ALL') params.currency = selectedCurrency;

      const res = await clinicService.getReconciliationReports(params);
      if (res?.data) {
        setDoctorBreakdown(res.data.doctorBreakdown || []);
        setClinicBreakdown(res.data.clinicBreakdown || []);
        setReportItems(res.data.data || []);
        setSummaryData(res.data.summary || null);
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

  const handleResetFilters = () => {
    setSelectedClinicId('ALL');
    setSelectedDoctorId('ALL');
    setSelectedSpecialty('ALL');
    setSelectedLocation('ALL');
    setSelectedPeriod('ALL');
    setSelectedStatus('ALL');
    setSelectedCurrency('ALL');
    setStartDate('');
    setEndDate('');
    setSearchTerm('');
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedClinicId !== 'ALL') count++;
    if (selectedDoctorId !== 'ALL') count++;
    if (selectedSpecialty !== 'ALL') count++;
    if (selectedLocation !== 'ALL') count++;
    if (selectedPeriod !== 'ALL') count++;
    if (selectedStatus !== 'ALL') count++;
    if (selectedCurrency !== 'ALL') count++;
    if (searchTerm.trim() !== '') count++;
    if (startDate !== '' || endDate !== '') count++;
    return count;
  }, [
    selectedClinicId,
    selectedDoctorId,
    selectedSpecialty,
    selectedLocation,
    selectedPeriod,
    selectedStatus,
    selectedCurrency,
    searchTerm,
    startDate,
    endDate,
  ]);

  const filteredItems = useMemo(() => {
    return reportItems;
  }, [reportItems, selectedCurrency]);

  const handleSort = (field: 'date' | 'consultFee' | 'serial' | 'status') => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedItems = useMemo(() => {
    const items = [...filteredItems];
    items.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'date') {
        cmp = new Date(a.consultDate).getTime() - new Date(b.consultDate).getTime();
      } else if (sortField === 'consultFee') {
        cmp = (a.consultFee || 0) - (b.consultFee || 0);
      } else if (sortField === 'serial') {
        cmp = (a.serialNumber || 0) - (b.serialNumber || 0);
      } else if (sortField === 'status') {
        cmp = (a.status || '').localeCompare(b.status || '');
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });
    return items;
  }, [filteredItems, sortField, sortDirection]);

  const computedTotals = useMemo(() => {
    // API summaries cover all matching pages and retain currency boundaries.
    const groups = summaryData?.byCountry || [];
    const single = groups.length === 1 && groups[0].currency !== 'Unspecified' ? groups[0] : null;
    const completedCount = summaryData?.totalCompleted || 0;
    const totalCount = summaryData?.totalBookings || 0;
    return {
      totalConsultFee: single ? single.totalConsultFees : null,
      totalServiceFee: single ? single.totalServiceFees : null,
      netReceivable: single ? single.netClinicReceivable : null,
      currency: single?.currency || '',
      completedCount,
      noShowCount: summaryData?.totalNoShow || 0,
      cancelledCount: summaryData?.totalCancelled || 0,
      completionRate: totalCount > 0 ? Math.round(completedCount / totalCount * 100) : 0,
    };
  }, [summaryData]);

  const formatTotal = (amount: number | null) => amount === null
    ? t('seeCountryTotals', 'See country totals')
    : amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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
    const filters: any = { statusView: 'simple' };
    if (isAdmin && selectedClinicId !== 'ALL') filters.clinicId = selectedClinicId;
    if (selectedDoctorId !== 'ALL') filters.doctorId = selectedDoctorId;
    if (selectedSpecialty !== 'ALL') filters.specialty = selectedSpecialty;
    if (selectedLocation !== 'ALL') filters.location = selectedLocation;
    if (selectedPeriod !== 'ALL') filters.period = selectedPeriod;
    if (selectedStatus !== 'ALL') filters.status = selectedStatus;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (searchTerm.trim()) filters.searchTerm = searchTerm.trim();
    if (selectedCurrency !== 'ALL') filters.currency = selectedCurrency;
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
        Country: item.feeCountry || 'HISTORICAL_UNSPECIFIED', Currency: currencyForCountry(item.feeCountry), Attendee: item.familyMemberName || item.patient?.user?.fullName || '', Relation: item.familyMemberRelation || 'Self', Status: bookingStatusLabel(item.displayStatus || item.status, t), Model: item.collectionMode || 'MODE_A',
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
              'Audit consultation revenues, doctor earnings, and Salama platform reconciliation by saved booking country.'
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

      {/* Executive Financial & Booking KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Gross Consultation Fees */}
        <Card className="border-blue-100 bg-blue-50/40 shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-900">
                {t('grossConsultFees', 'Gross Consult Fees')}
              </span>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-blue-950">
              {formatTotal(computedTotals.totalConsultFee)}{' '}
              <span className="text-xs font-semibold text-blue-700">{computedTotals.currency}</span>
            </div>
            <p className="mt-1 text-xs text-blue-700/80">
              {t('completedConsultations', 'From completed appointments')}
            </p>
          </CardContent>
        </Card>

        {/* Platform Fees Retained */}
        <Card className="border-purple-100 bg-purple-50/40 shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-900">
                {t('salamaFeeRetained', 'Platform Fees')}
              </span>
              <Receipt className="h-4 w-4 text-purple-600" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-purple-950">
              {formatTotal(computedTotals.totalServiceFee)}{' '}
              <span className="text-xs font-semibold text-purple-700">{computedTotals.currency}</span>
            </div>
            <p className="mt-1 text-xs text-purple-700/80">
              {t('capturedPlatformFee', 'Platform commission & service fees')}
            </p>
          </CardContent>
        </Card>

        {/* Net Clinic Receivables */}
        <Card className="border-emerald-100 bg-emerald-50/40 shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-900">
                {isAdmin ? t('clinicPayables', 'Total Clinic Payables') : t('netClinicReceivable', 'Net Clinic Receivable')}
              </span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-emerald-950">
              {formatTotal(computedTotals.netReceivable)}{' '}
              <span className="text-xs font-semibold text-emerald-700">{computedTotals.currency}</span>
            </div>
            <p className="mt-1 text-xs text-emerald-700/80">
              {t('netReceivableDesc', 'Total consult fees payable to clinics')}
            </p>
          </CardContent>
        </Card>

        {/* Booking Conversion & Volume */}
        <Card className="border-gray-200 shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                {t('bookingVolume', 'Booking Volume')}
              </span>
              <Calendar className="h-4 w-4 text-gray-400" />
            </div>
            <div className="mt-2 text-2xl font-bold text-gray-900">
              {meta.total}{' '}
              <span className="text-xs font-normal text-gray-500">
                ({computedTotals.completionRate}% {t('completed', 'completed')})
              </span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] font-medium">
              <span className="text-emerald-700">{computedTotals.completedCount} {t('completed', 'completed')}</span>
              <span className="text-gray-300">•</span>
              <span className="text-amber-700">{computedTotals.noShowCount} {t('no-show', 'no-show')}</span>
              <span className="text-gray-300">•</span>
              <span className="text-rose-700">{computedTotals.cancelledCount} {t('cancelled', 'cancelled')}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {summaryData?.byCountry?.length > 0 && (
        <div className="flex flex-wrap gap-4 text-sm" aria-label={t('countryTotals', 'Country totals')}>
          {summaryData.byCountry.map((group: any) => (
            <div key={group.country}>
              <strong>{group.country} / {group.currency}</strong>
              <p>{t('grossConsultFees', 'Gross Consult Fees')}: {group.totalConsultFees.toFixed(2)}</p>
              <p>{t('salamaFeeRetained', 'Platform Fees')}: {group.totalServiceFees.toFixed(2)}</p>
              <p>{t('netClinicReceivable', 'Net Clinic Receivable')}: {group.netClinicReceivable.toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filter Bar */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          {/* Header Row: Filter Title + Quick Range Pills + Clear All */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between border-b border-gray-100 pb-3.5">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Filter className="h-3.5 w-3.5" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">
                {t('filterAnalyticsReports', 'Filter & Search Reconciliation')}
              </h3>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-semibold px-2 py-0.5">
                  {activeFiltersCount} {t('active', 'active')}
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50/60 p-1 text-xs">
                {[
                  { key: 'ALL', label: t('allTime', 'All Time') },
                  { key: 'daily', label: t('todayDaily', 'Today') },
                  { key: 'weekly', label: t('thisWeek', 'This Week') },
                  { key: 'monthly', label: t('thisMonth', 'This Month') },
                  { key: 'last_month', label: t('lastMonth', 'Last Month') },
                  { key: 'custom', label: t('customRange', 'Custom Range') },
                ].map((pill) => {
                  const isSelected = selectedPeriod === pill.key;
                  return (
                    <button
                      key={pill.key}
                      type="button"
                      onClick={() => {
                        setSelectedPeriod(pill.key);
                        if (pill.key !== 'custom') {
                          setStartDate('');
                          setEndDate('');
                        }
                      }}
                      className={`whitespace-nowrap rounded-md px-2.5 py-1 text-xs transition-all ${
                        isSelected
                          ? 'bg-white text-blue-700 font-semibold shadow-xs border border-gray-200/80'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/60'
                      }`}
                    >
                      {pill.label}
                    </button>
                  );
                })}
              </div>

              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <X className="h-3 w-3" />
                  <span>{t('clearAllFilters', 'Clear All')}</span>
                </button>
              )}
            </div>
          </div>

          {/* Filter Dropdowns Grid */}
          <div className={`grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3 ${isAdmin ? 'lg:grid-cols-4 xl:grid-cols-7' : 'lg:grid-cols-3 xl:grid-cols-6'}`}>
            {/* 1. Quick Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 rtl:left-auto rtl:right-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('searchPatientOrDoctor', 'Search patient, phone, doctor, clinic...')}
                className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-8 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 rtl:pl-8 rtl:pr-9"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    loadReports(1);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 rtl:right-auto rtl:left-2.5"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* 2. Clinic Filter (Admin only) */}
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
                  <option key={`${doc.doctorId}:${doc.country}`} value={doc.doctorId}>
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

            {/* 6. Currency Selector */}
            <div>
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 px-2.5 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white font-medium text-gray-700"
              >
                <option value="ALL">🌐 {t('allCurrencies', 'All Currencies')}</option>
                <option value="LYD">🇱🇾 LYD (Libya)</option>
                <option value="DZD">🇩🇿 DZD (Algeria)</option>
                <option value="TND">🇹🇳 TND (Tunisia)</option>
                <option value="EGP">🇪🇬 EGP (Egypt)</option>
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
                {bookingStatuses.map(status => (
                  <option key={status} value={status}>{bookingStatusLabel(status, t)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Custom Date Range & Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            {selectedPeriod === 'custom' ? (
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-blue-200 bg-blue-50/60 px-3 py-1.5 text-xs text-gray-700">
                <span className="font-semibold text-blue-900 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-blue-600" />
                  {t('customRange', 'Custom Range')}:
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-500">{t('startDate', 'From')}:</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="rounded-md border border-gray-300 bg-white px-2 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-500">{t('endDate', 'To')}:</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="rounded-md border border-gray-300 bg-white px-2 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            ) : <div />}

            <div className="flex items-center gap-2 ml-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
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

      {/* Performance & Revenue Breakdown (Tabular View) */}
      {(isAdmin ? (clinicBreakdown.length > 0 || doctorBreakdown.length > 0) : doctorBreakdown.length > 0) && (
        <div className="space-y-4">
          {/* Section Header & View Toggle */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <h2 className="text-base font-bold tracking-tight text-gray-900 sm:text-lg">
                {t('performanceBreakdownTitle', 'Performance & Revenue Breakdown')}
              </h2>
            </div>

            {isAdmin && clinicBreakdown.length > 0 && doctorBreakdown.length > 0 && (
              <div className="flex items-center rounded-lg border border-gray-200 bg-white p-1 text-xs font-medium shadow-sm">
                <button
                  type="button"
                  onClick={() => setBreakdownView('BOTH')}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-all ${
                    breakdownView === 'BOTH'
                      ? 'bg-blue-600 text-white shadow-xs font-semibold'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span>{t('viewAll', 'View Both')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBreakdownView('CLINICS')}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-all ${
                    breakdownView === 'CLINICS'
                      ? 'bg-blue-600 text-white shadow-xs font-semibold'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Building2 className="h-3.5 w-3.5" />
                  <span>{t('clinics', 'Clinics')}</span>
                  <Badge
                    variant="secondary"
                    className={`ml-1 px-1.5 py-0 text-[10px] ${
                      breakdownView === 'CLINICS'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {clinicBreakdown.length}
                  </Badge>
                </button>
                <button
                  type="button"
                  onClick={() => setBreakdownView('DOCTORS')}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-all ${
                    breakdownView === 'DOCTORS'
                      ? 'bg-blue-600 text-white shadow-xs font-semibold'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Users className="h-3.5 w-3.5" />
                  <span>{t('doctors', 'Doctors')}</span>
                  <Badge
                    variant="secondary"
                    className={`ml-1 px-1.5 py-0 text-[10px] ${
                      breakdownView === 'DOCTORS'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {doctorBreakdown.length}
                  </Badge>
                </button>
              </div>
            )}
          </div>

          {/* 1. Clinic Performance Table */}
          {isAdmin &&
            clinicBreakdown.length > 0 &&
            (breakdownView === 'BOTH' || breakdownView === 'CLINICS') && (
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-gray-200 bg-purple-50/40 px-5 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-purple-700" />
                    <h3 className="text-sm font-bold text-purple-950">
                      {t(
                        'clinicReconciliationBreakdown',
                        'Clinic Performance & Payment Reconciliation'
                      )}
                    </h3>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-purple-200 bg-purple-100/60 text-purple-800 text-xs font-medium"
                  >
                    {clinicBreakdown.length} {t('clinics', 'Clinics')}
                  </Badge>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm text-gray-600">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-200">
                      <tr>
                        <th className="px-5 py-3 font-semibold">
                          {t('clinic', 'Clinic Name & Location')}
                        </th>
                        <th className="px-5 py-3 font-semibold">
                          {t('country', 'Country & Currency')}
                        </th>
                        <th className="px-5 py-3 font-semibold text-center">
                          {t('bookingsRatio', 'Bookings (Completed / Total)')}
                        </th>
                        <th className="px-5 py-3 font-semibold text-right">
                          {t('consultRevenue', 'Consult Fees')}
                        </th>
                        <th className="px-5 py-3 font-semibold text-right">
                          {t('salamaFee', 'Platform Fees')}
                        </th>
                        <th className="px-5 py-3 font-semibold text-right">
                          {t('netClinicIncome', 'Net Clinic Income')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {clinicBreakdown.map((clinic) => {
                        const cInfo = formatCountryLabel(clinic.country, clinic.currency);
                        const net =
                          (clinic.totalConsultFee || 0) - (clinic.totalServiceFee || 0);
                        const completionRate =
                          clinic.totalBookings > 0
                            ? Math.round(
                                (clinic.completedBookings / clinic.totalBookings) * 100
                              )
                            : 0;

                        return (
                          <tr
                            key={`${clinic.clinicId}:${clinic.country}`}
                            className="hover:bg-purple-50/20 transition-colors"
                          >
                            <td className="px-5 py-3.5">
                              <div className="font-semibold text-gray-900">
                                {clinic.clinicName}
                              </div>
                              {clinic.location && (
                                <div
                                  className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 max-w-[260px] truncate"
                                  title={clinic.location}
                                >
                                  <MapPin className="h-3 w-3 text-gray-400 shrink-0" />
                                  <span className="truncate">{clinic.location}</span>
                                </div>
                              )}
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="inline-flex items-center gap-1.5 font-medium text-gray-700 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded text-xs">
                                <span>{cInfo.flag}</span>
                                <span>{cInfo.name}</span>
                                <span className="text-gray-400">·</span>
                                <span className="font-mono text-gray-600 font-semibold">
                                  {cInfo.currency}
                                </span>
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-center">
                              <div className="inline-flex items-center gap-2">
                                <span className="font-mono font-semibold text-gray-900">
                                  {clinic.completedBookings} / {clinic.totalBookings}
                                </span>
                                <Badge
                                  variant="outline"
                                  className={`text-[11px] font-medium border ${
                                    completionRate >= 50
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : completionRate > 0
                                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                                      : 'bg-gray-100 text-gray-600 border-gray-200'
                                  }`}
                                >
                                  {completionRate}%
                                </Badge>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-right font-mono font-semibold text-gray-900">
                              {Number(clinic.totalConsultFee).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}{' '}
                              <span className="text-xs font-normal text-gray-500">
                                {cInfo.currency}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right font-mono font-semibold text-purple-700">
                              {Number(clinic.totalServiceFee).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}{' '}
                              <span className="text-xs font-normal text-gray-500">
                                {cInfo.currency}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right font-mono font-bold text-emerald-700">
                              {Number(net).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}{' '}
                              <span className="text-xs font-semibold text-emerald-600">
                                {cInfo.currency}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          {/* 2. Doctor Performance Table */}
          {doctorBreakdown.length > 0 &&
            (breakdownView === 'BOTH' || breakdownView === 'DOCTORS') && (
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-gray-200 bg-blue-50/40 px-5 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-700" />
                    <h3 className="text-sm font-bold text-blue-950">
                      {t('doctorReconciliationBreakdown', 'Doctor Performance & Revenue Breakdown')}
                    </h3>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-blue-200 bg-blue-100/60 text-blue-800 text-xs font-medium"
                  >
                    {doctorBreakdown.length} {t('doctors', 'Doctors')}
                  </Badge>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm text-gray-600">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-200">
                      <tr>
                        <th className="px-5 py-3 font-semibold">
                          {t('doctor', 'Doctor Name')}
                        </th>
                        <th className="px-5 py-3 font-semibold">
                          {t('country', 'Country & Currency')}
                        </th>
                        <th className="px-5 py-3 font-semibold text-center">
                          {t('bookingsRatio', 'Bookings (Completed / Total)')}
                        </th>
                        <th className="px-5 py-3 font-semibold text-right">
                          {t('generatedRevenue', 'Generated Consult Fees')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {doctorBreakdown.map((doc) => {
                        const cInfo = formatCountryLabel(doc.country, doc.currency);
                        const completionRate =
                          doc.totalBookings > 0
                            ? Math.round((doc.completedBookings / doc.totalBookings) * 100)
                            : 0;

                        return (
                          <tr
                            key={`${doc.doctorId}:${doc.country}`}
                            className="hover:bg-blue-50/20 transition-colors"
                          >
                            <td className="px-5 py-3.5 font-semibold text-gray-900">
                              {doc.doctorName}
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="inline-flex items-center gap-1.5 font-medium text-gray-700 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded text-xs">
                                <span>{cInfo.flag}</span>
                                <span>{cInfo.name}</span>
                                <span className="text-gray-400">·</span>
                                <span className="font-mono text-gray-600 font-semibold">
                                  {cInfo.currency}
                                </span>
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-center">
                              <div className="inline-flex items-center gap-2">
                                <span className="font-mono font-semibold text-gray-900">
                                  {doc.completedBookings} / {doc.totalBookings}
                                </span>
                                <Badge
                                  variant="outline"
                                  className={`text-[11px] font-medium border ${
                                    completionRate >= 50
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : completionRate > 0
                                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                                      : 'bg-gray-100 text-gray-600 border-gray-200'
                                  }`}
                                >
                                  {completionRate}%
                                </Badge>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-right font-mono font-bold text-emerald-700">
                              {Number(doc.totalConsultFee).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}{' '}
                              <span className="text-xs font-semibold text-emerald-600">
                                {cInfo.currency}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
        </div>
      )}

      {/* Itemized Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 px-5 py-4 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet className="h-5 w-5 text-blue-600" />
            <h3 className="text-sm sm:text-base font-bold text-gray-900">
              {t('itemizedReconciliation', 'Itemized Booking Settlement Ledger')}
            </h3>
            <Badge
              variant="secondary"
              className="bg-blue-50 font-mono text-xs font-semibold text-blue-700 border border-blue-200"
            >
              {meta.total} {t('records', 'Records')}
            </Badge>
          </div>
          <p className="hidden text-xs text-muted-foreground md:block">
            {t('reconciliationAuditSubtitle', 'Detailed appointment billing, collection modes & retained fee shares.')}
          </p>
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
            <table className="w-full text-left text-xs sm:text-sm text-gray-600">
              <thead className="bg-gray-50/80 text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                <tr>
                  <th
                    onClick={() => handleSort('serial')}
                    className="px-4 py-3.5 text-center w-16 cursor-pointer hover:bg-gray-100/80 transition-colors select-none"
                    title="Sort by Serial"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>{t('serial', 'Serial')}</span>
                      {sortField === 'serial' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="h-3 w-3 text-blue-600" />
                        ) : (
                          <ArrowDown className="h-3 w-3 text-blue-600" />
                        )
                      ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-30" />
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('date')}
                    className="px-4 py-3.5 min-w-[130px] cursor-pointer hover:bg-gray-100/80 transition-colors select-none"
                    title="Sort by Date"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{t('dateTime', 'Date & Time')}</span>
                      {sortField === 'date' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="h-3 w-3 text-blue-600" />
                        ) : (
                          <ArrowDown className="h-3 w-3 text-blue-600" />
                        )
                      ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-30" />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3.5 min-w-[180px]">{t('clinic', 'Clinic')}</th>
                  <th className="px-4 py-3.5 min-w-[160px]">{t('doctor', 'Doctor')}</th>
                  <th className="px-4 py-3.5 min-w-[160px]">{t('patient', 'Patient')}</th>
                  <th
                    onClick={() => handleSort('status')}
                    className="px-4 py-3.5 text-center min-w-[120px] cursor-pointer hover:bg-gray-100/80 transition-colors select-none"
                    title="Sort by Status"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>{t('status', 'Status')}</span>
                      {sortField === 'status' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="h-3 w-3 text-blue-600" />
                        ) : (
                          <ArrowDown className="h-3 w-3 text-blue-600" />
                        )
                      ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-30" />
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('consultFee')}
                    className="px-4 py-3.5 text-right min-w-[130px] cursor-pointer hover:bg-gray-100/80 transition-colors select-none"
                    title="Sort by Consult Fee"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>{t('consultFee', 'Consult Fee')}</span>
                      {sortField === 'consultFee' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="h-3 w-3 text-blue-600" />
                        ) : (
                          <ArrowDown className="h-3 w-3 text-blue-600" />
                        )
                      ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-30" />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3.5 text-right min-w-[110px]">
                    {t('patientServiceFee', 'Patient Fee')}
                  </th>
                  <th className="px-4 py-3.5 text-right min-w-[110px]">
                    {t('clinicPlatformFee', 'Clinic Fee')}
                  </th>
                  <th className="px-4 py-3.5 text-right min-w-[120px]">
                    {t('netReceivable', 'Net Receivable')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedItems.map((item) => {
                  const netReceivable = (item.consultFee || 0) - (item.clinicServiceFee || 0);
                  const isCompleted = item.status === 'COMPLETE' || item.status === 'COMPLETED';
                  const curr = currencyForCountry(item.feeCountry);

                  return (
                    <tr key={item.id} className="hover:bg-blue-50/20 transition-colors">
                      {/* Serial */}
                      <td className="px-4 py-3.5 text-center">
                        <span className="font-mono text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                          #{item.serialNumber}
                        </span>
                      </td>

                      {/* Date & Time */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="font-semibold text-gray-900">
                          {new Date(item.consultDate).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                        <div className="text-xs text-gray-500 font-mono flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span>{formatClinicTime(item.startTime)} - {formatClinicTime(item.endTime)}</span>
                        </div>
                      </td>

                      {/* Clinic */}
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-gray-900 leading-snug">
                          {item.clinic?.clinicName || '—'}
                        </div>
                        {item.clinic?.location && (
                          <div
                            className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 max-w-[210px] truncate"
                            title={item.clinic.location}
                          >
                            <MapPin className="h-3 w-3 text-gray-400 shrink-0" />
                            <span className="truncate">{item.clinic.location}</span>
                          </div>
                        )}
                      </td>

                      {/* Doctor */}
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-gray-900 leading-snug">
                          {item.doctor?.user?.fullName || '—'}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          <span className="inline-block bg-slate-100 text-slate-700 rounded px-1.5 py-0.2 text-[11px]">
                            {item.doctor?.speciality || 'General Practitioner'}
                          </span>
                        </div>
                      </td>

                      {/* Patient */}
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-gray-900 leading-snug">
                          {item.familyMemberName ? (
                            <span>
                              {item.familyMemberName}{' '}
                              <span className="text-xs text-blue-600 font-normal">
                                ({item.familyMemberRelation || 'Family'})
                              </span>
                            </span>
                          ) : (
                            item.patient?.user?.fullName || '—'
                          )}
                        </div>
                        {item.patient?.user?.phoneNumber && (
                          <div className="text-xs text-gray-500 font-mono mt-0.5">
                            {item.patient.user.phoneNumber}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            isCompleted
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : item.status === 'CONFIRMED'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : item.status === 'CANCELLED' || item.status === 'REJECTED'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : item.status === 'NOT_SHOW'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-gray-100 text-gray-700 border-gray-200'
                          }`}
                        >
                          {bookingStatusLabel(item.displayStatus || item.status, t)}
                        </span>
                      </td>

                      {/* Consult Fee */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="font-mono font-bold text-gray-900">
                          {(item.consultFee || 0).toFixed(2)}{' '}
                          <span className="text-xs font-medium text-gray-500">{curr}</span>
                        </div>
                        <div className="mt-0.5">
                          {item.collectionMode === 'MODE_B' ? (
                            <span className="inline-block text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200/60 rounded px-1.5 py-0.2">
                              {t('platformPaid', 'Platform (Wallet)')}
                            </span>
                          ) : (
                            <span className="inline-block text-[10px] font-medium bg-gray-100 text-gray-600 rounded px-1.5 py-0.2">
                              {t('cashAtClinic', 'Cash at clinic')}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Patient Fee */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap font-mono text-gray-700">
                        {(item.serviceFeeAmount || 0).toFixed(2)}{' '}
                        <span className="text-xs font-medium text-gray-500">{curr}</span>
                      </td>

                      {/* Clinic Fee */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap font-mono font-semibold text-purple-700">
                        {(item.clinicServiceFee || 0).toFixed(2)}{' '}
                        <span className="text-xs font-medium text-purple-500">{curr}</span>
                      </td>

                      {/* Net Receivable */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap font-mono font-bold text-emerald-700">
                        {netReceivable.toFixed(2)}{' '}
                        <span className="text-xs font-semibold text-emerald-600">{curr}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Integrated Pagination Footer */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-gray-200 bg-gray-50/60 px-5 py-3.5 text-xs text-gray-600">
          <div>
            {t('showing', 'Showing')}{' '}
            <span className="font-semibold text-gray-900">
              {meta.total === 0 ? 0 : (meta.page - 1) * 20 + 1}
            </span>{' '}
            {t('to', 'to')}{' '}
            <span className="font-semibold text-gray-900">
              {Math.min(meta.page * 20, meta.total)}
            </span>{' '}
            {t('of', 'of')}{' '}
            <span className="font-semibold text-gray-900">{meta.total}</span>{' '}
            {t('records', 'records')}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 mr-2">
              {t('showingPage', 'Page')} {meta.page} / {meta.totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page <= 1 || loading}
              onClick={() => loadReports(meta.page - 1)}
              className="h-8 gap-1 border-gray-200 px-2.5 text-xs hover:bg-gray-100"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>{t('previous', 'Previous')}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page >= meta.totalPages || loading}
              onClick={() => loadReports(meta.page + 1)}
              className="h-8 gap-1 border-gray-200 px-2.5 text-xs hover:bg-gray-100"
            >
              <span>{t('next', 'Next')}</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
