import { useAuthStore } from '@/lib/stores/auth.store';
import type { ChangePasswordRequest, UpdateProfileRequest, UserListParams } from '@/services/user.service';
import { userService } from '@/services/user.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { toastError, toastSuccess } from './use-toast';

/**
 * Hook to fetch and sync current user profile
 */
export function useUser(hasHydrated: boolean = true) {
  const { token, setUser, setLoading, logout } = useAuthStore();

  const query = useQuery({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      const response = await userService.getMe();
      return response.data;
    },
    enabled: !!token && hasHydrated, // Only fetch if token exists AND store has hydrated
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  // Sync user data to store
  useEffect(() => {
    if (query.data) {
      setUser(query.data);
      setLoading(false);
    }
  }, [query.data, setUser, setLoading]);

  // Handle errors
  useEffect(() => {
    if (query.error) {
      console.error('Failed to fetch user:', query.error);

      // If unauthorized, logout
      if ((query.error as any)?.response?.status === 401) {
        logout();
      }

      setLoading(false);
    }
  }, [query.error, logout, setLoading]);

  return query;
}

/**
 * Hook to update user profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => userService.updateProfile(data),

    onSuccess: (response) => {
      // Update user in store
      setUser(response.data);

      // Invalidate user query to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });

      toastSuccess({
        description: response.message || 'Profile updated successfully!',
      });
    },

    onError: (error: any) => {
      toastError({
        description: error?.message || error?.response?.data?.message || 'Failed to update profile. Please try again.',
      });
    },
  });
}

/**
 * Hook to change password
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => userService.changePassword(data),

    onSuccess: (response) => {
      toastSuccess({
        description: response.message || 'Password changed successfully!',
      });
    },

    onError: (error: any) => {
      toastError({
        description: error?.message || error?.response?.data?.message || 'Failed to change password. Please try again.',
      });
    },
  });
}

/**
 * Hook to get all users (admin)
 */
export function useAllUsers(params?: UserListParams) {
  const query = useQuery({
    queryKey: ['users', 'all', params],
    queryFn: async () => {
      const response = await userService.getAllUsers(params);
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  return query;
}

/**
* delete (admin)
*/
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),

    onSuccess: () => {
      // Invalidate users query to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['users', 'all'] });

      toastSuccess({
        description: 'User deleted successfully!',
      });
    },

    onError: (error: any) => {
      toastError({
        description: error?.message || error?.response?.data?.message || 'Failed to delete user. Please try again.',
      });
    },
  });
}

/**
* update user status (admin)
*/
export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      userService.updateUserStatus(id, status),

    onSuccess: () => {
      // Invalidate users query to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['users', 'all'] });

      toastSuccess({
        description: 'User status updated successfully!',
      });
    },

    onError: (error: any) => {
      toastError({
        description: error?.message || error?.response?.data?.message || 'Failed to update user status. Please try again.',
      });
    },
  });
}


/**
 * Hook to get current user from store (instant access)
 */
export function useCurrentUser() {
  return useAuthStore((state) => state.user);
}

/**
 * Hook to check if user is authenticated (instant access)
 */
export function useIsAuthenticated() {
  return useAuthStore((state) => state.isAuthenticated);
}
