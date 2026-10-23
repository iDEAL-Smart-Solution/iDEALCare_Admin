// src/pages/dashboard/DashboardPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  UserPlus,
  ShieldCheck,
  Calendar,
  Layers,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { MetricCard } from '../../components/MetricCard';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { platformDashboardApi, type PlatformDashboardMetrics } from '../../api/platformDashboardApi';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<PlatformDashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await platformDashboardApi.getOverview();
      setMetrics(data);
    } catch {
      setError('Could not load telemetry from the backend service. Ensure backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const formatCurrency = (val: number) => {
    return `₦${val.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Page Title & Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.025em' }}>
            Platform Overview
          </h1>
          <p style={{ marginTop: '4px', fontSize: '0.9375rem' }}>
            Live system telemetry, registered healthcare tenants, and subscription metrics.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Button
            variant="secondary"
            leftIcon={<RefreshCw size={17} />}
            onClick={fetchOverview}
            disabled={isLoading}
          >
            Refresh
          </Button>
          <Button
            variant="secondary"
            leftIcon={<Layers size={17} />}
            onClick={() => navigate('/plans')}
          >
            Manage Plans
          </Button>
          <Button
            variant="primary"
            leftIcon={<UserPlus size={17} />}
            onClick={() => navigate('/tenants/register')}
          >
            Register New Tenant
          </Button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ justifyContent: 'space-between' }}>
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={fetchOverview}>Retry</Button>
        </div>
      )}

      {metrics && metrics.expiringInSevenDays > 0 && (
        <div className="banner banner-warning" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={18} />
            <span>
              Your healthcare tenant subscriptions have expiring accounts. <a href="#" onClick={(e) => { e.preventDefault(); navigate('/subscriptions'); }}>Renew</a>
            </span>
          </div>
        </div>
      )}

      {/* KPI Cards Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
        }}
      >
        <MetricCard
          label="Total Active Tenants"
          value={isLoading ? '...' : (metrics?.totalActiveTenants ?? 0).toString()}
          change="Live database count"
          isPositive={true}
          icon={<Building2 size={20} />}
          description="Operational clinics"
        />
        <MetricCard
          label="Monthly Recurring Revenue"
          value={isLoading ? '...' : formatCurrency(metrics?.monthlyRecurringRevenue ?? 0)}
          change="Normalized MRR"
          isPositive={true}
          icon={<TrendingUp size={20} />}
          description="Subscription revenue"
        />
        <MetricCard
          label="Active Subscriptions"
          value={isLoading ? '...' : (metrics?.activeSubscriptions ?? 0).toString()}
          change="Paid active tenants"
          isPositive={true}
          icon={<CreditCard size={20} />}
          description="Monthly & Yearly plans"
        />
        <MetricCard
          label="Expiring in 7 Days"
          value={isLoading ? '...' : (metrics?.expiringInSevenDays ?? 0).toString()}
          change="Renewal required"
          isPositive={(metrics?.expiringInSevenDays ?? 0) === 0}
          icon={<AlertTriangle size={20} />}
          description="Pending renewal notice"
        />
      </div>

      {/* Quick Status Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Recent Tenants */}
        <Card
          title="Recent Healthcare Tenants"
          subtitle="Live registered providers from backend database"
          action={
            <Button
              variant="ghost"
              style={{ fontSize: '0.8125rem', padding: '4px 8px' }}
              rightIcon={<ArrowRight size={14} />}
              onClick={() => navigate('/tenants')}
            >
              View All
            </Button>
          }
        >
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <div className="spinner" style={{ width: '28px', height: '28px' }} />
            </div>
          ) : !metrics?.recentTenants || metrics.recentTenants.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
              <p>No tenants registered in the database yet.</p>
              <Button
                variant="primary"
                size="sm"
                style={{ marginTop: '12px' }}
                onClick={() => navigate('/tenants/register')}
              >
                Register First Tenant
              </Button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {metrics.recentTenants.map((tenant) => (
                <div
                  key={tenant.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate(`/tenants/${tenant.id}`)}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                      {tenant.name}
                    </div>
                    <div style={{ fontSize: '0.78125rem', color: 'var(--brand-primary)', fontFamily: 'var(--font-mono)' }}>
                      {tenant.domain}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      {tenant.currentPlanName || 'No Active Plan'}
                    </span>
                    <Badge variant={tenant.isActive ? 'active' : 'suspended'}>
                      {tenant.subscriptionStatus || (tenant.isActive ? 'Active' : 'Suspended')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Platform Compliance & Health */}
        <Card
          title="Platform Governance & Invariants"
          subtitle="Enforced platform safety standards"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ color: 'var(--status-active)', marginTop: '2px' }}>
                <ShieldCheck size={20} />
              </div>
              <div>
                <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>Tenant Data Isolation</strong>
                <p style={{ fontSize: '0.8125rem', marginTop: '2px' }}>
                  Each provider is strictly data-isolated via global EF Core filters. Cross-tenant leakage is blocked at the database engine level.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ color: 'var(--brand-primary)', marginTop: '2px' }}>
                <Calendar size={20} />
              </div>
              <div>
                <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>Scheduled Plan Transitions</strong>
                <p style={{ fontSize: '0.8125rem', marginTop: '2px' }}>
                  Plan changes (Monthly ↔ Yearly) are queued in the background and only activate at current paid period expiration.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ color: 'var(--status-pending)', marginTop: '2px' }}>
                <AlertTriangle size={20} />
              </div>
              <div>
                <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>Data Preservation Guarantee</strong>
                <p style={{ fontSize: '0.8125rem', marginTop: '2px' }}>
                  Subscription expiry restricts operational writes, but patient profiles, clinical care records, and medical documents are preserved permanently.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
