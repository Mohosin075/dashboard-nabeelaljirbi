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
import { adminService, Complaint } from '@/services/admin.service';
import {
  MessageSquareWarning,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  XCircle,
} from 'lucide-react';

const defaultComplaintCfg = {
  label: 'Pending',
  color: 'bg-amber-100 text-amber-800 border-amber-200',
  icon: Clock,
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: defaultComplaintCfg,
  UNDER_INVESTIGATION: {
    label: 'Investigating',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: AlertTriangle,
  },
  RESOLVED: {
    label: 'Resolved',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: CheckCircle2,
  },
  DISMISSED: {
    label: 'Dismissed',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: XCircle,
  },
};

export default function ComplaintsPage() {
  const { t } = useLanguage();
  const adminTier = useAuthStore((state) => state.adminTier) || 'SUPER_ADMIN';
  const isReadOnly = adminTier === 'READ_ONLY';

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Resolve Dialog
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [resolveLoading, setResolveLoading] = useState(false);
  const [resolveForm, setResolveForm] = useState({
    status: 'RESOLVED',
    resolution: '',
    adminNotes: '',
  });

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (searchTerm.trim()) params.searchTerm = searchTerm.trim();

      const res = await adminService.getComplaints(params);
      setComplaints(res.data.data || []);
    } catch (err: any) {
      toast({
        title: t('error', 'Error'),
        description: err.response?.data?.message || 'Failed to fetch complaints',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = (item: Complaint) => {
    setSelectedComplaint(item);
    setResolveForm({
      status: item.status === 'PENDING' ? 'UNDER_INVESTIGATION' : item.status,
      resolution: item.resolution || '',
      adminNotes: item.adminNotes || '',
    });
    setShowDetailDialog(true);
  };

  const handleResolve = async () => {
    if (!selectedComplaint) return;
    try {
      setResolveLoading(true);
      await adminService.resolveComplaint(selectedComplaint.id, resolveForm);
      toast({
        title: t('success', 'Success'),
        description: `Complaint ${selectedComplaint.complaintNumber} updated to ${resolveForm.status}`,
      });
      setShowDetailDialog(false);
      setSelectedComplaint(null);
      fetchComplaints();
    } catch (err: any) {
      toast({
        title: t('error', 'Error'),
        description: err.response?.data?.message || 'Failed to update complaint',
        variant: 'destructive',
      });
    } finally {
      setResolveLoading(false);
    }
  };

  const pendingCount = complaints.filter((c) => c.status === 'PENDING').length;
  const investigatingCount = complaints.filter((c) => c.status === 'UNDER_INVESTIGATION').length;
  const resolvedCount = complaints.filter((c) => c.status === 'RESOLVED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquareWarning className="h-6 w-6 text-rose-600" />
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              {t('complaintsTitle', 'Complaints & Dispute Resolution')}
            </h1>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {t(
              'complaintsSub',
              'Investigate and resolve disputes filed by patients, clinics, and doctors with administrative notes.'
            )}
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={fetchComplaints} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {t('refresh', 'Refresh')}
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-amber-900">Pending Complaints</span>
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-amber-900">{pendingCount}</div>
            <p className="text-xs text-amber-700 mt-1">Awaiting administrative assignment</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">Under Investigation</span>
              <AlertTriangle className="h-5 w-5 text-blue-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-blue-900">{investigatingCount}</div>
            <p className="text-xs text-blue-700 mt-1">Currently being reviewed by support</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-emerald-900">Resolved Complaints</span>
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-emerald-900">{resolvedCount}</div>
            <p className="text-xs text-emerald-700 mt-1">Successfully closed disputes</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            {['ALL', 'PENDING', 'UNDER_INVESTIGATION', 'RESOLVED', 'DISMISSED'].map((st) => (
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
              placeholder={t('searchComplaints', 'Search complaints...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchComplaints()}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Complaints Table */}
      <Card>
        <CardHeader className="px-6 py-4 border-b">
          <CardTitle className="text-base font-semibold">
            {t('complaintsList', 'Complaints Queue')} ({complaints.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            </div>
          ) : complaints.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              <MessageSquareWarning className="mx-auto h-12 w-12 text-gray-300 mb-2" />
              <p className="font-medium">{t('noComplaints', 'No complaints matching your criteria')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 border-b">
                  <tr>
                    <th className="px-6 py-3">{t('complaintId', 'Ticket #')}</th>
                    <th className="px-6 py-3">{t('complainant', 'Complainant')}</th>
                    <th className="px-6 py-3">{t('subject', 'Subject')}</th>
                    <th className="px-6 py-3">{t('target', 'Target')}</th>
                    <th className="px-6 py-3">{t('status', 'Status')}</th>
                    <th className="px-6 py-3">{t('date', 'Filed Date')}</th>
                    <th className="px-6 py-3 text-right">{t('actions', 'Action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {complaints.map((item) => {
                    const cfg = STATUS_CONFIG[item.status] || defaultComplaintCfg;
                    const StatusIcon = cfg.icon;

                    return (
                      <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-6 py-4 font-mono font-medium text-blue-600">
                          {item.complaintNumber}
                        </td>

                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">
                            {item.complainant?.fullName || 'User'}
                          </div>
                          <span className="text-xs text-gray-500 capitalize">
                            {item.complainantRole?.toLowerCase()} • {item.complainant?.phoneNumber}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900 max-w-xs truncate">
                            {item.subject}
                          </div>
                          <div className="text-xs text-gray-500 max-w-xs truncate">
                            {item.description}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                            {item.targetType}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border ${cfg.color}`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {cfg.label}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-xs text-gray-500">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDetail(item)}
                            className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                          >
                            {t('reviewResolve', 'Review / Resolve')}
                          </Button>
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

      {/* Detail / Resolve Modal */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquareWarning className="h-5 w-5 text-rose-600" />
              {t('complaintInvestigation', 'Complaint Investigation & Resolution')}
            </DialogTitle>
            <DialogDescription>
              Ticket {selectedComplaint?.complaintNumber} — Filed by {selectedComplaint?.complainant?.fullName}
            </DialogDescription>
          </DialogHeader>

          {selectedComplaint && (
            <div className="space-y-4 py-2 text-sm">
              <div className="bg-gray-50 p-3.5 rounded-lg border space-y-2">
                <div className="font-semibold text-gray-900">{selectedComplaint.subject}</div>
                <p className="text-gray-600 text-xs whitespace-pre-wrap">{selectedComplaint.description}</p>
                {selectedComplaint.booking && (
                  <div className="pt-2 text-xs border-t text-gray-500">
                    Linked Appointment: Serial #{selectedComplaint.booking.serialNumber} (Status: {selectedComplaint.booking.status})
                  </div>
                )}
              </div>

              <div>
                <Label>{t('resolutionStatus', 'Update Status')}</Label>
                <Select
                  value={resolveForm.status}
                  onValueChange={(val) => setResolveForm({ ...resolveForm, status: val })}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UNDER_INVESTIGATION">Under Investigation</SelectItem>
                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                    <SelectItem value="DISMISSED">Dismissed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="resolution">{t('resolutionText', 'Resolution Summary (Visible to Complainant)')}</Label>
                <Textarea
                  id="resolution"
                  placeholder="Explain the resolution or corrective action taken..."
                  value={resolveForm.resolution}
                  onChange={(e) => setResolveForm({ ...resolveForm, resolution: e.target.value })}
                  className="mt-1.5 h-20"
                />
              </div>

              <div>
                <Label htmlFor="adminNotes">{t('internalAdminNotes', 'Internal Admin Notes')}</Label>
                <Textarea
                  id="adminNotes"
                  placeholder="Private notes for support team / records..."
                  value={resolveForm.adminNotes}
                  onChange={(e) => setResolveForm({ ...resolveForm, adminNotes: e.target.value })}
                  className="mt-1.5 h-20"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              {t('cancel', 'Cancel')}
            </Button>
            <Button
              onClick={handleResolve}
              disabled={isReadOnly || resolveLoading}
              className="bg-blue-600 text-white"
            >
              {isReadOnly
                ? t('readOnlyMode', 'Read Only')
                : resolveLoading
                ? t('saving', 'Saving...')
                : t('saveResolution', 'Save Resolution')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
