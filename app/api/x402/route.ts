/**
 * x402 Protocol API Endpoint
 *
 * - GET  /api/x402                              → protocol info
 * - GET  /api/x402?demo=true                    → demo 402 challenge
 * - POST /api/x402   { action: 'challenge', ... } → issue a server-bound challenge
 * - POST /api/x402   { action: 'verify',    ... } → verify proof + execute paid action
 * - POST /api/x402   { action: <legacy>,    ... } → legacy single-shot path
 *
 * SECURITY HARDENING (Finding #2 — CRITICAL/HIGH)
 * ----------------------------------------------------------------------------
 * Per the security audit, paid execution is disabled in production until
 * verification is explicitly enabled. Receiver addresses must be non-zero.
 * Every paid attempt is rate-limited (`RateLimits.X402`), CSRF-protected for
 * state-changing methods, and audit-logged for forensic reconstruction.
 *
 * Verification flow (the SAFE path):
 *   1. Client POSTs { action: 'challenge', resource, amountUSD, token, chain }
 *      → server issues challenge bound to (nonce, receiver, amount, chain, token)
 *      → server returns paymentRequest + paymentUri the client uses to pay
 *   2. Client pays on-chain referencing the challenge.
 *   3. Client POSTs { action: 'verify', nonce, txHash, chain, executeAction }
 *      → server runs `verifyPaymentOnChain` (challenge bind + RPC + replay)
 *      → on success, the paid action is executed
 *      → on failure, structured 402/4xx with a `reason` code
 */

import { NextResponse } from 'next/server';
import {
  calculateCost,
  X402_VERSION,
  SUPPORTED_NETWORKS,
  SUPPORTED_TOKENS,
  createPaymentRequest,
  createX402Headers,
  getReceiver,
  type Network,
  type Token,
} from '@/lib/x402';
import { verifyPaymentOnChain } from '@/lib/x402-verify';
import { issueChallenge } from '@/lib/payment-challenge-store';
import { enforceRateLimit, RateLimits, getActorIp } from '@/lib/rate-limit';
import { verifyCsrfToken } from '@/lib/csrf';
import { auditLog, auditContextFromHeaders } from '@/lib/audit';

export const dynamic = 'force-dynamic';

// ---------------------------------------------------------------------------
// Production gate (Finding #2 fix)
// ---------------------------------------------------------------------------

const PAYMENT_VERIFICATION_ENABLED =
  process.env.PAYMENT_VERIFICATION_ENABLED === 'true';

function productionDisabledResponse(): Response | null {
  if (process.env.NODE_ENV === 'production' && !PAYMENT_VERIFICATION_ENABLED) {
    return NextResponse.json(
      {
        error: 'payment_disabled',
        reason: 'verification_not_enabled',
        message:
          'x402 paid actions are disabled in this environment because PAYMENT_VERIFICATION_ENABLED is not set to "true".',
      },
      { status: 503 },
    );
  }
  return null;
}

// ---------------------------------------------------------------------------
// CSRF (state-changing methods only; webhooks bypass per csrfProtection convention)
// ---------------------------------------------------------------------------

function checkCsrf(request: Request): Response | null {
  const token =
    request.headers.get('x-csrf-token') ||
    request.headers.get('X-CSRF-Token');
  if (!token) {
    return NextResponse.json(
      { error: 'csrf_token_missing' },
      { status: 403 },
    );
  }
  if (!verifyCsrfToken(token)) {
    return NextResponse.json(
      { error: 'csrf_token_invalid' },
      { status: 403 },
    );
  }
  return null;
}

// ---------------------------------------------------------------------------
// Rate limit (RateLimits.X402 preset)
// ---------------------------------------------------------------------------

async function checkRateLimit(
  request: Request,
  route: string,
): Promise<{ ok: true } | { ok: false; response: Response }> {
  const ip = getActorIp(request);
  const r = await enforceRateLimit({
    ...RateLimits.X402,
    key: ip,
    route,
    dimension: 'ip',
    actorIp: ip,
  });
  if (!r.allowed) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: 'rate_limited',
          reason: r.reason ?? 'rate_limited',
          resetAt: r.resetAt,
        },
        { status: 429 },
      ),
    };
  }
  return { ok: true };
}

