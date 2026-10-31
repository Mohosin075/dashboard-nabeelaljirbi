'use client';
import { RowsPerPage } from '@/components/rows-per-page';
import { exportPages, downloadExcel } from '@/lib/export-pages';

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
  const [activeSearch, setActiveSearch] = useState(''),
    [startDate, setStartDate] = useState(''),
    [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1),
    [pageSize, setPageSize] = useState(25),
    [total, setTotal] = useState(0),
    [exporting, setExporting] = useState(false);
  const complaintFilters = {
    searchTerm: activeSearch,
    startDate,
    endDate,
    ...(statusFilter === 'ALL' ? {} : { status: statusFilter }),
  };
  const exportComplaints = async () => {
    setExporting(true);
    const filters = { ...complaintFilters };
    try {
      const rows = await exportPages<Complaint>(async (page) => {
        const response = await adminService.getComplaints({ ...filters, page, limit: 500 });
        return { rows: response.data.data, total: response.data.meta.total };
      });
      await downloadExcel(
        rows.map((r) => ({
          Number: r.complaintNumber,
          Subject: r.subject,
          Phone: r.complainant?.phoneNumber,
          Role: r.complainantRole,
          Status: r.status,
          Created: r.createdAt,
          Resolution: r.resolution,
        })),
        'salama-complaints'
      );
    } catch (error: any) {
      toast({ title: 'Export failed', description: error.message, variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

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
  }, [statusFilter, activeSearch, startDate, endDate, page, pageSize]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params: any = { ...complaintFilters, page, limit: pageSize };
      if (statusFilter !== 'ALL') params.status = statusFilter;

      const res = await adminService.getComplaints(params);
      setComplaints(res.data.data || []);
      setTotal(res.data.meta.total);
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
    if (!selectedComplaint || isReadOnly) return;
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
      <div className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
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
            <p className="mt-1 text-xs text-amber-700">Awaiting administrative assignment</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">Under Investigation</span>
              <AlertTriangle className="h-5 w-5 text-blue-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-blue-900">{investigatingCount}</div>
            <p className="mt-1 text-xs text-blue-700">Currently being reviewed by support</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-emerald-900">Resolved Complaints</span>
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-emerald-900">{resolvedCount}</div>
            <p className="mt-1 text-xs text-emerald-700">Successfully closed disputes</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-col items-center justify-between gap-3 p-4 sm:flex-row">
          <div className="flex flex-wrap gap-1.5">
            {['ALL', 'PENDING', 'UNDER_INVESTIGATION', 'RESOLVED', 'DISMISSED'].map((st) => (
              <Button
                key={st}
                variant={statusFilter === st ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setStatusFilter(st);
                  setPage(1);
                }}
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
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setPage(1);
                  setActiveSearch(searchTerm.trim());
                }
              }}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm">
          From date
          <Input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
          />
        </label>
        <label className="text-sm">
          To date
          <Input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
          />
        </label>
        <RowsPerPage
          value={pageSize}
          onChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
        <Button
          variant="outline"
          onClick={() => {
            setActiveSearch(searchTerm.trim());
            setPage(1);
          }}
        >
          Apply search
        </Button>
        <Button variant="outline" disabled={loading || exporting} onClick={exportComplaints}>
          Export Excel
        </Button>
      </div>
      {/* Complaints Table */}
      <Card>
        <CardHeader className="border-b px-6 py-4">
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
              <MessageSquareWarning className="mx-auto mb-2 h-12 w-12 text-gray-300" />
              <p className="font-medium">
                {t('noComplaints', 'No complaints matching your criteria')}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
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
                      <tr key={item.id} className="transition-colors hover:bg-gray-50/70">
                        <td className="px-6 py-4 font-mono font-medium text-blue-600">
                          {item.complaintNumber}
                        </td>

                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">
                            {item.complainant?.fullName || 'User'}
                          </div>
                          <span className="text-xs capitalize text-gray-500">
                            {item.complainantRole?.toLowerCase()} • {item.complainant?.phoneNumber}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="max-w-xs truncate font-medium text-gray-900">
                            {item.subject}
                          </div>
                          <div className="max-w-xs truncate text-xs text-gray-500">
                            {item.description}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">
                            {item.targetType}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${cfg.color}`}
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
                            className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                          >
                            {isReadOnly
                              ? t('viewDetails', 'View Details')
                              : t('reviewResolve', 'Review / Resolve')}
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

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          disabled={loading || page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Previous
        </Button>
        <span>
          Page {page} / {Math.max(1, Math.ceil(total / pageSize))} · {total} complaints
        </span>
        <Button
          variant="outline"
          disabled={loading || page * pageSize >= total}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>
      {/* Detail / Resolve Modal */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquareWarning className="h-5 w-5 text-rose-600" />
              {isReadOnly
                ? t('complaintDetails', 'Complaint Investigation Details')
                : t('complaintInvestigation', 'Complaint Investigation & Resolution')}
            </DialogTitle>
            <DialogDescription>
              Ticket {selectedComplaint?.complaintNumber} — Filed by{' '}
              {selectedComplaint?.complainant?.fullName}
            </DialogDescription>
          </DialogHeader>

          {selectedComplaint && (
            <div className="space-y-4 py-2 text-sm">
              {isReadOnly && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                  {t(
                    'readOnlyNotice',
                    'Read-Only Mode: You have inspection access only. Resolving, dismissing, or updating complaints is restricted.'
                  )}
                </div>
              )}

              <div className="space-y-2 rounded-lg border bg-gray-50 p-3.5">
                <div className="font-semibold text-gray-900">{selectedComplaint.subject}</div>
                <p className="whitespace-pre-wrap text-xs text-gray-600">
                  {selectedComplaint.description}
                </p>
                {selectedComplaint.booking && (
                  <div className="border-t pt-2 text-xs text-gray-500">
                    Linked Appointment: Serial #{selectedComplaint.booking.serialNumber} (Status:{' '}
                    {selectedComplaint.booking.status})
                  </div>
                )}
              </div>

              <div>
                <Label>{t('resolutionStatus', 'Update Status')}</Label>
                <Select
                  value={resolveForm.status}
                  onValueChange={(val) => setResolveForm({ ...resolveForm, status: val })}
                  disabled={isReadOnly}
                >
                  <SelectTrigger className="mt-1.5" disabled={isReadOnly}>
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
                <Label htmlFor="resolution">
                  {t('resolutionText', 'Resolution Summary (Visible to Complainant)')}
                </Label>
                <Textarea
                  id="resolution"
                  placeholder="Explain the resolution or corrective action taken..."
                  value={resolveForm.resolution}
                  onChange={(e) => setResolveForm({ ...resolveForm, resolution: e.target.value })}
                  disabled={isReadOnly}
                  className="mt-1.5 h-20"
                />
              </div>

              <div>
                <Label htmlFor="adminNotes">
                  {t('internalAdminNotes', 'Internal Admin Notes')}
                </Label>
                <Textarea
                  id="adminNotes"
                  placeholder="Private notes for support team / records..."
                  value={resolveForm.adminNotes}
                  onChange={(e) => setResolveForm({ ...resolveForm, adminNotes: e.target.value })}
                  disabled={isReadOnly}
                  className="mt-1.5 h-20"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              {isReadOnly ? t('close', 'Close') : t('cancel', 'Cancel')}
            </Button>
            {!isReadOnly && (
              <Button
                onClick={handleResolve}
                disabled={resolveLoading}
                className="bg-blue-600 text-white"
              >
                {resolveLoading ? t('saving', 'Saving...') : t('saveResolution', 'Save Resolution')}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
