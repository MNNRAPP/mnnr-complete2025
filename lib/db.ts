/**
 * Neon PostgreSQL Database Connection
 * Direct connection to Neon - no Supabase dependency
 */

import postgres from 'postgres';

// Connection string from environment or hardcoded for now
const connectionString = process.env.DATABASE_URL || 
  'postgresql://neondb_owner:npg_dN9gPKeYri2S@ep-solitary-leaf-afsaf73w-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require';

// Create SQL client
export const sql = postgres(connectionString, {
  ssl: 'require',
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

// Types
export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
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
  api_key_id: string;
  event_type: string;
  quantity: number;
  unit: string;
  metadata: Record<string, unknown> | null;
  created_at: Date;
  billed_at: Date | null;
}

// Database functions
export const db = {
  // Users
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
      INSERT INTO users (id, email, name, created_at, updated_at)
      VALUES (gen_random_uuid(), ${email}, ${name || null}, NOW(), NOW())
      RETURNING *
    `;
    return result[0];
  },

  // API Keys
  async getApiKeysByUserId(userId: string): Promise<ApiKey[]> {
    return sql<ApiKey[]>`
      SELECT * FROM api_keys 
      WHERE user_id = ${userId} AND revoked_at IS NULL
      ORDER BY created_at DESC
    `;
  },

  async createApiKey(userId: string, name: string, keyHash: string, keyPrefix: string): Promise<ApiKey> {
    const result = await sql<ApiKey[]>`
      INSERT INTO api_keys (id, user_id, name, key_hash, key_prefix, created_at)
      VALUES (gen_random_uuid(), ${userId}, ${name}, ${keyHash}, ${keyPrefix}, NOW())
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
    await sql`
      UPDATE api_keys SET last_used_at = NOW() WHERE id = ${keyId}
    `;
  },

  async revokeApiKey(keyId: string, userId: string): Promise<boolean> {
    const result = await sql`
      UPDATE api_keys 
      SET revoked_at = NOW() 
      WHERE id = ${keyId} AND user_id = ${userId}
      RETURNING id
    `;
    return result.length > 0;
  },

  // Usage
  async trackUsage(apiKeyId: string, eventType: string, quantity: number, unit: string = 'tokens', metadata?: Record<string, unknown>): Promise<void> {
    // Get user_id from api_key
    const key = await sql`SELECT user_id FROM api_keys WHERE id = ${apiKeyId}`;
    const userId = key[0]?.user_id;
    
    await sql`
      INSERT INTO usage_events (id, user_id, api_key_id, event_type, quantity, unit, metadata, created_at)
      VALUES (gen_random_uuid(), ${userId}, ${apiKeyId}, ${eventType}, ${quantity}, ${unit}, ${JSON.stringify(metadata || {})}, NOW())
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

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await sql`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
};

export default db;
