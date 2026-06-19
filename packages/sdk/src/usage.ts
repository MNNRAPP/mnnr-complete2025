/**
 * Usage sub-client — record + query metering events.
 */

import type { MnnrClient } from './client.js';
import type { UsageEvent, UsageQueryResult } from './types.js';

export interface ListUsageInput {
  period?: 'day' | 'week' | 'month' | 'year' | 'all';
  metric?: string;
}

export interface RecordUsageInput {
  metric: string;
  value?: number;
  metadata?: Record<string, unknown>;
}

export class UsageClient {
  constructor(private readonly client: MnnrClient) {}

  async list(input: ListUsageInput = {}): Promise<UsageQueryResult> {
    return this.client.request('/api/usage', {
      query: { period: input.period, metric: input.metric },
    });
  }

  async record(input: RecordUsageInput): Promise<UsageEvent> {
    return this.client.request('/api/usage', {
      method: 'POST',
      body: input,
    });
  }
}
