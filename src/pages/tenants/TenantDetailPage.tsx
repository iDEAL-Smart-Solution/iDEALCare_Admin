// src/pages/tenants/TenantDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ExternalLink,
  Power,
} from 'lucide-react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { platformTenantsApi } from '../../api/platformTenantsApi';
import type { TenantDetail } from '../../types/tenant';

export const TenantDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [tenant, setTenant] = useState<TenantDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadTenant(id);
    }
  }, [id]);

  const loadTenant = async (tenantId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await platformTenantsApi.getTenantById(tenantId);
      setTenant(data);
    } catch {
      setError('Failed to load healthcare tenant details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!tenant) return;
    const nextStatus = !tenant.isActive;
    const confirmMessage = nextStatus
      ? `Re-activate ${tenant.name}? Authorized staff and patients will regain operational access.`
      : `Suspend ${tenant.name}? Operational access will be blocked immediately. Patient data will remain securely preserved.`;

    if (!window.confirm(confirmMessage)) return;

    setIsTogglingStatus(true);
    try {
      const updated = await platformTenantsApi.toggleTenantStatus(
        tenant.id,
        nextStatus,
        nextStatus ? 'Admin manual reactivation' : 'Admin manual suspension'
      );
      setTenant(updated);
    } catch {
      alert('Failed to update tenant status.');
    } finally {
      setIsTogglingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
        <div className="spinner" style={{ width: '32px', height: '32px' }} />
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center' }}>
        <div className="alert alert-danger" style={{ justifyContent: 'center' }}>
          {error || 'Healthcare provider not found.'}
        </div>
        <Button variant="secondary" onClick={() => navigate('/tenants')}>
          Back to Tenants
        </Button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Bar Navigation & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Button variant="ghost" onClick={() => navigate('/tenants')} style={{ padding: '8px' }}>
            <ArrowLeft size={18} />
          </Button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{tenant.name}</h1>
              <Badge variant={tenant.isActive ? 'active' : 'suspended'}>
                {tenant.isActive ? 'OPERATIONAL' : 'SUSPENDED'}
              </Badge>
            </div>
            <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--brand-primary)', fontSize: '0.875rem', marginTop: '2px' }}>
              https://{tenant.domain}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Button
            variant={tenant.isActive ? 'danger' : 'primary'}
            leftIcon={<Power size={16} />}
            isLoading={isTogglingStatus}
            onClick={handleToggleStatus}
          >
            {tenant.isActive ? 'Suspend Tenant' : 'Activate Tenant'}
          </Button>
          <Button
            variant="outline"
            rightIcon={<ExternalLink size={16} />}
            onClick={() => window.open(`https://${tenant.domain}`, '_blank')}
          >
            Visit Provider Portal
          </Button>
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>
        {/* Left Column: Organization & Operational Configuration */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Card title="Organization & Contact Profile" subtitle="General healthcare provider attributes">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.875rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', display: 'block' }}>
                  Legal Business Name
                </span>
                <strong>{tenant.legalName || tenant.name}</strong>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', display: 'block' }}>
                  Contact Email
                </span>
                <span>{tenant.email || '—'}</span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', display: 'block' }}>
                  Phone Number
                </span>
                <span>{tenant.phoneNumber || '—'}</span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', display: 'block' }}>
                  Location
                </span>
                <span>{[tenant.city, tenant.state, tenant.country].filter(Boolean).join(', ') || '—'}</span>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', display: 'block' }}>
                  Street Address
                </span>
                <span>{tenant.address || '—'}</span>
              </div>
            </div>
          </Card>

          <Card title="Financial Policies" subtitle="Tenant-level billing switches">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>Nursing-Care Invoice Refundability</strong>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    Unspent patient deposits flagged as refundable by default on discharge
                  </p>
                </div>
                <Badge variant={tenant.nursingCareBillsRefundableByDefault ? 'active' : 'default'}>
                  {tenant.nursingCareBillsRefundableByDefault ? 'Refundable Default' : 'Non-Refundable'}
                </Badge>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
                <div>
                  <strong>Patient Intake Registration Fee</strong>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    Fixed fee charged to patient upon assessment acceptance
                  </p>
                </div>
                <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                  ₦{Number(tenant.registrationFeeAmount).toLocaleString()}
                </strong>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Subscription & Administrator */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Subscription State Card */}
          <Card
            title="Subscription Status"
            subtitle="Current billing entitlement"
            action={
              <Badge
                variant={
                  tenant.activeSubscription?.statusName.toLowerCase() === 'active'
                    ? 'active'
                    : tenant.activeSubscription?.statusName.toLowerCase().includes('pending')
                    ? 'pending'
                    : 'expired'
                }
              >
                {tenant.activeSubscription?.statusName === 'PendingPayment'
                  ? 'Pending Payment'
                  : tenant.activeSubscription?.statusName || 'Pending Payment'}
              </Badge>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Current Plan</span>
                <strong>{tenant.activeSubscription?.planName || tenant.currentPlanName || 'Standard'}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Period Start</span>
                <span>
                  {tenant.activeSubscription?.statusName === 'PendingPayment'
                    ? 'Awaiting Initial Payment'
                    : tenant.activeSubscription?.periodStart
                    ? new Date(tenant.activeSubscription.periodStart).toLocaleDateString()
                    : '—'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Period End / Renewal</span>
                <strong style={{ color: 'var(--text-primary)' }}>
                  {tenant.activeSubscription?.statusName === 'PendingPayment'
                    ? 'Inactive (Payment Required)'
                    : tenant.activeSubscription?.periodEnd
                    ? new Date(tenant.activeSubscription.periodEnd).toLocaleDateString()
                    : '—'}
                </strong>
              </div>

              {/* Queued Next Plan */}
              {tenant.activeSubscription?.requestedNextPlanName && (
                <div
                  style={{
                    backgroundColor: 'var(--brand-primary-light)',
                    border: '1px solid var(--brand-primary)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px',
                    marginTop: '6px',
                  }}
                >
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase', display: 'block' }}>
                    Scheduled Plan Change
                  </span>
                  <p style={{ fontSize: '0.8125rem', marginTop: '2px', color: 'var(--text-primary)' }}>
                    {tenant.activeSubscription.requestedNextPlanName}
                  </p>
                </div>
              )}

              <Button
                variant="secondary"
                style={{ width: '100%', marginTop: '6px' }}
                onClick={() => navigate('/subscriptions')}
              >
                Manage Subscription / Grant
              </Button>
            </div>
          </Card>

          {/* Primary Owner Account Card */}
          <Card title="Primary Administrator" subtitle="Tenant-level owner account">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Name</span>
                <strong>{tenant.owner ? `${tenant.owner.firstName} ${tenant.owner.lastName}` : 'Not configured'}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Email</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                  {tenant.owner?.email || '—'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Role Scope</span>
                <span style={{ fontWeight: 600, color: 'var(--status-active)' }}>Tenant Owner</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
