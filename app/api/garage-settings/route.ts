import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { BusinessHours, Billing } from '@/app/models/garage';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(
      `${process.env.BACKEND_URL}/api/garages/settings`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend response:', errorText);
      throw new Error('Failed to fetch garage settings');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching garage settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch garage settings' },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { businessHours, billing } = body as {
      businessHours?: BusinessHours;
      billing?: Billing;
    };

    const response = await fetch(
      `${process.env.BACKEND_URL}/api/garages/settings`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          businessHours,
          billing,
        }),
      },
    );

    if (!response.ok) {
      throw new Error('Failed to update garage settings');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating garage settings:', error);
    return NextResponse.json(
      { error: 'Failed to update garage settings' },
      { status: 500 },
    );
  }
}
