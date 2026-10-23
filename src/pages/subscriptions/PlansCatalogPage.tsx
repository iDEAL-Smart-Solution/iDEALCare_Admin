// src/pages/subscriptions/PlansCatalogPage.tsx
import React, { useEffect, useState } from 'react';
import { Plus, Check, CheckCircle2, X } from 'lucide-react';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { platformSubscriptionsApi } from '../../api/platformSubscriptionsApi';
import type { SubscriptionPlan } from '../../types/subscription';

export const PlansCatalogPage: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanDesc, setNewPlanDesc] = useState('');
  const [newPlanFreq, setNewPlanFreq] = useState<1 | 2>(1);
  const [newPlanPrice, setNewPlanPrice] = useState(60000);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Modal State
  const [selectedPlanForEdit, setSelectedPlanForEdit] = useState<SubscriptionPlan | null>(null);
  const [editPlanName, setEditPlanName] = useState('');
  const [editPlanDesc, setEditPlanDesc] = useState('');
  const [editPlanFreq, setEditPlanFreq] = useState<1 | 2>(1);
  const [editPlanPrice, setEditPlanPrice] = useState(0);
  const [editPlanIsActive, setEditPlanIsActive] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setIsLoading(true);
    try {
      const data = await platformSubscriptionsApi.getPlans();
      setPlans(data);
    } catch {
      console.error('Failed to load plans');
    } finally {
      setIsLoading(false);
    }
  };

  const cleanPrsText = (text: string | null | undefined): string => {
    if (!text) return '';
    return text
      .replace(/\(?\s*per\s*PRS\s*(?:§|section)?\s*\d*(?:–\d+)?\.?\s*\)?/gi, '')
      .replace(/\(?\s*PRS\s*(?:§|section)?\s*\d*(?:–\d+)?\.?\s*\)?/gi, '')
      .replace(/PRS/gi, '')
      .replace(/§/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
  };

  const handleOpenEditModal = (plan: SubscriptionPlan) => {
    setSelectedPlanForEdit(plan);
    setEditPlanName(plan.name);
    setEditPlanDesc(cleanPrsText(plan.description));
    setEditPlanFreq(plan.billingFrequency as 1 | 2);
    setEditPlanPrice(plan.price);
    setEditPlanIsActive(plan.isActive);
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanName.trim()) return;

    setIsSubmitting(true);
    try {
      await platformSubscriptionsApi.createPlan({
        name: newPlanName.trim(),
        description: newPlanDesc.trim(),
        billingFrequency: newPlanFreq,
        price: Number(newPlanPrice) || 0,
        currency: 'NGN',
        isActive: true,
      });

      setIsCreateModalOpen(false);
      setNewPlanName('');
      setNewPlanDesc('');
      await loadPlans();
    } catch {
      alert('Failed to create subscription plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanForEdit || !editPlanName.trim()) return;

    setIsSubmitting(true);
    try {
      await platformSubscriptionsApi.updatePlan(selectedPlanForEdit.id, {
        name: editPlanName.trim(),
        description: editPlanDesc.trim(),
        billingFrequency: editPlanFreq,
        price: Number(editPlanPrice) || 0,
        currency: 'NGN',
        isActive: editPlanIsActive,
      });

      setSelectedPlanForEdit(null);
      await loadPlans();
    } catch {
      alert('Failed to update subscription plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Subscription Plans Catalog</h1>
          <p style={{ marginTop: '4px' }}>
            Configure pricing tiers, billing frequencies, and tenant entitlement packages.
          </p>
        </div>
        <Button variant="primary" leftIcon={<Plus size={18} />} onClick={() => setIsCreateModalOpen(true)}>
          Create New Plan
        </Button>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div className="spinner" style={{ width: '32px', height: '32px' }} />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="glass-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: 'var(--brand-primary)',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {plan.billingFrequency === 2 ? 'Yearly Billing' : 'Monthly Billing'}
                  </span>
                  <Badge variant={plan.isActive ? 'active' : 'suspended'}>
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{plan.name}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '18px', minHeight: '40px' }}>
                  {cleanPrsText(plan.description) || 'Standard platform tier for healthcare facilities.'}
                </p>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '22px' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    ₦{plan.price.toLocaleString()}
                  </span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    {plan.billingFrequency === 2 ? '/ year' : '/ month'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                  {['Multi-tenant data isolation', 'Clinical care records', 'Guardian portal support', 'Paystack automated renewal'].map((feat, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem' }}>
                      <span style={{ color: 'var(--status-active)', display: 'flex' }}>
                        <Check size={16} />
                      </span>
                      <span style={{ color: 'var(--text-secondary)' }}>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                <Button
                  variant="secondary"
                  style={{ flex: 1, fontSize: '0.8125rem' }}
                  onClick={() => handleOpenEditModal(plan)}
                >
                  Edit Tier
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Plan Modal */}
      {isCreateModalOpen && (
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
          <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '30px', position: 'relative' }}>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
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

            <h3 style={{ fontSize: '1.3rem', marginBottom: '4px' }}>Create Subscription Plan</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Add a new subscription tier for healthcare clinics and care providers.
            </p>

            <form onSubmit={handleCreatePlan}>
              <div className="form-group">
                <label className="form-label">Plan Tier Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Geriatric Care Clinic Tier"
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Target provider size and operational scope"
                  value={newPlanDesc}
                  onChange={(e) => setNewPlanDesc(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Billing Cycle</label>
                  <select
                    className="form-select"
                    value={newPlanFreq}
                    onChange={(e) => setNewPlanFreq(Number(e.target.value) as 1 | 2)}
                  >
                    <option value={1}>Monthly</option>
                    <option value={2}>Yearly</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Price (NGN) *</label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    className="form-input"
                    value={newPlanPrice}
                    onChange={(e) => setNewPlanPrice(Number(e.target.value))}
                    required
                  />
                </div>
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
                <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" isLoading={isSubmitting} leftIcon={<CheckCircle2 size={16} />}>
                  Save Plan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Plan Modal */}
      {selectedPlanForEdit && (
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
          onClick={() => setSelectedPlanForEdit(null)}
        >
          <div
            className="glass-card"
            style={{ width: '100%', maxWidth: '520px', padding: '30px', position: 'relative' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedPlanForEdit(null)}
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

            <h3 style={{ fontSize: '1.3rem', marginBottom: '4px' }}>Edit Subscription Tier</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Update tier pricing, billing frequency, and availability for healthcare facilities.
            </p>

            <form onSubmit={handleUpdatePlan}>
              <div className="form-group">
                <label className="form-label">Plan Tier Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={editPlanName}
                  onChange={(e) => setEditPlanName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <input
                  type="text"
                  className="form-input"
                  value={editPlanDesc}
                  onChange={(e) => setEditPlanDesc(e.target.value)}
                  placeholder="Target provider size and operational scope"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Billing Cycle</label>
                  <select
                    className="form-select"
                    value={editPlanFreq}
                    onChange={(e) => setEditPlanFreq(Number(e.target.value) as 1 | 2)}
                  >
                    <option value={1}>Monthly</option>
                    <option value={2}>Yearly</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Price (NGN) *</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    className="form-input"
                    value={editPlanPrice}
                    onChange={(e) => setEditPlanPrice(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              {/* Status Toggle */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--surface-elevated)',
                  border: '1px solid var(--border)',
                  marginTop: '10px',
                }}
              >
                <div>
                  <strong style={{ fontSize: '0.875rem', color: 'var(--text-h)', display: 'block' }}>
                    Active Plan Status
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {editPlanIsActive ? 'Available for new tenant onboarding' : 'Hidden from new tenant registrations'}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={editPlanIsActive}
                  onChange={(e) => setEditPlanIsActive(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent)' }}
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
                <Button variant="ghost" onClick={() => setSelectedPlanForEdit(null)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" isLoading={isSubmitting} leftIcon={<CheckCircle2 size={16} />}>
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
