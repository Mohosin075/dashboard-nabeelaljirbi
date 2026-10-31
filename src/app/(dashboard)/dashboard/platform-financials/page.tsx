'use client';
import { RowsPerPage } from '@/components/rows-per-page';
import { exportPages, downloadExcel } from '@/lib/export-pages';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/language-context';
import { useAuthStore } from '@/stores/auth-store';
import {
  adminService,
  PlatformFinancialOverview,
  FinancialLedgerEntry,
  FinancialLedgerSummary,
} from '@/services/admin.service';
import { patientServiceFeeService } from '@/services/patient-service-fee.service';
import {
  Wallet,
  DollarSign,
  TrendingUp,
  CreditCard,
  RefreshCw,
  Building2,
  Receipt,
  Globe,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  Info,
  Calendar,
  X,
  Stethoscope,
} from 'lucide-react';

export default function PlatformFinancialsPage() {
  const { t, language } = useLanguage();
  const adminTier = useAuthStore((state) => state.adminTier) || 'SUPER_ADMIN';
  const isReadOnly = adminTier === 'READ_ONLY';

  // Overview Data
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [financials, setFinancials] = useState<PlatformFinancialOverview | null>(null);

  // Country Fees
  const [countryFees, setCountryFees] = useState<{ [key: string]: number }>({});
  const [feeLoading, setFeeLoading] = useState(false);

  // Wallet Adjustment Dialog
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletTargetUserId, setWalletTargetUserId] = useState('');
  const [walletAmount, setWalletAmount] = useState('');
  const [walletLoading, setWalletLoading] = useState(false);

  // Section 10: Financial Ledger State
  const [ledgerEntries, setLedgerEntries] = useState<FinancialLedgerEntry[]>([]);
  const [ledgerSummary, setLedgerSummary] = useState<FinancialLedgerSummary | null>(null);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [ledgerPage, setLedgerPage] = useState(1);
  const [ledgerPageSize, setLedgerPageSize] = useState(25);
  const [ledgerTotalPages, setLedgerTotalPages] = useState(1);
  const [ledgerTotalCount, setLedgerTotalCount] = useState(0);

  // Ledger Filter States
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const [finRes, feeRes] = await Promise.all([
        adminService.getPlatformFinancialOverview(),
        patientServiceFeeService.get(),
      ]);

      if (finRes.data) {
        setFinancials(finRes.data);
      }

      if (feeRes.data) {
        const mapped: { [key: string]: number } = {};
        feeRes.data.forEach((item: any) => {
          mapped[item.country] = item.amount;
        });
        setCountryFees(mapped);
      }
    } catch (err: any) {
      toast({
        title: t('error', 'Error'),
        description: err.response?.data?.message || 'Failed to load platform financials',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLedger = useCallback(
    async (pageToLoad = 1) => {
      try {
        setLedgerLoading(true);
        const params: any = {
          page: pageToLoad,
          limit: ledgerPageSize,
        };

        if (selectedCategory && selectedCategory !== 'ALL') {
          params.category = selectedCategory;
        }
        if (searchTerm.trim()) {
          params.searchTerm = searchTerm.trim();
        }
        if (startDate) {
          params.startDate = startDate;
        }
        if (endDate) {
          params.endDate = endDate;
        }

        const res = await adminService.getFinancialLedger(params);
        if (res.data) {
          setLedgerEntries(res.data.transactions || []);
          setLedgerSummary(res.data.summary || null);
          const meta = (res as any).meta || res.data?.meta;
          if (meta) {
            setLedgerPage(meta.page);
            setLedgerTotalPages(meta.totalPages || 1);
            setLedgerTotalCount(meta.total);
          }
        }
      } catch (err: any) {
        toast({
          title: t('error', 'Error'),
          description: err.response?.data?.message || 'Failed to load financial ledger',
          variant: 'destructive',
        });
      } finally {
        setLedgerLoading(false);
      }
    },
    [selectedCategory, searchTerm, startDate, endDate, ledgerPageSize, t]
  );

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    fetchLedger(1);
  }, [fetchLedger]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(searchInput);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setSearchTerm('');
    setSelectedCategory('ALL');
    setStartDate('');
    setEndDate('');
  };

  const handleExportCSV = async () => {
    const filters = {
      category: selectedCategory,
      searchTerm: searchTerm.trim(),
      startDate,
      endDate,
    };
    try {
      setExporting(true);
      const records = await exportPages<FinancialLedgerEntry>(async (page) => {
        const result = await adminService.getFinancialLedger({ ...filters, page, limit: 500 });
        const meta = (result as any).meta || result.data.meta;
        if (!meta) throw new Error('Missing export pagination');
        return { rows: result.data.transactions, total: meta.total };
      });
      await downloadExcel(
        records.map((entry) => ({
          'Transaction ID': entry.transactionId,
          'Booking ID': entry.bookingId || '',
          Name: entry.userName,
          Phone: entry.userPhone,
          Role: entry.userRole,
          Clinic: entry.clinicName || '',
          Doctor: entry.doctorName || '',
          Amount: entry.amount,
          Category: entry.type,
          Status: entry.status,
          Date: entry.date,
          Reference: entry.reference || '',
        })),
        `Salama_Ledger_${new Date().toISOString().slice(0, 10)}`
      );
    } catch (error: any) {
      toast({
        title: t('error', 'Error'),
        description: error.message || 'Export failed',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };
  const handleSaveCountryFees = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) {
      toast({
        title: t('accessDenied', 'Unauthorized'),
        description: t('noPermission', 'Read-only staff cannot modify platform fees'),
        variant: 'destructive',
      });
      return;
    }

    try {
      setFeeLoading(true);
      await patientServiceFeeService.upsert(countryFees);
      toast({
        title: t('success', 'Success'),
        description: t(
          'Patient service fees updated successfully',
          'Country-specific patient service fees updated'
        ),
      });
      fetchOverview();
    } catch (err: any) {
      toast({
        title: t('error', 'Error'),
        description: err.response?.data?.message || 'Failed to update platform fees',
        variant: 'destructive',
      });
    } finally {
      setFeeLoading(false);
    }
  };

  const handleWalletAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) {
      toast({
        title: t('accessDenied', 'Unauthorized'),
        description: t('noPermission', 'Read-only staff cannot perform wallet adjustments'),
        variant: 'destructive',
      });
      return;
    }

    const parsedAmount = parseFloat(walletAmount);
    if (!walletTargetUserId || isNaN(parsedAmount)) {
      toast({
        title: t('validationError', 'Invalid Input'),
        description: t(
          'Please enter a valid wallet amount',
          'Enter a valid user ID and numeric amount'
        ),
        variant: 'destructive',
      });
      return;
    }

    try {
      setWalletLoading(true);
      await adminService.updateWallet(walletTargetUserId, parsedAmount);
      toast({
        title: t('success', 'Success'),
        description: `${t('Wallet updated successfully', 'Wallet updated by')} ${parsedAmount > 0 ? '+' : ''}${parsedAmount} ${t('lyd', 'LYD')}`,
      });
      setShowWalletModal(false);
      setWalletTargetUserId('');
      setWalletAmount('');
      fetchOverview();
      fetchLedger(ledgerPage);
    } catch (err: any) {
      toast({
        title: t('error', 'Error'),
        description: err.response?.data?.message || 'Failed to execute wallet adjustment',
        variant: 'destructive',
      });
    } finally {
      setWalletLoading(false);
    }
  };

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleString(language === 'ar' ? 'ar-LY' : undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'PLATFORM_REVENUE':
        return (
          <Badge className="border-emerald-200 bg-emerald-100 font-medium text-emerald-800 hover:bg-emerald-100">
            {t('platformRevenue', 'Platform Revenue')}
          </Badge>
        );
      case 'SERVICE_FEE':
        return (
          <Badge className="border-blue-200 bg-blue-100 font-medium text-blue-800 hover:bg-blue-100">
            {t('serviceFees', 'Service Fee')}
          </Badge>
        );
      case 'WALLET_TRANSACTION':
        return (
          <Badge className="border-indigo-200 bg-indigo-100 font-medium text-indigo-800 hover:bg-indigo-100">
            {t('walletTransactions', 'Wallet Tx')}
          </Badge>
        );
      case 'REFUND':
        return (
          <Badge className="border-rose-200 bg-rose-100 font-medium text-rose-800 hover:bg-rose-100">
            {t('refunds', 'Refund')}
          </Badge>
        );
      case 'PREPAID_CARD':
        return (
          <Badge className="border-amber-200 bg-amber-100 font-medium text-amber-800 hover:bg-amber-100">
            {t('prepaidCardTx', 'Prepaid Card')}
          </Badge>
        );
      case 'ADJUSTMENT':
        return (
          <Badge className="border-orange-200 bg-orange-100 font-medium text-orange-800 hover:bg-orange-100">
            {t('adjustments', 'Adjustment')}
          </Badge>
        );
      case 'CLINIC_PAYABLE':
        return (
          <Badge className="border-cyan-200 bg-cyan-100 font-medium text-cyan-800 hover:bg-cyan-100">
            {t('clinicPayables', 'Clinic Payable')}
          </Badge>
        );
      case 'REFERRAL':
        return (
          <Badge className="border-teal-200 bg-teal-100 font-medium text-teal-800 hover:bg-teal-100">
            {t('referrals', 'Referral (1 LYD)')}
          </Badge>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    if (s === 'COMPLETED' || s === 'APPROVED') {
      return (
        <Badge className="border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
          {t('completed', 'Completed')}
        </Badge>
      );
    }
    if (s === 'PENDING' || s === 'UNDER_REVIEW') {
      return (
        <Badge className="border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-50">
          {t('pending', 'Pending')}
        </Badge>
      );
    }
    if (s === 'REJECTED' || s === 'CANCELLED') {
      return (
        <Badge className="border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-50">
          {t('cancelled', 'Cancelled')}
        </Badge>
      );
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  const LEDGER_CATEGORIES = [
    { key: 'ALL', label: t('allStreams', 'All Streams'), amount: undefined },
    {
      key: 'PLATFORM_REVENUE',
      label: t('platformRevenue', 'Platform Revenue'),
      amount: ledgerSummary?.PLATFORM_REVENUE,
    },
    {
      key: 'SERVICE_FEE',
      label: t('serviceFees', 'Service Fees'),
      amount: ledgerSummary?.SERVICE_FEE,
    },
    {
      key: 'WALLET_TRANSACTION',
      label: t('walletTransactions', 'Wallet Tx'),
      amount: ledgerSummary?.WALLET_TRANSACTION,
    },
    {
      key: 'REFUND',
      label: t('refunds', 'Refunds'),
      amount: ledgerSummary?.REFUND,
    },
    {
      key: 'PREPAID_CARD',
      label: t('prepaidCardTx', 'Prepaid Cards'),
      amount: ledgerSummary?.PREPAID_CARD,
    },
    {
      key: 'ADJUSTMENT',
      label: t('adjustments', 'Adjustments'),
      amount: ledgerSummary?.ADJUSTMENT,
    },
    {
      key: 'CLINIC_PAYABLE',
      label: t('clinicPayables', 'Clinic Payables'),
      amount: ledgerSummary?.CLINIC_PAYABLE,
    },
    {
      key: 'REFERRAL',
      label: t('referrals', 'Referrals'),
      amount: ledgerSummary?.REFERRAL,
    },
  ];

  if (loading && !financials) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const capturedPatientFee = financials?.capturedFees?.patientServiceFee || 0;
  const capturedClinicFee = financials?.capturedFees?.clinicServiceFee || 0;
  const activeWallet = financials?.wallets?.totalActiveWallet || 0;
  const frozenWallet = financials?.wallets?.totalFrozenWallet || 0;
  const lydLabel = t('lyd', 'LYD');

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-6 w-6 shrink-0 text-emerald-600" />
            <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl lg:text-3xl">
              {t('platformFinancialsTitle', 'Platform Financials & Wallet Ledger')}
            </h1>
          </div>
          <p className="mt-1 max-w-3xl text-xs text-gray-500 sm:text-sm">
            {t(
              'platformFinancialsSub',
              'Section 10 Traceable Ledger: Platform Revenue, Service Fees, Wallet Liabilities, Clinic Payables, and Referrals.'
            )}
          </p>
        </div>

        <div className="flex w-full flex-wrap items-center justify-start gap-2 sm:w-auto sm:justify-end">
          <Button
            onClick={() => setShowWalletModal(true)}
            disabled={isReadOnly}
            className="gap-2 bg-emerald-600 text-xs text-white shadow-sm hover:bg-emerald-700 sm:text-sm"
          >
            <Wallet className="h-4 w-4" />
            {t('adjustWallet', 'Wallet Adjustment')}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchOverview();
              fetchLedger(ledgerPage);
            }}
            className="gap-2 text-xs sm:text-sm"
          >
            <RefreshCw className="h-4 w-4" />
            {t('refresh', 'Refresh')}
          </Button>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-emerald-900">
                {t('patientServiceFees', 'Patient Service Fees')}
              </span>
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-emerald-900">
              {capturedPatientFee.toFixed(2)} {lydLabel}
            </div>
            <p className="mt-1 text-xs text-emerald-700">
              {t('platformFeeRetained', 'Platform service fee retained')}
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">
                {t('clinicServiceFees', 'Clinic Service Fees')}
              </span>
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-blue-900">
              {capturedClinicFee.toFixed(2)} {lydLabel}
            </div>
            <p className="mt-1 text-xs text-blue-700">
              {t('percentageCommissionFees', 'Percentage commission fees')}
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-purple-900">
                {t('activeWalletLiability', 'Active Wallet Liability')}
              </span>
              <Wallet className="h-5 w-5 text-purple-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-purple-900">
              {activeWallet.toFixed(2)} {lydLabel}
            </div>
            <p className="mt-1 text-xs text-purple-700">
              {t('totalUserWalletBalances', 'Total user wallet balances')}
            </p>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-amber-900">
                {t('frozenWalletBalances', 'Frozen Wallet Balances')}
              </span>
              <CreditCard className="h-5 w-5 text-amber-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-amber-900">
              {frozenWallet.toFixed(2)} {lydLabel}
            </div>
            <p className="mt-1 text-xs text-amber-700">
              {t('heldDuringPendingAppointments', 'Held during pending appointments')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Section 10 Information Policy Note */}
      <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50/70 p-4 text-sm text-blue-900">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
        <div className="space-y-1">
          <p className="font-semibold text-blue-950">
            {t(
              'policyNoteTitle',
              'Section 10 Policy: Segregated Financial Streams & Priority 3 Doctor Payables'
            )}
          </p>
          <div className="space-y-0.5 text-xs leading-relaxed text-blue-800">
            <p>
              •{' '}
              {t(
                'policyNoteClinic',
                'Clinic Payables: For clinic-based appointments, payouts are made directly to the clinic entity.'
              )}
            </p>
            <p>
              •{' '}
              {t(
                'policyNoteDoctor',
                'Doctor Payables: Exclusively preserved for platform-supervised services such as Remote Consultations (Phase 2), not general appointments.'
              )}
            </p>
            <p>
              •{' '}
              {t(
                'policyNoteReferral',
                'Referrals: Preserved 1 LYD bonus credited to both referrer and referred user upon qualifying booking.'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Section 10 Dedicated Traceable Financial Ledger */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="border-b pb-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 shrink-0 text-indigo-600" />
                <CardTitle className="text-base font-bold text-gray-900 sm:text-lg">
                  {t('traceableFinancialLedger', 'Section 10 — Traceable Financial Ledger')}
                </CardTitle>
              </div>
              <CardDescription className="mt-1 text-xs sm:text-sm">
                {t(
                  'traceableLedgerDesc',
                  'Unified audit ledger traceable by Transaction ID, Booking ID, User, Clinic, Doctor, Amount, Type, Status, Date, and Reference.'
                )}
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                disabled={exporting}
                className="gap-2 border-gray-300 text-xs text-gray-700 hover:bg-gray-50 sm:text-sm"
              >
                <Download className="h-4 w-4 text-gray-600" />
                {t('exportExcel', 'Export Excel')}
              </Button>
            </div>
          </div>

          {/* Category Tabs / Filter Pills with horizontal scroll on mobile */}
          <div className="scrollbar-none flex touch-pan-x items-center gap-2 overflow-x-auto pb-1 pt-3">
            {LEDGER_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{cat.label}</span>
                  {cat.amount !== undefined && (
                    <span
                      className={`py-0.2 rounded-full px-1.5 text-[10px] ${
                        isSelected ? 'bg-blue-800 text-blue-100' : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      {cat.amount.toFixed(0)} {lydLabel}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search & Date Filters Bar */}
          <div className="pt-3">
            <form
              onSubmit={handleSearchSubmit}
              className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 md:grid-cols-4"
            >
              <div className="sm:col-span-2">
                <Label htmlFor="ledger-search" className="text-xs font-medium text-gray-600">
                  {t('searchFilter', 'Search Filter')}
                </Label>
                <div className="relative mt-1">
                  <Search className="pointer-events-none absolute start-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    id="ledger-search"
                    placeholder={t(
                      'ledgerSearchPlaceholder',
                      'Search Transaction ID, Booking #, User, Clinic, Doctor, Note...'
                    )}
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pe-8 ps-9 text-xs sm:text-sm"
                  />
                  {searchInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchInput('');
                        setSearchTerm('');
                      }}
                      className="absolute end-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="start-date" className="text-xs font-medium text-gray-600">
                  {t('fromDate', 'From Date')}
                </Label>
                <div className="relative mt-1">
                  <Calendar className="pointer-events-none absolute start-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="ps-9 text-xs"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="end-date" className="text-xs font-medium text-gray-600">
                  {t('toDate', 'To Date')}
                </Label>
                <div className="relative mt-1">
                  <Calendar className="pointer-events-none absolute start-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="ps-9 text-xs"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 pt-1 sm:col-span-2 md:col-span-4">
                {(searchInput ||
                  searchTerm ||
                  startDate ||
                  endDate ||
                  selectedCategory !== 'ALL') && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="text-xs text-gray-500 hover:text-gray-800"
                  >
                    {t('clearAllFilters', 'Clear All Filters')}
                  </Button>
                )}
                <Button
                  type="submit"
                  size="sm"
                  className="gap-1.5 bg-blue-600 text-xs text-white sm:text-sm"
                >
                  <Search className="h-3.5 w-3.5" />
                  {t('applyFilters', 'Apply Filters')}
                </Button>
              </div>
            </form>
          </div>
        </CardHeader>

        {/* Ledger Table with Mobile-Safe Scroll */}
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <Table className="min-w-[1050px]">
              <TableHeader className="bg-gray-50/80">
                <TableRow>
                  <TableHead className="w-[120px] text-start font-semibold text-gray-900">
                    {t('transactionId', 'Transaction ID')}
                  </TableHead>
                  <TableHead className="text-start font-semibold text-gray-900">
                    {t('bookingId', 'Booking ID')}
                  </TableHead>
                  <TableHead className="text-start font-semibold text-gray-900">
                    {t('userParty', 'User / Party')}
                  </TableHead>
                  <TableHead className="text-start font-semibold text-gray-900">
                    {t('clinic', 'Clinic')}
                  </TableHead>
                  <TableHead className="text-start font-semibold text-gray-900">
                    {t('doctor', 'Doctor')}
                  </TableHead>
                  <TableHead className="text-end font-semibold text-gray-900">
                    {t('amount', 'Amount')} ({lydLabel})
                  </TableHead>
                  <TableHead className="text-start font-semibold text-gray-900">
                    {t('typeCategory', 'Type / Category')}
                  </TableHead>
                  <TableHead className="text-start font-semibold text-gray-900">
                    {t('status', 'Status')}
                  </TableHead>
                  <TableHead className="text-start font-semibold text-gray-900">
                    {t('date', 'Date')}
                  </TableHead>
                  <TableHead className="min-w-[180px] text-start font-semibold text-gray-900">
                    {t('reference', 'Reference')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledgerLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="py-12 text-center">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
                      <p className="mt-2 text-xs text-gray-500">
                        {t('loadingLedger', 'Loading traceable ledger entries...')}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : ledgerEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="py-12 text-center text-gray-500">
                      <Receipt className="mx-auto h-8 w-8 text-gray-300" />
                      <p className="mt-2 text-sm font-medium text-gray-700">
                        {t('noTransactionsFound', 'No transactions found')}
                      </p>
                      <p className="text-xs text-gray-400">
                        {t(
                          'noTransactionsFoundDesc',
                          'Try adjusting your category, search keywords, or date range.'
                        )}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  ledgerEntries.map((entry) => (
                    <TableRow key={entry.id} className="transition-colors hover:bg-gray-50/70">
                      {/* 1. Transaction ID */}
                      <TableCell className="text-start font-mono text-xs font-semibold text-blue-700">
                        {entry.transactionId}
                      </TableCell>

                      {/* 2. Booking ID */}
                      <TableCell className="text-start text-xs">
                        {entry.bookingNumber ? (
                          <Badge variant="outline" className="bg-white font-mono text-gray-800">
                            #{entry.bookingNumber}
                          </Badge>
                        ) : entry.bookingId ? (
                          <span className="font-mono text-gray-600">
                            {entry.bookingId.slice(-6)}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </TableCell>

                      {/* 3. User */}
                      <TableCell className="text-start text-xs">
                        <div className="font-medium text-gray-900">{entry.userName}</div>
                        <div className="text-[11px] text-gray-500">
                          {entry.userPhone !== '—' ? entry.userPhone : entry.userRole}
                        </div>
                      </TableCell>

                      {/* 4. Clinic */}
                      <TableCell className="text-start text-xs">
                        {entry.clinicName ? (
                          <div className="flex items-center gap-1.5 font-medium text-gray-800">
                            <Building2 className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                            <span className="max-w-[140px] truncate">{entry.clinicName}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </TableCell>

                      {/* 5. Doctor */}
                      <TableCell className="text-start text-xs">
                        {entry.doctorName ? (
                          <div className="flex items-center gap-1.5 text-gray-700">
                            <Stethoscope className="h-3.5 w-3.5 shrink-0 text-blue-400" />
                            <span className="max-w-[130px] truncate">{entry.doctorName}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </TableCell>

                      {/* 6. Amount */}
                      <TableCell className="text-end text-xs font-bold">
                        <span
                          className={
                            entry.type === 'PLATFORM_REVENUE' || entry.type === 'SERVICE_FEE'
                              ? 'text-emerald-700'
                              : entry.type === 'REFUND'
                                ? 'text-rose-600'
                                : 'text-gray-900'
                          }
                        >
                          {entry.amount.toFixed(2)} {lydLabel}
                        </span>
                      </TableCell>

                      {/* 7. Type */}
                      <TableCell className="text-start text-xs">
                        {getTypeBadge(entry.type)}
                      </TableCell>

                      {/* 8. Status */}
                      <TableCell className="text-start text-xs">
                        {getStatusBadge(entry.status)}
                      </TableCell>

                      {/* 9. Date */}
                      <TableCell className="whitespace-nowrap text-start text-xs text-gray-500">
                        {formatDate(entry.date)}
                      </TableCell>

                      {/* 10. Reference */}
                      <TableCell className="max-w-[220px] text-start text-xs text-gray-600">
                        <span className="line-clamp-2" title={entry.reference || ''}>
                          {entry.reference || '—'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <RowsPerPage value={ledgerPageSize} onChange={setLedgerPageSize} />
          {/* Pagination Controls - Mobile Responsive Wrap */}
          <div className="flex flex-col items-center justify-between gap-3 border-t bg-gray-50/50 px-4 py-3 sm:flex-row">
            <div className="text-center text-xs text-gray-500 sm:text-start">
              {t('showing', 'Showing')}{' '}
              <span className="font-semibold text-gray-700">
                {ledgerTotalCount === 0 ? 0 : (ledgerPage - 1) * ledgerPageSize + 1}
              </span>{' '}
              {t('to', 'to')}{' '}
              <span className="font-semibold text-gray-700">
                {Math.min(ledgerPage * ledgerPageSize, ledgerTotalCount)}
              </span>{' '}
              {t('of', 'of')}{' '}
              <span className="font-semibold text-gray-700">{ledgerTotalCount}</span>{' '}
              {t('transactions', 'transactions')}
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={ledgerPage <= 1 || ledgerLoading}
                onClick={() => fetchLedger(ledgerPage - 1)}
                className="h-8 gap-1 px-2.5 text-xs"
              >
                <ChevronLeft className="h-3.5 w-3.5 rtl:rotate-180" />
                {t('previous', 'Previous')}
              </Button>
              <span className="whitespace-nowrap px-2 text-xs font-medium text-gray-600">
                {t('pageOf', 'Page')} {ledgerPage} {t('of', 'of')} {ledgerTotalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={ledgerPage >= ledgerTotalPages || ledgerLoading}
                onClick={() => fetchLedger(ledgerPage + 1)}
                className="h-8 gap-1 px-2.5 text-xs"
              >
                {t('next', 'Next')}
                <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Country Platform Service Fees */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 shrink-0 text-blue-600" />
            <CardTitle className="text-base font-semibold">
              {t('countryPatientFees', 'Country-Specific Patient Service Fees')}
            </CardTitle>
          </div>
          <CardDescription className="text-xs sm:text-sm">
            {t(
              'countryFeesDesc',
              'Fixed booking service fee charged to patients per country tier (in LYD).'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveCountryFees} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {['LIBYA', 'TUNISIA', 'EGYPT', 'ALGERIA'].map((country) => (
                <div key={country} className="rounded-lg border bg-gray-50/60 p-3.5">
                  <Label htmlFor={`fee-${country}`} className="font-semibold text-gray-800">
                    {t(country.toLowerCase(), country)}
                  </Label>
                  <div className="relative mt-2">
                    <Input
                      id={`fee-${country}`}
                      type="number"
                      step="0.01"
                      min="0"
                      value={countryFees[country] ?? ''}
                      onChange={(e) =>
                        setCountryFees({
                          ...countryFees,
                          [country]: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="pe-12 text-sm"
                      disabled={isReadOnly}
                      required
                    />
                    <span className="absolute end-3 top-2.5 text-xs font-medium text-gray-400">
                      {lydLabel}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={feeLoading || isReadOnly}
                className="bg-blue-600 text-xs text-white sm:text-sm"
              >
                {feeLoading ? t('saving', 'Saving...') : t('saveFees', 'Save Platform Fees')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Provider Settlements Status Breakdown */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 shrink-0 text-emerald-600" />
            <CardTitle className="text-base font-semibold">
              {t('settlementsStatusBreakdown', 'Settlements Status Breakdown')}
            </CardTitle>
          </div>
          <CardDescription className="text-xs sm:text-sm">
            {t('settlementsDesc', 'Current state of provider payout liabilities.')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {financials?.settlementsSummary?.map((item) => (
              <div
                key={item.status}
                className="flex items-center justify-between rounded-lg border bg-gray-50 p-4"
              >
                <div>
                  <span className="text-xs font-bold uppercase text-gray-500">{item.status}</span>
                  <div className="mt-1 text-lg font-bold text-gray-900">
                    {(item._sum?.amount || 0).toFixed(2)} {lydLabel}
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {item._count?.id || 0} {t('records', 'Records')}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Wallet Adjustment Dialog */}
      <Dialog open={showWalletModal} onOpenChange={setShowWalletModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 shrink-0 text-emerald-600" />
              {t('manualWalletAdjustment', 'Administrative Wallet Adjustment')}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              {t(
                'walletAdjustmentDesc',
                "Directly credit or debit a user's wallet with mandatory audit trail logging."
              )}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleWalletAdjustment} className="space-y-4 py-2">
            <div>
              <Label htmlFor="targetUserId">
                {t('targetUserId', 'User ID (or Patient / Clinic / Doctor ID)')}
              </Label>
              <Input
                id="targetUserId"
                placeholder="e.g. cly409..."
                value={walletTargetUserId}
                onChange={(e) => setWalletTargetUserId(e.target.value)}
                required
                className="mt-1.5 text-xs sm:text-sm"
              />
            </div>

            <div>
              <Label htmlFor="adjustAmount">{t('adjustAmount', 'Adjustment Amount (LYD)')}</Label>
              <Input
                id="adjustAmount"
                type="number"
                step="0.01"
                placeholder="e.g. 50 to add, or -20 to deduct"
                value={walletAmount}
                onChange={(e) => setWalletAmount(e.target.value)}
                required
                className="mt-1.5 text-xs sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                {t('adjustAmountHint', 'Positive value credits the wallet; negative value debits.')}
              </p>
            </div>

            <DialogFooter className="flex flex-col gap-2 pt-2 sm:flex-row">
              <Button type="button" variant="outline" onClick={() => setShowWalletModal(false)}>
                {t('cancel', 'Cancel')}
              </Button>
              <Button type="submit" disabled={walletLoading} className="bg-emerald-600 text-white">
                {walletLoading
                  ? t('processing', 'Processing...')
                  : t('execute', 'Execute Adjustment')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
