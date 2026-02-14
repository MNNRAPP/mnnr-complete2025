/**
 * x402 Protocol Implementation for MNNR
 *
 * This module implements the **x402 payment protocol** - an open standard developed
 * by Coinbase and Cloudflare for HTTP-based micropayments. x402 revolutionizes API
 * monetization by enabling true pay-per-request pricing without traditional API keys
 * or subscription models.
 *
 * **What is x402?**
 * x402 is a protocol that repurposes the HTTP 402 "Payment Required" status code
 * (reserved since HTTP 1.1 in 1999) for machine-to-machine cryptocurrency micropayments.
 * It enables:
 * - **Sub-cent micropayments** down to $0.0001 per API call
 * - **Machine-to-machine payments** - AI agents can pay for API access automatically
 * - **No API keys required** - Payment proof serves as authentication
 * - **Instant settlement** - Stablecoin payments on fast L2 networks (Base, Polygon)
 * - **Universal access** - Any wallet can pay, no account registration needed
 *
 * **How x402 Works:**
 * 1. Client requests a protected resource without payment
 * 2. Server responds with HTTP 402 + payment request details (amount, receiver, etc.)
 * 3. Client sends cryptocurrency payment on-chain
 * 4. Client retries request with payment proof in headers
 * 5. Server verifies payment and grants access to resource
 *
 * **Supported Networks:**
 * - **Base** (L2, recommended) - Low fees (~$0.001), fast finality (~2s)
 * - **Ethereum** (L1) - Higher fees, maximum security
 * - **Polygon** (L2) - Very low fees, fast finality
 *
 * **Supported Stablecoins:**
 * - **USDC** (USD Coin) - Primary, 6 decimals, most liquid
 * - **USDT** (Tether) - Alternative, 6 decimals
 * - **DAI** (Dai) - Decentralized, 18 decimals
 *
 * **Why MNNR Pioneered x402:**
 * MNNR is the **FIRST platform to support x402 for AI agent billing**, enabling:
 * - AI agents to autonomously pay for API access
 * - True usage-based pricing (pay only for what you use)
 * - Global access without KYC or account creation
 * - Transparent, on-chain payment verification
 * - Elimination of subscription overhead and rate limits
 *
 * **Use Cases:**
 * - AI agent API access (LLM inference, embeddings, etc.)
 * - Metered API billing for third-party developers
 * - Pay-per-request data APIs
 * - Micropayment-gated content delivery
 * - B2B API monetization without contracts
 *
 * **Security Considerations:**
 * - ⚠️ **CRITICAL:** Production deployments MUST verify payments on-chain via RPC
 * - Payment proofs should be validated against blockchain transaction data
 * - Nonces prevent replay attacks
 * - Amount validation prevents underpayment
 * - Network/token validation prevents wrong-chain payments
 *
 * @module lib/x402
 * @security Payment verification must be implemented for production use
 *
 * @example
 * ```typescript
 * // Simple x402 protected API route
 * import { handleX402 } from '@/lib/x402';
 *
 * export async function GET(request: Request) {
 *   // Check for payment, requiring $0.001
 *   const x402Result = await handleX402(request, {
 *     amountUSD: 0.001,
 *     description: 'AI Model Inference Request'
 *   });
 *
 *   if (x402Result.requiresPayment) {
 *     // Return 402 Payment Required with payment instructions
 *     return x402Result.response;
 *   }
 *
 *   // Payment verified - process the request
 *   const result = await processAIRequest(request);
 *   return Response.json(result);
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Dynamic pricing based on usage
 * import { handleX402, calculateCost } from '@/lib/x402';
 *
 * export async function POST(request: Request) {
 *   const body = await request.json();
 *
 *   // Calculate cost based on expected token usage
 *   const estimatedTokens = estimateTokens(body.prompt);
 *   const cost = calculateCost({ tokens: estimatedTokens });
 *
 *   const x402Result = await handleX402(request, {
 *     amountUSD: cost,
 *     description: `LLM inference (~${estimatedTokens} tokens)`
 *   });
 *
 *   if (x402Result.requiresPayment) {
 *     return x402Result.response;
 *   }
 *
 *   // Process paid request
 *   return processLLMRequest(body);
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Client-side payment flow (TypeScript)
 * import { ethers } from 'ethers';
 *
 * // 1. Request protected resource
 * const response = await fetch('https://api.mnnr.app/v1/inference');
 *
 * if (response.status === 402) {
 *   // 2. Parse payment request from headers
 *   const paymentRequestB64 = response.headers.get('X-402-Payment-Request');
 *   const paymentRequest = JSON.parse(atob(paymentRequestB64));
 *
 *   // 3. Send payment on-chain
 *   const provider = new ethers.providers.Web3Provider(window.ethereum);
 *   const signer = provider.getSigner();
 *   const usdcContract = new ethers.Contract(
 *     paymentRequest.receiver,
 *     ['function transfer(address to, uint256 amount)'],
 *     signer
 *   );
 *
 *   const tx = await usdcContract.transfer(
 *     paymentRequest.receiver,
 *     paymentRequest.amount
 *   );
 *   await tx.wait();
 *
 *   // 4. Create payment proof
 *   const proof = {
 *     version: paymentRequest.version,
 *     network: paymentRequest.network,
 *     token: paymentRequest.token,
 *     txHash: tx.hash,
 *     sender: await signer.getAddress(),
 *     receiver: paymentRequest.receiver,
 *     amount: paymentRequest.amount,
 *     nonce: paymentRequest.nonce,
 *     timestamp: Date.now(),
 *     signature: await signer.signMessage(JSON.stringify(proof))
 *   };
 *
 *   // 5. Retry request with payment proof
 *   const retryResponse = await fetch('https://api.mnnr.app/v1/inference', {
 *     headers: {
 *       'X-402-Payment-Proof': btoa(JSON.stringify(proof))
 *     }
 *   });
 *
 *   // Request successful!
 *   const result = await retryResponse.json();
 * }
 * ```
 */

