import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

function safeEqual(a: string, b: string) {
  const aa = Buffer.from(a);
  const bb = Buffer.from(b);
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const returnedState = url.searchParams.get('state');
  const oauthError = url.searchParams.get('error');
  const oauthDescription = url.searchParams.get('error_description');
  const cookieStore = await cookies();
  const savedState = cookieStore.get('deriv_oauth_state')?.value;
  const verifier = cookieStore.get('deriv_oauth_verifier')?.value;
  const clientId = process.env.DERIV_APP_ID || process.env.NEXT_PUBLIC_DERIV_APP_ID;
  const redirectUri = process.env.DERIV_REDIRECT_URL || process.env.NEXT_PUBLIC_DERIV_REDIRECT_URL;

  if (oauthError) {
    return NextResponse.redirect(new URL(`/?auth_error=${encodeURIComponent(oauthDescription || oauthError)}`, url.origin));
  }
  if (!code || !returnedState || !savedState || !safeEqual(returnedState, savedState)) {
    return NextResponse.redirect(new URL('/?auth_error=Invalid%20OAuth%20state%20or%20callback%20parameters', url.origin));
  }
  if (!verifier || !clientId || !redirectUri) {
    return NextResponse.redirect(new URL('/?auth_error=OAuth%20configuration%20is%20missing', url.origin));
  }

  const tokenResponse = await fetch('https://auth.deriv.com/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      code,
      code_verifier: verifier,
      redirect_uri: redirectUri,
    }),
    cache: 'no-store',
  });

  const tokenData = await tokenResponse.json().catch(() => ({}));
  if (!tokenResponse.ok || !tokenData.access_token) {
    const detail = tokenData?.error_description || tokenData?.error || 'Token exchange failed';
    return NextResponse.redirect(new URL(`/?auth_error=${encodeURIComponent(detail)}`, url.origin));
  }

  const response = NextResponse.redirect(new URL('/?login=success', url.origin));
  response.cookies.set('deriv_access_token', tokenData.access_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: Number(tokenData.expires_in || 3600),
    path: '/',
  });
  response.cookies.delete('deriv_oauth_state');
  response.cookies.delete('deriv_oauth_verifier');
  return response;
}
