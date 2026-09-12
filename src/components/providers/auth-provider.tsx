'use client';

import { useUser } from '@/hooks/use-user';
import { useAuthStore } from '@/lib/stores/auth.store';

/**
 * Auth Provider
 * Fetches and syncs user profile on app mount
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const hasHydrated = useAuthStore((state) => state._hasHydrated);

  // Only fetch user after Zustand has hydrated from localStorage
  // This prevents the logout() call from clearing data during initial load
  useUser(hasHydrated);

  return <>{children}</>;
}
