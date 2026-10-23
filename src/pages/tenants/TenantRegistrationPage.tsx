// src/pages/tenants/TenantRegistrationPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  User,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { platformTenantsApi } from '../../api/platformTenantsApi';
import { platformSubscriptionsApi } from '../../api/platformSubscriptionsApi';
import type { SubscriptionPlan } from '../../types/subscription';

export const TenantRegistrationPage: React.FC = () => {
  const navigate = useNavigate();

  // Wizard state
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{
    id: string;
    name: string;
    domain: string;
    ownerEmail: string;
  } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    legalName: '',
    subdomain: '',
    email: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    country: 'Nigeria',
    nursingCareBillsRefundableByDefault: false,
    registrationFeeAmount: 0,
    ownerFirstName: '',
    ownerLastName: '',
    ownerEmail: '',
    ownerPassword: 'InitialAdminPassword2026!',
    initialPlanId: '',
    billingFrequency: 1, // Monthly
  });

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);

  React.useEffect(() => {
    platformSubscriptionsApi.getPlans().then((loadedPlans) => {
      setPlans(loadedPlans);
      if (loadedPlans.length > 0) {
        setFormData((prev) => ({
          ...prev,
          initialPlanId: loadedPlans[0].id,
          billingFrequency: loadedPlans[0].billingFrequency,
        }));
      }
    }).catch(() => {});
  }, []);

  // Domain availability check state
  const [isCheckingDomain, setIsCheckingDomain] = useState(false);
  const [domainAvailable, setDomainAvailable] = useState<boolean | null>(null);

  const fullDomain = formData.subdomain.trim()
    ? `${formData.subdomain.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')}.idealcare.ng`
    : '';

  const handleSubdomainChange = async (val: string) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setFormData((prev) => ({ ...prev, subdomain: clean }));
    if (clean.length >= 3) {
      setIsCheckingDomain(true);
      try {
        const check = await platformTenantsApi.checkDomainAvailability(`${clean}.idealcare.ng`);
        setDomainAvailable(check.available);
      } catch {
        setDomainAvailable(true);
      } finally {
        setIsCheckingDomain(false);
      }
    } else {
      setDomainAvailable(null);
    }
  };

  const handleNext = () => {
    setError(null);
    if (step === 1) {
      if (!formData.name.trim()) {
        setError('Healthcare Provider name is required.');
        return;
      }
      if (!formData.subdomain.trim() || formData.subdomain.length < 3) {
        setError('A valid subdomain of at least 3 characters is required.');
        return;
      }
      if (domainAvailable === false) {
        setError('This domain is already registered to another provider. Please pick another.');
        return;
      }
      if (!formData.email.trim()) {
        setError('Provider contact email is required.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.ownerFirstName.trim() || !formData.ownerLastName.trim()) {
        setError('Owner first and last name are required.');
        return;
      }
      if (!formData.ownerEmail.trim()) {
        setError('Owner administrative email is required.');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const handleBack = () => {
    setError(null);
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const created = await platformTenantsApi.createTenant({
        name: formData.name.trim(),
        legalName: formData.legalName.trim() || formData.name.trim(),
        domain: fullDomain,
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim() || undefined,
        address: formData.address.trim() || undefined,
        city: formData.city.trim() || undefined,
        state: formData.state.trim() || undefined,
        country: formData.country,
        nursingCareBillsRefundableByDefault: formData.nursingCareBillsRefundableByDefault,
        registrationFeeAmount: Number(formData.registrationFeeAmount) || 0,
        initialPlanId: formData.initialPlanId?.trim() ? formData.initialPlanId.trim() : undefined,
        billingFrequency: formData.billingFrequency,
        owner: {
          firstName: formData.ownerFirstName.trim(),
          lastName: formData.ownerLastName.trim(),
          email: formData.ownerEmail.trim(),
          password: formData.ownerPassword,
        },
      });

      setSuccessResult({
        id: created.id,
        name: created.name,
        domain: created.domain,
        ownerEmail: formData.ownerEmail.trim(),
      });
    } catch (err: unknown) {
      const errAny = err as { response?: { data?: { message?: string; title?: string; errors?: Record<string, string[]> } }; message?: string };
      const respData = errAny?.response?.data;
      let errorMsg = respData?.message || respData?.title;
      if (respData?.errors) {
        const fieldErrors = Object.entries(respData.errors)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join(' | ');
        errorMsg = errorMsg ? `${errorMsg} (${fieldErrors})` : fieldErrors;
      }
      setError(errorMsg || errAny?.message || 'Failed to register tenant. Please verify all details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successResult) {
    return (
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--status-active-bg)',
              color: 'var(--status-active)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              border: '1px solid var(--status-active-border)',
            }}
          >
            <CheckCircle2 size={36} />
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '8px' }}>
            Tenant Successfully Provisioned!
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
            <strong>{successResult.name}</strong> has been initialized with an isolated database partition and primary administrator credentials.
          </p>

          <div
            style={{
              backgroundColor: 'var(--bg-surface-elevated)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              padding: '20px',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginBottom: '32px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Tenant Domain</span>
              <span style={{ fontWeight: 600, color: 'var(--brand-primary)', fontFamily: 'var(--font-mono)' }}>
                https://{successResult.domain}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Primary Admin</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {successResult.ownerEmail}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Initial Password</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                {formData.ownerPassword}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Tenant Status</span>
              <span style={{ color: 'var(--status-active)', fontWeight: 700, fontSize: '0.8125rem' }}>
                Provisioned &bull; Database Isolated
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Subscription</span>
              <span style={{ color: 'var(--warning)', fontWeight: 700, fontSize: '0.8125rem' }}>
                Pending Payment (Awaiting Client Activation)
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
            <Button variant="secondary" onClick={() => navigate('/tenants')}>
              Back to Tenants List
            </Button>
            <Button
              variant="primary"
              rightIcon={<ExternalLink size={16} />}
              onClick={() => window.open(`https://${successResult.domain}`, '_blank')}
            >
              Open Provider Portal
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Register New Healthcare Tenant</h1>
        <p style={{ marginTop: '4px' }}>
          Onboard a clinic, nursing home, or healthcare facility to the iDEAL Care multi-tenant platform.
        </p>
      </div>

      {/* Stepper Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--bg-surface)',
          padding: '16px 24px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        {[
          { num: 1, label: 'Provider Profile', icon: <Building2 size={16} /> },
          { num: 2, label: 'Owner Account', icon: <User size={16} /> },
          { num: 3, label: 'Billing Policies', icon: <ShieldCheck size={16} /> },
          { num: 4, label: 'Plan & Review', icon: <CreditCard size={16} /> },
        ].map((s) => (
          <div
            key={s.num}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              opacity: step === s.num ? 1 : step > s.num ? 0.8 : 0.45,
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor:
                  step === s.num
                    ? 'var(--brand-primary)'
                    : step > s.num
                    ? 'var(--status-active)'
                    : 'var(--bg-surface-elevated)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.8125rem',
                border: step === s.num ? '2px solid rgba(14, 165, 233, 0.4)' : 'none',
              }}
            >
              {step > s.num ? <Check size={16} /> : s.num}
            </div>
            <span
              style={{
                fontSize: '0.875rem',
                fontWeight: step === s.num ? 700 : 500,
                color: step === s.num ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Step Content */}
      <Card>
        {/* STEP 1: Provider Profile */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>1. Healthcare Provider Details</h3>
            <p style={{ fontSize: '0.875rem', marginTop: '-12px', marginBottom: '8px' }}>
              Basic organizational profile and dedicated tenant domain resolution identifier.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Healthcare Provider / Clinic Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Grace Nursing Home"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Registered Legal Entity Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Grace Healthcare Services Ltd"
                  value={formData.legalName}
                  onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                />
              </div>
            </div>

            {/* Subdomain Input with Live Checker */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Tenant Subdomain (Domain Resolution) *</label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0,
                    fontFamily: 'var(--font-mono)',
                  }}
                  placeholder="e.g. gracecare"
                  value={formData.subdomain}
                  onChange={(e) => handleSubdomainChange(e.target.value)}
                />
                <span
                  style={{
                    padding: '10px 16px',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderLeft: 'none',
                    borderTopRightRadius: 'var(--radius-md)',
                    borderBottomRightRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  .idealcare.ng
                </span>
              </div>
              <div style={{ marginTop: '6px', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {isCheckingDomain ? (
                  <span style={{ color: 'var(--text-muted)' }}>Checking domain availability...</span>
                ) : domainAvailable === true ? (
                  <span style={{ color: 'var(--status-active)', fontWeight: 600 }}>
                    &bull; Domain available: <code>https://{fullDomain}</code>
                  </span>
                ) : domainAvailable === false ? (
                  <span style={{ color: 'var(--status-expired)', fontWeight: 600 }}>
                    &bull; Subdomain already taken. Please choose another prefix.
                  </span>
                ) : (
                  <span style={{ color: 'var(--text-muted)' }}>
                    Patients and staff will access this provider through this dedicated domain.
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Official Contact Email *</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="contact@gracecare.ng"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+234 803 000 0000"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Physical Street Address</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="14 Medical Crescent"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">City</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ikeja"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">State</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Lagos"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Primary Tenant Owner Account */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>2. Primary Tenant Administrator Account</h3>
            <p style={{ fontSize: '0.875rem', marginTop: '-12px', marginBottom: '8px' }}>
              Initial login credentials for the healthcare provider's primary owner (`TenantRole.Owner`).
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Administrator First Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Adeola"
                  value={formData.ownerFirstName}
                  onChange={(e) => setFormData({ ...formData, ownerFirstName: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Administrator Last Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Balogun"
                  value={formData.ownerLastName}
                  onChange={(e) => setFormData({ ...formData, ownerLastName: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Administrator Login Email *</label>
              <input
                type="email"
                className="form-input"
                placeholder="admin@gracecare.ng"
                value={formData.ownerEmail}
                onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Note: Administrative emails are unique per healthcare facility. This user will have primary Administrator privileges at {fullDomain}.
              </span>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Temporary Provisioning Password *</label>
              <input
                type="text"
                className="form-input"
                style={{ fontFamily: 'var(--font-mono)' }}
                value={formData.ownerPassword}
                onChange={(e) => setFormData({ ...formData, ownerPassword: e.target.value })}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                The administrator will be prompted to reset their password upon initial login.
              </span>
            </div>
          </div>
        )}

        {/* STEP 3: Operational & Financial Policies */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>3. Tenant Financial & Care Policies</h3>
            <p style={{ fontSize: '0.875rem', marginTop: '-12px', marginBottom: '8px' }}>
              Provider-level default rules for nursing-care invoices and patient intake fees.
            </p>

            <div
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <strong style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                  Nursing-Care Bills Refundable by Default
                </strong>
                <p style={{ fontSize: '0.8125rem', marginTop: '2px' }}>
                  When enabled, unspent deposit balances on patient discharge are flagged as refundable by default.
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.nursingCareBillsRefundableByDefault}
                onChange={(e) =>
                  setFormData({ ...formData, nursingCareBillsRefundableByDefault: e.target.checked })
                }
                style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--brand-primary)' }}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Mandatory Patient Registration Fee (NGN)</label>
              <input
                type="number"
                min="0"
                step="500"
                className="form-input"
                placeholder="0"
                value={formData.registrationFeeAmount}
                onChange={(e) =>
                  setFormData({ ...formData, registrationFeeAmount: Number(e.target.value) })
                }
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Charged to new patients upon intake assessment approval. Set to 0 if this provider charges no intake registration fee.
              </span>
            </div>
          </div>
        )}

        {/* STEP 4: Initial Plan Selection & Final Review */}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>4. Initial Subscription Tier & Confirmation</h3>
            <p style={{ fontSize: '0.875rem', marginTop: '-12px', marginBottom: '8px' }}>
              Select the initial subscription plan for this tenant and confirm provision details.
            </p>

            {plans.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                {plans.map((p) => {
                  const isSelected = formData.initialPlanId === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setFormData({ ...formData, initialPlanId: p.id, billingFrequency: p.billingFrequency })}
                      style={{
                        padding: '16px',
                        borderRadius: 'var(--radius-md)',
                        border: isSelected ? '2px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                        backgroundColor: isSelected ? 'var(--brand-primary-light)' : 'var(--bg-surface-elevated)',
                        cursor: 'pointer',
                        transition: 'var(--transition)',
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: isSelected ? 'var(--brand-primary)' : 'var(--text-primary)' }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '4px' }}>
                        ₦{p.price.toLocaleString()} / {p.billingFrequency === 2 ? 'yr' : 'mo'}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                <div
                  onClick={() => setFormData({ ...formData, billingFrequency: 1, initialPlanId: '' })}
                  style={{
                    padding: '18px',
                    borderRadius: 'var(--radius-md)',
                    border: formData.billingFrequency === 1 ? '2px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                    backgroundColor: formData.billingFrequency === 1 ? 'var(--brand-primary-light)' : 'var(--bg-surface-elevated)',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: formData.billingFrequency === 1 ? 'var(--brand-primary)' : 'var(--text-primary)' }}>
                    Monthly Subscription
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Standard 30-day recurring billing cycle
                  </div>
                </div>

                <div
                  onClick={() => setFormData({ ...formData, billingFrequency: 2, initialPlanId: '' })}
                  style={{
                    padding: '18px',
                    borderRadius: 'var(--radius-md)',
                    border: formData.billingFrequency === 2 ? '2px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                    backgroundColor: formData.billingFrequency === 2 ? 'var(--brand-primary-light)' : 'var(--bg-surface-elevated)',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: formData.billingFrequency === 2 ? 'var(--brand-primary)' : 'var(--text-primary)' }}>
                    Yearly Subscription
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Annual corporate billing cycle (12 months prepaid)
                  </div>
                </div>
              </div>
            )}

            {/* Summary Review Card */}
            <div
              style={{
                backgroundColor: 'var(--bg-surface-elevated)',
                borderRadius: 'var(--radius-md)',
                padding: '16px 20px',
                border: '1px solid var(--border-subtle)',
                marginTop: '10px',
              }}
            >
              <h4 style={{ fontSize: '0.9375rem', marginBottom: '12px', color: 'var(--text-primary)' }}>
                Onboarding Summary Check:
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem' }}>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Provider Name:</span>
                  <strong>{formData.name}</strong>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Dedicated Domain:</span>
                  <strong style={{ color: 'var(--brand-primary)', fontFamily: 'var(--font-mono)' }}>
                    {fullDomain}
                  </strong>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Primary Owner:</span>
                  <span>{formData.ownerFirstName} {formData.ownerLastName} ({formData.ownerEmail})</span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Registration Fee:</span>
                  <span>₦{Number(formData.registrationFeeAmount).toLocaleString()}</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '28px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          {step > 1 ? (
            <Button variant="secondary" onClick={handleBack} leftIcon={<ArrowLeft size={16} />}>
              Back
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => navigate('/tenants')}>
              Cancel
            </Button>
          )}

          {step < 4 ? (
            <Button variant="primary" onClick={handleNext} rightIcon={<ArrowRight size={16} />}>
              Next Step
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              leftIcon={<CheckCircle2 size={18} />}
            >
              Complete Provisioning
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
