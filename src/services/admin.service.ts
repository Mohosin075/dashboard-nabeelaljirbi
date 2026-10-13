import { apiClient } from '@/lib/api-client';

// ============ ADMIN TYPES ============
export type AdminTier = 'SUPER_ADMIN' | 'OPERATIONS' | 'FINANCE' | 'SUPPORT' | 'READ_ONLY';

export interface AdminStats {
  patientCount: number;
  doctorCount: number;
  clinicCount: number;
  pendingVerifications?: number;
  pendingSettlements?: number;
  openComplaints?: number;
  totalBookings?: number;
  pendingBookings?: number;
  confirmedBookings?: number;
  completedBookings?: number;
}

export interface AdminStatsResponse {
  success: boolean;
  message: string;
  data: AdminStats;
}

export interface Clinic {
  id: string;
  clinicId?: string;
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
  badgeActive?: boolean;
  isVisible?: boolean;
  serviceFree?: number;
  wallet?: number;
  trial?: boolean;
  status?: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  banned?: boolean;
}

export interface AdminDoctor {
  id: string;
  doctorId?: string;
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
  qualifications?: string | null;
  createdAt?: string;
  status?: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  banned?: boolean;
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

export interface AdminStaff {
  id: string;
  fullName: string;
  email: string | null;
  phoneNumber: string;
  role: string;
  adminTier: AdminTier;
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  profileImage: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  adminName: string | null;
  adminTier: AdminTier | null;
  action: string;
  targetType: string;
  targetId: string | null;
  details: Record<string, any> | null;
  ipAddress: string | null;
  createdAt: string;
  admin?: {
    id: string;
    fullName: string;
    phoneNumber: string;
    email: string | null;
    adminTier: AdminTier;
  };
}

export interface BookingSettings {
  id: string;
  advanceBookingDays: number;
  cancellationCutoffHours: number;
  reminder24hEnabled: boolean;
  reminder3hEnabled: boolean;
  neglectedResolutionHours: number;
  autoRejectTimeoutMinutes: number;
  updatedAt?: string;
}

export interface Settlement {
  id: string;
  settlementNumber: string;
  partyType: 'CLINIC' | 'DOCTOR' | string;
  clinicId: string | null;
  doctorId: string | null;
  amount: number;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  reference: string | null;
  receiptUrl: string | null;
  notes: string | null;
  requestedAt: string;
  processedAt: string | null;
  completedAt: string | null;
  processedByAdminId: string | null;
  clinic?: {
    id: string;
    clinicName: string | null;
    logo: string | null;
    contactPhone: string | null;
    user?: {
      id: string;
      fullName: string | null;
      phoneNumber: string;
      wallet: number;
    };
  };
  doctor?: {
    id: string;
    user?: {
      id: string;
      fullName: string | null;
      phoneNumber: string;
      wallet: number;
    };
  };
  processedBy?: {
    id: string;
    fullName: string | null;
    phoneNumber: string;
    adminTier: AdminTier;
  };
}

export interface Complaint {
  id: string;
  complaintNumber: string;
  complainantId: string;
  complainantRole: string;
  targetType: string;
  targetId: string | null;
  bookingId: string | null;
  subject: string;
  description: string;
  status: 'PENDING' | 'UNDER_INVESTIGATION' | 'RESOLVED' | 'DISMISSED';
  adminNotes: string | null;
  resolution: string | null;
  resolvedByAdminId: string | null;
  resolvedAt: string | null;
  createdAt: string;
  complainant?: {
    id: string;
    fullName: string | null;
    phoneNumber: string;
    role: string;
    email: string | null;
  };
  resolvedBy?: {
    id: string;
    fullName: string | null;
    adminTier: AdminTier;
  };
  booking?: {
    id: string;
    serialNumber: string | null;
    consultDate: string;
    status: string;
  };
}

export interface PlatformFinancialOverview {
  totalUsers: number;
  totalPatients: number;
  totalDoctors: number;
  totalClinics: number;
  wallets: {
    totalActiveWallet: number;
    totalFrozenWallet: number;
  };
  capturedFees: {
    patientServiceFee: number;
    clinicServiceFee: number;
    totalAmount: number;
  };
  countryPatientFees: Array<{
    id: string;
    amount: number;
    country: string;
  }>;
  settlementsSummary: Array<{
    status: string;
    _sum: { amount: number | null };
    _count: { id: number };
  }>;
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