// ---------------------------------------------------------------------------
// GET — protocol info + demo 402
// ---------------------------------------------------------------------------

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const demo = searchParams.get('demo');

  // If demo mode, return 402 Payment Required
  if (demo === 'true') {
    const disabled = productionDisabledResponse();
    if (disabled) return disabled;

    // Fail-closed receiver check before we issue a demo challenge.
    try {
      getReceiver('base'); // throws on missing/zero receiver
    } catch (e) {
      return NextResponse.json(
        {
          error: 'payment_disabled',
          reason: 'receiver_misconfigured',
          detail: (e as Error).message,
        },
        { status: 503 },
      );
    }

    const paymentRequest = createPaymentRequest({
      amountUSD: 0.001, // $0.001 demo payment
      resource: '/api/x402/demo',
      description: 'Demo x402 payment request',
    });

    const headers = createX402Headers(paymentRequest);

    return new Response(
      JSON.stringify({
        error: 'Payment required',
        message: 'This is a demo of x402 protocol. Send $0.001 to access.',
        paymentRequest,
        howToPay: {
          step1: 'Send 0.001 USDC to the receiver address on Base network',
          step2: 'Get the transaction hash',
          step3:
            'POST /api/x402 with { action: "verify", nonce, txHash, chain } to redeem',
        },
      }),
      {
        status: 402,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      },
    );
  }

  // Return x402 protocol info
  return NextResponse.json({
    protocol: 'x402',
    version: X402_VERSION,
    description:
      'HTTP 402 Payment Required protocol for machine-to-machine payments',
    mnnr_support: {
      status: 'active',
      first_platform: true,
      message: 'MNNR is the first AI billing platform to support x402 protocol',
      verification_enabled: PAYMENT_VERIFICATION_ENABLED,
    },
    supported: {
      networks: SUPPORTED_NETWORKS,
      tokens: SUPPORTED_TOKENS,
    },
    features: [
      'Sub-cent micropayments ($0.001 minimum)',
      'No API keys required for payment',
      'Instant settlement on Base L2',
      'Multi-chain support (Base, Ethereum, Polygon)',
      'Stablecoin payments (USDC, USDT, DAI)',
    ],
    pricing: {
      tokens: '$0.01 per 1,000 tokens',
      requests: '$0.10 per 1,000 requests',
      compute: '$0.001 per 1,000ms',
      minimum_payment: '$0.001',
    },
    demo: {
      url: '/api/x402?demo=true',
      description: 'Try the x402 protocol with a $0.001 demo payment',
    },
    flow: {
      challenge: 'POST /api/x402 { action: "challenge", amountUSD, resource, chain?, token? }',
      verify: 'POST /api/x402 { action: "verify", nonce, txHash, chain, executeAction? }',
    },
    documentation: 'https://mnnr.app/docs/x402',
    specification: 'https://x402.org',
  });
}

