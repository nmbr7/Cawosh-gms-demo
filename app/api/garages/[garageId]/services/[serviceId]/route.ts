import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract garageId and serviceId from the URL
    const url = new URL(request.url);
    const parts = url.pathname.split('/');
    const garageId = parts[3]; // /api/garages/[garageId]/services/[serviceId]
    const serviceId = parts[5];

    const body = await request.json();

    // Forward the PATCH request to the backend
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/garages/${garageId}/services/${serviceId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      },
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error updating garage service:', error);
    return NextResponse.json(
      { error: 'Failed to update garage service' },
      { status: 500 },
    );
  }
}
