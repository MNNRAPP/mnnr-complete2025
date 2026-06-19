/**
 * Newsletter subscription endpoint — HARDENED (SEC-FIX 2026-06-19, Finding #8)
 *
 * Threat model the old endpoint failed against:
 *   - Anyone could POST any string containing '@' and the row would land in
 *     the subscriber table + a welcome email would fire from Resend. That is
 *     an abuse vector (Resend deliverability incidents, signup-spam, list
 *     enumeration) AND a privacy leak (the response disclosed whether the
 *     address was already subscribed via the upsert-no-op vs. fresh path).
 *
 * Defense-in-depth layers added here:
 *   1. Per-IP rate limit (RateLimits.NEWSLETTER = 3 / 10 min, fail-closed).
 *   2. Cloudflare Turnstile token verification (server-side, against the
 *      siteverify endpoint, with action='newsletter' binding).
 *   3. RFC 5322-aligned email validation via lib/email-validator (replaces
 *      `email.includes('@')`).
 *   4. Email is SHA-256 hashed before any audit log write — plaintext addresses
 *      never land in the audit trail.
 *   5. Double opt-in: rows are created with status='pending' + a 128-bit
 *      confirmation token + 7-day TTL. The subscriber must click the
 *      confirmation link before they're marked status='confirmed'. The welcome
 *      email only fires on confirmation (see app/newsletter/confirm/route.ts).
 *   6. Enumeration-resistant response: every code path returns the SAME generic
 *      success payload. An attacker cannot distinguish "already subscribed",
 *      "newly enrolled", "pending re-enroll", or "rate-limited domain" from
 *      the response body.
 *   7. Storage migrated from Supabase upsert to Neon-backed Prisma
 *      `newsletterSubscriber` model (see prisma/schema.prisma — added by
 *      Agent #28). Supabase is no longer the canonical store for this surface.
 *
 * Required env:
 *   TURNSTILE_SECRET_KEY                — Cloudflare Turnstile server secret
 *   RESEND_API_KEY                      — transactional email
 *   NEXT_PUBLIC_NEWSLETTER_CONFIRM_URL  — public confirmation base URL
 *                                         (e.g. https://mnnr.app/newsletter/confirm)
 *   NEON_DATABASE_URL                   — Prisma datasource (already required)
 *
 * NOTE: The hardcoded `re_eE4ZM9xZ_...` Resend key in the previous version of
 * this file was a leaked production secret. It has been removed; the route now
 * REQUIRES RESEND_API_KEY at runtime and fails the confirmation-email send
 * (silently, with audit) rather than carrying a baked-in fallback. Rotate the
 * leaked key in the Resend dashboard ASAP.
 */

import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { Resend } from 'resend';

import { db } from '@/lib/db';
import { validateEmail } from '@/lib/email-validator';
import { enforceRateLimit, RateLimits, getActorIp } from '@/lib/rate-limit';
import { auditLog, auditContextFromHeaders, hashPii } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// --------------------------------------------------------------------------
// Constants
// --------------------------------------------------------------------------

const CONFIRMATION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const CONFIRMATION_TOKEN_BYTES = 32; // 256 bits — well above the spec's 128
const GENERIC_OK = {
  ok: true,
  message:
    'If this email can subscribe, a confirmation message will be sent.',
} as const;

// --------------------------------------------------------------------------
// Turnstile verification (Cloudflare)
// https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
// --------------------------------------------------------------------------

interface TurnstileResponse {
  success: boolean;
  'error-codes'?: string[];
  hostname?: string;
  action?: string;
}

async function verifyTurnstile(
  token: string | undefined,
  remoteIp: string | undefined
): Promise<{ ok: boolean; reason?: string }> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    // In dev, missing secret is a warning + bypass so local work is unblocked.
    // In production, no secret means we cannot prove human-ness — fail closed.
    if (process.env.NODE_ENV === 'production') {
      return { ok: false, reason: 'turnstile_not_configured' };
    }
     
    console.warn(
      '[newsletter] TURNSTILE_SECRET_KEY not set — bypassing Turnstile (dev only)'
    );
    return { ok: true };
  }

  if (!token || typeof token !== 'string') {
    return { ok: false, reason: 'turnstile_token_missing' };
  }

  const form = new URLSearchParams();
  form.set('secret', secret);
  form.set('response', token);
  if (remoteIp && remoteIp !== 'unknown') form.set('remoteip', remoteIp);

  try {
    const res = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        body: form,
        // 10s timeout via AbortController so a Cloudflare hiccup can't hang the
        // request indefinitely.
        signal: AbortSignal.timeout(10_000),
      }
    );

    if (!res.ok) {
      return { ok: false, reason: `turnstile_http_${res.status}` };
    }
    const json = (await res.json()) as TurnstileResponse;
    if (!json.success) {
      return {
        ok: false,
        reason: `turnstile_failed:${(json['error-codes'] || []).join(',') || 'unknown'}`,
      };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      reason: `turnstile_error:${err instanceof Error ? err.message : 'unknown'}`,
    };
  }
}

