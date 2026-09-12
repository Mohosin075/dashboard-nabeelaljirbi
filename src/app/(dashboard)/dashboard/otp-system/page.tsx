'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { Loader2, MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { otpService } from '@/services/otp.service';

export default function OtpSystemPage() {
  const [settings, setSettings] = useState({
    SMS: false,
    WhatsApp: false,
  });

  const { data: fetchedSettings, isLoading } = useQuery({
    queryKey: ['otp-settings'],
    queryFn: otpService.getOtpSettings,
  });

  // Update effect to sync state with fetched data
  useEffect(() => {
    if (fetchedSettings?.data && Array.isArray(fetchedSettings.data) && fetchedSettings.data.length > 0) {
      const currentSettings = fetchedSettings.data[0];
      setSettings({
        SMS: currentSettings.SMS,
        WhatsApp: currentSettings.WhatsApp,
      });
    }
  }, [fetchedSettings]);

  const mutation = useMutation({
    mutationFn: otpService.updateOtpSettings,
    onSuccess: (data) => {
      toast.success(data?.message || 'OTP System settings saved successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update settings');
    },
  });

  const handleSave = () => {
    mutation.mutate(settings);
  };

  if (isLoading) {
      return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">OTP System</h2>
        <p className="text-muted-foreground">Manage your OTP delivery channels.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Delivery Channels
          </CardTitle>
          <CardDescription>
            Enable or disable specific channels for sending OTPs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">SMS</Label>
              <div className="text-sm text-muted-foreground">
                Send OTP via traditional SMS messages.
              </div>
            </div>
            <Switch
              checked={settings.SMS}
              onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, SMS: checked }))}
            />
          </div>

          <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">WhatsApp</Label>
              <div className="text-sm text-muted-foreground">
                Send OTP via WhatsApp messages.
              </div>
            </div>
            <Switch
              checked={settings.WhatsApp}
              onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, WhatsApp: checked }))}
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
