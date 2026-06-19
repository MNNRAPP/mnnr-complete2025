/**
 * Unit tests for lib/x402-verify.ts
 *
 * The module uses raw `fetch` for JSON-RPC and reads challenge state through
 * @/lib/payment-challenge-store. We mock both, plus `lib/x402` for the token
 * address map. We also enable PAYMENT_VERIFICATION_ENABLED=true so the
 * production gate doesn't short-circuit every test.
 */
import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';

// ---- Set required env BEFORE the module under test loads ----
const ORIGINAL_ENV = { ...process.env };

function setRequiredEnv() {
  process.env.PAYMENT_VERIFICATION_ENABLED = 'true';
  process.env.NODE_ENV = 'test';
  process.env.RPC_URL_BASE = 'https://rpc-base.example/x';
  process.env.RPC_URL_MAINNET = 'https://rpc-eth.example/x';
  process.env.RPC_URL_POLYGON = 'https://rpc-poly.example/x';
  process.env.X402_RECEIVER_ADDRESS_BASE = '0x' + 'a'.repeat(40);
  process.env.X402_RECEIVER_ADDRESS_ETHEREUM = '0x' + 'b'.repeat(40);
  process.env.X402_RECEIVER_ADDRESS_POLYGON = '0x' + 'c'.repeat(40);
  process.env.X402_CONFIRMATIONS_BASE = '1';
}

setRequiredEnv();

// ---- Mock dependencies ----
const getChallenge = vi.fn();
const consumeChallenge = vi.fn();

vi.mock('@/lib/payment-challenge-store', () => ({
  getChallenge: (...a: unknown[]) => getChallenge(...a),
  consumeChallenge: (...a: unknown[]) => consumeChallenge(...a),
}));

const USDC_BASE_ADDR = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913'; // lowercase

