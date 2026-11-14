'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/language-context';
import { useAuthStore } from '@/stores/auth-store';
import { adminService, BookingSettings } from '@/services/admin.service';
import {
  CalendarClock,
  Calendar,
  Clock,
  Save,
  Bell,
  RefreshCw,
  ShieldAlert,
  Receipt,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export default function BookingSettingsPage() {
  const { t } = useLanguage();
  const adminTier = useAuthStore((state) => state.adminTier) || 'SUPER_ADMIN';
  const isReadOnly = adminTier === 'READ_ONLY';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initialSettings, setInitialSettings] = useState<BookingSettings | null>(null);
  const [settings, setSettings] = useState<BookingSettings>({
    id: '',
    arrivalWindowHours: 3,
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
        setInitialSettings(res.data);
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

  const isDirty = useMemo(() => {
    if (!initialSettings) return false;
    return (
      settings.arrivalWindowHours !== initialSettings.arrivalWindowHours ||
      settings.advanceBookingDays !== initialSettings.advanceBookingDays ||
      settings.cancellationCutoffHours !== initialSettings.cancellationCutoffHours ||
      settings.neglectedResolutionHours !== initialSettings.neglectedResolutionHours ||
      settings.autoRejectTimeoutMinutes !== initialSettings.autoRejectTimeoutMinutes ||
      settings.reminder24hEnabled !== initialSettings.reminder24hEnabled ||
      settings.reminder3hEnabled !== initialSettings.reminder3hEnabled
    );
  }, [settings, initialSettings]);

  const handleDiscard = () => {
    if (initialSettings) {
      setSettings(initialSettings);
      toast({
        title: t('reset', 'Reset'),
        description: 'Changes discarded, restored to saved settings.',
      });
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isReadOnly) return;
    try {
      setSaving(true);
      const res = await adminService.updateBookingSettings(settings);
      toast({
        title: t('success', 'Success'),
        description: 'Platform booking settings updated successfully.',
      });
      if (res.data) {
        setSettings(res.data);
        setInitialSettings(res.data);
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
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
        <p className="text-xs text-gray-500">{t('loading', 'Loading platform settings...')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shadow-xs">
              <CalendarClock className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                  {t('bookingSettingsTitle', 'Platform Booking Settings')}
                </h1>
                <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 text-xs font-semibold">
                  Global Rules
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                {t(
                  'bookingSettingsSub',
                  'Global parameters governing advance bookings, cancellation cutoff, notification dispatch, and neglected resolution.'
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSettings}
            disabled={saving}
            className="gap-1.5 border-gray-200 text-xs hover:bg-gray-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${saving ? 'animate-spin' : ''}`} />
            <span>{t('reload', 'Reload')}</span>
          </Button>

          {!isReadOnly && (
            <Button
              type="button"
              size="sm"
              onClick={() => handleSave()}
              disabled={saving || !isDirty}
              className={`gap-1.5 text-xs font-semibold shadow-xs transition-all ${
                isDirty
                  ? 'bg-blue-600 hover:bg-blue-700 text-white ring-2 ring-blue-600/20'
                  : 'bg-gray-100 text-gray-400 hover:bg-gray-100 cursor-not-allowed'
              }`}
            >
              <Save className="h-3.5 w-3.5" />
              <span>{saving ? t('saving', 'Saving...') : t('saveSettings', 'Save Settings')}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Unsaved Changes Banner */}
      {isDirty && !isReadOnly && (
        <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50/80 p-3.5 shadow-xs transition-all animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-xs font-medium text-blue-900">
            <Sparkles className="h-4 w-4 text-blue-600 animate-pulse" />
            <span>{t('unsavedChanges', 'You have unsaved changes.')} Click Save Settings to apply them platform-wide.</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDiscard}
              className="h-7 px-2.5 text-xs text-gray-600 hover:text-gray-900 hover:bg-white"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              {t('discard', 'Discard')}
            </Button>
            <Button
              size="sm"
              onClick={() => handleSave()}
              disabled={saving}
              className="h-7 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              {saving ? t('saving', 'Saving...') : t('saveNow', 'Save Now')}
            </Button>
          </div>
        </div>
      )}

      {isReadOnly && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs font-medium text-amber-800 flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
          <span>{t('readOnlyNotice', 'Read-Only Mode: You have inspection access to platform settings. Adjusting cutoff parameters or reminders is restricted.')}</span>
        </div>
      )}

      {/* Interactive Booking Lifecycle & Timeline Diagram */}
      <Card className="border-gray-200 shadow-xs overflow-hidden bg-gradient-to-br from-white via-blue-50/20 to-purple-50/20">
        <CardHeader className="pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <CardTitle className="text-sm font-bold text-gray-900">
                {t('bookingLifecycleWorkflow', 'Booking Lifecycle & Safeguard Timeline')}
              </CardTitle>
            </div>
            <span className="text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Active Parameters Visualized
            </span>
          </div>
          <CardDescription className="text-xs text-gray-500">
            How server-side time gates, automated reminders, and financial settlement cutoffs execute across every booking.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 text-center">
            {/* Step 1: Advance Booking */}
            <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-2xs">
              <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">1. Slot Window</div>
              <div className="mt-1 text-lg font-bold font-mono text-blue-600">{settings.advanceBookingDays} Days</div>
              <p className="mt-0.5 text-[10px] text-gray-500">Max advance booking</p>
            </div>

            {/* Step 2: Auto-Reject Timeout */}
            <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-2xs">
              <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">2. Auto-Reject</div>
              <div className="mt-1 text-lg font-bold font-mono text-rose-600">{settings.autoRejectTimeoutMinutes} Mins</div>
              <p className="mt-0.5 text-[10px] text-gray-500">Unconfirmed timeout</p>
            </div>

            {/* Step 3: 24h Reminder */}
            <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-2xs">
              <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">3. 24h Alert</div>
              <div className="mt-1 text-lg font-bold font-mono text-purple-600">
                {settings.reminder24hEnabled ? 'Active' : 'Disabled'}
              </div>
              <p className="mt-0.5 text-[10px] text-gray-500">WhatsApp & Push</p>
            </div>

            {/* Step 4: Cancellation Cutoff */}
            <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-2xs">
              <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">4. Cutoff Gate</div>
              <div className="mt-1 text-lg font-bold font-mono text-amber-600">{settings.cancellationCutoffHours} Hours</div>
              <p className="mt-0.5 text-[10px] text-gray-500">Lock cancellation</p>
            </div>

            {/* Step 5: Arrival & 3h Reminder */}
            <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-2xs">
              <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">5. Arrival Prep</div>
              <div className="mt-1 text-lg font-bold font-mono text-indigo-600">{settings.arrivalWindowHours ?? 3} Hours</div>
              <p className="mt-0.5 text-[10px] text-gray-500">Clinic arrival window</p>
            </div>

            {/* Step 6: Neglected Settlement */}
            <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-2xs">
              <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">6. Settlement</div>
              <div className="mt-1 text-lg font-bold font-mono text-emerald-600">{settings.neglectedResolutionHours} Hours</div>
              <p className="mt-0.5 text-[10px] text-gray-500">Post-shift cutoff</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Advance Scheduling & Arrival Rules */}
        <Card className="border-gray-200 shadow-xs">
          <CardHeader className="border-b border-gray-100 pb-3">
            <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span>{t('schedulingAdvanceRules', 'Advance Scheduling & Arrival Window')}</span>
            </CardTitle>
            <CardDescription className="text-xs text-gray-500">
              Governs how early patients can browse doctor calendars and the clinic arrival check-in window.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Field 1: Advance Booking Days */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="advanceBookingDays" className="text-xs font-semibold text-gray-800">
                    {t('maxAdvanceBookingDays', 'Maximum Advance Booking Days')}
                  </Label>
                  <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {settings.advanceBookingDays} Days
                  </span>
                </div>
                <div className="relative">
                  <Input
                    id="advanceBookingDays"
                    type="number"
                    min="1"
                    max="90"
                    disabled={isReadOnly}
                    required
                    value={settings.advanceBookingDays}
                    onChange={(e) =>
                      setSettings({ ...settings, advanceBookingDays: Number(e.target.value) })
                    }
                    className="font-mono text-sm pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">
                    Days
                  </span>
                </div>
                {/* Presets */}
                {!isReadOnly && (
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-gray-400">Presets:</span>
                    {[7, 14, 30, 60].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setSettings({ ...settings, advanceBookingDays: val })}
                        className={`rounded px-2 py-0.5 text-[11px] font-medium transition-all ${
                          settings.advanceBookingDays === val
                            ? 'bg-blue-600 text-white font-bold'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {val}d
                      </button>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500 leading-relaxed">
                  How far into the future patients can view doctor availability and book appointment slots (Recommended: 14 days).
                </p>
              </div>

              {/* Field 2: Arrival Window Hours */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="arrivalWindowHours" className="text-xs font-semibold text-gray-800">
                    {t('arrivalWindowHours', 'Clinic Arrival Window Before Appointment')}
                  </Label>
                  <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    {settings.arrivalWindowHours ?? 3} Hours
                  </span>
                </div>
                <div className="relative">
                  <Input
                    id="arrivalWindowHours"
                    type="number"
                    min="0"
                    max="72"
                    disabled={isReadOnly}
                    required
                    value={settings.arrivalWindowHours ?? 3}
                    onChange={(e) =>
                      setSettings({ ...settings, arrivalWindowHours: Number(e.target.value) })
                    }
                    className="font-mono text-sm pr-14"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">
                    Hours
                  </span>
                </div>
                {/* Presets */}
                {!isReadOnly && (
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-gray-400">Presets:</span>
                    {[1, 2, 3, 4].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setSettings({ ...settings, arrivalWindowHours: val })}
                        className={`rounded px-2 py-0.5 text-[11px] font-medium transition-all ${
                          settings.arrivalWindowHours === val
                            ? 'bg-indigo-600 text-white font-bold'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {val}h
                      </button>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500 leading-relaxed">
                  Recommended patient clinic arrival and triage preparation window before consultation starts (Default: 3 hours).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Cancellation & Auto-Reject Safeguards */}
        <Card className="border-gray-200 shadow-xs">
          <CardHeader className="border-b border-gray-100 pb-3">
            <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-rose-600" />
              <span>{t('cancellationSafeguards', 'Cancellation & Auto-Reject Safeguards')}</span>
            </CardTitle>
            <CardDescription className="text-xs text-gray-500">
              Hard-blocked protection policies preventing last-minute booking cancellations and unhandled requests.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Field 1: Cancellation Cutoff Hours */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="cancellationCutoffHours" className="text-xs font-semibold text-gray-800">
                    {t('cancellationCutoffWindow', 'Patient Cancellation Cut-off Window')}
                  </Label>
                  <span className="font-mono text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    {settings.cancellationCutoffHours} Hours Prior
                  </span>
                </div>
                <div className="relative">
                  <Input
                    id="cancellationCutoffHours"
                    type="number"
                    min="1"
                    max="72"
                    disabled={isReadOnly}
                    required
                    value={settings.cancellationCutoffHours}
                    onChange={(e) =>
                      setSettings({ ...settings, cancellationCutoffHours: Number(e.target.value) })
                    }
                    className="font-mono text-sm pr-14"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">
                    Hours
                  </span>
                </div>
                {/* Presets */}
                {!isReadOnly && (
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-gray-400">Presets:</span>
                    {[6, 12, 24, 48].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setSettings({ ...settings, cancellationCutoffHours: val })}
                        className={`rounded px-2 py-0.5 text-[11px] font-medium transition-all ${
                          settings.cancellationCutoffHours === val
                            ? 'bg-rose-600 text-white font-bold'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {val}h
                      </button>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500 leading-relaxed">
                  Hard-blocked server-side cutoff prior to slot start time. Within this window, cancellation is locked to safeguard clinic schedules (Requirement: 12 hours).
                </p>
              </div>

              {/* Field 2: Auto-Reject Timeout Minutes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="autoRejectTimeoutMinutes" className="text-xs font-semibold text-gray-800">
                    {t('pendingAutoRejectTimeout', 'Pending Request Auto-Reject Timeout')}
                  </Label>
                  <span className="font-mono text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {settings.autoRejectTimeoutMinutes} Minutes
                  </span>
                </div>
                <div className="relative">
                  <Input
                    id="autoRejectTimeoutMinutes"
                    type="number"
                    min="5"
                    max="240"
                    disabled={isReadOnly}
                    required
                    value={settings.autoRejectTimeoutMinutes}
                    onChange={(e) =>
                      setSettings({ ...settings, autoRejectTimeoutMinutes: Number(e.target.value) })
                    }
                    className="font-mono text-sm pr-16"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">
                    Minutes
                  </span>
                </div>
                {/* Presets */}
                {!isReadOnly && (
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-gray-400">Presets:</span>
                    {[15, 30, 45, 60].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setSettings({ ...settings, autoRejectTimeoutMinutes: val })}
                        className={`rounded px-2 py-0.5 text-[11px] font-medium transition-all ${
                          settings.autoRejectTimeoutMinutes === val
                            ? 'bg-amber-600 text-white font-bold'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {val}m
                      </button>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500 leading-relaxed">
                  Clinic response window before an unconfirmed booking automatically rejects and refunds the patient (Default: 30 minutes).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Shift Settlement & Resolution */}
        <Card className="border-gray-200 shadow-xs">
          <CardHeader className="border-b border-gray-100 pb-3">
            <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Receipt className="h-4 w-4 text-emerald-600" />
              <span>{t('settlementResolution', 'Shift Settlement & Neglected Resolution')}</span>
            </CardTitle>
            <CardDescription className="text-xs text-gray-500">
              Rules governing post-shift resolution for neglected or unconfirmed appointment attendance.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            <div className="max-w-md space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="neglectedResolutionHours" className="text-xs font-semibold text-gray-800">
                  {t('neglectedSettlementCutoff', 'Neglected Appointment Settlement Cutoff')}
                </Label>
                <span className="font-mono text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {settings.neglectedResolutionHours} Hours Post-Shift
                </span>
              </div>
              <div className="relative">
                <Input
                  id="neglectedResolutionHours"
                  type="number"
                  min="1"
                  max="72"
                  disabled={isReadOnly}
                  required
                  value={settings.neglectedResolutionHours}
                  onChange={(e) =>
                    setSettings({ ...settings, neglectedResolutionHours: Number(e.target.value) })
                  }
                  className="font-mono text-sm pr-14"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">
                  Hours
                </span>
              </div>
              {/* Presets */}
              {!isReadOnly && (
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-gray-400">Presets:</span>
                  {[6, 12, 24, 48].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setSettings({ ...settings, neglectedResolutionHours: val })}
                      className={`rounded px-2 py-0.5 text-[11px] font-medium transition-all ${
                        settings.neglectedResolutionHours === val
                          ? 'bg-emerald-600 text-white font-bold'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {val}h
                    </button>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500 leading-relaxed">
                Elapsed time after clinic shift conclusion before neglected appointments automatically finalize into settlement records (Requirement: 12 hours).
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Automated Pre-Appointment Notifications (WhatsApp & Push) */}
        <Card className="border-gray-200 shadow-xs">
          <CardHeader className="border-b border-gray-100 pb-3">
            <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Bell className="h-4 w-4 text-amber-500" />
              <span>{t('notificationDispatchers', 'Automated Pre-Appointment Reminders')}</span>
            </CardTitle>
            <CardDescription className="text-xs text-gray-500">
              Scheduled background queue dispatchers alerting patients via FCM push, in-app notifications, and WhatsApp.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {/* 24h Reminder Switch */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition-colors">
              <div className="space-y-1 pr-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {t('reminder24hTitle', '24-Hour Pre-Appointment Reminder')}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-bold ${
                      settings.reminder24hEnabled
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-gray-100 text-gray-600 border-gray-200'
                    }`}
                  >
                    {settings.reminder24hEnabled ? t('active', 'Active') : t('disabled', 'Disabled')}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Dispatches FCM push, in-app notification, and WhatsApp alert exactly 24 hours prior to appointment period.
                </p>
              </div>
              <Switch
                id="reminder24h"
                checked={settings.reminder24hEnabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, reminder24hEnabled: Boolean(checked) })
                }
                disabled={isReadOnly}
              />
            </div>

            {/* 3h Reminder Switch */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition-colors">
              <div className="space-y-1 pr-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {t('reminder3hTitle', '3-Hour Clinic Arrival Reminder')}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-bold ${
                      settings.reminder3hEnabled
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-gray-100 text-gray-600 border-gray-200'
                    }`}
                  >
                    {settings.reminder3hEnabled ? t('active', 'Active') : t('disabled', 'Disabled')}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Dispatches final clinic preparation alert 3 hours prior to patient arrival window.
                </p>
              </div>
              <Switch
                id="reminder3h"
                checked={settings.reminder3hEnabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, reminder3hEnabled: Boolean(checked) })
                }
                disabled={isReadOnly}
              />
            </div>
          </CardContent>
        </Card>

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-gray-500">
            {isDirty ? (
              <span className="text-blue-600 font-medium">● Unsaved changes detected</span>
            ) : (
              <span>All settings synchronized with backend policies</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isDirty && !isReadOnly && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDiscard}
                className="text-xs text-gray-600"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                {t('discard', 'Discard')}
              </Button>
            )}

            {isReadOnly ? (
              <Button disabled className="bg-gray-300 text-white cursor-not-allowed text-xs">
                {t('readOnlyMode', 'Read Only Mode')}
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={saving || !isDirty}
                className={`gap-2 text-xs font-semibold shadow-xs ${
                  isDirty
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed hover:bg-gray-100'
                }`}
              >
                <Save className="h-4 w-4" />
                {saving ? t('saving', 'Saving Settings...') : t('saveSettings', 'Save Settings')}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
