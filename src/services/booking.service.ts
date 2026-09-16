import { apiClient } from '@/lib/api-client';

export interface Doctor {
  id: string;
  doctorId: string;
  name: string;
  country: string;
  city: string;
  specialty: string;
  experience: string;
  fee: number;
  profileImage: string;
  clinic: string;
  rating: number;
  reviewCount: number;
  weightedRating: number;
  totalConsult: number;
  upcomingConsult: number;
  about: string | null;
  biography?: string | null;
  email?: string;
  phoneNumber?: string;
  licenseNumber?: string;
}

export interface Booking {
  id: string;
  consultDate: string;
  status:
    | 'PENDING'
    | 'INPROGRESS'
    | 'CONFIRMED'
    | 'COMPLETE'
    | 'COMPLETED'
    | 'ARRIVED'
    | 'CANCELLED'
    | 'NOT_UPDATED'
    | 'NOT_SHOW';
  serialNumber: number;
  startTime: string;
  endTime: string;
  doctor: {
    id: string;
    user: {
      fullName: string;
      profileImage: string;
    };
    speciality: string;
  };
  patient: {
    user: {
      fullName: string;
      phoneNumber: string;
      profileImage: string;
      gender: string;
      dateOfBirth: string;
    };
  };
}

export interface BookingHistoryResponse {
  success: boolean;
  message: string;
  data: {
    meta: {
      page: number;
      limit: number;
      total: number;
    };
    data: Booking[];
  };
}

export interface ClinicStatsResponse {
  success: boolean;
  message: string;
  data: {
    totalAppointment: number;
    todayAppointment: number;
    pendingAppointment: number;
    completedAppointment: number;
    confirmedAppointment: number;
    cancelledAppointment: number;
  };
}

export const bookingService = {
  async getClinicStats() {
    const response = await apiClient.get<ClinicStatsResponse>('/clinic/manager-stats');
    return response.data;
  },

  async getBookingHistory(params?: {
    status?: 'PENDING' | 'INPROGRESS' | 'CONFIRMED';
    doctorId?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await apiClient.get<BookingHistoryResponse>(
      '/clinic/manager/booking-history',
      { params }
    );
    return response.data;
  },

  async getDoctors() {
    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: {
        meta: {
          page: number;
          limit: number;
          total: number;
        };
        data: Doctor[];
      };
    }>('/clinic/manager/doctors');
    return response.data;
  },

  async updateAppointmentStatus(bookingId: string, status: string) {
    const response = await apiClient.patch('/clinic/manager-update/appointment-status', {
      bookingId,
      status,
    });
    return response.data;
  },

  async managerUpdateAppointmentStatus(bookingId: string, status: string) {
    return this.updateAppointmentStatus(bookingId, status);
  },
};

