import { apiClient } from '@/lib/api-client';

export interface ReconciliationSummary {
  totalBookings: number;
  totalCompleted: number;
  totalConfirmed: number;
  totalCancelled: number;
  totalNoShow: number;
  totalPending: number;
  totalConsultFees: number;
  totalServiceFees: number;
  netClinicReceivable: number;
}

export interface DoctorBreakdown {
  doctorId: string;
  doctorName: string;
  totalBookings: number;
  completedBookings: number;
  totalConsultFee: number;
}

export interface ReconciliationReportItem {
  id: string;
  consultDate: string;
  status: string;
  serialNumber: number;
  startTime: string;
  endTime: string;
  consultFee: number;
  serviceFeeAmount: number;
  totalAmount: number;
  paymentStatus?: string;
  doctor: {
    id: string;
    consultFee?: number;
    speciality?: string;
    user: {
      fullName: string;
      phoneNumber: string;
      profileImage?: string;
    };
  };
  patient: {
    id: string;
    user: {
      fullName: string;
      phoneNumber: string;
      profileImage?: string;
    };
  };
}

export interface ReconciliationReportsResponse {
  success: boolean;
  message: string;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  data: {
    summary: ReconciliationSummary;
    doctorBreakdown: DoctorBreakdown[];
    data: ReconciliationReportItem[];
  };
}

export interface FinancialSummaryData {
  walletBalance: number;
  frozenWallet: number;
  totalEarnings: number;
  currentEarnings: number;
  currentMonthGross: number;
  currentMonthPlatformFees: number;
  currentMonthCompletedCount: number;
  totalCompletedCount: number;
  recentTransactions: Array<{
    id: string;
    amount: number;
    type?: string;
    status: string;
    createdAt: string;
  }>;
}

export interface ClinicNotificationItem {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  notificationType?: string;
}

export const clinicService = {
  async getReconciliationReports(params?: {
    doctorId?: string;
    period?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    searchTerm?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await apiClient.get<ReconciliationReportsResponse>(
      '/clinic/reconciliation-reports',
      { params }
    );
    return response.data;
  },

  async getFinancialSummary() {
    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: FinancialSummaryData;
    }>('/clinic/financial-summary');
    return response.data;
  },

  async getNotifications(params?: { search?: string; page?: number; limit?: number }) {
    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: {
        meta?: { page: number; limit: number; total: number };
        data: ClinicNotificationItem[];
      };
    }>('/notification/clinic', { params });
    return response.data;
  },

  async getDoctorAppointments(doctorId: string, params?: { status?: string; searchTerm?: string }) {
    const response = await apiClient.get<{
      success: boolean;
      message: string;
      doctor: any;
      data: any[];
      meta: { page: number; limit: number; total: number };
    }>(`/clinic/doctor-appointments/${doctorId}`, { params });
    return response.data;
  },

  async getDoctorAbsenceCaseload(doctorId: string, date: string) {
    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: {
        doctorId: string;
        date: string;
        totalAffected: number;
        eligibleForReassignment: number;
        mustBeCancelledWithRefund: number;
        appointments: any[];
      };
    }>('/clinic/doctor-absence/caseload', {
      params: { doctorId, date },
    });
    return response.data;
  },

  async executeDoctorAbsence(payload: { doctorId: string; date: string; reason?: string }) {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: any;
    }>('/clinic/doctor-absence/execute', payload);
    return response.data;
  },

  async getSettlements(params?: { page?: number; limit?: number; status?: string; searchTerm?: string }) {
    const response = await apiClient.get<{
      success: boolean;
      message: string;
      meta?: { page: number; limit: number; total: number };
      data: any[];
    }>('/clinic/settlements', { params });
    return response.data;
  },

  async requestSettlement(data: { amount: number; notes?: string | undefined }) {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: any;
    }>('/clinic/settlements', data);
    return response.data;
  },
};