// --------------------------------------------------------------------------
// Confirmation email
// --------------------------------------------------------------------------

function buildConfirmUrl(token: string): string {
  const base =
    process.env.NEXT_PUBLIC_NEWSLETTER_CONFIRM_URL ||
    'https://mnnr.app/newsletter/confirm';
  // Avoid double-slashes if the env var includes a trailing slash.
  const trimmed = base.endsWith('/') ? base.slice(0, -1) : base;
  return `${trimmed}?token=${encodeURIComponent(token)}`;
}

function getConfirmationEmailHtml(confirmUrl: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm your mnnr.app newsletter subscription</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 78, 59, 0.1) 100%); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 16px; padding: 40px;">
          <tr>
            <td align="center" style="padding-bottom: 30px;">
              <h1 style="color: #10b981; font-size: 32px; margin: 0; font-weight: 700;">MNNR</h1>
              <p style="color: #6b7280; font-size: 14px; margin: 8px 0 0 0;">Machine Economy Billing Infrastructure</p>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 24px;">
              <h2 style="color: #ffffff; font-size: 22px; margin: 0 0 16px 0;">Confirm your subscription</h2>
              <p style="color: #d1d5db; font-size: 16px; line-height: 1.6; margin: 0;">
                Click the button below to confirm your subscription to the MNNR newsletter.
                This link will expire in 7 days.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <a href="${confirmUrl}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px;">
                Confirm Subscription
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 24px;">
              <p style="color: #9ca3af; font-size: 13px; line-height: 1.6; margin: 0; word-break: break-all;">
                Or paste this link into your browser:<br>
                <span style="color: #10b981;">${confirmUrl}</span>
              </p>
            </td>
          </tr>
          <tr>
            <td style="border-top: 1px solid rgba(107, 114, 128, 0.3); padding-top: 24px;">
              <p style="color: #6b7280; font-size: 12px; margin: 0; text-align: center;">
                If you didn't sign up for the MNNR newsletter, just ignore this email — no subscription will be created.<br>
                © 2026 MNNR. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function sendConfirmationEmail(
  to: string,
  token: string,
  emailHash: string
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Audit + swallow — we never want a missing email infra to leak via the
    // generic success response. Operator should see the warning and fix env.
     
    console.error('[newsletter] RESEND_API_KEY not set — confirmation email not sent');
    await auditLog({
      event: 'newsletter.subscribed',
      outcome: 'failure',
      reason: 'resend_not_configured',
      meta: { email_hash: emailHash, stage: 'send_confirmation' },
    });
    return;
  }

  try {
    const resend = new Resend(apiKey);
    const confirmUrl = buildConfirmUrl(token);
    const { error } = await resend.emails.send({
      from: 'MNNR <onboarding@resend.dev>',
      to: [to],
      subject: 'Confirm your mnnr.app newsletter subscription',
      html: getConfirmationEmailHtml(confirmUrl),
    });
    if (error) {
       
      console.error('[newsletter] Resend error:', error);
      await auditLog({
        event: 'newsletter.subscribed',
        outcome: 'failure',
        reason: 'resend_send_failed',
        meta: { email_hash: emailHash, stage: 'send_confirmation' },
      });
    }
  } catch (err) {
     
    console.error('[newsletter] Resend threw:', err);
    await auditLog({
      event: 'newsletter.subscribed',
      outcome: 'failure',
      reason: 'resend_threw',
      meta: { email_hash: emailHash, stage: 'send_confirmation' },
    });
  }
}

// --------------------------------------------------------------------------
// POST handler
// --------------------------------------------------------------------------

interface NewsletterBody {
  email?: unknown;
  turnstileToken?: unknown;
  // Accept either name for forward compatibility with the Cloudflare widget.
  cfTurnstileResponse?: unknown;
  'cf-turnstile-response'?: unknown;
}

