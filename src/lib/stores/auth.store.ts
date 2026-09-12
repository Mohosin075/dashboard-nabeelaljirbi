import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface User {
  id: string;
  U_ID: string;
  name: string;
  email: string;
  image?: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  _hasHydrated: boolean; // Track if store has hydrated from localStorage

  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (token: string, user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      _hasHydrated: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      setToken: (token) => {
        // Set cookie when token changes
        if (typeof window !== 'undefined') {
          if (token) {
            document.cookie = `auth_token=${token}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
          } else {
            document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          }
        }

        set({
          token,
          isAuthenticated: !!token,
        });
      },

      login: (token, user) => {
        // Set cookie for middleware
        if (typeof window !== 'undefined') {
          document.cookie = `auth_token=${token}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
        }

        set({
          token,
          user,
          isAuthenticated: true,
        });
      },

      logout: () => {
        // Clear cookie
        if (typeof window !== 'undefined') {
          document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }

        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      setLoading: (loading) => set({ isLoading: loading }),

      setHasHydrated: (hasHydrated) => set({ _hasHydrated: hasHydrated }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      // Sync cookie on hydration from localStorage
      onRehydrateStorage: () => (state, error) => {
        if (!error && state?.token && typeof window !== 'undefined') {
          document.cookie = `auth_token=${state.token}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
        }
        // Mark as hydrated
        useAuthStore.setState({ _hasHydrated: true });
      },
    }
  )
);
