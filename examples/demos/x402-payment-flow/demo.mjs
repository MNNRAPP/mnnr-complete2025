#!/usr/bin/env node
/**
 * demos/x402-payment-flow/demo.mjs
 *
 * Walk the full x402 challenge → pay → verify loop against the live
 * mnnr.app deploy. The on-chain step is mocked so the demo runs end-to-end
 * with no wallet, no testnet funds, no extra deps.
 *
 * See README.md for swapping in a real `viem` call.
 */

const BASE_URL = process.env.MNNR_BASE_URL || 'https://mnnr-app.netlify.app';

/** MOCK on-chain send. Returns a 32-byte hex tx hash. */
async function sendOnChain({ nonce }) {
  // Replace with real viem/ethers call. See README.
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return '0x' + Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

async function main() {
  console.log('1. Asking server for x402 challenge…');

  const challengeRes = await fetch(`${BASE_URL}/api/x402`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // CSRF cookies live on a real signed-in session; for the protocol-info /
      // challenge issuance this demo accepts whatever the server gives back —
      // a 403 from CSRF is logged and the script exits.
      'x-csrf-token': process.env.CSRF_TOKEN || 'demo-token',
    },
    body: JSON.stringify({
      action: 'challenge',
      resource: 'analyze',
      amountUSD: '0.01',
      token: 'USDC',
      chain: 'base-sepolia',
    }),
  });

  if (challengeRes.status === 403) {
    console.error('   403 csrf_token_invalid — set CSRF_TOKEN env from a signed-in dashboard session.');
    process.exit(0);
  }
  if (!challengeRes.ok) {
    const body = await challengeRes.text();
    console.error(`   ${challengeRes.status} ${body}`);
    process.exit(0);
  }

  const challenge = await challengeRes.json();
  console.log(`   nonce:       ${challenge.nonce}`);
  console.log(`   amountUSD:   ${challenge.amountUSD}`);
  console.log(`   amountAtomic ${challenge.amountAtomic}`);
  console.log(`   receiver:    ${challenge.receiver}`);
  console.log(`   paymentUri:  ${challenge.paymentUri}`);

  console.log('\n2. Paying on-chain (MOCKED — replace sendOnChain() to do this for real)…');
  const txHash = await sendOnChain({
    nonce: challenge.nonce,
    receiver: challenge.receiver,
    amountAtomic: challenge.amountAtomic,
    token: challenge.token,
    chain: challenge.chain,
  });
  console.log(`   txHash:      ${txHash}`);

  console.log('\n3. Verifying with the server…');
  const verifyRes = await fetch(`${BASE_URL}/api/x402`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': process.env.CSRF_TOKEN || 'demo-token',
    },
    body: JSON.stringify({
      action: 'verify',
      nonce: challenge.nonce,
      txHash,
      chain: 'base-sepolia',
      executeAction: { resource: 'analyze', params: {} },
    }),
  });

  const verifyBody = await verifyRes.text();
  let parsed;
  try { parsed = JSON.parse(verifyBody); } catch { parsed = verifyBody; }

  console.log(`   HTTP ${verifyRes.status}`);
  console.log('  ', parsed);

  if (verifyRes.status === 503) {
    console.log('\n   ← expected on prod until PAYMENT_VERIFICATION_ENABLED=true.');
  } else if (verifyRes.status === 402) {
    console.log('\n   ← expected because the tx hash is mocked. Wire a real wallet (see README) to land 200.');
  } else if (verifyRes.ok) {
    console.log('\n   ✓ paid action executed.');
  }
}

main().catch(err => {
  console.error('demo failed:', err);
  process.exit(1);
});
