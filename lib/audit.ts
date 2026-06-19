/**
 * Lightweight Audit Logging Helper
 *
 * Created 2026-06-19 in response to ChatGPT security audit (Finding #3 +
 * follow-on Agent #15 work on /api/v1/keys). This is intentionally a thin,
 * narrow-interface helper that ANY state-changing route can call without
 * needing to know about Supabase, RLS, or the cryptographic chain in
 * lib/audit-trail.ts. It is the recommended call site for route handlers.
 *
 * Differences from lib/audit-trail.ts:
 *   - No HMAC chain (audit-trail.ts handles forensic/compliance reporting).
 *   - PII safety enforced at the call site (IP truncation, email hashing).
 *   - Fail-safe: a Supabase write failure NEVER throws — we always emit the
 *     console line so the event lands in Cloudflare / Vercel logs even when
 *     the database is unreachable.
 *   - Server-side service-role client only (RLS bypass) — never importable
 *     from client components.
 *
 * --------------------------------------------------------------------------
 * SQL DDL (handoff to Agent #18 — paste into deploy-database.sql):
 * --------------------------------------------------------------------------
 *
 *   CREATE TABLE IF NOT EXISTS public.audit_events (
 *     id            uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
 *     created_at    timestamptz   NOT NULL DEFAULT now(),
 *     event         text          NOT NULL,
 *     outcome       text          NOT NULL CHECK (outcome IN ('success','failure','denied')),
 *     user_id       uuid          NULL REFERENCES auth.users(id) ON DELETE SET NULL,
 *     target_id     text          NULL,
 *     actor_ip      text          NULL,    -- truncated /24 (IPv4) or /48 (IPv6) by the app layer
 *     user_agent    text          NULL,
 *     reason        text          NULL,
 *     meta          jsonb         NOT NULL DEFAULT '{}'::jsonb
 *   );
 *
 *   CREATE INDEX IF NOT EXISTS audit_events_user_id_created_at_idx
 *     ON public.audit_events (user_id, created_at DESC);
 *   CREATE INDEX IF NOT EXISTS audit_events_event_created_at_idx
 *     ON public.audit_events (event, created_at DESC);
 *
 *   ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;
 *
 *   -- Users can read their own audit trail.
 *   CREATE POLICY "audit_events_select_own"
 *     ON public.audit_events FOR SELECT
 *     TO authenticated
 *     USING (auth.uid() = user_id);
 *
 *   -- Inserts are restricted to the service role (this module, executed
 *   -- server-side). No INSERT policy is granted to `authenticated` or `anon`.
 *   CREATE POLICY "audit_events_insert_service_role"
 *     ON public.audit_events FOR INSERT
 *     TO service_role
 *     WITH CHECK (true);
 *
 *   -- Audit events are append-only: no UPDATE or DELETE policies are granted
 *   -- to any role. (service_role bypasses RLS by definition, so admin-only
 *   -- retention jobs can still prune, but app code cannot mutate rows.)
 *
 * --------------------------------------------------------------------------
 * Required env vars:
 *   NEXT_PUBLIC_SUPABASE_URL        — Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY       — service-role key (RLS bypass, server-only)
 *
 * Both are already declared in utils/supabase/admin.ts, so no new env-var
 * wiring is required for this module.
 */

import { createHash } from 'crypto';
import { createAdminClient } from '@/utils/supabase/admin';

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

/**
 * Truncate an IPv4 address to its /24 network (drop the last octet) or an
 * IPv6 address to its /48 prefix (keep the first three hextets). Returns
 * undefined for missing / unparseable input.
 *
 * Rationale: per GDPR / CCPA guidance, the full client IP is PII; the network
 * prefix is sufficient for abuse correlation and rate-limiting forensics.
 */
export function truncateIp(input: string | undefined | null): string | undefined {
  if (!input) return undefined;
  const ip = input.trim();
  if (!ip) return undefined;

  // IPv4 (dotted-quad)
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(ip)) {
    const parts = ip.split('.');
    return `${parts[0]}.${parts[1]}.${parts[2]}.0/24`;
  }

  // IPv6 (very permissive — we just want the first three hextets)
  if (ip.includes(':')) {
    // Expand any "::" so we get a stable hextet count for the prefix.
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

  // Unknown format — drop it rather than store raw, possibly-sensitive bytes.
  return undefined;
}

