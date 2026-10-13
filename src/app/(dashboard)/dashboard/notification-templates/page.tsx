'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  Edit,
  Globe,
  Info,
  Loader2,
  RefreshCw,
  Search,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
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

export default function NotificationTemplatesPage() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'english' | 'arabic'>('arabic');

  // Form edit state
  const [formData, setFormData] = useState<UpdateNotificationTemplateDto>({});

  // Fetch templates
  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['notification-templates'],
    queryFn: notificationTemplateService.getAllTemplates,
  });

  const templates: NotificationTemplate[] = data?.data || [];

  // Seed default mutation
  const seedMutation = useMutation({
    mutationFn: notificationTemplateService.seedDefaults,
    onSuccess: (res) => {
      toast.success(res?.message || 'Default notification templates restored');
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to restore default templates');
    },
  });

  // Update mutation
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

  // Quick toggle active
  const handleToggleActive = (template: NotificationTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    updateMutation.mutate({
      id: template.id,
      payload: { isActive: !template.isActive },
    });
  };

  const handleSave = () => {
    if (!selectedTemplate) return;
    updateMutation.mutate({
      id: selectedTemplate.id,
      payload: formData,
    });
  };

  // Helper to insert placeholder variable into active body textarea
  const handleInsertVariable = (variableName: string, field: 'title' | 'body') => {
    const token = `{{${variableName}}}`;
    if (activeTab === 'english') {
      if (field === 'title') {
        setFormData((prev) => ({
          ...prev,
          titleEn: (prev.titleEn || '') + ' ' + token,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          bodyEn: (prev.bodyEn || '') + ' ' + token,
        }));
      }
    } else {
      if (field === 'title') {
        setFormData((prev) => ({
          ...prev,
          titleAr: (prev.titleAr || '') + ' ' + token,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          bodyAr: (prev.bodyAr || '') + ' ' + token,
        }));
      }
    }
    toast.info(`Added ${token}`);
  };

  // Filter templates
  const filteredTemplates = templates.filter((tpl) => {
    const q = searchQuery.toLowerCase();
    return (
      tpl.name.toLowerCase().includes(q) ||
      tpl.eventKey.toLowerCase().includes(q) ||
      tpl.titleEn.toLowerCase().includes(q) ||
      tpl.titleAr.includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            {t('notificationTemplates', 'Notification Template Management')}
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage exact wording per event. Arabic and English maintained as fully independent entries.
          </p>
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
            Refresh
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => seedMutation.mutate()}
            disabled={seedMutation.isPending}
            className="flex items-center gap-1.5"
          >
            <Sparkles className="h-4 w-4 text-amber-500" />
            Seed / Reset Defaults
          </Button>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-semibold uppercase">Total Events</CardDescription>
            <CardTitle className="text-2xl">{templates.length}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
            Full lifecycle coverage
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-semibold uppercase">Push (FCM) Enabled</CardDescription>
            <CardTitle className="text-2xl">{templates.filter((t) => t.pushEnabled).length}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
            Primary in-app & mobile channel
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-semibold uppercase">WhatsApp Preferred</CardDescription>
            <CardTitle className="text-2xl">{templates.filter((t) => t.whatsappEnabled).length}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
            Preferred external channel
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-slate-400">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-semibold uppercase">SMS Fallback</CardDescription>
            <CardTitle className="text-2xl">{templates.filter((t) => t.smsEnabled).length}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
            Optional (off by default)
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by event key, name, or wording..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-card"
        />
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm">Loading notification templates...</p>
          </div>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">No notification templates found.</p>
          <Button onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending}>
            <Sparkles className="h-4 w-4 mr-2" />
            Initialize Default Templates
          </Button>
        </Card>
      ) : (
        /* Template Cards Grid */
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((tpl) => (
            <Card
              key={tpl.id}
              className={`flex flex-col transition-all hover:shadow-md cursor-pointer border ${
                tpl.isActive ? 'border-border' : 'opacity-60 bg-muted/40'
              }`}
              onClick={() => handleOpenEdit(tpl)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base font-semibold">{tpl.name}</CardTitle>
                    <code className="text-xs text-muted-foreground font-mono">{tpl.eventKey}</code>
                  </div>
                  <Switch
                    checked={tpl.isActive}
                    onClick={(e) => handleToggleActive(tpl, e)}
                    className="scale-90"
                  />
                </div>
                {tpl.description && (
                  <CardDescription className="text-xs line-clamp-1 mt-1">
                    {tpl.description}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent className="space-y-3 flex-1 pb-3 text-xs">
                {/* Independent Language Previews */}
                <div className="rounded-md border p-2.5 bg-background space-y-1.5">
                  <div className="flex items-center justify-between text-muted-foreground text-[11px] font-medium border-b pb-1">
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      English
                    </span>
                    <span className="font-semibold text-foreground truncate max-w-[150px]">
                      {tpl.titleEn}
                    </span>
                  </div>
                  <p className="text-muted-foreground line-clamp-2 leading-relaxed">
                    {tpl.bodyEn}
                  </p>
                </div>

                <div className="rounded-md border p-2.5 bg-background space-y-1.5" dir="rtl">
                  <div className="flex items-center justify-between text-muted-foreground text-[11px] font-medium border-b pb-1">
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      العربية
                    </span>
                    <span className="font-semibold text-foreground truncate max-w-[150px]">
                      {tpl.titleAr}
                    </span>
                  </div>
                  <p className="text-muted-foreground line-clamp-2 leading-relaxed text-right">
                    {tpl.bodyAr}
                  </p>
                </div>

                {/* Delivery Channel Badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tpl.pushEnabled && (
                    <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200">
                      FCM Push
                    </Badge>
                  )}
                  {tpl.inAppEnabled && (
                    <Badge variant="outline" className="text-[10px] bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200">
                      In-App
                    </Badge>
                  )}
                  {tpl.whatsappEnabled && (
                    <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200">
                      WhatsApp
                    </Badge>
                  )}
                  {tpl.smsEnabled && (
                    <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200">
                      SMS
                    </Badge>
                  )}
                </div>
              </CardContent>

              <CardFooter className="pt-0 pb-3 flex items-center justify-between border-t border-dashed px-4 pt-2">
                <span className="text-[11px] text-muted-foreground">
                  {tpl.variables?.length || 0} variables supported
                </span>
                <Button variant="ghost" size="sm" className="h-7 text-xs font-medium gap-1 text-primary">
                  <Edit className="h-3 w-3" />
                  Edit Exact Wording
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Modal (Arabic & English Maintained As Fully Independent Entries) */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Edit className="h-5 w-5 text-primary" />
              Edit Notification Template: {selectedTemplate?.name}
            </DialogTitle>
            <DialogDescription>
              Wording is maintained independently for Arabic and English. Configure exact copy and delivery channels.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Template Information */}
            <div className="grid gap-3 sm:grid-cols-2 bg-muted/40 p-3 rounded-lg border">
              <div>
                <Label className="text-xs text-muted-foreground">Event Key</Label>
                <div className="font-mono text-sm font-semibold">{selectedTemplate?.eventKey}</div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Description</Label>
                <div className="text-xs">{selectedTemplate?.description}</div>
              </div>
            </div>

            {/* Delivery Channels */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Delivery Channels
              </Label>
              <div className="grid gap-3 sm:grid-cols-4">
                <div className="flex items-center justify-between border rounded-lg p-2.5 bg-card">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-semibold cursor-pointer">FCM Push</Label>
                    <p className="text-[10px] text-muted-foreground">Primary Channel</p>
                  </div>
                  <Switch
                    checked={Boolean(formData.pushEnabled)}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, pushEnabled: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between border rounded-lg p-2.5 bg-card">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-semibold cursor-pointer">In-App</Label>
                    <p className="text-[10px] text-muted-foreground">Primary Channel</p>
                  </div>
                  <Switch
                    checked={Boolean(formData.inAppEnabled)}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, inAppEnabled: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between border rounded-lg p-2.5 bg-card">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-semibold cursor-pointer">WhatsApp</Label>
                    <p className="text-[10px] text-muted-foreground">Preferred Ext.</p>
                  </div>
                  <Switch
                    checked={Boolean(formData.whatsappEnabled)}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, whatsappEnabled: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between border rounded-lg p-2.5 bg-card">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-semibold cursor-pointer">SMS</Label>
                    <p className="text-[10px] text-muted-foreground">Optional (Off)</p>
                  </div>
                  <Switch
                    checked={Boolean(formData.smsEnabled)}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, smsEnabled: checked }))}
                  />
                </div>
              </div>
            </div>

            {/* Dynamic Variables Helper Chips */}
            {selectedTemplate?.variables && selectedTemplate.variables.length > 0 && (
              <div className="space-y-1.5 bg-blue-50/50 dark:bg-blue-950/30 p-3 rounded-lg border border-blue-200/50">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-900 dark:text-blue-200">
                  <Info className="h-3.5 w-3.5" />
                  Available Dynamic Variables (Click to insert into active tab):
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedTemplate.variables.map((v) => (
                    <Button
                      key={v}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-6 text-[11px] font-mono bg-background hover:bg-primary/10 border-blue-300"
                      onClick={() => handleInsertVariable(v, 'body')}
                    >
                      + {`{{${v}}}`}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Independent Arabic and English Tabs */}
            <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'english' | 'arabic')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="arabic" className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-emerald-600" />
                  العربية (Arabic - Independent Entry)
                </TabsTrigger>
                <TabsTrigger value="english" className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-600" />
                  English (Independent Entry)
                </TabsTrigger>
              </TabsList>

              {/* Arabic Entry */}
              <TabsContent value="arabic" className="space-y-4 pt-3" dir="rtl">
                <div className="space-y-1.5 text-right">
                  <Label className="text-xs font-semibold">عنوان الإشعار (Arabic Title)</Label>
                  <Input
                    value={formData.titleAr || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, titleAr: e.target.value }))}
                    placeholder="عنوان الإشعار بالعربية"
                    className="font-medium text-right"
                    dir="rtl"
                  />
                </div>

                <div className="space-y-1.5 text-right">
                  <Label className="text-xs font-semibold">نص الإشعار الكامل (Arabic Body)</Label>
                  <Textarea
                    value={formData.bodyAr || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, bodyAr: e.target.value }))}
                    placeholder="نص الإشعار بالعربية..."
                    rows={4}
                    className="text-right leading-relaxed"
                    dir="rtl"
                  />
                </div>

                {/* Live Preview Card */}
                <div className="rounded-lg border p-3 bg-muted/30 text-right space-y-1 text-xs">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">معاينة على الهاتف:</span>
                  <div className="font-semibold text-foreground">{formData.titleAr || 'عنوان تجريبي'}</div>
                  <div className="text-muted-foreground">{formData.bodyAr || 'نص تجريبي للإشعار...'}</div>
                </div>
              </TabsContent>

              {/* English Entry */}
              <TabsContent value="english" className="space-y-4 pt-3" dir="ltr">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Notification Title (English Title)</Label>
                  <Input
                    value={formData.titleEn || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, titleEn: e.target.value }))}
                    placeholder="English Notification Title"
                    className="font-medium"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Notification Body (English Body)</Label>
                  <Textarea
                    value={formData.bodyEn || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, bodyEn: e.target.value }))}
                    placeholder="English Notification Body..."
                    rows={4}
                    className="leading-relaxed"
                    dir="ltr"
                  />
                </div>

                {/* Live Preview Card */}
                <div className="rounded-lg border p-3 bg-muted/30 space-y-1 text-xs" dir="ltr">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Phone Notification Preview:</span>
                  <div className="font-semibold text-foreground">{formData.titleEn || 'Sample Title'}</div>
                  <div className="text-muted-foreground">{formData.bodyEn || 'Sample notification message...'}</div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Template Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
