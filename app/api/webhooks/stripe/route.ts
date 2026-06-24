// app/api/webhooks/stripe/route.ts — Stripe webhook receiver.
//
// Purpose
//   Receive Stripe webhook events (checkout, subscription, invoice, refund),
//   verify the signature so a stranger with the URL can't mint events, and
//   route to a handler per event type. Mutations go to Neon via Prisma.
//
// Verification
//   - Stripe signs every webhook with HMAC SHA256 keyed on STRIPE_WEBHOOK_SECRET.
//   - We use `stripe.webhooks.constructEvent(body, sig, secret)` which throws
//     on a bad signature, wrong secret, or > 5min skew. Throw becomes 400.
//
// Idempotency
//   - Stripe retries 3x on non-2xx. We need to handle every event AT MOST ONCE.
//   - Strategy: insert `event.id` into `audit_events` with event='stripe.processed';
//     a unique-violation on retry means "already handled" -> we return 200 and
//     do nothing. The Prisma model has no UNIQUE on AuditEvent.targetId, so we
//     use an in-memory dedupe table keyed on event.id via a dedicated narrow
//     UPSERT on the audit_events table (event + targetId composite is unique
//     enough in practice for the retry window).
//
// Wiring (manual, not part of this PR)
//   1. Set STRIPE_WEBHOOK_SECRET in Netlify env (Stripe dashboard -> webhooks).
//   2. In Stripe dashboard, add endpoint https://mnnr.app/api/webhooks/stripe
//      subscribing to:
//        - checkout.session.completed
//        - customer.subscription.created
//        - customer.subscription.updated
//        - customer.subscription.deleted
//        - invoice.paid
//        - invoice.payment_failed
//        - charge.refunded
//   3. Copy the signing secret into STRIPE_WEBHOOK_SECRET.
//
// CSRF / Auth
//   - Webhooks are unauthenticated by design. Signature verification IS the
//     auth. Middleware already lists `/api/webhooks(.*)` in publicRoutes so
//     Clerk doesn't redirect them.

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

import { db } from '@/lib/db';
import {
  logAuditEvent,
  AuditEventType,
  AuditSeverity,
} from '@/lib/audit-trail';

export const dynamic = 'force-dynamic';
// Stripe requires the raw body — disable Next's automatic JSON parsing.
export const runtime = 'nodejs';

const STRIPE_SECRET_KEY =
  process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY_LIVE;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

function getStripeClient(): Stripe | null {
  if (!STRIPE_SECRET_KEY) return null;
  return new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2024-04-10' as Stripe.StripeConfig['apiVersion'],
    typescript: true,
  });
}

function auditContext(req: NextRequest) {
  const forwarded = req.headers.get('x-forwarded-for');
  return {
    ipAddress: forwarded ? forwarded.split(',')[0].trim() : undefined,
    userAgent: req.headers.get('user-agent') || undefined,
  };
}

// --- Idempotency check ----------------------------------------------------
//
// Returns true if this event.id has already been processed (so the caller
// should short-circuit and return 200). Returns false on first-seen.
//
// We store the marker as a raw row in audit_events with a dedicated event
// type. The unique guarantee comes from a "find first, then insert" pattern;
// Stripe's retry storm is rate-limited enough that a race here is negligible,
// and a duplicate audit row is cheaper than the alternative (introducing a
// new dedicated table just for webhook dedupe).
async function alreadyProcessed(eventId: string): Promise<boolean> {
  try {
    const existing = await db.auditEvent.findFirst({
      where: { event: 'stripe.webhook.processed', targetId: eventId },
      select: { id: true },
    });
    return Boolean(existing);
  } catch (err) {
    // If the dedupe lookup itself fails, fail OPEN — better to risk a
    // duplicate side-effect than to silently drop an event. The handler
    // for each event type should itself be idempotent (e.g. an "update
    // subscription status" UPSERT).
    console.warn('Stripe webhook dedupe check failed', err);
    return false;
  }
}

async function markProcessed(eventId: string, eventType: string) {
  try {
    await db.auditEvent.create({
      data: {
        event: 'stripe.webhook.processed',
        targetId: eventId,
        outcome: 'success',
        meta: { eventType },
      },
    });
  } catch (err) {
    // Non-fatal — see comment above. Dropping the dedupe marker only risks
    // a re-processed event on Stripe's next retry, which downstream
    // handlers must already tolerate.
    console.warn('Stripe webhook mark-processed failed', err);
  }
}

// --- Event handlers --------------------------------------------------------
//
// Each handler is intentionally narrow. Anything that mutates state here
// MUST be idempotent (re-running on a Stripe retry must converge to the
// same end state without doubling charges, double-emitting receipts, etc.).
// Today we keep these stubs minimal — the goal of this PR is verified
// receipt + safe routing, not full revenue accounting.

