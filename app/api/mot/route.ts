import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/mot
 * Forwards a call to the backend to fetch all vehicles' MOT data (for authenticated user)
 */
export async function GET(request: NextRequest) {
  try {
    // Use NextRequest's cookies property (see route.ts (17-27))
    const cookies = request.cookies;
    const accessToken = cookies.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated. No access token found.' },
        { status: 401 },
      );
    }

    // Backend call to /api/auth/mot/all for current user MOT data
    const backendUrl = `${process.env.BACKEND_URL}/api/v1/mot/all`;

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error || 'Failed to fetch vehicle MOTs' },
        { status: response.status },
      );
    }

    // Success case: return array of vehicles with motHistory etc.
    return NextResponse.json(data);
  } catch (e) {
    console.error('Error calling MOT backend API:', e);
    return NextResponse.json(
      { error: 'Failed to load vehicle MOTs' },
      { status: 500 },
    );
  }
}
