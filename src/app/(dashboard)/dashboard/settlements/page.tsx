'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { RowsPerPage } from '@/components/rows-per-page';
import { phaseOne } from '@/services/phase-one.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/language-context';
import { useAuthStore } from '@/stores/auth-store';
import { adminService, Settlement } from '@/services/admin.service';
import {
  DollarSign,
  Search,
  CheckCircle2,
  Clock,
  ExternalLink,
  RefreshCw,
  Receipt,
  XCircle,
  TrendingUp,
  Copy,
  Check,
  Plus,
  Calendar,
  FileText,
  Download,
  Building2,
  Stethoscope,
  X,
} from 'lucide-react';

const defaultStatusCfg = {
  label: 'Pending',
  color: 'border-amber-200/80 bg-amber-50 text-amber-700',
  dot: 'bg-amber-500 animate-pulse',
  icon: Clock,
};

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string; icon: any }> = {
  PENDING: defaultStatusCfg,
  UNDER_REVIEW: {
    label: 'Under Review',
    color: 'border-blue-200/80 bg-blue-50 text-blue-700',
    dot: 'bg-blue-500 animate-pulse',
    icon: Clock,
  },
  APPROVED: {
    label: 'Approved',
    color: 'border-purple-200/80 bg-purple-50 text-purple-700',
    dot: 'bg-purple-500',
    icon: CheckCircle2,
  },
  COMPLETED: {
    label: 'Completed',
    color: 'border-emerald-200/80 bg-emerald-50 text-emerald-700',
    dot: 'bg-emerald-500',
    icon: CheckCircle2,
  },
  REJECTED: {
    label: 'Rejected',
    color: 'border-rose-200/80 bg-rose-50 text-rose-700',
    dot: 'bg-rose-500',
    icon: XCircle,
  },
};

