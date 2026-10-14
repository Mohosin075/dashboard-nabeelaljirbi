'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/language-context';
import { useAuthStore } from '@/stores/auth-store';
import { adminService, BookingSettings } from '@/services/admin.service';
import {
  CalendarClock,
  Clock,
  Save,
  Bell,
  RefreshCw,
} from 'lucide-react';

export default function BookingSettingsPage() {
  const { t } = useLanguage();
  const adminTier = useAuthStore((state) => state.adminTier) || 'SUPER_ADMIN';
  const isReadOnly = adminTier === 'READ_ONLY';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<BookingSettings>({
    id: '',
    advanceBookingDays: 14,
    cancellationCutoffHours: 12,
    reminder24hEnabled: true,
    reminder3hEnabled: true,
    neglectedResolutionHours: 12,
    autoRejectTimeoutMinutes: 30,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await adminService.getBookingSettings();
      if (res.data) {
        setSettings(res.data);
      }
    } catch (err: any) {
      toast({
        title: t('error', 'Error'),
        description: err.response?.data?.message || 'Failed to load booking settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await adminService.updateBookingSettings(settings);
      toast({
        title: t('success', 'Success'),
        description: 'Platform booking settings updated successfully',
      });
      if (res.data) {
        setSettings(res.data);
      }
    } catch (err: any) {
      toast({
        title: t('error', 'Error'),
        description: err.response?.data?.message || 'Failed to save booking settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarClock className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              {t('bookingSettingsTitle', 'Platform Booking Settings')}
            </h1>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {t(
              'bookingSettingsSub',
              'Global parameters governing advance bookings, cancellation cutoff, notification dispatch, and neglected resolution.'
            )}
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={fetchSettings} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          {t('reload', 'Reload')}
        </Button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Scheduling Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Scheduling & Cancellation Lifecycle Rules
            </CardTitle>
            <CardDescription>
              Enforced server-side across all patient booking flows.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="advanceBookingDays">Maximum Advance Booking Days</Label>
                <div className="mt-1.5 relative">
                  <Input
                    id="advanceBookingDays"
                    type="number"
                    min="1"
                    max="90"
                    value={settings.advanceBookingDays}
                    onChange={(e) =>
                      setSettings({ ...settings, advanceBookingDays: Number(e.target.value) })
                    }
                    required
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-gray-400">Days</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  How far in advance patients can book slots (default: 14 days).
                </p>
              </div>

              <div>
                <Label htmlFor="cancellationCutoffHours">
                  Patient Cancellation Cut-off Window
                </Label>
                <div className="mt-1.5 relative">
                  <Input
                    id="cancellationCutoffHours"
                    type="number"
                    min="1"
                    max="72"
                    value={settings.cancellationCutoffHours}
                    onChange={(e) =>
                      setSettings({ ...settings, cancellationCutoffHours: Number(e.target.value) })
                    }
                    required
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-gray-400">Hours</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Hard-blocked server-side cutoff prior to slot start (Requirement: 12 hours).
                </p>
              </div>

              <div>
                <Label htmlFor="neglectedResolutionHours">
                  Neglected Appointment Settlement Cutoff
                </Label>
                <div className="mt-1.5 relative">
                  <Input
                    id="neglectedResolutionHours"
                    type="number"
                    min="1"
                    max="72"
                    value={settings.neglectedResolutionHours}
                    onChange={(e) =>
                      setSettings({ ...settings, neglectedResolutionHours: Number(e.target.value) })
                    }
                    required
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-gray-400">Hours</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Time after shift end before neglected bookings resolve into settlement (Requirement: 12 hours).
                </p>
              </div>

              <div>
                <Label htmlFor="autoRejectTimeoutMinutes">
                  Pending Request Auto-Reject Timeout
                </Label>
                <div className="mt-1.5 relative">
                  <Input
                    id="autoRejectTimeoutMinutes"
                    type="number"
                    min="5"
                    max="240"
                    value={settings.autoRejectTimeoutMinutes}
                    onChange={(e) =>
                      setSettings({ ...settings, autoRejectTimeoutMinutes: Number(e.target.value) })
                    }
                    required
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-gray-400">Minutes</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Clinic response window before an unconfirmed booking auto-rejects (default: 30 minutes).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reminder Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Bell className="h-5 w-5 text-amber-500" />
              Automated Pre-Appointment Reminder Dispatches
            </CardTitle>
            <CardDescription>
              Controls background worker scheduling for appointment reminder alerts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3 p-3 rounded-lg border bg-gray-50">
              <Checkbox
                id="reminder24h"
                checked={settings.reminder24hEnabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, reminder24hEnabled: Boolean(checked) })
                }
              />
              <div className="space-y-1">
                <Label htmlFor="reminder24h" className="font-medium cursor-pointer">
                  24-Hour Reminder Alert (Section 7)
                </Label>
                <p className="text-xs text-gray-500">
                  Dispatches FCM push, in-app notification, and WhatsApp alert exactly 24 hours prior to appointment period.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-lg border bg-gray-50">
              <Checkbox
                id="reminder3h"
                checked={settings.reminder3hEnabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, reminder3hEnabled: Boolean(checked) })
                }
              />
              <div className="space-y-1">
                <Label htmlFor="reminder3h" className="font-medium cursor-pointer">
                  3-Hour Reminder Alert (Section 7)
                </Label>
                <p className="text-xs text-gray-500">
                  Dispatches final preparation notice 3 hours prior to clinic arrival time.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Bar */}
        <div className="flex justify-end pt-2">
          {isReadOnly ? (
            <Button disabled className="bg-gray-400 text-white cursor-not-allowed">
              {t('readOnlyMode', 'Read Only Mode')}
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-sm"
            >
              <Save className="h-4 w-4" />
              {saving ? t('saving', 'Saving Settings...') : t('saveSettings', 'Save Settings')}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
