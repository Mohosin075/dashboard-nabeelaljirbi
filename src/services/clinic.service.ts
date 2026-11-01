import { apiClient } from '@/lib/api-client';

export interface ReconciliationSummary {
  currency: string | null;
  byCountry: Array<{country:string;currency:string;totalConsultFees:number;totalServiceFees:number;netClinicReceivable:number}>;
  totalBookings: number;
  totalCompleted: number;
  totalConfirmed: number;
  totalCancelled: number;
  totalNoShow: number;
  totalPending: number;
  totalConsultFees: number | null;
  totalServiceFees: number | null;
  netClinicReceivable: number | null;
}

export interface DoctorBreakdown {
  country: string; currency: string;
  doctorId: string;
  doctorName: string;
  totalBookings: number;
  completedBookings: number;
  totalConsultFee: number;
}

export interface ClinicBreakdown {
  country: string; currency: string;
  clinicId: string;
  clinicName: string;
  location: string;
  totalBookings: number;
  completedBookings: number;
  totalConsultFee: number;
  totalServiceFee: number;
}

export interface ReconciliationReportItem {
  feeCountry?: string; displayStatus?: string;
  familyMemberName?: string; familyMemberRelation?: string;
  id: string;
  consultDate: string;
  status: string;
  serialNumber: number;
  startTime: string;
  endTime: string;
  consultFee: number;
  serviceFeeAmount: number;
  clinicServiceFee?: number;
  collectionMode?: string;
  totalAmount: number;
  paymentStatus?: string;
  clinic?: {
    id: string;
    clinicName?: string;
    location?: string;
    logo?: string;
  };
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
    clinicBreakdown?: ClinicBreakdown[];
    data: ReconciliationReportItem[];
  };
}

export interface FinancialSummaryData {
  walletCountry: string; walletCurrency: string;
  consultationTotalsByCountry: Array<{country:string;currency:string;gross:number;platformFees:number;completedCount:number}>;
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
  status?: string;
  serialNumber?: number;
  consultDate?: string;
  startTime?: string;
  endTime?: string;
  patient?: any;
  doctor?: any;
}

export const clinicService = {
  async getReconciliationReports(params?: {
    clinicId?: string;
    doctorId?: string;
    specialty?: string;
    location?: string;
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
        doctor: { id: string; name: string; speciality?: string };
        date: string;
        totalAffected: number;
        summary: { totalAffected: number; pendingCount: number; confirmedCount: number };
        caseload: any[];
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
