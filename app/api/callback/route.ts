import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const expectedState = request.cookies.get('deriv_oauth_state')?.value;
  const verifier = request.cookies.get('deriv_oauth_verifier')?.value;
  const appId = process.env.DERIV_APP_ID || process.env.NEXT_PUBLIC_DERIV_APP_ID;
  const redirectUri = process.env.DERIV_REDIRECT_URL || process.env.NEXT_PUBLIC_DERIV_REDIRECT_URL;

  if (!code || !state || !expectedState || state !== expectedState || !verifier || !appId || !redirectUri) {
    return NextResponse.redirect(new URL('/?auth_error=invalid_callback', request.url));
  }

  const body = new URLSearchParams({ grant_type: 'authorization_code', client_id: appId, code, code_verifier: verifier, redirect_uri: redirectUri });
  const tokenResponse = await fetch('https://auth.deriv.com/oauth2/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body, cache: 'no-store'
  });
  const token = await tokenResponse.json();
  if (!tokenResponse.ok || !token.access_token) {
    return NextResponse.redirect(new URL('/?auth_error=token_exchange_failed', request.url));
  }

  const response = NextResponse.redirect(new URL('/', request.url));
  response.cookies.set('deriv_access_token', token.access_token, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: Math.min(Number(token.expires_in || 3600), 3600), path: '/' });
  response.cookies.delete('deriv_oauth_state');
  response.cookies.delete('deriv_oauth_verifier');
  return response;
}
