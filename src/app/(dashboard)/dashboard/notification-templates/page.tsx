'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  Edit,
  Loader2,
  RefreshCw,
  Search,
  Sparkles,
  Smartphone,
  MessageSquare,
  MessageCircle,
  Copy,
  Check,
  LayoutGrid,
  Table as TableIcon,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  notificationTemplateService,
  NotificationTemplate,
  UpdateNotificationTemplateDto,
} from '@/services/notification-template.service';
import { useLanguage } from '@/contexts/language-context';

// Category classifications
type EventCategory = 'ALL' | 'LIFECYCLE' | 'REMINDERS' | 'EXCEPTIONS' | 'SECURITY';

const CATEGORY_MAP: Record<string, EventCategory> = {
  BOOKING_REQUEST_SENT: 'LIFECYCLE',
  BOOKING_CONFIRMED: 'LIFECYCLE',
  BOOKING_ARRIVED: 'LIFECYCLE',
  BOOKING_COMPLETED: 'LIFECYCLE',
  REMINDER_24H: 'REMINDERS',
  REMINDER_3H: 'REMINDERS',
  BOOKING_REJECTED: 'EXCEPTIONS',
  BOOKING_CANCELLED: 'EXCEPTIONS',
  DOCTOR_ABSENCE: 'EXCEPTIONS',
  BOOKING_NO_SHOW: 'EXCEPTIONS',
  BOOKING_NEGLECTED: 'EXCEPTIONS',
  OTP_VERIFICATION: 'SECURITY',
};

const CATEGORY_LABELS: Record<EventCategory, string> = {
  ALL: 'All Events',
  LIFECYCLE: 'Booking Lifecycle',
  REMINDERS: 'Reminders',
  EXCEPTIONS: 'Absence & Exceptions',
  SECURITY: 'Security & OTP',
};

// Realistic mock data for dynamic preview
const SAMPLE_VARIABLES: Record<string, { en: string; ar: string }> = {
  doctorName: { en: 'Dr. Ahmed Al-Mansouri', ar: 'د. أحمد المنصوري' },
  clinicName: { en: 'Al-Amal Specialized Clinic', ar: 'مجمع الأمل الطبي التخصصي' },
  clinicAddress: { en: 'Tripoli, Omar Al-Mukhtar St.', ar: 'طرابلس، شارع عمر المختار' },
  queueNumber: { en: '07', ar: '٠٧' },
  estimatedTime: { en: '10:30 AM', ar: '١٠:٣٠ صباحاً' },
  date: { en: 'Tomorrow, Oct 14', ar: 'غداً، ١٤ أكتوبر' },
  time: { en: '10:30 AM', ar: '١٠:٣٠ ص' },
  patientName: { en: 'Mohammed Ali', ar: 'محمد علي' },
  reason: { en: 'Doctor Absence', ar: 'عذر طارئ للطبيب' },
  code: { en: '582910', ar: '٥٨٢٩١٠' },
};

