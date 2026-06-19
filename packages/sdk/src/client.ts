/**
 * MnnrClient — the top-level entry point.
 *
 * ```ts
 * import { MnnrClient } from '@mnnr/sdk';
 *
 * const client = new MnnrClient({ apiKey: process.env.MNNR_API_KEY });
 * const usage = await client.usage.list({ period: 'week' });
 * ```
 *
 * Design notes
 * ------------
 * - Fetch-only. No `node-fetch`, no `axios`, no `cross-fetch`. Works on
 *   Node 18+, browsers, Cloudflare Workers, Vercel Edge, Deno.
 * - Sub-resources are lazy class instances on the client. Tree-shake-friendly
 *   if you import a single namespace from a future split-entry build.
 * - Errors always throw `MnnrError` — never a bare `Error`. Callers can do
 *   `if (e instanceof MnnrError && e.status === 402) …`.
 */

import { MnnrError, type MnnrErrorBody } from './types.js';
import { KeysClient } from './keys.js';
import { UsageClient } from './usage.js';
import { PaymentsClient } from './payments.js';
import { NewsletterClient } from './newsletter.js';

export interface MnnrClientOptions {
  /** Bearer API key (mnnr_live_… / mnnr_test_…). */
  apiKey?: string;
  /** Session cookie value — alternative to apiKey for dashboard-style auth. */
  sessionCookie?: string;
  /** CSRF token, required for state-changing requests when using a session. */
  csrfToken?: string;
  /** Defaults to https://mnnr-app.netlify.app */
  baseUrl?: string;
  /** Override the global fetch (useful for testing or to inject middleware). */
  fetch?: typeof fetch;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  headers?: Record<string, string>;
  /** Some routes (DELETE, 204) return no body. */
  expectNoBody?: boolean;
}

const DEFAULT_BASE_URL = 'https://mnnr-app.netlify.app';

export class MnnrClient {
  readonly baseUrl: string;
  readonly apiKey?: string;
  readonly sessionCookie?: string;
  readonly csrfToken?: string;
  private readonly _fetch: typeof fetch;

  readonly keys: KeysClient;
  readonly usage: UsageClient;
  readonly payments: PaymentsClient;
  readonly newsletter: NewsletterClient;

  constructor(opts: MnnrClientOptions = {}) {
    this.baseUrl = (opts.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, '');
    this.apiKey = opts.apiKey;
    this.sessionCookie = opts.sessionCookie;
    this.csrfToken = opts.csrfToken;
    // Bind so callers that pass `fetch` from a different `this` don't crash.
    this._fetch = (opts.fetch ?? globalThis.fetch).bind(globalThis);

    this.keys = new KeysClient(this);
    this.usage = new UsageClient(this);
    this.payments = new PaymentsClient(this);
    this.newsletter = new NewsletterClient(this);
  }

  /**
   * Low-level request helper. Sub-clients call this.
   *
   * @throws {MnnrError} for any non-2xx response.
   */
  async request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
    const url = this.buildUrl(path, opts.query);
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...opts.headers,
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }
    if (this.sessionCookie) {
      // The browser handles cookies automatically; this is for Node/edge usage.
      headers['Cookie'] = `sb-access-token=${this.sessionCookie}` +
        (this.csrfToken ? `; csrf-token=${this.csrfToken}` : '');
    }
    if (this.csrfToken && opts.method && opts.method !== 'GET') {
      headers['x-csrf-token'] = this.csrfToken;
    }

    let body: BodyInit | undefined;
    if (opts.body !== undefined) {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(opts.body);
    }

    const res = await this._fetch(url, {
      method: opts.method ?? 'GET',
      headers,
      body,
    });

    if (!res.ok) {
      let parsed: MnnrErrorBody | string | null = null;
      const text = await res.text();
      try {
        parsed = text ? (JSON.parse(text) as MnnrErrorBody) : null;
      } catch {
        parsed = text || null;
      }
      const msg =
        (parsed && typeof parsed === 'object' && parsed.message) ||
        (parsed && typeof parsed === 'object' && parsed.error) ||
        `HTTP ${res.status}`;
      throw new MnnrError(msg, res.status, parsed, url);
    }

    if (opts.expectNoBody || res.status === 204) {
      return undefined as unknown as T;
    }

    return (await res.json()) as T;
  }

  private buildUrl(path: string, query?: RequestOptions['query']): string {
    const u = new URL(path.startsWith('/') ? path : `/${path}`, this.baseUrl);
    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (v !== undefined) u.searchParams.set(k, String(v));
      }
    }
    return u.toString();
  }
}

export { MnnrError } from './types.js';
export type * from './types.js';
