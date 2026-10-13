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
  FileSpreadsheet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function ClinicFinancialsPage() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const role = useAuthStore((state) => state.role);

  const [loading, setLoading] = useState(true);
  const [financials, setFinancials] = useState<FinancialSummaryData | null>(null);

  // Clinic Admin check (CLINIC or ADMIN)
  const isClinicAdmin = role === 'CLINIC' || role === 'ADMIN';

  useEffect(() => {
    if (isClinicAdmin) {
      loadFinancials();
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

        <div className="flex items-center gap-2.5">
          <Button
            onClick={loadFinancials}
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
              {financials ? Number(financials.walletBalance).toLocaleString() : '0'}{' '}
              <span className="text-lg font-medium text-blue-200">SAR</span>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-blue-100">
            <span>{t('status', 'Status')}: Active</span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
              <span>{t('readyPayout', 'Eligible for payout')}</span>
            </span>
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
              {financials ? Number(financials.frozenWallet).toLocaleString() : '0'}{' '}
              <span className="text-base font-normal text-gray-500">SAR</span>
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
              {financials ? Number(financials.totalEarnings).toLocaleString() : '0'}{' '}
              <span className="text-base font-normal text-emerald-600">SAR</span>
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
              {financials ? Number(financials.currentMonthGross).toLocaleString() : '0'} SAR
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 border border-gray-100">
            <p className="text-xs font-medium text-gray-500">{t('monthSalamaFees', 'Salama Platform Fees Deducted')}</p>
            <p className="mt-2 text-2xl font-bold text-purple-600">
              {financials ? Number(financials.currentMonthPlatformFees).toLocaleString() : '0'} SAR
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

      {/* Recent Transactions Ledger */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 px-5 py-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-blue-600" />
            <span>{t('recentWalletTransactions', 'Recent Wallet Transactions & Settlements')}</span>
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
            <table className="w-full text-left text-sm text-gray-600 rtl:text-right">
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
                      {tx.amount} SAR
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
                        {tx.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
