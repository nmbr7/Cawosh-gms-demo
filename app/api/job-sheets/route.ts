import { NextRequest, NextResponse } from 'next/server';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

export async function GET(request: NextRequest) {
  try {
    // Get the access token from cookies
    const cookies = request.cookies;
    const accessToken = cookies.get('access_token')?.value;
    if (!accessToken) {
      return NextResponse.json(
        { error: 'No access token found' },
        { status: 401 },
      );
    }

    // Build backend URL
    const backendUrl = `${process.env.BACKEND_URL}/api//bookings/jobSheets`;

    // Fetch job sheets from backend
    const response = await fetchWithAuth(backendUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        {
          error:
            errorData.error ||
            errorData.message ||
            'Failed to fetch job sheets',
        },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching job sheets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
