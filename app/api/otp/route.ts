import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const token = (await cookies()).get('deriv_access_token')?.value;
  const appId = process.env.DERIV_APP_ID || process.env.NEXT_PUBLIC_DERIV_APP_ID;
  const { accountId } = await request.json();
  if (!token || !appId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  if (!accountId) return NextResponse.json({ error: 'accountId is required' }, { status: 400 });

  const result = await fetch(`https://api.derivws.com/trading/v1/options/accounts/${encodeURIComponent(accountId)}/otp`, {
    method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Deriv-App-ID': appId }, cache: 'no-store'
  });
  const data = await result.json();
  if (!result.ok) return NextResponse.json(data, { status: result.status });
  return NextResponse.json(data);
}