// ---------------------------------------------------------------------------
// POST — challenge / verify / legacy
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  const auditCtx = auditContextFromHeaders(request.headers);

  // 1. Production gate (Finding #2.1)
  const disabled = productionDisabledResponse();
  if (disabled) {
    await auditLog({
      ...auditCtx,
      event: 'payment.attempted',
      outcome: 'denied',
      reason: 'verification_not_enabled',
    });
    return disabled;
  }

  // 2. CSRF (state-changing methods)
  const csrf = checkCsrf(request);
  if (csrf) {
    await auditLog({
      ...auditCtx,
      event: 'payment.attempted',
      outcome: 'denied',
      reason: 'csrf_failed',
    });
    return csrf;
  }

  // 3. Rate limit
  const rl = await checkRateLimit(request, '/api/x402');
  if (!rl.ok) return rl.response;

  // 4. Parse body
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const action = String(body?.action ?? '').trim();

  try {
    if (action === 'challenge') {
      return await handleChallenge(body, auditCtx);
    }
    if (action === 'verify') {
      return await handleVerify(body, auditCtx);
    }
    // Legacy single-shot path — supported but logs a deprecation warning.
    return await handleLegacy(body, auditCtx);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('x402 API error:', error);
    await auditLog({
      ...auditCtx,
      event: 'payment.attempted',
      outcome: 'failure',
      reason: 'internal_error',
      meta: { message: error instanceof Error ? error.message : String(error) },
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST handler — issue challenge
// ---------------------------------------------------------------------------

async function handleChallenge(
  body: any,
  auditCtx: ReturnType<typeof auditContextFromHeaders>,
): Promise<Response> {
  const amountUSD = Number(body?.amountUSD ?? 0);
  const resource = String(body?.resource ?? '').trim();
  const chain = (body?.chain as Network) || 'base';
  const token = (body?.token as Token) || 'USDC';
  const userId = body?.userId ? String(body.userId) : undefined;
  const sessionId = body?.sessionId ? String(body.sessionId) : undefined;

  if (!Number.isFinite(amountUSD) || amountUSD <= 0) {
    return NextResponse.json({ error: 'invalid_amount' }, { status: 400 });
  }
  if (!resource) {
    return NextResponse.json({ error: 'invalid_resource' }, { status: 400 });
  }
  if (!SUPPORTED_NETWORKS.includes(chain)) {
    return NextResponse.json({ error: 'unsupported_chain' }, { status: 400 });
  }
  if (!SUPPORTED_TOKENS.includes(token)) {
    return NextResponse.json({ error: 'unsupported_token' }, { status: 400 });
  }

  // Fail-closed receiver — throws if missing/zero.
  let receiver: string;
  try {
    receiver = getReceiver(chain);
  } catch (e) {
    await auditLog({
      ...auditCtx,
      event: 'payment.attempted',
      outcome: 'denied',
      reason: 'receiver_misconfigured',
    });
    return NextResponse.json(
      {
        error: 'payment_disabled',
        reason: 'receiver_misconfigured',
        detail: (e as Error).message,
      },
      { status: 503 },
    );
  }

  const paymentRequest = createPaymentRequest({
    amountUSD,
    resource,
    network: chain,
    token,
  });

  const challenge = await issueChallenge({
    amount: paymentRequest.amount,
    resource,
    receiver,
    chain,
    token,
    amountUsd: amountUSD,
    userId,
    sessionId,
    ttlSeconds: 600,
  });

  // Embed the SERVER-issued nonce into the payment request so the client's
  // on-chain reference (and subsequent verify call) is bound to the challenge.
  const boundPaymentRequest = { ...paymentRequest, nonce: challenge.nonce };
  const headers = createX402Headers(boundPaymentRequest);

  await auditLog({
    ...auditCtx,
    event: 'payment.attempted',
    outcome: 'success',
    userId,
    targetId: challenge.id,
    meta: {
      phase: 'challenge_issued',
      nonce: challenge.nonce,
      chain,
      token,
      amount: challenge.amount,
      amountUSD,
      resource,
    },
  });

  return new Response(
    JSON.stringify({
      ok: true,
      nonce: challenge.nonce,
      amount: challenge.amount,
      receiver: challenge.receiver,
      chain: challenge.chain,
      token,
      expiresAt: challenge.expiresAt.toISOString(),
      paymentRequest: boundPaymentRequest,
      // Lightweight payment URI hint (EIP-681-ish, advisory only).
      paymentUri: `ethereum:${receiver}@${chain}/transfer?amount=${challenge.amount}&token=${token}&nonce=${challenge.nonce}`,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...headers },
    },
  );
}

// ---------------------------------------------------------------------------
// POST handler — verify proof
// ---------------------------------------------------------------------------

async function handleVerify(
  body: any,
  auditCtx: ReturnType<typeof auditContextFromHeaders>,
): Promise<Response> {
  const nonce = String(body?.nonce ?? '').trim();
  const txHash = String(body?.txHash ?? '').trim();
  const chain = (body?.chain as Network) || 'base';
  const executeAction = body?.executeAction ? String(body.executeAction) : null;
  const executeParams = body?.executeParams ?? null;

  if (!nonce) {
    return NextResponse.json({ error: 'missing_nonce' }, { status: 400 });
  }
  if (!txHash) {
    return NextResponse.json({ error: 'missing_tx_hash' }, { status: 400 });
  }
  if (!SUPPORTED_NETWORKS.includes(chain)) {
    return NextResponse.json({ error: 'unsupported_chain' }, { status: 400 });
  }

  const result = await verifyPaymentOnChain({ nonce, txHash, chain });

  if (!result.ok) {
    await auditLog({
      ...auditCtx,
      event: 'payment.completed',
      outcome: 'failure',
      reason: result.reason,
      meta: {
        phase: 'verify_failed',
        nonce,
        txHash,
        chain,
        detail: result.detail,
      },
    });
    // 402 for "payment did not actually happen / not enough / wrong"; 409 for
    // replay / already-consumed; 503 for config; 400 for malformed.
    const status =
      result.reason === 'replay_detected' ||
      result.reason === 'challenge_already_consumed'
        ? 409
        : result.reason === 'config_error' ||
            result.reason === 'verification_disabled'
          ? 503
          : result.reason === 'malformed_tx'
            ? 400
            : 402;

    return NextResponse.json(
      { ok: false, reason: result.reason, detail: result.detail },
      { status },
    );
  }

  // Payment verified + challenge consumed atomically. Execute the paid action.
  let actionResult: unknown = null;
  if (executeAction) {
    const cost = calculateCost(executeParams ?? {});
    actionResult = {
      message: `Action '${executeAction}' executed successfully via x402 payment`,
      params: executeParams,
      cost,
    };
  }

  await auditLog({
    ...auditCtx,
    event: 'payment.completed',
    outcome: 'success',
    targetId: result.txHash,
    meta: {
      phase: 'verify_ok',
      nonce,
      txHash: result.txHash,
      chain: result.chain,
      blockNumber: result.blockNumber,
      confirmations: result.confirmations,
      amountPaid: result.amountPaid,
      executeAction,
    },
  });

  return NextResponse.json({
    ok: true,
    payment: {
      txHash: result.txHash,
      chain: result.chain,
      blockNumber: result.blockNumber,
      confirmations: result.confirmations,
      amountPaid: result.amountPaid,
      receiver: result.receiver,
    },
    action: executeAction ? actionResult : null,
    x402: {
      protocol_version: X402_VERSION,
      payment_verified: true,
    },
  });
}

// ---------------------------------------------------------------------------
// POST handler — LEGACY single-shot
// ---------------------------------------------------------------------------
//
// The pre-Finding-#2 flow issued a fresh payment request, parsed an
// X-402-Payment-Proof header in the same request, and trusted basic shape
// validation. That path NEVER actually settled on-chain, so it is no longer
// safe to execute the paid action without going through challenge + verify.
//
// We keep the route alive for back-compat but it now responds with 402 +
// instructions instead of silently executing.

async function handleLegacy(
  body: any,
  auditCtx: ReturnType<typeof auditContextFromHeaders>,
): Promise<Response> {
  const action = String(body?.action ?? '').trim() || 'unknown';
  const params = body?.params ?? {};
  let cost = 0.001;
  switch (action) {
    case 'generate_text':
      cost = calculateCost({ tokens: params?.max_tokens || 1000 });
      break;
    case 'analyze_image':
      cost = calculateCost({ requests: 1, computeMs: 5000 });
      break;
    case 'query_data':
      cost = calculateCost({ requests: 1 });
      break;
    default:
      cost = 0.001;
  }

  await auditLog({
    ...auditCtx,
    event: 'payment.attempted',
    outcome: 'denied',
    reason: 'legacy_path_requires_verify_flow',
    meta: { action, cost },
  });

  return NextResponse.json(
    {
      error: 'use_verify_flow',
      message:
        'Single-shot x402 calls are no longer accepted. POST { action: "challenge", amountUSD, resource } to issue a challenge, pay on-chain, then POST { action: "verify", nonce, txHash, chain } to redeem.',
      action,
      requiredAmountUSD: cost,
    },
    { status: 402 },
  );
}
