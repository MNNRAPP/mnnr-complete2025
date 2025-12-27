/**
 * Audit Trail System with Cryptographic Integrity
 * 
 * Provides immutable audit logging with cryptographic signatures
 * for compliance, security, and forensic analysis.
 * 
 * Features:
 * - Cryptographic signing of all audit events
 * - Immutable append-only log structure
 * - Tamper detection via hash chains
 * - Compliance-ready (SOC 2, GDPR, PCI DSS)
 */

import { createClient } from '@/utils/supabase/server';
import { createHmac, randomBytes } from 'crypto';

// Audit event types
export enum AuditEventType {
  // Authentication events
  USER_LOGIN = 'user.login',
  USER_LOGOUT = 'user.logout',
  USER_REGISTER = 'user.register',
  USER_PASSWORD_CHANGE = 'user.password_change',
  USER_MFA_ENABLED = 'user.mfa_enabled',
  USER_MFA_DISABLED = 'user.mfa_disabled',
  
  // Payment events
  PAYMENT_INITIATED = 'payment.initiated',
  PAYMENT_COMPLETED = 'payment.completed',
  PAYMENT_FAILED = 'payment.failed',
  PAYMENT_REFUNDED = 'payment.refunded',
  
  // API events
  API_KEY_CREATED = 'api_key.created',
  API_KEY_REVOKED = 'api_key.revoked',
  API_REQUEST = 'api.request',
  API_ERROR = 'api.error',
  
  // Data events
  DATA_ACCESSED = 'data.accessed',
  DATA_MODIFIED = 'data.modified',
  DATA_DELETED = 'data.deleted',
  DATA_EXPORTED = 'data.exported',
  
  // Security events
  SECURITY_BREACH_ATTEMPT = 'security.breach_attempt',
  SECURITY_RATE_LIMIT_EXCEEDED = 'security.rate_limit_exceeded',
  SECURITY_SUSPICIOUS_ACTIVITY = 'security.suspicious_activity',
  
  // Admin events
  ADMIN_ACTION = 'admin.action',
  CONFIG_CHANGED = 'config.changed',
  PERMISSION_GRANTED = 'permission.granted',
  PERMISSION_REVOKED = 'permission.revoked',
}

// Audit event severity levels
export enum AuditSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

// Audit event interface
export interface AuditEvent {
  id: string;
  timestamp: string;
  eventType: AuditEventType;
  severity: AuditSeverity;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  resource?: string;
  action?: string;
  metadata?: Record<string, any>;
  previousHash?: string;
  signature?: string;
}

// Audit trail configuration
const AUDIT_SECRET = process.env.AUDIT_TRAIL_SECRET || 'change-this-in-production';
const HASH_ALGORITHM = 'sha256';

/**
 * Generate cryptographic signature for audit event
 */
function generateSignature(event: Omit<AuditEvent, 'signature'>): string {
  const payload = JSON.stringify({
    id: event.id,
    timestamp: event.timestamp,
    eventType: event.eventType,
    userId: event.userId,
    resource: event.resource,
    action: event.action,
    previousHash: event.previousHash,
  });

  const hmac = createHmac(HASH_ALGORITHM, AUDIT_SECRET);
  hmac.update(payload);
  return hmac.digest('hex');
}

/**
 * Verify audit event signature
 */
export function verifySignature(event: AuditEvent): boolean {
  const { signature, ...eventWithoutSignature } = event;
  const expectedSignature = generateSignature(eventWithoutSignature);
  return signature === expectedSignature;
}

/**
 * Get the hash of the last audit event (for chain integrity)
 */
async function getLastEventHash(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('audit_logs')
      .select('signature')
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;
    return data.signature;
  } catch (error) {
    console.error('[AUDIT] Error fetching last event hash:', error);
    return null;
  }
}

/**
 * Log an audit event with cryptographic signature
 */
export async function logAuditEvent(
  eventType: AuditEventType,
  options: {
    severity?: AuditSeverity;
    userId?: string;
    sessionId?: string;
    ipAddress?: string;
    userAgent?: string;
    resource?: string;
    action?: string;
    metadata?: Record<string, any>;
  } = {}
): Promise<AuditEvent | null> {
  try {
    const previousHash = await getLastEventHash();

    const event: Omit<AuditEvent, 'signature'> = {
      id: randomBytes(16).toString('hex'),
      timestamp: new Date().toISOString(),
      eventType,
      severity: options.severity || AuditSeverity.INFO,
      userId: options.userId,
      sessionId: options.sessionId,
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
      resource: options.resource,
      action: options.action,
      metadata: options.metadata,
      previousHash: previousHash || undefined,
    };

    const signature = generateSignature(event);
    const signedEvent: AuditEvent = { ...event, signature };

    // Store in database
    const supabase = await createClient();
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        id: signedEvent.id,
        timestamp: signedEvent.timestamp,
        event_type: signedEvent.eventType,
        severity: signedEvent.severity,
        user_id: signedEvent.userId,
        session_id: signedEvent.sessionId,
        ip_address: signedEvent.ipAddress,
        user_agent: signedEvent.userAgent,
        resource: signedEvent.resource,
        action: signedEvent.action,
        metadata: signedEvent.metadata,
        previous_hash: signedEvent.previousHash,
        signature: signedEvent.signature,
      });

    if (error) {
      console.error('[AUDIT] Error storing audit event:', error);
      return null;
    }

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[AUDIT]', {
        type: eventType,
        severity: signedEvent.severity,
        user: signedEvent.userId,
        resource: signedEvent.resource,
      });
    }

    return signedEvent;
  } catch (error) {
    console.error('[AUDIT] Error logging audit event:', error);
    return null;
  }
}

