import { NextRequest, NextResponse } from 'next/server';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

export async function GET(request: NextRequest) {
  try {
    // Extract vehicle registration (reg) from the URL
    const url = new URL(request.url);
    const parts = url.pathname.split('/');
    const reg = parts[parts.length - 1]; // /api/mot/[reg]

    if (!reg) {
      return NextResponse.json(
        { error: 'Vehicle registration (reg) is required' },
        { status: 400 },
      );
    }

    // Get the access token from cookies
    const cookies = request.cookies;
    const accessToken = cookies.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'No access token found' },
        { status: 401 },
      );
    }

    // Call backend endpoint for this vehicle MOT history
    const backendUrl = `${process.env.BACKEND_URL}/api/v1/auth/mot/reg/${encodeURIComponent(reg)}`;

    const response = await fetchWithAuth(backendUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    console.log('MOT reg response:', data);

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error || 'Failed to fetch MOT details' },
        { status: response.status },
      );
    }

    // Success: return the MOT data as received
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching MOT details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
