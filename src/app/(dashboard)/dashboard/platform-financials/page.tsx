'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { adminService, PlatformFinancialOverview } from '@/services/admin.service';
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
} from 'lucide-react';

export default function PlatformFinancialsPage() {
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [financials, setFinancials] = useState<PlatformFinancialOverview | null>(null);

  // Country Fees
  const [countryFees, setCountryFees] = useState<{ [key: string]: number }>({});
  const [feeLoading, setFeeLoading] = useState(false);

  // Wallet Adjustment Dialog
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletTargetUserId, setWalletTargetUserId] = useState('');
  const [walletAmount, setWalletAmount] = useState('');
  const [walletLoading, setWalletLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
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

  const handleSaveCountryFees = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFeeLoading(true);
      await patientServiceFeeService.upsert(countryFees);
      toast({
        title: t('success', 'Success'),
        description: 'Country-specific patient service fees updated',
      });
      fetchData();
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
    const parsedAmount = parseFloat(walletAmount);
    if (!walletTargetUserId || isNaN(parsedAmount)) {
      toast({
        title: t('error', 'Invalid Input'),
        description: 'Enter a valid user ID and numeric amount',
        variant: 'destructive',
      });
      return;
    }

    try {
      setWalletLoading(true);
      await adminService.updateWallet(walletTargetUserId, parsedAmount);
      toast({
        title: t('success', 'Success'),
        description: `Wallet updated by ${parsedAmount > 0 ? '+' : ''}${parsedAmount} LYD`,
      });
      setShowWalletModal(false);
      setWalletTargetUserId('');
      setWalletAmount('');
      fetchData();
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

  if (loading) {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-emerald-600" />
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              {t('platformFinancialsTitle', 'Platform Financials & Wallet Ledger')}
            </h1>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {t(
              'platformFinancialsSub',
              'Section 10 Ledger: Platform Revenue, Service Fees, Wallet Liabilities, and Country Fee Configuration.'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowWalletModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-sm"
          >
            <Wallet className="h-4 w-4" />
            {t('adjustWallet', 'Wallet Adjustment')}
          </Button>

          <Button variant="outline" size="sm" onClick={fetchData} className="gap-2">
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
              <span className="text-sm font-medium text-emerald-900">Patient Service Fees</span>
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-emerald-900">
              {capturedPatientFee.toFixed(2)} LYD
            </div>
            <p className="text-xs text-emerald-700 mt-1">Platform service fee retained</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">Clinic Service Fees</span>
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-blue-900">
              {capturedClinicFee.toFixed(2)} LYD
            </div>
            <p className="text-xs text-blue-700 mt-1">Percentage commission fees</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-purple-900">Active Wallet Liability</span>
              <Wallet className="h-5 w-5 text-purple-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-purple-900">
              {activeWallet.toFixed(2)} LYD
            </div>
            <p className="text-xs text-purple-700 mt-1">Total user wallet balances</p>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-amber-900">Frozen Wallet Balances</span>
              <CreditCard className="h-5 w-5 text-amber-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-amber-900">
              {frozenWallet.toFixed(2)} LYD
            </div>
            <p className="text-xs text-amber-700 mt-1">Held during pending appointments</p>
          </CardContent>
        </Card>
      </div>

      {/* Country Platform Service Fees */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-base font-semibold">
              Country-Specific Patient Service Fees
            </CardTitle>
          </div>
          <CardDescription>
            Fixed booking service fee charged to patients per country tier (in LYD).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveCountryFees} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {['LIBYA', 'TUNISIA', 'EGYPT', 'ALGERIA'].map((country) => (
                <div key={country} className="p-3.5 rounded-lg border bg-gray-50/60">
                  <Label htmlFor={`fee-${country}`} className="font-semibold text-gray-800">
                    {country}
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
                      className="pr-12"
                      required
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-medium">
                      LYD
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={feeLoading} className="bg-blue-600 text-white">
                {feeLoading ? t('saving', 'Saving...') : t('saveFees', 'Save Platform Fees')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Settlements Breakdown */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-emerald-600" />
            <CardTitle className="text-base font-semibold">
              Settlements Status Breakdown
            </CardTitle>
          </div>
          <CardDescription>Current state of provider payout liabilities.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {financials?.settlementsSummary?.map((item) => (
              <div key={item.status} className="p-4 rounded-lg border bg-gray-50 flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-bold text-gray-500">{item.status}</span>
                  <div className="text-lg font-bold text-gray-900 mt-1">
                    {(item._sum?.amount || 0).toFixed(2)} LYD
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {item._count?.id || 0} Records
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
              <Wallet className="h-5 w-5 text-emerald-600" />
              {t('manualWalletAdjustment', 'Administrative Wallet Adjustment')}
            </DialogTitle>
            <DialogDescription>
              Directly credit or debit a user's wallet with mandatory audit trail logging.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleWalletAdjustment} className="space-y-4 py-2">
            <div>
              <Label htmlFor="targetUserId">User ID (or Patient / Clinic / Doctor ID)</Label>
              <Input
                id="targetUserId"
                placeholder="e.g. cly409..."
                value={walletTargetUserId}
                onChange={(e) => setWalletTargetUserId(e.target.value)}
                required
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="adjustAmount">
                Adjustment Amount (LYD)
              </Label>
              <Input
                id="adjustAmount"
                type="number"
                step="0.01"
                placeholder="e.g. 50 to add, or -20 to deduct"
                value={walletAmount}
                onChange={(e) => setWalletAmount(e.target.value)}
                required
                className="mt-1.5"
              />
              <p className="mt-1 text-xs text-gray-500">
                Positive value credits the wallet; negative value debits.
              </p>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setShowWalletModal(false)}>
                {t('cancel', 'Cancel')}
              </Button>
              <Button type="submit" disabled={walletLoading} className="bg-emerald-600 text-white">
                {walletLoading ? t('processing', 'Processing...') : t('execute', 'Execute Adjustment')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
