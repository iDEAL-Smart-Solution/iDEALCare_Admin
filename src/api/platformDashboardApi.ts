// src/api/platformDashboardApi.ts
import apiClient from '../lib/apiClient';
import type { TenantSummary } from '../types/tenant';

export interface PlatformDashboardMetrics {
  totalActiveTenants: number;
  monthlyRecurringRevenue: number;
  activeSubscriptions: number;
  expiringInSevenDays: number;
  recentTenants: TenantSummary[];
}

export const platformDashboardApi = {
  async getOverview(): Promise<PlatformDashboardMetrics> {
    const response = await apiClient.get<PlatformDashboardMetrics>('/api/platform/dashboard/overview');
    return response.data;
  },
};