vi.mock('@/lib/x402', () => ({
  TOKEN_ADDRESSES: {
    base: { USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' },
    ethereum: { USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
    polygon: { USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174' },
  },
  SUPPORTED_NETWORKS: ['base', 'ethereum', 'polygon'],
  SUPPORTED_TOKENS: ['USDC', 'USDT', 'DAI'],
}));

const TRANSFER_TOPIC =
  '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

function addrToTopic(addr: string): string {
  const lower = addr.toLowerCase().replace(/^0x/, '');
  return '0x' + '0'.repeat(64 - lower.length) + lower;
}

function makeRpcResponses(
  tx: unknown,
  receipt: unknown,
  latestBlockHex: string,
): (input: RequestInfo | URL, init?: RequestInit) => Promise<Response> {
  return async (_url, init) => {
    const body = JSON.parse((init?.body as string) ?? '{}');
    let result: unknown = null;
    if (body.method === 'eth_getTransactionByHash') result = tx;
    else if (body.method === 'eth_getTransactionReceipt') result = receipt;
    else if (body.method === 'eth_blockNumber') result = latestBlockHex;
    return new Response(JSON.stringify({ result }), { status: 200 });
  };
}

const goodTxHash = '0x' + 'a'.repeat(64);
const baseReceiver = '0x' + 'a'.repeat(40);

function makeChallenge(overrides: Record<string, unknown> = {}) {
  return {
    id: 'r-1',
    nonce: 'noncey',
    amount: '1000000',
    receiver: baseReceiver,
    chain: 'base',
    token: 'USDC',
    expiresAt: new Date(Date.now() + 60_000),
    consumed: false,
    consumedAt: null,
    consumedTxHash: null,
    resource: '/r',
    ...overrides,
  };
}

describe('lib/x402-verify verifyPaymentOnChain', () => {
  beforeEach(() => {
    setRequiredEnv();
    vi.clearAllMocks();
    vi.resetModules();
  });

  afterAll(() => {
    for (const k of Object.keys(process.env)) {
      if (!(k in ORIGINAL_ENV)) delete process.env[k];
    }
    for (const [k, v] of Object.entries(ORIGINAL_ENV)) {
      if (v !== undefined) process.env[k] = v;
    }
  });

  it('returns verification_disabled when env flag is off', async () => {
    process.env.PAYMENT_VERIFICATION_ENABLED = 'false';
    const { verifyPaymentOnChain } = await import('@/lib/x402-verify');
    const r = await verifyPaymentOnChain({
      nonce: 'n',
      txHash: goodTxHash,
      chain: 'base',
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('verification_disabled');
  });

  it('returns challenge_not_found when store returns null', async () => {
    getChallenge.mockResolvedValueOnce(null);
    const { verifyPaymentOnChain } = await import('@/lib/x402-verify');
    const r = await verifyPaymentOnChain({
      nonce: 'n',
      txHash: goodTxHash,
      chain: 'base',
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('challenge_not_found');
  });

  it('returns challenge_already_consumed when challenge.consumed', async () => {
    getChallenge.mockResolvedValueOnce(makeChallenge({ consumed: true }));
    const { verifyPaymentOnChain } = await import('@/lib/x402-verify');
    const r = await verifyPaymentOnChain({
      nonce: 'n',
      txHash: goodTxHash,
      chain: 'base',
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('challenge_already_consumed');
  });

  it('returns challenge_expired when expiresAt is in the past', async () => {
    getChallenge.mockResolvedValueOnce(
      makeChallenge({ expiresAt: new Date(Date.now() - 1000) }),
    );
    const { verifyPaymentOnChain } = await import('@/lib/x402-verify');
    const r = await verifyPaymentOnChain({
      nonce: 'n',
      txHash: goodTxHash,
      chain: 'base',
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('challenge_expired');
  });

  it('returns wrong_chain when challenge.chain != proof.chain', async () => {
    getChallenge.mockResolvedValueOnce(makeChallenge({ chain: 'ethereum' }));
    const { verifyPaymentOnChain } = await import('@/lib/x402-verify');
    const r = await verifyPaymentOnChain({
      nonce: 'n',
      txHash: goodTxHash,
      chain: 'base',
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('wrong_chain');
  });

  it('returns malformed_tx for invalid txHash format', async () => {
    getChallenge.mockResolvedValueOnce(makeChallenge());
    const { verifyPaymentOnChain } = await import('@/lib/x402-verify');
    const r = await verifyPaymentOnChain({
      nonce: 'n',
      txHash: '0xnothex',
      chain: 'base',
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('malformed_tx');
  });

  it('returns tx_not_found when RPC returns null', async () => {
    getChallenge.mockResolvedValueOnce(makeChallenge());
    vi.stubGlobal('fetch', vi.fn(makeRpcResponses(null, null, '0x10')));
    const { verifyPaymentOnChain } = await import('@/lib/x402-verify');
    const r = await verifyPaymentOnChain({
      nonce: 'n',
      txHash: goodTxHash,
      chain: 'base',
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('tx_not_found');
  });

  it('returns tx_reverted when receipt.status !== 0x1', async () => {
    getChallenge.mockResolvedValueOnce(makeChallenge());
    vi.stubGlobal(
      'fetch',
      vi.fn(
        makeRpcResponses(
          { hash: goodTxHash, to: USDC_BASE_ADDR, from: '0x', blockNumber: '0x10', input: '0x', value: '0x0' },
          { transactionHash: goodTxHash, blockNumber: '0x10', status: '0x0', logs: [] },
          '0x20',
        ),
      ),
    );
    const { verifyPaymentOnChain } = await import('@/lib/x402-verify');
    const r = await verifyPaymentOnChain({
      nonce: 'n',
      txHash: goodTxHash,
      chain: 'base',
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('tx_reverted');
  });

  it('returns wrong_token_contract when tx.to is not the token contract', async () => {
    getChallenge.mockResolvedValueOnce(makeChallenge());
    const wrongTo = '0x' + 'f'.repeat(40);
    vi.stubGlobal(
      'fetch',
      vi.fn(
        makeRpcResponses(
          { hash: goodTxHash, to: wrongTo, from: '0x', blockNumber: '0x10', input: '0x', value: '0x0' },
          { transactionHash: goodTxHash, blockNumber: '0x10', status: '0x1', logs: [] },
          '0x20',
        ),
      ),
    );
    const { verifyPaymentOnChain } = await import('@/lib/x402-verify');
    const r = await verifyPaymentOnChain({
      nonce: 'n',
      txHash: goodTxHash,
      chain: 'base',
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('wrong_token_contract');
  });

  it('returns wrong_receiver when no Transfer log paid the challenge receiver', async () => {
    getChallenge.mockResolvedValueOnce(makeChallenge());
    const otherReceiver = '0x' + 'd'.repeat(40);
    vi.stubGlobal(
      'fetch',
      vi.fn(
        makeRpcResponses(
          {
            hash: goodTxHash,
            to: USDC_BASE_ADDR,
            from: '0x',
            blockNumber: '0x10',
            input: '0x',
            value: '0x0',
          },
          {
            transactionHash: goodTxHash,
            blockNumber: '0x10',
            status: '0x1',
            logs: [
              {
                address: USDC_BASE_ADDR,
                topics: [TRANSFER_TOPIC, addrToTopic('0x' + '1'.repeat(40)), addrToTopic(otherReceiver)],
                data: '0x' + '00000000000000000000000000000000000000000000000000000000000F4240', // 1_000_000
              },
            ],
          },
          '0x20',
        ),
      ),
    );
    const { verifyPaymentOnChain } = await import('@/lib/x402-verify');
    const r = await verifyPaymentOnChain({
      nonce: 'n',
      txHash: goodTxHash,
      chain: 'base',
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('wrong_receiver');
  });

  it('returns insufficient_amount when log value < challenge.amount', async () => {
    getChallenge.mockResolvedValueOnce(makeChallenge({ amount: '2000000' }));
    vi.stubGlobal(
      'fetch',
      vi.fn(
        makeRpcResponses(
          {
            hash: goodTxHash,
            to: USDC_BASE_ADDR,
            from: '0x',
            blockNumber: '0x10',
            input: '0x',
            value: '0x0',
          },
          {
            transactionHash: goodTxHash,
            blockNumber: '0x10',
            status: '0x1',
            logs: [
              {
                address: USDC_BASE_ADDR,
                topics: [TRANSFER_TOPIC, addrToTopic('0x' + '1'.repeat(40)), addrToTopic(baseReceiver)],
                data: '0x' + '00000000000000000000000000000000000000000000000000000000000F4240', // 1_000_000
              },
            ],
          },
          '0x20',
        ),
      ),
    );
    const { verifyPaymentOnChain } = await import('@/lib/x402-verify');
    const r = await verifyPaymentOnChain({
      nonce: 'n',
      txHash: goodTxHash,
      chain: 'base',
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('insufficient_amount');
  });

  it('returns insufficient_confirmations when below min', async () => {
    process.env.X402_CONFIRMATIONS_BASE = '100';
    getChallenge.mockResolvedValueOnce(makeChallenge());
    vi.stubGlobal(
      'fetch',
      vi.fn(
        makeRpcResponses(
          {
            hash: goodTxHash,
            to: USDC_BASE_ADDR,
            from: '0x',
            blockNumber: '0x10',
            input: '0x',
            value: '0x0',
          },
          {
            transactionHash: goodTxHash,
            blockNumber: '0x10',
            status: '0x1',
            logs: [
              {
                address: USDC_BASE_ADDR,
                topics: [TRANSFER_TOPIC, addrToTopic('0x' + '1'.repeat(40)), addrToTopic(baseReceiver)],
                data: '0x' + '00000000000000000000000000000000000000000000000000000000000F4240',
              },
            ],
          },
          '0x11',
        ),
      ),
    );
    const { verifyPaymentOnChain } = await import('@/lib/x402-verify');
    const r = await verifyPaymentOnChain({
      nonce: 'n',
      txHash: goodTxHash,
      chain: 'base',
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('insufficient_confirmations');
    process.env.X402_CONFIRMATIONS_BASE = '1';
  });

  it('returns ok:true on the happy path + consumes the challenge', async () => {
    getChallenge.mockResolvedValueOnce(makeChallenge());
    consumeChallenge.mockResolvedValueOnce({ ok: true, challenge: makeChallenge({ consumed: true }) });
    vi.stubGlobal(
      'fetch',
      vi.fn(
        makeRpcResponses(
          {
            hash: goodTxHash,
            to: USDC_BASE_ADDR,
            from: '0x',
            blockNumber: '0x10',
            input: '0x',
            value: '0x0',
          },
          {
            transactionHash: goodTxHash,
            blockNumber: '0x10',
            status: '0x1',
            logs: [
              {
                address: USDC_BASE_ADDR,
                topics: [TRANSFER_TOPIC, addrToTopic('0x' + '1'.repeat(40)), addrToTopic(baseReceiver)],
                data: '0x' + '00000000000000000000000000000000000000000000000000000000000F4240',
              },
            ],
          },
          '0x20',
        ),
      ),
    );
    const { verifyPaymentOnChain } = await import('@/lib/x402-verify');
    const r = await verifyPaymentOnChain({
      nonce: 'n',
      txHash: goodTxHash,
      chain: 'base',
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.chain).toBe('base');
      expect(r.amountPaid).toBe('1000000');
      expect(consumeChallenge).toHaveBeenCalledTimes(1);
    }
  });

  it('surfaces replay_detected from consumeChallenge', async () => {
    getChallenge.mockResolvedValueOnce(makeChallenge());
    consumeChallenge.mockResolvedValueOnce({ ok: false, reason: 'replay_detected' });
    vi.stubGlobal(
      'fetch',
      vi.fn(
        makeRpcResponses(
          {
            hash: goodTxHash,
            to: USDC_BASE_ADDR,
            from: '0x',
            blockNumber: '0x10',
            input: '0x',
            value: '0x0',
          },
          {
            transactionHash: goodTxHash,
            blockNumber: '0x10',
            status: '0x1',
            logs: [
              {
                address: USDC_BASE_ADDR,
                topics: [TRANSFER_TOPIC, addrToTopic('0x' + '1'.repeat(40)), addrToTopic(baseReceiver)],
                data: '0x' + '00000000000000000000000000000000000000000000000000000000000F4240',
              },
            ],
          },
          '0x20',
        ),
      ),
    );
    const { verifyPaymentOnChain } = await import('@/lib/x402-verify');
    const r = await verifyPaymentOnChain({
      nonce: 'n',
      txHash: goodTxHash,
      chain: 'base',
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('replay_detected');
  });
});

describe('lib/x402-verify validateStartupConfig + getConfiguredReceiver', () => {
  beforeEach(() => {
    setRequiredEnv();
    vi.resetModules();
  });

  it('validateStartupConfig returns ok when env is complete', async () => {
    const { validateStartupConfig } = await import('@/lib/x402-verify');
    const { ok, errors } = validateStartupConfig();
    expect(ok).toBe(true);
    expect(errors).toEqual([]);
  });

  it('getConfiguredReceiver returns the configured address', async () => {
    const { getConfiguredReceiver } = await import('@/lib/x402-verify');
    expect(getConfiguredReceiver('base')).toBe('0x' + 'a'.repeat(40));
  });
});
