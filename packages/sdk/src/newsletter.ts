/**
 * Newsletter sub-client.
 *
 * The subscribe endpoint is enumeration-resistant — the response shape is
 * identical for new sign-ups, duplicates, and rate-limited domains.
 */

import type { MnnrClient } from './client.js';
import type { NewsletterSubscribeResult } from './types.js';

export interface SubscribeInput {
  email: string;
  /** Cloudflare Turnstile token from the widget. */
  turnstileToken: string;
}

export class NewsletterClient {
  constructor(private readonly client: MnnrClient) {}

  async subscribe(input: SubscribeInput): Promise<NewsletterSubscribeResult> {
    return this.client.request('/api/newsletter', {
      method: 'POST',
      body: input,
    });
  }
}
