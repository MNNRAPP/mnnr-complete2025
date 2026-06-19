/**
 * CSP Violation Report Endpoint
 * POST /api/csp-report
 *
 * Owned by: Agent #6 (Finding #6 — ChatGPT 2026-06-19 audit).
 *
 * Receives Content-Security-Policy `report-uri` payloads from user agents
 * when an inline script/style/connect/etc. violates the policy emitted by
 * middleware.ts. Read-only — logs to stderr (picked up by the platform's
 * log pipeline) and returns 204. No DB write, no auth.
 *
 * Browsers send either:
 *   - the legacy `application/csp-report` envelope:
 *       { "csp-report": { "document-uri": ..., "violated-directive": ..., ... } }
 *   - the newer `application/reports+json` envelope (Reporting API):
 *       [{ "type": "csp-violation", "body": { ... } }, ...]
 *
 * We accept both. We do NOT echo the payload back in the response (would
 * itself be a leak vector) and we cap stored size to mitigate log flooding.
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// Hard cap on logged payload size — defends against attackers spraying us
// with megabyte reports to inflate logs / bill.
const MAX_REPORT_BYTES = 8 * 1024;

interface LegacyCspReport {
  'csp-report'?: {
    'document-uri'?: string;
    'violated-directive'?: string;
    'effective-directive'?: string;
    'blocked-uri'?: string;
    'source-file'?: string;
    'line-number'?: number;
    'column-number'?: number;
    'status-code'?: number;
    'script-sample'?: string;
    referrer?: string;
    disposition?: string;
  };
}

interface ReportingApiEntry {
  type?: string;
  age?: number;
  url?: string;
  user_agent?: string;
  body?: Record<string, unknown>;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const raw = await request.text();
    if (!raw) {
      return new NextResponse(null, { status: 204 });
    }
    const truncated = raw.length > MAX_REPORT_BYTES ? raw.slice(0, MAX_REPORT_BYTES) : raw;

    let parsed: LegacyCspReport | ReportingApiEntry[] | null = null;
    try {
      parsed = JSON.parse(truncated);
    } catch {
      // Malformed — log and 204; do not 4xx, browsers retry aggressively.
      console.warn('[csp-report] non-JSON payload', { len: raw.length });
      return new NextResponse(null, { status: 204 });
    }

    const violations: Array<Record<string, unknown>> = [];
    if (Array.isArray(parsed)) {
      for (const entry of parsed) {
        if (entry?.type === 'csp-violation' && entry.body) {
          violations.push(entry.body);
        }
      }
    } else if (parsed && typeof parsed === 'object' && 'csp-report' in parsed) {
      const r = (parsed as LegacyCspReport)['csp-report'];
      if (r) violations.push(r);
    }

    for (const v of violations) {
      // Single-line structured log so platform log search can grep by field.
      console.warn(
        '[csp-violation]',
        JSON.stringify({
          ts: new Date().toISOString(),
          ua: request.headers.get('user-agent') ?? null,
          ip:
            request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
            request.headers.get('x-real-ip') ??
            null,
          documentUri: v['document-uri'] ?? v['documentURL'] ?? null,
          directive: v['violated-directive'] ?? v['effectiveDirective'] ?? null,
          blockedUri: v['blocked-uri'] ?? v['blockedURL'] ?? null,
          sourceFile: v['source-file'] ?? v['sourceFile'] ?? null,
          lineNumber: v['line-number'] ?? v['lineNumber'] ?? null,
          sample: v['script-sample'] ?? v['sample'] ?? null,
          disposition: v['disposition'] ?? null,
        })
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    // Never 5xx a report endpoint — browsers will retry and amplify load.
    console.error('[csp-report] handler error', err instanceof Error ? err.message : err);
    return new NextResponse(null, { status: 204 });
  }
}

// Explicit OPTIONS so a misbehaving browser preflight doesn't 405 + retry.
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      Allow: 'POST, OPTIONS',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
