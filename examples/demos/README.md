# MNNR demos

Three self-contained demos that exercise the live mnnr.app API at
<https://mnnr-app.netlify.app>.

| Demo | What it shows | Stack |
|------|---------------|-------|
| [`x402-payment-flow/`](./x402-payment-flow/) | Challenge → on-chain pay (mocked) → verify, full happy path | Node 18+ (no deps) |
| [`api-key-issuance/`](./api-key-issuance/) | Mint an API key via the dashboard cookie, then use it to record a usage event | Static HTML + browser fetch |
| [`newsletter-double-opt-in/`](./newsletter-double-opt-in/) | Cloudflare Turnstile + double opt-in subscribe | Static HTML + Turnstile widget |

Each subdirectory has its own README with prereqs and run instructions.

## Conventions

- **No paid actions auto-execute.** The x402 demo mocks the on-chain step
  and the verify call will land on the production payment-gate (`503`)
  unless `PAYMENT_VERIFICATION_ENABLED=true` on the target environment.
- **No real secrets are committed.** Every demo expects you to paste your
  own session cookie / API key / Turnstile token at runtime.
- **Demos hit production by default.** Override with the `MNNR_BASE_URL`
  env or by editing the `BASE_URL`/`BASE` constant at the top of each
  demo file.

## Related artifacts

- [`/openapi.yaml`](../../openapi.yaml) — full spec (human-readable)
- [`/public/openapi.json`](../../public/openapi.json) — same, machine-readable
- [`/docs/api-reference`](https://mnnr-app.netlify.app/docs/api-reference) — live Swagger UI
- [`../curl/README.md`](../curl/README.md) — curl recipes per route
- [`../postman/`](../postman/) — Postman collection + environment
- [`../../packages/sdk/`](../../packages/sdk/) — TypeScript SDK
