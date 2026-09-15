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
    Bell,
    DollarSign,
    Loader2,
    Mail,
    MapPin,
    Phone,
    Search,
    Send,
    User,
    Wallet,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ClinicsPage() {
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
       if (activeSearch) {
        const lowerSearch = activeSearch.toLowerCase();
        data = data.filter(c =>
            (c.clinicName || c.phoneNumber || '').toLowerCase().includes(lowerSearch)
        );
      }

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
    setSelectedClinic(clinic);
    setShowVerifyDialog(true);
  };

  const handleVerify = async () => {
    if (!selectedClinic) return;

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

  const handleSetServiceFee = async (clinicId: string) => {
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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Clinic Management
          </h1>
          <p className="mt-1 text-gray-600">
            Total {clinics.length} clinics registered
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
              <Search
                  className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground cursor-pointer"
                  onClick={handleSearch}
              />
              <Input
              placeholder="Search clinics..."
              className="pl-8 w-[200px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              />
          </div>
          <Button 
            onClick={handleGlobalNotificationClick}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md hover:from-indigo-700 hover:to-violet-700"
            size="sm"
          >
            <Bell className="mr-2 h-4 w-4" /> Global Notification
          </Button>
        </div>
      </div>

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
            {clinic.clinicName || <span className="italic text-gray-400">Profile Incomplete</span>}
          </h3>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="h-3 w-3 text-indigo-500" />
            <span className="truncate">
              {[clinic.city, clinic.country].filter(Boolean).join(', ') || '—'}
            </span>
          </div>
        </div>
      </div>

      <span
        className={`rounded-full px-2 py-0.5 text-[10px] font-medium
          ${
            clinic.adminVerified
              ? 'bg-green-100 text-green-700'
              : 'bg-amber-100 text-amber-700'
          }
        `}
      >
        {clinic.adminVerified ? 'Verified' : 'Pending'}
      </span>
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
        {clinic.phoneNumber}
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
        {clinic.managerPhone || '—'}
      </div>
    </div>

    {/* WALLET BALANCE */}
    <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-amber-800">
      <DollarSign className="h-4 w-4" />
      <span className="text-sm font-medium">
        Wallet balance: ${Number(clinic.wallet ?? 0).toFixed(2)}
      </span>
    </div>

    {/* ACTION */}
    <div className="mt-4 space-y-2">
      {/* Service Fee Input */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <DollarSign className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input
            type="number"
            min={0}
            step="0.01"
            placeholder={clinic.serviceFree !== undefined ? String(clinic.serviceFree) : 'Service fee'}
            value={serviceFeeValues[clinic.id] ?? ''}
            onChange={(e) =>
              setServiceFeeValues((prev) => ({ ...prev, [clinic.id]: e.target.value }))
            }
            className="w-full rounded-lg border border-gray-200 bg-white py-1.5 pl-7 pr-2 text-xs text-gray-700 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
          />
        </div>
        <Button
          onClick={() => handleSetServiceFee(clinic.id)}
          size="sm"
          disabled={settingServiceFee === clinic.id}
          className="rounded-lg bg-emerald-600 px-3 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {settingServiceFee === clinic.id ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            'Set'
          )}
        </Button>
      </div>

      {/* Wallet + Notify buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={() => handleWalletClick(clinic)}
          variant="outline"
          size="sm"
          className="flex items-center justify-center gap-1.5 border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800"
        >
          <Wallet className="h-3.5 w-3.5" />
          Update Wallet
        </Button>
        <Button
          onClick={() => handleNotificationClick(clinic)}
          variant="outline"
          size="sm"
          className="flex items-center justify-center gap-1.5 border-sky-200 text-sky-700 hover:bg-sky-50 hover:text-sky-800"
        >
          <Bell className="h-3.5 w-3.5" />
          Notify
        </Button>
      </div>

      <Button
        onClick={() => handleVerifyClick(clinic)}
        size="sm"
        className={`w-full rounded-lg text-xs font-medium
          ${
            clinic.adminVerified
              ? 'border border-red-200 bg-white text-red-600 hover:bg-red-50'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }
        `}
        variant="ghost"
      >
        {clinic.adminVerified ? 'Unverify' : 'Verify'}
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
            Previous
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
            Next
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
              {selectedClinic?.adminVerified ? 'Unverify' : 'Verify'} Clinic
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to{' '}
              {selectedClinic?.adminVerified ? 'unverify' : 'verify'}{' '}
              <strong>{selectedClinic?.clinicName}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={verifying}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleVerify}
              disabled={verifying}
            >
              {verifying ? 'Processing...' : 'Confirm'}
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
            <DialogTitle>Update Wallet</DialogTitle>
            <DialogDescription>
              Update the wallet balance for {selectedClinic?.clinicName || 'this clinic'}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="clinic-wallet-amount">Wallet amount</Label>
              <Input
                id="clinic-wallet-amount"
                type="number"
                min={0}
                step="0.01"
                value={walletAmount}
                onChange={(e) => setWalletAmount(e.target.value)}
                placeholder="Enter wallet amount"
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
              Cancel
            </Button>
            <Button type="button" onClick={handleWalletUpdate} disabled={walletProcessing}>
              {walletProcessing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <DollarSign className="mr-2 h-4 w-4" />
              )}
              Update Wallet
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
            <DialogTitle>{isGlobalNotification ? 'Send Global Clinic Notification' : 'Send Clinic Notification'}</DialogTitle>
            <DialogDescription>
              {isGlobalNotification 
                ? 'Send a notification to all or selected registered clinics in the system.'
                : `Send a notification to ${selectedClinic?.clinicName || 'this clinic'}.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="clinic-notification-title">Title</Label>
              <Input
                id="clinic-notification-title"
                value={notificationTitle}
                onChange={(e) => setNotificationTitle(e.target.value)}
                placeholder="Enter notification title"
                disabled={notificationProcessing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clinic-notification-description">Description</Label>
              <Textarea
                id="clinic-notification-description"
                value={notificationDescription}
                onChange={(e) => setNotificationDescription(e.target.value)}
                placeholder="Enter notification description"
                disabled={notificationProcessing}
                rows={4}
              />
            </div>

            {/* Clinic Selection List */}
            <div className="space-y-2 border-t pt-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-gray-700">
                  {isGlobalNotification ? 'Select Clinics to Notify' : 'Clinic Recipient'}
                </Label>
                <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-50">
                  Selected: {selectedUserIds.length} / {usersList.length}
                </Badge>
              </div>

              {isGlobalNotification && (
                <div className="flex items-center gap-2 mb-2">
                  <Input
                    placeholder="Search clinics in this list..."
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
                    {selectedUserIds.length === usersList.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
              )}

              {loadingUsersList ? (
                <div className="flex h-32 items-center justify-center border rounded-lg bg-gray-50 animate-pulse">
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                  <span className="ml-2 text-sm text-gray-500">Loading clinics list...</span>
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto border rounded-lg p-2 space-y-1 bg-gray-50">
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-4 text-xs text-gray-400">
                      No clinics found
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
              Cancel
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
              {isGlobalNotification ? `Send to ${selectedUserIds.length} Clinics` : 'Send Notification'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
