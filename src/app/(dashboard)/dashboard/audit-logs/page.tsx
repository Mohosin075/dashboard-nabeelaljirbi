'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { adminService, AdminAuditLog } from '@/services/admin.service';
import {
  Activity,
  Search,
  RefreshCw,
  Eye,
  FileCode,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Clock,
  Terminal,
} from 'lucide-react';

export default function AuditLogsPage() {
  const { t } = useLanguage();

  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [targetType, setTargetType] = useState('ALL');

  // Details Modal
  const [selectedLog, setSelectedLog] = useState<AdminAuditLog | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  useEffect(() => {
    fetchLogs(page);
  }, [page, targetType]);

  const fetchLogs = async (currentPage = 1) => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: 15,
      };
      if (searchTerm.trim()) params.searchTerm = searchTerm.trim();
      if (targetType !== 'ALL') params.targetType = targetType;

      const res = await adminService.getAuditLogs(params);
      setLogs(res.data.data || []);
      setTotalPages(Math.ceil((res.data.meta?.total || 1) / 15));
      setTotalCount(res.data.meta?.total || 0);
    } catch (err: any) {
      toast({
        title: t('error', 'Error'),
        description: err.response?.data?.message || 'Failed to fetch audit logs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes('SUSPEND') || action.includes('BANNED') || action.includes('DISABLED') || action.includes('REJECTED')) {
      return 'bg-rose-100 text-rose-800 border-rose-200';
    }
    if (action.includes('CREATE') || action.includes('APPROVED') || action.includes('ENABLED') || action.includes('RESOLVED')) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
    if (action.includes('UPDATE') || action.includes('OVERRIDE')) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    return 'bg-purple-100 text-purple-800 border-purple-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              {t('auditLogsTitle', 'Administrative Action Audit Log')}
            </h1>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {t(
              'auditLogsSub',
              'Immutable, traceable record of all actions performed across administrative tiers.'
            )}
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={() => fetchLogs(page)} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {t('refresh', 'Refresh Logs')}
        </Button>
      </div>

      {/* Filters Bar */}
      <Card>
        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder={t('searchLogs', 'Search by admin name, action, or target ID...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchLogs(1)}
              className="pl-9"
            />
          </div>

          <Select value={targetType} onValueChange={(val) => { setTargetType(val); setPage(1); }}>
            <SelectTrigger>
              <SelectValue placeholder={t('targetType', 'Target Entity')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t('allTargets', 'All Entities')}</SelectItem>
              <SelectItem value="USER">Users / Staff</SelectItem>
              <SelectItem value="CLINIC">Clinics</SelectItem>
              <SelectItem value="DOCTOR">Doctors</SelectItem>
              <SelectItem value="BOOKING">Bookings</SelectItem>
              <SelectItem value="SETTLEMENT">Settlements</SelectItem>
              <SelectItem value="COMPLAINT">Complaints</SelectItem>
              <SelectItem value="SETTINGS">Settings</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={() => fetchLogs(1)} className="bg-blue-600 hover:bg-blue-700 text-white">
            {t('applyFilter', 'Search & Filter')}
          </Button>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardHeader className="px-6 py-4 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-gray-500" />
            {t('actionHistory', 'Action Timeline')} ({totalCount})
          </CardTitle>
          <span className="text-xs text-gray-400">Page {page} of {totalPages || 1}</span>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            </div>
          ) : logs.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              <Activity className="mx-auto h-12 w-12 text-gray-300 mb-2" />
              <p className="font-medium">{t('noLogsFound', 'No audit logs recorded matching your filter')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 border-b">
                  <tr>
                    <th className="px-6 py-3">{t('timestamp', 'Timestamp')}</th>
                    <th className="px-6 py-3">{t('administrator', 'Admin User')}</th>
                    <th className="px-6 py-3">{t('action', 'Action')}</th>
                    <th className="px-6 py-3">{t('target', 'Target Entity')}</th>
                    <th className="px-6 py-3">{t('ipAddress', 'IP / Source')}</th>
                    <th className="px-6 py-3 text-right">{t('details', 'Payload')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map((log) => {
                    const formattedDate = new Date(log.createdAt).toLocaleString();
                    const actionClass = getActionColor(log.action);

                    return (
                      <tr key={log.id} className="hover:bg-gray-50/70 transition-colors font-mono text-xs">
                        <td className="px-6 py-3.5 text-gray-600 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-sans">
                            <Clock className="h-3.5 w-3.5 text-gray-400" />
                            {formattedDate}
                          </div>
                        </td>

                        <td className="px-6 py-3.5 font-sans">
                          <div className="font-medium text-gray-900">{log.adminName || 'Admin'}</div>
                          <span className="inline-block text-[11px] font-semibold text-blue-600">
                            {log.adminTier || 'SUPER_ADMIN'}
                          </span>
                        </td>

                        <td className="px-6 py-3.5 whitespace-nowrap">
                          <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold border ${actionClass}`}>
                            {log.action}
                          </span>
                        </td>

                        <td className="px-6 py-3.5 font-sans">
                          <span className="font-semibold text-gray-700">{log.targetType}</span>
                          {log.targetId && (
                            <span className="text-gray-400 block text-[11px] truncate max-w-[140px]">
                              #{log.targetId}
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-3.5 text-gray-500">{log.ipAddress || '—'}</td>

                        <td className="px-6 py-3.5 text-right font-sans">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedLog(log);
                              setShowDetailDialog(true);
                            }}
                            className="gap-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 text-xs"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            {t('inspect', 'Inspect')}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-6 py-3 bg-gray-50">
              <span className="text-xs text-gray-500">
                Showing page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details JSON Modal */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-blue-600" />
              {t('auditLogDetails', 'Audit Log Inspection')}
            </DialogTitle>
            <DialogDescription>
              Action: <span className="font-semibold text-gray-900">{selectedLog?.action}</span> | Timestamp: {selectedLog ? new Date(selectedLog.createdAt).toLocaleString() : ''}
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-3 rounded-lg border">
                <div>
                  <span className="text-gray-400 block">Operator:</span>
                  <span className="font-semibold text-gray-800">{selectedLog.adminName}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Tier:</span>
                  <span className="font-semibold text-blue-600">{selectedLog.adminTier}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Target Type:</span>
                  <span className="font-semibold text-gray-800">{selectedLog.targetType}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Target ID:</span>
                  <span className="font-semibold text-gray-800">{selectedLog.targetId || 'N/A'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-400 block">IP Address:</span>
                  <span className="font-semibold text-gray-800">{selectedLog.ipAddress}</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-gray-600 mb-1.5 block flex items-center gap-1.5">
                  <FileCode className="h-4 w-4 text-gray-500" />
                  Payload & Changes (JSON):
                </span>
                <pre className="p-4 rounded-lg bg-gray-950 text-emerald-400 font-mono text-xs overflow-x-auto max-h-60 border border-gray-800">
                  {JSON.stringify(selectedLog.details || {}, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
