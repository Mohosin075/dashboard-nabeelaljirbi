import { apiClient } from '@/lib/api-client';

export interface PrepaidCard {
  id: string;
  cardNumber: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
  used: boolean;
  topUps: {
    createdAt: string;
    amount: number;
    user: {
      id: string;
      fullName: string;
      email: string;
      phoneNumber: string;
      country: string;
      city: string;
      address: string | null;
      profileImage: string | null;
    };
  }[];
}

export interface PrepaidCardMeta {
  page: number;
  limit: number;
  total: number;
}

export interface PrepaidCardStats {
  totalCard: number;
  usedCard: number;
  unUsedCard: number;
  totalAmountOfSell: number;
  data: PrepaidCard[];
}

export interface GetPrepaidCardsResponse {
  success: boolean;
  message: string;
  meta: PrepaidCardMeta;
  data: PrepaidCardStats;
}

export interface CreatePrepaidCardRequest {
  amount: number;
  quantity: number;
}

export interface UpdatePrepaidCardRequest {
  cardNumber?: string;
  amount?: number;
  isActive?: boolean;
}

export const prepaidCardService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
    const response = await apiClient.get<GetPrepaidCardsResponse>('/prepaid-card', {
      params,
    });
    return response.data;
  },

  create: async (data: CreatePrepaidCardRequest) => {
    const response = await apiClient.post('/prepaid-card/create', data);
    return response.data;
  },

  update: async (id: string, data: UpdatePrepaidCardRequest) => {
    const response = await apiClient.patch(`/prepaid-card/update/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/prepaid-card/delete/${id}`);
    return response.data;
  },

  // Helper to trigger download if API supports it or if we need to fetch all and convert
  // Based on user request "click button to hit this api", assuming a dedicated endpoint or params
  // If no specific endpoint, we might need a workaround. For now, I'll add a method that
  // tries to use a presumed download endpoint or just fetches all data for client-side export.
  // Given user said "download ... button e click korle ei api ta hit korba" implying a specific action.
  // I will assume there might be a misunderstanding and user might want client side export of the list.
  // BUT, I will implement a fetchAll for export.
  download: async () => {
      // If there is a specific download endpoint:
      // return apiClient.get('/prepaid-card/download', { responseType: 'blob' });

      // Since user gave {{base_url}}/prepaid-card for get, and said "download button click korle ei api ta hit korba"
      // it sounds like they want to use the GET api to fetch data and then export it.
      // So I will just reuse getAll but maybe with high limit?
      const response = await apiClient.get<GetPrepaidCardsResponse>('/prepaid-card', {
          params: { limit: 10000 } // Fetch varied amount for export
      });
      return response.data;
  }
};
