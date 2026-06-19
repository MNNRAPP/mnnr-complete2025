# Demo: API key issuance

Minimal flow showing:

1. User signs in to <https://mnnr-app.netlify.app/sign-in> (Supabase session).
2. Mint a new API key from the dashboard or via this demo (the demo calls
   `POST /api/keys` with the session cookie).
3. Use the plaintext key returned **once** to record a usage event.

## Why HTML, not a Next.js app

The demo is intentionally a single self-contained `index.html` so it runs
from a `python -m http.server` (or any static host) with **zero** install
steps. It uses the browser's `fetch` against the live deploy.

## Run

```bash
cd examples/demos/api-key-issuance
python3 -m http.server 5173
# open http://localhost:5173/
```

In the page:

1. Open <https://mnnr-app.netlify.app/sign-in> in another tab and sign in.
2. Open DevTools → Application → Cookies, copy `sb-access-token` and
   `csrf-token` values.
3. Paste both into the form, click **Create key**.
4. The plaintext key is shown once — copy it.
5. Paste the key into the second form, click **Record usage event**.

## Production notes

- Same-origin requests from the dashboard itself work without copy-pasting
  cookies. This demo is a "drive the API from a third-party page" example,
  which is why the cookies must be supplied explicitly.
- The dashboard at `/dashboard/keys` is the canonical UI for this flow.
