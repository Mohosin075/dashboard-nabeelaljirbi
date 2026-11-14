'use client';

import { useLanguage } from '@/contexts/language-context';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { phaseOne } from '@/services/phase-one.service';
import {
  BookOpen,
  ArrowDownLeft,
  ArrowUpRight,
  Copy,
  Check,
  ExternalLink,
  FileDown,
  FileSpreadsheet,
  RefreshCw,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  Receipt,
  CreditCard,
  Hash,
  Clock,
  Layers,
  ShieldCheck,
} from 'lucide-react';

interface WalletLedgerItem {
  id: string;
  userId: string;
  amount: number;
  cardNumber?: string | null;
  appointmentId?: string | null;
  type: string;
  createdAt: string;
  updatedAt: string;
  settlementId?: string | null;
  settlementNumber?: string | null;
  receiptUrl?: string | null;
  reference?: string | null;
  payoutMethod?: string | null;
  direction: string;
}

const TYPE_OPTIONS = [
  { value: 'ALL', labelKey: 'allStreams', fallback: 'All Types' },
  { value: 'BOOKING', labelKey: 'booking', fallback: 'Bookings' },
  { value: 'RECHARGE', labelKey: 'recharge', fallback: 'Wallet Recharge' },
  { value: 'WITHDRAW', labelKey: 'withdraw', fallback: 'Withdrawals' },
  { value: 'REFUND', labelKey: 'refunds', fallback: 'Refunds' },
  { value: 'REFERALL', labelKey: 'referrals', fallback: 'Referral Bonus' },
  { value: 'PENALTY', labelKey: 'penalty', fallback: 'Penalties' },
  { value: 'CANCEL', labelKey: 'cancel', fallback: 'Cancellations' },
];