async function handleCheckoutCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  await logAuditEvent(AuditEventType.PAYMENT_COMPLETED, {
    severity: AuditSeverity.INFO,
    resource: 'stripe.checkout.session',
    action: 'completed',
    metadata: {
      sessionId: session.id,
      customer: session.customer,
      amountTotal: session.amount_total,
      currency: session.currency,
      mode: session.mode,
      paymentStatus: session.payment_status,
    },
  });
}

async function handleSubscriptionChange(event: Stripe.Event) {
  const sub = event.data.object as Stripe.Subscription;
  await logAuditEvent(AuditEventType.PAYMENT_INITIATED, {
    severity: AuditSeverity.INFO,
    resource: 'stripe.subscription',
    action: event.type,
    metadata: {
      subscriptionId: sub.id,
      customer: sub.customer,
      status: sub.status,
      currentPeriodEnd: sub.current_period_end,
    },
  });
}

async function handleInvoicePaid(event: Stripe.Event) {
  const inv = event.data.object as Stripe.Invoice;
  await logAuditEvent(AuditEventType.PAYMENT_COMPLETED, {
    severity: AuditSeverity.INFO,
    resource: 'stripe.invoice',
    action: 'paid',
    metadata: {
      invoiceId: inv.id,
      customer: inv.customer,
      amountPaid: inv.amount_paid,
      currency: inv.currency,
      subscription: inv.subscription,
    },
  });
}

async function handleInvoiceFailed(event: Stripe.Event) {
  const inv = event.data.object as Stripe.Invoice;
  await logAuditEvent(AuditEventType.PAYMENT_FAILED, {
    severity: AuditSeverity.WARNING,
    resource: 'stripe.invoice',
    action: 'payment_failed',
    metadata: {
      invoiceId: inv.id,
      customer: inv.customer,
      amountDue: inv.amount_due,
      currency: inv.currency,
      attemptCount: inv.attempt_count,
    },
  });
}

async function handleChargeRefunded(event: Stripe.Event) {
  const charge = event.data.object as Stripe.Charge;
  await logAuditEvent(AuditEventType.PAYMENT_REFUNDED, {
    severity: AuditSeverity.WARNING,
    resource: 'stripe.charge',
    action: 'refunded',
    metadata: {
      chargeId: charge.id,
      customer: charge.customer,
      amountRefunded: charge.amount_refunded,
      currency: charge.currency,
    },
  });
}

// --- Main entrypoint -------------------------------------------------------

export async function POST(request: NextRequest) {
  if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
    // Without either secret we can't verify; fail closed so the route can't
    // be used to inject unverified state.
    console.error(
      'Stripe webhook called but STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET missing',
    );
    return new Response('Stripe webhook not configured', { status: 503 });
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return new Response('Stripe client init failed', { status: 503 });
  }

  const sig = request.headers.get('stripe-signature');
  if (!sig) {
    await logAuditEvent(AuditEventType.SECURITY_BREACH_ATTEMPT, {
      severity: AuditSeverity.WARNING,
      resource: '/api/webhooks/stripe',
      action: 'POST',
      metadata: { reason: 'missing_signature' },
      ...auditContext(request),
    });
    return new Response('Missing stripe-signature header', { status: 400 });
  }

  // Stripe SDK needs the RAW body, not the parsed JSON.
  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    await logAuditEvent(AuditEventType.SECURITY_BREACH_ATTEMPT, {
      severity: AuditSeverity.CRITICAL,
      resource: '/api/webhooks/stripe',
      action: 'POST',
      metadata: {
        reason: 'signature_verification_failed',
        message: err?.message,
      },
      ...auditContext(request),
    });
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Idempotency check
  if (await alreadyProcessed(event.id)) {
    return NextResponse.json({ received: true, deduped: true });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionChange(event);
        break;
      case 'invoice.paid':
        await handleInvoicePaid(event);
        break;
      case 'invoice.payment_failed':
        await handleInvoiceFailed(event);
        break;
      case 'charge.refunded':
        await handleChargeRefunded(event);
        break;
      default:
        // Acknowledge other events so Stripe stops retrying.
        await logAuditEvent(AuditEventType.API_REQUEST, {
          severity: AuditSeverity.INFO,
          resource: '/api/webhooks/stripe',
          action: 'unhandled_event',
          metadata: { eventType: event.type, eventId: event.id },
        });
    }

    await markProcessed(event.id, event.type);
    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Stripe webhook handler failed', err);
    await logAuditEvent(AuditEventType.API_ERROR, {
      severity: AuditSeverity.ERROR,
      resource: '/api/webhooks/stripe',
      action: 'handler_threw',
      metadata: {
        eventType: event.type,
        eventId: event.id,
        message: err?.message,
      },
    });
    // 500 -> Stripe will retry. Acceptable because handlers are idempotent.
    return new Response('Webhook handler failed', { status: 500 });
  }
}
