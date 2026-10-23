// src/pages/audit/AuditLogsPage.tsx
import React, { useEffect, useState, useMemo } from 'react';
import {
  Search,
  Download,
  RefreshCw,
  ShieldCheck,
  Eye,
  Copy,
  Check,
  X,
  Layers,
  FileCode,
} from 'lucide-react';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { platformAuditApi, type AuditLogItem } from '../../api/platformAuditApi';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async () => {
    setIsLoading(true);
    try {
      const data = await platformAuditApi.getAuditLogs({ pageSize: 100 });
      setLogs(data.items);
    } catch {
      console.error('Failed to load platform audit logs');
    } finally {
      setIsLoading(false);
    }
  };

  // Distinct action types for the filter dropdown
  const actionTypes = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((log) => set.add(log.action));
    return Array.from(set);
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Action type filter
      if (actionFilter !== 'ALL' && log.action !== actionFilter) {
        return false;
      }

      // Keyword query filter
      if (!filterQuery.trim()) return true;
      const q = filterQuery.toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        log.resourceType.toLowerCase().includes(q) ||
        (log.resourceId && log.resourceId.toLowerCase().includes(q)) ||
        (log.tenantName && log.tenantName.toLowerCase().includes(q)) ||
        (log.actorEmail && log.actorEmail.toLowerCase().includes(q)) ||
        (log.details && log.details.toLowerCase().includes(q))
      );
    });
  }, [logs, filterQuery, actionFilter]);

  const handleCopyPayload = (payload: string) => {
    navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatKey = (key: string): string => {
    if (key === 'OwnerEmail') return 'Owner';
    if (key === 'Name') return 'Name';
    if (key === 'Domain') return 'Domain';
    if (key === 'Plan') return 'Plan';
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  const renderDetailsCell = (details: string | null | undefined, log: AuditLogItem) => {
    if (!details) {
      return <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>—</span>;
    }

    try {
      const parsed = JSON.parse(details);
      if (typeof parsed === 'object' && parsed !== null) {
        const entries = Object.entries(parsed);
        if (entries.length > 0) {
          return (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxWidth: '380px' }}>
              {entries.slice(0, 3).map(([k, v]) => (
                <span
                  key={k}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--surface-elevated)',
                    border: '1px solid var(--border)',
                    fontSize: '0.75rem',
                    lineHeight: 1.3,
                  }}
                >
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{formatKey(k)}:</span>
                  <span style={{ color: 'var(--text-h)', fontWeight: 600 }}>{String(v)}</span>
                </span>
              ))}

              {entries.length > 3 && (
                <button
                  type="button"
                  onClick={() => setSelectedLog(log)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--accent-soft)',
                    border: '1px solid var(--accent)',
                    color: 'var(--accent)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  +{entries.length - 3} more
                </button>
              )}
            </div>
          );
        }
      }
    } catch {
      // Plain string fallback
    }

    return (
      <span
        style={{
          fontSize: '0.8125rem',
          color: 'var(--text)',
          display: 'block',
          maxWidth: '360px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
        title={details}
      >
        {details}
      </span>
    );
  };

  const exportAuditCsv = () => {
    if (filteredLogs.length === 0) return;

    const headers = ['Timestamp', 'Actor', 'Tenant Context', 'Action', 'Resource', 'Details', 'Status'];
    const rows = filteredLogs.map((l) => [
      l.timestamp,
      l.actorEmail || 'System Process',
      l.tenantName || 'Platform Scope',
      l.action,
      `${l.resourceType}:${l.resourceId || ''}`,
      `"${(l.details || '').replace(/"/g, '""')}"`,
      l.status,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `idealcare-audit-trail-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-h)', letterSpacing: '-0.02em', margin: 0 }}>
            Platform Audit Trail
          </h1>
          <p style={{ marginTop: '4px', marginBottom: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Tamper-evident record of administrative mutations, security lifecycle events, and tenant operations.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="secondary" leftIcon={<RefreshCw size={15} />} onClick={loadAuditLogs} isLoading={isLoading}>
            Refresh
          </Button>
          <Button variant="secondary" leftIcon={<Download size={15} />} onClick={exportAuditCsv} disabled={filteredLogs.length === 0}>
            Export Audit
          </Button>
        </div>
      </div>

      {/* Filter Toolbar Card */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          padding: '16px 20px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
          flexWrap: 'wrap',
        }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1', minWidth: '260px' }}>
          <span
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
            }}
          >
            <Search size={16} />
          </span>
          <input
            type="text"
            className="form-input"
            style={{
              paddingLeft: '38px',
              paddingRight: filterQuery ? '36px' : '14px',
              fontSize: '0.875rem',
            }}
            placeholder="Search by action, facility, actor, or payload text..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
          />
          {filterQuery && (
            <button
              type="button"
              onClick={() => setFilterQuery('')}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
              }}
              title="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Action Type Filter Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>Action:</span>
          <select
            className="form-select"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            style={{
              padding: '9px 14px',
              fontSize: '0.875rem',
              width: 'auto',
              minWidth: '180px',
            }}
          >
            <option value="ALL">All Actions ({logs.length})</option>
            {actionTypes.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table Container */}
      <div
        className="table-container"
        style={{
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--surface)',
          boxShadow: 'var(--shadow-sm)',
          overflowX: 'auto',
        }}
      >
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: '12px' }}>
            <div className="spinner" style={{ width: '32px', height: '32px' }} />
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Retrieving audit ledger...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <ShieldCheck size={42} style={{ margin: '0 auto 12px', opacity: 0.4, color: 'var(--accent)' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-h)', marginBottom: '4px' }}>
              No Audit Records Found
            </h3>
            <p style={{ fontSize: '0.85rem', margin: 0 }}>
              {filterQuery || actionFilter !== 'ALL'
                ? 'Try adjusting your search terms or action filters.'
                : 'No administrative mutation events have been logged yet.'}
            </p>
          </div>
        ) : (
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '940px' }}>
            <thead>
              <tr>
                <th style={{ width: '150px' }}>Timestamp (UTC)</th>
                <th style={{ width: '160px' }}>Actor Admin</th>
                <th style={{ width: '150px' }}>Tenant Context</th>
                <th style={{ width: '160px' }}>Event Action</th>
                <th style={{ width: '160px' }}>Resource Target</th>
                <th>Activity Details</th>
                <th style={{ width: '90px', textAlign: 'center' }}>Status</th>
                <th style={{ width: '80px', textAlign: 'center' }}>Payload</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => {
                const dateObj = new Date(log.timestamp);
                const dateStr = dateObj.toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });
                const timeStr = dateObj.toLocaleTimeString(undefined, {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: false,
                });

                return (
                  <tr key={log.id}>
                    {/* Timestamp */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-h)' }}>
                          {dateStr}
                        </span>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            color: 'var(--text-muted)',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          {timeStr} UTC
                        </span>
                      </div>
                    </td>

                    {/* Actor Admin */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--accent-soft)',
                            color: 'var(--accent)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          A
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-h)' }}>
                            Platform Admin
                          </span>
                          {log.actorUserId && (
                            <span
                              style={{
                                fontSize: '0.7rem',
                                color: 'var(--text-muted)',
                                fontFamily: 'var(--font-mono)',
                              }}
                            >
                              #{log.actorUserId.slice(0, 8)}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Tenant Context */}
                    <td>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.8125rem',
                          color: log.tenantId ? 'var(--text-h)' : 'var(--text-muted)',
                          fontWeight: log.tenantId ? 600 : 500,
                        }}
                      >
                        <Layers size={13} style={{ color: 'var(--accent)' }} />
                        {log.tenantName || 'Platform Scope'}
                      </span>
                    </td>

                    {/* Event Action */}
                    <td>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '3px 10px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: 'var(--accent-soft)',
                          color: 'var(--accent)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                        }}
                      >
                        {log.action}
                      </span>
                    </td>

                    {/* Resource Target */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-h)' }}>
                          {log.resourceType}
                        </span>
                        {log.resourceId && (
                          <span
                            style={{
                              fontSize: '0.7rem',
                              color: 'var(--text-muted)',
                              fontFamily: 'var(--font-mono)',
                            }}
                          >
                            id: {log.resourceId.slice(0, 8)}...
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Details Column: Clean readable pills, no raw JSON */}
                    <td>
                      {renderDetailsCell(log.details, log)}
                    </td>

                    {/* Status */}
                    <td style={{ textAlign: 'center' }}>
                      <Badge variant={log.status === 'SUCCESS' ? 'active' : 'pending'}>
                        {log.status}
                      </Badge>
                    </td>

                    {/* Action: Inspect Payload */}
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedLog(log)}
                        disabled={!log.details}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--surface-elevated)',
                          border: '1px solid var(--border)',
                          color: log.details ? 'var(--text-h)' : 'var(--text-muted)',
                          cursor: log.details ? 'pointer' : 'default',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'var(--transition)',
                          opacity: log.details ? 1 : 0.4,
                        }}
                        title={log.details ? 'Inspect structured event payload' : 'No payload details'}
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Audit Payload Inspection Modal */}
      {selectedLog && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.72)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => setSelectedLog(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '560px',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              boxShadow: 'var(--shadow-lg)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '85vh',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'var(--surface-elevated)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--accent-soft)',
                    color: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FileCode size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-h)', margin: 0 }}>
                    Audit Event Payload
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Action: <strong>{selectedLog.action}</strong> &bull; {selectedLog.resourceType}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  borderRadius: '6px',
                }}
                title="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Event Metadata Card */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  padding: '14px 16px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--surface-elevated)',
                  border: '1px solid var(--border)',
                  fontSize: '0.8125rem',
                }}
              >
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>
                    Recorded Time
                  </span>
                  <span style={{ fontWeight: 600, color: 'var(--text-h)' }}>
                    {new Date(selectedLog.timestamp).toISOString().replace('T', ' ').slice(0, 19)} UTC
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>
                    Status
                  </span>
                  <Badge variant={selectedLog.status === 'SUCCESS' ? 'active' : 'pending'}>
                    {selectedLog.status}
                  </Badge>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>
                    Tenant Scope
                  </span>
                  <span style={{ fontWeight: 600, color: 'var(--text-h)' }}>
                    {selectedLog.tenantName || 'Platform Scope'}
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>
                    Resource ID
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-h)' }}>
                    {selectedLog.resourceId || '—'}
                  </span>
                </div>
              </div>

              {/* Formatted JSON payload */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-h)' }}>
                    Payload Data (JSON):
                  </span>
                  <Button
                    variant="ghost"
                    leftIcon={copied ? <Check size={14} style={{ color: 'var(--success)' }} /> : <Copy size={14} />}
                    onClick={() => handleCopyPayload(selectedLog.details || '')}
                    style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                  >
                    {copied ? 'Copied!' : 'Copy JSON'}
                  </Button>
                </div>

                <pre
                  style={{
                    backgroundColor: 'var(--surface-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    padding: '16px',
                    fontSize: '0.8rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-h)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    overflowX: 'auto',
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  {(() => {
                    try {
                      return JSON.stringify(JSON.parse(selectedLog.details || '{}'), null, 2);
                    } catch {
                      return selectedLog.details || 'No payload data';
                    }
                  })()}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '14px 24px',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'flex-end',
                backgroundColor: 'var(--surface-elevated)',
              }}
            >
              <Button variant="secondary" onClick={() => setSelectedLog(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
