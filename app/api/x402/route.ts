/**
 * x402 Protocol API Endpoint
 * 
 * This endpoint demonstrates x402 protocol support:
 * - Returns 402 Payment Required for unpaid requests
 * - Accepts payment proofs via X-402-Payment-Proof header
 * - Supports USDC, USDT, DAI on Base, Ethereum, Polygon
 * 
 * MNNR is the FIRST AI billing platform to support x402.
 */

import { NextResponse } from 'next/server';
import { 
  handleX402, 
  calculateCost, 
  X402_VERSION, 
  SUPPORTED_NETWORKS, 
  SUPPORTED_TOKENS,
  createPaymentRequest,
  createX402Headers
} from '@/lib/x402';

export const dynamic = 'force-dynamic';

/**
 * GET /api/x402 - Get x402 protocol info and demo
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const demo = searchParams.get('demo');

  // If demo mode, return 402 Payment Required
  if (demo === 'true') {
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
          step3: 'Include payment proof in X-402-Payment-Proof header',
          step4: 'Retry this request',
        },
      }),
      {
        status: 402,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      }
    );
  }

  // Return x402 protocol info
  return NextResponse.json({
    protocol: 'x402',
    version: X402_VERSION,
    description: 'HTTP 402 Payment Required protocol for machine-to-machine payments',
    mnnr_support: {
      status: 'active',
      first_platform: true,
      message: 'MNNR is the first AI billing platform to support x402 protocol',
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
    documentation: 'https://mnnr.app/docs/x402',
    specification: 'https://x402.org',
  });
}

/**
 * POST /api/x402 - Execute a paid API call via x402
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, params } = body;

    // Calculate cost based on action
    let cost = 0.001; // Default minimum cost
    
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

    // Handle x402 payment
    const x402Result = await handleX402(request, {
      amountUSD: cost,
      resource: `/api/x402/${action}`,
      description: `x402 payment for ${action}`,
    });

    if (x402Result.requiresPayment) {
      return x402Result.response;
    }

    // Payment verified - execute the action
    // In production, this would call the actual AI/compute service
    return NextResponse.json({
      success: true,
      action,
      result: {
        message: `Action '${action}' executed successfully via x402 payment`,
        payment: {
          amount_usd: cost,
          tx_hash: x402Result.paymentProof?.txHash,
          network: x402Result.paymentProof?.network,
          token: x402Result.paymentProof?.token,
        },
      },
      x402: {
        protocol_version: X402_VERSION,
        payment_verified: true,
      },
    });
  } catch (error) {
    console.error('x402 API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
