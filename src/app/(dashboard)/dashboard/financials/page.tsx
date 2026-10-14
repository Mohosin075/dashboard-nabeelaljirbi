'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useLanguage } from '@/contexts/language-context';
import { clinicService, type FinancialSummaryData } from '@/services/clinic.service';
import { useToast } from '@/hooks/use-toast';
import {
  Wallet,
  TrendingUp,
  CreditCard,
  ShieldAlert,
  RefreshCw,
  Clock,
  CheckCircle2,
  Lock,
  FileSpreadsheet,
  DollarSign,
  Receipt,
  ExternalLink,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import Link from 'next/link';

const defaultStatusCfg = {
  label: 'Pending',
  color: 'bg-amber-100 text-amber-800 border-amber-200',
  icon: Clock,
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: defaultStatusCfg,
  UNDER_REVIEW: {
    label: 'Under Review',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Clock,
  },
  APPROVED: {
    label: 'Approved',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: CheckCircle2,
  },
  COMPLETED: {
    label: 'Completed',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: CheckCircle2,
  },
  REJECTED: {
    label: 'Rejected',
    color: 'bg-rose-100 text-rose-800 border-rose-200',
    icon: XCircle,
  },
};

export default function ClinicFinancialsPage() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const role = useAuthStore((state) => state.role);

  const [loading, setLoading] = useState(true);
  const [financials, setFinancials] = useState<FinancialSummaryData | null>(null);

  // Clinic settlements state
  const [settlements, setSettlements] = useState<any[]>([]);
  const [loadingSettlements, setLoadingSettlements] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestAmount, setRequestAmount] = useState('');
  const [requestNotes, setRequestNotes] = useState('');

  // Clinic Admin check (CLINIC or ADMIN)
  const isClinicAdmin = role === 'CLINIC' || role === 'ADMIN';

  useEffect(() => {
    if (isClinicAdmin) {
      loadFinancials();
      loadSettlements();
    }
  }, [isClinicAdmin]);

  const loadFinancials = async () => {
    try {
      setLoading(true);
      const res = await clinicService.getFinancialSummary();
      if (res?.data) {
        setFinancials(res.data);
      }
    } catch (err: any) {
      toast({
        title: t('error', 'Error'),
        description: err?.response?.data?.message || t('failedFinancials', 'Failed to load clinic financial summary'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSettlements = async () => {
    try {
      setLoadingSettlements(true);
      const res = await clinicService.getSettlements({ limit: 50 });
      const items = Array.isArray(res?.data)
        ? res.data
        : Array.isArray((res?.data as any)?.data)
        ? (res?.data as any).data
        : [];
      setSettlements(items);
    } catch (err: any) {
      console.error('Failed to load clinic settlements:', err);
      setSettlements([]);
    } finally {
      setLoadingSettlements(false);
    }
  };

  // Pending settlements sum calculation
  const pendingSettlementSum = (Array.isArray(settlements) ? settlements : [])
    .filter((s) => ['PENDING', 'UNDER_REVIEW', 'APPROVED'].includes(s.status))
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const availableBalance = financials ? Number(financials.walletBalance || 0) : 0;
  const netWithdrawable = Math.max(0, availableBalance - pendingSettlementSum);

  const handleRequestSettlement = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(requestAmount);

    if (isNaN(amountNum) || amountNum <= 0) {
      toast({
        title: t('error', 'Error'),
        description: t('enterValidAmount', 'Please enter a valid payout amount (greater than 0 LYD).'),
        variant: 'destructive',
      });
      return;
    }

    if (amountNum > netWithdrawable) {
      toast({
        title: t('error', 'Error'),
        description: `${t('exceedsWithdrawable', 'Requested amount exceeds withdrawable balance')} (${netWithdrawable.toFixed(2)} LYD).`,
        variant: 'destructive',
      });
      return;
    }

    try {
      setRequestLoading(true);
      const payload: { amount: number; notes?: string } = { amount: amountNum };
      if (requestNotes.trim()) {
        payload.notes = requestNotes.trim();
      }
      await clinicService.requestSettlement(payload);

      toast({
        title: t('success', 'Success'),
        description: t('settlementRequestCreated', 'Settlement payout request submitted successfully and is now under review.'),
      });

      setShowRequestModal(false);
      setRequestAmount('');
      setRequestNotes('');
      await Promise.all([loadFinancials(), loadSettlements()]);
    } catch (err: any) {
      toast({
        title: t('error', 'Error'),
        description: err?.response?.data?.message || t('failedSettlementRequest', 'Failed to submit settlement request'),
        variant: 'destructive',
      });
    } finally {
      setRequestLoading(false);
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
            'staffRestrictedFinancialsMsg',
            'Clinic financials and revenue balances are accessible to Clinic Admins only. Clinic Staff accounts are limited to daily appointment operations.'
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
              {t('clinicFinancials', 'Clinic Financials & Wallet')}
            </h1>
            <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 text-xs">
              {t('clinicAdminOnly', 'Clinic Admin')}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            {t(
              'financialsSubtitle',
              'Real-time overview of clinic balances, consultation revenue, and settlement transactions.'
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={() => setShowRequestModal(true)}
            size="sm"
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm"
            disabled={loading || netWithdrawable <= 0}
          >
            <DollarSign className="h-4 w-4" />
            <span>{t('requestSettlement', 'Request Settlement')}</span>
          </Button>

          <Button
            onClick={() => {
              loadFinancials();
              loadSettlements();
            }}
            variant="outline"
            size="sm"
            disabled={loading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{t('refresh', 'Refresh')}</span>
          </Button>

          <Link href="/dashboard/reports">
            <Button size="sm" className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white">
              <FileSpreadsheet className="h-4 w-4" />
              <span>{t('viewReconciliation', 'Payment Reconciliation')}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Wallet Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {/* Available Wallet Balance */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 text-white shadow-lg">
          <div className="flex items-center justify-between opacity-80">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-100">
              {t('availableWallet', 'Available Wallet Balance')}
            </span>
            <div className="rounded-lg bg-white/10 p-2 backdrop-blur-sm">
              <Wallet className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              {availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
              <span className="text-lg font-medium text-blue-200">LYD</span>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-1 border-t border-white/10 pt-3 text-xs text-blue-100">
            <div className="flex items-center justify-between">
              <span>{t('withdrawableNet', 'Net Withdrawable')}:</span>
              <span className="font-bold text-white">
                {netWithdrawable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} LYD
              </span>
            </div>
            {pendingSettlementSum > 0 && (
              <div className="flex items-center justify-between text-amber-200 text-[11px]">
                <span>{t('pendingInReview', 'Pending in Settlements')}:</span>
                <span>{pendingSettlementSum.toFixed(2)} LYD</span>
              </div>
            )}
          </div>
        </div>

        {/* Frozen / In Escrow Balance */}
        <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              {t('frozenWallet', 'Escrow / Frozen Balance')}
            </span>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
              <Lock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {(financials ? Number(financials.frozenWallet) : 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
              <span className="text-base font-normal text-gray-500">LYD</span>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500 leading-relaxed">
            {t(
              'frozenNotice',
              'Held temporarily until pending/in-progress appointments are confirmed complete by patients.'
            )}
          </p>
        </div>

        {/* Lifetime Earnings */}
        <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              {t('lifetimeGross', 'Lifetime Total Earnings')}
            </span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold tracking-tight text-emerald-700 sm:text-4xl">
              {(financials ? Number(financials.totalEarnings) : 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
              <span className="text-base font-normal text-emerald-600">LYD</span>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500">
            {financials?.totalCompletedCount || 0} {t('lifetimeAppointments', 'total completed appointments recorded')}
          </p>
        </div>
      </div>

      {/* Month-To-Date Performance Box */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-600" />
          <span>{t('currentMonthPerformance', 'Current Month Performance Breakdown')}</span>
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-gray-50 p-4 border border-gray-100">
            <p className="text-xs font-medium text-gray-500">{t('monthGrossConsult', 'Month Gross Consultation Fees')}</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {(financials ? Number(financials.currentMonthGross) : 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} LYD
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 border border-gray-100">
            <p className="text-xs font-medium text-gray-500">{t('monthSalamaFees', 'Salama Platform Fees Deducted')}</p>
            <p className="mt-2 text-2xl font-bold text-purple-600">
              {(financials ? Number(financials.currentMonthPlatformFees) : 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} LYD
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 border border-gray-100">
            <p className="text-xs font-medium text-gray-500">{t('monthCompletedBookings', 'Appointments Completed This Month')}</p>
            <p className="mt-2 text-2xl font-bold text-emerald-600">
              {financials?.currentMonthCompletedCount || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Settlement Requests & Payouts History */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-emerald-600" />
            <h3 className="text-base font-bold text-gray-900">
              {t('clinicSettlementsSection', 'Settlement Requests & Provider Payouts')}
            </h3>
          </div>
          <Badge variant="outline" className="text-xs font-normal text-gray-500">
            {settlements.length} {t('records', 'Records')}
          </Badge>
        </div>

        {loadingSettlements ? (
          <div className="flex h-36 items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent"></div>
          </div>
        ) : !Array.isArray(settlements) || settlements.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Receipt className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-2 text-sm font-medium text-gray-700">{t('noSettlementsYet', 'No settlement payout requests recorded yet')}</p>
            <p className="mt-1 text-xs text-gray-500">
              {t('settlementPrompt', 'When your available balance is eligible, click "Request Settlement" to initiate payout.')}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm text-gray-600 rtl:text-right">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3 font-semibold">{t('settlementNum', 'Settlement #')}</th>
                  <th className="px-5 py-3 font-semibold">{t('date', 'Requested Date')}</th>
                  <th className="px-5 py-3 font-semibold">{t('amount', 'Amount')}</th>
                  <th className="px-5 py-3 font-semibold">{t('status', 'Status')}</th>
                  <th className="px-5 py-3 font-semibold">{t('refReceipt', 'Ref / Receipt')}</th>
                  <th className="px-5 py-3 font-semibold">{t('notes', 'Notes')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {settlements.map((item) => {
                  const cfg = (item.status && STATUS_CONFIG[item.status]) ? STATUS_CONFIG[item.status]! : defaultStatusCfg;
                  const StatusIcon = cfg.icon;

                  return (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-xs font-medium text-blue-600">
                        {item.settlementNumber}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-500">
                        {new Date(item.requestedAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-gray-900">
                        {Number(item.amount).toFixed(2)} LYD
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border ${cfg.color}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs">
                        {item.reference ? (
                          <div className="font-mono text-gray-800">{item.reference}</div>
                        ) : (
                          <span className="text-gray-400 italic">None</span>
                        )}
                        {item.receiptUrl && (
                          <a
                            href={item.receiptUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {t('viewReceipt', 'Receipt Proof')}
                          </a>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-500 max-w-xs truncate">
                        {item.notes || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Transactions Ledger */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 px-5 py-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-blue-600" />
            <span>{t('recentWalletTransactions', 'Recent Wallet Transactions & Disbursements')}</span>
          </h3>
        </div>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
          </div>
        ) : !financials?.recentTransactions || financials.recentTransactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <CreditCard className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-2 text-sm">{t('noRecentTransactions', 'No recent transactions found')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-left text-sm text-gray-600 rtl:text-right">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3 font-semibold">{t('transactionId', 'Transaction ID')}</th>
                  <th className="px-5 py-3 font-semibold">{t('date', 'Date')}</th>
                  <th className="px-5 py-3 font-semibold">{t('amount', 'Amount')}</th>
                  <th className="px-5 py-3 font-semibold">{t('status', 'Status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {financials.recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-700">{tx.id}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">
                      {new Date(tx.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-gray-900">
                      {Number(tx.amount).toFixed(2)} LYD
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge
                        variant="secondary"
                        className={
                          tx.status === 'SUCCESS' || tx.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }
                      >
                        {tx.type === 'WITHDRAW' ? 'DISBURSEMENT' : tx.status || 'RECORDED'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Request Settlement Dialog */}
      <Dialog open={showRequestModal} onOpenChange={setShowRequestModal}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleRequestSettlement}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-emerald-600" />
                {t('requestPayoutTitle', 'Request Settlement Payout')}
              </DialogTitle>
              <DialogDescription>
                {t(
                  'requestPayoutDesc',
                  'Submit a formal settlement payout request. Platform finance team will review and process the transfer.'
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="rounded-lg bg-blue-50/70 border border-blue-100 p-3.5 space-y-2 text-xs">
                <div className="flex justify-between items-center text-gray-700">
                  <span>{t('availableWallet', 'Available Balance')}:</span>
                  <span className="font-semibold text-gray-900">{availableBalance.toFixed(2)} LYD</span>
                </div>
                {pendingSettlementSum > 0 && (
                  <div className="flex justify-between items-center text-amber-700">
                    <span>{t('pendingSettlements', 'Already in Pending Settlement')}:</span>
                    <span className="font-semibold">-{pendingSettlementSum.toFixed(2)} LYD</span>
                  </div>
                )}
                <div className="border-t border-blue-200 pt-1.5 flex justify-between items-center font-bold text-blue-900">
                  <span>{t('maxEligiblePayout', 'Eligible Withdrawable')}:</span>
                  <span className="text-sm text-emerald-700">{netWithdrawable.toFixed(2)} LYD</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <Label htmlFor="amount">{t('payoutAmount', 'Payout Amount (LYD)')} *</Label>
                  {netWithdrawable > 0 && (
                    <button
                      type="button"
                      onClick={() => setRequestAmount(netWithdrawable.toFixed(2))}
                      className="text-xs text-blue-600 hover:underline font-medium"
                    >
                      {t('useMax', 'Use Max')}
                    </button>
                  )}
                </div>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="1"
                  max={netWithdrawable}
                  placeholder={`e.g. ${netWithdrawable > 0 ? (netWithdrawable / 2).toFixed(2) : '100.00'}`}
                  value={requestAmount}
                  onChange={(e) => setRequestAmount(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="notes">{t('settlementRemarks', 'Bank Account / IBAN or Payout Remarks')}</Label>
                <Textarea
                  id="notes"
                  rows={3}
                  placeholder={t(
                    'settlementRemarksPlaceholder',
                    'Specify bank name, account number/IBAN, or any remarks for the finance team...'
                  )}
                  value={requestNotes}
                  onChange={(e) => setRequestNotes(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 p-2.5 rounded border border-gray-100">
                <AlertCircle className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                <span>
                  {t(
                    'settlementAuditNotice',
                    'Once submitted, the requested amount is held in review. Platform Finance will disburse funds via bank transfer with uploaded receipt proof.'
                  )}
                </span>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowRequestModal(false)}
                disabled={requestLoading}
              >
                {t('cancel', 'Cancel')}
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={requestLoading || netWithdrawable <= 0}
              >
                {requestLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>{t('submitting', 'Submitting...')}</span>
                  </div>
                ) : (
                  <span>{t('submitRequest', 'Submit Request')}</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
