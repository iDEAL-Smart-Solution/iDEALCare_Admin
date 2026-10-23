// src/types/subscription.ts

export const BillingFrequency = {
  Monthly: 1,
  Yearly: 2,
} as const;
export type BillingFrequency = (typeof BillingFrequency)[keyof typeof BillingFrequency];

export const SubscriptionStatus = {
  Active: 1,
  Expired: 2,
  PendingPayment: 3,
  Suspended: 4,
  Cancelled: 5,
} as const;
export type SubscriptionStatus = (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string | null;
  billingFrequency: BillingFrequency;
  price: number;
  currency: string;
  isActive: boolean;
}

export interface TenantSubscription {
  id: string;
  tenantId: string;
  tenantName: string;
  tenantDomain: string;
  planId: string;
  planName: string;
  billingFrequency: BillingFrequency;
  status: SubscriptionStatus;
  statusLabel: string;
  periodStart: string;
  periodEnd: string;
  requestedNextPlanId?: string | null;
  requestedNextPlanName?: string | null;
  activatedAt?: string | null;
  expiredAt?: string | null;
  cancelledAt?: string | null;
}

export interface SubscriptionPaymentRecord {
  id: string;
  tenantId: string;
  tenantName: string;
  amount: number;
  currency: string;
  billingFrequency: BillingFrequency;
  planName: string;
  paymentReference: string;
  paymentStatus: string;
  paymentProvider: string;
  paidAt: string;
}
