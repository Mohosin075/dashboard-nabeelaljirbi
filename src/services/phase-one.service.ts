import { apiClient } from '@/lib/api-client';
export const phaseOne = {
  get: async (path: string, params?: Record<string, unknown>) =>
    (await apiClient.get(`/phase-one/${path}`, { params })).data.data,
  post: async (path: string, body: unknown) =>
    (await apiClient.post(`/phase-one/${path}`, body)).data.data,
  put: async (path: string, body: unknown) =>
    (await apiClient.put(`/phase-one/${path}`, body)).data.data,
  patch: async (path: string, body: unknown) =>
    (await apiClient.patch(`/phase-one/${path}`, body)).data.data,
  download: async (kind: string, format: string, params: Record<string, unknown>) => {
    let lang = 'en';
    if (typeof window !== 'undefined') {
      try {
        lang = localStorage.getItem('salama_dashboard_language') || (document.documentElement.lang === 'ar' ? 'ar' : 'en');
      } catch {
        lang = document.documentElement.lang === 'ar' ? 'ar' : 'en';
      }
    }
    const response = await apiClient.get(`/phase-one/reports/${kind}/${format}`, {
      params: { lang, ...params },
      responseType: 'blob',
    });
    const url = URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = `salama-${kind}.${format}`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },
};
