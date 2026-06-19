# MNNR.APP — Cloudflare WAF Deployment

Custom WAF rules + rate-limit rules + interactive challenges for `mnnr.app`.
Generated 2026-06-19. Review before deploy.

## Files

- `waf-rules.json` — canonical ruleset (7 custom rules + 7 rate-limit rules)

## Rule summary

### Custom (firewall) rules — 7

| ref                          | Action             | What it blocks/challenges |
|------------------------------|--------------------|---------------------------|
| `block_scanners`             | block              | Known scanners: nmap, sqlmap, nikto, metasploit, burpsuite, acunetix, nessus, zaproxy, zgrab, masscan, wpscan |
| `block_suspicious_paths`     | block              | `.env`, `.git`, `wp-admin`, `wp-login`, `phpmyadmin`, `xmlrpc.php`, `.htaccess`, `.aws`, `.ssh`, `server-status`, `.svn`, `.DS_Store` |
| `block_sqli_query`           | block              | UNION SELECT, SLEEP(), BENCHMARK(), `/**/` comments, `information_schema`, `' OR '1'='1`, `@@version` |
| `block_xss`                  | block              | `<script`, `onerror=`, `onload=`, `javascript:`, `vbscript:`, `<iframe`, `<svg/onload`, `document.cookie` |
| `block_path_traversal`       | block              | `../`, `..\`, `/etc/passwd`, `/proc/self/environ`, `php://input`, `php://filter` |
| `challenge_datacenter_signup`| managed_challenge  | Data-center ASN traffic (Hetzner 24940, OVH 16276, DigitalOcean 14061, Linode 63949, Vultr 20473, AWS 16509, GCP 15169, Azure 8075/8068, Cloudflare-customer 13335) hitting `/sign-up`, `/api/newsletter`, `/api/auth/*` |
| `challenge_no_referer_post`  | managed_challenge  | POST to `/api/*` / `/sign-in` / `/sign-up` with empty Referer |

### Rate-limit rules — 7

| ref              | Path                                   | Limit                | On exceed         |
|------------------|----------------------------------------|----------------------|-------------------|
| `rl_api_general` | `/api/*` (except webhooks)             | 100/min/IP           | block 60s         |
| `rl_api_keys`    | `/api/v1/keys`                         | 30/min/IP            | block 300s        |
| `rl_api_usage`   | `/api/v1/usage`                        | 60/min/IP            | block 60s         |
| `rl_api_x402`    | `/api/x402`                            | 10/min/IP            | block 300s        |
| `rl_newsletter`  | `/api/newsletter`, `/api/contact`      | 3/10min/IP           | managed_challenge |
| `rl_auth`        | `/api/auth/*`, `/sign-in`, `/sign-up`  | 10/min/IP            | managed_challenge |
| `rl_webhooks`    | `/api/webhooks/*`                      | 1000/min/IP          | block 60s         |

> Webhooks are bursty by design; the rate-limit is a brake against a runaway sender,
> NOT primary auth. Webhook authenticity must be enforced via HMAC signature verification
> in each `/api/webhooks/<provider>` handler.

## Deploy

### Pre-flight

```powershell
$env:CLOUDFLARE_API_TOKEN = "<paste from C:\Users\pusse\Downloads\cfmnnr-migration-20260617.env CLOUDFLARE_API_TOKEN_DFFAC31F>"
$env:CF_ZONE_ID            = "<mnnr.app zone id — pull from Cloudflare dashboard > Overview>"
```

Verify token + zone:

```powershell
curl -s "https://api.cloudflare.com/client/v4/zones/$env:CF_ZONE_ID" `
  -H "Authorization: Bearer $env:CLOUDFLARE_API_TOKEN" `
  -H "Content-Type: application/json" | jq .result.name
# expect: "mnnr.app"
```

### Option A — Deploy custom (firewall) rules via Rulesets API

Cloudflare's WAF custom-rules ruleset uses phase `http_request_firewall_custom`.
Get the existing entrypoint ruleset, then PUT updated rules:

```powershell
# 1. Get entrypoint
$entry = curl -s "https://api.cloudflare.com/client/v4/zones/$env:CF_ZONE_ID/rulesets/phases/http_request_firewall_custom/entrypoint" `
  -H "Authorization: Bearer $env:CLOUDFLARE_API_TOKEN" | ConvertFrom-Json
$rulesetId = $entry.result.id

# 2. Build payload from waf-rules.json -> custom_rules[]
python -c "import json; d=json.load(open('waf-rules.json')); print(json.dumps({'rules':[{'description':r['description'],'expression':r['expression'],'action':r['action'],'enabled':r['enabled'],'ref':r['ref']} for r in d['custom_rules']]}))" > custom_payload.json

