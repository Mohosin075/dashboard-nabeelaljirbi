'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/language-context';
import { adminService, AdminStaff, AdminTier } from '@/services/admin.service';
import {
  Shield,
  UserPlus,
  Users,
  Search,
  Crown,
  Briefcase,
  DollarSign,
  Headphones,
  Eye,
  RefreshCw,
} from 'lucide-react';

const TIER_CONFIG: Record<
  AdminTier,
  { label: string; color: string; icon: any; description: string }
> = {
  SUPER_ADMIN: {
    label: 'Super Admin',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: Crown,
    description: 'Full platform access, staff management, and system configuration.',
  },
  OPERATIONS: {
    label: 'Operations',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Briefcase,
    description: 'Manages Patients, Doctors, Clinics, Bookings, Verifications, and Banners.',
  },
  FINANCE: {
    label: 'Finance',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: DollarSign,
    description: 'Oversees Financials, Settlements, Wallets, Fees, and Prepaid Cards.',
  },
  SUPPORT: {
    label: 'Support',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: Headphones,
    description: 'Handles Complaints, User inquiries, and Booking status assistance.',
  },
  READ_ONLY: {
    label: 'Read Only',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: Eye,
    description: 'View-only inspection across modules. Mutating actions are locked.',
  },
};

import { useAuthStore } from '@/stores/auth-store';