export default function SettlementsPage() {
  const { t } = useLanguage();
  const role = useAuthStore((state) => state.role);
  const adminTier = useAuthStore((state) => state.adminTier) || 'SUPER_ADMIN';
  const isReadOnly = adminTier === 'READ_ONLY';

  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [startDate, setStartDate] = useState(''),
    [endDate, setEndDate] = useState(''),
    [activeSearch, setActiveSearch] = useState('');
  const [exporting, setExporting] = useState(false);
  const filters = {
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    searchTerm: activeSearch,
    startDate,
    endDate,
  };
  const exportPayouts = async (format: string) => {
    setExporting(true);
    try {
      await phaseOne.download('payouts', format, filters);
    } catch (error: any) {
      toast({
        title: 'Export failed',
        description: error.response?.data?.message || error.message,
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const formatSettlementId = (num: string) => {
    if (!num) return { display: '—', full: '' };
    if (num.startsWith('SET-') && num.length > 16) {
      const short = num.replace('SET-', '').slice(-8).toUpperCase();
      return { display: `SET-${short}`, full: num };
    }
    return { display: num, full: num };
  };
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [parties, setParties] = useState<{ id: string; name: string }[]>([]);
  const [partySearch, setPartySearch] = useState('');
  const [partyType, setPartyType] = useState<'CLINIC' | 'DOCTOR'>('CLINIC');
  const [targetId, setTargetId] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('BANK');
  useEffect(() => {
    if (!showCreate) return;
    let cancelled = false;
    setTargetId('');
    setParties([]);
    const timer = setTimeout(async () => {
      try {
        const response =
          partyType === 'CLINIC'
            ? await adminService.getClinics({ search: partySearch, limit: 100 })
            : await adminService.getDoctors({ search: partySearch, limit: 100 });
        if (!cancelled)
          setParties(
            response.data.data.map((party: any) => ({
              id: partyType === 'CLINIC' ? party.clinicId || party.id : party.doctorId || party.id,
              name: party.clinicName || party.fullName || party.phoneNumber,
            }))
          );
      } catch (error: any) {
        if (!cancelled)
          toast({
            title: t('error', 'Error'),
            description: error.response?.data?.message || 'Unable to load recipients',
            variant: 'destructive',
          });
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [showCreate, partySearch, partyType]);
  const createDirectSettlement = async () => {
    try {
      setCreating(true);
      await adminService.createSettlement({
        partyType,
        ...(partyType === 'CLINIC' ? { clinicId: targetId } : { doctorId: targetId }),
        amount: Number(newAmount),
        notes: newNotes,
        payoutMethod,
      });
      setShowCreate(false);
      setNewAmount('');
      setNewNotes('');
      await fetchSettlements();
      toast({
        title: t('success', 'Success'),
        description: t(
          'directSettlementCreated',
          'Direct settlement created. Review and approve it before recording payment.'
        ),
      });
    } catch (error: any) {
      toast({
        title: t('error', 'Error'),
        description: error.response?.data?.message || 'Unable to create settlement',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  // Process Settlement Dialog
  const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null);
  const [showProcessDialog, setShowProcessDialog] = useState(false);
  const [processLoading, setProcessLoading] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [processForm, setProcessForm] = useState({
    status: 'APPROVED',
    reference: '',
    receiptUrl: '',
    notes: '',
  });

  useEffect(() => {
    fetchSettlements();
  }, [statusFilter, page, pageSize, startDate, endDate, activeSearch]);

  const fetchSettlements = async () => {
    try {
      setLoading(true);
      const params: any = { ...filters, page, limit: pageSize };
      if (statusFilter !== 'ALL') params.status = statusFilter;

      const res = await adminService.getSettlements(params);
      const items = res.data.data || [];
      const total = res.data.meta?.total || items.length;
      setSettlements(items);
      setTotalCount(total);
      setTotalPages(Math.max(1, Math.ceil(total / pageSize)));
    } catch (err: any) {
      toast({
        title: t('error', 'Error'),
        description: err.response?.data?.message || 'Failed to fetch settlements',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenProcess = (item: Settlement) => {
    setSelectedSettlement(item);
    setReceiptFile(null);
    setProcessForm({
      status: item.status === 'PENDING' ? 'APPROVED' : item.status,
      reference: item.reference || '',
      receiptUrl: item.receiptKey || item.receiptUrl || '',
      notes: item.notes || '',
    });
    setShowProcessDialog(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedSettlement) return;
    try {
      setProcessLoading(true);
      let receiptUrl = processForm.receiptUrl;
      if (receiptFile) {
        const form = new FormData();
        form.append('file', receiptFile);
        const response = await apiClient.post('/upload-video/settlement-receipt/' + selectedSettlement.id, form, { headers: { 'Content-Type': 'multipart/form-data' } });
        receiptUrl = response.data.data;
        setProcessForm(current => ({ ...current, receiptUrl }));
        setReceiptFile(null);
      }
      await adminService.updateSettlementStatus(selectedSettlement.id, { ...processForm, receiptUrl });
      toast({
        title: t('success', 'Success'),
        description: `Settlement ${selectedSettlement.settlementNumber} updated to ${processForm.status}`,
      });
      setShowProcessDialog(false);
      setSelectedSettlement(null);
      fetchSettlements();
    } catch (err: any) {
      toast({
        title: t('error', 'Error'),
        description: err.response?.data?.message || 'Failed to update settlement status',
        variant: 'destructive',
      });
    } finally {
      setProcessLoading(false);
    }
  };

  // KPI Calculations
  const pendingCount = settlements.filter((s) => s.status === 'PENDING').length;
  const approvedCount = settlements.filter((s) => s.status === 'APPROVED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-emerald-600" />
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              {t('settlementsTitle', 'Clinic & Provider Settlements')}
            </h1>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {t(
              'settlementsSub',
              'Lifecycle: Settlement Request -> Review/Approval Processing -> Completed with reference and payout receipt.'
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {role === 'ADMIN' && !isReadOnly && (
            <Button
              onClick={() => setShowCreate(true)}
              className="gap-2 bg-emerald-600 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 sm:text-sm"
            >
              <Plus className="h-4 w-4" />
              {t('directSettlement', 'Direct Settlement')}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSettlements}
            className="gap-2 border-gray-300 text-xs text-gray-700 hover:bg-gray-50 sm:text-sm"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {t('refresh', 'Refresh')}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-amber-200 bg-amber-50/50 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-amber-900">
                {t('pendingRequests', 'Pending Requests')}
              </span>
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-amber-900">{pendingCount}</div>
            <p className="mt-1 text-xs text-amber-700">
              {t('pendingRequestsSub', 'Awaiting finance authorization')}
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50/50 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-purple-900">
                {t('approvedForPayout', 'Approved for Payout')}
              </span>
              <CheckCircle2 className="h-5 w-5 text-purple-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-purple-900">{approvedCount}</div>
            <p className="mt-1 text-xs text-purple-700">
              {t('approvedForPayoutSub', 'Authorized for bank disbursement')}
            </p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50/50 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-emerald-900">
                {t('completedPayouts', 'Completed Payouts')}
              </span>
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-emerald-900">
              {settlements.filter((s) => s.status === 'COMPLETED').length}
            </div>
            <p className="mt-1 text-xs text-emerald-700">
              {t('completedPayoutsSub', 'Disbursed with proof of receipt')}
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">
                {t('totalSettlements', 'Total Records')}
              </span>
              <Receipt className="h-5 w-5 text-gray-400" />
            </div>
            <div className="mt-2 text-2xl font-bold text-gray-900">{totalCount || settlements.length}</div>
            <p className="mt-1 text-xs text-gray-500">
              {t('totalSettlementsSub', 'Total settlement requests')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs & Search Card */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="space-y-3 p-4">
          {/* Top row: Status pills + Search box */}
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <div className="scrollbar-none flex w-full touch-pan-x items-center gap-1.5 overflow-x-auto sm:w-auto">
              {['ALL', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'COMPLETED', 'REJECTED'].map((st) => {
                const isSelected = statusFilter === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      setStatusFilter(st);
                      setPage(1);
                    }}
                    className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-600'
                        : 'border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span>{st === 'ALL' ? t('all', 'All') : STATUS_CONFIG[st]?.label || st}</span>
                  </button>
                );
              })}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute start-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t('searchNamePhoneRef', 'Search name, phone, or reference...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setPage(1);
                    setActiveSearch(searchTerm.trim());
                  }
                }}
                className="border-gray-200 bg-white pe-8 ps-9 text-xs sm:text-sm"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setActiveSearch('');
                    setPage(1);
                  }}
                  className="absolute end-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Bottom row: Dates, Rows per page & Export buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Calendar className="pointer-events-none absolute start-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPage(1);
                  }}
                  className="h-8 border-gray-200 bg-white ps-8 text-xs w-[130px]"
                />
              </div>
              <span className="text-xs text-gray-400">→</span>
              <div className="relative">
                <Calendar className="pointer-events-none absolute start-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPage(1);
                  }}
                  className="h-8 border-gray-200 bg-white ps-8 text-xs w-[130px]"
                />
              </div>
              <RowsPerPage
                value={pageSize}
                onChange={(size) => {
                  setPageSize(size);
                  setPage(1);
                }}
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setActiveSearch(searchTerm.trim());
                  setPage(1);
                }}
                className="h-8 gap-1.5 border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-100"
              >
                <Search className="h-3 w-3" />
                {t('apply', 'Apply')}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={loading || exporting}
                onClick={() => exportPayouts('pdf')}
                className="h-8 gap-1.5 border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                <FileText className="h-3.5 w-3.5 text-rose-600" />
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={loading || exporting}
                onClick={() => exportPayouts('xlsx')}
                className="h-8 gap-1.5 border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                <Download className="h-3.5 w-3.5 text-emerald-600" />
                Excel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settlements Table Card */}
      <Card className="border-gray-200 shadow-sm overflow-hidden">
        <CardHeader className="border-b bg-gray-50/60 px-6 py-3.5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-gray-900">
              {t('settlementRequests', 'Settlement Records')}
            </CardTitle>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
              {totalCount || settlements.length}
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            </div>
          ) : settlements.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              <Receipt className="mx-auto mb-2 h-12 w-12 text-gray-300" />
              <p className="font-semibold text-gray-700">{t('noSettlements', 'No settlement records found')}</p>
              <p className="mt-1 text-xs text-gray-400">
                {t('noSettlementsDesc', 'Try adjusting your status filter, search keywords, or date range.')}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm rtl:text-right">
                <thead className="border-b bg-gray-50/90 text-xs uppercase tracking-wider text-gray-600">
                  <tr>
                    <th className="px-5 py-3 font-semibold">{t('settlementNum', 'Settlement #')}</th>
                    <th className="px-5 py-3 font-semibold">{t('provider', 'Party / Provider')}</th>
                    <th className="px-5 py-3 font-semibold">{t('amount', 'Amount')}</th>
                    <th className="px-5 py-3 font-semibold">{t('status', 'Status')}</th>
                    <th className="px-5 py-3 font-semibold">
                      {t('relatedTransactions', 'Stage / Lifecycle')}
                    </th>
                    <th className="px-5 py-3 font-semibold">{t('date', 'Timeline Dates')}</th>
                    <th className="px-5 py-3 font-semibold">{t('reference', 'Ref / Receipt')}</th>
                    <th className="px-5 py-3 text-end font-semibold">{t('actions', 'Action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {settlements.map((item) => {
                    const cfg = STATUS_CONFIG[item.status] || defaultStatusCfg;
                    const partyName =
                      item.clinic?.clinicName ||
                      item.doctor?.user?.fullName ||
                      'Healthcare Provider';
                    const tx = formatSettlementId(item.settlementNumber);
                    const isClinic = item.partyType === 'CLINIC';

                    return (
                      <tr key={item.id} className="transition-colors hover:bg-slate-50/70">
                        {/* 1. Settlement Number */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5 font-mono">
                            <span className="font-bold text-slate-800" title={tx.full}>
                              {tx.display}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                if (tx.full) {
                                  navigator.clipboard.writeText(tx.full);
                                  setCopiedId(tx.full);
                                  setTimeout(() => setCopiedId(null), 2000);
                                }
                              }}
                              className="rounded p-0.5 text-gray-400 transition-colors hover:text-gray-700"
                              title={t('copySettlementId', 'Copy full Settlement ID')}
                            >
                              {copiedId === tx.full ? (
                                <Check className="h-3 w-3 text-emerald-600" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* 2. Provider */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            {isClinic ? (
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                                <Building2 className="h-3.5 w-3.5" />
                              </div>
                            ) : (
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                <Stethoscope className="h-3.5 w-3.5" />
                              </div>
                            )}
                            <div>
                              <div className="font-semibold text-gray-900">{partyName}</div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                {item.partyType?.toLowerCase()}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 3. Amount */}
                        <td className="px-5 py-3.5 font-mono text-sm font-bold text-gray-900">
                          {item.amount.toFixed(2)}{' '}
                          <span className="text-xs font-semibold text-gray-500">
                            {item.payoutCountry ? item.payoutCountry : 'LYD'}
                          </span>
                        </td>

                        {/* 4. Status */}
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cfg.color}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                            {cfg.label}
                          </span>
                        </td>

                        {/* 5. Stage / Lifecycle */}
                        <td className="px-5 py-3.5">
                          {item.status === 'COMPLETED' ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                {t('disbursedPayout', 'Paid & Verified')}
                              </span>
                              <span className="font-mono text-[10px] text-gray-500">
                                {item.reference
                                  ? `Ref: ${item.reference}`
                                  : `TRX: WITHDRAW-${item.settlementNumber.slice(-8)}`}
                              </span>
                            </div>
                          ) : item.status === 'APPROVED' ? (
                            <span className="inline-flex items-center rounded-md border border-purple-200 bg-purple-50 px-2 py-0.5 text-[11px] font-semibold text-purple-700">
                              {t('authorizedQueue', 'Authorized for Payout')}
                            </span>
                          ) : item.status === 'UNDER_REVIEW' ? (
                            <span className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                              {t('underReviewTag', 'Reviewing Ledger')}
                            </span>
                          ) : item.status === 'REJECTED' ? (
                            <span className="inline-flex items-center rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                              {t('rejectedTag', 'Rejected (No Debit)')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                              {t('pendingReviewTag', 'Pending Review')}
                            </span>
                          )}
                        </td>

                        {/* 6. Timeline Dates */}
                        <td className="px-5 py-3.5 text-xs">
                          <div className="font-medium text-gray-800">
                            <span className="text-gray-400">Req: </span>
                            {new Date(item.requestedAt).toLocaleDateString()}
                          </div>
                          {item.completedAt && (
                            <div className="font-mono text-[11px] font-medium text-emerald-600">
                              <span className="text-gray-400">Paid: </span>
                              {new Date(item.completedAt).toLocaleDateString()}
                            </div>
                          )}
                          {!item.completedAt && item.processedAt && (
                            <div className="font-mono text-[11px] font-medium text-purple-600">
                              <span className="text-gray-400">Appr: </span>
                              {new Date(item.processedAt).toLocaleDateString()}
                            </div>
                          )}
                        </td>

                        {/* 7. Reference & Receipt */}
                        <td className="px-5 py-3.5 text-xs">
                          {item.reference ? (
                            <span className="font-mono font-medium text-gray-800">{item.reference}</span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                          {item.receiptUrl && (
                            <a
                              href={item.receiptUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-1 flex items-center gap-1 font-semibold text-blue-600 hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" />
                              {t('viewReceipt', 'View Receipt')}
                            </a>
                          )}
                        </td>

                        {/* 8. Actions */}
                        <td className="px-5 py-3.5 text-end">
                          {role === 'ADMIN' && !isReadOnly ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenProcess(item)}
                              className="h-8 border-blue-200 bg-blue-50 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                            >
                              {t('process', 'Process')}
                            </Button>
                          ) : (
                            <span className="text-xs italic text-gray-400">{t('viewOnly', 'View Only')}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Footer with Pagination */}
          <div className="flex flex-col items-center justify-between gap-3 border-t bg-gray-50/70 px-5 py-3 sm:flex-row">
            <div className="text-xs text-gray-500">
              {t('showing', 'Showing')}{' '}
              <span className="font-semibold text-gray-700">
                {totalCount === 0 ? 0 : (page - 1) * pageSize + 1}
              </span>{' '}
              {t('to', 'to')}{' '}
              <span className="font-semibold text-gray-700">
                {Math.min(page * pageSize, totalCount || settlements.length)}
              </span>{' '}
              {t('of', 'of')}{' '}
              <span className="font-semibold text-gray-700">{totalCount || settlements.length}</span>{' '}
              {t('settlements', 'records')}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || loading}
                onClick={() => setPage(page - 1)}
                className="h-8 text-xs"
              >
                {t('previous', 'Previous')}
              </Button>
              <span className="px-2 font-mono text-xs font-medium text-gray-600">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages || loading}
                onClick={() => setPage(page + 1)}
                className="h-8 text-xs"
              >
                {t('next', 'Next')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('directSettlement', 'Direct settlement')}</DialogTitle>
            <DialogDescription>
              {t(
                'directSettlementHelp',
                'Create a settlement against the recipient wallet without waiting for a withdrawal request.'
              )}
            </DialogDescription>
          </DialogHeader>
          <label>
            {t('recipientType', 'Recipient type')}
            <select
              className="w-full rounded border p-2"
              value={partyType}
              onChange={(e) => setPartyType(e.target.value as 'CLINIC' | 'DOCTOR')}
            >
              <option value="CLINIC">{t('clinic', 'Clinic')}</option>
              <option value="DOCTOR">{t('doctor', 'Doctor')}</option>
            </select>
          </label>
          <Input
            placeholder={t('searchNamePhone', 'Search by name or phone')}
            value={partySearch}
            onChange={(e) => setPartySearch(e.target.value)}
          />
          <select
            aria-label={t('recipient', 'Recipient')}
            className="w-full rounded border p-2"
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
          >
            <option value="">{t('selectRecipient', 'Select recipient')}</option>
            {parties.map((party) => (
              <option key={party.id} value={party.id}>
                {party.name}
              </option>
            ))}
          </select>
          <Label>
            {t('amount', 'Amount')}
            <Input
              type="number"
              min="0.01"
              step="0.01"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
            />
          </Label>
          <Label>
            {t('notes', 'Notes')}
            <Textarea value={newNotes} onChange={(e) => setNewNotes(e.target.value)} />
          </Label>
          <Label>
            {t("Payout method", "Payout method")}
            <select
              className="w-full rounded border p-2"
              value={payoutMethod}
              onChange={(e) => setPayoutMethod(e.target.value)}
            >
              <option value="BANK">{t("Bank transfer — recipient must save bank details first", "Bank transfer — recipient must save bank details first")}</option>
              <option value="CASH">{t("Cash payout", "Cash payout")}</option>
            </select>
          </Label>
          <DialogFooter>
            <Button
              disabled={
                creating ||
                isReadOnly ||
                !targetId ||
                !Number.isFinite(Number(newAmount)) ||
                Number(newAmount) <= 0
              }
              onClick={createDirectSettlement}
            >
              {t('create', 'Create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Process / Review Modal */}
      <Dialog open={showProcessDialog} onOpenChange={setShowProcessDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-emerald-600" />
              {t('processSettlement', 'Process Settlement Request')}
            </DialogTitle>
            <DialogDescription>
              {selectedSettlement?.settlementNumber} — {selectedSettlement?.amount.toFixed(2)} ·{' '}
              {selectedSettlement?.payoutCountry || 'Historical country unspecified'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {selectedSettlement && (
              <div className="space-y-1.5 rounded-lg border border-gray-100 bg-gray-50 p-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">{t('provider', 'Party / Provider')}:</span>
                  <span className="font-semibold text-gray-900">
                    {selectedSettlement.clinic?.clinicName ||
                      selectedSettlement.doctor?.user?.fullName ||
                      'Healthcare Provider'}
                  </span>
                </div>
                {selectedSettlement.clinic?.user?.wallet !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t("Current Wallet Balance:", "Current Wallet Balance:")}</span>
                    <span className="font-bold text-emerald-700">
                      {Number(selectedSettlement.clinic.user.wallet).toFixed(2)} {t("wallet units", "wallet units")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">{t("Settlement Amount:", "Settlement Amount:")}</span>
                  <span className="font-bold text-gray-900">
                    {selectedSettlement.amount.toFixed(2)}
                  </span>
                </div>
                {selectedSettlement.notes && (
                  <div className="border-t border-gray-200 pt-1.5 text-gray-700">
                    <span className="font-medium text-gray-900">{t("Provider Notes:", "Provider Notes:")} </span>
                    {selectedSettlement.notes}
                  </div>
                )}
              </div>
            )}

            <div>
              <Label>{t('updateStatus', 'Settlement Status')}</Label>
              <Select
                disabled={
                  selectedSettlement?.status === 'COMPLETED' ||
                  selectedSettlement?.status === 'REJECTED'
                }
                value={processForm.status}
                onValueChange={(val) => setProcessForm({ ...processForm, status: val })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {selectedSettlement?.status === 'COMPLETED' && (
                    <SelectItem value="COMPLETED">{t("Completed (Paid Out)", "Completed (Paid Out)")}</SelectItem>
                  )}
                  {selectedSettlement?.status === 'PENDING' && (
                    <SelectItem value="UNDER_REVIEW">{t("Under Review", "Under Review")}</SelectItem>
                  )}
                  <SelectItem value="APPROVED">{t("Approved (Authorized)", "Approved (Authorized)")}</SelectItem>
                  {selectedSettlement?.status === 'APPROVED' && (
                    <SelectItem value="COMPLETED">{t("Completed (Paid Out)", "Completed (Paid Out)")}</SelectItem>
                  )}
                  <SelectItem value="REJECTED">{t("Rejected", "Rejected")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="reference">
                {t('bankReference', 'Payment Reference / Transaction ID')}
              </Label>
              <Input
                id="reference"
                placeholder={t("e.g. BANK-TRX-9481249", "e.g. BANK-TRX-9481249")}
                value={processForm.reference}
                onChange={(e) => setProcessForm({ ...processForm, reference: e.target.value })}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="receiptUrl">{t('receiptDocument', 'Receipt document')}</Label>
              <p className="text-sm">
                {t("Payout:", "Payout:")} {selectedSettlement?.payoutMethod || 'Historical unspecified'}
                {selectedSettlement?.bankDetails &&
                  ` · ${selectedSettlement.bankDetails.beneficiaryName} · ${selectedSettlement.bankDetails.bankName} · ${selectedSettlement.bankDetails.iban || selectedSettlement.bankDetails.accountNumber}`}
              </p>
              <Input
                id="receiptUrl"
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                disabled={processLoading || isReadOnly}
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  if (file && file.size > 10 * 1024 * 1024) {
                    toast({ title: t('error', 'Error'), description: t('receiptSizeLimit', 'Maximum receipt size is 10 MB'), variant: 'destructive' });
                    e.target.value = '';
                    setReceiptFile(null);
                    return;
                  }
                  setReceiptFile(file);
                }}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="notes">{t('adminNotes', 'Processing Notes')}</Label>
              <Textarea
                id="notes"
                placeholder={t("Add internal notes or bank details for verification...", "Add internal notes or bank details for verification...")}
                value={processForm.notes}
                onChange={(e) => setProcessForm({ ...processForm, notes: e.target.value })}
                className="mt-1.5 h-20"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProcessDialog(false)}>
              {t('cancel', 'Cancel')}
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={isReadOnly || processLoading}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {isReadOnly
                ? t('readOnlyMode', 'Read Only')
                : processLoading
                  ? t('saving', 'Saving...')
                  : t('saveStatus', 'Save Settlement Status')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
