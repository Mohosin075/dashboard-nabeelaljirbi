'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useLanguage } from '@/contexts/language-context';
import { clinicService, type ReconciliationSummary, type DoctorBreakdown, type ReconciliationReportItem } from '@/services/clinic.service';
import { bookingService, type Doctor } from '@/services/booking.service';
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
  FileSpreadsheet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ClinicReportsPage() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const role = useAuthStore((state) => state.role);

  // States
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [summary, setSummary] = useState<ReconciliationSummary | null>(null);
  const [doctorBreakdown, setDoctorBreakdown] = useState<DoctorBreakdown[]>([]);
  const [reportItems, setReportItems] = useState<ReconciliationReportItem[]>([]);
  const [doctorsList, setDoctorsList] = useState<Doctor[]>([]);
  
  // Filters
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('ALL');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });

  // Clinic Admin check (CLINIC or ADMIN)
  const isClinicAdmin = role === 'CLINIC' || role === 'ADMIN';

  useEffect(() => {
    if (isClinicAdmin) {
      loadDoctors();
    }
  }, [isClinicAdmin]);

  useEffect(() => {
    if (isClinicAdmin) {
      loadReports(1);
    }
  }, [isClinicAdmin, selectedDoctorId, selectedPeriod, selectedStatus, startDate, endDate]);

  const loadDoctors = async () => {
    try {
      const res = await bookingService.getDoctors();
      setDoctorsList(res?.data?.data || []);
    } catch (e) {
      // ignore
    }
  };

  const loadReports = async (targetPage = page) => {
    try {
      setLoading(true);
      const params: any = {
        page: targetPage,
        limit: 15,
      };
      if (selectedDoctorId !== 'ALL') params.doctorId = selectedDoctorId;
      if (selectedPeriod !== 'ALL') params.period = selectedPeriod;
      if (selectedStatus !== 'ALL') params.status = selectedStatus;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (searchTerm.trim()) params.searchTerm = searchTerm.trim();

      const res = await clinicService.getReconciliationReports(params);
      if (res?.data) {
        setSummary(res.data.summary);
        setDoctorBreakdown(res.data.doctorBreakdown || []);
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
      const serial = `#${item.serialNumber}`;
      return patientName.includes(q) || patientPhone.includes(q) || docName.includes(q) || serial.includes(q);
    });
  }, [reportItems, searchTerm]);

  // Export to CSV Function
  const handleExportCSV = () => {
    try {
      setExporting(true);
      if (!filteredItems.length) {
        toast({
          title: t('noData', 'No Data'),
          description: t('noDataToExport', 'There are no records to export.'),
          variant: 'destructive',
        });
        return;
      }

      const headers = [
        'Booking Serial',
        'Date',
        'Time Slot',
        'Patient Name',
        'Patient Phone',
        'Doctor Name',
        'Specialty',
        'Status',
        'Consult Fee (SAR)',
        'Platform Fee (SAR)',
        'Net Clinic Receivable (SAR)',
      ];

      const rows = filteredItems.map((item) => [
        `#${item.serialNumber}`,
        new Date(item.consultDate).toISOString().slice(0, 10),
        `${item.startTime} - ${item.endTime}`,
        `"${item.patient?.user?.fullName || 'N/A'}"`,
        `"${item.patient?.user?.phoneNumber || 'N/A'}"`,
        `"${item.doctor?.user?.fullName || 'N/A'}"`,
        `"${item.doctor?.speciality || 'N/A'}"`,
        item.status,
        item.consultFee || 0,
        item.serviceFeeAmount || 0,
        (item.consultFee || 0) - (item.serviceFeeAmount || 0),
      ]);

      const csvContent =
        '\uFEFF' +
        [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const filename = `Clinic_Payment_Reconciliation_${new Date().toISOString().slice(0, 10)}.csv`;
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: t('exported', 'Export Successful'),
        description: t('reconciliationDownloaded', 'Payment reconciliation report downloaded successfully.'),
      });
    } catch (e) {
      toast({
        title: t('exportError', 'Export Error'),
        description: t('failedExport', 'Failed to generate CSV export file.'),
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  // Restrict access for Clinic Staff (MANAGER)
  if (!isClinicAdmin) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 shadow-sm">
          <ShieldAlert className="h-10 w-10" />
        </div>
        <h2 className="mt-6 text-2xl font-bold tracking-tight text-gray-900">
          {t('restrictedAccess', 'Clinic Admin Access Required')}
        </h2>
        <p className="mt-2 max-w-md text-sm text-gray-600 leading-relaxed">
          {t(
            'staffRestrictedReportsMsg',
            'Financial reports and payment reconciliations are restricted to Clinic Admins. Clinic Staff have access to day-to-day booking operations only.'
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              {t('financialReports', 'Payment Reconciliation & Reports')}
            </h1>
            <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 text-xs">
              {t('clinicAdminOnly', 'Clinic Admin')}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            {t(
              'reconciliationSubtitle',
              'Audit consultation revenues, doctor earnings, and Salama platform reconciliation in real time.'
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
            <span>{exporting ? t('exporting', 'Exporting...') : t('exportCSV', 'Export CSV')}</span>
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
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
            <span className="text-sm font-normal text-gray-500">SAR</span>
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {t('completedConsultations', 'From completed appointments')}
          </p>
        </div>

        {/* Net Clinic Receivable */}
        <div className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              {t('netClinicReceivable', 'Net Clinic Receivable')}
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-emerald-700">
            {summary ? Number(summary.netClinicReceivable).toLocaleString() : '0'}{' '}
            <span className="text-sm font-normal text-emerald-600">SAR</span>
          </p>
          <p className="mt-1 text-xs text-emerald-600">
            {t('payoutEligibility', 'Verified clinic balance')}
          </p>
        </div>

        {/* Platform Fees */}
        <div className="rounded-xl border border-purple-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              {t('platformFees', 'Salama Service Fees')}
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <BarChart3 className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">
            {summary ? Number(summary.totalServiceFees).toLocaleString() : '0'}{' '}
            <span className="text-sm font-normal text-gray-500">SAR</span>
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {t('collectedPlatformShare', 'Reconciled platform fee')}
          </p>
        </div>

        {/* Total Bookings & Counts */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
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
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3 text-sm font-semibold text-gray-800">
            <Filter className="h-4 w-4 text-blue-600" />
            <span>{t('filterReconciliation', 'Filter Reconciliation')}</span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 rtl:left-auto rtl:right-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                {doctorsList.map((doc) => (
                  <option key={doc.doctorId} value={doc.doctorId}>
                    {doc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Period Selector */}
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
                className="w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              >
                <option value="ALL">{t('allPeriods', 'All Periods')}</option>
                <option value="daily">{t('todayDaily', 'Today (Daily)')}</option>
                <option value="weekly">{t('thisWeek', 'This Week')}</option>
                <option value="monthly">{t('thisMonth', 'This Month')}</option>
                <option value="last_month">{t('lastMonth', 'Last Month')}</option>
                <option value="custom">{t('customDateRange', 'Custom Range')}</option>
              </select>
            </div>

            {/* Status Selector */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              >
                <option value="ALL">{t('allStatusOpt', 'All Status')}</option>
                <option value="COMPLETE">{t('completed', 'Completed')}</option>
                <option value="CONFIRMED">{t('confirmed', 'Confirmed')}</option>
                <option value="PENDING">{t('pending', 'Pending')}</option>
                <option value="CANCELLED">{t('cancelled', 'Cancelled')}</option>
                <option value="NOT_SHOW">{t('noShow', 'No Show')}</option>
              </select>
            </div>

            {/* Submit / Reset Buttons */}
            <div className="flex items-center gap-2">
              <Button type="submit" size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                {t('applyFilter', 'Filter')}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedDoctorId('ALL');
                  setSelectedPeriod('ALL');
                  setSelectedStatus('ALL');
                  setStartDate('');
                  setEndDate('');
                  setSearchTerm('');
                }}
                className="px-2 text-xs"
              >
                {t('reset', 'Reset')}
              </Button>
            </div>
          </div>

          {/* Custom Date Range if selected */}
          {selectedPeriod === 'custom' && (
            <div className="flex flex-wrap items-center gap-3 pt-2 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{t('startDate', 'From')}:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{t('endDate', 'To')}:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </form>
      </div>

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
                    {Number(doc.totalConsultFee).toLocaleString()} SAR
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
                  <th className="px-5 py-3.5 font-semibold">{t('patient', 'Patient')}</th>
                  <th className="px-5 py-3.5 font-semibold">{t('doctor', 'Doctor')}</th>
                  <th className="px-5 py-3.5 font-semibold">{t('status', 'Status')}</th>
                  <th className="px-5 py-3.5 font-semibold">{t('consultFee', 'Consult Fee')}</th>
                  <th className="px-5 py-3.5 font-semibold">{t('platformFee', 'Salama Fee')}</th>
                  <th className="px-5 py-3.5 font-semibold">{t('netReceivable', 'Net Receivable')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredItems.map((item) => {
                  const netReceivable = (item.consultFee || 0) - (item.serviceFeeAmount || 0);
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
                        <div className="font-medium text-gray-900">{item.patient?.user?.fullName || 'N/A'}</div>
                        <div className="text-xs text-gray-400 font-mono">{item.patient?.user?.phoneNumber}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-gray-900">{item.doctor?.user?.fullName || 'N/A'}</div>
                        <div className="text-xs text-gray-400">{item.doctor?.speciality || 'General'}</div>
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
                        {item.consultFee || 0} SAR
                      </td>
                      <td className="px-5 py-3.5 text-purple-600 font-medium">
                        {item.serviceFeeAmount || 0} SAR
                      </td>
                      <td className="px-5 py-3.5 font-bold text-emerald-700">
                        {netReceivable > 0 ? `${netReceivable} SAR` : '0 SAR'}
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
