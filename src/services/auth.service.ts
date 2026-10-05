import { apiClient } from '@/lib/api-client';

interface SendOtpPayload {
  phoneNumber: string;
  otpSender: 'sms' | 'whatsapp';
}

interface VerifyOtpPayload {
  phoneNumber: string;
  otp: string;
}

interface VerifyOtpResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    profileCompleted: boolean;
    role: string;
  };
}

export const authService = {
  async sendOtp(payload: SendOtpPayload) {
    const response = await apiClient.post('/auth/send-otp', payload);
    return response.data;
  },

  async verifyOtp(payload: VerifyOtpPayload) {
    const response = await apiClient.post<VerifyOtpResponse>('/auth/verify-otp', payload);
    return response.data;
  },

  async adminLogin(payload: { email: string; password: string }) {
    const response = await apiClient.post<VerifyOtpResponse>('/auth/admin-login', payload);
    return response.data;
  },

  async forgotPassword(payload: { emailOrPhone: string }) {
    const response = await apiClient.post<{ success: boolean; message: string }>('/auth/forgot-password', payload);
    return response.data;
  },

  async resetPassword(payload: { token: string; newPassword: string }) {
    const response = await apiClient.post<{ success: boolean; message: string }>('/auth/reset-password', payload);
    return response.data;
  },
};
