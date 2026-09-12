import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  phoneNumber: string | null;
  role: string | null;
  profileCompleted: boolean;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  setAuth: (data: {
    accessToken: string;
    refreshToken: string;
    role: string;
    profileCompleted: boolean;
  }) => void;
  setPhoneNumber: (phoneNumber: string) => void;
  clearAuth: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      phoneNumber: null,
      role: null,
      profileCompleted: false,
      isAuthenticated: false,
      _hasHydrated: false,

      setAuth: (data) =>
        set({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          role: data.role,
          profileCompleted: data.profileCompleted,
          isAuthenticated: true,
        }),

      setPhoneNumber: (phoneNumber) => set({ phoneNumber }),

      clearAuth: () =>
        set({
          accessToken: null,
          refreshToken: null,
          phoneNumber: null,
          role: null,
          profileCompleted: false,
          isAuthenticated: false,
        }),

      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          phoneNumber: null,
          role: null,
          profileCompleted: false,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hasHydrated = true;
        }
      },
    }
  )
);
