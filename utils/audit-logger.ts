/**
 * Enterprise Audit Logging System
 * Tracks all security-relevant events for compliance (SOC 2, GDPR, etc.)
 */

import { createClient } from '@/utils/supabase/server';
import { logger } from '@/utils/logger';

export enum AuditEventType {
  // Authentication Events
  USER_LOGIN = 'user.login',
  USER_LOGOUT = 'user.logout',
  USER_SIGNUP = 'user.signup',
  PASSWORD_CHANGE = 'user.password_change',
  PASSWORD_RESET_REQUEST = 'user.password_reset_request',
  PASSWORD_RESET_COMPLETE = 'user.password_reset_complete',
  MFA_ENABLED = 'user.mfa_enabled',
  MFA_DISABLED = 'user.mfa_disabled',
  MFA_VERIFIED = 'user.mfa_verified',

  // Authorization Events
  ACCESS_DENIED = 'access.denied',
  PERMISSION_CHANGED = 'permission.changed',
  ROLE_ASSIGNED = 'role.assigned',

  // Data Events
  DATA_ACCESSED = 'data.accessed',
  DATA_CREATED = 'data.created',
  DATA_UPDATED = 'data.updated',
  DATA_DELETED = 'data.deleted',
  DATA_EXPORTED = 'data.exported',

  // Payment Events
  SUBSCRIPTION_CREATED = 'subscription.created',
  SUBSCRIPTION_UPDATED = 'subscription.updated',
  SUBSCRIPTION_CANCELLED = 'subscription.cancelled',
  PAYMENT_SUCCESS = 'payment.success',
  PAYMENT_FAILED = 'payment.failed',

  // Security Events
  SECURITY_ALERT = 'security.alert',
  RATE_LIMIT_EXCEEDED = 'security.rate_limit_exceeded',
  SUSPICIOUS_ACTIVITY = 'security.suspicious_activity',
  FAILED_LOGIN = 'security.failed_login',
  ACCOUNT_LOCKED = 'security.account_locked',

  // API Events
  API_KEY_CREATED = 'api.key_created',
  API_KEY_REVOKED = 'api.key_revoked',
  WEBHOOK_FAILED = 'api.webhook_failed',

  // Admin Events
  ADMIN_ACTION = 'admin.action',
  CONFIG_CHANGED = 'admin.config_changed',
  USER_IMPERSONATED = 'admin.user_impersonated'
}

export interface AuditLogEntry {
  id?: string;
  timestamp: string;
  event_type: AuditEventType;
  user_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  resource_type?: string;
  resource_id?: string;
  action: string;
  status: 'success' | 'failure' | 'error';
  metadata?: Record<string, any>;
  error_message?: string;
}

/**
 * Create audit log table (run this migration):
 *
 * CREATE TABLE audit_logs (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 *   event_type TEXT NOT NULL,
 *   user_id UUID REFERENCES auth.users(id),
 *   ip_address INET,
 *   user_agent TEXT,
 *   resource_type TEXT,
 *   resource_id TEXT,
 *   action TEXT NOT NULL,
 *   status TEXT NOT NULL CHECK (status IN ('success', 'failure', 'error')),
 *   metadata JSONB,
 *   error_message TEXT
 * );
 *
 * CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
 * CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
 * CREATE INDEX idx_audit_logs_event_type ON audit_logs(event_type);
 * CREATE INDEX idx_audit_logs_status ON audit_logs(status);
 */

/**
 * Log an audit event
 */
export async function logAuditEvent(
  eventType: AuditEventType,
  options: {
    userId?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    resourceType?: string;
    resourceId?: string;
    action: string;
    status: 'success' | 'failure' | 'error';
    metadata?: Record<string, any>;
    errorMessage?: string;
  }
): Promise<void> {
  const entry: AuditLogEntry = {
    timestamp: new Date().toISOString(),
    event_type: eventType,
    user_id: options.userId || null,
    ip_address: options.ipAddress || null,
    user_agent: options.userAgent || null,
    resource_type: options.resourceType,
    resource_id: options.resourceId,
    action: options.action,
    status: options.status,
    metadata: options.metadata,
    error_message: options.errorMessage
  };

  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('audit_logs')
      .insert([entry]);

    if (error) {
      // Log to error tracking but don't fail the operation
      logger.error('Failed to write audit log', error, { entry });
    }
  } catch (error) {
    logger.error('Audit logging system error', error);
  }
}

/**
 * Helper to get client info from request
 */
export function getClientInfo(request: Request): {
  ipAddress: string | null;
  userAgent: string | null;
} {
  const ipAddress =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    null;

  const userAgent = request.headers.get('user-agent') || null;

  return { ipAddress, userAgent };
}

/**
 * Query audit logs for a user
 */
export async function getUserAuditLogs(
  userId: string,
  options?: {
    limit?: number;
    offset?: number;
    eventType?: AuditEventType;
    startDate?: Date;
    endDate?: Date;
  }
) {
  const supabase = createClient();

  let query = supabase
    .from('audit_logs')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false });

  if (options?.eventType) {
    query = query.eq('event_type', options.eventType);
  }

  if (options?.startDate) {
    query = query.gte('timestamp', options.startDate.toISOString());
  }

  if (options?.endDate) {
    query = query.lte('timestamp', options.endDate.toISOString());
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) {
    logger.error('Failed to query audit logs', error);
    throw new Error('Unable to fetch audit logs');
  }

  return data;
}

/**
 * Query security events for monitoring
 */
export async function getSecurityEvents(options?: {
  limit?: number;
  severity?: 'high' | 'medium' | 'low';
  hours?: number;
}) {
  const supabase = createClient();

  const securityEventTypes = [
    AuditEventType.SECURITY_ALERT,
    AuditEventType.RATE_LIMIT_EXCEEDED,
    AuditEventType.SUSPICIOUS_ACTIVITY,
    AuditEventType.FAILED_LOGIN,
    AuditEventType.ACCOUNT_LOCKED
  ];

  let query = supabase
    .from('audit_logs')
    .select('*')
    .in('event_type', securityEventTypes)
    .order('timestamp', { ascending: false });

  if (options?.hours) {
    const since = new Date(Date.now() - options.hours * 60 * 60 * 1000);
    query = query.gte('timestamp', since.toISOString());
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    logger.error('Failed to query security events', error);
    throw new Error('Unable to fetch security events');
  }

  return data;
}

/**
 * Export audit logs for compliance (CSV format)
 */
export async function exportAuditLogs(
  startDate: Date,
  endDate: Date,
  userId?: string
): Promise<string> {
  const supabase = createClient();

  let query = supabase
    .from('audit_logs')
    .select('*')
    .gte('timestamp', startDate.toISOString())
    .lte('timestamp', endDate.toISOString())
    .order('timestamp', { ascending: true });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;

  if (error) {
    logger.error('Failed to export audit logs', error);
    throw new Error('Unable to export audit logs');
  }

  // Convert to CSV
  const headers = [
    'Timestamp',
    'Event Type',
    'User ID',
    'IP Address',
    'Action',
    'Status',
    'Resource Type',
    'Resource ID'
  ];

  const rows = data.map(log => [
    log.timestamp,
    log.event_type,
    log.user_id || '',
    log.ip_address || '',
    log.action,
    log.status,
    log.resource_type || '',
    log.resource_id || ''
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csv;
}
