# MNNR API — curl recipes

Working `curl` commands against the live deploy at
**`https://mnnr-app.netlify.app`**.

Set once:

```bash
export BASE_URL="https://mnnr-app.netlify.app"
```

---

## Table of contents

1. [Authentication setup](#1-authentication-setup)
2. [x402 — protocol info](#2-x402--protocol-info)
3. [x402 — demo 402 challenge](#3-x402--demo-402-challenge)
4. [x402 — issue challenge](#4-x402--issue-challenge)
5. [x402 — verify on-chain payment](#5-x402--verify-on-chain-payment)
6. [API keys — list](#6-api-keys--list)
7. [API keys — create](#7-api-keys--create)
8. [API keys — revoke](#8-api-keys--revoke)
9. [Usage — record event](#9-usage--record-event)
10. [Usage — query events](#10-usage--query-events)
11. [Newsletter — subscribe](#11-newsletter--subscribe)
12. [Newsletter — confirm](#12-newsletter--confirm)
13. [CSP — submit report](#13-csp--submit-report)
14. [Error response shapes](#14-error-response-shapes)

---

## 1. Authentication setup

MNNR supports two auth schemes — choose per your use case.

### A. Supabase session cookie (dashboard / interactive)

1. Sign in at <https://mnnr-app.netlify.app/sign-in>.
2. In DevTools → Application → Cookies, copy the `sb-access-token` value.
3. Export it:

   ```bash
   export SB_TOKEN="<paste cookie value>"
   ```

4. Also grab the CSRF cookie for state-changing routes:

   ```bash
   export CSRF_TOKEN="<paste csrf cookie value>"
   ```

Send both on protected routes:

```bash
curl "$BASE_URL/api/keys" \
  -H "Cookie: sb-access-token=$SB_TOKEN; csrf-token=$CSRF_TOKEN" \
  -H "x-csrf-token: $CSRF_TOKEN"
```

### B. API key (Bearer — programmatic)

1. Hit `/dashboard/keys` while signed in.
2. Click **Create key**, copy the plaintext key shown **once**.
3. Export it:

   ```bash
   export MNNR_API_KEY="mnnr_live_..."
   ```

4. Send as Bearer:

   ```bash
   curl "$BASE_URL/api/usage" \
     -H "Authorization: Bearer $MNNR_API_KEY"
   ```

> **Test mode:** mint a `test` key for non-production calls.
> Test-mode keys never charge or move funds.

---

## 2. x402 — protocol info

```bash
curl "$BASE_URL/api/x402"
```

Response:

```json
{
  "version": "1.0",
  "supportedNetworks": ["base", "base-sepolia", "polygon"],
  "supportedTokens": ["USDC", "ETH"]
}
```

---

## 3. x402 — demo 402 challenge

No auth required — returns a sample HTTP 402 envelope so client libs can be
exercised offline.

```bash
curl -i "$BASE_URL/api/x402?demo=true"
```

Status `402 Payment Required`, body:

```json
{
  "nonce": "demo-nonce",
  "amountUSD": "0.01",
  "receiver": "0xDemoReceiver...",
  "paymentUri": "x402://..."
}
```

---

## 4. x402 — issue challenge

```bash
curl "$BASE_URL/api/x402" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: $CSRF_TOKEN" \
  -H "Cookie: csrf-token=$CSRF_TOKEN" \
  -d '{
    "action": "challenge",
    "resource": "analyze",
    "amountUSD": "0.01",
    "token": "USDC",
    "chain": "base-sepolia"
  }'
```

200 OK:

```json
{
  "nonce": "0x...",
  "receiver": "0x...",
  "amountUSD": "0.01",
  "amountAtomic": "10000",
  "token": "USDC",
  "chain": "base-sepolia",
  "paymentUri": "x402://pay?...",
  "expiresAt": "2026-06-19T12:00:00Z"
}
```

---

## 5. x402 — verify on-chain payment

After paying on-chain referencing the `nonce` from step 4:

```bash
curl "$BASE_URL/api/x402" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: $CSRF_TOKEN" \
  -H "Cookie: csrf-token=$CSRF_TOKEN" \
  -d '{
    "action": "verify",
    "nonce": "0x...",
    "txHash": "0x'$(openssl rand -hex 32)'",
    "chain": "base-sepolia",
    "executeAction": { "resource": "analyze", "params": {} }
  }'
```

Possible responses:

- `200 { "verified": true, ... }` — proof valid, paid action executed.
- `402 { "error": "verification_failed", "reason": "tx_not_found" }`
- `503 { "error": "payment_disabled", "reason": "verification_not_enabled" }`
  — production-gate is active. Set
  `PAYMENT_VERIFICATION_ENABLED=true` in the server env to unblock.

---

## 6. API keys — list

```bash
curl "$BASE_URL/api/keys" \
  -H "Cookie: sb-access-token=$SB_TOKEN"
```

```json
{
  "keys": [
    {
      "id": "uuid",
      "name": "my-laptop",
      "prefix": "mnnr_liv",
      "mode": "live",
      "created_at": "2026-06-19T10:00:00Z",
      "last_used_at": null,
      "revoked_at": null
    }
  ]
}
```

---

## 7. API keys — create

The full plaintext key is returned **once** in the response. Store it
immediately.

```bash
curl "$BASE_URL/api/keys" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=$SB_TOKEN; csrf-token=$CSRF_TOKEN" \
  -H "x-csrf-token: $CSRF_TOKEN" \
  -d '{ "name": "my-laptop", "mode": "live" }'
```

```json
{
  "id": "uuid",
  "name": "my-laptop",
  "prefix": "mnnr_liv",
  "mode": "live",
  "key": "mnnr_live_xxxxxxxxxxxxxxxxxxxxxxxx",
  "created_at": "2026-06-19T10:00:00Z"
}
```

---

## 8. API keys — revoke

```bash
curl "$BASE_URL/api/keys?id=$KEY_ID" \
  -X DELETE \
  -H "Cookie: sb-access-token=$SB_TOKEN; csrf-token=$CSRF_TOKEN" \
  -H "x-csrf-token: $CSRF_TOKEN"
```

Returns `204 No Content` on success.

---

## 9. Usage — record event

```bash
curl "$BASE_URL/api/usage" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MNNR_API_KEY" \
  -H "x-csrf-token: $CSRF_TOKEN" \
  -d '{
    "metric": "api.calls",
    "value": 1,
    "metadata": { "route": "/analyze" }
  }'
```

---

## 10. Usage — query events

```bash
curl "$BASE_URL/api/usage?period=week&metric=api.calls" \
  -H "Authorization: Bearer $MNNR_API_KEY"
```

```json
{
  "period": "week",
  "events": [ { "id": "...", "metric": "api.calls", "value": 1, "created_at": "..." } ],
  "aggregated": {
    "api.calls": { "count": 42, "total": 42 }
  }
}
```

---

## 11. Newsletter — subscribe

```bash
curl "$BASE_URL/api/newsletter" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "email": "you@example.com",
    "turnstileToken": "<turnstile token from widget>"
  }'
```

Response is intentionally enumeration-resistant — the same `200 OK` shape
is returned whether the address was new, already subscribed, or
rate-limited.

```json
{ "ok": true, "message": "If this email can subscribe, a confirmation message will be sent." }
```

---

## 12. Newsletter — confirm

The confirmation URL is mailed to the subscriber. To hit it manually:

```bash
curl -i "$BASE_URL/newsletter/confirm?token=<32+ char token>"
```

Returns HTML.

---

## 13. CSP — submit report

This is normally sent by the browser automatically — included for
operators who want to test the sink.

```bash
curl "$BASE_URL/api/csp-report" \
  -X POST \
  -H "Content-Type: application/csp-report" \
  -d '{
    "csp-report": {
      "document-uri": "https://mnnr.app/",
      "violated-directive": "script-src",
      "blocked-uri": "inline"
    }
  }'
```

Returns `204 No Content`.

---

## 14. Error response shapes

All errors follow:

```json
{
  "error": "validation_error",
  "reason": "email_invalid",
  "message": "Email address is not valid.",
  "details": { "field": "email" }
}
```

Common HTTP codes:

| Code | Meaning |
|------|---------|
| 400  | Validation error (`error: "validation_error"`) |
| 401  | Unauthorized — missing/invalid session or Bearer |
| 402  | Payment required (x402 only) |
| 403  | CSRF token missing/invalid |
| 404  | Resource not found |
| 413  | Payload too large (csp-report) |
| 429  | Rate limited — see `Retry-After` |
| 503  | Feature gated off in this environment |
