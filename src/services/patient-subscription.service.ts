import { apiClient } from '@/lib/api-client';

// ============ PATIENT SUBSCRIPTION TYPES ============
export interface PatientSubscription {
  id: string;
  amount: number;
  country: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatientSubscriptionResponse {
  success: boolean;
  message: string;
  data: PatientSubscription[];
}

export interface CreateUpdatePatientSubscriptionRequest {
  amount: number;
  country: string;
}

export interface CreateUpdatePatientSubscriptionResponse {
  success: boolean;
  message: string;
  data: PatientSubscription;
}

// ============ PATIENT SUBSCRIPTION SERVICE ============
export const patientSubscriptionService = {
  /**
   * Get all patient platform subscriptions
   */
  async getSubscriptions(): Promise<PatientSubscriptionResponse> {
    const { data } = await apiClient.get<PatientSubscriptionResponse>(
      '/patient-platform-subscription/'
    );
    return data;
  },

  /**
   * Create or update patient platform subscription
   */
  async createOrUpdateSubscription(
    payload: CreateUpdatePatientSubscriptionRequest
  ): Promise<CreateUpdatePatientSubscriptionResponse> {
    const { data } = await apiClient.post<CreateUpdatePatientSubscriptionResponse>(
      '/patient-platform-subscription/create-or-update',
      payload
    );
    return data;
  },

  /**
   * Delete patient platform subscription by country
   */
  async deleteSubscription(country: string): Promise<{ success: boolean; message: string }> {
    const { data } = await apiClient.delete<{ success: boolean; message: string }>(
      `/patient-platform-subscription/${country}`
    );
    return data;
  },
};
