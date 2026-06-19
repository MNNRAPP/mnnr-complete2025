/**
 * Unit tests for lib/rls.ts
 *
 * The function under test wraps a Prisma `$transaction` callback that sets
 * `app.current_user_id` before delegating to the user code. We mock @/lib/db
 * so we never hit a real DB.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

const $executeRawUnsafe = vi.fn().mockResolvedValue(0);
const txClient = { $executeRawUnsafe };

const $transaction = vi.fn(async (fn: (tx: typeof txClient) => Promise<unknown>) => {
  return fn(txClient);
});

vi.mock('@/lib/db', () => ({
  db: { $transaction },
}));

describe('lib/rls withUserContext', () => {
  beforeEach(() => {
    $executeRawUnsafe.mockClear();
    $transaction.mockClear();
  });

  it('binds app.current_user_id to the supplied UUID and returns inner result', async () => {
    const { withUserContext } = await import('@/lib/rls');
    const userId = '550e8400-e29b-41d4-a716-446655440000';
    const fn = vi.fn().mockResolvedValue({ rows: ['ok'] });
    const out = await withUserContext(userId, fn);
    expect($transaction).toHaveBeenCalledTimes(1);
    expect($executeRawUnsafe).toHaveBeenCalledWith(
      `SET LOCAL app.current_user_id = '${userId}'`,
    );
    expect(fn).toHaveBeenCalledWith(txClient);
    expect(out).toEqual({ rows: ['ok'] });
  });

  it('throws on non-UUID userId (defends against SQL interpolation)', async () => {
    const { withUserContext } = await import('@/lib/rls');
    await expect(
      withUserContext('not-a-uuid', async () => null),
    ).rejects.toThrow(/UUID/);
    expect($transaction).not.toHaveBeenCalled();
    expect($executeRawUnsafe).not.toHaveBeenCalled();
  });

  it('throws on empty userId', async () => {
    const { withUserContext } = await import('@/lib/rls');
    await expect(withUserContext('', async () => 1)).rejects.toThrow(/UUID/);
  });

  it('propagates inner-function rejection', async () => {
    const { withUserContext } = await import('@/lib/rls');
    const userId = '550e8400-e29b-41d4-a716-446655440000';
    await expect(
      withUserContext(userId, async () => {
        throw new Error('inner-fail');
      }),
    ).rejects.toThrow('inner-fail');
  });
});
