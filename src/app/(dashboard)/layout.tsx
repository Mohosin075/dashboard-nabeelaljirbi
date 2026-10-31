'use client';

import DashboardSidebar from '@/components/dashboard-sidebar';
import DashboardTopbar from '@/components/dashboard-topbar';
import { useAuthStore } from '@/stores/auth-store';
import { useLanguage } from '@/contexts/language-context';
import { checkRouteAccess } from '@/lib/route-permissions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ArrowLeft, ArrowRight, ShieldAlert } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.role);
  const adminTier = useAuthStore((state) => state.adminTier) || 'SUPER_ADMIN';
  const { dir, isRTL, t } = useLanguage();
  const [isHydrated, setIsHydrated] = useState(false);

  // Wait for hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router, isHydrated]);

  // General dashboard portal access (Admin, Clinic, Manager)
  const hasGeneralAccess = role === 'MANAGER' || role === 'CLINIC' || role === 'ADMIN' || role === 'DOCTOR';

  // Specific route permission check by role and admin tier
  const routeCheck = checkRouteAccess(pathname, role, adminTier);

  if (!isHydrated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Show access denied if user role is not permitted for the dashboard at all
  if (isHydrated && !hasGeneralAccess) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center p-6 max-w-md">
          <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-red-500" />
          <h2 className="mb-2 text-2xl font-bold text-gray-900">{t('accessDenied', 'Access Denied')}</h2>
          <p className="mb-4 text-gray-600">{t('noPermissionDashboard', 'Your account role does not have permission to access this dashboard portal.')}</p>
        </div>
      </div>
    );
  }

  // Show contextual access restricted card if user role or admin tier is not scoped for this specific page
  if (isHydrated && !routeCheck.hasAccess) {
    return (
      <div dir={dir} className={`flex h-screen bg-gray-50/70 overflow-hidden ${isRTL ? 'font-sans' : ''}`}>
        <DashboardSidebar />
        <div className="flex flex-1 flex-col overflow-hidden min-w-0">
          <DashboardTopbar />
          <main className="flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center">
            <div className="max-w-md w-full rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
                <ShieldAlert className="h-7 w-7" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {t('accessRestricted', 'Access Restricted')}
                </h3>
                {routeCheck.rule && (
                  <p className="text-sm font-semibold text-blue-600 mt-1">
                    {isRTL ? routeCheck.rule.nameAr : routeCheck.rule.name}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  {routeCheck.reason}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-3.5 border border-gray-100 text-xs text-start space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">{t('yourRole', 'Your Current Role')}:</span>
                  <Badge variant="outline" className="font-semibold">{role || '—'}</Badge>
                </div>
                {role === 'ADMIN' && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">{t('yourTier', 'Your Admin Tier')}:</span>
                    <Badge className="bg-purple-100 text-purple-800 border-purple-200 font-semibold">{adminTier}</Badge>
                  </div>
                )}
                {routeCheck.requiredTiers && (
                  <div className="flex items-center justify-between border-t pt-2">
                    <span className="text-gray-500">{t('permittedTiers', 'Permitted Tier(s)')}:</span>
                    <span className="font-semibold text-gray-800 text-[11px]">
                      {routeCheck.requiredTiers.join(', ')}
                    </span>
                  </div>
                )}
                {routeCheck.requiredRoles && !routeCheck.requiredTiers && (
                  <div className="flex items-center justify-between border-t pt-2">
                    <span className="text-gray-500">{t('permittedRoles', 'Permitted Role(s)')}:</span>
                    <span className="font-semibold text-gray-800 text-[11px]">
                      {routeCheck.requiredRoles.join(', ')}
                    </span>
                  </div>
                )}
              </div>

              <Button
                onClick={() => router.push(role === 'ADMIN' ? '/dashboard/admin' : '/dashboard')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs gap-2"
              >
                {isRTL ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
                {t('returnToDashboard', 'Return to Safe Dashboard')}
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div dir={dir} className={`flex h-screen bg-gray-50/70 overflow-hidden ${isRTL ? 'font-sans' : ''}`}>
      <DashboardSidebar />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <DashboardTopbar />
        <main className="flex-1 overflow-auto px-3 sm:px-6 md:px-8 py-4 sm:py-6">{children}</main>
      </div>
    </div>
  );
}