export default function AdminStaffPage() {
  const { t } = useLanguage();
  const currentAdminTier = useAuthStore((state) => state.adminTier) || 'SUPER_ADMIN';
  const isSuperAdmin = currentAdminTier === 'SUPER_ADMIN';

  const [staffList, setStaffList] = useState<AdminStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTierFilter, setSelectedTierFilter] = useState<string>('ALL');

  // Create Admin Dialog
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    password: '',
    adminTier: 'OPERATIONS' as AdminTier,
  });

  // Edit Tier Dialog
  const [showEditTierDialog, setShowEditTierDialog] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<AdminStaff | null>(null);
  const [newTier, setNewTier] = useState<AdminTier>('OPERATIONS');
  const [editTierLoading, setEditTierLoading] = useState(false);

  // Status Dialog
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, [selectedTierFilter]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedTierFilter !== 'ALL') params.adminTier = selectedTierFilter;
      if (search.trim()) params.searchTerm = search.trim();

      const res = await adminService.getAdminStaff(params);
      setStaffList(res.data.data || []);
    } catch (err: any) {
      toast({
        title: t('error', 'Error'),
        description: err.response?.data?.message || 'Failed to load admin staff list',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.phoneNumber || !formData.password) {
      toast({
        title: t('error', 'Validation Error'),
        description: 'Phone number and password are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setCreateLoading(true);
      await adminService.createAdminStaff(formData);
      toast({
        title: t('success', 'Success'),
        description: 'Admin staff account created successfully',
      });
      setShowCreateDialog(false);
      setFormData({
        fullName: '',
        phoneNumber: '',
        email: '',
        password: '',
        adminTier: 'OPERATIONS',
      });
      fetchStaff();
    } catch (err: any) {
      toast({
        title: t('error', 'Error'),
        description: err.response?.data?.message || 'Failed to create admin staff',
        variant: 'destructive',
      });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUpdateTier = async () => {
    if (!selectedStaff) return;
    try {
      setEditTierLoading(true);
      await adminService.updateAdminStaffTier(selectedStaff.id, newTier);
      toast({
        title: t('success', 'Success'),
        description: `Tier updated to ${TIER_CONFIG[newTier]?.label || newTier}`,
      });
      setShowEditTierDialog(false);
      setSelectedStaff(null);
      fetchStaff();
    } catch (err: any) {
      toast({
        title: t('error', 'Error'),
        description: err.response?.data?.message || 'Failed to update admin tier',
        variant: 'destructive',
      });
    } finally {
      setEditTierLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!selectedStaff) return;
    const targetStatus = selectedStaff.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      setStatusLoading(true);
      await adminService.toggleAdminStaffStatus(selectedStaff.id, targetStatus);
      toast({
        title: t('success', 'Success'),
        description: `Admin account has been ${targetStatus === 'ACTIVE' ? 'activated' : 'suspended'}`,
      });
      setShowStatusDialog(false);
      setSelectedStaff(null);
      fetchStaff();
    } catch (err: any) {
      toast({
        title: t('error', 'Error'),
        description: err.response?.data?.message || 'Failed to change admin status',
        variant: 'destructive',
      });
    } finally {
      setStatusLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              {t('adminStaffTitle', 'Admin Access & Tiers Control')}
            </h1>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {t(
              'adminStaffSub',
              'Manage 5 admin tiers (Super Admin, Operations, Finance, Support, Read Only) with scoped permissions and audit logging.'
            )}
          </p>
        </div>

        {isSuperAdmin ? (
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-sm"
          >
            <UserPlus className="h-4 w-4" />
            {t('addAdmin', 'Add New Admin')}
          </Button>
        ) : (
          <Badge variant="outline" className="text-gray-500 py-1.5 px-3">
            {t('superAdminOnly', 'Super Admin Scope Required')}
          </Badge>
        )}
      </div>

      {/* Tier Overview Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {(Object.keys(TIER_CONFIG) as AdminTier[]).map((tierKey) => {
          const cfg = TIER_CONFIG[tierKey];
          const Icon = cfg.icon;
          const count = staffList.filter((s) => (s.adminTier || 'SUPER_ADMIN') === tierKey).length;
          return (
            <Card
              key={tierKey}
              onClick={() => setSelectedTierFilter(selectedTierFilter === tierKey ? 'ALL' : tierKey)}
              className={`cursor-pointer transition-all border ${
                selectedTierFilter === tierKey ? 'ring-2 ring-blue-500 shadow-md' : 'hover:border-gray-300'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.color}`}>
                    <Icon className="h-3.5 w-3.5" />
                    {cfg.label}
                  </span>
                  <span className="text-lg font-bold text-gray-800">{count}</span>
                </div>
                <p className="mt-2 text-xs text-gray-500 line-clamp-2">{cfg.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters & Search */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder={t('searchAdminPlaceholder', 'Search by name, phone or email...')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchStaff()}
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select value={selectedTierFilter} onValueChange={(val) => setSelectedTierFilter(val)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('filterTier', 'All Tiers')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t('allTiers', 'All Tiers')}</SelectItem>
                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                <SelectItem value="OPERATIONS">Operations</SelectItem>
                <SelectItem value="FINANCE">Finance</SelectItem>
                <SelectItem value="SUPPORT">Support</SelectItem>
                <SelectItem value="READ_ONLY">Read Only</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon" onClick={fetchStaff} title="Refresh">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Staff Table */}
      <Card>
        <CardHeader className="px-6 py-4 border-b">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-500" />
            {t('staffMembers', 'Administrative Personnel')} ({staffList.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex min-h-[250px] items-center justify-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            </div>
          ) : staffList.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <Users className="mx-auto h-12 w-12 text-gray-300 mb-2" />
              <p className="font-medium">{t('noStaffFound', 'No admin staff members found')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 border-b">
                  <tr>
                    <th className="px-6 py-3">{t('adminUser', 'Admin User')}</th>
                    <th className="px-6 py-3">{t('contactInfo', 'Contact')}</th>
                    <th className="px-6 py-3">{t('tier', 'Assigned Tier')}</th>
                    <th className="px-6 py-3">{t('status', 'Status')}</th>
                    <th className="px-6 py-3 text-right">{t('actions', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {staffList.map((staff) => {
                    const tierKey = (staff.adminTier || 'SUPER_ADMIN') as AdminTier;
                    const tierCfg = TIER_CONFIG[tierKey] || TIER_CONFIG.SUPER_ADMIN;
                    const TierIcon = tierCfg.icon;
                    const isActive = staff.status === 'ACTIVE';

                    return (
                      <tr key={staff.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center shrink-0">
                              {staff.fullName ? staff.fullName.charAt(0).toUpperCase() : 'A'}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{staff.fullName || 'Admin User'}</div>
                              <div className="text-xs text-gray-400">ID: {staff.id.slice(-6)}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-gray-900">{staff.phoneNumber}</div>
                          {staff.email && <div className="text-xs text-gray-500">{staff.email}</div>}
                        </td>

                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border ${tierCfg.color}`}>
                            <TierIcon className="h-3 w-3" />
                            {tierCfg.label}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          {isActive ? (
                            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200">
                              Active
                            </Badge>
                          ) : (
                            <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100 border-rose-200">
                              Suspended
                            </Badge>
                          )}
                        </td>

                        <td className="px-6 py-4 text-right space-x-2">
                          {isSuperAdmin ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedStaff(staff);
                                  setNewTier((staff.adminTier || 'OPERATIONS') as AdminTier);
                                  setShowEditTierDialog(true);
                                }}
                              >
                                {t('changeTier', 'Change Tier')}
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedStaff(staff);
                                  setShowStatusDialog(true);
                                }}
                                className={isActive ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'}
                              >
                                {isActive ? t('suspend', 'Suspend') : t('activate', 'Activate')}
                              </Button>
                            </>
                          ) : (
                            <span className="text-xs text-gray-400 italic">
                              {t('readOnly', 'View Only')}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Admin Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md w-full max-w-[95vw] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-blue-600" />
              {t('createAdminAccount', 'Create New Administrator')}
            </DialogTitle>
            <DialogDescription>
              {t('createAdminDesc', 'Assign appropriate tier based on departmental responsibilities.')}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateAdmin} className="space-y-4 py-2 w-full max-w-full">
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-sm font-medium">{t('fullName', 'Full Name')}</Label>
              <Input
                id="fullName"
                placeholder="e.g. Tariq Mansour"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full mt-1"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phoneNumber" className="text-sm font-medium">{t('phoneNumber', 'Phone Number (Login)')}</Label>
              <Input
                id="phoneNumber"
                placeholder="+218..."
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full mt-1"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">{t('email', 'Email Address (Optional)')}</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@salama.ly"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full mt-1"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">{t('password', 'Initial Password')}</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full mt-1"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="adminTier" className="text-sm font-medium">{t('adminTier', 'Select Admin Tier')}</Label>
              <Select
                value={formData.adminTier}
                onValueChange={(val) => setFormData({ ...formData, adminTier: val as AdminTier })}
              >
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue placeholder="Choose a tier" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(TIER_CONFIG) as AdminTier[]).map((tierKey) => (
                    <SelectItem key={tierKey} value={tierKey}>
                      {TIER_CONFIG[tierKey].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-1.5 text-xs text-gray-500">
                {TIER_CONFIG[formData.adminTier]?.description}
              </p>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                {t('cancel', 'Cancel')}
              </Button>
              <Button type="submit" disabled={createLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
                {createLoading ? t('creating', 'Creating...') : t('createAdmin', 'Create Admin')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Tier Dialog */}
      <Dialog open={showEditTierDialog} onOpenChange={setShowEditTierDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('modifyTier', 'Modify Administrator Tier')}</DialogTitle>
            <DialogDescription>
              {selectedStaff?.fullName} ({selectedStaff?.phoneNumber})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label>{t('newTier', 'Select New Tier')}</Label>
              <Select value={newTier} onValueChange={(val) => setNewTier(val as AdminTier)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(TIER_CONFIG) as AdminTier[]).map((tierKey) => (
                    <SelectItem key={tierKey} value={tierKey}>
                      {TIER_CONFIG[tierKey].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-2 text-xs text-gray-500">{TIER_CONFIG[newTier]?.description}</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditTierDialog(false)}>
              {t('cancel', 'Cancel')}
            </Button>
            <Button onClick={handleUpdateTier} disabled={editTierLoading} className="bg-blue-600 text-white">
              {editTierLoading ? t('saving', 'Saving...') : t('saveChanges', 'Save Changes')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend / Activate Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedStaff?.status === 'ACTIVE'
                ? t('suspendAdmin', 'Suspend Administrator Account')
                : t('activateAdmin', 'Activate Administrator Account')}
            </DialogTitle>
            <DialogDescription>
              {selectedStaff?.status === 'ACTIVE'
                ? t(
                    'suspendConfirm',
                    'This administrator will immediately lose access to the Salama Control Center until reactivated.'
                  )
                : t('activateConfirm', 'This administrator will regain access to the control center.')}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
              {t('cancel', 'Cancel')}
            </Button>
            <Button
              onClick={handleToggleStatus}
              disabled={statusLoading}
              variant={selectedStaff?.status === 'ACTIVE' ? 'destructive' : 'default'}
            >
              {statusLoading ? t('processing', 'Processing...') : t('confirm', 'Confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
