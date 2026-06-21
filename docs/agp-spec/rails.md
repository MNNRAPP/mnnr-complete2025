# AGP Supported Rails

**Status:** Draft v1
**Last updated:** 2026-06-20 PT
**Maintainer:** MNNR core team

The Agentic Governance Protocol (AGP) is rail-neutral. AGP attests, governs, and audits agent-initiated payments regardless of the underlying settlement rail. This document tracks the rails AGP supports today and the integration depth for each.

## Rails matrix

| | Stripe Tempo MPP | Coinbase x402 | AWS Bedrock AgentCore Payments | Chrome WebMCP |
|---|---|---|---|---|
| **Protocol layer** | REST/JSON via PaymentIntents (MCP-style) | HTTP 402 micropayments | HTTP 402 + MCP server (uses x402 or MPP under the hood) | In-browser HTML/JS API calls |
| **Settlement** | Stripe fiat or stablecoin ledger | Stablecoins on/off chain via Coinbase | Stablecoins on Coinbase or Stripe rails | Site's choice — credit card, PSP, on-chain |
| **Authentication** | Stored payment method + SCA | Wallet keys (ECDSA) | User wallet (Coinbase/Privy) + budget cap | Browser session + explicit user prompts |
| **Governance hook surface** | Stripe metadata + SPT JWS — limited | x402 cryptographic proofs — machine-traceable | AgentCore console logs — bank-grade | `opaque` field + `requestUserInteraction()` + tool result extensions — open by design |
| **AGP overlay attachment point** | Stripe metadata + receipt extension | Receipt header extension | Policy bus integration | `opaque` field carries PSD3/EUDIW attestations; `requestUserInteraction()` provides SCA hook |
| **Network programs interoperability** | Visa Agentic Ready, Mastercard Agent Pay (via underlying card scheme) | Independent — chain-native | Visa Agentic Ready (when AgentCore uses Stripe rail) | Independent of rail; complements all four below |
| **Integration spec** | `integrations/stripe-tempo.md` | `integrations/coinbase-x402.md` | `integrations/aws-agentcore.md` | `integrations/webmcp.md` |

## Compatibility with network programs

Visa Agentic Ready (announced 17 March 2026, 21 EU/UK bank participants), Mastercard Agent Pay, and Mastercard AP4M (10 June 2026) are **network-level** agentic-payment programs. They define how AI agents transact on Visa or Mastercard rails specifically. AGP sits ABOVE the network layer as the cross-rail governance overlay. The two are complementary, not competitive:

- Bank uses Visa Agentic Ready for agent-initiated payments on Visa rails → AGP attests on the agent identity + policy
- Bank uses Mastercard Agent Pay for the same on Mastercard rails → AGP applies the same attestation policy
- Bank or PSP uses Stripe Tempo MPP, x402, or AgentCore for stablecoin settlement → AGP applies the same attestation policy on the stablecoin leg
- Bank or PSP uses Chrome WebMCP for in-browser agent-to-site discovery → AGP attests on the agent identity passed into the WebMCP `opaque` field

One overlay, every rail, one audit log.

## Roadmap

| Rail | Status | Phase |
|---|---|---|
| Stripe Tempo MPP | Production reference integration in design partner | Phase 2 |
| Coinbase x402 | Production reference integration in design partner | Phase 2 |
| AWS Bedrock AgentCore Payments | Preview integration (us-east-1, us-west-2, eu-central-1, ap-southeast-2) | Phase 1 |
| Chrome WebMCP | Origin-trial integration design | Phase 1 |
| PayPal Agent Ready | Watch — early access via Braintree | Not yet engaged |
| Adyen Agentic | Watch — US-limited launch June 16, 2026 | Not yet engaged |
| Solana Foundation pay.sh + Google Cloud | Watch | Not yet engaged |

## Compatibility notes

- AGP is not a payment rail, processor, or wallet. AGP attaches to whichever rail the bank, PSP, or AI platform has already chosen.
- AGP is bank-agnostic by design and EU-sovereign by default. Compatible with PSD2 / PSD3 / PSR / MiCA / DORA / IPR / EUDI Wallet.
- For each rail listed above, AGP integration is governed by the rail-specific integration document in `docs/agp-spec/integrations/`.

## References

- WebMCP deep-research report: `investor_kit/deep_research_library_20260620/04_PRODUCT_TECHNICAL/20260620_WEBMCP_SPEC_OVERVIEW_CHROME_149_ORIGIN_TRIAL_v1.md`
- EU statutory framework report: `investor_kit/deep_research_library_20260620/02_REGULATORY_COMPLIANCE/20260620_EU_STATUTORY_FRAMEWORK_MNNR_APP_v1.md`
- Visa Agentic Ready 21-bank participant roster: `agent/information_agents/mnnr_competitors/_TRACKED_TARGETS_ROSTER.md` (v2)
- Stablecoin settlement asset hierarchy: `agp_spec/stablecoin_settlement_asset_matrix_v1.md`
