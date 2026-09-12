import { apiClient } from '@/lib/api-client';

export interface PatientServiceFee {
  id: string;
  amount: number;
  country: 'LIBYA' | 'TUNISIA' | 'EGYPT' | 'ALGERIA';
  createdAt: string;
  updatedAt: string;
}

export interface PatientServiceFeeResponse {
  success: boolean;
  message: string;
  data: PatientServiceFee[];
}

export interface GetPatientServiceFeeResponse {
  success: boolean;
  message: string;
  data: PatientServiceFee[];
}

export const patientServiceFeeService = {
  // Get patient service fee
  async get() {
    const response = await apiClient.get<GetPatientServiceFeeResponse>('/patient-service-fee');
    return response.data;
  },

  // Create/update patient service fee (upsert)
  async upsert(payload: Record<string, number>) {
    const response = await apiClient.post<PatientServiceFeeResponse>('/patient-service-fee', payload);
    return response.data;
  },
};
