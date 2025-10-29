import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const garageId = searchParams.get('garageId');

    if (!garageId) {
      return NextResponse.json(
        { error: 'Garage ID is required' },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Call the backend API for technicians
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/technicians?garageId=${garageId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error('Failed to fetch technicians');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching technicians:', error);
    return NextResponse.json(
      { error: 'Failed to fetch technicians' },
      { status: 500 },
    );
  }
}
