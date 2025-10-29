import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ garageId: string }> },
) {
  try {
    const { garageId } = await params;
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Call the backend API for bays
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/garages/${garageId}/bays`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error('Failed to fetch bays');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching bays:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bays' },
      { status: 500 },
    );
  }
}
