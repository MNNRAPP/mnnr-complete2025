/**
 * Types mirroring the OpenAPI spec at /openapi.json.
 *
 * Hand-maintained — keep in sync with `openapi.yaml` at the repo root.
 * Future iteration: regenerate from the spec via `openapi-typescript`.
 */

export type Mode = 'live' | 'test';
export type Chain = 'base' | 'base-sepolia' | 'polygon';
export type TokenSymbol = 'USDC' | 'ETH';

export interface ApiKey {
  id: string;
  name: string;
  /** First ~8 chars of the key, for UI display. */
  prefix: string;
  mode: Mode;
  last_used_at: string | null;
  created_at: string;
  revoked_at: string | null;
}

export interface ApiKeyWithSecret extends ApiKey {
  /** Full plaintext key. Returned ONLY on create. */
  key: string;
}

export interface UsageEvent {
  id: string;
  metric: string;
  value: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface UsageQueryResult {
  period: 'day' | 'week' | 'month' | 'year' | 'all';
  events: UsageEvent[];
  aggregated: Record<string, { count: number; total: number }>;
}

export interface PaymentChallengeRequest {
  resource: string;
  amountUSD: string;
  token?: TokenSymbol;
  chain?: Chain;
}

export interface PaymentChallenge {
  nonce: string;
  receiver: string;
  amountUSD: string;
  amountAtomic: string;
  token: TokenSymbol;
  chain: Chain;
  paymentRequest: Record<string, unknown>;
  paymentUri: string;
  expiresAt: string;
}

export interface PaymentVerifyRequest {
  nonce: string;
  txHash: string;
  chain: Chain;
  executeAction?: Record<string, unknown>;
}

export interface PaymentVerifyResult {
  verified: boolean;
  txHash: string;
  receipt: Record<string, unknown>;
  actionResult: Record<string, unknown>;
}

export interface NewsletterSubscribeResult {
  ok: boolean;
  message: string;
}

export interface MnnrErrorBody {
  error: string;
  reason?: string;
  message?: string;
  details?: Record<string, unknown>;
}

/**
 * Error thrown for every non-2xx response. The HTTP status, the response body
 * (parsed if JSON, raw string otherwise), and the URL are all attached so
 * callers can branch on `status` / `body.error` without re-reading the
 * response.
 */
export class MnnrError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: MnnrErrorBody | string | null,
    public readonly url: string,
  ) {
    super(message);
    this.name = 'MnnrError';
  }
}