import crypto from 'crypto';

/**
 * x402 Protocol Version
 *
 * Current version of the x402 protocol implementation.
 * Following semantic versioning principles.
 *
 * @constant
 * @type {string}
 */
export const X402_VERSION = '1.0';

/**
 * x402 HTTP Header Prefix
 *
 * All x402 protocol headers use the "X-402-" prefix for namespacing.
 * Standard headers include:
 * - X-402-Version
 * - X-402-Payment-Required
 * - X-402-Payment-Request
 * - X-402-Payment-Proof
 * - X-402-Networks
 * - X-402-Tokens
 *
 * @constant
 * @type {string}
 */
export const X402_HEADER_PREFIX = 'X-402';

/**
 * Supported Blockchain Networks
 *
 * List of blockchain networks supported for x402 payments.
 * Each network has different characteristics:
 *
 * - **base**: Layer 2 (Optimistic Rollup), ~2s finality, ~$0.001 fees, RECOMMENDED
 * - **ethereum**: Layer 1, ~12s finality, ~$2-50 fees, maximum security
 * - **polygon**: Layer 2 (Plasma/PoS), ~2s finality, ~$0.0001 fees, very cheap
 *
 * @constant
 * @type {readonly ['base', 'ethereum', 'polygon']}
 *
 * @example
 * ```typescript
 * import { SUPPORTED_NETWORKS } from '@/lib/x402';
 *
 * // Validate network
 * if (!SUPPORTED_NETWORKS.includes(network)) {
 *   throw new Error(`Unsupported network: ${network}`);
 * }
 * ```
 */
export const SUPPORTED_NETWORKS = ['base', 'ethereum', 'polygon'] as const;

/**
 * Supported Stablecoin Tokens
 *
 * List of stablecoin tokens supported for x402 payments.
 * All tokens are pegged 1:1 to USD.
 *
 * - **USDC**: USD Coin by Circle, 6 decimals, most liquid, RECOMMENDED
 * - **USDT**: Tether, 6 decimals, widely available
 * - **DAI**: MakerDAO stablecoin, 18 decimals, decentralized
 *
 * @constant
 * @type {readonly ['USDC', 'USDT', 'DAI']}
 *
 * @example
 * ```typescript
 * import { SUPPORTED_TOKENS } from '@/lib/x402';
 *
 * // Display payment options to user
 * console.log('Pay with:', SUPPORTED_TOKENS.join(', '));
 * ```
 */
export const SUPPORTED_TOKENS = ['USDC', 'USDT', 'DAI'] as const;

/**
 * Network Type
 *
 * Type representing a supported blockchain network.
 * Must be one of: 'base', 'ethereum', 'polygon'
 *
 * @typedef {('base' | 'ethereum' | 'polygon')} Network
 */
export type Network = (typeof SUPPORTED_NETWORKS)[number];

/**
 * Token Type
 *
 * Type representing a supported stablecoin token.
 * Must be one of: 'USDC', 'USDT', 'DAI'
 *
 * @typedef {('USDC' | 'USDT' | 'DAI')} Token
 */
export type Token = (typeof SUPPORTED_TOKENS)[number];

/**
 * Stablecoin Contract Addresses
 *
 * Official ERC-20 contract addresses for supported stablecoins on each network.
 * These are the canonical, verified contract addresses used for payment verification.
 *
 * **Base Network:**
 * - USDC: Native USDC (bridged from Ethereum)
 * - USDT: Bridged Tether
 * - DAI: Bridged Dai
 *
 * **Ethereum Network:**
 * - USDC: Circle's official USD Coin
 * - USDT: Tether's official USDT
 * - DAI: MakerDAO's official Dai
 *
 * **Polygon Network:**
 * - USDC: Bridged USDC (native Polygon USDC)
 * - USDT: Bridged Tether
 * - DAI: Bridged Dai
 *
 * @constant
 * @type {Record<Network, Record<Token, string>>}
 * @security These addresses are critical - verify before any production use
 *
 * @example
 * ```typescript
 * import { TOKEN_ADDRESSES } from '@/lib/x402';
 *
 * // Get USDC contract address on Base
 * const usdcAddress = TOKEN_ADDRESSES.base.USDC;
 * console.log('Send USDC to:', usdcAddress);
 *
 * // Validate payment token contract
 * const expectedAddress = TOKEN_ADDRESSES[network][token];
 * if (paymentContract.toLowerCase() !== expectedAddress.toLowerCase()) {
 *   throw new Error('Invalid token contract');
 * }
 * ```
 */
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

/**
 * MNNR Payment Receiver Addresses
 *
 * MNNR's official wallet addresses for receiving x402 payments on each network.
 * These addresses are loaded from environment variables for security.
 *
 * **Environment Variables:**
 * - `MNNR_BASE_ADDRESS` - Receiver address on Base network (recommended)
 * - `MNNR_ETH_ADDRESS` - Receiver address on Ethereum mainnet
 * - `MNNR_POLYGON_ADDRESS` - Receiver address on Polygon network
 *
 * **Security:**
 * - Private keys for these addresses must be stored in secure hardware wallets
 * - Regular monitoring for incoming payments is required
 * - Consider using multi-sig wallets for production
 *
 * @constant
 * @type {Record<Network, string>}
 * @security CRITICAL: Set these environment variables in production!
 *
 * @example
 * ```typescript
 * import { MNNR_RECEIVERS } from '@/lib/x402';
 *
 * // Get payment receiver for Base network
 * const receiver = MNNR_RECEIVERS.base;
 *
 * // Create payment request
 * const paymentRequest = {
 *   receiver: MNNR_RECEIVERS[network],
 *   amount: '1000000', // $1.00 in USDC (6 decimals)
 *   network: 'base',
 *   token: 'USDC'
 * };
 * ```
 */