  // Toggle clinic visibility on platform (Show/Hide in mobile app)
  async updateClinicVisibility(clinicId: string, isVisible: boolean) {
    const response = await apiClient.patch(`/admin/clinic-visibility/${clinicId}`, {
      isVisible,
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

  // Suspend or activate a doctor (with auto-cancel of future appointments & 100% refund)
  async suspendDoctor(doctorId: string, suspended: boolean) {
    const response = await apiClient.patch<AdminActionResponse<{
      user: unknown;
      cancelledAppointmentsCount: number;
      totalRefundedAmount: number;
      message: string;
    }>>(`/admin/suspend-doctor/${doctorId}`, {
      suspended,
    });
    return response.data;
  },

  // Suspend or activate a clinic (with auto-cancel of future appointments & 100% refund)
  async suspendClinic(clinicId: string, suspended: boolean) {
    const response = await apiClient.patch<AdminActionResponse<{
      user: unknown;
      cancelledAppointmentsCount: number;
      totalRefundedAmount: number;
      message: string;
    }>>(`/admin/suspend-clinic/${clinicId}`, {
      suspended,
    });
    return response.data;
  },

  // ================= SECTION 9: NEW METHODS =================

  // 1. Admin Staff (5 Tiers)
  async getAdminStaff(params?: { page?: number; limit?: number; searchTerm?: string; adminTier?: string; status?: string }) {
    const response = await apiClient.get<PaginatedResponse<AdminStaff>>('/admin/staff', {
      params: { page: 1, limit: 10, ...params },
    });
    return response.data;
  },

  async createAdminStaff(data: { fullName: string; phoneNumber: string; email?: string; password: string; adminTier: AdminTier }) {
    const response = await apiClient.post<AdminActionResponse<AdminStaff>>('/admin/staff', data);
    return response.data;
  },

  async updateAdminStaffTier(staffId: string, adminTier: AdminTier) {
    const response = await apiClient.patch<AdminActionResponse<AdminStaff>>(`/admin/staff/${staffId}/tier`, {
      adminTier,
    });
    return response.data;
  },

  async toggleAdminStaffStatus(staffId: string, status: 'ACTIVE' | 'SUSPENDED') {
    const response = await apiClient.patch<AdminActionResponse<AdminStaff>>(`/admin/staff/${staffId}/status`, {
      status,
    });
    return response.data;
  },

  // 2. Audit Logs
  async getAuditLogs(params?: {
    page?: number;
    limit?: number;
    searchTerm?: string;
    action?: string;
    targetType?: string;
    adminId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const response = await apiClient.get<PaginatedResponse<AdminAuditLog>>('/admin/audit-logs', {
      params: { page: 1, limit: 15, ...params },
    });
    return response.data;
  },

  // 3. Platform Booking Settings
  async getBookingSettings() {
    const response = await apiClient.get<AdminActionResponse<BookingSettings>>('/admin/booking-settings');
    return response.data;
  },

  async updateBookingSettings(data: Partial<BookingSettings>) {
    const response = await apiClient.patch<AdminActionResponse<BookingSettings>>('/admin/booking-settings', data);
    return response.data;
  },

  // 4. Platform Financials Overview
  async getPlatformFinancialOverview() {
    const response = await apiClient.get<AdminActionResponse<PlatformFinancialOverview>>('/admin/financial-overview');
    return response.data;
  },

  // 5. Settlements
  async getSettlements(params?: {
    page?: number;
    limit?: number;
    searchTerm?: string;
    status?: string;
    partyType?: string;
    clinicId?: string;
  }) {
    const response = await apiClient.get<PaginatedResponse<Settlement>>('/admin/settlements', {
      params: { page: 1, limit: 10, ...params },
    });
    return response.data;
  },

  async createSettlement(data: { partyType?: string; clinicId?: string; doctorId?: string; amount: number; notes?: string }) {
    const response = await apiClient.post<AdminActionResponse<Settlement>>('/admin/settlements', data);
    return response.data;
  },

  async updateSettlementStatus(settlementId: string, data: { status: string; reference?: string; receiptUrl?: string; notes?: string }) {
    const response = await apiClient.patch<AdminActionResponse<Settlement>>(`/admin/settlements/${settlementId}/status`, data);
    return response.data;
  },

  // 6. Complaints & Disputes
  async getComplaints(params?: { page?: number; limit?: number; searchTerm?: string; status?: string; targetType?: string }) {
    const response = await apiClient.get<PaginatedResponse<Complaint>>('/admin/complaints', {
      params: { page: 1, limit: 10, ...params },
    });
    return response.data;
  },

  async getComplaintById(complaintId: string) {
    const response = await apiClient.get<AdminActionResponse<Complaint>>(`/admin/complaints/${complaintId}`);
    return response.data;
  },

  async resolveComplaint(complaintId: string, data: { status: string; adminNotes?: string; resolution?: string }) {
    const response = await apiClient.patch<AdminActionResponse<Complaint>>(`/admin/complaints/${complaintId}/resolve`, data);
    return response.data;
  },
};
