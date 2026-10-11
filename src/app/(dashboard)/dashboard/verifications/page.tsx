'use client';

import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import {
  BadgeCheck,
  Building2,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileCheck2,
  FileText,
  Filter,
  Loader2,
  Mail,
  Phone,
  RotateCcw,
  Search,
  Sparkles,
  Stethoscope,
  X,
  XCircle,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface VerificationDocument {
  title: string;
  url: string;
  type?: string;
  uploadedAt?: string;
}

interface VerificationEntry {
  id: string;
  entityType: 'DOCTOR' | 'CLINIC';
  name: string;
  email?: string;
  phoneNumber?: string;
  profileImage?: string;
  speciality?: string;
  licenseNumber?: string;
  managerName?: string;
  location?: string;
  status: string;
  badgeActive: boolean;
  documents?: VerificationDocument[];
  notes?: string;
  adminNote?: string;
  submittedAt?: string;
  reviewedAt?: string;
}

const ARABIC_NOTICE = `تعني علامة التوثيق أن منصة سلامة قامت بمراجعة البيانات والمستندات المقدمة من الطبيب والعيادة وفق إجراءات التحقق المتاحة لديها. ولا تمثل العلامة ضماناً مطلقاً لصحة جميع المستندات أو استمرار صلاحية التراخيص أو تقييماً للكفاءة المهنية للطبيب او العيادة، وتبقى مسؤولية صحة البيانات والمستندات المقدمة على الطبيب والعيادة. ويحق للمنصة تعليق أو إزالة علامة التوثيق عند وجود شك أو عدم اكتمال البيانات أو انتهاء المستندات.`;

export default function VerificationsPage() {
  const [entries, setEntries] = useState<VerificationEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'DOCTOR' | 'CLINIC'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [activeSearch, setActiveSearch] = useState('');

  // Selected entry for review modal
  const [selected, setSelected] = useState<VerificationEntry | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [reviewAction, setReviewAction] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [autoActivateBadge, setAutoActivateBadge] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [togglingBadge, setTogglingBadge] = useState<string | null>(null);

  // Lightbox for document preview
  const [previewDoc, setPreviewDoc] = useState<{ url: string; title: string } | null>(null);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { limit: '100' };
      if (typeFilter !== 'ALL') params['type'] = typeFilter;
      if (statusFilter !== 'ALL') params['status'] = statusFilter;
      if (activeSearch) params['searchTerm'] = activeSearch;

      const res = await apiClient.get('/verification/admin/list', { params });
      setEntries(res.data?.data?.data || res.data?.data || []);
    } catch {
      toast({ title: 'Error', description: 'Failed to load verifications', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [typeFilter, statusFilter, activeSearch]);

  const handleSearch = () => setActiveSearch(search.trim());

  const resetFilters = () => {
    setSearch('');
    setActiveSearch('');
    setTypeFilter('ALL');
    setStatusFilter('ALL');
  };

  const isFiltered = typeFilter !== 'ALL' || statusFilter !== 'ALL' || activeSearch !== '';

  const openReview = (entry: VerificationEntry) => {
    setSelected(entry);
    setAdminNote(entry.adminNote || '');
    setReviewAction(entry.status === 'PENDING' ? 'APPROVED' : null);
    setAutoActivateBadge(true);
    setShowReviewModal(true);
  };

  const submitReview = async () => {
    if (!selected || !reviewAction) return;
    setReviewing(true);
    try {
      await apiClient.patch('/verification/admin/review', {
        targetId: selected.id,
        type: selected.entityType,
        action: reviewAction,
        adminNote: adminNote || undefined,
        badgeActive: reviewAction === 'APPROVED' ? autoActivateBadge : false,
      });

      toast({
        title: reviewAction === 'APPROVED' ? '✅ Verification Approved' : '❌ Verification Rejected',
        description: `${selected.name}'s application has been ${reviewAction.toLowerCase()}.`,
      });

      setShowReviewModal(false);
      fetchEntries();
    } catch {
      toast({ title: 'Error', description: 'Failed to submit review', variant: 'destructive' });
    } finally {
      setReviewing(false);
    }
  };

  const toggleBadge = async (entry: VerificationEntry, newValue: boolean) => {
    setTogglingBadge(entry.id);
    try {
      await apiClient.patch('/verification/admin/toggle-badge', {
        targetId: entry.id,
        type: entry.entityType,
        badgeActive: newValue,
      });
      toast({
        title: newValue ? '✅ Blue Badge Activated' : '🔕 Blue Badge Deactivated',
        description: `${entry.name}'s badge is now ${newValue ? 'visible on public app' : 'hidden from public app'}.`,
      });
      fetchEntries();
    } catch {
      toast({ title: 'Error', description: 'Failed to toggle badge state', variant: 'destructive' });
    } finally {
      setTogglingBadge(null);
    }
  };

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const stats = useMemo(() => {
    return {
      total: entries.length,
      pending: entries.filter((e) => e.status === 'PENDING').length,
      approved: entries.filter((e) => e.status === 'APPROVED').length,
      badgeActive: entries.filter((e) => e.badgeActive).length,
    };
  }, [entries]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
              <BadgeCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Blue Badge Verifications
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Review legal certificates, verify medical licenses & control live Blue Badges
              </p>
            </div>
          </div>
        </div>

        {/* Live Refresh */}
        <div className="flex items-center gap-2">
          <Button
            onClick={fetchEntries}
            variant="outline"
            size="sm"
            disabled={loading}
            className="text-xs h-9 border-slate-200 hover:bg-slate-50"
          >
            <RotateCcw className={`h-3.5 w-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Stat Cards (Interactive Filter Triggers) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total */}
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`text-left p-4 rounded-xl border transition-all ${
            statusFilter === 'ALL'
              ? 'bg-blue-50/60 border-blue-300 ring-2 ring-blue-500/10'
              : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Requests</span>
            <FileText className="h-4 w-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{stats.total}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">All registered applicants</span>
        </button>

        {/* Pending */}
        <button
          onClick={() => setStatusFilter('PENDING')}
          className={`text-left p-4 rounded-xl border transition-all ${
            statusFilter === 'PENDING'
              ? 'bg-amber-50/60 border-amber-300 ring-2 ring-amber-500/10'
              : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700">Needs Review</span>
            <div className="relative">
              <Clock3 className="h-4 w-4 text-amber-600" />
              {stats.pending > 0 && (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-2">{stats.pending}</p>
          <span className="text-[11px] text-amber-600/80 mt-1 block font-medium">
            {stats.pending > 0 ? 'Awaiting admin decision' : 'Inbox zero'}
          </span>
        </button>

        {/* Approved */}
        <button
          onClick={() => setStatusFilter('APPROVED')}
          className={`text-left p-4 rounded-xl border transition-all ${
            statusFilter === 'APPROVED'
              ? 'bg-emerald-50/60 border-emerald-300 ring-2 ring-emerald-500/10'
              : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700">Approved</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-2">{stats.approved}</p>
          <span className="text-[11px] text-emerald-600/80 mt-1 block">Valid credentials</span>
        </button>

        {/* Active Badge */}
        <button
          onClick={() => {
            setStatusFilter('APPROVED');
          }}
          className="text-left p-4 rounded-xl border bg-white border-slate-200/80 hover:border-blue-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-700">Live Badges</span>
            <Sparkles className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600 mt-2">{stats.badgeActive}</p>
          <span className="text-[11px] text-blue-600/80 mt-1 block">Visible in mobile app</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name, phone (+218...), email, or license..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-9 pr-9 h-10 text-sm border-slate-200 focus-visible:ring-blue-500"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch('');
                  setActiveSearch('');
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Entity Type Filter Tabs */}
          <div className="flex bg-slate-100/80 p-1 rounded-lg border border-slate-200/60 shrink-0">
            {(
              [
                { id: 'ALL', label: 'All Types' },
                { id: 'DOCTOR', label: '🩺 Doctors' },
                { id: 'CLINIC', label: '🏥 Clinics' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setTypeFilter(t.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  typeFilter === t.id
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Status Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 lg:pb-0 shrink-0 items-center">
            {[
              { id: 'ALL', label: 'All Status' },
              { id: 'PENDING', label: 'Pending', count: stats.pending },
              { id: 'APPROVED', label: 'Approved' },
              { id: 'REJECTED', label: 'Rejected' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setStatusFilter(s.id)}
                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  statusFilter === s.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>{s.label}</span>
                {s.count !== undefined && s.count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      statusFilter === s.id ? 'bg-amber-400 text-slate-950' : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {s.count}
                  </span>
                )}
              </button>
            ))}

            {isFiltered && (
              <Button
                onClick={resetFilters}
                variant="ghost"
                size="sm"
                className="text-xs text-slate-500 hover:text-slate-800 h-8 px-2"
              >
                <X className="h-3.5 w-3.5 mr-1" /> Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Results List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-200/80">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-3" />
          <p className="text-sm font-medium text-slate-600">Loading verifications...</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 py-20 px-6 text-center">
          <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Filter className="h-7 w-7" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">No applicants found</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mt-1">
            No doctors or clinics match your selected filter criteria. Try clearing filters or search terms.
          </p>
          {isFiltered && (
            <Button onClick={resetFilters} variant="outline" size="sm" className="mt-4 text-xs">
              Clear All Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3.5">
          {entries.map((entry) => {
            const isApproved = entry.status === 'APPROVED';
            const isPending = entry.status === 'PENDING';
            const isRejected = entry.status === 'REJECTED';
            const docCount = (entry.documents ?? []).length;

            return (
              <div
                key={`${entry.entityType}-${entry.id}`}
                className="bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300/80 transition-all shadow-xs overflow-hidden p-5"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                  {/* Left: Applicant Identity & Details */}
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="relative shrink-0">
                      <Avatar className="h-14 w-14 rounded-xl border border-slate-200 shadow-xs">
                        <AvatarImage src={entry.profileImage ?? ''} className="object-cover" />
                        <AvatarFallback
                          className={`rounded-xl text-sm font-semibold ${
                            entry.entityType === 'DOCTOR'
                              ? 'bg-blue-50 text-blue-600'
                              : 'bg-emerald-50 text-emerald-600'
                          }`}
                        >
                          {entry.entityType === 'DOCTOR' ? (
                            <Stethoscope className="h-6 w-6" />
                          ) : (
                            <Building2 className="h-6 w-6" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      {entry.badgeActive && (
                        <div
                          className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-xs"
                          title="Blue Badge Active"
                        >
                          <BadgeCheck className="h-4 w-4 text-blue-500 fill-blue-500 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 space-y-1">
                      {/* Name & Type Tag */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-base text-slate-900 tracking-tight">{entry.name}</h3>

                        {/* Verified Pill */}
                        {entry.badgeActive && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                            <BadgeCheck className="h-3 w-3 text-blue-600" />
                            Badge Live
                          </span>
                        )}

                        {/* Entity Chip */}
                        <span className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                          {entry.entityType === 'DOCTOR' ? 'Doctor' : 'Clinic'}
                        </span>
                      </div>

                      {/* Contact & Subtitle */}
                      <div className="flex items-center gap-3 flex-wrap text-xs text-slate-500">
                        {entry.speciality && (
                          <span className="font-medium text-slate-700">🩺 {entry.speciality}</span>
                        )}
                        {entry.phoneNumber && (
                          <span className="inline-flex items-center gap-1 font-mono">
                            <Phone className="h-3 w-3 text-slate-400" />
                            <bdi dir="ltr">{entry.phoneNumber}</bdi>
                          </span>
                        )}
                        {entry.email && (
                          <span className="inline-flex items-center gap-1">
                            <Mail className="h-3 w-3 text-slate-400" />
                            {entry.email}
                          </span>
                        )}
                      </div>

                      {/* Timeline & Metadata */}
                      <div className="flex items-center gap-3.5 flex-wrap pt-1 text-[11px] text-slate-400">
                        <span>Submitted: {formatDate(entry.submittedAt)}</span>
                        {entry.reviewedAt && <span>Reviewed: {formatDate(entry.reviewedAt)}</span>}
                        <span className="inline-flex items-center gap-1 font-medium text-slate-600 bg-slate-100/70 px-2 py-0.5 rounded">
                          <FileCheck2 className="h-3 w-3 text-slate-500" />
                          {docCount} document{docCount === 1 ? '' : 's'}
                        </span>
                      </div>

                      {/* Admin Note if present */}
                      {entry.adminNote && (
                        <div className="mt-2 text-xs bg-slate-50 border border-slate-200/80 rounded-lg px-2.5 py-1 text-slate-600 max-w-lg">
                          <span className="font-semibold text-slate-700">Admin Note:</span> {entry.adminNote}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Status Pill & Action Buttons */}
                  <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-start md:items-end lg:items-center gap-3.5 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                    {/* Status Badge */}
                    <div className="shrink-0">
                      {isPending && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                          Pending Review
                        </span>
                      )}
                      {isApproved && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          Approved
                        </span>
                      )}
                      {isRejected && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80">
                          <XCircle className="h-3.5 w-3.5 text-rose-600" />
                          Rejected
                        </span>
                      )}
                      {!isPending && !isApproved && !isRejected && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          Not Submitted
                        </span>
                      )}
                    </div>

                    {/* Blue Badge Toggle Switch (If Approved) */}
                    {isApproved && (
                      <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/70">
                        <div className="text-right">
                          <p className="text-[11px] font-semibold text-slate-700 leading-tight">
                            {entry.badgeActive ? 'Badge On' : 'Badge Off'}
                          </p>
                          <p className="text-[9px] text-slate-400">
                            {entry.badgeActive ? 'Public app' : 'Hidden'}
                          </p>
                        </div>
                        {togglingBadge === entry.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                        ) : (
                          <Switch
                            checked={entry.badgeActive}
                            onCheckedChange={(val) => toggleBadge(entry, val)}
                            className="data-[state=checked]:bg-blue-600"
                          />
                        )}
                      </div>
                    )}

                    {/* Review / Inspect Details Button */}
                    <Button
                      onClick={() => openReview(entry)}
                      variant={isPending ? 'default' : 'outline'}
                      size="sm"
                      className={`text-xs h-9 px-3.5 rounded-xl gap-1.5 font-semibold ${
                        isPending
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <FileText className="h-3.5 w-3.5" />
                      {isPending ? 'Review Application' : 'Inspect Documents'}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review & Decision Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-6 rounded-2xl">
          <DialogHeader className="pb-3 border-b border-slate-100">
            <DialogTitle className="flex items-center justify-between text-lg font-bold text-slate-900">
              <div className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-blue-500" />
                <span>Verification Review: {selected?.name}</span>
              </div>
            </DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-6 pt-2">
              {/* Applicant Profile Bar */}
              <div className="flex items-center gap-3.5 p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/70">
                <Avatar className="h-12 w-12 rounded-lg">
                  <AvatarImage src={selected.profileImage ?? ''} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-semibold">
                    {selected.entityType === 'DOCTOR' ? '🩺' : '🏥'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-slate-900">{selected.name}</p>
                    <span className="text-[10px] bg-slate-200/80 font-medium text-slate-700 px-2 py-0.5 rounded">
                      {selected.entityType}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    <bdi dir="ltr">{selected.phoneNumber ?? selected.email ?? '—'}</bdi>
                    {selected.speciality ? ` • ${selected.speciality}` : ''}
                  </p>
                </div>

                {/* Current Badge Status */}
                <div className="text-right">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold ${
                      selected.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selected.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {selected.status}
                  </span>
                </div>
              </div>

              {/* Submitted Documents Grid */}
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 block">
                  📎 Uploaded Verification Documents ({selected.documents?.length || 0})
                </Label>

                {selected.documents && selected.documents.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selected.documents.map((doc, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-white border border-slate-200/90 rounded-xl hover:border-slate-300 transition-all flex flex-col justify-between space-y-3"
                      >
                        <div className="flex items-start gap-3">
                          {/* Image preview thumbnail */}
                          <div
                            onClick={() => setPreviewDoc({ url: doc.url, title: doc.title })}
                            className="h-16 w-16 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 cursor-pointer relative group flex items-center justify-center"
                          >
                            <img
                              src={doc.url}
                              alt={doc.title}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                              }}
                            />
                            <FileText className="h-6 w-6 text-slate-400 absolute" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-900 truncate">{doc.title}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {doc.type ?? 'Document'}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1">
                              {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : ''}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => setPreviewDoc({ url: doc.url, title: doc.title })}
                            className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 flex-1 h-8"
                          >
                            Preview
                          </Button>
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-slate-600 p-1.5"
                            title="Open in new window"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 font-medium">No documents attached to this account yet.</p>
                  </div>
                )}
              </div>

              {/* Notes from applicant */}
              {selected.notes && (
                <div>
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
                    📝 Notes from Applicant
                  </Label>
                  <p className="text-xs text-slate-700 p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                    {selected.notes}
                  </p>
                </div>
              )}

              {/* Legal Arabic Disclaimer Box */}
              <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200/60">
                <p className="text-xs font-bold text-blue-800 mb-1">
                  ⚖️ Legal Disclaimer (Displayed on mobile app upon clicking badge)
                </p>
                <p dir="rtl" className="text-xs text-slate-600 leading-relaxed text-right font-sans">
                  {ARABIC_NOTICE}
                </p>
              </div>

              {/* Decision Buttons */}
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 block">
                  Select Decision
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setReviewAction('APPROVED')}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-bold transition-all ${
                      reviewAction === 'APPROVED'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-500/20'
                        : 'text-emerald-700 bg-emerald-50/50 border-emerald-200 hover:bg-emerald-50'
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" /> Approve Application
                  </button>

                  <button
                    type="button"
                    onClick={() => setReviewAction('REJECTED')}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-bold transition-all ${
                      reviewAction === 'REJECTED'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-sm ring-2 ring-rose-500/20'
                        : 'text-rose-700 bg-rose-50/50 border-rose-200 hover:bg-rose-50'
                    }`}
                  >
                    <XCircle className="h-4 w-4" /> Reject Application
                  </button>
                </div>
              </div>

              {/* Auto Activate Badge Option */}
              {reviewAction === 'APPROVED' && (
                <div className="flex items-center justify-between p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl">
                  <div>
                    <p className="text-xs font-bold text-emerald-900">Activate Blue Badge Immediately</p>
                    <p className="text-[11px] text-emerald-700">
                      When enabled, badge will become visible immediately on the public patient app.
                    </p>
                  </div>
                  <Switch
                    checked={autoActivateBadge}
                    onCheckedChange={setAutoActivateBadge}
                    className="data-[state=checked]:bg-emerald-600"
                  />
                </div>
              )}

              {/* Admin Note Box */}
              <div>
                <Label htmlFor="modal-admin-note" className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
                  Admin Feedback Note {reviewAction === 'REJECTED' ? '(Required for Rejection)' : '(Optional)'}
                </Label>
                <Textarea
                  id="modal-admin-note"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder={
                    reviewAction === 'REJECTED'
                      ? 'Please write why documents were rejected so applicant can resubmit...'
                      : 'Additional approval notes...'
                  }
                  rows={2}
                  className="text-xs rounded-xl border-slate-200"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReviewModal(false)}
                  disabled={reviewing}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={submitReview}
                  disabled={!reviewAction || reviewing}
                  className={`text-xs font-bold px-5 ${
                    reviewAction === 'APPROVED'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : reviewAction === 'REJECTED'
                      ? 'bg-rose-600 hover:bg-rose-700 text-white'
                      : 'bg-slate-900 text-white'
                  }`}
                >
                  {reviewing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : reviewAction === 'APPROVED' ? (
                    'Confirm Approval'
                  ) : reviewAction === 'REJECTED' ? (
                    'Confirm Rejection'
                  ) : (
                    'Select Decision'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Full Document Lightbox Modal */}
      <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
        <DialogContent className="max-w-3xl p-4">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold flex items-center justify-between">
              <span>{previewDoc?.title}</span>
              {previewDoc && (
                <a
                  href={previewDoc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-normal"
                >
                  Open Original <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </DialogTitle>
          </DialogHeader>
          {previewDoc && (
            <div className="mt-2 max-h-[75vh] overflow-auto flex items-center justify-center bg-slate-50 rounded-xl p-2 border border-slate-200">
              <img
                src={previewDoc.url}
                alt={previewDoc.title}
                className="max-h-[70vh] w-auto object-contain rounded-lg shadow-sm"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
