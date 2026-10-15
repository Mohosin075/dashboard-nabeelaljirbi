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
  cardNumber?: string | undefined;
  amount?: number | undefined;
  isActive?: boolean | undefined;
}

export interface BulkDeleteResponse {
  success: boolean;
  message: string;
  data: {
    deletedCount: number;
    skippedCount: number;
    message: string;
  };
}

export interface DenominationsResponse {
  success: boolean;
  message: string;
  data: number[];
}

export const prepaidCardService = {
  getAll: async (params?: {
    page?: number | undefined;
    limit?: number | undefined;
    searchTerm?: string | undefined;
    used?: string | undefined;
    amount?: string | number | undefined;
  }) => {
    const response = await apiClient.get<GetPrepaidCardsResponse>('/prepaid-card', {
      params,
    });
    return response.data;
  },

  getDenominations: async () => {
    const response = await apiClient.get<DenominationsResponse>('/prepaid-card/denominations');
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

  bulkDelete: async (ids: string[]) => {
    const response = await apiClient.post<BulkDeleteResponse>('/prepaid-card/bulk-delete', {
      ids,
    });
    return response.data;
  },

  exportCards: async (params?: {
    searchTerm?: string | undefined;
    used?: string | undefined;
    amount?: string | number | undefined;
    ids?: string[] | undefined;
  }) => {
    const queryParams: Record<string, string | number> = {};
    if (params?.searchTerm) queryParams['searchTerm'] = params.searchTerm;
    if (params?.used && params.used !== 'all') queryParams['used'] = params.used;
    if (params?.amount && params.amount !== 'all') queryParams['amount'] = params.amount;
    if (params?.ids && params.ids.length > 0) queryParams['ids'] = params.ids.join(',');

    const response = await apiClient.get('/prepaid-card/export', {
      params: queryParams,
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `prepaid_cards_${dateStr}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  download: async (params?: {
    searchTerm?: string | undefined;
    used?: string | undefined;
    amount?: string | number | undefined;
    ids?: string[] | undefined;
  }) => {
    return prepaidCardService.exportCards(params);
  },
};
