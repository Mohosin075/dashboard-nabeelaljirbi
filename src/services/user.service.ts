import { apiClient } from '@/lib/api-client';
import type { User } from '@/lib/stores/auth.store';

export interface GetMeResponse {
  success: boolean;
  message: string;
  data: User;
}

export interface UpdateProfileRequest {
  name?: string;
  image?: File;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data: User;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  role?: string;
  isVerified?: boolean;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

/**
 * User Service
 * Handles user-related API calls
 */
export const userService = {
  /**
   * Get current user profile
   */
  getMe: async (): Promise<GetMeResponse> => {
    const response = await apiClient.get<GetMeResponse>('/users/me');
    return response.data;
  },

  /**
   * Update user profile (name and/or image)
   */
  updateProfile: async (data: UpdateProfileRequest): Promise<UpdateProfileResponse> => {
    const formData = new FormData();

    if (data.name) {
      formData.append('name', data.name);
    }

    if (data.image) {
      formData.append('image', data.image);
    }

    const response = await apiClient.put<UpdateProfileResponse>('/users/me', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Change user password
   */
  changePassword: async (data: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
    const response = await apiClient.put<ChangePasswordResponse>('/users/change-password', data);
    return response.data;
  },

  /**
 * get all users (admin)
 */
  getAllUsers: async (params?: UserListParams): Promise<{ success: boolean; message: string; data: User[]; meta: any }> => {
    const response = await apiClient.get<{ success: boolean; message: string; data: User[]; meta: any }>('/users', {
      params,
    });
    return response.data;
  },

  /**
* delete (admin) not exported
*/

  deleteUser: async (userId: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(`/users/${userId}`);
    return response.data;
  },

  /**
* update user status (admin) not exported
*/
  updateUserStatus: async (userId: string, status: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.patch<{ success: boolean; message: string }>(`/users/${userId}/status`, {
      status,
    });
    return response.data;
  },



};


