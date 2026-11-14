'use client';
import { recordStatusLabel } from '@/lib/record-status';
import { RowsPerPage } from '@/components/rows-per-page';
import { exportPages, downloadExcel } from '@/lib/export-pages';

import { useEffect, useState, useCallback, useRef } from 'react';
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
import { phaseOne } from '@/services/phase-one.service';
import {
  Wallet,
  DollarSign,
  TrendingUp,
  CreditCard,
  RefreshCw,
  Building2,
  Receipt,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
  X,
  Stethoscope,
  Copy,
  Check,
} from 'lucide-react';

export default function PlatformFinancialsPage() {
  const { t, language } = useLanguage();
  const adminTier = useAuthStore((state) => state.adminTier) || 'SUPER_ADMIN';
  const isReadOnly = adminTier === 'READ_ONLY';

  // Overview Data
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [financials, setFinancials] = useState<PlatformFinancialOverview | null>(null);

  // Wallet Adjustment Dialog
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletTargetUserId, setWalletTargetUserId] = useState('');
  const [accountSearch, setAccountSearch] = useState('');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [accountLoading, setAccountLoading] = useState(false);
  const accountSearchVersion = useRef(0);
  const selectedAccount = accounts.find(account => account.id === walletTargetUserId);
  const findAccounts = async () => {
    const version = ++accountSearchVersion.current;
    setAccountLoading(true);
    setAccounts([]);
    setWalletTargetUserId('');
    try {
      const results = await phaseOne.get('finance-accounts', { search: accountSearch.trim() });
      if (version === accountSearchVersion.current) setAccounts(results);
    } catch (error: any) {
      toast({
        title: t('error', 'Error'),
        description:
          error.response?.data?.message || t('accountLookupFailed', 'Account lookup failed'),
        variant: 'destructive',
      });
    } finally {
      setAccountLoading(false);
    }
  };

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
  const [copiedTx, setCopiedTx] = useState<string | null>(null);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const finRes = await adminService.getPlatformFinancialOverview();
      if (finRes.data) setFinancials(finRes.data);
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
    if (!selectedAccount || !Number.isFinite(parsedAmount)) {
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

  const formatDateTime = (isoString?: string | null) => {
    if (!isoString) return { date: '—', time: '' };
    try {
      const d = new Date(isoString);
      const date = d.toLocaleDateString(language === 'ar' ? 'ar-LY' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      const time = d.toLocaleTimeString(language === 'ar' ? 'ar-LY' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
      return { date, time };
    } catch {
      return { date: String(isoString), time: '' };
    }
  };

  const formatTxId = (rawId: string) => {
    if (!rawId) return { display: '—', full: '' };
    const str = String(rawId);
    if (str.includes(':refund:')) {
      const isCredit = str.includes('credit');
      const hash = str.replace(/[^a-zA-Z0-9]/g, '').slice(-5).toUpperCase();
      return {
        display: `TX-REF-${hash}`,
        full: str,
        tag: isCredit ? 'Credit' : 'Debit',
      };
    }
    if (str.startsWith('SET-')) {
      const short = str.replace('SET-', '').slice(-8).toUpperCase();
      return { display: `SET-${short}`, full: str };
    }
    if (str.startsWith('TX-') && str.length > 18) {
      const short = str.slice(-8).toUpperCase();
      return { display: `TX-${short}`, full: str };
    }
    return { display: str, full: str };
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'PLATFORM_REVENUE':
        return (
          <span className="inline-flex shrink-0 items-center whitespace-nowrap rounded-md border border-emerald-200/80 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
            {t('platformRevenue', 'Platform Revenue')}
          </span>
        );
      case 'SERVICE_FEE':
        return (
          <span className="inline-flex shrink-0 items-center whitespace-nowrap rounded-md border border-blue-200/80 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
            {t('serviceFees', 'Service Fee')}
          </span>
        );
      case 'WALLET_TRANSACTION':
        return (
          <span className="inline-flex shrink-0 items-center whitespace-nowrap rounded-md border border-violet-200/80 bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700">
            {t('walletTransactions', 'Wallet Tx')}
          </span>
        );
      case 'REFUND':
        return (
          <span className="inline-flex shrink-0 items-center whitespace-nowrap rounded-md border border-rose-200/80 bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700">
            {t('refunds', 'Refund')}
          </span>
        );
      case 'PREPAID_CARD':
        return (
          <span className="inline-flex shrink-0 items-center whitespace-nowrap rounded-md border border-amber-200/80 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800">
            {t('prepaidCardTx', 'Prepaid Card')}
          </span>
        );
      case 'ADJUSTMENT':
        return (
          <span className="inline-flex shrink-0 items-center whitespace-nowrap rounded-md border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
            {t('adjustments', 'Adjustment')}
          </span>
        );
      case 'CLINIC_PAYABLE':
        return (
          <span className="inline-flex shrink-0 items-center whitespace-nowrap rounded-md border border-sky-200/80 bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-700">
            {t('clinicPayables', 'Clinic Payable')}
          </span>
        );
      case 'REFERRAL':
        return (
          <span className="inline-flex shrink-0 items-center whitespace-nowrap rounded-md border border-teal-200/80 bg-teal-50 px-2.5 py-1 text-[11px] font-semibold text-teal-700">
            {t('referrals', 'Referral')}
          </span>
        );
      default:
        return (
          <span className="inline-flex shrink-0 items-center whitespace-nowrap rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] font-medium text-gray-700">
            {type}
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || '').toUpperCase();
    if (s === 'COMPLETED' || s === 'APPROVED') {
      return (
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-emerald-200/70 bg-emerald-50/90 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {t('completed', 'Completed')}
        </span>
      );
    }
    if (s === 'PENDING' || s === 'UNDER_REVIEW') {
      return (
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-amber-200/70 bg-amber-50/90 px-2.5 py-0.5 text-[11px] font-medium text-amber-700">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
          {t('pending', 'Pending')}
        </span>
      );
    }
    if (s === 'REJECTED' || s === 'CANCELLED') {
      return (
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-rose-200/70 bg-rose-50/90 px-2.5 py-0.5 text-[11px] font-medium text-rose-700">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
          {t('cancelled', 'Cancelled')}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-[11px] font-medium text-gray-700">
        {status}
      </span>
    );
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
              'Comprehensive platform financial audit: Platform Revenue, Service Fees, Wallet Liabilities, Clinic Settlements, and Referrals.'
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


      {/* Financial Audit & Transaction Ledger */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="space-y-4 border-b pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <Receipt className="h-4 w-4 shrink-0" />
                </div>
                <CardTitle className="text-base font-bold text-gray-900 sm:text-lg">
                  {t('traceableFinancialLedger', 'Financial Audit & Transaction Ledger')}
                </CardTitle>
                <Badge
                  variant="outline"
                  className="border-indigo-200 bg-indigo-50/70 text-[11px] font-semibold text-indigo-700"
                >
                  {t('auditTrail', 'Live Audit Trail')}
                </Badge>
              </div>
              <CardDescription className="mt-1 text-xs sm:text-sm">
                {t(
                  'traceableLedgerDesc',
                  'Unified audit ledger traceable by Transaction ID, Phone #, Booking ID, User, Clinic, Doctor, Amount, Type, and Reference.'
                )}
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                disabled={exporting}
                className="gap-2 border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50 sm:text-sm"
              >
                <Download className="h-4 w-4 text-gray-600" />
                {t('exportExcel', 'Export Excel')}
              </Button>
            </div>
          </div>

          {/* Category Tabs / Filter Pills with horizontal scroll on mobile */}
          <div className="scrollbar-none flex touch-pan-x items-center gap-2 overflow-x-auto py-1">
            {LEDGER_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-600'
                      : 'border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span>{cat.label}</span>
                  {cat.amount !== undefined && (
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                        isSelected
                          ? 'bg-blue-700/80 text-white'
                          : 'border border-gray-200/60 bg-gray-100 text-gray-600'
                      }`}
                    >
                      {cat.amount.toFixed(0)} {lydLabel}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search & Date Filters Bar - Sleek unified toolbar */}
          <div className="rounded-xl border border-gray-200/90 bg-gray-50/70 p-3">
            <form
              onSubmit={handleSearchSubmit}
              className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-12"
            >
              <div className="lg:col-span-5">
                <Label htmlFor="ledger-search" className="text-xs font-medium text-gray-600">
                  {t('searchFilter', 'Search Filter')}
                </Label>
                <div className="relative mt-1">
                  <Search className="pointer-events-none absolute start-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    id="ledger-search"
                    placeholder={t(
                      'ledgerSearchPlaceholder',
                      'Search by Transaction ID, Phone #, Booking #, Clinic, Doctor...'
                    )}
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="border-gray-200 bg-white pe-8 ps-9 text-xs sm:text-sm"
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

              <div className="lg:col-span-2">
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
                    className="border-gray-200 bg-white ps-9 text-xs"
                  />
                </div>
              </div>

              <div className="lg:col-span-2">
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
                    className="border-gray-200 bg-white ps-9 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 lg:col-span-3">
                <Button
                  type="submit"
                  size="sm"
                  className="h-9 flex-1 gap-1.5 bg-blue-600 text-xs font-medium text-white shadow-sm hover:bg-blue-700 sm:text-sm"
                >
                  <Search className="h-3.5 w-3.5" />
                  {t('applyFilters', 'Apply Filters')}
                </Button>
                {(searchInput ||
                  searchTerm ||
                  startDate ||
                  endDate ||
                  selectedCategory !== 'ALL') && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleClearFilters}
                    className="h-9 border-gray-300 bg-white text-xs font-medium text-gray-600 hover:bg-gray-100"
                  >
                    {t('clearAllFilters', 'Clear')}
                  </Button>
                )}
              </div>
            </form>
          </div>
        </CardHeader>

        {/* Ledger Table with Mobile-Safe Scroll */}
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <Table className="min-w-[1000px]">
              <TableHeader className="bg-gray-50/90">
                <TableRow className="border-b border-gray-200/80">
                  <TableHead className="w-[155px] text-start text-xs font-semibold uppercase tracking-wider text-gray-600">
                    {t('transactionId', 'Transaction ID')}
                  </TableHead>
                  <TableHead className="w-[85px] text-start text-xs font-semibold uppercase tracking-wider text-gray-600">
                    {t('bookingId', 'Booking')}
                  </TableHead>
                  <TableHead className="min-w-[150px] text-start text-xs font-semibold uppercase tracking-wider text-gray-600">
                    {t('userParty', 'User / Account')}
                  </TableHead>
                  <TableHead className="min-w-[170px] text-start text-xs font-semibold uppercase tracking-wider text-gray-600">
                    {t('providerClinic', 'Provider (Clinic / Doctor)')}
                  </TableHead>
                  <TableHead className="w-[125px] text-end text-xs font-semibold uppercase tracking-wider text-gray-600">
                    {t('amount', 'Amount')} ({lydLabel})
                  </TableHead>
                  <TableHead className="w-[130px] text-start text-xs font-semibold uppercase tracking-wider text-gray-600">
                    {t('typeCategory', 'Category')}
                  </TableHead>
                  <TableHead className="w-[115px] text-start text-xs font-semibold uppercase tracking-wider text-gray-600">
                    {t('status', 'Status')}
                  </TableHead>
                  <TableHead className="w-[130px] text-start text-xs font-semibold uppercase tracking-wider text-gray-600">
                    {t('dateTime', 'Date & Time')}
                  </TableHead>
                  <TableHead className="min-w-[160px] text-start text-xs font-semibold uppercase tracking-wider text-gray-600">
                    {t('reference', 'Reference')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledgerLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-12 text-center">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
                      <p className="mt-2 text-xs text-gray-500">
                        {t('loadingLedger', 'Loading traceable ledger entries...')}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : ledgerEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-12 text-center text-gray-500">
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
                    <TableRow key={entry.id} className="transition-colors hover:bg-slate-50/70 border-b border-gray-100">
                      {/* 1. Transaction ID */}
                      <TableCell className="text-start text-xs py-3.5">
                        {(() => {
                          const tx = formatTxId(entry.transactionId);
                          return (
                            <div className="flex items-center gap-1.5 font-mono">
                              <span className="font-bold text-slate-800" title={tx.full}>
                                {tx.display}
                              </span>
                              {tx.tag && (
                                <span
                                  className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                                    tx.tag === 'Credit'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {tx.tag}
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  if (tx.full) {
                                    navigator.clipboard.writeText(tx.full);
                                    setCopiedTx(tx.full);
                                    setTimeout(() => setCopiedTx(null), 2000);
                                  }
                                }}
                                className="text-gray-400 hover:text-gray-700 transition-colors p-0.5 rounded"
                                title={t('copyTransactionId', 'Copy full Transaction ID')}
                              >
                                {copiedTx === tx.full ? (
                                  <Check className="h-3 w-3 text-emerald-600" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </button>
                            </div>
                          );
                        })()}
                      </TableCell>

                      {/* 2. Booking ID */}
                      <TableCell className="text-start text-xs py-3.5">
                        {entry.bookingNumber ? (
                          <span className="inline-flex items-center rounded-md border border-slate-200/80 bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold text-slate-800">
                            #{entry.bookingNumber}
                          </span>
                        ) : entry.bookingId ? (
                          <span className="font-mono text-xs text-gray-500">
                            #{entry.bookingId.slice(-6).toUpperCase()}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </TableCell>

                      {/* 3. User */}
                      <TableCell className="text-start text-xs py-3.5">
                        {(() => {
                          const isPhoneDupe =
                            entry.userName &&
                            (entry.userName === entry.userPhone || entry.userName.startsWith('+'));
                          const displayName = isPhoneDupe
                            ? entry.userRole
                              ? `${entry.userRole.charAt(0)}${entry.userRole.slice(1).toLowerCase()} User`
                              : 'User'
                            : entry.userName || 'User';
                          return (
                            <div className="space-y-0.5">
                              <div className="font-semibold text-gray-900">{displayName}</div>
                              <div className="font-mono text-[11px] text-gray-500">
                                {entry.userPhone !== '—' ? entry.userPhone : entry.userRole}
                              </div>
                            </div>
                          );
                        })()}
                      </TableCell>

                      {/* 4. Provider / Clinic & Doctor */}
                      <TableCell className="text-start text-xs py-3.5">
                        {entry.clinicName || entry.doctorName ? (
                          <div className="space-y-1">
                            {entry.clinicName && (
                              <div className="flex items-center gap-1.5 font-medium text-gray-800">
                                <Building2 className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                <span className="max-w-[150px] truncate" title={entry.clinicName}>
                                  {entry.clinicName}
                                </span>
                              </div>
                            )}
                            {entry.doctorName && (
                              <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                                <Stethoscope className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                                <span className="max-w-[150px] truncate" title={entry.doctorName}>
                                  {entry.doctorName}
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </TableCell>

                      {/* 5. Amount */}
                      <TableCell className="text-end text-xs font-mono font-bold whitespace-nowrap py-3.5">
                        {(() => {
                          const isPositive =
                            entry.type === 'PLATFORM_REVENUE' ||
                            entry.type === 'SERVICE_FEE' ||
                            entry.type === 'PREPAID_CARD';
                          const isNegative =
                            entry.type === 'REFUND' || entry.type === 'CLINIC_PAYABLE';
                          return (
                            <span
                              className={
                                isPositive
                                  ? 'text-emerald-700'
                                  : isNegative
                                  ? 'text-rose-600'
                                  : 'text-slate-900'
                              }
                            >
                              {isPositive ? '+' : isNegative ? '-' : ''}
                              {entry.amount.toFixed(2)} {lydLabel}
                            </span>
                          );
                        })()}
                      </TableCell>

                      {/* 6. Type */}
                      <TableCell className="text-start text-xs py-3.5">
                        {getTypeBadge(entry.type)}
                      </TableCell>

                      {/* 7. Status */}
                      <TableCell className="text-start text-xs py-3.5">
                        {getStatusBadge(entry.status)}
                      </TableCell>

                      {/* 8. Date */}
                      <TableCell className="whitespace-nowrap text-start text-xs py-3.5">
                        {(() => {
                          const { date, time } = formatDateTime(entry.date);
                          return (
                            <div>
                              <div className="font-medium text-slate-800">{date}</div>
                              <div className="font-mono text-[11px] text-slate-400">{time}</div>
                            </div>
                          );
                        })()}
                      </TableCell>

                      {/* 9. Reference */}
                      <TableCell className="max-w-[200px] text-start text-xs py-3.5">
                        <div className="truncate font-medium text-slate-700" title={entry.reference || ''}>
                          {entry.reference || '—'}
                        </div>
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
                key={recordStatusLabel(item.status, t)}
                className="flex items-center justify-between rounded-lg border bg-gray-50 p-4"
              >
                <div>
                  <span className="text-xs font-bold uppercase text-gray-500">{recordStatusLabel(item.status, t)}</span>
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
            <div className="space-y-2">
              <Label htmlFor="accountSearch">{t('accountPhoneSearch', 'Find account by phone or name')}</Label>
              <Input id="accountSearch" value={accountSearch} onChange={event => { accountSearchVersion.current++; setAccountSearch(event.target.value); setWalletTargetUserId(''); setAccounts([]); }} />
              <Button type="button" variant="outline" onClick={findAccounts} disabled={accountLoading || accountSearch.trim().length < 3}>{t('findAccounts', 'Find accounts')}</Button>
              <select className="w-full rounded border p-2" value={walletTargetUserId} onChange={event => setWalletTargetUserId(event.target.value)} required>
                <option value="">{t('chooseAnAccount', 'Choose an account')}</option>
                {accounts.map(account => <option key={account.id} value={account.id}>{account.fullName} ? {account.phoneNumber} ? {account.role}</option>)}
              </select>
              {selectedAccount && <p>{selectedAccount.fullName} ? {selectedAccount.phoneNumber} ? {selectedAccount.country} ? {t('walletBalance', 'Wallet balance')} {selectedAccount.wallet}</p>}
            </div>

            <div>
              <Label htmlFor="adjustAmount">{t('adjustAmount', 'Adjustment Amount (LYD)')}</Label>
              <Input
                id="adjustAmount"
                type="number"
                step="0.01"
                placeholder={t("e.g. 50 to add, or -20 to deduct", "e.g. 50 to add, or -20 to deduct")}
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
              <Button type="submit" disabled={walletLoading || !selectedAccount} className="bg-emerald-600 text-white">
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