/**
 * Verify integrity of audit trail (check hash chain)
 */
export async function verifyAuditTrailIntegrity(
  startDate?: Date,
  endDate?: Date
): Promise<{
  valid: boolean;
  totalEvents: number;
  invalidEvents: string[];
  brokenChains: number;
}> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: true });

    if (startDate) {
      query = query.gte('timestamp', startDate.toISOString());
    }
    if (endDate) {
      query = query.lte('timestamp', endDate.toISOString());
    }

    const { data: events, error } = await query;

    if (error || !events) {
      throw new Error('Failed to fetch audit events');
    }

    const invalidEvents: string[] = [];
    let brokenChains = 0;
    let previousHash: string | null = null;

    for (const dbEvent of events) {
      // Convert database format to AuditEvent format
      const event: AuditEvent = {
        id: dbEvent.id,
        timestamp: dbEvent.timestamp,
        eventType: dbEvent.event_type,
        severity: dbEvent.severity,
        userId: dbEvent.user_id,
        sessionId: dbEvent.session_id,
        ipAddress: dbEvent.ip_address,
        userAgent: dbEvent.user_agent,
        resource: dbEvent.resource,
        action: dbEvent.action,
        metadata: dbEvent.metadata,
        previousHash: dbEvent.previous_hash,
        signature: dbEvent.signature,
      };

      // Verify signature
      if (!verifySignature(event)) {
        invalidEvents.push(event.id);
      }

      // Verify chain integrity
      if (previousHash && event.previousHash !== previousHash) {
        brokenChains++;
      }

      previousHash = event.signature;
    }

    return {
      valid: invalidEvents.length === 0 && brokenChains === 0,
      totalEvents: events.length,
      invalidEvents,
      brokenChains,
    };
  } catch (error) {
    console.error('[AUDIT] Error verifying audit trail:', error);
    throw error;
  }
}

/**
 * Query audit events with filters
 */
export async function queryAuditEvents(filters: {
  eventType?: AuditEventType;
  userId?: string;
  severity?: AuditSeverity;
  startDate?: Date;
  endDate?: Date;
  resource?: string;
  limit?: number;
}): Promise<AuditEvent[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false });

    if (filters.eventType) {
      query = query.eq('event_type', filters.eventType);
    }
    if (filters.userId) {
      query = query.eq('user_id', filters.userId);
    }
    if (filters.severity) {
      query = query.eq('severity', filters.severity);
    }
    if (filters.startDate) {
      query = query.gte('timestamp', filters.startDate.toISOString());
    }
    if (filters.endDate) {
      query = query.lte('timestamp', filters.endDate.toISOString());
    }
    if (filters.resource) {
      query = query.eq('resource', filters.resource);
    }
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data: events, error } = await query;

    if (error || !events) {
      throw new Error('Failed to query audit events');
    }

    return events.map(dbEvent => ({
      id: dbEvent.id,
      timestamp: dbEvent.timestamp,
      eventType: dbEvent.event_type,
      severity: dbEvent.severity,
      userId: dbEvent.user_id,
      sessionId: dbEvent.session_id,
      ipAddress: dbEvent.ip_address,
      userAgent: dbEvent.user_agent,
      resource: dbEvent.resource,
      action: dbEvent.action,
      metadata: dbEvent.metadata,
      previousHash: dbEvent.previous_hash,
      signature: dbEvent.signature,
    }));
  } catch (error) {
    console.error('[AUDIT] Error querying audit events:', error);
    return [];
  }
}

/**
 * Export audit trail for compliance reporting
 */
export async function exportAuditTrail(
  startDate: Date,
  endDate: Date,
  format: 'json' | 'csv' = 'json'
): Promise<string> {
  const events = await queryAuditEvents({ startDate, endDate });

  if (format === 'json') {
    return JSON.stringify(events, null, 2);
  }

  // CSV format
  const headers = [
    'ID',
    'Timestamp',
    'Event Type',
    'Severity',
    'User ID',
    'IP Address',
    'Resource',
    'Action',
    'Signature',
  ];

  const rows = events.map(event => [
    event.id,
    event.timestamp,
    event.eventType,
    event.severity,
    event.userId || '',
    event.ipAddress || '',
    event.resource || '',
    event.action || '',
    event.signature || '',
  ]);

  return [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');
}
