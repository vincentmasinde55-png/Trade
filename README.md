# Deriv Bot Clone

Vercel-ready Next.js implementation of a Deriv Bot-style interface using Deriv's current New API architecture.

## Vercel variables

Set these in Vercel for Production (and Preview if you want preview deployments to authenticate):

- `DERIV_APP_ID` — your Deriv OAuth client/app ID
- `DERIV_SCOPE` — `trade`
- `DERIV_REDIRECT_URL` — the exact registered callback URL, for example `https://your-domain.com/api/callback`

Do not commit access tokens or secrets.

## Current API flow

OAuth 2.0 + PKCE → server-side token exchange → authenticated account REST call → OTP → authenticated Options WebSocket. Public market data uses the public WebSocket.

The Bot Builder sends the current `auto_start` shape and exposes `Pause`, `Resume`, and `Stop` controls. A valid Deriv automation strategy ID and its parameters are required; the UI deliberately does not invent a strategy ID.

## Deploy

Import `vincentmasinde55-png/Trade` into Vercel, add the three environment variables, and deploy.
