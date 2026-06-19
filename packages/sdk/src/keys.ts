/**
 * API-keys sub-client.
 *
 * `keys.create()` returns `{ key, ... }` with the full plaintext key. It is
 * shown by the server exactly once — store it immediately, never log it.
 */

import type { MnnrClient } from './client.js';
import type { ApiKey, ApiKeyWithSecret, Mode } from './types.js';

export interface CreateKeyInput {
  name: string;
  mode?: Mode;
}

export class KeysClient {
  constructor(private readonly client: MnnrClient) {}

  async list(): Promise<{ keys: ApiKey[] }> {
    return this.client.request('/api/keys');
  }

  async create(input: CreateKeyInput): Promise<ApiKeyWithSecret> {
    return this.client.request('/api/keys', {
      method: 'POST',
      body: input,
    });
  }

  async revoke(id: string): Promise<void> {
    return this.client.request('/api/keys', {
      method: 'DELETE',
      query: { id },
      expectNoBody: true,
    });
  }
}
