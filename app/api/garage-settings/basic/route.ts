import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, address } = body;

    const response = await fetch(
      `${process.env.BACKEND_URL}/api/garages/settings`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name,
          address,
        }),
      },
    );

    if (!response.ok) {
      throw new Error('Failed to update garage information');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating garage information:', error);
    return NextResponse.json(
      { error: 'Failed to update garage information' },
      { status: 500 },
    );
  }
}