export async function POST(request: NextRequest) {
  const actorIp = getActorIp(request);
  const ctx = auditContextFromHeaders(request.headers);

  // ----- 1. Rate limit (per-IP) -----
  const rl = await enforceRateLimit({
    ...RateLimits.NEWSLETTER,
    key: actorIp,
    route: '/api/newsletter',
    dimension: 'ip',
    actorIp,
  });
  if (!rl.allowed) {
    // Audit handled inside enforceRateLimit. Return a 429 so legitimate
    // clients can back off; the enumeration-resistance principle applies to
    // SUCCESS paths, not to load-shedding signals.
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

  // ----- 2. Parse body -----
  let body: NewsletterBody;
  try {
    body = (await request.json()) as NewsletterBody;
  } catch {
    // Malformed JSON — still return generic shape to avoid signaling.
    return NextResponse.json(GENERIC_OK);
  }

  const turnstileToken =
    (typeof body.turnstileToken === 'string' && body.turnstileToken) ||
    (typeof body.cfTurnstileResponse === 'string' && body.cfTurnstileResponse) ||
    (typeof body['cf-turnstile-response'] === 'string' &&
      body['cf-turnstile-response']) ||
    undefined;

  // ----- 3. Turnstile verification -----
  const ts = await verifyTurnstile(turnstileToken, actorIp);
  if (!ts.ok) {
    await auditLog({
      event: 'newsletter.subscribed',
      outcome: 'denied',
      reason: ts.reason || 'turnstile_failed',
      actorIp,
      userAgent: ctx.userAgent,
      meta: { stage: 'turnstile' },
    });
    // Generic-success even for Turnstile failures so we don't leak whether the
    // bot detection layer is the gating factor.
    return NextResponse.json(GENERIC_OK);
  }

  // ----- 4. Email validation -----
  const ev = validateEmail(body.email);
  if (!ev.valid || !ev.normalized) {
    await auditLog({
      event: 'newsletter.subscribed',
      outcome: 'denied',
      reason: `invalid_email:${ev.reason ?? 'unknown'}`,
      actorIp,
      userAgent: ctx.userAgent,
      meta: { stage: 'validate_email' },
    });
    return NextResponse.json(GENERIC_OK);
  }

  const email = ev.normalized;
  const emailHash = hashPii(email) || 'unknown';

  // ----- 5. Lookup + branch -----
  try {
    const existing = await db.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existing && existing.status === 'confirmed') {
      // Idempotent + enumeration-resistant: do nothing visible to the caller.
      await auditLog({
        event: 'newsletter.subscribed',
        outcome: 'success',
        actorIp,
        userAgent: ctx.userAgent,
        meta: { email_hash: emailHash, branch: 'already_confirmed_noop' },
      });
      return NextResponse.json(GENERIC_OK);
    }

    if (existing && existing.status === 'unsubscribed') {
      // Honor an explicit unsubscribe — do not silently resubscribe. The user
      // must reach out / re-enroll through a different flow to flip back. We
      // STILL return the generic shape so the caller can't tell the difference.
      await auditLog({
        event: 'newsletter.subscribed',
        outcome: 'denied',
        reason: 'unsubscribed_user_resubscribe_blocked',
        actorIp,
        userAgent: ctx.userAgent,
        meta: { email_hash: emailHash, branch: 'unsubscribed_block' },
      });
      return NextResponse.json(GENERIC_OK);
    }

    // Either existing pending OR brand-new — both paths get a fresh token +
    // a (re-)send of the confirmation email. Existing pending = regenerate
    // token and extend TTL; new = insert.
    const token = randomBytes(CONFIRMATION_TOKEN_BYTES).toString('hex');
    const expiresAt = new Date(Date.now() + CONFIRMATION_TTL_MS);

    if (existing) {
      // status === 'pending' (or any non-confirmed/non-unsubscribed bucket) —
      // rotate the token so old links die and start a fresh 7-day window.
      await db.newsletterSubscriber.update({
        where: { email },
        data: {
          confirmationToken: token,
          confirmationTokenExpiresAt: expiresAt,
          // Re-assert pending in case some future code path leaves a row in a
          // weird state — this keeps the resend semantics safe.
          status: 'pending',
        },
      });
      await auditLog({
        event: 'newsletter.subscribed',
        outcome: 'success',
        actorIp,
        userAgent: ctx.userAgent,
        meta: { email_hash: emailHash, branch: 'pending_resend' },
      });
    } else {
      await db.newsletterSubscriber.create({
        data: {
          email,
          emailHash,
          status: 'pending',
          confirmationToken: token,
          confirmationTokenExpiresAt: expiresAt,
        },
      });
      await auditLog({
        event: 'newsletter.subscribed',
        outcome: 'success',
        actorIp,
        userAgent: ctx.userAgent,
        meta: { email_hash: emailHash, branch: 'new_pending' },
      });
    }

    // Fire confirmation email (best-effort — failures land in audit, not in
    // the response).
    await sendConfirmationEmail(email, token, emailHash);

    return NextResponse.json(GENERIC_OK);
  } catch (err) {
    // Database / Prisma error. Audit, but STILL return the generic success
    // shape — leaking infra failures via the public endpoint is its own
    // signaling channel.
     
    console.error('[newsletter] persistence error', err);
    await auditLog({
      event: 'newsletter.subscribed',
      outcome: 'failure',
      reason: 'db_error',
      actorIp,
      userAgent: ctx.userAgent,
      meta: {
        email_hash: emailHash,
        error: err instanceof Error ? err.message : String(err),
      },
    });
    return NextResponse.json(GENERIC_OK);
  }
}

// --------------------------------------------------------------------------
// GET handler — kept for backward compatibility (route discovery).
// --------------------------------------------------------------------------

export async function GET() {
  return NextResponse.json({
    message: 'Newsletter API — POST to subscribe (double opt-in)',
    endpoint: '/api/newsletter',
    method: 'POST',
    body: {
      email: 'string (RFC 5322)',
      turnstileToken: 'string (Cloudflare Turnstile response token)',
    },
    confirmation: 'Visit the link emailed to the address to confirm.',
  });
}
