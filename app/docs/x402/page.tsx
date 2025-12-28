import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'x402 Protocol Guide - MNNR',
  description: 'Complete guide to integrating x402 HTTP Payment Required protocol for micropayments and agent-to-agent transactions.',
};

export default function X402Page() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.1),transparent_50%)]" />
        
        <div className="max-w-6xl mx-auto px-6 py-20 relative">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Link href="/docs" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">
              ← Back to Documentation
            </Link>
          </div>

          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-2 mb-6">
              <span className="text-orange-400 text-sm font-medium">⚡ x402 Protocol</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              HTTP 402{' '}
              <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                Payment Required
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              The internet's native payment protocol. Enable sub-cent micropayments for APIs, 
              content, and agent-to-agent transactions without API keys.
            </p>
          </div>

          {/* First Platform Badge */}
          <div className="relative bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-xl p-6 mb-12 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-3xl">🏆</span>
              <span className="text-orange-400 font-bold text-xl">MNNR is the First AI Billing Platform to Support x402</span>
            </div>
            <p className="text-gray-400">
              Native protocol support for machine-to-machine payments on the open web.
            </p>
          </div>

          {/* What is x402 */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <span className="text-3xl mr-3">📖</span>
              What is x402?
            </h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                HTTP status code 402 "Payment Required" was reserved in the original HTTP specification 
                for future use with digital payments. The x402 protocol finally implements this vision, 
                enabling any HTTP endpoint to request payment before serving content.
              </p>
              <p className="text-gray-300 leading-relaxed mb-6">
                Unlike traditional payment APIs that require API keys, OAuth tokens, and complex integration, 
                x402 works at the HTTP protocol level. When a server returns a 402 response, it includes 
                payment instructions in the headers. The client makes a payment and retries the request 
                with proof of payment. It's that simple.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-black/40 border border-gray-700 rounded-lg p-6 text-center">
                  <div className="text-4xl mb-3">💰</div>
                  <h3 className="text-white font-semibold mb-2">Sub-Cent Payments</h3>
                  <p className="text-gray-400 text-sm">Minimum payment of $0.001 enables true micropayments</p>
                </div>
                <div className="bg-black/40 border border-gray-700 rounded-lg p-6 text-center">
                  <div className="text-4xl mb-3">🔑</div>
                  <h3 className="text-white font-semibold mb-2">No API Keys</h3>
                  <p className="text-gray-400 text-sm">Payment is the authentication - no signup required</p>
                </div>
                <div className="bg-black/40 border border-gray-700 rounded-lg p-6 text-center">
                  <div className="text-4xl mb-3">⚡</div>
                  <h3 className="text-white font-semibold mb-2">Instant Settlement</h3>
                  <p className="text-gray-400 text-sm">Payments settle on Base L2 in seconds</p>
                </div>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-gray-900/50 border border-orange-500/30 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <span className="text-3xl mr-3">⚙️</span>
              How It Works
            </h2>
            
            {/* Flow Diagram */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-black/40 border border-gray-700 rounded-lg p-6 relative">
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
                <h3 className="text-white font-semibold mb-2 mt-2">Request</h3>
                <p className="text-gray-400 text-sm">Client makes HTTP request to protected endpoint</p>
              </div>
              <div className="bg-black/40 border border-gray-700 rounded-lg p-6 relative">
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
                <h3 className="text-white font-semibold mb-2 mt-2">402 Response</h3>
                <p className="text-gray-400 text-sm">Server returns 402 with payment instructions</p>
              </div>
              <div className="bg-black/40 border border-gray-700 rounded-lg p-6 relative">
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
                <h3 className="text-white font-semibold mb-2 mt-2">Payment</h3>
                <p className="text-gray-400 text-sm">Client sends stablecoin to specified address</p>
              </div>
              <div className="bg-black/40 border border-gray-700 rounded-lg p-6 relative">
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">4</div>
                <h3 className="text-white font-semibold mb-2 mt-2">Access</h3>
                <p className="text-gray-400 text-sm">Retry with payment proof, receive content</p>
              </div>
            </div>

            {/* Code Example */}
            <div className="bg-black/40 border border-gray-700 rounded-lg overflow-hidden">
              <div className="bg-gray-800/50 px-4 py-2 border-b border-gray-700 flex items-center justify-between">
                <span className="text-gray-400 text-sm">Complete Flow Example</span>
                <span className="text-orange-400 text-xs">Python</span>
              </div>
              <pre className="p-4 text-sm text-gray-300 overflow-x-auto">
{`import requests
from web3 import Web3

# Step 1: Make initial request
response = requests.get("https://api.example.com/premium-data")

# Step 2: Handle 402 Payment Required
if response.status_code == 402:
    payment_info = {
        "amount": response.headers["X-402-Amount"],
        "receiver": response.headers["X-402-Receiver"],
        "network": response.headers["X-402-Network"],
        "token": response.headers["X-402-Token"]
    }
    
    # Step 3: Send payment on Base network
    w3 = Web3(Web3.HTTPProvider("https://mainnet.base.org"))
    usdc = w3.eth.contract(address=USDC_ADDRESS, abi=ERC20_ABI)
    
    tx = usdc.functions.transfer(
        payment_info["receiver"],
        int(float(payment_info["amount"]) * 1e6)  # USDC has 6 decimals
    ).transact()
    
    tx_hash = w3.eth.wait_for_transaction_receipt(tx)
    
    # Step 4: Retry with payment proof
    response = requests.get(
        "https://api.example.com/premium-data",
        headers={
            "X-402-Payment-Proof": json.dumps({
                "txHash": tx_hash.hex(),
                "network": "base",
                "token": "USDC",
                "amount": payment_info["amount"]
            })
        }
    )
    
    # Success! Access granted
    data = response.json()`}
              </pre>
            </div>
          </div>

          {/* Supported Networks */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <span className="text-3xl mr-3">🌐</span>
              Supported Networks & Tokens
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Networks */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Networks</h3>
                <div className="space-y-3">
                  <div className="bg-black/40 border border-blue-500/30 rounded-lg p-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <span className="text-blue-400 font-bold">B</span>
                    </div>
                    <div>
                      <div className="text-white font-medium">Base</div>
                      <div className="text-gray-400 text-sm">Recommended - Low fees, fast settlement</div>
                    </div>
                    <span className="ml-auto bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded">Primary</span>
                  </div>
                  <div className="bg-black/40 border border-gray-700 rounded-lg p-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                      <span className="text-purple-400 font-bold">E</span>
                    </div>
                    <div>
                      <div className="text-white font-medium">Ethereum</div>
                      <div className="text-gray-400 text-sm">Higher fees, maximum security</div>
                    </div>
                  </div>
                  <div className="bg-black/40 border border-gray-700 rounded-lg p-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                      <span className="text-purple-400 font-bold">P</span>
                    </div>
                    <div>
                      <div className="text-white font-medium">Polygon</div>
                      <div className="text-gray-400 text-sm">Low fees, wide adoption</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tokens */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Stablecoins</h3>
                <div className="space-y-3">
                  <div className="bg-black/40 border border-blue-500/30 rounded-lg p-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <span className="text-blue-400 font-bold">$</span>
                    </div>
                    <div>
                      <div className="text-white font-medium">USDC</div>
                      <div className="text-gray-400 text-sm">Circle USD - Most liquid</div>
                    </div>
                    <span className="ml-auto bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded">Primary</span>
                  </div>
                  <div className="bg-black/40 border border-gray-700 rounded-lg p-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                      <span className="text-green-400 font-bold">$</span>
                    </div>
                    <div>
                      <div className="text-white font-medium">USDT</div>
                      <div className="text-gray-400 text-sm">Tether USD - Wide support</div>
                    </div>
                  </div>
                  <div className="bg-black/40 border border-gray-700 rounded-lg p-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                      <span className="text-yellow-400 font-bold">$</span>
                    </div>
                    <div>
                      <div className="text-white font-medium">DAI</div>
                      <div className="text-gray-400 text-sm">MakerDAO - Decentralized</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <span className="text-3xl mr-3">💵</span>
              x402 Pricing
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Resource</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Price</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Example</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  <tr className="border-b border-gray-800">
                    <td className="py-3 px-4">Tokens (LLM)</td>
                    <td className="py-3 px-4 text-orange-400 font-mono">$0.01 / 1,000 tokens</td>
                    <td className="py-3 px-4 text-gray-400">1,000 word response = $0.01</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-3 px-4">API Requests</td>
                    <td className="py-3 px-4 text-orange-400 font-mono">$0.10 / 1,000 requests</td>
                    <td className="py-3 px-4 text-gray-400">Single API call = $0.0001</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-3 px-4">Compute Time</td>
                    <td className="py-3 px-4 text-orange-400 font-mono">$0.001 / 1,000ms</td>
                    <td className="py-3 px-4 text-gray-400">5 second task = $0.005</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Minimum Payment</td>
                    <td className="py-3 px-4 text-orange-400 font-mono">$0.001</td>
                    <td className="py-3 px-4 text-gray-400">One tenth of a cent</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Use Cases */}
          <div className="bg-gray-900/50 border border-orange-500/30 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <span className="text-3xl mr-3">🎯</span>
              Use Cases
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-black/40 border border-gray-700 rounded-lg p-6">
                <div className="text-3xl mb-4">🤖</div>
                <h3 className="text-white font-semibold mb-2">Agent-to-Agent Payments</h3>
                <p className="text-gray-400 text-sm mb-4">
                  AI agents can autonomously pay for services from other agents without human intervention.
                  A research agent can pay a data analysis agent per query.
                </p>
                <code className="text-orange-400 text-xs bg-black/40 px-2 py-1 rounded">
                  Agent A → $0.05 → Agent B (per analysis)
                </code>
              </div>
              
              <div className="bg-black/40 border border-gray-700 rounded-lg p-6">
                <div className="text-3xl mb-4">📰</div>
                <h3 className="text-white font-semibold mb-2">Content Micropayments</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Pay-per-article instead of subscriptions. Readers pay only for what they read,
                  creators get paid instantly.
                </p>
                <code className="text-orange-400 text-xs bg-black/40 px-2 py-1 rounded">
                  Reader → $0.10 → Publisher (per article)
                </code>
              </div>
              
              <div className="bg-black/40 border border-gray-700 rounded-lg p-6">
                <div className="text-3xl mb-4">🔌</div>
                <h3 className="text-white font-semibold mb-2">API Monetization</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Monetize your API without managing API keys, rate limits, or billing.
                  Every request pays automatically.
                </p>
                <code className="text-orange-400 text-xs bg-black/40 px-2 py-1 rounded">
                  Developer → $0.001 → API Provider (per call)
                </code>
              </div>
              
              <div className="bg-black/40 border border-gray-700 rounded-lg p-6">
                <div className="text-3xl mb-4">🎮</div>
                <h3 className="text-white font-semibold mb-2">Gaming & Virtual Goods</h3>
                <p className="text-gray-400 text-sm mb-4">
                  In-game purchases without app store fees. Players pay directly for items,
                  power-ups, or access.
                </p>
                <code className="text-orange-400 text-xs bg-black/40 px-2 py-1 rounded">
                  Player → $0.25 → Game (per item)
                </code>
              </div>
            </div>
          </div>

          {/* Integration Guide */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <span className="text-3xl mr-3">🔧</span>
              Integration Guide
            </h2>

            {/* Server-Side */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Server-Side: Protecting an Endpoint</h3>
              <div className="bg-black/40 border border-gray-700 rounded-lg overflow-hidden">
                <div className="bg-gray-800/50 px-4 py-2 border-b border-gray-700 flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Next.js API Route</span>
                  <span className="text-orange-400 text-xs">TypeScript</span>
                </div>
                <pre className="p-4 text-sm text-gray-300 overflow-x-auto">
{`import { handleX402, createPaymentRequest, createX402Headers } from '@/lib/x402';

export async function GET(request: Request) {
  // Check for payment proof in headers
  const paymentProof = request.headers.get('X-402-Payment-Proof');
  
  if (!paymentProof) {
    // Return 402 Payment Required
    const paymentRequest = createPaymentRequest({
      amountUSD: 0.01,
      resource: '/api/premium-data',
      description: 'Access to premium data endpoint',
    });
    
    return new Response(
      JSON.stringify({
        error: 'Payment required',
        paymentRequest,
      }),
      {
        status: 402,
        headers: {
          'Content-Type': 'application/json',
          ...createX402Headers(paymentRequest),
        },
      }
    );
  }
  
  // Verify payment proof
  const isValid = await verifyPayment(JSON.parse(paymentProof));
  
  if (!isValid) {
    return new Response(
      JSON.stringify({ error: 'Invalid payment proof' }),
      { status: 402 }
    );
  }
  
  // Payment verified - serve content
  return Response.json({
    data: 'Premium content here',
    payment: { verified: true }
  });
}`}
                </pre>
              </div>
            </div>

            {/* Client-Side */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Client-Side: Making Paid Requests</h3>
              <div className="bg-black/40 border border-gray-700 rounded-lg overflow-hidden">
                <div className="bg-gray-800/50 px-4 py-2 border-b border-gray-700 flex items-center justify-between">
                  <span className="text-gray-400 text-sm">JavaScript Client</span>
                  <span className="text-orange-400 text-xs">JavaScript</span>
                </div>
                <pre className="p-4 text-sm text-gray-300 overflow-x-auto">
{`import { MNNR } from '@mnnr/sdk';

const client = new MNNR({ apiKey: 'your-api-key' });

// The SDK handles x402 automatically
async function fetchPremiumData() {
  try {
    // SDK automatically handles 402 responses
    const response = await client.x402.request({
      url: 'https://api.example.com/premium-data',
      method: 'GET',
      // Optional: set spending limits
      maxPayment: 1.00,  // Max $1.00 per request
    });
    
    return response.data;
  } catch (error) {
    if (error.code === 'PAYMENT_LIMIT_EXCEEDED') {
      console.log('Request would exceed payment limit');
    }
    throw error;
  }
}

// Or handle manually
async function manualX402Flow() {
  const response = await fetch('https://api.example.com/premium-data');
  
  if (response.status === 402) {
    const paymentInfo = {
      amount: response.headers.get('X-402-Amount'),
      receiver: response.headers.get('X-402-Receiver'),
      network: response.headers.get('X-402-Network'),
    };
    
    // Make payment through MNNR
    const payment = await client.payments.create({
      amount: paymentInfo.amount,
      to: paymentInfo.receiver,
      network: paymentInfo.network,
    });
    
    // Retry with payment proof
    return fetch('https://api.example.com/premium-data', {
      headers: {
        'X-402-Payment-Proof': JSON.stringify({
          txHash: payment.txHash,
          network: payment.network,
          token: payment.token,
          amount: payment.amount,
        }),
      },
    });
  }
  
  return response;
}`}
                </pre>
              </div>
            </div>
          </div>

          {/* HTTP Headers Reference */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <span className="text-3xl mr-3">📋</span>
              HTTP Headers Reference
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Header</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Direction</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Description</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Example</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  <tr className="border-b border-gray-800">
                    <td className="py-3 px-4"><code className="text-orange-400">X-402-Version</code></td>
                    <td className="py-3 px-4">Response</td>
                    <td className="py-3 px-4">Protocol version</td>
                    <td className="py-3 px-4 font-mono text-xs">1.0</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-3 px-4"><code className="text-orange-400">X-402-Amount</code></td>
                    <td className="py-3 px-4">Response</td>
                    <td className="py-3 px-4">Payment amount in USD</td>
                    <td className="py-3 px-4 font-mono text-xs">0.001</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-3 px-4"><code className="text-orange-400">X-402-Currency</code></td>
                    <td className="py-3 px-4">Response</td>
                    <td className="py-3 px-4">Currency code</td>
                    <td className="py-3 px-4 font-mono text-xs">USD</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-3 px-4"><code className="text-orange-400">X-402-Network</code></td>
                    <td className="py-3 px-4">Response</td>
                    <td className="py-3 px-4">Blockchain network</td>
                    <td className="py-3 px-4 font-mono text-xs">base</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-3 px-4"><code className="text-orange-400">X-402-Token</code></td>
                    <td className="py-3 px-4">Response</td>
                    <td className="py-3 px-4">Token to pay with</td>
                    <td className="py-3 px-4 font-mono text-xs">USDC</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-3 px-4"><code className="text-orange-400">X-402-Receiver</code></td>
                    <td className="py-3 px-4">Response</td>
                    <td className="py-3 px-4">Payment address</td>
                    <td className="py-3 px-4 font-mono text-xs">0x1234...abcd</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-3 px-4"><code className="text-orange-400">X-402-Expires</code></td>
                    <td className="py-3 px-4">Response</td>
                    <td className="py-3 px-4">Payment deadline</td>
                    <td className="py-3 px-4 font-mono text-xs">2025-12-28T12:00:00Z</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4"><code className="text-orange-400">X-402-Payment-Proof</code></td>
                    <td className="py-3 px-4">Request</td>
                    <td className="py-3 px-4">JSON proof of payment</td>
                    <td className="py-3 px-4 font-mono text-xs">{`{"txHash":"0x..."}`}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Try It */}
          <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
              <span className="text-3xl mr-3">🚀</span>
              Try x402 Now
            </h2>
            <p className="text-gray-300 mb-6">
              Test the x402 protocol with our demo endpoint. Send a request and see the 402 response in action.
            </p>
            <div className="bg-black/40 border border-gray-700 rounded-lg overflow-hidden mb-6">
              <div className="bg-gray-800/50 px-4 py-2 border-b border-gray-700">
                <span className="text-gray-400 text-sm">Demo Request</span>
              </div>
              <pre className="p-4 text-sm text-gray-300 overflow-x-auto">
{`curl -i https://mnnr.app/api/x402?demo=true`}
              </pre>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/api/x402?demo=true"
                target="_blank"
                className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <span>⚡</span> Try Demo Endpoint
              </Link>
              <Link
                href="/docs/api"
                className="inline-flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <span>📖</span> Full API Reference
              </Link>
            </div>
          </div>

          {/* Resources */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center">
            <h3 className="text-lg font-semibold text-white mb-2">Learn More</h3>
            <p className="text-gray-400 mb-4">
              Explore the x402 specification and community resources.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://x402.org"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 text-orange-400 px-6 py-3 rounded-lg transition-colors"
              >
                <span>📜</span> x402 Specification
              </a>
              <a
                href="https://github.com/MNNRAPP/mnnr-complete2025"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                <span>💻</span> View Source Code
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
