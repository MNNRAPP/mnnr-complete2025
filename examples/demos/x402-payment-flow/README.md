# Demo: x402 payment flow

End-to-end walk through the mnnr.app x402 micropayment protocol:

1. Ask the server for a payment **challenge** (nonce + receiver + amount).
2. Pay on-chain (the demo **mocks** this step — runs without a real wallet).
3. Submit the tx hash back to **verify** + execute the paid action.

This script intentionally does NOT broadcast a real transaction. Replace the
mocked `sendOnChain()` with a real `viem` / `ethers` call when wiring up a
testnet wallet.

## Prereqs

- Node 18+
- Optional (for the real on-chain step): testnet ETH + USDC on Base Sepolia,
  a wallet you control, and one of `viem` or `ethers`

## Run

```bash
cd examples/demos/x402-payment-flow
node demo.mjs
```

You should see:

```
1. Asking server for x402 challenge…
   nonce:       0xabc…
   amountUSD:   0.01
   amountAtomic 10000
   receiver:    0xReceiver…
   paymentUri:  x402://pay?…

2. Paying on-chain (MOCKED — replace sendOnChain() to do this for real)…
   txHash:      0x000…

3. Verifying with the server…
   503 payment_disabled  ← expected on prod until PAYMENT_VERIFICATION_ENABLED=true
```

## Going real on testnet

Inside `demo.mjs`, swap the `sendOnChain()` function for:

```js
import { createWalletClient, http, parseUnits } from 'viem';
import { baseSepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

async function sendOnChain({ receiver, amountAtomic, token, chain, nonce }) {
  const account = privateKeyToAccount(process.env.WALLET_PRIVATE_KEY);
  const wallet = createWalletClient({ account, chain: baseSepolia, transport: http() });

  // USDC on Base Sepolia: 0x036CbD53842c5426634e7929541eC2318f3dCF7e
  const txHash = await wallet.writeContract({
    address: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    abi: [{ name: 'transfer', type: 'function', stateMutability: 'nonpayable',
            inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }],
            outputs: [{ type: 'bool' }] }],
    functionName: 'transfer',
    args: [receiver, BigInt(amountAtomic)],
  });
  return txHash;
}
```

Then run with `WALLET_PRIVATE_KEY=0x… node demo.mjs`.

## Production gate

`POST /api/x402 { action: 'verify' }` returns
`503 payment_disabled` when `PAYMENT_VERIFICATION_ENABLED !== 'true'` on the
server (a safety gate). The demo handles that gracefully — it logs the gate
status and exits 0.
