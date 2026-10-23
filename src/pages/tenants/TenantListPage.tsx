// src/pages/tenants/TenantListPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Building2, ExternalLink } from 'lucide-react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { platformTenantsApi } from '../../api/platformTenantsApi';
import type { TenantSummary } from '../../types/tenant';

export const TenantListPage: React.FC = () => {
  const navigate = useNavigate();

  const [tenants, setTenants] = useState<TenantSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');

  useEffect(() => {
    loadTenants();
  }, [statusFilter]);

  const loadTenants = async () => {
    setIsLoading(true);
    try {
      const params: { search?: string; isActive?: boolean } = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (statusFilter === 'active') params.isActive = true;
      if (statusFilter === 'suspended') params.isActive = false;

      const data = await platformTenantsApi.getTenants(params);
      setTenants(data.items);
    } catch {
      console.error('Failed to load tenants list');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadTenants();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Healthcare Tenants Directory</h1>
          <p style={{ marginTop: '4px' }}>
            Registered healthcare providers, nursing care clinics, and care facilities.
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus size={18} />}
          onClick={() => navigate('/tenants/register')}
        >
          Register New Tenant
        </Button>
      </div>

      <Card>
        {/* Search & Filter Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            marginBottom: '20px',
            flexWrap: 'wrap',
          }}
        >
          <form onSubmit={handleSearchSubmit} style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <span
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                display: 'flex',
              }}
            >
              <Search size={17} />
            </span>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '40px' }}
              placeholder="Search by clinic name, domain, city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['all', 'active', 'suspended'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setStatusFilter(filter)}
                className="btn"
                style={{
                  padding: '8px 14px',
                  fontSize: '0.8125rem',
                  backgroundColor: statusFilter === filter ? 'var(--brand-primary)' : 'var(--bg-surface-elevated)',
                  color: statusFilter === filter ? '#ffffff' : 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Table View */}
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
            <div className="spinner" style={{ width: '28px', height: '28px' }} />
          </div>
        ) : tenants.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
            <Building2 size={36} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
            <p>No healthcare tenants found matching your filter criteria.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Healthcare Provider</th>
                  <th>Domain Address</th>
                  <th>Location</th>
                  <th>Subscription</th>
                  <th>Status</th>
                  <th>Onboarded</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.name}</div>
                      {row.legalName && row.legalName !== row.name && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.legalName}</div>
                      )}
                    </td>
                    <td>
                      <a
                        href={`https://${row.domain}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color: 'var(--brand-primary)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.8125rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        {row.domain}
                        <ExternalLink size={12} />
                      </a>
                    </td>
                    <td>
                      {[row.city, row.state].filter(Boolean).join(', ') || '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                          {row.currentPlanName || 'Standard Monthly'}
                        </span>
                        {row.subscriptionStatus && (
                          <Badge
                            variant={
                              row.subscriptionStatus.toLowerCase() === 'active'
                                ? 'active'
                                : row.subscriptionStatus.toLowerCase().includes('pending')
                                ? 'pending'
                                : 'expired'
                            }
                            className="text-xs"
                          >
                            {row.subscriptionStatus === 'PendingPayment' ? 'Pending Payment' : row.subscriptionStatus}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td>
                      <Badge variant={row.isActive ? 'active' : 'suspended'}>
                        {row.isActive ? 'Active' : 'Suspended'}
                      </Badge>
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      {new Date(row.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Button
                        variant="secondary"
                        style={{ padding: '6px 12px', fontSize: '0.8125rem' }}
                        onClick={() => navigate(`/tenants/${row.id}`)}
                      >
                        Manage
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
