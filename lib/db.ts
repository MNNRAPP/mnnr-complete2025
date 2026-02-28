/**
 * Neon PostgreSQL Database Connection
 * Single source of truth for all database operations
 */

import postgres from 'postgres';

// Connection string from environment - NEVER hardcode credentials
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Create SQL client
export const sql = postgres(connectionString, {
  ssl: 'require',
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

// ─── Types ───────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string | null;
  full_name: string | null;
  avatar_url: string | null;
  billing_address: Record<string, unknown> | null;
  payment_method: Record<string, unknown> | null;
  created_at: Date;
  updated_at: Date | null;
  last_sign_in_at: Date | null;
  metadata: Record<string, unknown> | null;
}

export interface ApiKey {
  id: string;
  user_id: string;
  key_hash: string;
  key_prefix: string;
  name: string;
  is_active: boolean;
  scopes: string[] | null;
  rate_limit: number | null;
  expires_at: Date | null;
  last_used_at: Date | null;
  created_at: Date;
  revoked_at: Date | null;
  metadata: Record<string, unknown> | null;
}

export interface UsageEvent {
  id: string;
  user_id: string;
  api_key_id: string | null;
  event_type: string;
  metric: string | null;
  quantity: number;
  value: number | null;
  unit: string;
  metadata: Record<string, unknown> | null;
  created_at: Date;
  billed_at: Date | null;
}

export interface Customer {
  id: string;
  stripe_customer_id: string | null;
}

export interface Product {
  id: string;
  active: boolean | null;
  name: string | null;
  description: string | null;
  image: string | null;
  metadata: Record<string, unknown> | null;
}

export interface Price {
  id: string;
  product_id: string | null;
  active: boolean | null;
  currency: string | null;
  type: string | null;
  unit_amount: number | null;
  interval: string | null;
  interval_count: number | null;
  trial_period_days: number | null;
}

export interface Subscription {
  id: string;
  user_id: string;
  price_id: string | null;
  status: string | null;
  quantity: number | null;
  metadata: Record<string, unknown> | null;
  cancel_at_period_end: boolean | null;
  cancel_at: string | null;
  canceled_at: string | null;
  current_period_start: string;
  current_period_end: string;
  created: string;
  ended_at: string | null;
  trial_start: string | null;
  trial_end: string | null;
}

export interface StripeEvent {
  id: string;
  event_type: string | null;
  processed_at: string | null;
  created_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  created_at: Date;
  ip_address: string | null;
  user_agent: string | null;
}

// ─── Database Functions ──────────────────────────────────────────────────────

export const db = {
  // ─── Users ───────────────────────────────────────────────────────────────

  async getUserById(id: string): Promise<User | null> {
    const result = await sql<User[]>`
      SELECT * FROM users WHERE id = ${id}
    `;
    return result[0] || null;
  },

  async getUserByEmail(email: string): Promise<User | null> {
    const result = await sql<User[]>`
      SELECT * FROM users WHERE email = ${email}
    `;
    return result[0] || null;
  },

  async createUser(email: string, name?: string): Promise<User> {
    const result = await sql<User[]>`
      INSERT INTO users (id, email, name, full_name, created_at, updated_at)
      VALUES (gen_random_uuid(), ${email}, ${name || null}, ${name || null}, NOW(), NOW())
      RETURNING *
    `;
    return result[0];
  },

  async updateUser(userId: string, fields: Partial<Pick<User, 'full_name' | 'avatar_url' | 'billing_address' | 'payment_method'>>): Promise<User | null> {
    const result = await sql<User[]>`
      UPDATE users SET
        full_name = COALESCE(${fields.full_name ?? null}, full_name),
        avatar_url = COALESCE(${fields.avatar_url ?? null}, avatar_url),
        billing_address = COALESCE(${fields.billing_address ? JSON.stringify(fields.billing_address) : null}::jsonb, billing_address),
        payment_method = COALESCE(${fields.payment_method ? JSON.stringify(fields.payment_method) : null}::jsonb, payment_method),
        updated_at = NOW()
      WHERE id = ${userId}
      RETURNING *
    `;
    return result[0] || null;
  },

  // ─── Sessions (Auth) ────────────────────────────────────────────────────

  async createSession(userId: string, tokenHash: string, expiresAt: Date, ip?: string, userAgent?: string): Promise<Session> {
    const result = await sql<Session[]>`
      INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at, ip_address, user_agent)
      VALUES (gen_random_uuid(), ${userId}, ${tokenHash}, ${expiresAt.toISOString()}, NOW(), ${ip || null}, ${userAgent || null})
      RETURNING *
    `;
    return result[0];
  },

  async getSessionByTokenHash(tokenHash: string): Promise<(Session & { email: string }) | null> {
    const result = await sql<(Session & { email: string })[]>`
      SELECT s.*, u.email FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token_hash = ${tokenHash} AND s.expires_at > NOW()
    `;
    return result[0] || null;
  },

  async deleteSession(tokenHash: string): Promise<void> {
    await sql`DELETE FROM sessions WHERE token_hash = ${tokenHash}`;
  },

  async deleteExpiredSessions(): Promise<void> {
    await sql`DELETE FROM sessions WHERE expires_at <= NOW()`;
  },

  // ─── API Keys ────────────────────────────────────────────────────────────

  async getApiKeysByUserId(userId: string): Promise<ApiKey[]> {
    return sql<ApiKey[]>`
      SELECT * FROM api_keys
      WHERE user_id = ${userId} AND revoked_at IS NULL
      ORDER BY created_at DESC
    `;
  },

  async getActiveApiKeyCount(userId: string): Promise<number> {
    const result = await sql`
      SELECT COUNT(*) as count FROM api_keys
      WHERE user_id = ${userId} AND revoked_at IS NULL AND is_active = true
    `;
    return Number(result[0]?.count || 0);
  },

  async createApiKey(userId: string, name: string, keyHash: string, keyPrefix: string): Promise<ApiKey> {
    const result = await sql<ApiKey[]>`
      INSERT INTO api_keys (id, user_id, name, key_hash, key_prefix, is_active, created_at)
      VALUES (gen_random_uuid(), ${userId}, ${name}, ${keyHash}, ${keyPrefix}, true, NOW())
      RETURNING *
    `;
    return result[0];
  },

  async getApiKeyByHash(keyHash: string): Promise<ApiKey | null> {
    const result = await sql<ApiKey[]>`
      SELECT * FROM api_keys
      WHERE key_hash = ${keyHash} AND revoked_at IS NULL
    `;
    return result[0] || null;
  },

  async updateApiKeyLastUsed(keyId: string): Promise<void> {
    await sql`UPDATE api_keys SET last_used_at = NOW() WHERE id = ${keyId}`;
  },

  async revokeApiKey(keyId: string, userId: string): Promise<boolean> {
    const result = await sql`
      UPDATE api_keys
      SET revoked_at = NOW(), is_active = false
      WHERE id = ${keyId} AND user_id = ${userId}
      RETURNING id
    `;
    return result.length > 0;
  },

  async deactivateApiKey(keyId: string, userId: string): Promise<boolean> {
    const result = await sql`
      UPDATE api_keys SET is_active = false
      WHERE id = ${keyId} AND user_id = ${userId}
      RETURNING id
    `;
    return result.length > 0;
  },

  // ─── Usage ───────────────────────────────────────────────────────────────

  async trackUsage(apiKeyId: string, eventType: string, quantity: number, unit: string = 'tokens', metadata?: Record<string, unknown>): Promise<void> {
    const key = await sql`SELECT user_id FROM api_keys WHERE id = ${apiKeyId}`;
    const userId = key[0]?.user_id;

    await sql`
      INSERT INTO usage_events (id, user_id, api_key_id, event_type, metric, quantity, value, unit, metadata, created_at)
      VALUES (gen_random_uuid(), ${userId}, ${apiKeyId}, ${eventType}, ${eventType}, ${quantity}, ${quantity}, ${unit}, ${JSON.stringify(metadata || {})}::jsonb, NOW())
    `;
  },

  async recordUsageEvent(userId: string, metric: string, value: number = 1): Promise<UsageEvent> {
    const result = await sql<UsageEvent[]>`
      INSERT INTO usage_events (id, user_id, metric, event_type, quantity, value, unit, created_at)
      VALUES (gen_random_uuid(), ${userId}, ${metric}, ${metric}, ${value}, ${value}, 'count', NOW())
      RETURNING *
    `;
    return result[0];
  },

  async getUsageEvents(userId: string, startDate: Date, metric?: string): Promise<UsageEvent[]> {
    if (metric) {
      return sql<UsageEvent[]>`
        SELECT * FROM usage_events
        WHERE user_id = ${userId}
          AND created_at >= ${startDate.toISOString()}
          AND metric = ${metric}
        ORDER BY created_at DESC
      `;
    }
    return sql<UsageEvent[]>`
      SELECT * FROM usage_events
      WHERE user_id = ${userId}
        AND created_at >= ${startDate.toISOString()}
      ORDER BY created_at DESC
    `;
  },

  async getUsageByApiKey(apiKeyId: string, days: number = 30): Promise<UsageEvent[]> {
    return sql<UsageEvent[]>`
      SELECT * FROM usage_events
      WHERE api_key_id = ${apiKeyId}
        AND created_at > NOW() - INTERVAL '1 day' * ${days}
      ORDER BY created_at DESC
    `;
  },

  async getUsageSummary(userId: string, days: number = 30) {
    const result = await sql`
      SELECT
        COUNT(*) as total_requests,
        COALESCE(SUM(ue.quantity), 0) as total_tokens,
        COUNT(DISTINCT ue.unit) as models_used,
        COUNT(DISTINCT ak.id) as keys_used
      FROM api_keys ak
      LEFT JOIN usage_events ue ON ak.id = ue.api_key_id
        AND ue.created_at > NOW() - INTERVAL '1 day' * ${days}
      WHERE ak.user_id = ${userId} AND ak.revoked_at IS NULL
    `;
    return result[0];
  },

  // ─── Customers (Stripe mapping) ─────────────────────────────────────────

  async getCustomerByUserId(userId: string): Promise<Customer | null> {
    const result = await sql<Customer[]>`
      SELECT * FROM customers WHERE id = ${userId}
    `;
    return result[0] || null;
  },

  async getCustomerByStripeId(stripeCustomerId: string): Promise<Customer | null> {
    const result = await sql<Customer[]>`
      SELECT * FROM customers WHERE stripe_customer_id = ${stripeCustomerId}
    `;
    return result[0] || null;
  },

  async upsertCustomer(userId: string, stripeCustomerId: string): Promise<void> {
    await sql`
      INSERT INTO customers (id, stripe_customer_id)
      VALUES (${userId}, ${stripeCustomerId})
      ON CONFLICT (id) DO UPDATE SET stripe_customer_id = ${stripeCustomerId}
    `;
  },

  // ─── Products ────────────────────────────────────────────────────────────

  async upsertProduct(product: Product): Promise<void> {
    await sql`
      INSERT INTO products (id, active, name, description, image, metadata)
      VALUES (${product.id}, ${product.active}, ${product.name}, ${product.description}, ${product.image}, ${JSON.stringify(product.metadata || {})}::jsonb)
      ON CONFLICT (id) DO UPDATE SET
        active = ${product.active},
        name = ${product.name},
        description = ${product.description},
        image = ${product.image},
        metadata = ${JSON.stringify(product.metadata || {})}::jsonb
    `;
  },

  async deleteProduct(productId: string): Promise<void> {
    await sql`DELETE FROM products WHERE id = ${productId}`;
  },

  async getActiveProducts(): Promise<Product[]> {
    return sql<Product[]>`
      SELECT * FROM products WHERE active = true ORDER BY name
    `;
  },

  async getActiveProductsWithPrices(): Promise<(Product & { prices: Price[] })[]> {
    const products = await sql<Product[]>`
      SELECT * FROM products WHERE active = true ORDER BY name
    `;
    const prices = await sql<Price[]>`
      SELECT * FROM prices WHERE active = true ORDER BY unit_amount
    `;
    return products.map(product => ({
      ...product,
      prices: prices.filter(price => price.product_id === product.id),
    }));
  },

  // ─── Prices ──────────────────────────────────────────────────────────────

  async upsertPrice(price: Price): Promise<void> {
    await sql`
      INSERT INTO prices (id, product_id, active, currency, type, unit_amount, interval, interval_count, trial_period_days)
      VALUES (${price.id}, ${price.product_id}, ${price.active}, ${price.currency}, ${price.type}, ${price.unit_amount}, ${price.interval}, ${price.interval_count}, ${price.trial_period_days})
      ON CONFLICT (id) DO UPDATE SET
        product_id = ${price.product_id},
        active = ${price.active},
        currency = ${price.currency},
        type = ${price.type},
        unit_amount = ${price.unit_amount},
        interval = ${price.interval},
        interval_count = ${price.interval_count},
        trial_period_days = ${price.trial_period_days}
    `;
  },

  async getPriceById(priceId: string): Promise<Price | null> {
    const result = await sql<Price[]>`SELECT * FROM prices WHERE id = ${priceId}`;
    return result[0] || null;
  },

  async getProductById(productId: string): Promise<Product | null> {
    const result = await sql<Product[]>`SELECT * FROM products WHERE id = ${productId}`;
    return result[0] || null;
  },

  async deletePrice(priceId: string): Promise<void> {
    await sql`DELETE FROM prices WHERE id = ${priceId}`;
  },

  // ─── Subscriptions ──────────────────────────────────────────────────────

  async upsertSubscription(sub: Subscription): Promise<void> {
    await sql`
      INSERT INTO subscriptions (id, user_id, price_id, status, quantity, metadata, cancel_at_period_end, cancel_at, canceled_at, current_period_start, current_period_end, created, ended_at, trial_start, trial_end)
      VALUES (${sub.id}, ${sub.user_id}, ${sub.price_id}, ${sub.status}, ${sub.quantity}, ${JSON.stringify(sub.metadata || {})}::jsonb, ${sub.cancel_at_period_end}, ${sub.cancel_at}, ${sub.canceled_at}, ${sub.current_period_start}, ${sub.current_period_end}, ${sub.created}, ${sub.ended_at}, ${sub.trial_start}, ${sub.trial_end})
      ON CONFLICT (id) DO UPDATE SET
        user_id = ${sub.user_id},
        price_id = ${sub.price_id},
        status = ${sub.status},
        quantity = ${sub.quantity},
        metadata = ${JSON.stringify(sub.metadata || {})}::jsonb,
        cancel_at_period_end = ${sub.cancel_at_period_end},
        cancel_at = ${sub.cancel_at},
        canceled_at = ${sub.canceled_at},
        current_period_start = ${sub.current_period_start},
        current_period_end = ${sub.current_period_end},
        ended_at = ${sub.ended_at},
        trial_start = ${sub.trial_start},
        trial_end = ${sub.trial_end}
    `;
  },

  async getSubscriptionsByUserId(userId: string): Promise<Subscription[]> {
    return sql<Subscription[]>`
      SELECT * FROM subscriptions
      WHERE user_id = ${userId}
      ORDER BY created DESC
    `;
  },

  async getActiveSubscription(userId: string): Promise<Subscription | null> {
    const result = await sql<Subscription[]>`
      SELECT * FROM subscriptions
      WHERE user_id = ${userId} AND status IN ('trialing', 'active')
      LIMIT 1
    `;
    return result[0] || null;
  },

  async getSubscriptionById(id: string, userId: string): Promise<Subscription | null> {
    const result = await sql<Subscription[]>`
      SELECT * FROM subscriptions WHERE id = ${id} AND user_id = ${userId}
    `;
    return result[0] || null;
  },

  // ─── Stripe Events (Idempotency) ────────────────────────────────────────

  async getStripeEvent(eventId: string): Promise<StripeEvent | null> {
    const result = await sql<StripeEvent[]>`
      SELECT * FROM stripe_events WHERE id = ${eventId}
    `;
    return result[0] || null;
  },

  async recordStripeEvent(eventId: string, eventType: string): Promise<void> {
    await sql`
      INSERT INTO stripe_events (id, event_type, processed_at, created_at)
      VALUES (${eventId}, ${eventType}, NOW(), NOW())
      ON CONFLICT (id) DO NOTHING
    `;
  },

  // ─── Newsletter ──────────────────────────────────────────────────────────

  async upsertNewsletterSubscriber(email: string, source: string = 'website'): Promise<void> {
    await sql`
      INSERT INTO newsletter_subscribers (id, email, subscribed_at, source, status)
      VALUES (gen_random_uuid(), ${email}, NOW(), ${source}, 'active')
      ON CONFLICT (email) DO UPDATE SET status = 'active', subscribed_at = NOW()
    `;
  },

  // ─── Health Check ───────────────────────────────────────────────────────

  async healthCheck(): Promise<boolean> {
    try {
      await sql`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  },
};

export default db;
