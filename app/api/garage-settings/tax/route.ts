import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { Billing } from '@/app/models/garage';

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { billing } = body as { billing: Billing };

    const response = await fetch(
      `${process.env.BACKEND_URL}/api/garages/settings`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          billing,
        }),
      },
    );

    if (!response.ok) {
      throw new Error('Failed to update tax settings');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating tax settings:', error);
    return NextResponse.json(
      { error: 'Failed to update tax settings' },
      { status: 500 },
    );
  }
}
