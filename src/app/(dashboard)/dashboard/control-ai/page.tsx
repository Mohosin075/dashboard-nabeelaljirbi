'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Activity, 
  Bot, 
  CheckCircle2, 
  Clock, 
  Loader2, 
  MessageSquare, 
  Save, 
  ShieldCheck, 
  Sparkles, 
  Stethoscope, 
  Users 
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { controlAiService } from '@/services/control-ai.service';
import { useLanguage } from '@/contexts/language-context';
import { useAuthStore } from '@/stores/auth-store';

export default function ControlAiPage() {
  const { t, tr } = useLanguage();
  const queryClient = useQueryClient();
  const adminTier = useAuthStore((state) => state.adminTier) || 'SUPER_ADMIN';
  const isReadOnly = adminTier === 'READ_ONLY';
  const [settings, setSettings] = useState({
    limit: 0,
    isEnable: false,
  });

  const { data: fetchedSettings, isLoading: isSettingsLoading } = useQuery({
    queryKey: ['control-ai-settings'],
    queryFn: controlAiService.getSettings,
  });

  const { data: adminStatsData, isLoading: isStatsLoading } = useQuery({
    queryKey: ['control-ai-admin-stats'],
    queryFn: controlAiService.getAdminStats,
    refetchInterval: 30000, // Refresh stats every 30 seconds
  });

  const stats = adminStatsData?.data;

  // Sync fetched data into local state
  useEffect(() => {
    if (
      fetchedSettings?.data &&
      Array.isArray(fetchedSettings.data) &&
      fetchedSettings.data.length > 0
    ) {
      const current = fetchedSettings.data[0];
      if (current) {
        setSettings({
          limit: current.limit,
          isEnable: current.isEnable,
        });
      }
    }
  }, [fetchedSettings]);

  const mutation = useMutation({
    mutationFn: controlAiService.upsertSettings,
    onSuccess: (data) => {
      toast.success(tr(data?.message || 'AI Chat settings saved successfully'));
      queryClient.invalidateQueries({ queryKey: ['control-ai-settings'] });
      queryClient.invalidateQueries({ queryKey: ['control-ai-admin-stats'] });
    },
    onError: (error: any) => {
      toast.error(tr(error?.response?.data?.message || 'Failed to update AI Chat settings'));
    },
  });

  const handleSave = () => {
    mutation.mutate(settings);
  };

  if (isSettingsLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">{t('controlAi')}</h2>
        <p className="text-muted-foreground text-sm">{t('controlAiDesc')}</p>
      </div>

      {/* Usage Monitoring (Section 13 Requirement) */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Activity className="h-4 w-4 text-indigo-600" />
            {t('aiUsageMonitoring')}
          </h3>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            24h Window
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="border border-gray-200/80 shadow-sm bg-white hover:shadow transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">{t('aiTotalQueries24h')}</p>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <MessageSquare className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <h4 className="text-2xl font-bold text-gray-900">
                  {isStatsLoading ? '...' : (stats?.totalQueries24h ?? 0)}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">Rolling 24-hour total</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200/80 shadow-sm bg-white hover:shadow transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">{t('aiActiveUsers24h')}</p>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Users className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <h4 className="text-2xl font-bold text-gray-900">
                  {isStatsLoading ? '...' : (stats?.activeUsers24h ?? 0)}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">Unique patients active</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200/80 shadow-sm bg-white hover:shadow transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">{t('aiRecommendations24h')}</p>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <Stethoscope className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <h4 className="text-2xl font-bold text-gray-900">
                  {isStatsLoading ? '...' : (stats?.doctorRecommendations24h ?? 0)}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">Specialists matched</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Settings Card */}
      <Card className="overflow-hidden border-0 shadow-lg">
        {/* Gradient Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{t('aiChatSettings')}</h3>
              <p className="text-sm text-indigo-100">
                {t('aiChatSubtitle')}
              </p>
            </div>
          </div>
        </div>

        <CardContent className="space-y-6 p-6">
          {/* Rolling window policy info banner */}
          <div className="flex items-start gap-3 rounded-xl border border-indigo-100 bg-indigo-50/70 p-4">
            <Clock className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-900 leading-relaxed">
              <span className="font-semibold">{t('notice', 'Notice')}: </span>
              {t('rollingWindowNotice')}
            </div>
          </div>

          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50/50 p-5 transition-colors hover:bg-gray-50">
            <div className="flex items-center gap-4">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${settings.isEnable ? 'bg-green-100' : 'bg-gray-200'} transition-colors`}
              >
                <Sparkles
                  className={`h-5 w-5 ${settings.isEnable ? 'text-green-600' : 'text-gray-400'} transition-colors`}
                />
              </div>
              <div className="space-y-0.5">
                <Label className="text-base font-semibold text-gray-900">{t('enableAiChat')}</Label>
                <div className="text-sm text-muted-foreground">
                  {settings.isEnable
                    ? t('aiChatActive')
                    : t('aiChatDisabled')}
                </div>
              </div>
            </div>
            <Switch
              checked={settings.isEnable}
              disabled={isReadOnly}
              onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, isEnable: checked }))}
            />
          </div>

          {/* Limit Input */}
          <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-5 transition-colors hover:bg-gray-50">
            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
                <Bot className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="space-y-0.5">
                <Label className="text-base font-semibold text-gray-900">{t('chatLimit')}</Label>
                <div className="text-sm text-muted-foreground">
                  {t('chatLimitDesc')}
                </div>
              </div>
            </div>
            <div className="ltr:ml-14 rtl:mr-14">
              <Input
                type="number"
                min={0}
                disabled={isReadOnly}
                value={settings.limit}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, limit: parseInt(e.target.value) || 0 }))
                }
                className="max-w-[200px] border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                placeholder={t('enterLimit')}
              />
            </div>
          </div>

          {/* AI Provider & Engine Status (Section 13 Requirement) */}
          <div className="rounded-xl border border-gray-200 p-5 bg-white space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              {t('aiProviderStatus')}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="rounded-lg bg-gray-50 p-3 border border-gray-100">
                <span className="text-xs text-muted-foreground block">{t('aiProviderName')}</span>
                <span className="font-semibold text-gray-900 mt-1 flex items-center gap-2">
                  <Bot className="h-4 w-4 text-indigo-600" />
                  {stats?.provider || 'OpenAI (gpt-4o-mini)'}
                </span>
              </div>

              <div className="rounded-lg bg-gray-50 p-3 border border-gray-100">
                <span className="text-xs text-muted-foreground block">{t('aiEngineStatus')}</span>
                <span className="font-semibold text-emerald-700 mt-1 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  {stats?.providerStatus || 'Operational'}
                </span>
              </div>
            </div>

            <div className="rounded-lg bg-emerald-50/60 p-3 border border-emerald-100 flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-900">
                <span className="font-semibold">{t('aiCredentialsSafety')}: </span>
                {t('aiCredentialsSafetyDesc')}
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between pt-2">
            {isReadOnly ? (
              <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-1 font-medium">
                Read-Only Tier: Modifying AI Assistant settings is restricted.
              </span>
            ) : <div />}
            <Button
              onClick={handleSave}
              disabled={mutation.isPending || isReadOnly}
              className="bg-indigo-600 px-6 text-white hover:bg-indigo-700 flex items-center gap-2"
            >
              {mutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {mutation.isPending ? t('saving') : t('saveChanges')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