export default function NotificationTemplatesPage() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<EventCategory>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Modal State
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeLangTab, setActiveLangTab] = useState<'ar' | 'en'>('ar');
  const [copiedVar, setCopiedVar] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<UpdateNotificationTemplateDto>({});

  // Fetch templates from live backend
  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['notification-templates'],
    queryFn: notificationTemplateService.getAllTemplates,
  });

  const templates: NotificationTemplate[] = data?.data || [];

  // Seed default templates mutation
  const seedMutation = useMutation({
    mutationFn: notificationTemplateService.seedDefaults,
    onSuccess: (res) => {
      toast.success(res?.message || 'Default notification templates restored successfully');
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to restore templates');
    },
  });

  // Update template mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateNotificationTemplateDto }) =>
      notificationTemplateService.updateTemplate(id, payload),
    onSuccess: (res) => {
      toast.success(res?.message || 'Notification template updated successfully');
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] });
      setIsEditDialogOpen(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update template');
    },
  });

  // Quick toggle active status
  const handleToggleActive = (template: NotificationTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    updateMutation.mutate({
      id: template.id,
      payload: { isActive: !template.isActive },
    });
  };

  // Open edit modal
  const handleOpenEdit = (template: NotificationTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      description: template.description,
      titleEn: template.titleEn,
      bodyEn: template.bodyEn,
      titleAr: template.titleAr,
      bodyAr: template.bodyAr,
      pushEnabled: template.pushEnabled,
      inAppEnabled: template.inAppEnabled,
      whatsappEnabled: template.whatsappEnabled,
      smsEnabled: template.smsEnabled,
      isActive: template.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const handleSave = () => {
    if (!selectedTemplate) return;
    updateMutation.mutate({
      id: selectedTemplate.id,
      payload: formData,
    });
  };

  // Insert variable into active body or title
  const handleInsertVariable = (variableName: string, field: 'title' | 'body') => {
    const token = `{{${variableName}}}`;
    if (activeLangTab === 'en') {
      if (field === 'title') {
        setFormData((prev) => ({
          ...prev,
          titleEn: (prev.titleEn ? prev.titleEn + ' ' : '') + token,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          bodyEn: (prev.bodyEn ? prev.bodyEn + ' ' : '') + token,
        }));
      }
    } else {
      if (field === 'title') {
        setFormData((prev) => ({
          ...prev,
          titleAr: (prev.titleAr ? prev.titleAr + ' ' : '') + token,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          bodyAr: (prev.bodyAr ? prev.bodyAr + ' ' : '') + token,
        }));
      }
    }
    toast.success(`Inserted ${token}`);
  };

  const handleCopyVariable = (variableName: string) => {
    const token = `{{${variableName}}}`;
    navigator.clipboard.writeText(token);
    setCopiedVar(variableName);
    toast.info(`Copied ${token}`);
    setTimeout(() => setCopiedVar(null), 2000);
  };

  // Interpolate sample data for live preview
  const interpolateSampleData = (rawText: string, lang: 'ar' | 'en') => {
    if (!rawText) return '';
    let result = rawText;
    for (const [key, sampleObj] of Object.entries(SAMPLE_VARIABLES)) {
      const val = lang === 'ar' ? sampleObj.ar : sampleObj.en;
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      result = result.replace(regex, val);
    }
    return result;
  };

  // Filtered templates list
  const filteredTemplates = useMemo(() => {
    return templates.filter((tpl) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        tpl.name.toLowerCase().includes(q) ||
        tpl.eventKey.toLowerCase().includes(q) ||
        tpl.titleEn.toLowerCase().includes(q) ||
        tpl.titleAr.includes(q) ||
        tpl.bodyEn.toLowerCase().includes(q) ||
        tpl.bodyAr.includes(q);

      const category = CATEGORY_MAP[tpl.eventKey] || 'LIFECYCLE';
      const matchesCategory = selectedCategory === 'ALL' || category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [templates, searchQuery, selectedCategory]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = { ALL: templates.length, LIFECYCLE: 0, REMINDERS: 0, EXCEPTIONS: 0, SECURITY: 0 };
    templates.forEach((t) => {
      const cat = CATEGORY_MAP[t.eventKey] || 'LIFECYCLE';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [templates]);

  return (
    <div className="space-y-6 pb-10">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {t('notificationTemplates', 'Notification Templates')}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t(
                  'notificationTemplatesSubtitle',
                  'Manage automated message templates across Arabic & English for all platform events.'
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
            <span>{t('refresh', 'Refresh')}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => seedMutation.mutate()}
            disabled={seedMutation.isPending}
            className="flex items-center gap-1.5 text-primary border-primary/20 hover:bg-primary/10"
          >
            <Sparkles className="h-4 w-4" />
            <span>{t('restoreDefaults', 'Restore Defaults')}</span>
          </Button>
        </div>
      </div>

      {/* Filter and View Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(['ALL', 'LIFECYCLE', 'REMINDERS', 'EXCEPTIONS', 'SECURITY'] as EventCategory[]).map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <span>{CATEGORY_LABELS[cat]}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-background text-muted-foreground'
                  }`}
                >
                  {categoryCounts[cat]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & View Mode Switcher */}
        <div className="flex items-center gap-2">
          <div className="relative min-w-[220px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('searchTemplates', 'Search template or event...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          <div className="flex items-center rounded-lg border border-border p-0.5 bg-muted/40">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'table' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Table View"
            >
              <TableIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'cards' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Card View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-border bg-card">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
            <p className="text-sm font-medium">Loading templates...</p>
          </div>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <Bell className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="text-base font-semibold">No notification templates found</h3>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            Try adjusting your search criteria or restore default templates.
          </p>
          <Button
            onClick={() => seedMutation.mutate()}
            disabled={seedMutation.isPending}
            size="sm"
            className="bg-primary text-primary-foreground"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Restore Default Templates
          </Button>
        </Card>
      ) : viewMode === 'table' ? (
        /* Clean Structured Table View */
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border text-xs uppercase text-muted-foreground font-semibold">
                <tr>
                  <th className="px-4 py-3">Event & Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Arabic Text</th>
                  <th className="px-4 py-3">English Text</th>
                  <th className="px-4 py-3">Channels</th>
                  <th className="px-4 py-3 text-center">Active</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTemplates.map((tpl) => {
                  const category = CATEGORY_MAP[tpl.eventKey] || 'LIFECYCLE';

                  return (
                    <tr
                      key={tpl.id}
                      onClick={() => handleOpenEdit(tpl)}
                      className="hover:bg-muted/30 cursor-pointer transition-colors"
                    >
                      {/* Name & Key */}
                      <td className="px-4 py-3">
                        <div className="font-semibold text-foreground text-sm">{tpl.name}</div>
                        <div className="font-mono text-[11px] text-muted-foreground">{tpl.eventKey}</div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-[11px] font-normal">
                          {CATEGORY_LABELS[category]}
                        </Badge>
                      </td>

                      {/* Arabic Preview */}
                      <td className="px-4 py-3 max-w-[200px]" dir="rtl">
                        <div className="font-medium text-xs text-foreground truncate">{tpl.titleAr}</div>
                        <div className="text-[11px] text-muted-foreground truncate">{tpl.bodyAr}</div>
                      </td>

                      {/* English Preview */}
                      <td className="px-4 py-3 max-w-[200px]" dir="ltr">
                        <div className="font-medium text-xs text-foreground truncate">{tpl.titleEn}</div>
                        <div className="text-[11px] text-muted-foreground truncate">{tpl.bodyEn}</div>
                      </td>

                      {/* Channels */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {tpl.pushEnabled && (
                            <span className="p-1 rounded bg-muted text-foreground" title="Push Enabled">
                              <Smartphone className="h-3.5 w-3.5" />
                            </span>
                          )}
                          {tpl.inAppEnabled && (
                            <span className="p-1 rounded bg-muted text-foreground" title="In-App Enabled">
                              <Bell className="h-3.5 w-3.5" />
                            </span>
                          )}
                          {tpl.whatsappEnabled && (
                            <span className="p-1 rounded bg-muted text-foreground" title="WhatsApp Enabled">
                              <MessageCircle className="h-3.5 w-3.5" />
                            </span>
                          )}
                          {tpl.smsEnabled && (
                            <span className="p-1 rounded bg-muted text-foreground" title="SMS Enabled">
                              <MessageSquare className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status Toggle */}
                      <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <Switch
                          checked={tpl.isActive}
                          onClick={(e) => handleToggleActive(tpl, e)}
                        />
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(tpl);
                          }}
                          className="h-8 text-xs text-primary hover:bg-primary/10 hover:text-primary gap-1"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          <span>{t('edit', 'Edit')}</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Uniform Cards Grid View */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((tpl) => {
            const category = CATEGORY_MAP[tpl.eventKey] || 'LIFECYCLE';

            return (
              <Card
                key={tpl.id}
                onClick={() => handleOpenEdit(tpl)}
                className={`cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm ${
                  !tpl.isActive ? 'opacity-60 bg-muted/20' : ''
                }`}
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Badge variant="outline" className="text-[10px] font-normal mb-1">
                        {CATEGORY_LABELS[category]}
                      </Badge>
                      <CardTitle className="text-sm font-semibold">{tpl.name}</CardTitle>
                      <span className="font-mono text-[11px] text-muted-foreground">{tpl.eventKey}</span>
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      <Switch
                        checked={tpl.isActive}
                        onClick={(e) => handleToggleActive(tpl, e)}
                      />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 pt-2 space-y-2.5 text-xs">
                  {/* Arabic text preview */}
                  <div className="rounded-md border border-border p-2 bg-muted/20 text-right" dir="rtl">
                    <span className="font-semibold block text-foreground truncate text-xs">{tpl.titleAr}</span>
                    <p className="text-muted-foreground line-clamp-1 text-[11px] mt-0.5">{tpl.bodyAr}</p>
                  </div>

                  {/* English text preview */}
                  <div className="rounded-md border border-border p-2 bg-muted/20 text-left" dir="ltr">
                    <span className="font-semibold block text-foreground truncate text-xs">{tpl.titleEn}</span>
                    <p className="text-muted-foreground line-clamp-1 text-[11px] mt-0.5">{tpl.bodyEn}</p>
                  </div>

                  {/* Channels & Action */}
                  <div className="flex items-center justify-between pt-1 border-t border-border">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      {tpl.pushEnabled && (
                        <span title="Push">
                          <Smartphone className="h-3.5 w-3.5" />
                        </span>
                      )}
                      {tpl.inAppEnabled && (
                        <span title="In-App">
                          <Bell className="h-3.5 w-3.5" />
                        </span>
                      )}
                      {tpl.whatsappEnabled && (
                        <span title="WhatsApp">
                          <MessageCircle className="h-3.5 w-3.5" />
                        </span>
                      )}
                      {tpl.smsEnabled && (
                        <span title="SMS">
                          <MessageSquare className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-primary hover:bg-primary/10 gap-1 px-2"
                    >
                      <Edit className="h-3 w-3" />
                      <span>{t('edit', 'Edit')}</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Clean, Focused Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between pr-4">
              <div>
                <DialogTitle className="text-lg font-bold text-foreground">
                  Edit Template: {selectedTemplate?.name}
                </DialogTitle>
                <DialogDescription className="text-xs font-mono text-muted-foreground mt-0.5">
                  {selectedTemplate?.eventKey}
                </DialogDescription>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground cursor-pointer">
                  {formData.isActive ? 'Active' : 'Disabled'}
                </Label>
                <Switch
                  checked={Boolean(formData.isActive)}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
                />
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Delivery Channels */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Delivery Channels
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* Push */}
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium">Push (FCM)</span>
                  </div>
                  <Switch
                    checked={Boolean(formData.pushEnabled)}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, pushEnabled: checked }))}
                  />
                </div>

                {/* In-App */}
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium">In-App</span>
                  </div>
                  <Switch
                    checked={Boolean(formData.inAppEnabled)}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, inAppEnabled: checked }))}
                  />
                </div>

                {/* WhatsApp */}
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium">WhatsApp</span>
                  </div>
                  <Switch
                    checked={Boolean(formData.whatsappEnabled)}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, whatsappEnabled: checked }))}
                  />
                </div>

                {/* SMS */}
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium">SMS</span>
                  </div>
                  <Switch
                    checked={Boolean(formData.smsEnabled)}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, smsEnabled: checked }))}
                  />
                </div>
              </div>
            </div>

            {/* Language Editor Tabs */}
            <Tabs value={activeLangTab} onValueChange={(val) => setActiveLangTab(val as 'ar' | 'en')}>
              <TabsList className="grid w-full grid-cols-2 bg-muted">
                <TabsTrigger value="ar" className="text-xs font-semibold">
                  العربية (Arabic Content)
                </TabsTrigger>
                <TabsTrigger value="en" className="text-xs font-semibold">
                  English Content
                </TabsTrigger>
              </TabsList>

              {/* Arabic Content Tab */}
              <TabsContent value="ar" className="space-y-4 pt-3" dir="rtl">
                <div className="space-y-1.5 text-right">
                  <Label className="text-xs font-semibold">عنوان الإشعار (Title)</Label>
                  <Input
                    value={formData.titleAr || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, titleAr: e.target.value }))}
                    placeholder="عنوان الإشعار بالعربية..."
                    dir="rtl"
                    className="text-sm font-medium"
                  />
                </div>

                <div className="space-y-1.5 text-right">
                  <div className="flex items-center justify-between text-xs">
                    <Label className="font-semibold">نص الرسالة (Body)</Label>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {formData.bodyAr?.length || 0} حرفاً
                    </span>
                  </div>
                  <Textarea
                    value={formData.bodyAr || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, bodyAr: e.target.value }))}
                    placeholder="أدخل نص الرسالة بالعربية..."
                    rows={4}
                    dir="rtl"
                    className="text-sm leading-relaxed"
                  />
                </div>
              </TabsContent>

              {/* English Content Tab */}
              <TabsContent value="en" className="space-y-4 pt-3" dir="ltr">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Notification Title</Label>
                  <Input
                    value={formData.titleEn || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, titleEn: e.target.value }))}
                    placeholder="Notification title in English..."
                    dir="ltr"
                    className="text-sm font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <Label className="font-semibold">Notification Body</Label>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {formData.bodyEn?.length || 0} chars
                    </span>
                  </div>
                  <Textarea
                    value={formData.bodyEn || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, bodyEn: e.target.value }))}
                    placeholder="Notification message body in English..."
                    rows={4}
                    dir="ltr"
                    className="text-sm leading-relaxed"
                  />
                </div>
              </TabsContent>
            </Tabs>

            {/* Variable Placeholders */}
            {selectedTemplate?.variables && selectedTemplate.variables.length > 0 && (
              <div className="rounded-lg border border-border p-3 bg-muted/30 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-muted-foreground">
                    Available Variables (Click to append):
                  </span>
                  <span className="text-[10px] text-muted-foreground">Auto-replaced during sending</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedTemplate.variables.map((v) => (
                    <div
                      key={v}
                      className="inline-flex items-center rounded-md border border-border bg-card text-[11px] font-mono shadow-xs"
                    >
                      <button
                        type="button"
                        onClick={() => handleInsertVariable(v, 'body')}
                        className="px-2 py-0.5 text-primary hover:bg-primary/10 rounded-l-md font-medium"
                        title={`Insert {{${v}}}`}
                      >
                        + {`{{${v}}}`}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyVariable(v)}
                        className="px-1.5 py-0.5 border-l border-border text-muted-foreground hover:text-foreground"
                        title="Copy variable"
                      >
                        {copiedVar === v ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Clean Live Rendered Preview Box */}
            <div className="rounded-lg border border-border p-3 bg-muted/20 space-y-1">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block">
                Sample Live Preview ({activeLangTab === 'ar' ? 'العربية' : 'English'})
              </span>
              <div
                className="p-2.5 rounded-md bg-card border border-border space-y-0.5"
                dir={activeLangTab === 'ar' ? 'rtl' : 'ltr'}
              >
                <div className="font-semibold text-xs text-foreground">
                  {interpolateSampleData(
                    activeLangTab === 'ar' ? formData.titleAr || '' : formData.titleEn || '',
                    activeLangTab
                  ) || 'Title Preview'}
                </div>
                <div className="text-xs text-muted-foreground leading-relaxed">
                  {interpolateSampleData(
                    activeLangTab === 'ar' ? formData.bodyAr || '' : formData.bodyEn || '',
                    activeLangTab
                  ) || 'Body message preview will appear here...'}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 border-t border-border pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
