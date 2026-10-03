'use client';

import { useState, useEffect } from 'react';
import {
  legalAgreementService,
  LegalDocument,
  UserRole,
  PublishLegalDocumentPayload,
  UserAcceptanceRecord,
} from '@/services/legal-agreement.service';
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

export default function LegalAgreementsPage() {
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
        description: error?.message || 'Failed to load legal documents',
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
        description: error?.message || 'Failed to load user acceptances',
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
    setPublishModalOpen(true);
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content || !formData.version) {
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
        description: error?.message || 'Could not publish new version',
        variant: 'destructive',
      });
    } finally {
      setPublishing(false);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'PATIENT':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Patient</Badge>;
      case 'DOCTOR':
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Doctor</Badge>;
      case 'CLINIC':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Clinic</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Legal Agreements & Policies
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manage terms of service, version controls, effective dates, and audit trail of user acceptances.
          </p>
        </div>
        <Button
          onClick={() => handleOpenPublish()}
          className="bg-primary hover:bg-primary/90 text-white shadow-sm flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Publish New Version
        </Button>
      </div>

      {/* Role Filter Tabs */}
      <Tabs
        value={selectedRole}
        onValueChange={(val) => setSelectedRole(val as any)}
        className="w-full"
      >
        <TabsList className="bg-slate-100 p-1">
          <TabsTrigger value="ALL">All Documents</TabsTrigger>
          <TabsTrigger value="PATIENT">Patients</TabsTrigger>
          <TabsTrigger value="DOCTOR">Doctors</TabsTrigger>
          <TabsTrigger value="CLINIC">Clinics</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Active Patient Policy</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <div className="text-xl font-bold text-slate-800">
                {documents.find((d) => d.role === 'PATIENT' && d.isActive)?.version
                  ? `v${documents.find((d) => d.role === 'PATIENT' && d.isActive)?.version}`
                  : 'v1.0 (Active)'}
              </div>
            )}
            <p className="text-xs text-slate-400 mt-1">Default registration entry point</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Active Doctor Agreement</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <div className="text-xl font-bold text-slate-800">
                {documents.find((d) => d.role === 'DOCTOR' && d.isActive)?.version
                  ? `v${documents.find((d) => d.role === 'DOCTOR' && d.isActive)?.version}`
                  : 'v1.0 (Active)'}
              </div>
            )}
            <p className="text-xs text-slate-400 mt-1">For independent verified practitioners</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Active Clinic Agreement</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <div className="text-xl font-bold text-slate-800">
                {documents.find((d) => d.role === 'CLINIC' && d.isActive)?.version
                  ? `v${documents.find((d) => d.role === 'CLINIC' && d.isActive)?.version}`
                  : 'v1.0 (Active)'}
              </div>
            )}
            <p className="text-xs text-slate-400 mt-1">For medical centers and clinics</p>
          </CardContent>
        </Card>
      </div>

      {/* Documents Table */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Legal Documents & Version History</CardTitle>
          <CardDescription>
            Historical records are never erased. Publishing a new version archives the previous version and records new user acceptances.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/70">
                <TableHead>Role</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Effective Date</TableHead>
                <TableHead>Re-acceptance</TableHead>
                <TableHead>Accepted Users</TableHead>
                <TableHead className="text-right">Actions</TableHead>
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
                    <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                    No legal documents found. Click "Publish New Version" to create one.
                  </TableCell>
                </TableRow>
              ) : (
                documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>{getRoleBadge(doc.role)}</TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-800">{doc.title}</div>
                      {doc.titleAr && (
                        <div className="text-xs text-slate-400 font-sans" dir="rtl">{doc.titleAr}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-slate-700">v{doc.version}</span>
                    </TableCell>
                    <TableCell>
                      {doc.isActive ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-slate-500">
                          Archived
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {new Date(doc.effectiveDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      {doc.requireReacceptance ? (
                        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 text-xs">
                          Mandatory
                        </Badge>
                      ) : (
                        <span className="text-xs text-slate-400">Optional</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 font-medium text-slate-700">
                        <Users className="h-3.5 w-3.5 text-slate-400" />
                        {doc._count?.acceptances || 0}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewAcceptances(doc)}
                          className="text-xs gap-1.5 h-8 text-slate-600 hover:text-slate-900 border-slate-200"
                        >
                          <Users className="h-3.5 w-3.5 text-blue-600" />
                          Acceptances ({doc._count?.acceptances || 0})
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedDoc(doc);
                            setViewDocModalOpen(true);
                          }}
                          className="text-xs gap-1.5 h-8"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenPublish(doc)}
                          className="text-xs gap-1.5 h-8 text-primary hover:bg-primary/10 border-primary/20"
                          title="Create new version based on this document"
                        >
                          <Plus className="h-3.5 w-3.5 text-primary" />
                          New Version
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal: Publish New Version */}
      <Dialog open={publishModalOpen} onOpenChange={setPublishModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Publish New Legal Document Version</DialogTitle>
            <DialogDescription>
              Publishing a new version will make it the active agreement for the selected role. Previous acceptance records are preserved.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePublish} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="role">Target Role</Label>
                <select
                  id="role"
                  className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value as UserRole })
                  }
                >
                  <option value="PATIENT">Patient</option>
                  <option value="DOCTOR">Doctor</option>
                  <option value="CLINIC">Clinic</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="version">Version Number</Label>
                <Input
                  id="version"
                  placeholder="e.g. 2.0"
                  value={formData.version}
                  onChange={(e) =>
                    setFormData({ ...formData, version: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="effectiveDate">Effective Date</Label>
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

            <div className="space-y-1.5">
              <Label htmlFor="title">Document Title (English)</Label>
              <Input
                id="title"
                placeholder="e.g. Patient Terms of Service & Privacy Policy"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="titleAr">Document Title (Arabic - Optional)</Label>
              <Input
                id="titleAr"
                dir="rtl"
                placeholder="مثال: شروط خدمة وسياسة خصوصية المريض"
                value={formData.titleAr}
                onChange={(e) =>
                  setFormData({ ...formData, titleAr: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="content">Content (English)</Label>
              <Textarea
                id="content"
                rows={6}
                placeholder="Enter detailed legal terms, obligations, cancellation rules..."
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contentAr">Content (Arabic - Optional)</Label>
              <Textarea
                id="contentAr"
                rows={6}
                dir="rtl"
                placeholder="أدخل الشروط والأحكام باللغة العربية..."
                value={formData.contentAr}
                onChange={(e) =>
                  setFormData({ ...formData, contentAr: e.target.value })
                }
              />
            </div>

            {/* Re-acceptance Toggle */}
            <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50/50 p-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-amber-900">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  Require re-acceptance from existing users
                </div>
                <div className="text-xs text-amber-700">
                  When enabled, all existing users of this role will be prompted to accept this new version upon their next app session.
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
                Cancel
              </Button>
              <Button type="submit" disabled={publishing} className="bg-primary text-white">
                {publishing ? 'Publishing...' : 'Publish Version'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: View Document Content */}
      <Dialog open={viewDocModalOpen} onOpenChange={setViewDocModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              {selectedDoc && getRoleBadge(selectedDoc.role)}
              <span className="text-sm font-bold text-slate-500">v{selectedDoc?.version}</span>
              {selectedDoc?.isActive && (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">
                  Active Version
                </Badge>
              )}
            </div>
            <DialogTitle className="text-xl mt-1">{selectedDoc?.title}</DialogTitle>
            <DialogDescription>
              Effective Date: {selectedDoc && new Date(selectedDoc.effectiveDate).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                English Text
              </h4>
              <div className="p-3.5 bg-slate-50 rounded-lg text-sm text-slate-700 whitespace-pre-wrap leading-relaxed border border-slate-100">
                {selectedDoc?.content}
              </div>
            </div>

            {selectedDoc?.contentAr && (
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Arabic Text (النص العربي)
                </h4>
                <div
                  dir="rtl"
                  className="p-3.5 bg-slate-50 rounded-lg text-sm text-slate-700 whitespace-pre-wrap leading-relaxed border border-slate-100 font-sans"
                >
                  {selectedDoc?.contentAr}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setViewDocModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: View Acceptances Audit Log */}
      <Dialog open={acceptancesModalOpen} onOpenChange={setAcceptancesModalOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              {acceptanceDoc && getRoleBadge(acceptanceDoc.role)}
              <span className="text-sm font-bold text-slate-500">v{acceptanceDoc?.version}</span>
            </div>
            <DialogTitle className="text-xl mt-1">Acceptance Audit Trail</DialogTitle>
            <DialogDescription>
              Live record of users who accepted {acceptanceDoc?.title} (Version {acceptanceDoc?.version}).
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
                <p className="font-medium text-slate-600">No user acceptances recorded yet for this version.</p>
                <p className="text-xs text-slate-400 mt-1">
                  Users will be recorded here automatically when they register or accept the update.
                </p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>User / Phone</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Accepted Date & Time</TableHead>
                      <TableHead>IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {acceptancesList.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div className="font-medium text-slate-900">
                            {record.user?.fullName || 'Registered User'}
                          </div>
                          <div className="text-xs text-slate-500 font-mono">
                            {record.user?.phoneNumber || 'No phone'}
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(record.role)}</TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {new Date(record.acceptedAt).toLocaleString()}
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
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
