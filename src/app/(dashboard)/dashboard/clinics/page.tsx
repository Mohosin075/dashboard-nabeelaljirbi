'use client';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import { toast } from '@/hooks/use-toast';
import { adminService, Clinic } from '@/services/admin.service';
import {
    AlertTriangle,
    Ban,
    Bell,
    Check,
    DollarSign,
    Loader2,
    Mail,
    MapPin,
    Phone,
    Search,
    Send,
    User,
    Wallet,
    Eye,
    EyeOff,
} from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { useAuthStore } from '@/stores/auth-store';
import { useEffect, useState } from 'react';

export default function ClinicsPage() {
  const { t } = useLanguage();
  const adminTier = useAuthStore((state) => state.adminTier) || 'SUPER_ADMIN';
  const isReadOnly = adminTier === 'READ_ONLY';
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [serviceFeeValues, setServiceFeeValues] = useState<Record<string, string>>({});
  const [settingServiceFee, setSettingServiceFee] = useState<string | null>(null);
  const [activeSearch, setActiveSearch] = useState('');

  // Wallet states
  const [showWalletDialog, setShowWalletDialog] = useState(false);
  const [walletAmount, setWalletAmount] = useState('');
  const [walletProcessing, setWalletProcessing] = useState(false);

  // Notification states
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationDescription, setNotificationDescription] = useState('');
  const [notificationProcessing, setNotificationProcessing] = useState(false);
  const [isGlobalNotification, setIsGlobalNotification] = useState(false);
  const [usersList, setUsersList] = useState<{ id: string; name: string; info: string }[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [loadingUsersList, setLoadingUsersList] = useState(false);
  const [usersSearch, setUsersSearch] = useState('');

  // Suspension states
  const [suspendClinicTarget, setSuspendClinicTarget] = useState<Clinic | null>(null);
  const [showSuspendClinicDialog, setShowSuspendClinicDialog] = useState(false);
  const [suspendingClinic, setSuspendingClinic] = useState(false);

  // Visibility states
  const [visibilityLoading, setVisibilityLoading] = useState<string | null>(null);
  const [paymentClinic, setPaymentClinic] = useState<Clinic | null>(null);
  const [paymentMode, setPaymentMode] = useState('MODE_A');
  const [patientPercentage, setPatientPercentage] = useState('10');
  const [savingPayment, setSavingPayment] = useState(false);
  const canEditFinance = ['SUPER_ADMIN', 'FINANCE'].includes(adminTier);
  const savePaymentSettings = async () => {
    if (!paymentClinic || !canEditFinance) return;
    try {
      setSavingPayment(true);
      await adminService.updateClinicPaymentSettings(paymentClinic.clinicId || paymentClinic.id, {
        collectionMode: paymentMode, serviceFeePercentage: Number(patientPercentage),
      });
      setPaymentClinic(null);
      await fetchClinics();
      toast({ title: t('success', 'Success'), description: t('futureBookingSettingsSaved', 'Payment settings saved for future bookings.') });
    } catch (error: any) {
      toast({ title: t('error', 'Error'), description: error.response?.data?.message || 'Unable to save payment settings', variant: 'destructive' });
    } finally { setSavingPayment(false); }
  };

  const handleToggleVisibility = async (clinic: Clinic) => {
    if (isReadOnly) {
      toast({
        title: t('error', 'Error'),
        description: 'Read-Only tier cannot change clinic visibility',
        variant: 'destructive',
      });
      return;
    }
    const currentVisibility = clinic.isVisible !== false;
    const newVisibility = !currentVisibility;
    try {
      setVisibilityLoading(clinic.id);
      await adminService.updateClinicVisibility(clinic.id, newVisibility);
      toast({
        title: t('success', 'Success'),
        description: `${clinic.clinicName || 'Clinic'} is now ${newVisibility ? 'visible on' : 'hidden from'} patient app`,
      });
      setClinics((prev) =>
        prev.map((c) => (c.id === clinic.id ? { ...c, isVisible: newVisibility } : c))
      );
    } catch (err: any) {
      toast({
        title: t('error', 'Error'),
        description: err.response?.data?.message || 'Failed to update visibility',
        variant: 'destructive',
      });
    } finally {
      setVisibilityLoading(null);
    }
  };

  useEffect(() => {
    fetchClinics();
  }, [page, activeSearch]);

  const handleSearch = () => {
    setPage(1);
    setActiveSearch(search);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const fetchClinics = async () => {
    try {
      setLoading(true);
      const response = await adminService.getClinics({ page, limit: 10, search: activeSearch });

      let data = response.data.data || [];
      setClinics(data);
      setTotalPages(Math.ceil((response.data.meta?.total || 0) / 10));
    } catch (error: any) {
      toast({
        title: 'Error',
        description:
          error.response?.data?.message || 'Failed to load clinics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyClick = (clinic: Clinic) => {
    if (isReadOnly) return;
    setSelectedClinic(clinic);
    setShowVerifyDialog(true);
  };

  const handleVerify = async () => {
    if (!selectedClinic || isReadOnly) return;

    try {
      setVerifying(true);
      await adminService.verifyClinic(
        selectedClinic.id,
        !selectedClinic.adminVerified
      );
      toast({
        title: 'Success',
        description: `Clinic ${
          selectedClinic.adminVerified ? 'unverified' : 'verified'
        } successfully`,
      });
      fetchClinics();
    } catch (error: any) {
      toast({
        title: 'Error',
        description:
          error.response?.data?.message || 'Failed to update clinic',
        variant: 'destructive',
      });
    } finally {
      setVerifying(false);
      setShowVerifyDialog(false);
      setSelectedClinic(null);
    }
  };

  const handleSuspendClick = (clinic: Clinic) => {
    if (isReadOnly) return;
    setSuspendClinicTarget(clinic);
    setShowSuspendClinicDialog(true);
  };

  const handleToggleSuspendClinic = async () => {
    if (!suspendClinicTarget || isReadOnly) return;
    const isCurrentlySuspended = suspendClinicTarget.status === 'SUSPENDED' || suspendClinicTarget.banned === true;
    try {
      setSuspendingClinic(true);
      const res = await adminService.suspendClinic(
        suspendClinicTarget.clinicId || suspendClinicTarget.id,
        !isCurrentlySuspended
      );
      toast({
        title: 'Success',
        description: res.message || (isCurrentlySuspended ? 'Clinic activated successfully' : 'Clinic suspended successfully'),
      });
      fetchClinics();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update clinic suspension status',
        variant: 'destructive',
      });
    } finally {
      setSuspendingClinic(false);
      setShowSuspendClinicDialog(false);
      setSuspendClinicTarget(null);
    }
  };

  const handleSetServiceFee = async (clinicId: string) => {
    if (isReadOnly) return;
    const value = serviceFeeValues[clinicId] || '';
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid service fee',
        variant: 'destructive',
      });
      return;
    }
    try {
      setSettingServiceFee(clinicId);
      await adminService.setServiceFee(clinicId, numValue);
      toast({
        title: 'Success',
        description: 'Service fee updated successfully',
      });
      fetchClinics();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update service fee',
        variant: 'destructive',
      });
    } finally {
      setSettingServiceFee(null);
    }
  };

  // ── Wallet handlers ──────────────────────────────────────────
  const handleWalletClick = (clinic: Clinic) => {
    setSelectedClinic(clinic);
    setWalletAmount(String(clinic.wallet ?? 0));
    setShowWalletDialog(true);
  };

  const handleWalletUpdate = async () => {
    if (!selectedClinic) return;
    const amount = Number(walletAmount);
    if (!Number.isFinite(amount) || amount < 0) {
      toast({ title: 'Error', description: 'Please enter a valid wallet amount', variant: 'destructive' });
      return;
    }
    try {
      setWalletProcessing(true);
      const response = await adminService.updateWallet(selectedClinic.id, amount);
      toast({ title: 'Success', description: response.message || 'Wallet updated successfully' });
      closeActionDialogs();
      fetchClinics();
    } catch (error: any) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to update wallet', variant: 'destructive' });
    } finally {
      setWalletProcessing(false);
    }
  };

  // ── Notification handlers ────────────────────────────────────
  const handleNotificationClick = (clinic: Clinic) => {
    setSelectedClinic(clinic);
    setIsGlobalNotification(false);
    setNotificationTitle(`Notification for ${clinic.clinicName || clinic.phoneNumber}`);
    setNotificationDescription('');
    setUsersList([{
      id: clinic.id,
      name: clinic.clinicName || clinic.phoneNumber,
      info: clinic.email || clinic.phoneNumber,
    }]);
    setSelectedUserIds([clinic.id]);
    setUsersSearch('');
    setShowNotificationDialog(true);
  };

  const handleGlobalNotificationClick = async () => {
    setSelectedClinic(null);
    setIsGlobalNotification(true);
    setNotificationTitle('Global Update for All Clinics');
    setNotificationDescription('');
    setUsersSearch('');
    setSelectedUserIds([]);
    setUsersList([]);
    setShowNotificationDialog(true);

    try {
      setLoadingUsersList(true);
      const response = await adminService.getClinics({ limit: 100000 });
      const allClinics = response.data?.data || [];
      const mapped = allClinics.map((c) => ({
        id: c.id,
        name: c.clinicName || c.phoneNumber,
        info: c.email || c.phoneNumber,
      }));
      setUsersList(mapped);
      setSelectedUserIds(mapped.map((u) => u.id));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load clinics list',
        variant: 'destructive',
      });
    } finally {
      setLoadingUsersList(false);
    }
  };

  const handleSendNotification = async () => {
    if (selectedUserIds.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one clinic to notify',
        variant: 'destructive',
      });
      return;
    }
    const title = notificationTitle.trim();
    const description = notificationDescription.trim();
    if (!title || !description) {
      toast({ title: 'Error', description: 'Title and description are required', variant: 'destructive' });
      return;
    }
    try {
      setNotificationProcessing(true);
      const response = await adminService.sendClinicNotification(selectedUserIds, title, description);
      toast({ 
        title: 'Success', 
        description: response.message || (isGlobalNotification 
          ? `Queued notifications for ${selectedUserIds.length} clinics successfully.` 
          : 'Clinic notification sent successfully') 
      });
      closeActionDialogs();
    } catch (error: any) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to send notification', variant: 'destructive' });
    } finally {
      setNotificationProcessing(false);
    }
  };

  const closeActionDialogs = () => {
    setShowWalletDialog(false);
    setShowNotificationDialog(false);
    setSelectedClinic(null);
    setIsGlobalNotification(false);
    setWalletAmount('');
    setNotificationTitle('');
    setNotificationDescription('');
    setUsersList([]);
    setSelectedUserIds([]);
    setUsersSearch('');
  };

  const filteredUsers = usersList.filter((u) =>
    u.name.toLowerCase().includes(usersSearch.toLowerCase()) ||
    (u.info && u.info.toLowerCase().includes(usersSearch.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {t('clinicManagement', 'Clinic Management')}
          </h1>
          <p className="mt-1 text-sm text-gray-600 sm:text-base">
            {clinics.length} {t('clinicsRegistered', 'clinics registered')}
          </p>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          <div className="relative flex-1 sm:flex-initial">
              <Search
                  className="absolute left-2.5 rtl:left-auto rtl:right-2.5 top-2.5 h-4 w-4 text-muted-foreground cursor-pointer"
                  onClick={handleSearch}
              />
              <Input
              placeholder={t('searchClinics', 'Search clinics...')}
              className="pl-8 rtl:pl-3 rtl:pr-8 w-full sm:w-[200px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              />
          </div>
          <Button 
            onClick={handleGlobalNotificationClick}
            disabled={isReadOnly}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50"
            size="sm"
          >
            <Bell className="ltr:mr-2 rtl:ml-2 h-4 w-4" /> {t('globalNotification', 'Global Notification')}
          </Button>
        </div>
      </div>

      <Dialog open={!!paymentClinic} onOpenChange={(open) => { if (!open) setPaymentClinic(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('bookingPaymentSettings', 'Booking payment settings')}</DialogTitle>
            <DialogDescription>{paymentClinic?.clinicName} - {paymentClinic?.country}</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <label className="block text-sm">{t('collectionModel', 'Collection model')}
              <select className="mt-2 w-full border rounded p-2" value={paymentMode} onChange={e => setPaymentMode(e.target.value)}>
                <option value="MODE_A">{t('modelAFixedFee', 'Model A: fixed patient fee; consultation paid at clinic')}</option>
                <option value="MODE_B">{t('modelBFullPayment', 'Model B: consultation + percentage patient fee')}</option>
              </select>
            </label>
            {paymentMode === 'MODE_A' ? <p className="text-sm">{t('modelAFeeCountryHelp', 'Fixed patient fees are configured by clinic country in Platform Financials.')}</p> :
              <label className="block text-sm">{t('patientFeePercent', 'Patient service fee (% of consultation)')}
                <Input type="number" min="0" max="100" step="0.01" value={patientPercentage} onChange={e => setPatientPercentage(e.target.value)} />
              </label>}
            <p className="text-xs text-gray-600">{t('futureBookingsOnly', 'Applies to future bookings. Existing booking amounts stay unchanged.')}</p>
          </div>
          <DialogFooter><Button disabled={savingPayment || !canEditFinance || patientPercentage.trim() === ''} onClick={savePaymentSettings}>{t('save', 'Save')}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Clinics Grid */}
     <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {clinics.map((clinic) => (
<Card
  key={clinic.id}
  className="
    group
    rounded-xl
    border border-gray-200
    bg-white
    transition-all
    duration-200
    hover:border-indigo-300
    hover:shadow-md
  "
>
  <CardContent className="flex h-full flex-col p-4">
    {/* TOP */}
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 border">
          <AvatarImage src={clinic.logo ?? undefined} />
          <AvatarFallback className="bg-indigo-100 text-indigo-600 text-xs font-semibold">
            {(clinic.clinicName || clinic.phoneNumber || 'CL').slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-gray-900">
            {clinic.clinicName || <span className="italic text-gray-400">{t('profileIncomplete', 'Profile Incomplete')}</span>}
          </h3>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="h-3 w-3 text-indigo-500" />
            <span className="truncate">
              {[clinic.city, clinic.country].filter(Boolean).join(', ') || '—'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {clinic.status === 'SUSPENDED' || clinic.banned ? (
          <span className="rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-[10px] font-semibold">
            {t('suspended', 'Suspended')}
          </span>
        ) : (
          <span className="rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-[10px] font-semibold">
            {t('active', 'Active')}
          </span>
        )}
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-medium
            ${
              clinic.adminVerified
                ? 'bg-green-100 text-green-700'
                : 'bg-amber-100 text-amber-700'
            }
          `}
        >
          {clinic.adminVerified ? t('verified', 'Verified') : t('pending', 'Pending')}
        </span>

        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-medium
            ${
              clinic.isVisible !== false
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-gray-200 text-gray-700'
            }
          `}
        >
          {clinic.isVisible !== false ? t('visible', 'Visible') : t('hidden', 'Hidden')}
        </span>
      </div>
    </div>

    {/* BODY */}
    <div className="mt-3 space-y-2 text-sm text-gray-700">
      {clinic.email && (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-indigo-500" />
          <span className="truncate">{clinic.email}</span>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Phone className="h-4 w-4 text-indigo-500" />
        <span dir="ltr">{clinic.phoneNumber}</span>
      </div>
    </div>

    {/* MANAGER INLINE */}
    <div className="mt-3 flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-700">
      <div className="flex items-center gap-1.5">
        <User className="h-3.5 w-3.5 text-indigo-500" />
        {clinic.managerName || '—'}
      </div>
      <div className="flex items-center gap-1.5">
        <Phone className="h-3.5 w-3.5 text-indigo-500" />
        <span dir="ltr">{clinic.managerPhone || '—'}</span>
      </div>
    </div>

    {/* WALLET BALANCE */}
    <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-amber-800">
      <DollarSign className="h-4 w-4" />
      <span className="text-sm font-medium">
        {t('walletBalance', 'Wallet balance')}: ${Number(clinic.wallet ?? 0).toFixed(2)}
      </span>
    </div>

    {/* ACTION */}
    <div className="mt-4 space-y-2">
      <Button variant="outline" size="sm" disabled={!canEditFinance} onClick={() => {
        setPaymentClinic(clinic); setPaymentMode(clinic.collectionMode || 'MODE_A');
        setPatientPercentage(String(clinic.serviceFeePercentage ?? 10));
      }}>{t('bookingPaymentSettings', 'Booking payment settings')} ({clinic.collectionMode === 'MODE_B' ? 'B' : 'A'})</Button>
      <p className="text-xs text-gray-600">{t('clinicPlatformFeePercent', 'Clinic platform fee (%)')}</p>
      {/* Service Fee Input */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <DollarSign className="absolute left-2 rtl:left-auto rtl:right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input
            type="number"
            min={0}
            step="0.01"
            disabled={isReadOnly}
            placeholder={clinic.serviceFree !== undefined ? String(clinic.serviceFree) : t('serviceFee', 'Service fee')}
            value={serviceFeeValues[clinic.id] ?? ''}
            onChange={(e) =>
              setServiceFeeValues((prev) => ({ ...prev, [clinic.id]: e.target.value }))
            }
            className="w-full rounded-lg border border-gray-200 bg-white py-1.5 pl-7 pr-2 rtl:pl-2 rtl:pr-7 text-xs text-gray-700 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>
        <Button
          onClick={() => handleSetServiceFee(clinic.id)}
          size="sm"
          disabled={isReadOnly || settingServiceFee === clinic.id}
          className="rounded-lg bg-emerald-600 px-3 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {settingServiceFee === clinic.id ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            t('save', 'Set')
          )}
        </Button>
      </div>

      {/* Wallet + Notify buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={() => handleWalletClick(clinic)}
          variant="outline"
          size="sm"
          disabled={isReadOnly}
          className="flex items-center justify-center gap-1.5 border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800 disabled:opacity-50"
        >
          <Wallet className="h-3.5 w-3.5" />
          {t('addFunds', 'Update Wallet')}
        </Button>
        <Button
          onClick={() => handleNotificationClick(clinic)}
          variant="outline"
          size="sm"
          disabled={isReadOnly}
          className="flex items-center justify-center gap-1.5 border-sky-200 text-sky-700 hover:bg-sky-50 hover:text-sky-800 disabled:opacity-50"
        >
          <Bell className="h-3.5 w-3.5" />
          {t('notifications', 'Notify')}
        </Button>
      </div>

      {/* Action buttons: Verify/Unverify & Suspend/Activate */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={() => handleVerifyClick(clinic)}
          size="sm"
          disabled={isReadOnly}
          className={`w-full rounded-lg text-xs font-medium disabled:opacity-50
            ${
              clinic.adminVerified
                ? 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }
          `}
          variant="ghost"
        >
          {clinic.adminVerified ? t('unverified', 'Unverify') : t('verifyClinic', 'Verify')}
        </Button>

        {clinic.status === 'SUSPENDED' || clinic.banned ? (
          <Button
            onClick={() => handleSuspendClick(clinic)}
            size="sm"
            variant="outline"
            disabled={isReadOnly}
            className="w-full rounded-lg text-xs font-semibold border-emerald-300 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
          >
            <Check className="h-3.5 w-3.5 ltr:mr-1 rtl:ml-1" />
            {t('activate', 'Activate')}
          </Button>
        ) : (
          <Button
            onClick={() => handleSuspendClick(clinic)}
            size="sm"
            variant="outline"
            disabled={isReadOnly}
            className="w-full rounded-lg text-xs font-semibold border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            <Ban className="h-3.5 w-3.5 ltr:mr-1 rtl:ml-1" />
            {t('suspend', 'Suspend')}
          </Button>
        )}
      </div>

      {/* Visibility Button */}
      <Button
        onClick={() => handleToggleVisibility(clinic)}
        size="sm"
        variant="outline"
        disabled={isReadOnly || visibilityLoading === clinic.id}
        className={`w-full rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 disabled:opacity-50 ${
          clinic.isVisible !== false
            ? 'border-gray-200 text-gray-700 hover:bg-gray-50'
            : 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100'
        }`}
      >
        {visibilityLoading === clinic.id ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : clinic.isVisible !== false ? (
          <>
            <EyeOff className="h-3.5 w-3.5" />
            {t('hideFromApp', 'Hide from Patient App')}
          </>
        ) : (
          <>
            <Eye className="h-3.5 w-3.5" />
            {t('showInApp', 'Make Visible in App')}
          </>
        )}
      </Button>
    </div>
  </CardContent>
</Card>




        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <Button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            variant="outline"
          >
            {t('previous')}
          </Button>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (p) => (
                <Button
                  key={p}
                  onClick={() => setPage(p)}
                  size="sm"
                  variant={page === p ? 'default' : 'outline'}
                >
                  {p}
                </Button>
              )
            )}
          </div>

          <Button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            variant="outline"
          >
            {t('next')}
          </Button>
        </div>
      )}

      {/* Verify Dialog */}
      <AlertDialog
        open={showVerifyDialog}
        onOpenChange={setShowVerifyDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedClinic?.adminVerified ? t('unverify') : t('verifyClinic')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedClinic?.adminVerified ? t('confirmUnverifyClinic') : t('confirmVerifyClinic')}{' '}
              <strong>{selectedClinic?.clinicName}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={verifying}>
              {t('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleVerify}
              disabled={verifying}
            >
              {verifying ? t('processing') : t('confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Wallet Dialog */}
      <Dialog
        open={showWalletDialog}
        onOpenChange={(open) => {
          setShowWalletDialog(open);
          if (!open) closeActionDialogs();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('updateWallet')}</DialogTitle>
            <DialogDescription>
              {t('updateWalletDesc')} {selectedClinic?.clinicName || t('thisClinic')}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="clinic-wallet-amount">{t('walletAmount')}</Label>
              <Input
                id="clinic-wallet-amount"
                type="number"
                min={0}
                step="0.01"
                value={walletAmount}
                onChange={(e) => setWalletAmount(e.target.value)}
                placeholder={t('enterWalletAmount')}
                disabled={walletProcessing}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={closeActionDialogs}
              disabled={walletProcessing}
            >
              {t('cancel')}
            </Button>
            <Button type="button" onClick={handleWalletUpdate} disabled={walletProcessing}>
              {walletProcessing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <DollarSign className="mr-2 h-4 w-4" />
              )}
              {t('updateWallet')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notification Dialog */}
      <Dialog
        open={showNotificationDialog}
        onOpenChange={(open) => {
          setShowNotificationDialog(open);
          if (!open) closeActionDialogs();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isGlobalNotification ? t('sendGlobalClinicNotification') : t('sendClinicNotification')}</DialogTitle>
            <DialogDescription>
              {isGlobalNotification 
                ? t('sendGlobalClinicDesc')
                : `${t('sendClinicDesc')} ${selectedClinic?.clinicName || t('thisClinic')}.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="clinic-notification-title">{t('title')}</Label>
              <Input
                id="clinic-notification-title"
                value={notificationTitle}
                onChange={(e) => setNotificationTitle(e.target.value)}
                placeholder={t('enterNotificationTitle')}
                disabled={notificationProcessing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clinic-notification-description">{t('description')}</Label>
              <Textarea
                id="clinic-notification-description"
                value={notificationDescription}
                onChange={(e) => setNotificationDescription(e.target.value)}
                placeholder={t('enterNotificationDesc')}
                disabled={notificationProcessing}
                rows={4}
              />
            </div>

            {/* Clinic Selection List */}
            <div className="space-y-2 border-t pt-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-gray-700">
                  {isGlobalNotification ? t('selectClinicsToNotify') : t('clinicRecipient')}
                </Label>
                <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-50">
                  {t('selectedCount')}: {selectedUserIds.length} / {usersList.length}
                </Badge>
              </div>

              {isGlobalNotification && (
                <div className="flex items-center gap-2 mb-2">
                  <Input
                    placeholder={t('searchClinicsInList')}
                    value={usersSearch}
                    onChange={(e) => setUsersSearch(e.target.value)}
                    className="h-8 text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs px-2 whitespace-nowrap"
                    onClick={() => {
                      if (selectedUserIds.length === usersList.length) {
                        setSelectedUserIds([]);
                      } else {
                        setSelectedUserIds(usersList.map((u) => u.id));
                      }
                    }}
                  >
                    {selectedUserIds.length === usersList.length ? t('deselectAll') : t('selectAll')}
                  </Button>
                </div>
              )}

              {loadingUsersList ? (
                <div className="flex h-32 items-center justify-center border rounded-lg bg-gray-50 animate-pulse">
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                  <span className="ml-2 text-sm text-gray-500">{t('loadingClinicsList')}</span>
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto border rounded-lg p-2 space-y-1 bg-gray-50">
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-4 text-xs text-gray-400">
                      {t('noClinicsFound')}
                    </div>
                  ) : (
                    filteredUsers.map((u) => {
                      const isChecked = selectedUserIds.includes(u.id);
                      return (
                        <div
                          key={u.id}
                          className="flex items-center space-x-2 rounded px-2 py-1.5 hover:bg-white transition-colors cursor-pointer"
                          onClick={() => {
                            if (isChecked) {
                              setSelectedUserIds(selectedUserIds.filter((id) => id !== u.id));
                            } else {
                              setSelectedUserIds([...selectedUserIds, u.id]);
                            }
                          }}
                        >
                          <Checkbox
                            id={`user-${u.id}`}
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedUserIds([...selectedUserIds, u.id]);
                              } else {
                                setSelectedUserIds(selectedUserIds.filter((id) => id !== u.id));
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 truncate">
                              {u.name}
                            </p>
                            {u.info && (
                              <p className="text-[10px] text-gray-500 truncate">
                                {u.info}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={closeActionDialogs}
              disabled={notificationProcessing}
            >
              {t('cancel')}
            </Button>
            <Button
              type="button"
              onClick={handleSendNotification}
              disabled={notificationProcessing || selectedUserIds.length === 0}
              className={isGlobalNotification ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700" : ""}
            >
              {notificationProcessing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              {isGlobalNotification ? `${t('sendToCount')} ${selectedUserIds.length} ${t('clinics')}` : t('sendNotification')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clinic Suspension Alert Dialog */}
      <AlertDialog open={showSuspendClinicDialog} onOpenChange={setShowSuspendClinicDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              {suspendClinicTarget?.status === 'SUSPENDED' || suspendClinicTarget?.banned ? (
                <div className="p-2 rounded-full bg-emerald-100 text-emerald-700">
                  <Check className="h-5 w-5" />
                </div>
              ) : (
                <div className="p-2 rounded-full bg-red-100 text-red-700">
                  <AlertTriangle className="h-5 w-5" />
                </div>
              )}
              <AlertDialogTitle className="text-lg font-bold">
                {suspendClinicTarget?.status === 'SUSPENDED' || suspendClinicTarget?.banned
                  ? t('activateClinic', 'Activate Clinic')
                  : t('suspendClinic', 'Suspend Clinic')}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pt-2 text-sm text-gray-600 leading-relaxed">
              {suspendClinicTarget?.status === 'SUSPENDED' || suspendClinicTarget?.banned ? (
                t('activateClinicConfirmText', 'Are you sure you want to reactivate this clinic account?')
              ) : (
                <div className="space-y-3">
                  <p>
                    {t(
                      'suspendClinicConfirmText',
                      `Are you sure you want to suspend ${suspendClinicTarget?.clinicName || 'this clinic'}?`
                    )}
                  </p>
                  <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900 flex items-start gap-2.5">
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-amber-800 mb-0.5">
                        {t('suspendWarningTitle', 'Automatic Cancellation & Refund Policy')}
                      </p>
                      <p className="leading-normal">
                        {t(
                          'suspendWarningDesc',
                          'Suspending this clinic cancels upcoming appointments. Pending holds are released; eligible consultation fees for confirmed Mode B bookings are refunded. Service fees captured at confirmation are non-refundable.'
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel disabled={suspendingClinic}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleSuspendClinic}
              disabled={suspendingClinic}
              className={
                suspendClinicTarget?.status === 'SUSPENDED' || suspendClinicTarget?.banned
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }
            >
              {suspendingClinic
                ? t('loading')
                : suspendClinicTarget?.status === 'SUSPENDED' || suspendClinicTarget?.banned
                ? t('activate', 'Activate')
                : t('suspend', 'Suspend')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
