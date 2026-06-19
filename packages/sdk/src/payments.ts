/**
 * Payments sub-client — x402 challenge + verify.
 *
 * Two-step flow:
 *   1. createChallenge() → server-bound payment challenge
 *   2. user pays on-chain referencing the nonce
 *   3. verify({ nonce, txHash }) → server runs verifyPaymentOnChain()
 *
 * Production gate: if PAYMENT_VERIFICATION_ENABLED is not 'true' on the
 * server, verify() throws MnnrError with status 503.
 */

import type { MnnrClient } from './client.js';
import type {
  PaymentChallenge,
  PaymentChallengeRequest,
  PaymentVerifyRequest,
  PaymentVerifyResult,
} from './types.js';

export class PaymentsClient {
  constructor(private readonly client: MnnrClient) {}

  /** Pull protocol metadata. */
  async info(): Promise<{
    version: string;
    supportedNetworks: string[];
    supportedTokens: string[];
  }> {
    return this.client.request('/api/x402');
  }

  async createChallenge(
    input: PaymentChallengeRequest,
  ): Promise<PaymentChallenge> {
    return this.client.request('/api/x402', {
      method: 'POST',
      body: { action: 'challenge', ...input },
    });
  }

  async verify(input: PaymentVerifyRequest): Promise<PaymentVerifyResult> {
    return this.client.request('/api/x402', {
      method: 'POST',
      body: { action: 'verify', ...input },
    });
  }
}
