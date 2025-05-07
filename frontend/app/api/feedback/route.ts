import { NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function POST(request: Request) {
  const body = await request.json();
  const res = await fetch(`${BACKEND}/api/feedback`, {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify(body),
  });
  return NextResponse.json(await res.json(), { status: res.status });
}

export async function GET() {
  const res = await fetch(`${BACKEND}/api/feedback`, { cache: 'no-store' });
  return NextResponse.json(await res.json());
}
