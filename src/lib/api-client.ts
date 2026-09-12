import { env } from '@/env';
import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios';

/**
 * Base API configuration
 */
const apiConfig: AxiosRequestConfig = {
  baseURL: env.NEXT_PUBLIC_API_URL,
  // timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * Main API client instance
 */
export const apiClient: AxiosInstance = axios.create(apiConfig);

/**
 * Request interceptor for adding authentication token
 */
apiClient.interceptors.request.use(
  (config) => {
    // Get auth token from localStorage (Zustand persist storage)
    if (typeof window !== 'undefined') {
      try {
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
          const { state } = JSON.parse(authStorage);
          const token = state?.accessToken;

          if (token && config.headers) {
            config.headers.Authorization = `${token}`;
          }
        }
      } catch (error) {
        console.error('Failed to get auth token:', error);
      }
    }

    return config;
  },
  (error: Error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor for handling errors globally
 */

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Check for JWT expired error message in API response
    let isJwtExpired = false;
    if (error.response?.data && typeof error.response.data === 'object') {
      const data = error.response.data as any;
      const msg = (typeof data.message === 'string' ? data.message : '').toLowerCase();
      if (
        msg.includes('jwt expired') ||
        msg.includes('token expired') ||
        msg.includes('token is expired') ||
        msg.includes('unauthorized')
      ) {
        isJwtExpired = true;
      }
    }
    if (isJwtExpired || error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('auth-storage');
        } catch (e) {
          // ignore
        }
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Type-safe API error
 */
export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

/**
 * Extract error message from API error
 */
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiError | undefined;
    return apiError?.message ?? error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
};

/**
 * API response wrapper type
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

/**
 * Paginated response type
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}
