import { apiClient } from '@/lib/api-client';

// ============ SPECIALIST TYPES ============
export interface Specialist {
  id: string;
  name: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

export interface SpecialistResponse {
  success: boolean;
  message: string;
  meta: {
    page: number;
    limit: number;
    total: number;
  };
  data: Specialist[];
}

export interface SingleSpecialistResponse {
  success: boolean;
  message: string;
  data: Specialist;
}

export interface CreateSpecialistResponse {
  success: boolean;
  message: string;
  data: Specialist;
}

// ============ SPECIALIST SERVICE ============
export const specialistService = {
  /**
   * Get all specialists
   */
  async getSpecialists(page: number = 1, limit: number = 10): Promise<SpecialistResponse> {
    const { data } = await apiClient.get<SpecialistResponse>(
      `/specialist?page=${page}&limit=${limit}`
    );
    return data;
  },

  /**
   * Get single specialist
   */
  async getSpecialist(id: string): Promise<SingleSpecialistResponse> {
    const { data } = await apiClient.get<SingleSpecialistResponse>(`/specialist/${id}`);
    return data;
  },

  /**
   * Create new specialist
   */
  async createSpecialist(formData: FormData): Promise<CreateSpecialistResponse> {
    const { data } = await apiClient.post<CreateSpecialistResponse>('/specialist', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  /**
   * Update specialist
   */
  async updateSpecialist(id: string, formData: FormData): Promise<SingleSpecialistResponse> {
    const { data } = await apiClient.patch<SingleSpecialistResponse>(
      `/specialist/${id}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data;
  },

  /**
   * Delete specialist
   */
  async deleteSpecialist(id: string): Promise<{ success: boolean; message: string }> {
    const { data } = await apiClient.delete<{ success: boolean; message: string }>(
      `/specialist/${id}`
    );
    return data;
  },
};
