// src/pages/subscriptions/SubscriptionsListPage.tsx
import React, { useEffect, useState } from 'react';
import { RefreshCw, CreditCard, Gift, CheckCircle2, X } from 'lucide-react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { platformSubscriptionsApi } from '../../api/platformSubscriptionsApi';
import type { TenantSubscription, SubscriptionPlan } from '../../types/subscription';

export const SubscriptionsListPage: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<TenantSubscription[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Grant Modal state
  const [selectedSubForGrant, setSelectedSubForGrant] = useState<TenantSubscription | null>(null);
  const [grantPlanId, setGrantPlanId] = useState('');
  const [grantFrequency, setGrantFrequency] = useState(1);
  const [grantMonths, setGrantMonths] = useState(1);
  const [paymentReference, setPaymentReference] = useState('');
  const [grantNotes, setGrantNotes] = useState('');
  const [isGranting, setIsGranting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [subsData, plansData] = await Promise.all([
        platformSubscriptionsApi.getSubscriptions(),
        platformSubscriptionsApi.getPlans(),
      ]);
      setSubscriptions(subsData);
      setPlans(plansData);
      if (plansData.length > 0) {
        setGrantPlanId(plansData[0].id);
      }
    } catch {
      console.error('Failed to load subscriptions');
    } finally {
      setIsLoading(false);
    }
  };

  const openGrantModal = (sub: TenantSubscription) => {
    setSelectedSubForGrant(sub);
    setGrantPlanId(sub.planId);
    setGrantFrequency(sub.billingFrequency);
    setGrantMonths(sub.billingFrequency === 2 ? 12 : 1);
    setPaymentReference(`WIRE-TRF-${Date.now().toString().slice(-6)}`);
    setGrantNotes('Annual corporate wire transfer confirmed');
  };

  const handleGrantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubForGrant) return;

    setIsGranting(true);
    try {
      await platformSubscriptionsApi.grantSubscription({
        tenantId: selectedSubForGrant.tenantId,
        planId: grantPlanId,
        billingFrequency: grantFrequency,
        durationMonths: grantMonths,
        paymentReference,
        notes: grantNotes,
      });

      alert(`Subscription successfully granted for ${selectedSubForGrant.tenantName}.`);
      setSelectedSubForGrant(null);
      await loadData();
    } catch {
      alert('Failed to grant subscription.');
    } finally {
      setIsGranting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Tenant Subscriptions</h1>
          <p style={{ marginTop: '4px' }}>
            Active subscription periods, scheduled renewals, and mid-cycle plan queues.
          </p>
        </div>
        <Button variant="secondary" leftIcon={<RefreshCw size={16} />} onClick={loadData}>
          Refresh Subscriptions
        </Button>
      </div>

      {/* Subscription Governance Policy Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          padding: '16px 20px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ color: 'var(--brand-primary)', flexShrink: 0 }}>
          <CreditCard size={24} />
        </div>
        <div style={{ fontSize: '0.875rem' }}>
          <strong style={{ color: 'var(--text-primary)' }}>Scheduled Plan Transition Policy: </strong>
          <span style={{ color: 'var(--text-secondary)' }}>
            Mid-cycle plan changes are queued until the current paid period ends. Expired subscriptions restrict operational access without deleting historical patient records.
          </span>
        </div>
      </div>

      {/* Subscriptions Table */}
      <Card>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
            <div className="spinner" style={{ width: '28px', height: '28px' }} />
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tenant / Clinic</th>
                  <th>Current Plan</th>
                  <th>Cycle</th>
                  <th>Period Coverage</th>
                  <th>Queued Next Plan</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => (
                  <tr key={sub.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{sub.tenantName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--brand-primary)', fontFamily: 'var(--font-mono)' }}>
                        {sub.tenantDomain}
                      </div>
                    </td>
                    <td>
                      <strong>{sub.planName}</strong>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        {sub.billingFrequency === 2 ? 'Yearly' : 'Monthly'}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                        {new Date(sub.periodStart).toLocaleDateString()} &rarr; {new Date(sub.periodEnd).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      {sub.requestedNextPlanName ? (
                        <div
                          style={{
                            fontSize: '0.78125rem',
                            color: 'var(--brand-primary)',
                            backgroundColor: 'var(--brand-primary-light)',
                            padding: '4px 8px',
                            borderRadius: 'var(--radius-sm)',
                            display: 'inline-block',
                          }}
                        >
                          {sub.requestedNextPlanName}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>—</span>
                      )}
                    </td>
                    <td>
                      <Badge
                        variant={
                          sub.status === 1
                            ? 'active'
                            : sub.status === 2
                            ? 'expired'
                            : sub.status === 3
                            ? 'pending'
                            : 'suspended'
                        }
                      >
                        {sub.statusLabel}
                      </Badge>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Button
                        variant="secondary"
                        leftIcon={<Gift size={14} />}
                        style={{ padding: '6px 12px', fontSize: '0.8125rem' }}
                        onClick={() => openGrantModal(sub)}
                      >
                        Grant / Extend
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Grant / Offline Payment Modal */}
      {selectedSubForGrant && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
        >
          <div
            className="glass-card"
            style={{ width: '100%', maxWidth: '540px', padding: '30px', position: 'relative' }}
          >
            <button
              type="button"
              onClick={() => setSelectedSubForGrant(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.3rem', marginBottom: '4px' }}>
              Grant / Extend Subscription
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Record an offline wire transfer or complimentary trial for <strong>{selectedSubForGrant.tenantName}</strong>.
            </p>

            <form onSubmit={handleGrantSubmit}>
              <div className="form-group">
                <label className="form-label">Subscription Tier</label>
                <select
                  className="form-select"
                  value={grantPlanId}
                  onChange={(e) => setGrantPlanId(e.target.value)}
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ₦{p.price.toLocaleString()} ({p.billingFrequency === 2 ? 'Yearly' : 'Monthly'})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Cycle Frequency</label>
                  <select
                    className="form-select"
                    value={grantFrequency}
                    onChange={(e) => {
                      const freq = Number(e.target.value);
                      setGrantFrequency(freq);
                      setGrantMonths(freq === 2 ? 12 : 1);
                    }}
                  >
                    <option value={1}>Monthly</option>
                    <option value={2}>Yearly</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Duration (Months)</label>
                  <input
                    type="number"
                    min="1"
                    max="36"
                    className="form-input"
                    value={grantMonths}
                    onChange={(e) => setGrantMonths(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Bank Clearing / Wire Payment Reference *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. WIRE-ZENITH-20261018"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Internal Audit Notes</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Reason for manual subscription grant"
                  value={grantNotes}
                  onChange={(e) => setGrantNotes(e.target.value)}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '12px',
                  marginTop: '24px',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '18px',
                }}
              >
                <Button variant="ghost" onClick={() => setSelectedSubForGrant(null)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" isLoading={isGranting} leftIcon={<CheckCircle2 size={16} />}>
                  Confirm Grant & Activate
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