# 3. PUT the ruleset
curl -X PUT "https://api.cloudflare.com/client/v4/zones/$env:CF_ZONE_ID/rulesets/$rulesetId" `
  -H "Authorization: Bearer $env:CLOUDFLARE_API_TOKEN" `
  -H "Content-Type: application/json" `
  --data "@custom_payload.json"
```

### Option B — Deploy rate-limit rules via Rulesets API

Rate-limit rules live in phase `http_ratelimit`:

```powershell
$entry = curl -s "https://api.cloudflare.com/client/v4/zones/$env:CF_ZONE_ID/rulesets/phases/http_ratelimit/entrypoint" `
  -H "Authorization: Bearer $env:CLOUDFLARE_API_TOKEN" | ConvertFrom-Json
$rlRulesetId = $entry.result.id

python -c "import json; d=json.load(open('waf-rules.json')); print(json.dumps({'rules':[{'description':r['description'],'expression':r['expression'],'action':r['action'],'ratelimit':r['ratelimit'],'enabled':r['enabled'],'ref':r['ref']} for r in d['rate_limit_rules']]}))" > rl_payload.json

curl -X PUT "https://api.cloudflare.com/client/v4/zones/$env:CF_ZONE_ID/rulesets/$rlRulesetId" `
  -H "Authorization: Bearer $env:CLOUDFLARE_API_TOKEN" `
  -H "Content-Type: application/json" `
  --data "@rl_payload.json"
```

### Option C — Dashboard import (manual, lowest risk)

1. Cloudflare Dashboard → mnnr.app → Security → WAF → Custom rules → **Create rule**
2. For each entry in `waf-rules.json` `custom_rules[]`: paste `description`, `expression`, `action`. Save & deploy each.
3. Repeat under Security → WAF → Rate limiting rules for `rate_limit_rules[]`.

> Dashboard option recommended for first deploy so you can see Cloudflare's
> expression validator catch any typos before they're live.

## Verify after deploy

```bash
# Scanner UA -> should 403
curl -A "sqlmap/1.7" -o /dev/null -w "%{http_code}\n" https://mnnr.app/

# .env probe -> should 403
curl -o /dev/null -w "%{http_code}\n" https://mnnr.app/.env

# SQLi probe -> should 403
curl -o /dev/null -w "%{http_code}\n" "https://mnnr.app/?id=1%20UNION%20SELECT%20password%20FROM%20users"

# XSS probe -> should 403
curl -o /dev/null -w "%{http_code}\n" "https://mnnr.app/?q=<script>alert(1)</script>"

# Newsletter flood -> 4th request inside 10 min should challenge
for i in 1 2 3 4; do curl -X POST -d 'email=t@x.com' https://mnnr.app/api/newsletter; done

# Legit user -> should still 200
curl -o /dev/null -w "%{http_code}\n" https://mnnr.app/
```

## Watch + iterate

- Cloudflare Dashboard → Security → Events — watch for false positives the first 48h
- If a legitimate path is being blocked, add an allow-list rule above the block rule with higher priority (lower `position`)
- The `block_path_traversal` rule contains `../` — if any legit URL ever contains `../` it will trip. Audit `/api/` routes before deploy.

## Rollback

```powershell
# Disable a specific rule
curl -X PATCH "https://api.cloudflare.com/client/v4/zones/$env:CF_ZONE_ID/rulesets/$rulesetId/rules/<rule_id>" `
  -H "Authorization: Bearer $env:CLOUDFLARE_API_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{"enabled":false}'

# Or revert the whole ruleset
curl -X DELETE "https://api.cloudflare.com/client/v4/zones/$env:CF_ZONE_ID/rulesets/$rulesetId/versions/<previous_version>" `
  -H "Authorization: Bearer $env:CLOUDFLARE_API_TOKEN"
```

## Known limitations / blockers

- **ASN list is illustrative**: the data-center ASN list (24940, 16276, 14061, ...) is hand-curated. For wider coverage subscribe to a maintained list or use Cloudflare's `cf.threat_score`.
- **Webhook signature verification is REQUIRED** to make the 1000/min webhook rate-limit safe. Each `/api/webhooks/<provider>` handler must verify HMAC signature against the provider's shared secret BEFORE doing any work.
- **`/api/x402` 10/min** is conservative — tune upward once we know real micropayment cadence.
- **Wrangler does NOT natively deploy WAF rules** as of June 2026 — wrangler manages Workers + Pages + bindings. WAF is API-only or dashboard. The README above uses the REST API.

## Token reference

Use the token already in `C:\Users\pusse\Downloads\cfmnnr-migration-20260617.env`:
- key: `CLOUDFLARE_API_TOKEN_DFFAC31F`

Confirm token scope includes `Zone:Zone Settings:Edit` + `Zone:Zone WAF:Edit` for the
`mnnr.app` zone before running. If missing, mint a new scoped token from
My Profile → API Tokens.
