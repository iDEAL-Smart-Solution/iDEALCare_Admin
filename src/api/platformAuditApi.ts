// src/api/platformAuditApi.ts
import apiClient from '../lib/apiClient';

export interface AuditLogDto {
  id: string;
  tenantId: string | null;
  actorUserId: string | null;
  action: string;
  resourceType: string;
  resourceId: string | null;
  previousValue: string | null;
  newValue: string | null;
  occurredAt: string;
  ipAddress: string | null;
}

export interface AuditLogPage {
  items: AuditLogDto[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export interface AuditLogItem {
  id: string;
  tenantId?: string | null;
  tenantName?: string;
  actorUserId?: string | null;
  actorEmail?: string;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  timestamp: string;
  details?: string | null;
  status: string;
}

export const platformAuditApi = {
  async getAuditLogs(params?: {
    tenantId?: string;
    resourceType?: string;
    from?: string;
    to?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ items: AuditLogItem[]; totalCount: number }> {
    const response = await apiClient.get<AuditLogPage>(
      '/api/platform/audit-logs',
      { params }
    );

    const items: AuditLogItem[] = (response.data.items || []).map((row) => ({
      id: row.id,
      tenantId: row.tenantId,
      tenantName: row.tenantId ? `Tenant ${row.tenantId.slice(0, 8)}` : 'Platform Scope',
      actorUserId: row.actorUserId,
      actorEmail: row.actorUserId ? `User ${row.actorUserId.slice(0, 8)}` : 'System Process',
      action: row.action,
      resourceType: row.resourceType,
      resourceId: row.resourceId,
      timestamp: row.occurredAt,
      details: row.newValue || row.previousValue || null,
      status: 'SUCCESS',
    }));

    return {
      items,
      totalCount: response.data.totalCount,
    };
  },
};
