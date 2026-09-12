import { apiClient } from '@/lib/api-client';

// ============ CLINIC SUBSCRIPTION TYPES ============
export interface ClinicSubscription {
  id: string;
  amount: number;
  country: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClinicSubscriptionResponse {
  success: boolean;
  message: string;
  data: ClinicSubscription[];
}

export interface CreateUpdateClinicSubscriptionRequest {
  amount: number;
  country: string;
}

export interface CreateUpdateClinicSubscriptionResponse {
  success: boolean;
  message: string;
  data: ClinicSubscription;
}

// ============ CLINIC SUBSCRIPTION SERVICE ============
export const clinicSubscriptionService = {
  /**
   * Get all clinic platform subscriptions
   */
  async getSubscriptions(): Promise<ClinicSubscriptionResponse> {
    const { data } = await apiClient.get<ClinicSubscriptionResponse>(
      '/clinic-platform-subscription/'
    );
    return data;
  },

  /**
   * Create or update clinic platform subscription
   */
  async createOrUpdateSubscription(
    payload: CreateUpdateClinicSubscriptionRequest
  ): Promise<CreateUpdateClinicSubscriptionResponse> {
    const { data } = await apiClient.post<CreateUpdateClinicSubscriptionResponse>(
      '/clinic-platform-subscription/create-or-update',
      payload
    );
    return data;
  },

  /**
   * Delete clinic platform subscription by country
   */
  async deleteSubscription(country: string): Promise<{ success: boolean; message: string }> {
    const { data } = await apiClient.delete<{ success: boolean; message: string }>(
      `/clinic-platform-subscription/${country}`
    );
    return data;
  },
};