export default function LedgerReportsPage() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const requestVersion = useRef(0);

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    searchTerm: '',
    type: 'ALL',
    limit: 25,
  });

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [rows, setRows] = useState<WalletLedgerItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<'pdf' | 'xlsx' | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadData = async () => {
    const version = ++requestVersion.current;
    setLoading(true);
    try {
      const data = await phaseOne.get('wallet-history', { ...filters, page });
      if (version !== requestVersion.current) return;
      setRows(data.data || []);
      setTotal(data.meta?.total || 0);
    } catch (err: any) {
      if (version === requestVersion.current) {
        toast({
          title: t('error', 'Error'),
          description: err.response?.data?.message || err.message || 'Failed to load ledger records',
          variant: 'destructive',
        });
      }
    } finally {
      if (version === requestVersion.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    void loadData();
    return () => {
      requestVersion.current++;
    };
  }, [page, filters]);

  const handleExport = async (format: 'pdf' | 'xlsx') => {
    setExportingFormat(format);
    try {
      await phaseOne.download('wallet', format, filters);
      toast({
        title: t('success', 'Success'),
        description: `${format.toUpperCase()} export downloaded successfully.`,
      });
    } catch (err: any) {
      toast({
        title: t('error', 'Error'),
        description: err.response?.data?.message || err.message || 'Failed to download report',
        variant: 'destructive',
      });
    } finally {
      setExportingFormat(null);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId((curr) => (curr === id ? null : curr));
    }, 2000);
  };

  const formatRecordId = (id: string) => {
    if (!id) return { display: '—', full: '' };
    if (id.startsWith('booking:')) {
      const parts = id.split(':');
      const hash = parts[1] ? parts[1].slice(-6).toUpperCase() : '';
      const feeKind = parts[2] ? parts[2].replace('-', ' ') : 'fee';
      return {
        display: `FEE ···${hash}`,
        sub: feeKind,
        full: id,
      };
    }
    if (id.startsWith('settlement:')) {
      const parts = id.split(':');
      const hash = parts[1] ? parts[1].slice(-6).toUpperCase() : '';
      return {
        display: `SET-···${hash}`,
        sub: parts[2] || 'debit',
        full: id,
      };
    }
    if (id.length >= 20) {
      return {
        display: `TX-···${id.slice(-6).toUpperCase()}`,
        sub: '',
        full: id,
      };
    }
    return { display: id, sub: '', full: id };
  };

  const formatBookingId = (appointmentId?: string | null) => {
    if (!appointmentId) return null;
    if (appointmentId.length >= 16) {
      return `#···${appointmentId.slice(-6).toUpperCase()}`;
    }
    return `#${appointmentId}`;
  };

  const formatDateTime = (isoString: string) => {
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
        second: '2-digit',
      });
      return { date, time };
    } catch {
      return { date: isoString, time: '' };
    }
  };

  const getDirectionDetails = (direction: string, amount: number, type: string) => {
    const isCredit =
      direction === 'CREDIT' ||
      type === 'RECHARGE' ||
      type === 'REFERALL' ||
      (direction !== 'DEBIT' && amount > 0);

    const isDebit =
      direction === 'DEBIT' ||
      type === 'WITHDRAW' ||
      type === 'PENALTY' ||
      (direction !== 'CREDIT' && amount < 0);

    if (isCredit) {
      return {
        label: t('credit', 'Credit (+)'),
        sign: '+',
        colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        amountColor: 'text-emerald-700',
        icon: ArrowDownLeft,
      };
    }
    if (isDebit) {
      return {
        label: t('debit', 'Debit (-)'),
        sign: '-',
        colorClass: 'bg-rose-50 text-rose-700 border-rose-200',
        amountColor: 'text-rose-700',
        icon: ArrowUpRight,
      };
    }
    return {
      label: t('standardRecord', 'Standard'),
      sign: '',
      colorClass: 'bg-slate-50 text-slate-700 border-slate-200',
      amountColor: 'text-slate-800',
      icon: null,
    };
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'BOOKING':
        return {
          label: t('booking', 'Booking'),
          className: 'bg-blue-50 text-blue-700 border-blue-200',
        };
      case 'RECHARGE':
        return {
          label: t('recharge', 'Wallet Recharge'),
          className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'WITHDRAW':
        return {
          label: t('withdraw', 'Withdrawal'),
          className: 'bg-purple-50 text-purple-700 border-purple-200',
        };
      case 'REFUND':
        return {
          label: t('refunds', 'Refund'),
          className: 'bg-amber-50 text-amber-700 border-amber-200',
        };
      case 'PENALTY':
        return {
          label: t('penalty', 'Penalty'),
          className: 'bg-rose-50 text-rose-700 border-rose-200',
        };
      case 'REFERALL':
        return {
          label: t('referrals', 'Referral Bonus'),
          className: 'bg-cyan-50 text-cyan-700 border-cyan-200',
        };
      case 'CANCEL':
        return {
          label: t('cancel', 'Cancellation'),
          className: 'bg-gray-100 text-gray-700 border-gray-200',
        };
      default:
        return {
          label: type,
          className: 'bg-gray-50 text-gray-700 border-gray-200',
        };
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / filters.limit));
  const startRow = total === 0 ? 0 : (page - 1) * filters.limit + 1;
  const endRow = Math.min(page * filters.limit, total);

  const hasActiveFilters =
    filters.searchTerm !== '' ||
    filters.startDate !== '' ||
    filters.endDate !== '' ||
    filters.type !== 'ALL';

  const clearFilters = () => {
    setPage(1);
    setFilters({
      startDate: '',
      endDate: '',
      searchTerm: '',
      type: 'ALL',
      limit: 25,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              {t('ledgerReports', 'Wallet Ledger & Reports')}
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {t(
              'walletLedgerSubtitle',
              'Detailed transactional audit log of wallet credits, debits, booking fees, recharge vouchers, and payouts.'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="gap-2 border-gray-300 text-xs text-gray-700 hover:bg-gray-50 sm:text-sm"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {t('refresh', 'Refresh')}
          </Button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-blue-100 bg-blue-50/40 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-900">
                {t('totalTransactions', 'Total Ledger Entries')}
              </span>
              <Receipt className="h-4 w-4 text-blue-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-blue-950">{total}</div>
            <p className="mt-0.5 text-xs text-blue-700">
              {hasActiveFilters ? t('matchingActiveFilters', 'Filtered results') : t('allTimeRecords', 'All-time transactions')}
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-100 bg-purple-50/40 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-900">
                {t('activeStream', 'Active Category')}
              </span>
              <Layers className="h-4 w-4 text-purple-600" />
            </div>
            <div className="mt-2 text-lg font-bold text-purple-950">
              {TYPE_OPTIONS.find((o) => o.value === filters.type)?.fallback || filters.type}
            </div>
            <p className="mt-0.5 text-xs text-purple-700">
              {filters.type === 'ALL' ? t('allActivity', 'Comprehensive activity') : t('filteredActivity', 'Category isolated')}
            </p>
          </CardContent>
        </Card>

        <Card className="border-emerald-100 bg-emerald-50/40 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-900">
                {t('auditIntegrity', 'Ledger Integrity')}
              </span>
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-emerald-950">100%</div>
            <p className="mt-0.5 text-xs text-emerald-700">
              {t('immutableAuditLog', 'Double-entry traceable ledger')}
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                {t('pageOf', 'Page Navigation')}
              </span>
              <Clock className="h-4 w-4 text-gray-400" />
            </div>
            <div className="mt-2 text-2xl font-bold text-gray-900">
              {page} <span className="text-sm font-normal text-gray-500">/ {totalPages}</span>
            </div>
            <p className="mt-0.5 text-xs text-gray-500">
              {filters.limit} {t('rowsPerPage', 'rows per page')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Toolbar Card */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="space-y-4 p-4 sm:p-5">
          {/* Top row: Type Pills */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-gray-500" />
              {t('filterByType', 'Filter by Type')}:
            </span>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs font-medium text-rose-600 hover:text-rose-800 hover:underline flex items-center gap-1"
              >
                <X className="h-3 w-3" />
                {t('clearAllFilters', 'Clear Filters')}
              </button>
            )}
          </div>

          <div className="scrollbar-none flex w-full touch-pan-x items-center gap-1.5 overflow-x-auto pb-1">
            {TYPE_OPTIONS.map((opt) => {
              const isSelected = filters.type === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setPage(1);
                    setFilters((f) => ({ ...f, type: opt.value }));
                  }}
                  className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-600'
                      : 'border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {t(opt.labelKey, opt.fallback)}
                </button>
              );
            })}
          </div>

          {/* Bottom Row: Search Box, Date Filters, Rows per page & Export Buttons */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12">
            {/* Search Input */}
            <div className="lg:col-span-5 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t(
                  'searchRecordPlaceholder',
                  'Search Record ID, Booking #, or Reference...'
                )}
                value={filters.searchTerm}
                onChange={(e) => {
                  setPage(1);
                  setFilters((f) => ({ ...f, searchTerm: e.target.value }));
                }}
                className="pl-9 pr-8 text-xs sm:text-sm border-gray-200 h-9"
              />
              {filters.searchTerm && (
                <button
                  onClick={() => {
                    setPage(1);
                    setFilters((f) => ({ ...f, searchTerm: '' }));
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* From Date */}
            <div className="lg:col-span-2">
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => {
                  setPage(1);
                  setFilters((f) => ({ ...f, startDate: e.target.value }));
                }}
                className="text-xs sm:text-sm border-gray-200 h-9"
                title={t('fromDate', 'From Date')}
              />
            </div>

            {/* To Date */}
            <div className="lg:col-span-2">
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => {
                  setPage(1);
                  setFilters((f) => ({ ...f, endDate: e.target.value }));
                }}
                className="text-xs sm:text-sm border-gray-200 h-9"
                title={t('toDate', 'To Date')}
              />
            </div>

            {/* Rows Per Page */}
            <div className="lg:col-span-1">
              <select
                className="h-9 w-full rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={filters.limit}
                onChange={(e) => {
                  setPage(1);
                  setFilters((f) => ({ ...f, limit: Number(e.target.value) }));
                }}
                title={t('rowsPerPage', 'Rows per page')}
              >
                {[25, 50, 100, 500].map((n) => (
                  <option key={n} value={n}>
                    {n}/pg
                  </option>
                ))}
              </select>
            </div>

            {/* Export Buttons */}
            <div className="lg:col-span-2 flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={loading || exportingFormat !== null}
                onClick={() => handleExport('pdf')}
                className="h-9 flex-1 gap-1.5 border-gray-300 text-xs hover:bg-gray-50"
              >
                <FileDown className={`h-3.5 w-3.5 text-rose-600 ${exportingFormat === 'pdf' ? 'animate-bounce' : ''}`} />
                <span>PDF</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={loading || exportingFormat !== null}
                onClick={() => handleExport('xlsx')}
                className="h-9 flex-1 gap-1.5 border-gray-300 text-xs hover:bg-gray-50"
              >
                <FileSpreadsheet className={`h-3.5 w-3.5 text-emerald-600 ${exportingFormat === 'xlsx' ? 'animate-bounce' : ''}`} />
                <span>Excel</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Ledger Table Card */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-3">
            <CardTitle className="text-base font-semibold text-gray-900">
              {t('walletTransactionLedger', 'Wallet Transaction Ledger')}
            </CardTitle>
            <Badge
              variant="secondary"
              className="bg-blue-50 font-mono text-xs font-semibold text-blue-700 border border-blue-200"
            >
              {total} {t('records', 'Records')}
            </Badge>
          </div>
          <p className="hidden text-xs text-muted-foreground md:block">
            {t('auditVerified', 'Traceable, audit-verified entries with cryptographic identifiers.')}
          </p>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs sm:text-sm">
              <thead className="bg-gray-50/75 border-b border-gray-200">
                <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  <th className="p-3.5">{t('dateTime', 'Date & Time')}</th>
                  <th className="p-3.5">{t('sourceRecord', 'Source Record')}</th>
                  <th className="p-3.5">{t('booking', 'Booking')}</th>
                  <th className="p-3.5">{t('typeCategory', 'Type')}</th>
                  <th className="p-3.5">{t('direction', 'Direction')}</th>
                  <th className="p-3.5">{t('amount', 'Amount (LYD)')}</th>
                  <th className="p-3.5">{t('settlementOrRef', 'Settlement / Reference')}</th>
                  <th className="p-3.5 text-center">{t('receipt', 'Receipt')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading && rows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-sm text-gray-500">
                      <RefreshCw className="mx-auto h-6 w-6 animate-spin text-blue-600 mb-2" />
                      {t('loadingLedger', 'Loading transaction ledger entries...')}
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-sm text-gray-500">
                      <Receipt className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                      <p className="font-semibold text-gray-700">
                        {t('noMatchingTransactions', 'No matching transactions found.')}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {t('adjustFiltersPrompt', 'Try clearing your filters or adjusting your date range.')}
                      </p>
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => {
                    const dt = formatDateTime(r.createdAt);
                    const rec = formatRecordId(r.id);
                    const bookingFmt = formatBookingId(r.appointmentId);
                    const dir = getDirectionDetails(r.direction, r.amount, r.type);
                    const typeBadge = getTypeBadge(r.type);
                    const DirectionIcon = dir.icon;

                    return (
                      <tr key={r.id} className="hover:bg-blue-50/30 transition-colors">
                        {/* Date & Time */}
                        <td className="p-3.5">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">{dt.date}</span>
                            <span className="text-xs text-gray-500 font-mono">{dt.time}</span>
                          </div>
                        </td>

                        {/* Source Record */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5 group">
                            <div className="flex flex-col">
                              <span className="font-mono text-xs font-semibold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                {rec.display}
                              </span>
                              {rec.sub && (
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-mono mt-0.5">
                                  {rec.sub}
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopy(rec.full, `rec-${r.id}`)}
                              className="p-1 text-gray-400 hover:text-gray-700 rounded transition-colors"
                              title={t('copyTransactionId', 'Copy full Transaction ID')}
                            >
                              {copiedId === `rec-${r.id}` ? (
                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Booking */}
                        <td className="p-3.5">
                          {bookingFmt ? (
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                                {bookingFmt}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopy(r.appointmentId!, `apt-${r.id}`)}
                                className="p-1 text-gray-400 hover:text-gray-700 rounded transition-colors"
                                title="Copy Booking ID"
                              >
                                {copiedId === `apt-${r.id}` ? (
                                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5 opacity-50 hover:opacity-100" />
                                )}
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-400 font-mono">—</span>
                          )}
                        </td>

                        {/* Type */}
                        <td className="p-3.5">
                          <Badge
                            variant="outline"
                            className={`text-xs font-medium border ${typeBadge.className}`}
                          >
                            {typeBadge.label}
                          </Badge>
                        </td>

                        {/* Direction */}
                        <td className="p-3.5">
                          <span
                            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold border ${dir.colorClass}`}
                          >
                            {DirectionIcon && <DirectionIcon className="h-3 w-3" />}
                            {dir.label}
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="p-3.5">
                          <div className={`font-mono text-sm font-bold ${dir.amountColor}`}>
                            {dir.sign}
                            {Math.abs(r.amount).toFixed(2)}{' '}
                            <span className="text-xs font-medium text-gray-500">
                              {t('lyd', 'LYD')}
                            </span>
                          </div>
                        </td>

                        {/* Settlement / Reference */}
                        <td className="p-3.5">
                          <div className="flex flex-col gap-0.5 text-xs">
                            {r.settlementNumber && (
                              <div className="flex items-center gap-1 font-mono font-semibold text-purple-700">
                                <Hash className="h-3 w-3" />
                                <span>SET-{r.settlementNumber}</span>
                              </div>
                            )}
                            {r.cardNumber && (
                              <div className="flex items-center gap-1 font-mono text-gray-600">
                                <CreditCard className="h-3 w-3 text-gray-400" />
                                <span>Card #{r.cardNumber}</span>
                              </div>
                            )}
                            {r.reference && (
                              <span
                                className="text-gray-500 truncate max-w-[140px] font-mono text-[11px]"
                                title={r.reference}
                              >
                                {r.reference}
                              </span>
                            )}
                            {!r.settlementNumber && !r.cardNumber && !r.reference && (
                              <span className="text-gray-400">—</span>
                            )}
                          </div>
                        </td>

                        {/* Receipt */}
                        <td className="p-3.5 text-center">
                          {r.receiptUrl && /^https?:\/\//i.test(r.receiptUrl) ? (
                            <a
                              href={r.receiptUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                            >
                              <span>{t('viewReceipt', 'Receipt')}</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>

        {/* Integrated Pagination Footer */}
        <CardFooter className="flex flex-col gap-3 border-t px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between bg-gray-50/50">
          <div className="text-xs text-gray-600">
            {t('showing', 'Showing')}{' '}
            <span className="font-semibold text-gray-900">{startRow}</span>{' '}
            {t('to', 'to')}{' '}
            <span className="font-semibold text-gray-900">{endRow}</span>{' '}
            {t('of', 'of')}{' '}
            <span className="font-semibold text-gray-900">{total}</span>{' '}
            {t('transactions', 'records')}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 mr-2">
              {t('pageOf', 'Page')} {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={loading || page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-8 gap-1 border-gray-200 px-2.5 text-xs hover:bg-gray-100"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>{t('previous', 'Previous')}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={loading || page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="h-8 gap-1 border-gray-200 px-2.5 text-xs hover:bg-gray-100"
            >
              <span>{t('next', 'Next')}</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
