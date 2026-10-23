// src/api/platformSubscriptionsApi.ts
import apiClient from '../lib/apiClient';
import type {
  SubscriptionPlan,
  TenantSubscription,
  SubscriptionPaymentRecord,
} from '../types/subscription';

export const platformSubscriptionsApi = {
  async getPlans(): Promise<SubscriptionPlan[]> {
    const response = await apiClient.get<SubscriptionPlan[]>('/api/platform/subscription-plans');
    return response.data;
  },

  async createPlan(data: Omit<SubscriptionPlan, 'id'>): Promise<SubscriptionPlan> {
    const response = await apiClient.post<SubscriptionPlan>('/api/platform/subscription-plans', data);
    return response.data;
  },

  async updatePlan(id: string, data: Partial<Omit<SubscriptionPlan, 'id'>>): Promise<SubscriptionPlan> {
    const response = await apiClient.put<SubscriptionPlan>(`/api/platform/subscription-plans/${id}`, data);
    return response.data;
  },

  async getSubscriptions(): Promise<TenantSubscription[]> {
    const response = await apiClient.get<TenantSubscription[]>('/api/platform/subscriptions');
    return response.data;
  },

  async grantSubscription(data: {
    tenantId: string;
    planId: string;
    billingFrequency: number;
    durationMonths: number;
    paymentReference: string;
    notes?: string;
  }): Promise<TenantSubscription> {
    const response = await apiClient.post<TenantSubscription>(
      `/api/platform/tenants/${data.tenantId}/subscription/grant`,
      data
    );
    return response.data;
  },

  async getPayments(): Promise<SubscriptionPaymentRecord[]> {
    const response = await apiClient.get<SubscriptionPaymentRecord[]>('/api/platform/subscriptions/payments');
    return response.data;
  },
};

