import { apiClient } from '@/lib/api-client';

export interface NotificationTemplate {
  id: string;
  eventKey: string;
  name: string;
  description?: string;
  titleEn: string;
  bodyEn: string;
  titleAr: string;
  bodyAr: string;
  pushEnabled: boolean;
  inAppEnabled: boolean;
  whatsappEnabled: boolean;
  smsEnabled: boolean;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateNotificationTemplateDto {
  name?: string;
  description?: string | null | undefined;
  titleEn?: string;
  bodyEn?: string;
  titleAr?: string;
  bodyAr?: string;
  pushEnabled?: boolean;
  inAppEnabled?: boolean;
  whatsappEnabled?: boolean;
  smsEnabled?: boolean;
  variables?: string[];
  isActive?: boolean;
}

export const notificationTemplateService = {
  // Get all notification templates
  async getAllTemplates(): Promise<{ data: NotificationTemplate[] }> {
    const response = await apiClient.get('/notification-templates');
    return response.data;
  },

  // Get template by ID
  async getTemplateById(id: string): Promise<{ data: NotificationTemplate }> {
    const response = await apiClient.get(`/notification-templates/${id}`);
    return response.data;
  },

  // Update a template
  async updateTemplate(id: string, data: UpdateNotificationTemplateDto): Promise<{ data: NotificationTemplate; message: string }> {
    const response = await apiClient.patch(`/notification-templates/${id}`, data);
    return response.data;
  },

  // Seed default templates
  async seedDefaults(): Promise<{ data: NotificationTemplate[]; message: string }> {
    const response = await apiClient.post('/notification-templates/seed', {});
    return response.data;
  },
};
