import { apiClient } from '@/lib/api-client';

// ============ ADMIN TYPES ============
export interface AdminStats {
  patientCount: number;
  doctorCount: number;
  clinicCount: number;
}

export interface AdminStatsResponse {
  success: boolean;
  message: string;
  data: AdminStats;
}

export interface Clinic {
  id: string;
  country: string | null;
  city: string | null;
  address: string | null;
  email: string | null;
  phoneNumber: string;
  managerName: string | null;
  managerPhone: string | null;
  logo: string | null;
  clinicName: string | null;
  about: string | null;
  contactPhone: string | null;
  adminVerified: boolean | undefined;
  serviceFree?: number;
  wallet?: number;
  trial?: boolean;
}

export interface AdminDoctor {
  id: string;
  fullName: string;
  gender: 'MALE' | 'FEMALE';
  dateOfBirth: string;
  country: string;
  city: string;
  address: string;
  profileImage: string;
  email: string;
  phoneNumber: string;
  about: string | null;
  speciality: string;
  experience: string;
  licenseNumber: string;
  consultFee: number;
  clinicId: string;
  joinClinicDate: string | null;
  clinicName: string;
  clinicLogo?: string | null;
  biography?: string | null;
  createdAt?: string;
}

export interface AdminPatient {
  id: string;
  fullName: string;
  gender: 'MALE' | 'FEMALE';
  dateOfBirth: string;
  country: string;
  city: string;
  address: string | null;
  profileImage: string | null;
  email: string | null;
  phoneNumber: string;
  status: 'ACTIVE' | 'BANNED';
  createdAt: string;
  wallet: number;
}

export interface AdminActionResponse<T = Record<string, unknown>> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: {
    meta: {
      page: number;
      limit: number;
      total: number;
    };
    data: T[];
  };
}

export const adminService = {
  // Get admin statistics
  async getStats() {
    const response = await apiClient.get<AdminStatsResponse>('/admin/stats');
    return response.data;
  },

  // Get all clinics with pagination
  async getClinics(params?: { page?: number; limit?: number; search?: string; searchTerm?: string }) {
    const searchTerm = params?.searchTerm || params?.search;
    const response = await apiClient.get<PaginatedResponse<Clinic>>('/admin/get-clinic', {
      params: { page: 1, limit: 10, ...params, ...(searchTerm && { searchTerm, search: searchTerm }) },
    });
    return response.data;
  },

  // Verify or unverify a clinic
  async verifyClinic(clinicId: string, verified: boolean) {
    const response = await apiClient.patch(`/admin/clinic-verified/${clinicId}`, {
      adminVerified: verified,
    });
    return response.data;
  },

  // Get all doctors with pagination
  async getDoctors(params?: { page?: number; limit?: number; search?: string; searchTerm?: string }) {
    const searchTerm = params?.searchTerm || params?.search;
    const response = await apiClient.get<PaginatedResponse<AdminDoctor>>('/admin/get-doctor', {
      params: { page: 1, limit: 10, ...params, ...(searchTerm && { searchTerm, search: searchTerm }) },
    });
    return response.data;
  },

  // Get all patients with pagination
  async getPatients(params?: { page?: number; limit?: number; search?: string; searchTerm?: string }) {
    const searchTerm = params?.searchTerm || params?.search;
    const response = await apiClient.get<PaginatedResponse<AdminPatient>>('/admin/get-patient', {
      params: { page: 1, limit: 10, ...params, ...(searchTerm && { searchTerm, search: searchTerm }) },
    });
    return response.data;
  },

  // Ban or unban a patient
  async toggleUserBan(userId: string, banned: boolean) {
    const response = await apiClient.patch(`/admin/banned-user/${userId}`, {
      banned,
    });
    return response.data;
  },

  // Update a patient's wallet balance
  async updateWallet(userId: string, amount: number) {
    const response = await apiClient.patch<AdminActionResponse<{ message: string }>>(
      '/admin/update-wallet',
      {
        userId,
        amount,
      }
    );
    return response.data;
  },

  // Send a notification to a patient
  async sendPatientNotification(userId: string | string[], title: string, description: string) {
    const response = await apiClient.post<
      AdminActionResponse<{ success: boolean; message: string }>
    >('/admin/patient-notification', {
      userId: Array.isArray(userId) ? userId : [userId],
      title,
      description,
    });
    return response.data;
  },

  // Send a notification to a clinic
  async sendClinicNotification(userId: string | string[], title: string, description: string) {
    const response = await apiClient.post<
      AdminActionResponse<{ success: boolean; message: string }>
    >('/admin/clinic-notification', {
      userId: Array.isArray(userId) ? userId : [userId],
      title,
      description,
    });
    return response.data;
  },

  // Set service fee for a clinic
  async setServiceFee(clinicId: string, serviceFree: number) {
    const response = await apiClient.patch(`/admin/set-service-free/${clinicId}`, {
      serviceFree,
    });
    return response.data;
  },
};
