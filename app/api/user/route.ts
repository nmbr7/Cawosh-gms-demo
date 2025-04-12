import { NextResponse } from 'next/server';

export async function GET() {
  // Mock user session data
  const user = {
    name: 'Afsal',
    avatar: '/images/avatar-1.png',
    role: 'Owner',
  };
  return NextResponse.json(user);
} 