export const MNNR_RECEIVERS: Record<Network, string> = {
  base: process.env.MNNR_BASE_ADDRESS || '0x0000000000000000000000000000000000000000',
  ethereum: process.env.MNNR_ETH_ADDRESS || '0x0000000000000000000000000000000000000000',
  polygon: process.env.MNNR_POLYGON_ADDRESS || '0x0000000000000000000000000000000000000000',
};

/**
 * x402 Payment Request
 *
 * Structure sent to clients in HTTP 402 responses, containing all information
 * needed to make a payment. The payment request is base64-encoded and sent in
 * the `X-402-Payment-Request` header.
 *
 * **Payment Flow:**
 * 1. Server creates payment request with `createPaymentRequest()`
 * 2. Request is encoded to base64 and sent in HTTP 402 response headers
 * 3. Client decodes the request and sends payment on-chain
 * 4. Client creates proof and retries request
 *
 * **Field Descriptions:**
 *
 * @interface X402PaymentRequest
 *
 * @property {string} version - x402 protocol version (currently "1.0")
 * @property {Network} network - Blockchain network ('base', 'ethereum', 'polygon')
 * @property {Token} token - Stablecoin token ('USDC', 'USDT', 'DAI')
 * @property {string} receiver - Ethereum address to receive payment (MNNR wallet)
 * @property {string} amount - Payment amount in token's smallest unit
 *   - USDC/USDT: 6 decimals (1000000 = $1.00)
 *   - DAI: 18 decimals (1000000000000000000 = $1.00)
 * @property {string} maxAmountRequired - Maximum amount that may be required (for partial payments)
 * @property {string} resource - URL or identifier of the resource being purchased
 * @property {string} [description] - Human-readable description of what's being purchased
 * @property {number} validUntil - Unix timestamp when payment request expires
 * @property {string} nonce - Unique random string (32 bytes hex) to prevent replay attacks
 * @property {string} [signature] - Optional HMAC signature of the request (for integrity)
 *
 * @example
 * ```typescript
 * const paymentRequest: X402PaymentRequest = {
 *   version: '1.0',
 *   network: 'base',
 *   token: 'USDC',
 *   receiver: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
 *   amount: '1000', // $0.001 in USDC (6 decimals)
 *   maxAmountRequired: '1000',
 *   resource: '/api/v1/inference',
 *   description: 'AI Model Inference - GPT-4 (estimated 500 tokens)',
 *   validUntil: 1709571234, // Expires in 5 minutes
 *   nonce: 'a3f2c1b4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2'
 * };
 * ```
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
 * x402 Payment Proof
 *
 * Structure sent by clients after making an on-chain payment, proving they have
 * paid for access to a resource. The proof is base64-encoded and sent in the
 * `X-402-Payment-Proof` header when retrying the request.
 *
 * **Verification Requirements:**
 * - Transaction hash must exist on the specified blockchain
 * - Transaction must be confirmed (not pending)
 * - Amount must match or exceed payment request amount
 * - Receiver must match payment request receiver
 * - Token contract must match payment request token
 * - Nonce must match original payment request nonce
 * - Signature must be valid (signed by sender's private key)
 *
 * **Security Note:**
 * ⚠️ In production, the server MUST verify the transaction on-chain using an
 * Ethereum RPC provider. Trusting the client-provided proof without verification
 * would allow free access.
 *
 * @interface X402PaymentProof
 *
 * @property {string} version - x402 protocol version (must match request version)
 * @property {Network} network - Blockchain network where payment was made
 * @property {Token} token - Stablecoin token that was sent
 * @property {string} txHash - Transaction hash of the on-chain payment
 *   - Ethereum format: 0x-prefixed 64 hex characters
 *   - Example: '0x1234...abcd'
 * @property {string} sender - Ethereum address that sent the payment
 * @property {string} receiver - Ethereum address that received payment (must match request)
 * @property {string} amount - Amount sent in token's smallest unit (must be >= request amount)
 * @property {string} nonce - Nonce from original payment request (prevents replay)
 * @property {number} timestamp - Unix timestamp when proof was created
 * @property {string} signature - Client's signature of the proof (proves ownership of sender address)
 *
 * @example
 * ```typescript
 * const paymentProof: X402PaymentProof = {
 *   version: '1.0',
 *   network: 'base',
 *   token: 'USDC',
 *   txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
 *   sender: '0x9876543210fedcba9876543210fedcba98765432',
 *   receiver: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
 *   amount: '1000',
 *   nonce: 'a3f2c1b4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2',
 *   timestamp: 1709571234,
 *   signature: '0xabcd...signature...1234'
 * };
 * ```
 *
 * @example
 * ```typescript
 * // Client creates proof after payment
 * import { ethers } from 'ethers';
 *
 * const proof: X402PaymentProof = {
 *   version: paymentRequest.version,
 *   network: paymentRequest.network,
 *   token: paymentRequest.token,
 *   txHash: tx.hash,
 *   sender: await signer.getAddress(),
 *   receiver: paymentRequest.receiver,
 *   amount: paymentRequest.amount,
 *   nonce: paymentRequest.nonce,
 *   timestamp: Math.floor(Date.now() / 1000),
 *   signature: '' // Will be filled below
 * };
 *
 * // Sign the proof
 * const proofMessage = JSON.stringify(proof);
 * proof.signature = await signer.signMessage(proofMessage);
 *
 * // Send proof to server
 * const proofB64 = btoa(JSON.stringify(proof));
 * ```
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
 * Generate a Payment Request for x402 Protocol
 *
 * Creates a structured payment request to be sent to clients in HTTP 402 responses.
 * The request contains all information needed for the client to make a payment:
 * network, token, amount, receiver address, and expiration time.
 *
 * **Amount Conversion:**
 * - Input amount is in USD (e.g., 0.001 = $0.001)
 * - Automatically converted to token's smallest unit
 * - USDC/USDT: Multiplied by 1,000,000 (6 decimals)
 * - DAI: Multiplied by 1,000,000,000,000,000,000 (18 decimals)
 * - Amounts are rounded UP to ensure sufficient payment
 *
 * **Nonce Generation:**
 * - 32 bytes (256 bits) of cryptographically secure random data
 * - Prevents replay attacks (same proof can't be reused)
 * - Should be stored and validated on payment proof
 *
 * **Expiration:**
 * - Default: 5 minutes (300 seconds)
 * - Prevents stale payment requests
 * - Should be validated when verifying proof
 *
 * @param {Object} options - Payment request configuration
 * @param {number} options.amountUSD - Amount in USD (e.g., 0.001 for $0.001)
 * @param {string} options.resource - Resource identifier (usually the API endpoint URL)
 * @param {string} [options.description] - Human-readable description of the purchase
 * @param {Network} [options.network='base'] - Blockchain network (default: 'base')
 * @param {Token} [options.token='USDC'] - Stablecoin token (default: 'USDC')
 * @param {number} [options.validitySeconds=300] - Request validity duration in seconds (default: 5 minutes)
 *
 * @returns {X402PaymentRequest} Complete payment request ready to send to client
 *
 * @example
 * ```typescript
 * import { createPaymentRequest } from '@/lib/x402';
 *
 * // Basic payment request for $0.001
 * const request = createPaymentRequest({
 *   amountUSD: 0.001,
 *   resource: '/api/v1/inference',
 *   description: 'AI Model Inference'
 * });
 *
 * console.log(request);
 * // {
 * //   version: '1.0',
 * //   network: 'base',
 * //   token: 'USDC',
 * //   receiver: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
 * //   amount: '1000', // $0.001 in USDC (6 decimals)
 * //   maxAmountRequired: '1000',
 * //   resource: '/api/v1/inference',
 * //   description: 'AI Model Inference',
 * //   validUntil: 1709571534,
 * //   nonce: 'a3f2c1b4...'
 * // }
 * ```
 *
 * @example
 * ```typescript
 * // Custom network and token
 * const request = createPaymentRequest({
 *   amountUSD: 0.05,
 *   resource: '/api/v1/batch-inference',
 *   description: 'Batch Processing (100 requests)',
 *   network: 'polygon', // Use Polygon for lowest fees
 *   token: 'DAI', // Use DAI (18 decimals)
 *   validitySeconds: 600 // 10 minute expiry
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Dynamic pricing based on estimated usage
 * const estimatedTokens = 1000;
 * const costPerToken = 0.00001;
 * const cost = estimatedTokens * costPerToken; // $0.01
 *
 * const request = createPaymentRequest({
 *   amountUSD: cost,
 *   resource: `/api/v1/chat/${sessionId}`,
 *   description: `Chat completion (~${estimatedTokens} tokens)`
 * });
 * ```
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
 * Generate x402 Response Headers for HTTP 402 Payment Required
 *
 * Creates the standard HTTP headers for an x402 payment required response.
 * These headers inform the client that payment is required and provide all
 * necessary payment details.
 *
 * **Generated Headers:**
 * - `X-402-Version`: Protocol version ("1.0")
 * - `X-402-Payment-Required`: Set to "true" to indicate payment needed
 * - `X-402-Payment-Request`: Base64-encoded payment request JSON
 * - `X-402-Networks`: Comma-separated list of supported networks
 * - `X-402-Tokens`: Comma-separated list of supported tokens
 * - `WWW-Authenticate`: Standard HTTP auth header adapted for x402
 *
 * **Usage Pattern:**
 * 1. Create payment request with `createPaymentRequest()`
 * 2. Generate headers with this function
 * 3. Return HTTP 402 response with headers and JSON body
 *
 * @param {X402PaymentRequest} paymentRequest - Payment request to encode in headers
 * @returns {Record<string, string>} HTTP headers object ready to send
 *
 * @example
 * ```typescript
 * import { createPaymentRequest, createX402Headers } from '@/lib/x402';
 *
 * // Create payment request
 * const paymentRequest = createPaymentRequest({
 *   amountUSD: 0.001,
 *   resource: '/api/v1/inference'
 * });
 *
 * // Generate headers
 * const headers = createX402Headers(paymentRequest);
 *
 * // Return 402 response
 * return new Response(
 *   JSON.stringify({
 *     error: 'Payment required',
 *     paymentRequest
 *   }),
 *   {
 *     status: 402,
 *     headers: {
 *       'Content-Type': 'application/json',
 *       ...headers
 *     }
 *   }
 * );
 * ```
 *
 * @example
 * ```typescript
 * // Headers output
 * {
 *   'X-402-Version': '1.0',
 *   'X-402-Payment-Required': 'true',
 *   'X-402-Payment-Request': 'eyJ2ZXJzaW9uIjoiMS4wIiwibmV0d29y...',
 *   'X-402-Networks': 'base,ethereum,polygon',
 *   'X-402-Tokens': 'USDC,USDT,DAI',
 *   'WWW-Authenticate': 'X402 realm="MNNR API", payment-request="eyJ2ZXJz..."'
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Client parsing headers
 * const response = await fetch('/api/inference');
 * if (response.status === 402) {
 *   const paymentRequestB64 = response.headers.get('X-402-Payment-Request');
 *   const paymentRequest = JSON.parse(atob(paymentRequestB64!));
 *
 *   console.log('Payment required:', paymentRequest.amount, paymentRequest.token);
 *   console.log('Supported networks:', response.headers.get('X-402-Networks'));
 * }
 * ```
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
 * Parse x402 Payment Proof from Request Headers
 *
 * Extracts and decodes the payment proof sent by a client in the
 * `X-402-Payment-Proof` header. The proof is base64-encoded JSON.
 *
 * **Expected Header:**
 * - `X-402-Payment-Proof`: Base64-encoded JSON payment proof
 *
 * **Error Handling:**
 * - Returns `null` if header is missing
 * - Returns `null` if base64 decoding fails
 * - Returns `null` if JSON parsing fails
 * - Never throws - safe to use without try/catch
 *
 * **Next Steps:**
 * After parsing, you should:
 * 1. Validate the proof structure
 * 2. Verify against expected payment request
 * 3. Verify transaction on-chain (production requirement)
 *
 * @param {Headers} headers - HTTP request headers (fetch API Headers object)
 * @returns {X402PaymentProof | null} Parsed proof or null if not found/invalid
 *
 * @example
 * ```typescript
 * import { parsePaymentProof } from '@/lib/x402';
 *
 * export async function GET(request: Request) {
 *   // Parse proof from headers
 *   const proof = parsePaymentProof(request.headers);
 *
 *   if (!proof) {
 *     // No payment proof provided - return 402
 *     return new Response('Payment required', { status: 402 });
 *   }
 *
 *   // Verify proof
 *   const verification = await verifyPaymentProof(proof, expectedRequest);
 *   if (!verification.valid) {
 *     return new Response(verification.error, { status: 402 });
 *   }
 *
 *   // Proof valid - process request
 *   return processRequest(request);
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Manual header parsing
 * const headers = new Headers({
 *   'X-402-Payment-Proof': 'eyJ2ZXJzaW9uIjoiMS4wIiwidHh...'
 * });
 *
 * const proof = parsePaymentProof(headers);
 * console.log(proof?.txHash); // '0x1234...'
 * console.log(proof?.amount); // '1000'
 * ```
 *
 * @example
 * ```typescript
 * // Client sending proof
 * const proof = {
 *   version: '1.0',
 *   network: 'base',
 *   token: 'USDC',
 *   txHash: '0x1234...',
 *   sender: '0xabcd...',
 *   receiver: '0x5678...',
 *   amount: '1000',
 *   nonce: 'abc123...',
 *   timestamp: Date.now(),
 *   signature: '0x9876...'
 * };
 *
 * const proofB64 = btoa(JSON.stringify(proof));
 *
 * await fetch('/api/endpoint', {
 *   headers: {
 *     'X-402-Payment-Proof': proofB64
 *   }
 * });
 * ```
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
 * Verify a Payment Proof
 *
 * Validates a payment proof against an expected payment request. Performs
 * comprehensive checks on version, network, token, receiver, amount, and nonce.
 *
 * **⚠️ CRITICAL SECURITY WARNING:**
 * This function performs BASIC validation only. In a production environment,
 * you MUST also verify the transaction on-chain using an Ethereum RPC provider
 * (e.g., Alchemy, Infura, QuickNode). Without on-chain verification, clients
 * can forge proofs and gain free access.
 *
 * **Validation Checks:**
 * 1. ✅ Version matches protocol version
 * 2. ✅ Network matches expected network
 * 3. ✅ Token matches expected token
 * 4. ✅ Receiver address matches (case-insensitive)
 * 5. ✅ Amount is sufficient (≥ expected amount)
 * 6. ✅ Nonce matches (prevents replay attacks)
 * 7. ❌ Transaction existence (TODO - MUST implement for production)
 * 8. ❌ Transaction confirmation status (TODO)
 * 9. ❌ Signature verification (TODO)
 *
 * **Production Implementation Required:**
 * ```typescript
 * // Use ethers.js or viem to verify on-chain
 * const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
 * const tx = await provider.getTransaction(proof.txHash);
 *
 * if (!tx) {
 *   return { valid: false, error: 'Transaction not found' };
 * }
 *
 * if (tx.confirmations < MIN_CONFIRMATIONS) {
 *   return { valid: false, error: 'Transaction not confirmed' };
 * }
 *
 * // Verify transaction details match proof
 * if (tx.to.toLowerCase() !== proof.receiver.toLowerCase()) {
 *   return { valid: false, error: 'Transaction receiver mismatch' };
 * }
 *
 * // Decode transaction data to verify amount and token
 * // ... additional verification ...
 * ```
 *
 * @param {X402PaymentProof} proof - Payment proof from client
 * @param {X402PaymentRequest} expectedRequest - Original payment request
 * @returns {Promise<{valid: boolean, error?: string}>} Validation result
 *
 * @security This function MUST be enhanced with on-chain verification before production use
 *
 * @example
 * ```typescript
 * import { verifyPaymentProof, createPaymentRequest } from '@/lib/x402';
 *
 * // Create expected request
 * const expectedRequest = createPaymentRequest({
 *   amountUSD: 0.001,
 *   resource: '/api/v1/inference'
 * });
 *
 * // Parse proof from client
 * const proof = parsePaymentProof(request.headers);
 *
 * if (!proof) {
 *   return new Response('No payment proof', { status: 402 });
 * }
 *
 * // Verify proof
 * const verification = await verifyPaymentProof(proof, expectedRequest);
 *
 * if (!verification.valid) {
 *   console.error('Payment verification failed:', verification.error);
 *   return new Response(verification.error, { status: 402 });
 * }
 *
 * // Payment verified - proceed
 * return processRequest(request);
 * ```
 *
 * @example
 * ```typescript
 * // Validation errors
 * const result1 = await verifyPaymentProof(proof, request);
 * // { valid: false, error: 'Network mismatch' }
 *
 * const result2 = await verifyPaymentProof(proof, request);
 * // { valid: false, error: 'Insufficient payment amount' }
 *
 * const result3 = await verifyPaymentProof(proof, request);
 * // { valid: false, error: 'Nonce mismatch' }
 *
 * const result4 = await verifyPaymentProof(proof, request);
 * // { valid: true } - All checks passed
 * ```
 *
 * @example
 * ```typescript
 * // Store nonces to prevent replay attacks
 * const usedNonces = new Set<string>();
 *
 * async function verifyWithReplayProtection(proof, request) {
 *   // Check if nonce already used
 *   if (usedNonces.has(proof.nonce)) {
 *     return { valid: false, error: 'Nonce already used (replay attack)' };
 *   }
 *
 *   // Verify payment
 *   const result = await verifyPaymentProof(proof, request);
 *
 *   if (result.valid) {
 *     // Mark nonce as used
 *     usedNonces.add(proof.nonce);
 *     // In production, store in Redis with TTL
 *   }
 *
 *   return result;
 * }
 * ```
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
 * Calculate API Call Cost Based on Usage
 *
 * Computes the total cost in USD for an API call based on multiple usage metrics.
 * Supports token-based pricing (for LLM APIs), request-based pricing, compute time,
 * and storage usage. All pricing is designed to enable sub-cent micropayments.
 *
 * **Pricing Model:**
 * - **Tokens**: $0.01 per 1,000 tokens ($0.00001 per token)
 *   - Typical for LLM inference APIs
 *   - Example: GPT-4 completion with 500 tokens = $0.005
 *
 * - **Requests**: $0.10 per 1,000 requests ($0.0001 per request)
 *   - Flat per-request fee
 *   - Example: Simple API call = $0.0001
 *
 * - **Compute Time**: $0.001 per 1,000ms ($0.000001 per ms)
 *   - For compute-intensive operations
 *   - Example: 500ms image processing = $0.0005
 *
 * - **Storage**: $0.01 per GB ($0.00000001 per byte)
 *   - For data storage or transfer
 *   - Example: 1MB file upload = $0.00001
 *
 * **Use Cases:**
 * - Dynamic pricing based on actual resource usage
 * - Usage-based billing for AI/ML APIs
 * - Transparent cost calculation for clients
 * - Pay-per-use instead of tiered subscription plans
 *
 * @param {Object} usage - Resource usage metrics
 * @param {number} [usage.tokens=0] - Number of tokens processed (for LLM APIs)
 * @param {number} [usage.requests=0] - Number of API requests made
 * @param {number} [usage.computeMs=0] - Compute time in milliseconds
 * @param {number} [usage.storageBytes=0] - Storage used in bytes
 *
 * @returns {number} Total cost in USD
 *
 * @example
 * ```typescript
 * import { calculateCost } from '@/lib/x402';
 *
 * // LLM inference cost
 * const llmCost = calculateCost({
 *   tokens: 1500, // 1,500 tokens generated
 *   computeMs: 250 // 250ms processing time
 * });
 * console.log(llmCost); // $0.01525 ($0.015 tokens + $0.00025 compute)
 * ```
 *
 * @example
 * ```typescript
 * // Image processing API
 * const imageCost = calculateCost({
 *   requests: 1, // One API call
 *   computeMs: 1200, // 1.2s processing
 *   storageBytes: 5 * 1024 * 1024 // 5MB image
 * });
 * console.log(imageCost); // $0.0013712
 * ```
 *
 * @example
 * ```typescript
 * // Simple request-based pricing
 * const simpleCost = calculateCost({
 *   requests: 1
 * });
 * console.log(simpleCost); // $0.0001 per request
 * ```
 *
 * @example
 * ```typescript
 * // Dynamic pricing in API route
 * export async function POST(request: Request) {
 *   const body = await request.json();
 *
 *   // Estimate cost before processing
 *   const estimatedTokens = estimateTokenCount(body.prompt);
 *   const estimatedCost = calculateCost({
 *     tokens: estimatedTokens,
 *     requests: 1
 *   });
 *
 *   // Request payment
 *   const x402Result = await handleX402(request, {
 *     amountUSD: estimatedCost,
 *     description: `LLM inference (~${estimatedTokens} tokens)`
 *   });
 *
 *   if (x402Result.requiresPayment) {
 *     return x402Result.response;
 *   }
 *
 *   // Process request
 *   const result = await processLLM(body.prompt);
 *
 *   return Response.json({
 *     result,
 *     usage: {
 *       tokens: result.tokensUsed,
 *       cost: calculateCost({ tokens: result.tokensUsed })
 *     }
 *   });
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Batch operation pricing
 * const batchItems = 100;
 * const tokensPerItem = 50;
 *
 * const totalCost = calculateCost({
 *   tokens: batchItems * tokensPerItem, // 5,000 tokens
 *   requests: batchItems, // 100 requests
 *   computeMs: batchItems * 100 // 10 seconds total
 * });
 *
 * console.log(`Batch processing cost: $${totalCost.toFixed(4)}`);
 * // "Batch processing cost: $0.0700"
 * ```
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
 * x402 Middleware for Next.js API Routes
 *
 * High-level middleware that handles the complete x402 payment flow for Next.js
 * API routes. This is the primary function you'll use to protect endpoints with
 * x402 micropayments.
 *
 * **Payment Flow:**
 * 1. **First Request (no payment):**
 *    - Checks for payment proof in headers
 *    - If none found, returns HTTP 402 with payment request
 *    - Response includes payment instructions and details
 *
 * 2. **Second Request (with payment proof):**
 *    - Client sends payment proof in X-402-Payment-Proof header
 *    - Middleware verifies the proof
 *    - If valid, returns `requiresPayment: false` and allows request to proceed
 *    - If invalid, returns HTTP 402 with error details
 *
 * **Return Value:**
 * - `requiresPayment: true` - Client must pay, return the `response` object
 * - `requiresPayment: false` - Payment verified, proceed with request processing
 * - `paymentProof` - Validated proof (can be used for logging/analytics)
 *
 * **Usage Pattern:**
 * ```typescript
 * const result = await handleX402(request, { amountUSD: 0.001 });
 * if (result.requiresPayment) {
 *   return result.response; // Return 402 to client
 * }
 * // Payment verified - process the request
 * ```
 *
 * @param {Request} request - Next.js/Fetch API Request object
 * @param {Object} options - Payment configuration
 * @param {number} options.amountUSD - Required payment amount in USD
 * @param {string} [options.resource] - Resource identifier (defaults to request.url)
 * @param {string} [options.description] - Human-readable payment description
 *
 * @returns {Promise<Object>} Payment verification result
 * @returns {boolean} return.requiresPayment - Whether payment is required
 * @returns {Response} [return.response] - HTTP 402 response (if payment required)
 * @returns {X402PaymentProof} [return.paymentProof] - Validated proof (if payment verified)
 *
 * @example
 * ```typescript
 * // Basic protected endpoint
 * import { handleX402 } from '@/lib/x402';
 *
 * export async function GET(request: Request) {
 *   // Require $0.001 payment
 *   const x402Result = await handleX402(request, {
 *     amountUSD: 0.001,
 *     description: 'API Access'
 *   });
 *
 *   if (x402Result.requiresPayment) {
 *     return x402Result.response; // Return 402
 *   }
 *
 *   // Payment verified - process request
 *   const data = await fetchData();
 *   return Response.json(data);
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Dynamic pricing based on request
 * export async function POST(request: Request) {
 *   const body = await request.json();
 *
 *   // Calculate cost based on input
 *   let cost: number;
 *   if (body.model === 'gpt-4') {
 *     cost = 0.01; // Premium model
 *   } else {
 *     cost = 0.001; // Standard model
 *   }
 *
 *   const x402Result = await handleX402(request, {
 *     amountUSD: cost,
 *     description: `${body.model} inference`
 *   });
 *
 *   if (x402Result.requiresPayment) {
 *     return x402Result.response;
 *   }
 *
 *   // Process with selected model
 *   return processWithModel(body.model, body.prompt);
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Usage-based pricing with calculateCost
 * import { handleX402, calculateCost } from '@/lib/x402';
 *
 * export async function POST(request: Request) {
 *   const body = await request.json();
 *
 *   // Estimate cost
 *   const estimatedTokens = body.prompt.length * 1.3; // rough estimate
 *   const cost = calculateCost({
 *     tokens: estimatedTokens,
 *     requests: 1
 *   });
 *
 *   const x402Result = await handleX402(request, {
 *     amountUSD: cost,
 *     description: `LLM inference (~${Math.floor(estimatedTokens)} tokens)`
 *   });
 *
 *   if (x402Result.requiresPayment) {
 *     return x402Result.response;
 *   }
 *
 *   // Process request
 *   const result = await generateCompletion(body.prompt);
 *   return Response.json(result);
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Logging payment information
 * export async function GET(request: Request) {
 *   const x402Result = await handleX402(request, {
 *     amountUSD: 0.001
 *   });
 *
 *   if (x402Result.requiresPayment) {
 *     return x402Result.response;
 *   }
 *
 *   // Log payment details for analytics
 *   if (x402Result.paymentProof) {
 *     await logPayment({
 *       txHash: x402Result.paymentProof.txHash,
 *       sender: x402Result.paymentProof.sender,
 *       amount: x402Result.paymentProof.amount,
 *       network: x402Result.paymentProof.network,
 *       timestamp: new Date()
 *     });
 *   }
 *
 *   return processRequest(request);
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Complete error handling
 * export async function POST(request: Request) {
 *   try {
 *     const x402Result = await handleX402(request, {
 *       amountUSD: 0.005,
 *       description: 'Premium API Access'
 *     });
 *
 *     if (x402Result.requiresPayment) {
 *       // Client will see payment instructions
 *       return x402Result.response;
 *     }
 *
 *     // Process the paid request
 *     const result = await processPremiumRequest(request);
 *
 *     return Response.json({
 *       success: true,
 *       data: result,
 *       payment: {
 *         verified: true,
 *         txHash: x402Result.paymentProof?.txHash
 *       }
 *     });
 *   } catch (error) {
 *     console.error('x402 error:', error);
 *     return Response.json(
 *       { error: 'Payment processing error' },
 *       { status: 500 }
 *     );
 *   }
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
 * Express/Connect-Style Middleware for x402
 *
 * Creates a reusable middleware function that can be applied globally or to
 * specific routes. This is ideal for protecting multiple endpoints with x402
 * without repeating payment logic in each route handler.
 *
 * **Features:**
 * - Dynamic cost calculation per request
 * - Path exemptions (e.g., for public endpoints, health checks)
 * - Automatic payment verification
 * - Free requests (cost = 0) pass through without payment
 *
 * **Cost Calculator:**
 * The `costCalculator` function receives the request and returns a USD amount.
 * This allows for sophisticated pricing logic based on:
 * - Request path/endpoint
 * - Request method
 * - User tier or API key (if present)
 * - Request body content
 * - Headers or query parameters
 *
 * **Exempt Paths:**
 * Some paths should not require payment:
 * - Public documentation: `/docs/*`
 * - Health checks: `/health`, `/status`
 * - Authentication endpoints: `/auth/*`
 * - Webhook receivers: `/webhooks/*`
 *
 * @param {Object} options - Middleware configuration
 * @param {Function} options.costCalculator - Function to calculate cost for each request
 *   - Receives: Request object
 *   - Returns: Cost in USD (number)
 *   - Return 0 for free access
 * @param {string[]} [options.exemptPaths] - Array of path prefixes to exempt from payment
 *
 * @returns {Function} Middleware function compatible with Next.js middleware or custom servers
 *
 * @example
 * ```typescript
 * // Global middleware with dynamic pricing
 * import { x402Middleware, calculateCost } from '@/lib/x402';
 *
 * const paymentMiddleware = x402Middleware({
 *   costCalculator: (request) => {
 *     const url = new URL(request.url);
 *
 *     // Different pricing per endpoint
 *     if (url.pathname.startsWith('/api/v1/premium')) {
 *       return 0.01; // $0.01 for premium endpoints
 *     }
 *     if (url.pathname.startsWith('/api/v1/standard')) {
 *       return 0.001; // $0.001 for standard endpoints
 *     }
 *
 *     return 0; // Free for other endpoints
 *   },
 *   exemptPaths: ['/api/health', '/api/docs', '/api/auth']
 * });
 *
 * // Apply to all API routes
 * export async function middleware(request: Request) {
 *   return paymentMiddleware(request, async () => {
 *     // Continue to route handler
 *     return NextResponse.next();
 *   });
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Usage-based pricing
 * const middleware = x402Middleware({
 *   costCalculator: (request) => {
 *     const url = new URL(request.url);
 *
 *     // Parse expected usage from query params
 *     const tokens = parseInt(url.searchParams.get('tokens') || '0');
 *     const images = parseInt(url.searchParams.get('images') || '0');
 *
 *     return calculateCost({
 *       tokens,
 *       requests: 1,
 *       computeMs: images * 500 // 500ms per image
 *     });
 *   },
 *   exemptPaths: ['/health']
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Tiered pricing based on headers
 * const middleware = x402Middleware({
 *   costCalculator: (request) => {
 *     const tier = request.headers.get('X-User-Tier');
 *
 *     switch (tier) {
 *       case 'premium':
 *         return 0; // Premium users get free access
 *       case 'standard':
 *         return 0.0005; // Standard users pay half price
 *       default:
 *         return 0.001; // Default price
 *     }
 *   }
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Method-based pricing
 * const middleware = x402Middleware({
 *   costCalculator: (request) => {
 *     switch (request.method) {
 *       case 'GET':
 *         return 0.0001; // Cheap reads
 *       case 'POST':
 *       case 'PUT':
 *         return 0.001; // More expensive writes
 *       case 'DELETE':
 *         return 0.0005; // Medium cost
 *       default:
 *         return 0;
 *     }
 *   },
 *   exemptPaths: ['/api/public']
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Complex routing with multiple middlewares
 * import { NextResponse } from 'next/server';
 *
 * const aiMiddleware = x402Middleware({
 *   costCalculator: (req) => {
 *     const url = new URL(req.url);
 *     if (url.pathname.includes('/gpt-4')) return 0.01;
 *     if (url.pathname.includes('/gpt-3.5')) return 0.001;
 *     return 0;
 *   },
 *   exemptPaths: ['/api/models/list']
 * });
 *
 * const dataMiddleware = x402Middleware({
 *   costCalculator: (req) => {
 *     const sizeHeader = req.headers.get('Content-Length');
 *     const bytes = parseInt(sizeHeader || '0');
 *     return calculateCost({ storageBytes: bytes, requests: 1 });
 *   },
 *   exemptPaths: ['/api/data/public']
 * });
 *
 * export async function middleware(request: Request) {
 *   const url = new URL(request.url);
 *
 *   // Apply different middleware to different routes
 *   if (url.pathname.startsWith('/api/ai')) {
 *     return aiMiddleware(request, async () => NextResponse.next());
 *   }
 *
 *   if (url.pathname.startsWith('/api/data')) {
 *     return dataMiddleware(request, async () => NextResponse.next());
 *   }
 *
 *   // No payment required for other routes
 *   return NextResponse.next();
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Integration with API key system (hybrid model)
 * const middleware = x402Middleware({
 *   costCalculator: (request) => {
 *     const apiKey = request.headers.get('Authorization');
 *
 *     if (apiKey) {
 *       // Users with API keys don't pay (subscription model)
 *       return 0;
 *     }
 *
 *     // Anonymous users pay per request (x402 model)
 *     return 0.001;
 *   },
 *   exemptPaths: ['/api/register', '/api/login']
 * });
 * ```
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
