/**
 * x402 Protocol Implementation for MNNR
 * 
 * x402 is an open protocol by Coinbase/Cloudflare that enables:
 * - HTTP 402 Payment Required responses
 * - Sub-cent micropayments ($0.001)
 * - Machine-to-machine payments without API keys
 * - Stablecoin settlements (USDC on Base)
 * 
 * This makes MNNR the FIRST platform to support x402 for AI agent billing.
 */

import crypto from 'crypto';

// x402 Protocol Constants
export const X402_VERSION = '1.0';
export const X402_HEADER_PREFIX = 'X-402';
export const SUPPORTED_NETWORKS = ['base', 'ethereum', 'polygon'] as const;
export const SUPPORTED_TOKENS = ['USDC', 'USDT', 'DAI'] as const;

export type Network = (typeof SUPPORTED_NETWORKS)[number];
export type Token = (typeof SUPPORTED_TOKENS)[number];

// Token contract addresses by network
export const TOKEN_ADDRESSES: Record<Network, Record<Token, string>> = {
  base: {
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    USDT: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
    DAI: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
  },
  ethereum: {
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    DAI: '0x6B175474E89094C44Da98b954EescdeCB5BE3830',
  },
  polygon: {
    USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    DAI: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
  },
};

// MNNR's payment receiver addresses by network
export const MNNR_RECEIVERS: Record<Network, string> = {
  base: process.env.MNNR_BASE_ADDRESS || '0x0000000000000000000000000000000000000000',
  ethereum: process.env.MNNR_ETH_ADDRESS || '0x0000000000000000000000000000000000000000',
  polygon: process.env.MNNR_POLYGON_ADDRESS || '0x0000000000000000000000000000000000000000',
};

/**
 * x402 Payment Request - sent in HTTP 402 response
 */
export interface X402PaymentRequest {
  version: string;
  network: Network;
  token: Token;
  receiver: string;
  amount: string; // In smallest unit (e.g., 6 decimals for USDC)
  maxAmountRequired: string;
  resource: string;
  description?: string;
  validUntil: number; // Unix timestamp
  nonce: string;
  signature?: string;
}

/**
 * x402 Payment Proof - sent by client after payment
 */
export interface X402PaymentProof {
  version: string;
  network: Network;
  token: Token;
  txHash: string;
  sender: string;
  receiver: string;
  amount: string;
  nonce: string;
  timestamp: number;
  signature: string;
}

/**
 * Generate a payment request for x402 protocol
 */
export function createPaymentRequest(options: {
  amountUSD: number;
  resource: string;
  description?: string;
  network?: Network;
  token?: Token;
  validitySeconds?: number;
}): X402PaymentRequest {
  const {
    amountUSD,
    resource,
    description,
    network = 'base',
    token = 'USDC',
    validitySeconds = 300, // 5 minutes default
  } = options;

  // Convert USD to token amount (USDC/USDT have 6 decimals)
  const decimals = token === 'DAI' ? 18 : 6;
  const amount = Math.ceil(amountUSD * Math.pow(10, decimals)).toString();

  const nonce = crypto.randomBytes(16).toString('hex');
  const validUntil = Math.floor(Date.now() / 1000) + validitySeconds;

  return {
    version: X402_VERSION,
    network,
    token,
    receiver: MNNR_RECEIVERS[network],
    amount,
    maxAmountRequired: amount,
    resource,
    description,
    validUntil,
    nonce,
  };
}

/**
 * Generate x402 response headers for HTTP 402 Payment Required
 */
export function createX402Headers(paymentRequest: X402PaymentRequest): Record<string, string> {
  const paymentRequestJson = JSON.stringify(paymentRequest);
  const paymentRequestBase64 = Buffer.from(paymentRequestJson).toString('base64');

  return {
    'X-402-Version': X402_VERSION,
    'X-402-Payment-Required': 'true',
    'X-402-Payment-Request': paymentRequestBase64,
    'X-402-Networks': SUPPORTED_NETWORKS.join(','),
    'X-402-Tokens': SUPPORTED_TOKENS.join(','),
    'WWW-Authenticate': `X402 realm="MNNR API", payment-request="${paymentRequestBase64}"`,
  };
}

/**
 * Parse x402 payment proof from request headers
 */
export function parsePaymentProof(headers: Headers): X402PaymentProof | null {
  const proofHeader = headers.get('X-402-Payment-Proof');
  if (!proofHeader) return null;

  try {
    const proofJson = Buffer.from(proofHeader, 'base64').toString('utf-8');
    return JSON.parse(proofJson) as X402PaymentProof;
  } catch {
    return null;
  }
}

/**
 * Verify a payment proof (basic validation - full verification requires blockchain query)
 */
