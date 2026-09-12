import { apiClient } from '@/lib/api-client';

// ============ BANNER TYPES ============
export interface Banner {
  id: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

export interface BannerResponse {
  success: boolean;
  message: string;
  data: Banner[];
}

export interface CreateBannerResponse {
  success: boolean;
  message: string;
  data: {
    count: number;
  };
}

// ============ BANNER SERVICE ============
export const bannerService = {
  /**
   * Get all banners
   */
  async getBanners(): Promise<BannerResponse> {
    const { data } = await apiClient.get<BannerResponse>('/banner');
    return data;
  },

  /**
   * Create new banner(s)
   */
  async createBanner(formData: FormData): Promise<CreateBannerResponse> {
    const { data } = await apiClient.post<CreateBannerResponse>('/banner/create-banner', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  /**
   * Update banner
   */
  async updateBanner(id: string, formData: FormData): Promise<BannerResponse> {
    const { data } = await apiClient.patch<BannerResponse>(`/banner/update/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  /**
   * Delete banner
   */
  async deleteBanner(id: string): Promise<{ success: boolean; message: string }> {
    const { data } = await apiClient.delete<{ success: boolean; message: string }>(
      `/banner/delete/${id}`
    );
    return data;
  },
};
