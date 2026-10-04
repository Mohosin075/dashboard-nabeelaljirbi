'use client';

import { useState, useEffect } from 'react';
import {
  legalAgreementService,
  LegalDocument,
  UserRole,
  PublishLegalDocumentPayload,
  UserAcceptanceRecord,
} from '@/services/legal-agreement.service';
import { getErrorMessage } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  FileText,
  Plus,
  CheckCircle2,
  Clock,
  Users,
  Eye,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

export default function LegalAgreementsPage() {
  const { t, isRTL } = useLanguage();
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<'ALL' | UserRole>('ALL');

  // Modals
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [viewDocModalOpen, setViewDocModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<LegalDocument | null>(null);

  // Acceptances Audit Modal
  const [acceptancesModalOpen, setAcceptancesModalOpen] = useState(false);
  const [acceptancesLoading, setAcceptancesLoading] = useState(false);
  const [acceptancesList, setAcceptancesList] = useState<UserAcceptanceRecord[]>([]);
  const [acceptanceDoc, setAcceptanceDoc] = useState<LegalDocument | null>(null);

  // Form State
  const [publishing, setPublishing] = useState(false);
  const [formLang, setFormLang] = useState<'en' | 'ar'>('en');
  const [formData, setFormData] = useState<PublishLegalDocumentPayload>({
    role: 'PATIENT',
    title: '',
    titleAr: '',
    content: '',
    contentAr: '',
    version: '1.1',
    effectiveDate: new Date().toISOString().split('T')[0] ?? '',
    requireReacceptance: false,
  });

  const { toast } = useToast();

  // Show ONLY the active UI language (fall back to the other one if missing)
  const pick = (en?: string | null, ar?: string | null) =>
    isRTL ? ar || en || '' : en || ar || '';
  const fmtDate = (d: string | Date) =>
    new Date(d).toLocaleDateString(isRTL ? 'ar-u-nu-latn' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  const fmtDateTime = (d: string | Date) =>
    new Date(d).toLocaleString(isRTL ? 'ar-u-nu-latn' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  const activeVersionLabel = (role: UserRole) => {
    const v = documents.find((d) => d.role === role && d.isActive)?.version;
    return v ? `v${v}` : isRTL ? 'v1.0 (نشط)' : 'v1.0 (Active)';
  };

  useEffect(() => {
    loadDocuments();
  }, [selectedRole]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const params: { role?: UserRole; limit: number } = { limit: 50 };
      if (selectedRole !== 'ALL') {
        params.role = selectedRole;
      }
      const response = await legalAgreementService.getAllDocuments(params);
      setDocuments(response.data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: getErrorMessage(error) || 'Failed to load legal documents',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewAcceptances = async (doc: LegalDocument) => {
    setAcceptanceDoc(doc);
    setAcceptancesModalOpen(true);
    try {
      setAcceptancesLoading(true);
      const res = await legalAgreementService.getDocumentAcceptances(doc.id, { limit: 100 });
      setAcceptancesList(res.data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: getErrorMessage(error) || 'Failed to load user acceptances',
        variant: 'destructive',
      });
    } finally {
      setAcceptancesLoading(false);
    }
  };

  const suggestNextVersion = (currentVer: string) => {
    const parts = currentVer.split('.');
    if (parts.length >= 2 && !isNaN(Number(parts[1]))) {
      return `${parts[0]}.${Number(parts[1]) + 1}`;
    }
    return `${currentVer}.1`;
  };

  const handleOpenPublish = (sourceDoc?: LegalDocument) => {
    if (sourceDoc) {
      setFormData({
        role: sourceDoc.role,
        title: sourceDoc.title,
        titleAr: sourceDoc.titleAr || '',
        content: sourceDoc.content,
        contentAr: sourceDoc.contentAr || '',
        version: suggestNextVersion(sourceDoc.version),
        effectiveDate: new Date().toISOString().split('T')[0] ?? '',
        requireReacceptance: false,
      });
    } else {
      const targetRole = selectedRole !== 'ALL' ? selectedRole : 'PATIENT';
      const activeDoc = documents.find((d) => d.role === targetRole && d.isActive);
      if (activeDoc) {
        setFormData({
          role: targetRole,
          title: activeDoc.title,
          titleAr: activeDoc.titleAr || '',
          content: activeDoc.content,
          contentAr: activeDoc.contentAr || '',
          version: suggestNextVersion(activeDoc.version),
          effectiveDate: new Date().toISOString().split('T')[0] ?? '',
          requireReacceptance: false,
        });
      } else {
        setFormData({
          role: targetRole,
          title: `${targetRole.charAt(0) + targetRole.slice(1).toLowerCase()} Terms of Service & Agreement`,
          titleAr: '',
          content: '',
          contentAr: '',
          version: '1.1',
          effectiveDate: new Date().toISOString().split('T')[0] ?? '',
          requireReacceptance: false,
        });
      }
    }
    setFormLang(isRTL ? 'ar' : 'en');
    setPublishModalOpen(true);
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content || !formData.version) {
      if (!formData.title || !formData.content) setFormLang('en');
      toast({
        title: 'Validation Error',
        description: 'Please fill in Title, Content, and Version',
        variant: 'destructive',
      });
      return;
    }

    try {
      setPublishing(true);
      await legalAgreementService.publishNewVersion(formData);
      toast({
        title: 'Success',
        description: `Version ${formData.version} published successfully!`,
      });
      setPublishModalOpen(false);
      loadDocuments();
    } catch (error: any) {
      toast({
        title: 'Publish Failed',
        description: getErrorMessage(error) || 'Could not publish new version',
        variant: 'destructive',
      });
    } finally {
      setPublishing(false);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'PATIENT':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">{t('patient')}</Badge>;
      case 'DOCTOR':
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">{t('doctor')}</Badge>;
      case 'CLINIC':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">{t('clinic')}</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary flex-shrink-0" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {t('legalAgreementsTitle')}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t('legalAgreementsDesc')}
          </p>
        </div>
        <Button
          onClick={() => handleOpenPublish()}
          className="bg-primary hover:bg-primary/90 text-white shadow-sm flex items-center justify-center gap-2 w-full sm:w-auto shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>{t('publishNewVersion')}</span>
        </Button>
      </div>

      {/* Role Filter Tabs */}
      <Tabs
        value={selectedRole}
        onValueChange={(val) => setSelectedRole(val as any)}
        className="w-full"
      >
        <TabsList className="bg-slate-100 p-1 grid grid-cols-2 sm:grid-cols-4 w-full h-auto gap-1">
          <TabsTrigger value="ALL" className="text-xs sm:text-sm py-1.5">{t('allDocuments')}</TabsTrigger>
          <TabsTrigger value="PATIENT" className="text-xs sm:text-sm py-1.5">{t('patients')}</TabsTrigger>
          <TabsTrigger value="DOCTOR" className="text-xs sm:text-sm py-1.5">{t('doctors')}</TabsTrigger>
          <TabsTrigger value="CLINIC" className="text-xs sm:text-sm py-1.5">{t('clinics')}</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Overview Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">{t('activePatientPolicy')}</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <div className="text-xl font-bold text-slate-800">
                {activeVersionLabel('PATIENT')}
              </div>
            )}
            <p className="text-xs text-slate-400 mt-1">{t('defaultRegEntry')}</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">{t('activeDoctorAgreement')}</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <div className="text-xl font-bold text-slate-800">
                {activeVersionLabel('DOCTOR')}
              </div>
            )}
            <p className="text-xs text-slate-400 mt-1">{t('forPractitioners')}</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">{t('activeClinicAgreement')}</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <div className="text-xl font-bold text-slate-800">
                {activeVersionLabel('CLINIC')}
              </div>
            )}
            <p className="text-xs text-slate-400 mt-1">{t('forMedicalCenters')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Documents Table */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg">{t('legalDocumentsAndHistory')}</CardTitle>
          <CardDescription>
            {t('legalDocHistoryDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
          {/* Mobile: stacked cards */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:hidden">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full rounded-lg" />
              ))
            ) : documents.length === 0 ? (
              <div className="text-center py-8 text-sm text-slate-500">{t('noLegalDocsFound')}</div>
            ) : (
              documents.map((doc) => (
                <div key={doc.id} className="rounded-lg border border-slate-200 bg-white p-3 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-medium text-slate-800 break-words">
                        {pick(doc.title, doc.titleAr)}
                      </div>
                    </div>
                    <div className="shrink-0">{getRoleBadge(doc.role)}</div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-semibold text-slate-700">v{doc.version}</span>
                    {doc.isActive ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{t('active')}</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-slate-500">{t('archived')}</Badge>
                    )}
                    {doc.requireReacceptance ? (
                      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 text-xs">{t('mandatory')}</Badge>
                    ) : (
                      <span className="text-slate-400">{t('optional')}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {fmtDate(doc.effectiveDate)}
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      {doc._count?.acceptances || 0}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" size="sm" className="h-9 px-1 text-xs gap-1" onClick={() => handleViewAcceptances(doc)}>
                      <Users className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                      <span className="truncate">{t('acceptances')}</span>
                    </Button>
                    <Button variant="outline" size="sm" className="h-9 px-1 text-xs gap-1" onClick={() => { setSelectedDoc(doc); setViewDocModalOpen(true); }}>
                      <Eye className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{t('view')}</span>
                    </Button>
                    <Button variant="outline" size="sm" className="h-9 px-1 text-xs gap-1 text-primary border-primary/20" onClick={() => handleOpenPublish(doc)}>
                      <Plus className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{t('newVersion')}</span>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop/tablet: table */}
          <div className="hidden xl:block overflow-x-auto">
            <Table className="min-w-[900px]">
            <TableHeader>
              <TableRow className="bg-slate-50/70">
                <TableHead className="text-start">{t('role')}</TableHead>
                <TableHead className="text-start">{t('title', 'Title')}</TableHead>
                <TableHead className="text-start">{t('version')}</TableHead>
                <TableHead className="text-start">{t('status')}</TableHead>
                <TableHead className="text-start">{t('effectiveDate')}</TableHead>
                <TableHead className="text-start">{t('reacceptance')}</TableHead>
                <TableHead className="text-start">{t('acceptedUsers')}</TableHead>
                <TableHead className="text-end">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-12" /></TableCell>
                    <TableCell className="text-end"><Skeleton className="h-8 w-20 ms-auto" /></TableCell>
                  </TableRow>
                ))
              ) : documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                    {t('noLegalDocsFound')}
                  </TableCell>
                </TableRow>
              ) : (
                documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>{getRoleBadge(doc.role)}</TableCell>
                    <TableCell className="max-w-[280px]">
                      <div className="font-medium text-slate-800 break-words">
                        {pick(doc.title, doc.titleAr)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-slate-700">v{doc.version}</span>
                    </TableCell>
                    <TableCell>
                      {doc.isActive ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          {t('active')}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-slate-500">
                          {t('archived')}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {fmtDate(doc.effectiveDate)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {doc.requireReacceptance ? (
                        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 text-xs">
                          {t('mandatory')}
                        </Badge>
                      ) : (
                        <span className="text-xs text-slate-400">{t('optional')}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 font-medium text-slate-700">
                        <Users className="h-3.5 w-3.5 text-slate-400" />
                        {doc._count?.acceptances || 0}
                      </div>
                    </TableCell>
                    <TableCell className="text-end">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap sm:flex-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewAcceptances(doc)}
                          className="text-xs gap-1 h-8 px-2 text-slate-600 hover:text-slate-900 border-slate-200"
                        >
                          <Users className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                          <span>{t('acceptances')} ({doc._count?.acceptances || 0})</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedDoc(doc);
                            setViewDocModalOpen(true);
                          }}
                          className="text-xs gap-1 h-8 px-2"
                        >
                          <Eye className="h-3.5 w-3.5 shrink-0" />
                          <span className="hidden sm:inline">{t('view')}</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenPublish(doc)}
                          className="text-xs gap-1 h-8 px-2 text-primary hover:bg-primary/10 border-primary/20"
                          title={t('createNewVersionTitle')}
                        >
                          <Plus className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="hidden sm:inline">{t('newVersion')}</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal: Publish New Version */}
      <Dialog open={publishModalOpen} onOpenChange={setPublishModalOpen}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>{t('publishLegalDoc')}</DialogTitle>
            <DialogDescription>
              {t('publishLegalDocDesc')}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePublish} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="role">{t('targetRole')}</Label>
                <select
                  id="role"
                  className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value as UserRole })
                  }
                >
                  <option value="PATIENT">{t('patient')}</option>
                  <option value="DOCTOR">{t('doctor')}</option>
                  <option value="CLINIC">{t('clinic')}</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="version">{t('versionNumber')}</Label>
                <Input
                  id="version"
                  placeholder={isRTL ? 'مثال: 2.0' : 'e.g. 2.0'}
                  value={formData.version}
                  onChange={(e) =>
                    setFormData({ ...formData, version: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="effectiveDate">{t('effectiveDate')}</Label>
              <Input
                id="effectiveDate"
                type="date"
                value={formData.effectiveDate}
                onChange={(e) =>
                  setFormData({ ...formData, effectiveDate: e.target.value })
                }
                required
              />
            </div>

            {/* One language at a time */}
            <div className="space-y-3 rounded-lg border border-slate-200 p-3 sm:p-4">
              <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setFormLang('en')}
                  className={`rounded-md py-1.5 text-sm font-medium transition ${
                    formLang === 'en' ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setFormLang('ar')}
                  className={`rounded-md py-1.5 text-sm font-medium transition ${
                    formLang === 'ar' ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  العربية
                </button>
              </div>

              {formLang === 'en' ? (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="title">{t('docTitleEn')}</Label>
                    <Input
                      id="title"
                      dir="ltr"
                      placeholder="e.g. Patient Terms of Service & Privacy Policy"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="content">{t('contentEn')}</Label>
                    <Textarea
                      id="content"
                      dir="ltr"
                      rows={8}
                      placeholder="Enter detailed legal terms, obligations, cancellation rules..."
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="titleAr">{t('docTitleAr')}</Label>
                    <Input
                      id="titleAr"
                      dir="rtl"
                      placeholder="مثال: شروط خدمة وسياسة خصوصية المريض"
                      value={formData.titleAr}
                      onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="contentAr">{t('contentAr')}</Label>
                    <Textarea
                      id="contentAr"
                      dir="rtl"
                      rows={8}
                      placeholder="أدخل الشروط والأحكام باللغة العربية..."
                      value={formData.contentAr}
                      onChange={(e) => setFormData({ ...formData, contentAr: e.target.value })}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Re-acceptance Toggle */}
            <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50/50 p-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-amber-900">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  {t('requireReacceptanceNotice')}
                </div>
                <div className="text-xs text-amber-700">
                  {t('requireReacceptanceDesc')}
                </div>
              </div>
              <Switch
                checked={formData.requireReacceptance}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, requireReacceptance: checked })
                }
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPublishModalOpen(false)}
              >
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={publishing} className="bg-primary text-white">
                {publishing ? t('saving') : t('publish')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: View Document Content */}
      <Dialog open={viewDocModalOpen} onOpenChange={setViewDocModalOpen}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[85vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <div className="flex items-center gap-2 flex-wrap">
              {selectedDoc && getRoleBadge(selectedDoc.role)}
              <span className="text-sm font-bold text-slate-500">v{selectedDoc?.version}</span>
              {selectedDoc?.isActive && (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">
                  {t('activeVersion')}
                </Badge>
              )}
            </div>
            <DialogTitle className="text-lg sm:text-xl mt-1 break-words">
              {selectedDoc ? pick(selectedDoc.title, selectedDoc.titleAr) : ''}
            </DialogTitle>
            <DialogDescription>
              {t('effectiveDate')}: {selectedDoc && fmtDate(selectedDoc.effectiveDate)}
            </DialogDescription>
          </DialogHeader>

          <div className="pt-2">
            <div
              dir={isRTL ? 'rtl' : 'ltr'}
              className="p-3.5 bg-slate-50 rounded-lg text-sm text-slate-700 whitespace-pre-wrap break-words leading-relaxed border border-slate-100 max-h-[50vh] overflow-y-auto"
            >
              {selectedDoc ? pick(selectedDoc.content, selectedDoc.contentAr) : ''}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setViewDocModalOpen(false)}>
              {t('close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: View Acceptances Audit Log */}
      <Dialog open={acceptancesModalOpen} onOpenChange={setAcceptancesModalOpen}>
        <DialogContent className="w-[95vw] max-w-3xl max-h-[85vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <div className="flex items-center gap-2">
              {acceptanceDoc && getRoleBadge(acceptanceDoc.role)}
              <span className="text-sm font-bold text-slate-500">v{acceptanceDoc?.version}</span>
            </div>
            <DialogTitle className="text-xl mt-1">{t('acceptanceAuditTrail')}</DialogTitle>
            <DialogDescription>
              {isRTL
                ? `سجل مباشر للمستخدمين الذين وافقوا على ${acceptanceDoc ? pick(acceptanceDoc.title, acceptanceDoc.titleAr) : ''} (الإصدار ${acceptanceDoc?.version ?? ''}).`
                : `Live record of users who accepted ${acceptanceDoc ? pick(acceptanceDoc.title, acceptanceDoc.titleAr) : ''} (Version ${acceptanceDoc?.version ?? ''}).`}
            </DialogDescription>
          </DialogHeader>

          <div className="pt-2">
            {acceptancesLoading ? (
              <div className="space-y-2 py-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : acceptancesList.length === 0 ? (
              <div className="text-center py-10 text-slate-500 border rounded-lg bg-slate-50/50">
                <Users className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="font-medium text-slate-600">{t('noAcceptancesYet')}</p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-x-auto">
                <Table className="min-w-[560px]">
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="text-start">{t('patient')}</TableHead>
                      <TableHead className="text-start">{t('role')}</TableHead>
                      <TableHead className="text-start">{t('acceptedDateTime')}</TableHead>
                      <TableHead className="text-start">{t('ipAddress')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {acceptancesList.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div className="font-medium text-slate-900">
                            {record.user?.fullName || t('registeredUser')}
                          </div>
                          <div className="text-xs text-slate-500 font-mono">
                            {record.user?.phoneNumber || t('noPhone')}
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(record.role)}</TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {fmtDateTime(record.acceptedAt)}
                        </TableCell>
                        <TableCell className="text-xs text-slate-500 font-mono">
                          {record.ipAddress || '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setAcceptancesModalOpen(false)}>
              {t('close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
