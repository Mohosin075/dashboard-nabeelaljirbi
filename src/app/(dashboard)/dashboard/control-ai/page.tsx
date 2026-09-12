'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bot, Loader2, Save, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { controlAiService } from '@/services/control-ai.service';

export default function ControlAiPage() {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState({
    limit: 0,
    isEnable: false,
  });

  const { data: fetchedSettings, isLoading } = useQuery({
    queryKey: ['control-ai-settings'],
    queryFn: controlAiService.getSettings,
  });

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
      toast.success(data?.message || 'AI Chat settings saved successfully');
      queryClient.invalidateQueries({ queryKey: ['control-ai-settings'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update AI Chat settings');
    },
  });

  const handleSave = () => {
    mutation.mutate(settings);
  };

  if (isLoading) {
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
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Control AI</h2>
        <p className="text-muted-foreground">Manage AI chat availability and usage limits.</p>
      </div>

      <Card className="overflow-hidden border-0 shadow-lg">
        {/* Gradient Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">AI Chat Settings</h3>
              <p className="text-sm text-indigo-100">
                Configure how patients interact with AI assistance
              </p>
            </div>
          </div>
        </div>

        <CardContent className="space-y-6 p-6">
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
                <Label className="text-base font-semibold text-gray-900">Enable AI Chat</Label>
                <div className="text-sm text-muted-foreground">
                  {settings.isEnable
                    ? 'AI Chat is currently active for patients'
                    : 'AI Chat is currently disabled'}
                </div>
              </div>
            </div>
            <Switch
              checked={settings.isEnable}
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
                <Label className="text-base font-semibold text-gray-900">Chat Limit</Label>
                <div className="text-sm text-muted-foreground">
                  Maximum number of AI chat messages allowed per user
                </div>
              </div>
            </div>
            <div className="ml-14">
              <Input
                type="number"
                min={0}
                value={settings.limit}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, limit: parseInt(e.target.value) || 0 }))
                }
                className="max-w-[200px] border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Enter limit..."
              />
            </div>
          </div>

          {/* Status Summary */}
          <div className="flex items-center gap-3 rounded-xl bg-indigo-50 px-5 py-4">
            <div
              className={`h-2.5 w-2.5 rounded-full ${settings.isEnable ? 'animate-pulse bg-green-500' : 'bg-gray-400'}`}
            />
            <span className="text-sm font-medium text-indigo-900">
              Status: {settings.isEnable ? 'Active' : 'Disabled'} &middot; Limit: {settings.limit}{' '}
              messages per user
            </span>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSave}
              disabled={mutation.isPending}
              className="bg-indigo-600 px-6 text-white hover:bg-indigo-700"
            >
              {mutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {mutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
