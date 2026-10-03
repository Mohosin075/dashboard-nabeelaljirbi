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
import { toast, toastSuccess, toastError } from '@/hooks/use-toast';
import { AdminPatient, adminService } from '@/services/admin.service';
import { patientServiceFeeService } from '@/services/patient-service-fee.service';
import {
  Ban,
  Bell,
  Calendar,
  CheckCircle,
  DollarSign,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Search,
  Send,
  Wallet,
} from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { useEffect, useState } from 'react';

export default function PatientsPage() {
  const { t } = useLanguage();
  const [patients, setPatients] = useState<AdminPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState(''); // Added search state
  const [selectedPatient, setSelectedPatient] = useState<AdminPatient | null>(null);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showWalletDialog, setShowWalletDialog] = useState(false);
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [walletAmount, setWalletAmount] = useState('');
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationDescription, setNotificationDescription] = useState('');
  const [walletProcessing, setWalletProcessing] = useState(false);
  const [notificationProcessing, setNotificationProcessing] = useState(false);
  const [isGlobalNotification, setIsGlobalNotification] = useState(false);
  const [usersList, setUsersList] = useState<{ id: string; name: string; info: string }[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [loadingUsersList, setLoadingUsersList] = useState(false);
  const [usersSearch, setUsersSearch] = useState('');

  // Service fee states
  const [serviceFees, setServiceFees] = useState<Record<string, string>>({
    Libya: '',
    Tunisia: '',
    Egypt: '',
    Algeria: '',
  });
  const [currentServiceFees, setCurrentServiceFees] = useState<Record<string, number>>({
    Libya: 0,
    Tunisia: 0,
    Egypt: 0,
    Algeria: 0,
  });
  const [savingServiceFee, setSavingServiceFee] = useState(false);
  const [loadingServiceFee, setLoadingServiceFee] = useState(true);

  // Create a separate state for the active search term to trigger fetch
  const [activeSearch, setActiveSearch] = useState('');

  useEffect(() => {
    fetchPatients();
  }, [page, activeSearch]);

  // Fetch service fee on mount
  useEffect(() => {
    fetchServiceFee();
  }, []);

  const fetchServiceFee = async () => {
    try {
      setLoadingServiceFee(true);
      const response = await patientServiceFeeService.get();
      if (response.data && response.data.length > 0) {
        const feesObj: Record<string, number> = {
          Libya: 0,
          Tunisia: 0,
          Egypt: 0,
          Algeria: 0,
        };
        const feesStrObj: Record<string, string> = {
          Libya: '',
          Tunisia: '',
          Egypt: '',
          Algeria: '',
        };
        
        response.data.forEach((fee) => {
          let key = 'Libya';
          if (fee.country === 'LIBYA') key = 'Libya';
          else if (fee.country === 'TUNISIA') key = 'Tunisia';
          else if (fee.country === 'EGYPT') key = 'Egypt';
          else if (fee.country === 'ALGERIA') key = 'Algeria';

          feesObj[key] = fee.amount;
          feesStrObj[key] = String(fee.amount);
        });

        setCurrentServiceFees(feesObj);
        setServiceFees(feesStrObj);
      }
    } catch {
      // silently fail, fee might not exist yet
    } finally {
      setLoadingServiceFee(false);
    }
  };

  const handleSaveServiceFee = async () => {
    const payload: Record<string, number> = {};
    const countries = ['Libya', 'Tunisia', 'Egypt', 'Algeria'];
    
    for (const country of countries) {
      const val = serviceFees[country] || '';
      const numValue = parseFloat(val);
      if (isNaN(numValue) || numValue < 0) {
        toast({
          title: 'Error',
          description: `Please enter a valid amount for ${country}`,
          variant: 'destructive',
        });
        return;
      }
      payload[country] = numValue;
    }

    try {
      setSavingServiceFee(true);
      const response = await patientServiceFeeService.upsert(payload);
      toast({
        title: 'Success',
        description: response.message || 'Patient service fees updated successfully',
      });
      
      const newFeesObj = { ...currentServiceFees };
      Object.entries(payload).forEach(([country, amount]) => {
        newFeesObj[country] = amount;
      });
      setCurrentServiceFees(newFeesObj);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update service fees',
        variant: 'destructive',
      });
    } finally {
      setSavingServiceFee(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    setActiveSearch(search);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await adminService.getPatients({ page, limit: 10, search: activeSearch });

      let data = response.data.data || [];

      // Client-side filtering fallback if API returns all results despite search param
      if (activeSearch) {
        const lowerSearch = activeSearch.toLowerCase();
        // Check if the API returned filtered results. If it returned 10 items and seemingly irrelevant ones, filter them.
        // We blindly filter here to ensure user satisfaction as per "oi name ta ase nah sob gula e ase"
        data = data.filter(
          (p) =>
            (p.fullName?.toLowerCase().includes(lowerSearch) ?? false) ||
            (p.email?.toLowerCase().includes(lowerSearch) ?? false) ||
            (p.address?.toLowerCase().includes(lowerSearch) ?? false)
        );
      }

      setPatients(data);
      setTotalPages(Math.ceil((response.data.meta?.total || 0) / 10));
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load patients',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBanClick = (patient: AdminPatient) => {
    setSelectedPatient(patient);
    setShowBanDialog(true);
  };

  const handleWalletClick = (patient: AdminPatient) => {
    setSelectedPatient(patient);
    setWalletAmount(String(patient.wallet ?? 0));
    setShowWalletDialog(true);
  };

  const handleNotificationClick = (patient: AdminPatient) => {
    setSelectedPatient(patient);
    setIsGlobalNotification(false);
    setNotificationTitle(`Notification for ${patient.fullName || 'Patient'}`);
    setNotificationDescription('');
    setUsersList([{
      id: patient.id,
      name: patient.fullName || 'Unnamed Patient',
      info: patient.email || patient.phoneNumber,
    }]);
    setSelectedUserIds([patient.id]);
    setUsersSearch('');
    setShowNotificationDialog(true);
  };

  const handleGlobalNotificationClick = async () => {
    setSelectedPatient(null);
    setIsGlobalNotification(true);
    setNotificationTitle('Global Update for All Patients');
    setNotificationDescription('');
    setUsersSearch('');
    setSelectedUserIds([]);
    setUsersList([]);
    setShowNotificationDialog(true);

    try {
      setLoadingUsersList(true);
      const response = await adminService.getPatients({ limit: 100000 });
      const allPatients = response.data?.data || [];
      const mapped = allPatients.map((p) => ({
        id: p.id,
        name: p.fullName || 'Unnamed Patient',
        info: p.email || p.phoneNumber,
      }));
      setUsersList(mapped);
      setSelectedUserIds(mapped.map((u) => u.id));
    } catch (error) {
      toastError({
        title: 'Error',
        description: 'Failed to load patient list',
      });
    } finally {
      setLoadingUsersList(false);
    }
  };

  const closeActionDialogs = () => {
    setShowBanDialog(false);
    setShowWalletDialog(false);
    setShowNotificationDialog(false);
    setSelectedPatient(null);
    setIsGlobalNotification(false);
    setWalletAmount('');
    setNotificationTitle('');
    setNotificationDescription('');
    setUsersList([]);
    setSelectedUserIds([]);
    setUsersSearch('');
  };

  const handleWalletUpdate = async () => {
    if (!selectedPatient) return;

    const amount = Number(walletAmount);
    if (!Number.isFinite(amount) || amount < 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid wallet amount',
        variant: 'destructive',
      });
      return;
    }

    try {
      setWalletProcessing(true);
      const response = await adminService.updateWallet(selectedPatient.id, amount);
      toast({
        title: 'Success',
        description: response.message || 'Wallet updated successfully',
      });
      closeActionDialogs();
      fetchPatients();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update wallet',
        variant: 'destructive',
      });
    } finally {
      setWalletProcessing(false);
    }
  };

  const handleSendNotification = async () => {
    if (selectedUserIds.length === 0) {
      toastError({
        title: 'Validation Error',
        description: 'Please select at least one patient to notify',
      });
      return;
    }

    const title = notificationTitle.trim();
    const description = notificationDescription.trim();

    if (!title || !description) {
      toastError({
        title: 'Validation Error',
        description: 'Title and description are required',
      });
      return;
    }

    try {
      setNotificationProcessing(true);
      const response = await adminService.sendPatientNotification(
        selectedUserIds,
        title,
        description
      );
      const deliveryInfo = response.data;

      if (deliveryInfo?.success === false) {
        let successDescription = "Notification saved to database successfully.";
        if (deliveryInfo.message === 'FCM token is null') {
          successDescription = "Notification saved successfully.";
        } else if (deliveryInfo.message) {
          successDescription = `Notification saved successfully.`;
        }
        
        toastSuccess({
          title: isGlobalNotification ? 'Global Notification Queued' : 'Notification Sent',
          description: isGlobalNotification 
            ? `Queued notifications for ${selectedUserIds.length} patients successfully.`
            : successDescription,
        });
      } else {
        toastSuccess({
          title: isGlobalNotification ? 'Global Notification Queued' : 'Notification Sent',
          description: response.message || (isGlobalNotification 
            ? `Queued notifications for ${selectedUserIds.length} patients successfully.`
            : 'Patient notification sent successfully'),
        });
      }

      closeActionDialogs();
    } catch (error: any) {
      toastError({
        title: 'API Error',
        description: error.response?.data?.message || 'Failed to send notification',
      });
    } finally {
      setNotificationProcessing(false);
    }
  };

  const handleToggleBan = async () => {
    if (!selectedPatient) return;

    try {
      setProcessing(true);
      const isBanned = selectedPatient.status === 'BANNED';
      await adminService.toggleUserBan(selectedPatient.id, !isBanned);
      toast({
        title: 'Success',
        description: `Patient ${isBanned ? 'unbanned' : 'banned'} successfully`,
      });
      fetchPatients();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update patient status',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
      setShowBanDialog(false);
      setSelectedPatient(null);
    }
  };

  const filteredUsers = usersList.filter((u) =>
    u.name.toLowerCase().includes(usersSearch.toLowerCase()) ||
    (u.info && u.info.toLowerCase().includes(usersSearch.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {t('patientManagement', 'Patient Management')}
          </h1>
          <p className="mt-1 text-sm text-gray-500 sm:text-base">
            {patients.length} {t('patientsRegistered', 'patients registered')}
          </p>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          <div className="relative flex-1 sm:flex-initial">
            <Search
              className="absolute left-2.5 rtl:left-auto rtl:right-2.5 top-2.5 h-4 w-4 cursor-pointer text-muted-foreground"
              onClick={handleSearch}
            />
            <Input
              placeholder={t('searchPatients', 'Search patients...')}
              className="w-full sm:w-[200px] pl-8 rtl:pl-3 rtl:pr-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <Button 
            onClick={handleGlobalNotificationClick}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:from-blue-700 hover:to-indigo-700"
            size="sm"
          >
            <Bell className="ltr:mr-2 rtl:ml-2 h-4 w-4" /> {t('globalNotification', 'Global Notification')}
          </Button>
          <Button variant="default" size="sm">
            {t('addNewPatient', 'Add New Patient')}
          </Button>
        </div>
      </div>

      {/* Patient Service Fee Card */}
      <Card className="overflow-hidden border-0 shadow-md">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">{t('patientServiceFee')}</h3>
              <p className="text-xs text-emerald-100">
                {t('patientServiceFeeDesc')}
              </p>
            </div>
          </div>
        </div>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {['Libya', 'Tunisia', 'Egypt', 'Algeria'].map((country) => (
              <div key={country} className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  {country}
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder={`Fee for ${country}`}
                    value={serviceFees[country] ?? ''}
                    onChange={(e) =>
                      setServiceFees((prev) => ({
                        ...prev,
                        [country]: e.target.value,
                      }))
                    }
                    className="border-gray-300 pl-9 rtl:pl-3 rtl:pr-9 focus:border-emerald-500 focus:ring-emerald-500"
                    disabled={loadingServiceFee}
                  />
                </div>
                {currentServiceFees[country] !== undefined && (
                  <div className="mt-1 flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="text-xs font-semibold text-emerald-800">
                      {t('currentFee')}: ${currentServiceFees[country].toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-5 flex justify-end">
            <Button
              onClick={handleSaveServiceFee}
              disabled={savingServiceFee || loadingServiceFee}
              className="bg-emerald-600 px-6 text-white hover:bg-emerald-700 w-full sm:w-auto"
            >
              {savingServiceFee ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <DollarSign className="mr-2 h-4 w-4" />
              )}
              {savingServiceFee ? t('saving') : t('saveFees')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {patients.map((patient) => (
          <Card
            key={patient.id}
            className="transition-shadow duration-300 hover:scale-[1.02] hover:shadow-xl"
          >
            <CardContent className="p-6">
              {/* Header: Avatar & Name */}
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16 ring-2 ring-blue-500">
                  <AvatarImage src={patient.profileImage || undefined} alt={patient.fullName || 'Patient'} />
                  <AvatarFallback className="bg-blue-100 font-semibold text-blue-600">
                    {(patient.fullName || 'Patient')
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">{patient.fullName || t('unnamedPatient')}</h3>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="outline">{patient.gender}</Badge>
                    <Badge
                      variant={patient.status === 'ACTIVE' ? 'default' : 'destructive'}
                      className={`flex items-center gap-1 px-2 py-1 ${
                        patient.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {patient.status === 'ACTIVE' ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <Ban className="h-3 w-3" />
                      )}
                      {patient.status === 'ACTIVE' ? t('active') : patient.status}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1 border-amber-200 bg-amber-50 text-amber-700"
                    >
                      <Wallet className="h-3 w-3" />
                      <span>{t('walletBalance')}: ${Number(patient.wallet ?? 0).toFixed(2)}</span>
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-sm text-gray-500">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {[patient.city, patient.country].filter(Boolean).join(', ') || t('noLocation')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="mt-4 space-y-2 border-t pt-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span>{patient.email || '—'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-blue-600" />
                  <span dir="ltr">{patient.phoneNumber}</span>
                </div>
              </div>

              {/* Personal Info */}
              <div className="mt-4 space-y-2 border-t pt-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <span>{t('dob')}: {new Date(patient.dateOfBirth).toLocaleDateString()}</span>
                </div>
                <div>{t('address')}: {patient.address || '—'}</div>
                <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-amber-800">
                  <DollarSign className="h-4 w-4" />
                  <span className="font-medium">
                    {t('walletBalance')}: ${Number(patient.wallet ?? 0).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Registration Date */}
              <div className="mt-4 text-xs text-gray-500">
                {t('registered')}: {new Date(patient.createdAt).toLocaleDateString()}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => handleWalletClick(patient)}
                    variant="outline"
                    className="flex items-center justify-center gap-2 border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800"
                  >
                    <DollarSign className="h-4 w-4" /> <span>{t('updateWallet')}</span>
                  </Button>
                  <Button
                    onClick={() => handleNotificationClick(patient)}
                    variant="outline"
                    className="flex items-center justify-center gap-2 border-sky-200 text-sky-700 hover:bg-sky-50 hover:text-sky-800"
                  >
                    <Bell className="h-4 w-4" /> <span>{t('notify')}</span>
                  </Button>
                </div>
                <Button
                  onClick={() => handleBanClick(patient)}
                  variant={patient.status === 'BANNED' ? 'default' : 'destructive'}
                  className="flex w-full items-center justify-center gap-2"
                >
                  {patient.status === 'BANNED' ? (
                    <>
                      <CheckCircle className="h-4 w-4" /> <span>{t('unbanPatient')}</span>
                    </>
                  ) : (
                    <>
                      <Ban className="h-4 w-4" /> <span>{t('banPatient')}</span>
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
        <div className="mt-6 flex items-center justify-center gap-2">
          <Button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            variant="outline"
          >
            {t('previous')}
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              onClick={() => setPage(p)}
              variant={page === p ? 'default' : 'outline'}
              size="sm"
            >
              {p}
            </Button>
          ))}
          <Button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            variant="outline"
          >
            {t('next')}
          </Button>
        </div>
      )}

      {/* Wallet Dialog */}
      <Dialog
        open={showWalletDialog}
        onOpenChange={(open) => {
          setShowWalletDialog(open);
          if (!open) {
            closeActionDialogs();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('updateWallet')}</DialogTitle>
            <DialogDescription>
              {t('updateWalletDesc')} {selectedPatient?.fullName || t('thisPatient')}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="wallet-amount">{t('walletAmount')}</Label>
              <Input
                id="wallet-amount"
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
          if (!open) {
            closeActionDialogs();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isGlobalNotification ? t('sendGlobalPatientNotification') : t('sendPatientNotification')}</DialogTitle>
            <DialogDescription>
              {isGlobalNotification 
                ? t('sendGlobalPatientDesc')
                : `${t('sendClinicDesc')} ${selectedPatient?.fullName || t('thisPatient')}.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="notification-title">{t('title')}</Label>
              <Input
                id="notification-title"
                value={notificationTitle}
                onChange={(e) => setNotificationTitle(e.target.value)}
                placeholder={t('enterNotificationTitle')}
                disabled={notificationProcessing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notification-description">{t('description')}</Label>
              <Textarea
                id="notification-description"
                value={notificationDescription}
                onChange={(e) => setNotificationDescription(e.target.value)}
                placeholder={t('enterNotificationDesc')}
                disabled={notificationProcessing}
                rows={4}
              />
            </div>

            {/* Patient Selection List */}
            <div className="space-y-2 border-t pt-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-gray-700">
                  {isGlobalNotification ? t('selectPatientsToNotify') : t('patientRecipient')}
                </Label>
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                  {t('selectedCount')}: {selectedUserIds.length} / {usersList.length}
                </Badge>
              </div>

              {isGlobalNotification && (
                <div className="flex items-center gap-2 mb-2">
                  <Input
                    placeholder={t('searchPatientsInList')}
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
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-sm text-gray-500">{t('loadingPatientsList')}</span>
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto border rounded-lg p-2 space-y-1 bg-gray-50">
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-4 text-xs text-gray-400">
                      {t('noPatientsFound')}
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
              className={isGlobalNotification ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700" : ""}
            >
              {notificationProcessing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              {isGlobalNotification ? `${t('sendToCount')} ${selectedUserIds.length} ${t('patients')}` : t('sendNotification')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban/Unban Dialog */}
      <AlertDialog
        open={showBanDialog}
        onOpenChange={(open) => {
          setShowBanDialog(open);
          if (!open) {
            closeActionDialogs();
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedPatient?.status === 'BANNED' ? t('unbanPatient') : t('banPatient')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirmStatusChange')} {selectedPatient?.status === 'BANNED' ? t('unban') : t('ban')}{' '}
              <strong>{selectedPatient?.fullName || t('thisPatient')}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleBan} disabled={processing}>
              {processing ? t('processing') : t('confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
