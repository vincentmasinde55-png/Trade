import { NextResponse } from 'next/server';
import crypto from 'node:crypto';

function base64url(buffer: Buffer) {
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export async function GET() {
  const appId = process.env.DERIV_APP_ID || process.env.NEXT_PUBLIC_DERIV_APP_ID;
  const redirectUri = process.env.DERIV_REDIRECT_URL || process.env.NEXT_PUBLIC_DERIV_REDIRECT_URL;
  const scope = process.env.DERIV_SCOPE || process.env.NEXT_PUBLIC_DERIV_SCOPE || 'trade';
  if (!appId || !redirectUri) return NextResponse.json({ error: 'Missing Deriv App ID or Redirect URL environment variable.' }, { status: 500 });

  const verifier = base64url(crypto.randomBytes(48));
  const state = base64url(crypto.randomBytes(24));
  const challenge = base64url(crypto.createHash('sha256').update(verifier).digest());
  const url = new URL('https://auth.deriv.com/oauth2/auth');
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', appId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('scope', scope);
  url.searchParams.set('state', state);
  url.searchParams.set('code_challenge', challenge);
  url.searchParams.set('code_challenge_method', 'S256');

  const response = NextResponse.redirect(url);
  response.cookies.set('deriv_oauth_state', state, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 600, path: '/' });
  response.cookies.set('deriv_oauth_verifier', verifier, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 600, path: '/' });
  return response;
}
