import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const token = (await cookies()).get('deriv_access_token')?.value;
  const appId = process.env.DERIV_APP_ID || process.env.NEXT_PUBLIC_DERIV_APP_ID;
  if (!token || !appId) return NextResponse.json({ authenticated: false }, { status: 401 });

  const result = await fetch('https://api.derivws.com/trading/v1/options/accounts', {
    headers: { Authorization: `Bearer ${token}`, 'Deriv-App-ID': appId }, cache: 'no-store'
  });
  const data = await result.json();
  if (!result.ok) return NextResponse.json(data, { status: result.status });
  return NextResponse.json({ authenticated: true, ...data });
}
