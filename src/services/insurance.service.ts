import { apiClient } from '@/lib/api-client';

// ============ INSURANCE TYPES ============
export interface Insurance {
  id: string;
  name: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

export interface InsuranceResponse {
  success: boolean;
  message: string;
  meta: {
    page: number;
    limit: number;
    total: number;
  };
  data: Insurance[];
}

export interface SingleInsuranceResponse {
  success: boolean;
  message: string;
  data: Insurance;
}

export interface CreateInsuranceResponse {
  success: boolean;
  message: string;
  data: Insurance;
}

// ============ INSURANCE SERVICE ============
export const insuranceService = {
  /**
   * Get all insurances
   */
  async getInsurances(page: number = 1, limit: number = 10): Promise<InsuranceResponse> {
    const { data } = await apiClient.get<InsuranceResponse>(
      `/insurance?page=${page}&limit=${limit}`
    );
    return data;
  },

  /**
   * Get single insurance
   */
  async getInsurance(id: string): Promise<SingleInsuranceResponse> {
    const { data } = await apiClient.get<SingleInsuranceResponse>(`/insurance/${id}`);
    return data;
  },

  /**
   * Create new insurance
   */
  async createInsurance(formData: FormData): Promise<CreateInsuranceResponse> {
    const { data } = await apiClient.post<CreateInsuranceResponse>('/insurance', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  /**
   * Update insurance
   */
  async updateInsurance(id: string, formData: FormData): Promise<SingleInsuranceResponse> {
    const { data } = await apiClient.patch<SingleInsuranceResponse>(`/insurance/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  /**
   * Delete insurance
   */
  async deleteInsurance(id: string): Promise<{ success: boolean; message: string }> {
    const { data } = await apiClient.delete<{ success: boolean; message: string }>(
      `/insurance/${id}`
    );
    return data;
  },
};