export async function verifyPaymentProof(
  proof: X402PaymentProof,
  expectedRequest: X402PaymentRequest
): Promise<{ valid: boolean; error?: string }> {
  // Basic validation
  if (proof.version !== X402_VERSION) {
    return { valid: false, error: 'Invalid x402 version' };
  }

  if (proof.network !== expectedRequest.network) {
    return { valid: false, error: 'Network mismatch' };
  }

  if (proof.token !== expectedRequest.token) {
    return { valid: false, error: 'Token mismatch' };
  }

  if (proof.receiver.toLowerCase() !== expectedRequest.receiver.toLowerCase()) {
    return { valid: false, error: 'Receiver mismatch' };
  }

  if (BigInt(proof.amount) < BigInt(expectedRequest.amount)) {
    return { valid: false, error: 'Insufficient payment amount' };
  }

  if (proof.nonce !== expectedRequest.nonce) {
    return { valid: false, error: 'Nonce mismatch' };
  }

  // TODO: Verify transaction on-chain using RPC
  // This would query the blockchain to confirm the transaction exists and is confirmed
  // For now, we trust the proof (in production, this MUST be verified)

  return { valid: true };
}

/**
 * Calculate the cost for an API call based on usage
 */
export function calculateCost(usage: {
  tokens?: number;
  requests?: number;
  computeMs?: number;
  storageBytes?: number;
}): number {
  const { tokens = 0, requests = 0, computeMs = 0, storageBytes = 0 } = usage;

  // Pricing (in USD)
  const TOKEN_COST = 0.00001; // $0.01 per 1000 tokens
  const REQUEST_COST = 0.0001; // $0.10 per 1000 requests
  const COMPUTE_COST = 0.000001; // $0.001 per 1000ms
  const STORAGE_COST = 0.00000001; // $0.01 per GB

  return (
    tokens * TOKEN_COST +
    requests * REQUEST_COST +
    computeMs * COMPUTE_COST +
    storageBytes * STORAGE_COST
  );
}

/**
 * x402 Middleware for Next.js API routes
 * 
 * Usage:
 * ```
 * export async function GET(request: Request) {
 *   const x402Result = await handleX402(request, { amountUSD: 0.001 });
 *   if (x402Result.requiresPayment) {
 *     return x402Result.response;
 *   }
 *   // Process the paid request
 * }
 * ```
 */
export async function handleX402(
  request: Request,
  options: {
    amountUSD: number;
    resource?: string;
    description?: string;
  }
): Promise<{
  requiresPayment: boolean;
  response?: Response;
  paymentProof?: X402PaymentProof;
}> {
  const { amountUSD, resource = request.url, description } = options;

  // Check for existing payment proof
  const paymentProof = parsePaymentProof(request.headers);
  
  if (paymentProof) {
    // Verify the payment proof
    const paymentRequest = createPaymentRequest({ amountUSD, resource, description });
    const verification = await verifyPaymentProof(paymentProof, paymentRequest);
    
    if (verification.valid) {
      return { requiresPayment: false, paymentProof };
    }
    
    // Invalid proof - return 402 with error
    const headers = createX402Headers(paymentRequest);
    return {
      requiresPayment: true,
      response: new Response(
        JSON.stringify({ 
          error: 'Payment verification failed', 
          details: verification.error,
          paymentRequest 
        }),
        { 
          status: 402, 
          headers: { 
            'Content-Type': 'application/json',
            ...headers 
          } 
        }
      ),
    };
  }

  // No payment proof - return 402 Payment Required
  const paymentRequest = createPaymentRequest({ amountUSD, resource, description });
  const headers = createX402Headers(paymentRequest);

  return {
    requiresPayment: true,
    response: new Response(
      JSON.stringify({ 
        error: 'Payment required',
        message: 'This endpoint requires payment via x402 protocol',
        paymentRequest,
        howToPay: {
          step1: 'Send the specified amount to the receiver address',
          step2: 'Include the transaction proof in X-402-Payment-Proof header',
          step3: 'Retry the request with the payment proof',
          documentation: 'https://mnnr.app/docs/x402',
        }
      }),
      { 
        status: 402, 
        headers: { 
          'Content-Type': 'application/json',
          ...headers 
        } 
      }
    ),
  };
}

/**
 * Express/Connect-style middleware for x402
 */
export function x402Middleware(options: {
  costCalculator: (req: Request) => number;
  exemptPaths?: string[];
}) {
  return async (request: Request, next: () => Promise<Response>): Promise<Response> => {
    const url = new URL(request.url);
    
    // Check if path is exempt
    if (options.exemptPaths?.some(path => url.pathname.startsWith(path))) {
      return next();
    }

    const cost = options.costCalculator(request);
    
    // Free requests pass through
    if (cost === 0) {
      return next();
    }

    const x402Result = await handleX402(request, { amountUSD: cost });
    
    if (x402Result.requiresPayment) {
      return x402Result.response!;
    }

    // Payment verified - proceed with request
    return next();
  };
}
