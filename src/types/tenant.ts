// src/types/tenant.ts

export interface TenantSummary {
  id: string;
  name: string;
  legalName?: string | null;
  domain: string;
  email?: string | null;
  phoneNumber?: string | null;
  city?: string | null;
  state?: string | null;
  isActive: boolean;
  subscriptionStatus?: string;
  currentPlanName?: string;
  createdAt: string;
}

export interface TenantDetail extends TenantSummary {
  address?: string | null;
  country?: string | null;
  logoUrl?: string | null;
  nursingCareBillsRefundableByDefault: boolean;
  registrationFeeAmount: number;
  updatedAt?: string | null;
  owner?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  activeSubscription?: {
    id: string;
    planId: string;
    planName: string;
    billingFrequency: number;
    status: number;
    statusName: string;
    periodStart: string;
    periodEnd: string;
    requestedNextPlanId?: string | null;
    requestedNextPlanName?: string | null;
  } | null;
}

export interface CreateTenantRequest {
  name: string;
  legalName?: string;
  domain: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  initialPlanId?: string;
  billingFrequency?: number;
  owner: {
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
  };
  nursingCareBillsRefundableByDefault: boolean;
  registrationFeeAmount: number;
}