/**
 * Hash an email address (or any other PII string) so the audit trail can
 * correlate events for the same identity without storing the plaintext.
 *
 * Uses SHA-256 truncated to 16 hex chars — collision-resistant enough for
 * audit correlation, short enough to be ergonomic in log lines.
 */
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

/**
 * Walk a meta object and replace any forbidden keys with a redaction marker.
 * Defense-in-depth: even if a caller forgets PII hygiene, we don't leak
 * plaintext credentials into the audit table or the log stream.
 */
function sanitizeMeta(
  meta: Record<string, unknown> | undefined
): Record<string, unknown> {
  if (!meta) return {};
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(meta)) {
    if (FORBIDDEN_META_KEYS.has(key.toLowerCase())) {
      out[key] = '[REDACTED]';
      continue;
    }
    // Recurse one level for nested objects (avoids unbounded recursion on
    // pathological inputs while still scrubbing common shapes).
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

/**
 * Log an audit event.
 *
 * Contract:
 *   - NEVER throws. If Supabase is unreachable, the event still lands in the
 *     console stream (Cloudflare / Vercel will capture it).
 *   - actorIp is auto-truncated to /24 (IPv4) or /48 (IPv6) before persistence.
 *   - meta is scrubbed of any well-known credential keys before persistence.
 *   - The plaintext audit payload is ALSO console.info'd so the event is
 *     present in two independent sinks (defense in depth against a single
 *     compromised log path).
 *
 * Returns void. Callers that need a row id should query the table directly
 * after the fact — adding a return value here would tempt callers to await
 * a database round-trip in the hot path of every state change.
 */
export async function auditLog(payload: AuditPayload): Promise<void> {
  // Build the persistence row first so we have a single sanitized object
  // that both sinks will see. PII-truncate IP, scrub meta, leave everything
  // else as the caller provided.
  const row = {
    event: payload.event,
    outcome: payload.outcome,
    user_id: payload.userId || null,
    target_id: payload.targetId || null,
    actor_ip: truncateIp(payload.actorIp) || null,
    user_agent: payload.userAgent || null,
    reason: payload.reason || null,
    meta: sanitizeMeta(payload.meta),
  };

  // Secondary sink (always emitted, even on Supabase failure). console.info
  // is the right level — audit events are operational signal, not warnings.
  // eslint-disable-next-line no-console
  console.info('[AUDIT]', JSON.stringify(row));

  // Primary sink. Wrapped in try/catch so a transient Supabase outage cannot
  // break the calling route — audit failures must not block the underlying
  // operation (per spec).
  try {
    const supabase = createAdminClient();
    // Cast to `any` for the table name because `audit_events` is not yet in
    // the generated types_db schema (Agent #18 adds the migration). Once the
    // DDL block at the top of this file lands in deploy-database.sql and
    // types are regenerated, this cast can be removed.
    const { error } = await (supabase as any)
      .from('audit_events')
      .insert([row]);
    if (error) {
       
      console.warn('[AUDIT] Supabase insert failed (event still logged to console):', error.message);
    }
  } catch (err) {
    // Catches every failure mode: missing env, network error, table-not-found,
    // RLS rejection, anything. The event has already been written to the
    // console sink above, so we silently degrade.
     
    console.warn(
      '[AUDIT] Supabase write threw (event still logged to console):',
      err instanceof Error ? err.message : String(err)
    );
  }
}

/**
 * Convenience wrapper that pulls the standard request-context fields out of
 * a Headers-shaped object. Lets route handlers write
 *
 *   await auditLog({
 *     ...auditContextFromHeaders(request.headers),
 *     event: 'key.created',
 *     userId: user.id,
 *     outcome: 'success',
 *   });
 *
 * without duplicating x-forwarded-for parsing across every handler.
 */
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
