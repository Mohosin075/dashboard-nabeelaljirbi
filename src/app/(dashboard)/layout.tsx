'use client';

import DashboardSidebar from '@/components/dashboard-sidebar';
import DashboardTopbar from '@/components/dashboard-topbar';
import { useAuthStore } from '@/stores/auth-store';
import { useLanguage } from '@/contexts/language-context';
import { AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.role);
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

  // Check if user has MANAGER or ADMIN role
  const hasAccess = role === 'MANAGER' || role === 'ADMIN';

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

  // Show access denied if user is not MANAGER or ADMIN
  if (isHydrated && !hasAccess) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-red-500" />
          <h2 className="mb-2 text-2xl font-bold text-gray-900">{t('accessDenied')}</h2>
          <p className="mb-4 text-gray-600">{t('noPermissionDashboard')}</p>
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
