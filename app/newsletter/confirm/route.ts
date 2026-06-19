/**
 * Newsletter double opt-in confirmation endpoint
 *
 * Companion to app/api/newsletter/route.ts (SEC-FIX 2026-06-19, Finding #8).
 *
 * Threat model considerations:
 *   - The token is a 256-bit random hex string (see randomBytes(32) in the POST
 *     handler), so brute-force is infeasible. We still rate-limit per-IP to
 *     reduce the value of an automated scraping attack against any leaked
 *     tokens.
 *   - The response is intentionally generic. We do NOT reveal whether the
 *     token was: (a) unknown, (b) expired, (c) already-confirmed, or
 *     (d) valid-and-flipped. All four paths return the same 200-OK message.
 *     This stops confirmation-link enumeration probes.
 *   - The token is cleared on successful confirmation, making the link
 *     single-use. A second click returns the same generic message (path c).
 *   - The status flip is performed inside a Prisma updateMany WHERE-guarded
 *     by `status: 'pending'` so that a confirmed row cannot be flipped back
 *     to confirmed (idempotent + clobber-safe under concurrent clicks).
 */

import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { enforceRateLimit, RateLimits, getActorIp } from '@/lib/rate-limit';
import { auditLog, auditContextFromHeaders, hashPii } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const GENERIC_OK_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MNNR Newsletter</title>
  <style>
    body { margin: 0; padding: 0; background: #0a0a0a; color: #e5e7eb;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .card { max-width: 520px; padding: 40px; border: 1px solid rgba(16, 185, 129, 0.2);
      border-radius: 16px; background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(6, 78, 59, 0.08) 100%);
      text-align: center; }
    h1 { color: #10b981; margin: 0 0 16px 0; font-size: 28px; }
    p { color: #d1d5db; font-size: 16px; line-height: 1.6; margin: 0 0 8px 0; }
    a { color: #10b981; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Subscription confirmed or expired.</h1>
    <p>Thank you for your interest in MNNR.</p>
    <p style="margin-top: 24px;"><a href="https://mnnr.app/">Return to mnnr.app</a></p>
  </div>
</body>
</html>`;

function genericOk(): NextResponse {
  return new NextResponse(GENERIC_OK_HTML, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    },
  });
}

export async function GET(request: NextRequest) {
  const actorIp = getActorIp(request);
  const ctx = auditContextFromHeaders(request.headers);

  // ----- 1. Rate limit per-IP -----
  // Re-use the NEWSLETTER preset (3 per 10 min, fail-closed). Confirmation
  // clicks are infrequent in normal flow; this is generous for legitimate
  // users and tight enough to discourage automated probing.
  const rl = await enforceRateLimit({
    ...RateLimits.NEWSLETTER,
    key: actorIp,
    route: '/newsletter/confirm',
    dimension: 'ip',
    actorIp,
  });
  if (!rl.allowed) {
    return NextResponse.json(
      {
        error: 'rate_limited',
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((rl.resetAt - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil((rl.resetAt - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  // ----- 2. Parse token -----
  const token = request.nextUrl.searchParams.get('token');
  if (!token || typeof token !== 'string' || token.length < 32 || token.length > 256) {
    await auditLog({
      event: 'newsletter.subscribed',
      outcome: 'denied',
      reason: 'confirm_token_missing_or_malformed',
      actorIp,
      userAgent: ctx.userAgent,
      meta: { stage: 'confirm_parse' },
    });
    return genericOk();
  }

  try {
    // ----- 3. Lookup -----
    const row = await db.newsletterSubscriber.findUnique({
      where: { confirmationToken: token },
    });

    if (!row) {
      await auditLog({
        event: 'newsletter.subscribed',
        outcome: 'denied',
        reason: 'confirm_token_unknown',
        actorIp,
        userAgent: ctx.userAgent,
        meta: { stage: 'confirm_lookup' },
      });
      return genericOk();
    }

    const emailHash = hashPii(row.email) || row.emailHash || 'unknown';

    // Already confirmed (idempotent — a second click on a stale-but-uncleared
    // link path). Should not happen because we clear the token on confirm, but
    // defense-in-depth.
    if (row.status === 'confirmed') {
      await auditLog({
        event: 'newsletter.subscribed',
        outcome: 'success',
        actorIp,
        userAgent: ctx.userAgent,
        meta: { email_hash: emailHash, branch: 'confirm_already_confirmed' },
      });
      return genericOk();
    }

    if (row.status === 'unsubscribed') {
      await auditLog({
        event: 'newsletter.subscribed',
        outcome: 'denied',
        reason: 'confirm_unsubscribed_user',
        actorIp,
        userAgent: ctx.userAgent,
        meta: { email_hash: emailHash, branch: 'confirm_unsubscribed' },
      });
      return genericOk();
    }

    // Expired?
    const expiresAt = row.confirmationTokenExpiresAt;
    if (!expiresAt || expiresAt.getTime() <= Date.now()) {
      await auditLog({
        event: 'newsletter.subscribed',
        outcome: 'denied',
        reason: 'confirm_token_expired',
        actorIp,
        userAgent: ctx.userAgent,
        meta: { email_hash: emailHash, branch: 'confirm_expired' },
      });
      return genericOk();
    }

    // ----- 4. Flip status (WHERE-guarded so concurrent clicks can't fight) ---
    const update = await db.newsletterSubscriber.updateMany({
      where: {
        confirmationToken: token,
        status: 'pending',
      },
      data: {
        status: 'confirmed',
        confirmedAt: new Date(),
        confirmationToken: null,
        confirmationTokenExpiresAt: null,
      },
    });

    if (update.count === 0) {
      // Someone else won the race (or status changed between lookup + update).
      // Treat as success-equivalent — the user's intent is satisfied either way.
      await auditLog({
        event: 'newsletter.subscribed',
        outcome: 'success',
        actorIp,
        userAgent: ctx.userAgent,
        meta: { email_hash: emailHash, branch: 'confirm_race_noop' },
      });
      return genericOk();
    }

    await auditLog({
      event: 'newsletter.subscribed',
      outcome: 'success',
      actorIp,
      userAgent: ctx.userAgent,
      meta: { email_hash: emailHash, branch: 'confirm_flipped' },
    });
    return genericOk();
  } catch (err) {
     
    console.error('[newsletter/confirm] persistence error', err);
    await auditLog({
      event: 'newsletter.subscribed',
      outcome: 'failure',
      reason: 'confirm_db_error',
      actorIp,
      userAgent: ctx.userAgent,
      meta: {
        stage: 'confirm_flip',
        error: err instanceof Error ? err.message : String(err),
      },
    });
    // Still return generic OK — never leak infra status via the public surface.
    return genericOk();
  }
}
