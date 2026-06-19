# Demo: Newsletter double opt-in

Mirrors the form on the mnnr.app landing page:

1. User submits email + Cloudflare Turnstile token to `POST /api/newsletter`.
2. Server SHA-256-hashes the email, creates a pending row, mails a
   confirmation link.
3. User clicks the link → `GET /newsletter/confirm?token=…` flips
   `status=confirmed` and the welcome email fires.

The response shape is intentionally **enumeration-resistant** — every code
path returns the same generic success payload so the demo cannot be used
to enumerate already-subscribed addresses.

## Run

```bash
cd examples/demos/newsletter-double-opt-in
python3 -m http.server 5174
# open http://localhost:5174/
```

You need a Turnstile site key. For local dev, Cloudflare ships a few
test keys you can drop into the page:

- Always passes:  `1x00000000000000000000AA`
- Always blocks:  `2x00000000000000000000AB`
- Forces interactive challenge: `3x00000000000000000000FF`

Reference: <https://developers.cloudflare.com/turnstile/troubleshooting/testing/>

## What you should see

- `200 { "ok": true, "message": "If this email can subscribe, …" }` on
  any well-formed submission.
- `400` if email/Turnstile token is missing.
- `429` if you mash the button — the route is rate-limited to 3 / 10 min
  per IP.

## Production wiring

In a real integration:

- Drop the Turnstile widget into your own page (server stores the
  `TURNSTILE_SECRET_KEY`, never expose it client-side).
- Send the user to your own `success` page after `200 ok` — never reveal
  whether the address was new or duplicate.
- The confirmation link target is configured by the server env
  `NEXT_PUBLIC_NEWSLETTER_CONFIRM_URL`.
