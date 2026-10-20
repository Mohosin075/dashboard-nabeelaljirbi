'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { useLanguage } from '@/contexts/language-context';
import { useAuthStore } from '@/stores/auth-store';
import {
  BadgeCheck,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  FileCheck2,
  FileText,
  LayoutGrid,
  List,
  Loader2,
  Mail,
  MapPin,
  Phone,
  RotateCcw,
  Search,
  Stethoscope,
  X,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';

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
  const { t, tr } = useLanguage();
  const adminTier = useAuthStore((state) => state.adminTier) || 'SUPER_ADMIN';
  const isReadOnly = adminTier === 'READ_ONLY';
  const [entries, setEntries] = useState<VerificationEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'DOCTOR' | 'CLINIC'>('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Review Modal State
  const [selected, setSelected] = useState<VerificationEntry | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [reviewAction, setReviewAction] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [autoActivateBadge, setAutoActivateBadge] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [togglingBadge, setTogglingBadge] = useState<string | null>(null);

  // Lightbox Preview
  const [previewDoc, setPreviewDoc] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    fetchEntries();
  }, [typeFilter, statusFilter, activeSearch]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = { limit: '100' };
      if (typeFilter !== 'ALL') params['type'] = typeFilter;
      if (statusFilter !== 'ALL') params['status'] = statusFilter;
      if (activeSearch) params['searchTerm'] = activeSearch;

      const res = await apiClient.get('/verification/admin/list', { params });
      setEntries(res.data?.data?.data || res.data?.data || []);
    } catch {
      toast({
        title: t('error', 'Error'),
        description: tr('Failed to load verifications'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setActiveSearch(search.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const openReview = (entry: VerificationEntry) => {
    setSelected(entry);
    setAdminNote(entry.adminNote || '');
    setReviewAction(entry.status === 'PENDING' ? 'APPROVED' : null);
    setAutoActivateBadge(true);
    setShowReviewModal(true);
  };

  const submitReview = async () => {
    if (isReadOnly) return;
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
        title: reviewAction === 'APPROVED' ? t('success', 'Success') : t('rejected', 'Rejected'),
        description: tr(`Verification for ${selected.name} ${reviewAction.toLowerCase()} successfully`),
      });

      setShowReviewModal(false);
      fetchEntries();
    } catch {
      toast({ title: t('error', 'Error'), description: tr('Action failed'), variant: 'destructive' });
    } finally {
      setReviewing(false);
    }
  };

  const toggleBadge = async (entry: VerificationEntry, newValue: boolean) => {
    if (isReadOnly) return;
    setTogglingBadge(entry.id);
    try {
      await apiClient.patch('/verification/admin/toggle-badge', {
        targetId: entry.id,
        type: entry.entityType,
        badgeActive: newValue,
      });
      toast({
        title: newValue ? tr('Badge Activated') : tr('Badge Deactivated'),
        description: tr(`${entry.name}'s Blue Badge is now ${newValue ? 'visible on app' : 'hidden'}.`),
      });
      fetchEntries();
    } catch {
      toast({ title: t('error', 'Error'), description: tr('Failed to toggle badge'), variant: 'destructive' });
    } finally {
      setTogglingBadge(null);
    }
  };

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const pendingCount = entries.filter((e) => e.status === 'PENDING').length;
  const approvedCount = entries.filter((e) => e.status === 'APPROVED').length;
  const badgeActiveCount = entries.filter((e) => e.badgeActive).length;

  if (loading && entries.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── HEADER (MATCHING ADMIN-DOCTORS & CLINICS) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {t('blueBadgeVerifications', 'Blue Badge Verifications')}
          </h1>
          <p className="mt-1 text-sm text-gray-600 sm:text-base">
            {entries.length} {t('verificationRequestsRegistered', 'requests registered')}
          </p>
        </div>

        <div className="relative flex flex-wrap sm:flex-nowrap items-center gap-2">
          <div className="relative flex-1 sm:flex-initial">
            <Search
              className="absolute left-2.5 rtl:left-auto rtl:right-2.5 top-2.5 h-4 w-4 text-muted-foreground cursor-pointer"
              onClick={handleSearch}
            />
            <Input
              placeholder={t('searchVerifications', 'Search applicants by name, phone...')}
              className="pl-8 rtl:pl-3 rtl:pr-8 pr-8 w-full sm:w-[250px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {search && (
              <X
                className="absolute right-2.5 rtl:right-auto rtl:left-2.5 top-2.5 h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600"
                onClick={() => {
                  setSearch('');
                  setActiveSearch('');
                }}
              />
            )}
          </div>
          <Button
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            {t('search', 'Search')}
          </Button>
          <Button
            onClick={fetchEntries}
            variant="outline"
            size="sm"
            title={t('refresh', 'Refresh')}
          >
            <RotateCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* ── STATS OVERVIEW CARDS (MATCHING PREPAID-CARDS & LEGAL-AGREEMENTS) ── */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card
          onClick={() => setStatusFilter('ALL')}
          className={`cursor-pointer transition-all hover:shadow-md ${
            statusFilter === 'ALL' ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200'
          }`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t('totalRequests', 'Total Requests')}
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{entries.length}</div>
            <p className="text-xs text-gray-500 mt-1">{t('allApplicants', 'All registered applicants')}</p>
          </CardContent>
        </Card>

        <Card
          onClick={() => setStatusFilter('PENDING')}
          className={`cursor-pointer transition-all hover:shadow-md ${
            statusFilter === 'PENDING' ? 'border-amber-500 ring-1 ring-amber-500' : 'border-gray-200'
          }`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-amber-700">
              {t('pendingReview', 'Pending Review')}
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
            <p className="text-xs text-amber-600/80 mt-1">
              {pendingCount > 0 ? t('needsAdminReview', 'Needs review') : t('allCaughtUp', 'All caught up')}
            </p>
          </CardContent>
        </Card>

        <Card
          onClick={() => setStatusFilter('APPROVED')}
          className={`cursor-pointer transition-all hover:shadow-md ${
            statusFilter === 'APPROVED' ? 'border-green-500 ring-1 ring-green-500' : 'border-gray-200'
          }`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-green-700">
              {t('approved', 'Approved')}
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
            <p className="text-xs text-green-600/80 mt-1">{t('verifiedEntities', 'Verified credentials')}</p>
          </CardContent>
        </Card>

        <Card
          onClick={() => {
            setStatusFilter('APPROVED');
          }}
          className="cursor-pointer transition-all hover:shadow-md border-gray-200"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-blue-700">
              {t('liveBadges', 'Live Badges')}
            </CardTitle>
            <BadgeCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{badgeActiveCount}</div>
            <p className="text-xs text-blue-600/80 mt-1">{t('visibleInMobileApp', 'Visible in mobile app')}</p>
          </CardContent>
        </Card>
      </div>

      {/* ── FILTER & VIEW BAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Role Filter Tabs (Matching Legal Agreements) */}
        <Tabs
          value={typeFilter}
          onValueChange={(val) => setTypeFilter(val as any)}
          className="w-full sm:w-auto"
        >
          <TabsList className="bg-gray-100 p-1">
            <TabsTrigger value="ALL" className="text-xs sm:text-sm px-4">
              {t('all', 'All')}
            </TabsTrigger>
            <TabsTrigger value="DOCTOR" className="text-xs sm:text-sm px-4">
              {t('doctors', 'Doctors')}
            </TabsTrigger>
            <TabsTrigger value="CLINIC" className="text-xs sm:text-sm px-4">
              {t('clinics', 'Clinics')}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Status Filter Chips + View Mode Switch */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: t('allStatus', 'All Status') },
            { id: 'PENDING', label: t('pending', 'Pending'), count: pendingCount },
            { id: 'APPROVED', label: t('approved', 'Approved'), count: approvedCount },
            { id: 'REJECTED', label: t('rejected', 'Rejected') },
          ].map((s) => (
            <Button
              key={s.id}
              variant={statusFilter === s.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(s.id)}
              className={statusFilter === s.id ? 'bg-blue-600 hover:bg-blue-700 text-white text-xs' : 'text-xs'}
            >
              {s.label}
              {s.count !== undefined && s.count > 0 && (
                <span className={`ml-1.5 rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                  statusFilter === s.id ? 'bg-white/20' : 'bg-amber-100 text-amber-800'
                }`}>
                  {s.count}
                </span>
              )}
            </Button>
          ))}

          {/* Grid / Table View Mode Toggle */}
          <div className="flex items-center rounded-lg border border-gray-200 bg-white p-0.5 ml-auto">
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 rounded-md ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-500'}`}
              onClick={() => setViewMode('grid')}
              title={t('view', 'Grid View')}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 rounded-md ${viewMode === 'table' ? 'bg-gray-100 text-gray-900' : 'text-gray-500'}`}
              onClick={() => setViewMode('table')}
              title={t('view', 'Table View')}
            >
              <List className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* ── APPLICANTS LIST ── */}
      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
          <BadgeCheck className="h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">
            {t('noVerificationsFound', 'No verification requests found')}
          </h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm">
            {activeSearch || statusFilter !== 'ALL' || typeFilter !== 'ALL'
              ? t('noApplicantsMatchFilter', 'No applicants match your active filter criteria.')
              : t('noVerificationsSubmitted', 'There are currently no verification requests submitted.')}
          </p>
          {(activeSearch || statusFilter !== 'ALL' || typeFilter !== 'ALL') && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearch('');
                setActiveSearch('');
                setStatusFilter('ALL');
                setTypeFilter('ALL');
              }}
            >
              {t('clearFilters', 'Clear Filters')}
            </Button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* ── GRID VIEW (MATCHING ADMIN-DOCTORS & CLINICS EXACTLY) ── */
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => {
            const isApproved = entry.status === 'APPROVED';
            const isPending = entry.status === 'PENDING';
            const isRejected = entry.status === 'REJECTED';
            const docCount = (entry.documents ?? []).length;

            return (
              <Card
                key={`${entry.entityType}-${entry.id}`}
                className="transition-shadow hover:shadow-xl hover:scale-[1.01] duration-300 flex flex-col justify-between"
              >
                <CardContent className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Header: Avatar, Name & Entity Badge */}
                    <div className="flex items-start gap-3.5">
                      <div className="relative shrink-0">
                        <Avatar className="h-14 w-14 ring-2 ring-blue-500/30">
                          <AvatarImage src={entry.profileImage ?? ''} className="object-cover" />
                          <AvatarFallback className="bg-blue-100 text-blue-700 font-bold text-base">
                            {entry.entityType === 'DOCTOR' ? (
                              <Stethoscope className="h-6 w-6" />
                            ) : (
                              <Building2 className="h-6 w-6" />
                            )}
                          </AvatarFallback>
                        </Avatar>
                        {entry.badgeActive && (
                          <div
                            className="absolute -bottom-1 -right-1 rtl:right-auto rtl:-left-1 bg-white rounded-full p-0.5 shadow-sm"
                            title={t('badgeActive', 'Blue Badge Active')}
                          >
                            <BadgeCheck className="h-4 w-4 text-blue-500 fill-blue-500 text-white" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1.5">
                          <h3 className="text-base font-bold text-gray-900 truncate">
                            {entry.name}
                          </h3>
                          <Badge
                            variant="outline"
                            className="text-[10px] font-semibold uppercase px-1.5 py-0 shrink-0 border-gray-300"
                          >
                            {entry.entityType === 'DOCTOR' ? t('doctor', 'Doctor') : t('clinic', 'Clinic')}
                          </Badge>
                        </div>

                        <div className="mt-1 flex items-center text-xs text-gray-500 gap-1 truncate">
                          <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                          <span className="truncate">{entry.location || t('locationNa', 'Location N/A')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Speciality / Details Chips */}
                    <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
                      {entry.speciality && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-green-50 px-2.5 py-1 font-semibold text-green-700 border border-green-200">
                          <Stethoscope className="h-3.5 w-3.5 text-green-600 shrink-0" />
                          <span className="truncate max-w-[140px]">{entry.speciality}</span>
                        </span>
                      )}

                      {entry.managerName && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2.5 py-1 font-medium text-purple-700 border border-purple-200">
                          <Building2 className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                          <span className="truncate max-w-[140px]">
                            {t('manager', 'Manager')}: {entry.managerName}
                          </span>
                        </span>
                      )}

                      {/* Status Badge */}
                      {isPending && (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {t('pending', 'Pending')}
                        </Badge>
                      )}
                      {isApproved && (
                        <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-green-600" /> {t('approved', 'Approved')}
                        </Badge>
                      )}
                      {isRejected && (
                        <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100 flex items-center gap-1">
                          <XCircle className="h-3 w-3 text-red-600" /> {t('rejected', 'Rejected')}
                        </Badge>
                      )}

                      {/* Badge Active Chip */}
                      {entry.badgeActive && (
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100 flex items-center gap-1">
                          <BadgeCheck className="h-3 w-3 text-blue-600" /> {t('badgeActive', 'Badge Active')}
                        </Badge>
                      )}
                    </div>

                    {/* Contact & Meta Info */}
                    <div className="mt-3 space-y-1.5 text-xs text-gray-600 border-t pt-2.5">
                      {entry.phoneNumber && (
                        <div className="flex items-center gap-2 truncate">
                          <Phone className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                          <span className="truncate font-mono font-medium text-gray-800" dir="ltr">
                            {entry.phoneNumber}
                          </span>
                        </div>
                      )}

                      {entry.email && entry.email.trim() !== '' && (
                        <div className="flex items-center gap-2 truncate">
                          <Mail className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                          <span className="truncate text-gray-700">{entry.email}</span>
                        </div>
                      )}

                      {/* Documents & Date Box */}
                      <div className="flex items-center justify-between gap-2 text-xs bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-200/70">
                        <div className="flex items-center gap-1">
                          <FileCheck2 className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                          <span className="font-semibold text-gray-800">
                            {docCount} {t('documentsAttached', 'documents attached')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500 text-[11px]">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span>{formatDate(entry.submittedAt)}</span>
                        </div>
                      </div>

                      {entry.adminNote && (
                        <div className="bg-amber-50/70 border border-amber-200/70 p-2 rounded-lg text-[11px] text-amber-900">
                          <span className="font-semibold">{t('description', 'Note')}:</span> {entry.adminNote}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer Actions: Badge Switch (Left) & Review Button (Right) */}
                  <div className="mt-4 border-t pt-3 flex items-center justify-between gap-2">
                    {/* Live Badge Toggle (Available for approved entities) */}
                    {isApproved ? (
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={entry.badgeActive}
                          disabled={isReadOnly || togglingBadge === entry.id}
                          onCheckedChange={(val) => toggleBadge(entry, val)}
                          className="data-[state=checked]:bg-blue-600"
                        />
                        <span className="text-xs font-semibold text-gray-700">
                          {entry.badgeActive ? t('badgeOn', 'Badge On') : t('badgeOff', 'Badge Off')}
                        </span>
                        {togglingBadge === entry.id && (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400 italic">
                        {isPending ? t('approvalRequired', 'Approval required') : t('notActive', 'Not active')}
                      </div>
                    )}

                    <Button
                      size="sm"
                      onClick={() => openReview(entry)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg px-3.5 shadow-sm flex items-center gap-1.5"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>{t('reviewAndDocs', 'Review & Docs')}</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* ── TABLE VIEW (MATCHING PREPAID-CARDS & LEGAL-AGREEMENTS) ── */
        <div className="rounded-md border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-start">{t('applicant', 'Applicant')}</TableHead>
                  <TableHead className="text-start">{t('type', 'Type')}</TableHead>
                  <TableHead className="text-start">{t('contact', 'Contact')}</TableHead>
                  <TableHead className="text-start">{t('status', 'Status')}</TableHead>
                  <TableHead className="text-start">{t('liveBadge', 'Live Badge')}</TableHead>
                  <TableHead className="text-start">{t('documents', 'Documents')}</TableHead>
                  <TableHead className="text-start">{t('submittedDate', 'Submitted')}</TableHead>
                  <TableHead className="text-end">{t('actions', 'Actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => {
                  const isApproved = entry.status === 'APPROVED';
                  const isPending = entry.status === 'PENDING';
                  const isRejected = entry.status === 'REJECTED';
                  const docCount = (entry.documents ?? []).length;

                  return (
                    <TableRow key={`${entry.entityType}-${entry.id}`}>
                      {/* Applicant */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 ring-1 ring-blue-500/20">
                            <AvatarImage src={entry.profileImage ?? ''} />
                            <AvatarFallback className="bg-blue-100 text-blue-700 font-bold text-xs">
                              {entry.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900 truncate">{entry.name}</div>
                            {entry.speciality && (
                              <div className="text-xs text-gray-500 truncate">{entry.speciality}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Type */}
                      <TableCell>
                        <Badge variant="outline" className="text-xs uppercase">
                          {entry.entityType === 'DOCTOR' ? t('doctor', 'Doctor') : t('clinic', 'Clinic')}
                        </Badge>
                      </TableCell>

                      {/* Contact */}
                      <TableCell>
                        <div className="flex flex-col text-xs">
                          {entry.phoneNumber && (
                            <span className="font-mono text-gray-800" dir="ltr">
                              {entry.phoneNumber}
                            </span>
                          )}
                          {entry.email && (
                            <span className="text-gray-500 truncate max-w-[160px]">{entry.email}</span>
                          )}
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        {isPending && (
                          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                            {t('pending', 'Pending')}
                          </Badge>
                        )}
                        {isApproved && (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            {t('approved', 'Approved')}
                          </Badge>
                        )}
                        {isRejected && (
                          <Badge className="bg-red-100 text-red-800 border-red-200">
                            {t('rejected', 'Rejected')}
                          </Badge>
                        )}
                      </TableCell>

                      {/* Live Badge Switch */}
                      <TableCell>
                        {isApproved ? (
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={entry.badgeActive}
                              disabled={isReadOnly || togglingBadge === entry.id}
                              onCheckedChange={(val) => toggleBadge(entry, val)}
                              className="data-[state=checked]:bg-blue-600"
                            />
                            {entry.badgeActive ? (
                              <BadgeCheck className="h-4 w-4 text-blue-600" />
                            ) : (
                              <span className="text-xs text-gray-400">{t('badgeOff', 'Off')}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </TableCell>

                      {/* Documents */}
                      <TableCell>
                        <span className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">
                          <FileCheck2 className="h-3 w-3 text-blue-600" />
                          {docCount}
                        </span>
                      </TableCell>

                      {/* Submitted */}
                      <TableCell className="text-xs text-gray-500 font-mono">
                        {formatDate(entry.submittedAt)}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-end">
                        <Button
                          size="sm"
                          onClick={() => openReview(entry)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          {t('review', 'Review')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* ── REVIEW & DOCUMENTS MODAL (MATCHING ADMIN-DOCTORS DIALOG PATTERN) ── */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-xl">
          <DialogHeader className="pr-12 rtl:pr-0 rtl:pl-12">
            <DialogTitle className="text-lg font-bold flex items-center gap-2.5 flex-wrap">
              <span className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-blue-600" />
                {t('reviewVerificationApp', 'Review Verification Application')}
              </span>
              {selected && (
                <Badge
                  variant={
                    selected.status === 'APPROVED'
                      ? 'default'
                      : selected.status === 'PENDING'
                      ? 'secondary'
                      : 'destructive'
                  }
                  className={`text-xs uppercase px-2.5 py-0.5 ${
                    selected.status === 'APPROVED'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                      : selected.status === 'PENDING'
                      ? 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100'
                      : 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100'
                  }`}
                >
                  {selected.status === 'APPROVED'
                    ? t('approved', 'Approved')
                    : selected.status === 'PENDING'
                    ? t('pending', 'Pending')
                    : t('rejected', 'Rejected')}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-6 pt-2">
              {/* Applicant Header */}
              <div className="flex items-start gap-4 pb-4 border-b">
                <Avatar className="h-16 w-16 ring-2 ring-blue-500 shrink-0">
                  <AvatarImage src={selected.profileImage ?? ''} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 font-bold text-lg">
                    {selected.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold text-gray-900">{selected.name}</h2>
                    <Badge variant="outline" className="text-xs uppercase border-gray-300">
                      {selected.entityType === 'DOCTOR' ? t('doctor', 'Doctor') : t('clinic', 'Clinic')}
                    </Badge>
                  </div>

                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-600">
                    {selected.speciality && (
                      <span className="font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded">
                        {selected.speciality}
                      </span>
                    )}
                    {selected.managerName && (
                      <span>{t('manager', 'Manager')}: {selected.managerName}</span>
                    )}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-gray-500 font-mono">
                    {selected.phoneNumber && (
                      <span className="flex items-center gap-1" dir="ltr">
                        <Phone className="h-3.5 w-3.5 text-blue-600" /> {selected.phoneNumber}
                      </span>
                    )}
                    {selected.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5 text-blue-600" /> {selected.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Submitted Documents Gallery */}
              <div>
                <div className="flex items-center justify-between pb-2 border-b mb-3">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <FileCheck2 className="h-4 w-4 text-blue-600" />
                    {t('submittedVerificationDocs', 'Submitted Verification Documents')} ({(selected.documents ?? []).length})
                  </h3>
                </div>

                {selected.documents && selected.documents.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selected.documents.map((doc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100/70 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="h-9 w-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 font-bold text-xs">
                            DOC
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-900 truncate">{doc.title}</p>
                            <p className="text-[11px] text-gray-500 font-mono truncate">
                              {formatDate(doc.uploadedAt || selected.submittedAt)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setPreviewDoc(doc)}
                            className="text-xs h-7 px-2"
                          >
                            {t('preview', 'Preview')}
                          </Button>
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-gray-700 p-1"
                            title={t('openOriginal', 'Open direct file URL')}
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-500 font-medium">
                      {t('noDocsAttachedYet', 'No documents attached yet.')}
                    </p>
                  </div>
                )}
              </div>

              {/* Notes from applicant */}
              {selected.notes && (
                <div>
                  <Label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 block">
                    {t('notesFromApplicant', 'Notes from Applicant')}
                  </Label>
                  <p className="text-xs text-gray-700 p-3 bg-gray-50 rounded-xl border border-gray-200">
                    {selected.notes}
                  </p>
                </div>
              )}

              {/* Arabic Disclaimer Notice */}
              <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200/60">
                <p className="text-xs font-bold text-blue-900 mb-1">
                  ⚖️ {t('arabicDisclaimerTitle', 'Arabic Disclaimer (Displayed on mobile app upon clicking badge)')}
                </p>
                <p dir="rtl" className="text-xs text-gray-700 leading-relaxed text-right font-sans">
                  {ARABIC_NOTICE}
                </p>
              </div>

              {/* Read-Only Notice */}
              {isReadOnly && (
                <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 font-medium">
                  {t('readOnlyNotice', 'Read-Only Mode: You have inspection access only. Approving, rejecting, or toggling badges is restricted.')}
                </div>
              )}

              {/* Decision Selection */}
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">
                  {t('selectDecision', 'Select Decision')}
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => !isReadOnly && setReviewAction('APPROVED')}
                    disabled={isReadOnly}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      reviewAction === 'APPROVED'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'text-emerald-700 bg-emerald-50/50 border-emerald-200 hover:bg-emerald-50'
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" /> {t('approveApplication', 'Approve Application')}
                  </button>
                  <button
                    type="button"
                    onClick={() => !isReadOnly && setReviewAction('REJECTED')}
                    disabled={isReadOnly}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      reviewAction === 'REJECTED'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : 'text-rose-700 bg-rose-50/50 border-rose-200 hover:bg-rose-50'
                    }`}
                  >
                    <XCircle className="h-4 w-4" /> {t('rejectApplication', 'Reject Application')}
                  </button>
                </div>
              </div>

              {/* Instant Badge Activation switch */}
              {reviewAction === 'APPROVED' && (
                <div className="flex items-center justify-between p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl">
                  <div>
                    <p className="text-xs font-bold text-emerald-900">
                      {t('activateBadgeImmediately', 'Activate Blue Badge Immediately')}
                    </p>
                    <p className="text-[11px] text-emerald-700">
                      {t('activateBadgeImmediatelyDesc', 'When enabled, badge will be visible immediately on the public patient app.')}
                    </p>
                  </div>
                  <Switch
                    checked={autoActivateBadge}
                    onCheckedChange={setAutoActivateBadge}
                    disabled={isReadOnly}
                    className="data-[state=checked]:bg-emerald-600"
                  />
                </div>
              )}

              {/* Admin Feedback Note */}
              <div>
                <Label htmlFor="admin-note" className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 block">
                  {t('adminFeedbackNote', 'Admin Feedback Note')}{' '}
                  {reviewAction === 'REJECTED'
                    ? t('requiredForRejection', '(Required for Rejection)')
                    : t('optionalFeedback', '(Optional)')}
                </Label>
                <Textarea
                  id="admin-note"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  disabled={isReadOnly}
                  placeholder={
                    reviewAction === 'REJECTED'
                      ? t('specifyRejectionReason', 'Please specify reason for rejection so applicant can rectify...')
                      : t('additionalNotesPlaceholder', 'Additional approval notes...')
                  }
                  rows={2}
                  className="text-xs rounded-xl border-gray-200 disabled:bg-gray-100"
                />
              </div>

              {/* Dialog Footer Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReviewModal(false)}
                  disabled={reviewing}
                  className="rounded-xl text-xs"
                >
                  {isReadOnly ? t('close', 'Close') : t('cancel', 'Cancel')}
                </Button>
                {!isReadOnly && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={submitReview}
                    disabled={!reviewAction || reviewing}
                    className={`rounded-xl text-xs font-bold px-4 ${
                      reviewAction === 'APPROVED'
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : reviewAction === 'REJECTED'
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    {reviewing ? <Loader2 className="h-4 w-4 animate-spin" /> : t('confirmDecision', 'Confirm Decision')}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── LIGHTBOX MODAL ── */}
      <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
        <DialogContent className="max-w-3xl p-4 rounded-2xl">
          <DialogHeader className="pr-12 rtl:pr-0 rtl:pl-12">
            <DialogTitle className="text-sm font-semibold flex items-center gap-3 flex-wrap">
              <span className="truncate max-w-[280px] sm:max-w-md">{previewDoc?.title}</span>
              {previewDoc && (
                <a
                  href={previewDoc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-normal bg-blue-50 px-2 py-0.5 rounded border border-blue-200"
                >
                  {t('openOriginal', 'Open Original')} <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </DialogTitle>
          </DialogHeader>
          {previewDoc && (
            <div className="mt-2 max-h-[75vh] overflow-auto flex items-center justify-center bg-gray-50 rounded-xl p-2 border border-gray-200">
              <img
                src={previewDoc.url}
                alt={previewDoc.title}
                className="max-h-[70vh] w-auto object-contain rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
