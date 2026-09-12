import { apiClient } from '@/lib/api-client';

export interface OtpSettings {
  SMS: boolean;
  WhatsApp: boolean;
}

export const otpService = {
  // Update OTP system settings
  async updateOtpSettings(data: OtpSettings) {
    const response = await apiClient.post('/otp-system', data);
    return response.data;
  },

  // Get OTP system settings
  async getOtpSettings() {
    const response = await apiClient.get('/otp-system');
    return response.data;
  },
};

