/**
 * Lightweight Audit Logging Helper — Clerk + Prisma (post-Supabase migration 2026-06-19).
 *
 * Migrated 2026-06-19: the prior version wrote to Supabase via createAdminClient().
 * We now write to the Neon `audit_events` table via Prisma's AuditEvent model.
 *
 * Contract (unchanged):
 *   - NEVER throws. DB failures fall back to console-only.
 *   - actorIp is auto-truncated to /24 (IPv4) or /48 (IPv6) before persistence.
 *   - meta is scrubbed of well-known credential keys.
 *   - Plaintext audit payload is also console.info'd (two independent sinks).
 *
 * Differences from lib/audit-trail.ts:
 *   - No HMAC chain (audit-trail.ts handles forensic / compliance reporting).
 *   - PII safety enforced at the call site.
 *   - Fail-safe: a DB failure NEVER throws.
 */

import { createHash } from 'crypto';
import { db } from './db';

// --------------------------------------------------------------------------
// Public types
// --------------------------------------------------------------------------

export type AuditEvent =
  | 'key.created'
  | 'key.viewed'
  | 'key.revoked'
  | 'key.rotated'
  | 'auth.failed'
  | 'payment.attempted'
  | 'payment.completed'
  | 'newsletter.subscribed'
  | 'admin.action';

export type AuditOutcome = 'success' | 'failure' | 'denied';

export interface AuditPayload {
  event: AuditEvent;
  userId?: string;
  targetId?: string;
  actorIp?: string;
  userAgent?: string;
  meta?: Record<string, unknown>;
  outcome: AuditOutcome;
  reason?: string;
}

// --------------------------------------------------------------------------
// PII-safety helpers
// --------------------------------------------------------------------------

export function truncateIp(input: string | undefined | null): string | undefined {
  if (!input) return undefined;
  const ip = input.trim();
  if (!ip) return undefined;

  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(ip)) {
    const parts = ip.split('.');
    return `${parts[0]}.${parts[1]}.${parts[2]}.0/24`;
  }

  if (ip.includes(':')) {
    const expanded = (() => {
      if (!ip.includes('::')) return ip.split(':');
      const [left, right] = ip.split('::');
      const leftParts = left ? left.split(':') : [];
      const rightParts = right ? right.split(':') : [];
      const fill = Array(8 - leftParts.length - rightParts.length).fill('0');
      return [...leftParts, ...fill, ...rightParts];
    })();
    const prefix = expanded.slice(0, 3).join(':');
    return `${prefix}::/48`;
  }

  return undefined;
}

export function hashPii(input: string | undefined | null): string | undefined {
  if (!input) return undefined;
  return createHash('sha256').update(input).digest('hex').slice(0, 16);
}

// --------------------------------------------------------------------------
// Internal sanitization — never log API keys, passwords, or raw secrets
// --------------------------------------------------------------------------

const FORBIDDEN_META_KEYS = new Set([
  'apiKey',
  'api_key',
  'apikey',
  'password',
  'secret',
  'token',
  'authorization',
  'cookie',
  'set-cookie',
  'stripe_secret',
  'service_role_key',
]);

function sanitizeMeta(
  meta: Record<string, unknown> | undefined,
): Record<string, unknown> {
  if (!meta) return {};
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(meta)) {
    if (FORBIDDEN_META_KEYS.has(key.toLowerCase())) {
      out[key] = '[REDACTED]';
      continue;
    }
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const inner = value as Record<string, unknown>;
      const cleaned: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(inner)) {
        cleaned[k] = FORBIDDEN_META_KEYS.has(k.toLowerCase()) ? '[REDACTED]' : v;
      }
      out[key] = cleaned;
    } else {
      out[key] = value;
    }
  }
  return out;
}

// --------------------------------------------------------------------------
// Public API
// --------------------------------------------------------------------------

export async function auditLog(payload: AuditPayload): Promise<void> {
  const row = {
    event: payload.event,
    outcome: payload.outcome,
    userId: payload.userId || null,
    targetId: payload.targetId || null,
    actorIp: truncateIp(payload.actorIp) || null,
    userAgent: payload.userAgent || null,
    reason: payload.reason || null,
    meta: sanitizeMeta(payload.meta) as object,
  };

  // eslint-disable-next-line no-console
  console.info('[AUDIT]', JSON.stringify(row));

  try {
    await db.auditEvent.create({ data: row });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(
      '[AUDIT] Prisma write threw (event still logged to console):',
      err instanceof Error ? err.message : String(err),
    );
  }
}

export function auditContextFromHeaders(headers: Headers): {
  actorIp: string | undefined;
  userAgent: string | undefined;
} {
  const forwarded = headers.get('x-forwarded-for');
  return {
    actorIp: forwarded ? forwarded.split(',')[0]!.trim() : undefined,
    userAgent: headers.get('user-agent') || undefined,
  };
}
