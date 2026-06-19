/**
 * Auth Flow Integration Tests — Clerk (post-Supabase migration 2026-06-19).
 *
 * The legacy Supabase auth flow (password sign-in, magic link, OAuth code
 * exchange via /auth/callback) is gone. Clerk owns sign-in / sign-up /
 * session management. The supported Clerk testing pattern is via
 * @clerk/testing — which is its own bag of setup (test JWT minting, etc.).
 *
 * For now we skip this suite. TODO(clerk-migrate): port to @clerk/testing.
 */

import { describe, it, expect } from 'vitest';

describe.skip('Auth flow (Clerk)', () => {
  it('placeholder', () => {
    expect(true).toBe(true);
  });
});
