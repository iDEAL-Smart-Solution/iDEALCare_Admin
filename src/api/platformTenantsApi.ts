// src/api/platformTenantsApi.ts
import apiClient from '../lib/apiClient';
import type { TenantSummary, TenantDetail, CreateTenantRequest } from '../types/tenant';

export const platformTenantsApi = {
  async getTenants(params?: {
    search?: string;
    isActive?: boolean;
    page?: number;
    pageSize?: number;
  }): Promise<{ items: TenantSummary[]; totalCount: number }> {
    const response = await apiClient.get<{ items: TenantSummary[]; totalCount: number }>(
      '/api/platform/tenants',
      { params }
    );
    return response.data;
  },

  async getTenantById(id: string): Promise<TenantDetail> {
    const response = await apiClient.get<TenantDetail>(`/api/platform/tenants/${id}`);
    return response.data;
  },

  async checkDomainAvailability(domain: string): Promise<{ available: boolean }> {
    const response = await apiClient.get<{ available: boolean }>(
      `/api/platform/tenants/check-domain`,
      { params: { domain } }
    );
    return response.data;
  },

  async createTenant(data: CreateTenantRequest): Promise<TenantDetail> {
    const response = await apiClient.post<TenantDetail>('/api/platform/tenants', data);
    return response.data;
  },

  async toggleTenantStatus(id: string, isActive: boolean, reason?: string): Promise<TenantDetail> {
    const response = await apiClient.patch<TenantDetail>(
      `/api/platform/tenants/${id}/status`,
      { isActive, reason }
    );
    return response.data;
  },
};
