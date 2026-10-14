'use client';

import { useEffect, useState } from 'react';
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
} from 'lucide-react';

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

export default function SettlementsPage() {
  const { t } = useLanguage();
  const adminTier = useAuthStore((state) => state.adminTier) || 'SUPER_ADMIN';
  const isReadOnly = adminTier === 'READ_ONLY';

  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Process Settlement Dialog
  const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null);
  const [showProcessDialog, setShowProcessDialog] = useState(false);
  const [processLoading, setProcessLoading] = useState(false);
  const [processForm, setProcessForm] = useState({
    status: 'APPROVED',
    reference: '',
    receiptUrl: '',
    notes: '',
  });

  useEffect(() => {
    fetchSettlements();
  }, [statusFilter]);

  const fetchSettlements = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (searchTerm.trim()) params.searchTerm = searchTerm.trim();

      const res = await adminService.getSettlements(params);
      setSettlements(res.data.data || []);
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
    setProcessForm({
      status: item.status === 'PENDING' ? 'APPROVED' : item.status,
      reference: item.reference || '',
      receiptUrl: item.receiptUrl || '',
      notes: item.notes || '',
    });
    setShowProcessDialog(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedSettlement) return;
    try {
      setProcessLoading(true);
      await adminService.updateSettlementStatus(selectedSettlement.id, processForm);
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
  const pendingAmount = settlements
    .filter((s) => s.status === 'PENDING')
    .reduce((sum, s) => sum + (s.amount || 0), 0);
  const approvedCount = settlements.filter((s) => s.status === 'APPROVED').length;
  const completedAmount = settlements
    .filter((s) => s.status === 'COMPLETED')
    .reduce((sum, s) => sum + (s.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
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

        <Button variant="outline" size="sm" onClick={fetchSettlements} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {t('refresh', 'Refresh')}
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-amber-900">Pending Requests</span>
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-amber-900">{pendingCount}</div>
            <p className="text-xs text-amber-700 mt-1">{pendingAmount.toFixed(2)} LYD awaiting review</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-purple-900">Approved for Payout</span>
              <CheckCircle2 className="h-5 w-5 text-purple-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-purple-900">{approvedCount}</div>
            <p className="text-xs text-purple-700 mt-1">Ready for financial disbursement</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-emerald-900">Completed Payouts</span>
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-emerald-900">{completedAmount.toFixed(2)} LYD</div>
            <p className="text-xs text-emerald-700 mt-1">Disbursed with proof of receipt</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Total Records</span>
              <Receipt className="h-5 w-5 text-gray-400" />
            </div>
            <div className="mt-2 text-2xl font-bold text-gray-900">{settlements.length}</div>
            <p className="text-xs text-gray-500 mt-1">Historical requests in ledger</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs & Search */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            {['ALL', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'COMPLETED', 'REJECTED'].map((st) => (
              <Button
                key={st}
                variant={statusFilter === st ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(st)}
                className={statusFilter === st ? 'bg-blue-600 text-white' : ''}
              >
                {st === 'ALL' ? 'All' : STATUS_CONFIG[st]?.label || st}
              </Button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder={t('searchSettlements', 'Search by reference or clinic...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchSettlements()}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Settlements Table */}
      <Card>
        <CardHeader className="px-6 py-4 border-b">
          <CardTitle className="text-base font-semibold">
            {t('settlementRequests', 'Settlement Records')} ({settlements.length})
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            </div>
          ) : settlements.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              <Receipt className="mx-auto h-12 w-12 text-gray-300 mb-2" />
              <p className="font-medium">{t('noSettlements', 'No settlement records found')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm rtl:text-right">
                <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 border-b">
                  <tr>
                    <th className="px-5 py-3">{t('settlementNum', 'Settlement #')}</th>
                    <th className="px-5 py-3">{t('provider', 'Party / Provider')}</th>
                    <th className="px-5 py-3">{t('amount', 'Amount')}</th>
                    <th className="px-5 py-3">{t('status', 'Status')}</th>
                    <th className="px-5 py-3">{t('relatedTransactions', 'Related Transactions')}</th>
                    <th className="px-5 py-3">{t('date', 'Timeline Dates')}</th>
                    <th className="px-5 py-3">{t('reference', 'Ref / Receipt')}</th>
                    <th className="px-5 py-3 text-right">{t('actions', 'Action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {settlements.map((item) => {
                    const cfg = STATUS_CONFIG[item.status] || defaultStatusCfg;
                    const StatusIcon = cfg.icon;
                    const partyName =
                      item.clinic?.clinicName ||
                      item.doctor?.user?.fullName ||
                      'Healthcare Provider';

                    return (
                      <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-5 py-4 font-mono font-medium text-blue-600">
                          {item.settlementNumber}
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-medium text-gray-900">{partyName}</div>
                          <span className="text-xs text-gray-500 capitalize">
                            {item.partyType?.toLowerCase()}
                          </span>
                        </td>

                        <td className="px-5 py-4 font-semibold text-gray-900">
                          {item.amount.toFixed(2)} LYD
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border ${cfg.color}`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {cfg.label}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          {item.status === 'COMPLETED' ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                Disbursed Payout
                              </span>
                              <span className="font-mono text-[10px] text-gray-500">
                                {item.reference ? `Ref: ${item.reference}` : `TRX: WITHDRAW-${item.settlementNumber}`}
                              </span>
                            </div>
                          ) : item.status === 'APPROVED' ? (
                            <span className="inline-flex items-center text-[11px] font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                              Authorized (Queue)
                            </span>
                          ) : item.status === 'UNDER_REVIEW' ? (
                            <span className="inline-flex items-center text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              Reviewing Ledger
                            </span>
                          ) : item.status === 'REJECTED' ? (
                            <span className="inline-flex items-center text-[11px] font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                              Rejected (No Debit)
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              Pending Review
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4 text-xs text-gray-500">
                          <div>Req: {new Date(item.requestedAt).toLocaleDateString()}</div>
                          {item.completedAt && (
                            <div className="text-[11px] text-emerald-600 font-medium">
                              Paid: {new Date(item.completedAt).toLocaleDateString()}
                            </div>
                          )}
                          {!item.completedAt && item.processedAt && (
                            <div className="text-[11px] text-blue-600 font-medium">
                              Appr: {new Date(item.processedAt).toLocaleDateString()}
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-4 text-xs">
                          {item.reference ? (
                            <span className="font-mono text-gray-800">{item.reference}</span>
                          ) : (
                            <span className="text-gray-400">None</span>
                          )}
                          {item.receiptUrl && (
                            <a
                              href={item.receiptUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
                            >
                              <ExternalLink className="h-3 w-3" />
                              View Receipt
                            </a>
                          )}
                        </td>

                        <td className="px-5 py-4 text-right">
                          {!isReadOnly ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenProcess(item)}
                              className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                            >
                              {t('process', 'Process')}
                            </Button>
                          ) : (
                            <span className="text-xs text-gray-400 italic">View Only</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Process / Review Modal */}
      <Dialog open={showProcessDialog} onOpenChange={setShowProcessDialog}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-emerald-600" />
              {t('processSettlement', 'Process Settlement Request')}
            </DialogTitle>
            <DialogDescription>
              {selectedSettlement?.settlementNumber} — {selectedSettlement?.amount.toFixed(2)} LYD
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {selectedSettlement && (
              <div className="rounded-lg bg-gray-50 p-3 border border-gray-100 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-500">{t('provider', 'Party / Provider')}:</span>
                  <span className="font-semibold text-gray-900">
                    {selectedSettlement.clinic?.clinicName || selectedSettlement.doctor?.user?.fullName || 'Healthcare Provider'}
                  </span>
                </div>
                {selectedSettlement.clinic?.user?.wallet !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Current Wallet Balance:</span>
                    <span className="font-bold text-emerald-700">
                      {Number(selectedSettlement.clinic.user.wallet).toFixed(2)} LYD
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Settlement Amount:</span>
                  <span className="font-bold text-gray-900">{selectedSettlement.amount.toFixed(2)} LYD</span>
                </div>
                {selectedSettlement.notes && (
                  <div className="pt-1.5 border-t border-gray-200 text-gray-700">
                    <span className="font-medium text-gray-900">Provider Notes: </span>
                    {selectedSettlement.notes}
                  </div>
                )}
              </div>
            )}

            <div>
              <Label>{t('updateStatus', 'Settlement Status')}</Label>
              <Select
                value={processForm.status}
                onValueChange={(val) => setProcessForm({ ...processForm, status: val })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                  <SelectItem value="APPROVED">Approved (Authorized)</SelectItem>
                  <SelectItem value="COMPLETED">Completed (Paid Out)</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="reference">{t('bankReference', 'Payment Reference / Transaction ID')}</Label>
              <Input
                id="reference"
                placeholder="e.g. BANK-TRX-9481249"
                value={processForm.reference}
                onChange={(e) => setProcessForm({ ...processForm, reference: e.target.value })}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="receiptUrl">{t('receiptLink', 'Receipt Document URL')}</Label>
              <Input
                id="receiptUrl"
                placeholder="https://.../receipt.pdf"
                value={processForm.receiptUrl}
                onChange={(e) => setProcessForm({ ...processForm, receiptUrl: e.target.value })}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="notes">{t('adminNotes', 'Processing Notes')}</Label>
              <Textarea
                id="notes"
                placeholder="Add internal notes or bank details for verification..."
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
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
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
