import { apiClient } from '@/lib/api-client';

export type UserRole = 'PATIENT' | 'DOCTOR' | 'CLINIC';

export interface LegalDocument {
  id: string;
  role: UserRole;
  title: string;
  titleAr?: string;
  content: string;
  contentAr?: string;
  version: string;
  effectiveDate: string;
  requireReacceptance: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    acceptances: number;
  };
}

export interface PublishLegalDocumentPayload {
  role: UserRole;
  title: string;
  titleAr?: string;
  content: string;
  contentAr?: string;
  version: string;
  effectiveDate: string;
  requireReacceptance: boolean;
}

export interface UserAcceptanceRecord {
  id: string;
  userId: string;
  documentId: string;
  documentVersion: string;
  role: UserRole;
  acceptedAt: string;
  ipAddress?: string;
  userAgent?: string;
  user: {
    id: string;
    fullName?: string;
    phoneNumber: string;
    role: string;
    email?: string;
  };
}

export const legalAgreementService = {
  // Get all documents for admin
  async getAllDocuments(params?: {
    role?: UserRole;
    searchTerm?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) {
    const response = await apiClient.get('/legal-documents/admin/all', {
      params,
    });
    return response.data;
  },

  // Publish a new document version
  async publishNewVersion(payload: PublishLegalDocumentPayload) {
    const response = await apiClient.post(
      '/legal-documents/admin/publish',
      payload
    );
    return response.data;
  },

  // Get active document for a specific role
  async getActiveDocument(role: UserRole) {
    const response = await apiClient.get('/legal-documents/active', {
      params: { role },
    });
    return response.data;
  },

  // Get audit log of users who accepted this document
  async getDocumentAcceptances(
    documentId: string,
    params?: { page?: number; limit?: number }
  ) {
    const response = await apiClient.get(
      `/legal-documents/admin/${documentId}/acceptances`,
      { params }
    );
    return response.data;
  },
};
