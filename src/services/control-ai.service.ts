import { apiClient } from '@/lib/api-client';

export interface AllowAiChat {
  id: string;
  limit: number;
  isEnable: boolean;
}

export interface AllowAiChatResponse {
  success: boolean;
  message: string;
  data: AllowAiChat;
}

export interface GetAllowAiChatResponse {
  success: boolean;
  message: string;
  data: AllowAiChat[];
}

export interface AllowAiChatRequest {
  limit: number;
  isEnable: boolean;
}

export const controlAiService = {
  // Get AI chat settings
  async getSettings() {
    const response = await apiClient.get<GetAllowAiChatResponse>('/allow-ai-chat');
    return response.data;
  },

  // Create or update AI chat settings (upsert)
  async upsertSettings(data: AllowAiChatRequest) {
    const response = await apiClient.post<AllowAiChatResponse>('/allow-ai-chat', data);
    return response.data;
  },
};
